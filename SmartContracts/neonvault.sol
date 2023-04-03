// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;
//Options Functionality
//1. to receive any ERC20 token as collateral/assets
//2. Price these assets using getReserves
//3. allow people to own the rights to withdrawing these tokens
//4. enable options creation to hedge these assets
//5. enable options buying to hedge these assets
//6. options settlement based on price of assets in comparison to strike value & cost
// - token withdrawals terms:
//1. depositors withdraw after an option expires
//2. withdrawal value = asset value + option cost
//3. traders withdraw profits if strike is hit & value + cost => price

//Equity Swaps Functionality
//1. Equity swap contracts for both crypto tokens and stocks
//2. Holder of assets must deposit tokens or in stables equivalent to the stocks

//key functions
// - value
// - deposit
// - withdraw
// - create call option
// - buy call option
// - settle call option
// - create equity swap
// - buy swap
// - conclude swap

//key dependencies
// 1. getReserves Uniswap

//dev guides
// - all tokens are treated as ERC20
// - uniswap version 2 router in beta
// - deposits, lockedinuse and withdrawals track user balance
// - lockedinuse is the current account (+-) on trades. it is also escrow
// - only base currencies :weth, usdt and usdc contract balance tracked
// - getUnderlyingValue is variable loss/gain equally for both parties
// - whilst getOptionValue is a maximum loss/gain for the option buyer only (i.e. the real world call option, win all or lose all based on strike price)

import "./SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract POLContract {

    using SafeMath for uint256;

    modifier onlyOwner {
      require(msg.sender == owner, "You are not the owner");
      _;
    }

    struct UserTokenBalance {
      uint256 deposited; // incremented on successful deposit
      uint256 withdrawn; // incremented on successful withdrawl
      uint256 lockedinuse; // adjust on hedge creation or buy or settle
    }
    // map erc20 token to user address to release schedule
    mapping(address => mapping(address => UserTokenBalance)) tokenUserMap;

    struct Balances {
      uint256 deposited; // incremented on successful deposit
      uint256 withdrawn; // incremented on successful withdrawl
    }
    // track all erc20 token deposits and withdrawals
    mapping(address => Balances) tokenAmountMap;
    
    // fast mapping to prevent array iteration in solidity
    mapping(address => bool) public hedgedTokenLookup;

    // ** call options and equity swaps both use this
    struct hedgingOption{
      bool tool;//call option true, equity swap false
      address owner;
      address taker;
      address token;
      address paired;
      uint status;//0 - none, 1 - created, 2 - taken, 3 - settled
      uint256 amount;
      uint256 startvalue;
      uint256 endvalue;
      uint256 strike;
      uint256 cost;
      uint256 dt_created;
      uint256 dt_started;
      uint256 dt_expiry;
      uint256 dt_settled;
      HedgeType hedgeType;
    }
     enum HedgeType {CALL, SWAP}
    //mapped array of all hedges 
    mapping(uint => hedgingOption) hedges;

    //mapped array of all tokens transacted by user
    mapping(address => address[]) public userhedgedTokens;

    //mapped array of all hedges under specific address
    mapping(address => uint[]) public hedgesArray;

    //mapped array of all hedges for user
    mapping(address => uint[]) myhedgesCreated;
    mapping(address => uint[]) myhedgesTaken;
    
    //all hedges 
    uint[] private hedgesCreated;
    uint[] private hedgesTaken;
    // array of currently deposited tokens
    address[] public depositedTokens;
    
    uint public optionID;
    uint public takesCount;
    
    // fee variables
    uint256 public feeNumerator;
    uint256 public feeDenominator;
    
    address public feeReserveAddress;
    address public owner;

    address public constant UNISWAP_FACTORY_ADDRESS = 0xc35DADB65012eC5796536bD9864eD8773aBc74C4;
    address public constant UNISWAP_ROUTER_ADDRESS = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;
    address public wethAddress;
    address public usdtAddress;
    address public usdcAddress;

    event Received(address, uint);
    event onDeposit(address indexed token, uint256 indexed amount, address indexed wallet);
    event onWithdraw(address indexed token, uint256 indexed amount, address indexed wallet);
    event hedgeCreated(address indexed token, uint256 indexed optionId, uint256 amount, bool indexed tool, uint256 cost);
    event hedgePurchased(address indexed token, uint256 indexed optionId, uint256 amount, bool indexed tool, address buyer);
    event hedgeSettled(address indexed token, uint256 indexed optionId, uint256 amount, uint256 indexed payOff, uint256 endvalue);
    
    constructor() public {
      IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
      wethAddress = router.WETH();
      usdtAddress = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9; // USDT address on Arb
      usdcAddress = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d; // USDC address on Arb

      feeNumerator = 3;
      feeDenominator = 1000;
      feeReserveAddress = msg.sender;
      owner = msg.sender;
    }

    function depositToken(address _token, uint256 _amount) public payable {
        require(_amount > 0, 'Your attempting to trasfer 0 tokens');
        if (!hedgedTokenLookup[_token]) {
            depositedTokens.push(_token);
            hedgedTokenLookup[_token] = true;
        }
        // global tracker for tokens on contract
        tokenAmountMap[_token].deposited += _amount;
        // personal tracker for user tokens on contract
        UserTokenBalance storage uto = tokenUserMap[_token][msg.sender];
        uto.deposited = uto.deposited.add(_amount);
        // on first deposit save address
        if(uto.deposited == 0){
            userhedgedTokens[msg.sender].push(_token);
        }
        emit onDeposit(_token, _amount, msg.sender);
    }

    function createHedge(bool tool, address token, uint256 amount, uint256 strike, uint256 cost, uint256 deadline) public {
        require(amount > 0, 'Your attempting to create with 0 tokens');
        uint256 withdrawable = getWithdrawableBalance(token, msg.sender);
        require(withdrawable > 0, 'Insufficient balance');
        require(strike > 0, "Strike price must be greater than zero");
        require(cost > 0, "Cost must be greater than zero");
        require(token != address(0), "Token address cannot be zero");
        require(token != UNISWAP_ROUTER_ADDRESS, "Token address cannot be router address");
        require(token != UNISWAP_FACTORY_ADDRESS, "Token address cannot be factory address");
        require(token != address(this), "Token address cannot be contract address");
        //save option
        hedgingOption storage newOption = hedges[optionID];
        newOption.owner = msg.sender;
        newOption.tool = tool;
        newOption.token = token;
        newOption.status = 1;
        newOption.amount = amount;
        (, newOption.paired) = getUnderlyingValue(token, amount);
        newOption.strike = strike;
        newOption.cost = cost;
        newOption.dt_expiry = deadline;
        newOption.dt_created = block.timestamp;
        //update user balances for token in hedge
        UserTokenBalance storage hto = tokenUserMap[token][msg.sender];
        hto.lockedinuse += amount;
        //save hedges
        myhedgesCreated[msg.sender].push(optionID);
        hedgesCreated.push(optionID);
        optionID ++;
        //push hedge into array under address
        hedgesArray[token].push(optionID);
        userhedgedTokens[msg.sender].push(token);
        //emit
        emit hedgeCreated(token, optionID, amount, tool, cost);
    }

    //buy with the paired currency to avoid base currency loss
    //ie vela/weth in weth, vela/usdt pair in usdt
    //when buying a call option or quity swap; cost deposited by taker should be reference equity i.e. underlying token

    function buyHedge(uint256 _optionId, uint256 cost) public {
        hedgingOption storage option = hedges[_optionId];
        UserTokenBalance storage utt = tokenUserMap[option.paired][msg.sender];
        require(getWithdrawableBalance(option.paired, msg.sender) >= cost, 'Insufficient balance');
        require(_optionId < optionID, "Invalid option ID");
        require(cost > 0 && cost == option.cost, 'Your attempting to buy option with 0 base tokens');
        //take fee from deal
        uint256 fee = calculateFee(cost);
        uint256 amountIn = cost.sub(fee);
        require(IERC20(option.paired).transferFrom(address(this), address(feeReserveAddress), fee), 'Transfer failed');
        //taker lockedinuse increases until settlement
        utt.lockedinuse = utt.lockedinuse.add(amountIn);
        option.taker = msg.sender;
        option.status = 2;
        (option.startvalue, ) = getUnderlyingValue(option.token, option.amount);
        require(option.startvalue > 0,'math error whilst getting price');
        option.dt_started = block.timestamp;
        //use array to save hedges and getter function to iterate index ranges to retrieve
        //from index[x] to index[y]
        myhedgesTaken[msg.sender].push(_optionId);
        hedgesTaken.push(_optionId);
        takesCount +1;
        //emit
        emit hedgePurchased(option.token, _optionId, option.amount, option.tool, msg.sender);
    }
    //settle hedge
    //this is a variable loss approach not textbook maximum loss approach as calculated using 'getOptionValue' function
    //as such these are techically equity swaps with strike price = nortional value
    //strike value = start value, notional value = start value
    //funds moved from locked in use to deposit balances
    function settleHedge(uint256 _optionId) external {
        require(_optionId < optionID, "Invalid option ID");
        hedgingOption storage option = hedges[_optionId];
        require(block.timestamp >= option.dt_expiry, "Option has not expired");

        uint256 startValue = option.startvalue;
        (uint256 underlying, ) = getUnderlyingValue(option.token, option.amount);
        uint256 payOff;

        UserTokenBalance storage oti = tokenUserMap[option.paired][option.owner];
        UserTokenBalance storage otiU = tokenUserMap[option.token][option.owner];
        UserTokenBalance storage tti = tokenUserMap[option.paired][option.taker];
        UserTokenBalance storage ttiU = tokenUserMap[option.token][option.taker];
        UserTokenBalance storage ccBT = tokenUserMap[option.paired][address(this)];
        UserTokenBalance storage ccUT = tokenUserMap[option.token][address(this)];

        if (option.hedgeType == HedgeType.CALL) {
          //in the money, factor cost in calculation of call option profit
            if (underlying > startValue.add(option.cost)) {
                //taker profit = underlying - cost - strikevalue
                payOff = underlying.sub(startValue.add(option.cost));
                //convert to equiv tokens lockedinuse by owner, factor fee
                (uint256 priceNow, ) = getUnderlyingValue(option.token, 1);
                uint256 tokensDue = payOff.div(priceNow);
                tokensDue = (tokensDue).sub(calculateFee(tokensDue));
                //move money - take full gains from owner, give taxed amount to taker, pocket difference
                otiU.lockedinuse -= tokensDue;
                ttiU.deposited += tokensDue.sub(calculateFee(tokensDue));
                //move money - pay cost to owner from taker
                tti.lockedinuse -= option.cost;
                oti.deposited += option.cost.sub(calculateFee(option.cost));
                //move money - credit taxes
                ccUT.deposited += calculateFee(tokensDue);
                ccBT.deposited += calculateFee(option.cost);
                //restore initials - continue from balance of oti.lockedinuse
                oti.lockedinuse -= option.amount - tokensDue;
            } else {
                //move money - maximum loss of base cost to taker only, owner loses nothing
                tti.lockedinuse -= option.cost;
                oti.deposited += option.cost.sub(calculateFee(option.cost));
                //move money - credit taxes in bases only
                ccBT.deposited += calculateFee(option.cost);
                //restore initials - continue from balance of oti.lockedinuse
                oti.lockedinuse -= option.amount;
            }
        } else {
            if (underlying > startValue) {
                payOff = underlying.sub(startValue);
                //max loss config
                //cant sub fee here, it distorts owner tokens deducted & double taxes taker
                if(payOff > option.cost){
                  payOff = option.cost;
                }
                //taker gains underlying tokens equiv
                (uint256 priceNow, ) = getUnderlyingValue(option.token, 1);
                uint256 tokensDue = payOff.div(priceNow);
                //move money - take full gains from owner, give taxed to taker, pocket difference
                otiU.lockedinuse -= tokensDue;
                ttiU.deposited += tokensDue.sub(calculateFee(tokensDue));
                //move money - price is up: equiv loss of cost from taker to owner
                tti.lockedinuse -= option.cost;
                oti.deposited += option.cost.sub(calculateFee(option.cost));
                //move money - credit taxes
                ccUT.deposited += calculateFee(tokensDue);
                ccBT.deposited += calculateFee(option.cost);
                //restore initials - continue from balance of oti.lockedinuse
                oti.lockedinuse -= option.amount - tokensDue;                
            } else {
              //owner loses nothing, max loss to taker collateral only
                payOff = startValue.sub(underlying);
                //max loss config
                if(payOff > option.cost){
                  payOff = option.cost;
                }
                //price is down: taker loses equiv in base
                tti.lockedinuse -= payOff;
                oti.deposited += payOff.sub(calculateFee(option.cost));
                //move money - credit taxes
                ccBT.deposited += calculateFee(option.cost);
                //restore initials - continue from balance of oti.lockedinuse
                oti.lockedinuse -= option.amount;
            }
        }
        option.status = 3;
        option.endvalue = underlying;
        option.dt_settled = block.timestamp;
        //emit
        emit hedgeSettled(option.token, _optionId, option.amount, payOff, underlying);
    }

    function withdrawToken(address token, uint256 amount) public {
        uint256 withdrawable = getWithdrawableBalance(token, msg.sender);
        UserTokenBalance storage uto = tokenUserMap[token][msg.sender];
        uto.withdrawn = uto.withdrawn.add(amount);
        require(withdrawable >= amount, "Insufficient balance.");
        require(amount <= withdrawable, 'Your attempting to withdraw more than you have available');
        require(IERC20(token).transfer(msg.sender, amount), 'Transfer failed');
        // track each token amounts
        tokenAmountMap[token].withdrawn -= amount;
        //emit
        emit onWithdraw(token, amount, msg.sender);
    }

    //utility helpers and getters
    function updateFee(uint256 numerator, uint256 denominator) onlyOwner public {
      feeNumerator = numerator;
      feeDenominator = denominator;
    }
    
    function calculateFee(uint256 amount) public view returns (uint256){
      require(amount >= feeDenominator, 'Deposit is too small');    
      uint256 amountInLarge = amount.mul(feeDenominator.sub(feeNumerator));
      uint256 amountIn = amountInLarge.div(feeDenominator);
      uint256 fee = amount.sub(amountIn);
      return (fee);
    }

    struct PairInfo {
        address pairAddress;
        address pairedCurrency;
        ERC20 token0;
        ERC20 token1;
        uint112 reserve0;
        uint112 reserve1;
        uint256 token0Decimals;
        uint256 token1Decimals;
    }
    
    function getUnderlyingValue(address _tokenAddress, uint256 _tokenAmount) public view returns (uint256, address) {
        PairInfo memory pairInfo;
        (pairInfo.pairAddress, pairInfo.pairedCurrency) = getPairAddressZK(_tokenAddress);
        IUniswapV2Pair pair = IUniswapV2Pair(pairInfo.pairAddress);
        //base currency check
        if (pair.token0() == address(0) || pair.token1() == address(0)) { return (0, address(0));}
        pairInfo.token0 = ERC20(pair.token0());
        pairInfo.token1 = ERC20(pair.token1());
        (pairInfo.reserve0, pairInfo.reserve1, ) = pair.getReserves();
        pairInfo.token0Decimals = uint256(10) ** pairInfo.token0.decimals();
        pairInfo.token1Decimals = uint256(10) ** pairInfo.token1.decimals();

        uint256 tokenValue;
        if (_tokenAddress == pair.token0()) {
            tokenValue = (_tokenAmount * pairInfo.reserve1 * pairInfo.token0Decimals) / (pairInfo.reserve0 * pairInfo.token1Decimals);
            return (tokenValue, pairInfo.pairedCurrency);
        } else if (_tokenAddress == pair.token1()) {
            tokenValue = (_tokenAmount * pairInfo.reserve0 * pairInfo.token1Decimals) / (pairInfo.reserve1 * pairInfo.token0Decimals);
            return (tokenValue, pairInfo.pairedCurrency);
        } else {
            revert("Invalid token address");
        }
    }
    
    function getWithdrawableBalance(address token, address user) public view returns (uint256) {
      UserTokenBalance storage uto = tokenUserMap[token][address(user)];
      uint256 withdrawable = 0;
      withdrawable = withdrawable.add(uto.deposited).sub(uto.withdrawn).sub(uto.lockedinuse);
      return withdrawable;
    }

    // zero knowledge pair addr generator
    function getPairAddressZK(address tokenAddress) public view returns (address pairAddress, address pairedCurrency) {
      IUniswapV2Factory factory = IUniswapV2Factory(UNISWAP_FACTORY_ADDRESS);
      address wethPairAddress = factory.getPair(tokenAddress, wethAddress);
      address usdtPairAddress = factory.getPair(tokenAddress, usdtAddress);
      address usdcPairAddress = factory.getPair(tokenAddress, usdcAddress);
      if (wethPairAddress != address(0)) {
          return (wethPairAddress, wethAddress);
      } else if (usdtPairAddress != address(0)) {
          return (usdtPairAddress, usdtAddress);
      } else if (usdcPairAddress != address(0)) {
          return (usdcPairAddress, usdcAddress);
      } else {
          revert("TokenValue: token is not paired with WETH, USDT, or USDC");
      }
    }

    // users base balances
    function getUserBases(address user) public view returns (uint256,uint256,uint256) {
      return (tokenUserMap[wethAddress][user].deposited, tokenUserMap[usdtAddress][user].deposited, tokenUserMap[usdcAddress][user].deposited);
    }

    //users token balances
    function getUserTokenBalances (address token, address user) public view returns (uint256, uint256, uint256, uint256, uint256, address) {
      UserTokenBalance storage uto = tokenUserMap[address(token)][address(user)];
      uint256 deposited = uto.deposited;
      uint256 withdrawn = uto.withdrawn;
      uint256 lockedinuse = uto.lockedinuse;
      uint256 withdrawableBalance = getWithdrawableBalance(token, msg.sender);
      (uint256 withdrawableValue, address paired) = getUnderlyingValue(token, withdrawableBalance);
      return (deposited, withdrawn, lockedinuse, withdrawableBalance, withdrawableValue, paired);
    }
    
    //contract balances
    function getTokenBalances(address _token) public view returns (uint256, uint256) {
        return (tokenAmountMap[_token].deposited, tokenAmountMap[_token].withdrawn);
    }

    //user tokens transacted/interacted with
    function getUserTokensList(address user) public view returns(address[] memory){
      return userhedgedTokens[user];
    }

    //user hedges created
    function getUserHedgesCreated(address user) public view returns(uint[] memory){
      return myhedgesCreated[user];
    }

    //user hedges taken
    function getUserHedgesTaken(address user) public view returns(uint[] memory){
      return myhedgesTaken[user];
    }

    function getDepositedTokensLength() external view returns (uint) {
        return depositedTokens.length;
    }

    //hedges array under specific token
    function getTokenHedgesCount(address _token) public view returns (uint256) {
        return hedgesArray[_token].length;
    }

    function getTokenHedgesList(address _token) public view returns(uint[] memory){
      return hedgesArray[_token];
    }

    function getHedgeDetails(uint256 _optionId) public view returns (hedgingOption memory) {
        hedgingOption storage hedge = hedges[_optionId];
        require(hedge.owner != address(0), "Option does not exist.");
        return hedge;
    }

    //iterate array from index x to y
    function getHedgesFromXY(address token, uint x, uint y) public view returns (uint[] memory) {
        uint[] memory result = new uint[](y - x + 1);
        for (uint i = x; i <= y; i++) {
            result[i - x] = hedgesArray[token][i];
        }
        return result;
    }
    function getmyHedgesFromXY(address user, uint x, uint y, bool arrayType) public view returns (uint[] memory) {
        uint[] memory result = new uint[](y - x + 1);
        for (uint i = x; i <= y; i++) {
          if(arrayType){
            result[i - x] = myhedgesCreated[user][i];
          }else{
            result[i - x] = myhedgesTaken[user][i];
          }
        }
        return result;
    }
    

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
    
}


     /* backup
    // above approach better as it tokenises for all currencies
    function depositBase(address _tokenAddress) public payable{
      require(msg.value > 0, "zero deposit value");
      uint256 amount = msg.value;
      // charge a fee
      uint256 fee = calculateFee(msg.value);
      uint256 amountIn = amount.sub(fee);
      // track each token amounts
      tokenAmountMap[_tokenAddress].deposited += amountIn;
      //track users added tokens
      userTokenMap[msg.sender][_tokenAddress] = true;
      // token mapped to user
      UserTokenBalance storage uto = tokenUserMap[_tokenAddress][msg.sender];
      uto.deposited = uto.deposited.add(amountIn);
      baseETH_in += amountIn;
      emit onDeposit(_tokenAddress, msg.value, fee);
    }
    */

    /* backup
    function getOptionValueOG(address _tokenAddress, uint256 _tokenAmount) public view returns (uint256, address pairedCurrency) {
      //address _pairAddress = getPairAddressBK(_tokenAddress, _baseAddress);
      (address _pairAddress, address pairedCurrency) = getPairAddressZK(_tokenAddress);

      IUniswapV2Pair pair = IUniswapV2Pair(_pairAddress); // Create an instance of the UniswapV2Pair contract
      ERC20 token0 = ERC20(pair.token0()); // Create an instance of the Token0 contract
      ERC20 token1 = ERC20(pair.token1()); // Create an instance of the Token1 contract

      //base currency check
      if(pair.token0() == address(0) || pair.token1() == address(0)){return (0,address(0));}

      (uint256 reserve0, uint256 reserve1, ) = pair.getReserves(); // Get the reserves of Token0 and Token1
      uint256 token0Decimals = uint256(10)**token0.decimals(); // Get the decimals of Token0
      uint256 token1Decimals = uint256(10)**token1.decimals(); // Get the decimals of Token1

      uint256 token0Value = (_tokenAmount * reserve0 * token1Decimals) / (reserve1 * token0Decimals); // Calculate the value of the tokens in Token0
      uint256 token1Value = (_tokenAmount * reserve1 * token0Decimals) / (reserve0 * token1Decimals); // Calculate the value of the tokens in Token1

      if (_tokenAddress == pair.token0()) {
          return (token0Value,pairedCurrency);
      } else if (_tokenAddress == pair.token1()) {
          return (token1Value,pairedCurrency);
      } else {
          revert("Invalid token address");
      }
    }
    */

    /* backup 
    // full knowledge pair addr generator
    function getPairAddressBK(address _tokenAddress, address _baseAddress) public view returns(address pairAddress, address){
      IUniswapV2Factory uniswapFactory = IUniswapV2Factory(UNISWAP_FACTORY_ADDRESS); // Address of the Uniswap factory on the Ethereum mainnet
      pairAddress = uniswapFactory.getPair(_tokenAddress, _baseAddress); // Get the pair address of the token and WETH/USDT/USDC
      return (pairAddress, _baseAddress);
    }
    */
