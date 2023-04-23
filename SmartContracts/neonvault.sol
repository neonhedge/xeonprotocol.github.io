// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;
// NEON HEDGE - hedge any ERC20 token. borrow with any ERC20 token.
// We aim is to push hedging and crypto lending beyond just BTC & ETH as underlying assets.

//Call Options Functionality
//1. to receive any ERC20 token as collateral/assets
//2. Price these assets using getReserves
//3. allow people to own the rights to withdrawing these tokens
//4. enable options creation to hedge these assets
//5. enable options buying to hedge these assets
//6. options settlement based on price of assets in comparison to strike value & cost
// - token withdrawals terms:
//1. depositors withdraw after an option expires
//2. withdrawal value = asset value + option cost
//3. taker profits if strike is hit & value + cost => price

//Equity Swaps Functionality
//1. Equity swap contracts for any erc20 token
//2. Holder of assets must deposit tokens as collateral
//3. taker must also deposit collateral equal to the nortional value of the swap
//4. buying or settlement is in base currency of underlying token

//key functions
// - value
// - deposit
// - withdraw
// - calculate fees
// - get pair addresses of all erc20
// - create hedge
// - buy hedge
// - settle hedge
// - withdrawable versus locked
// - get hedge details by id
// - fetch hedges

//key dependencies
// 1. getReserves Uniswap

//dev guides
// - all tokens are treated as ERC20
// - uniswap version 2 router in beta
// - deposits, lockedinuse and withdrawals track user balance
// - lockedinuse is the current account (+-) on trades. it is also escrow
// - only base currencies :weth, usdt and usdc contract balance tracked
// - getUnderlyingValue is variable loss/gain equally for both parties
// - unified creating, buying and settling functions
// - user taxes only calculated on settlement not deposits, withdrawals or buys
// - contract taxes credited to fee wallet on buy (call option cost , & equity swao collateral is cost)

import "./SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract HEDGEFUND {

    using SafeMath for uint256;

    bool private locked = false;
    bool private isExecuting;

    modifier nonReentrant() {
        require(!isExecuting, "Function is currently being executed");
        isExecuting = true;
        _;
        isExecuting = false;
    }
    modifier onlyOwner {
      require(msg.sender == owner, "You are not the owner");
      _;
    }
    struct userBalance {
      uint256 deposited; // incremented on successful deposit
      uint256 withdrawn; // incremented on successful withdrawl
      uint256 lockedinuse; // adjust on hedge creation or buy or settle
    }
    struct contractBalances {
      uint256 deposited;
      uint256 withdrawn;
    }
    struct hedgingOption{
      address owner;
      address taker;
      address token;
      address paired;
      uint status;//0 - none, 1 - created, 2 - taken, 3 - settled
      uint256 amount;
      uint256 startvalue;
      uint256 endvalue;
      uint256 cost;
      uint256 dt_created;
      uint256 dt_started;
      uint256 dt_expiry;
      uint256 dt_settled;
      HedgeType hedgeType;
    }
    enum HedgeType {CALL, SWAP}

    // mapping of erc20 token balances for traders
    mapping(address => mapping(address => userBalance)) private userBalanceMap;

    //mapping of user-hedge-Ids array for each erc20 token
    mapping(address => mapping(address => uint[])) private userHedgesForTokenMap;

    // track all erc20 deposits and withdrawals to contract
    mapping(address => contractBalances) public contractBalanceMap;
    
    // mapped addresses erc20s hedged/traded
    mapping(address => bool) public hedgedTokenLookup;

    // mapping of all hedge storages by Id
    mapping(uint => hedgingOption) private hedgeMap;

    // mapping of all hedges for each erc20
    mapping(address => uint[]) private tokenHedges;

    // mapping of all hedges for user by Id
    mapping(address => uint[]) myhedgesHistory;
    mapping(address => uint[]) myhedgesCreated;
    mapping(address => uint[]) myhedgesTaken;
    
    // mapping of all tokens transacted by user
    mapping(address => address[]) public userERC20s;

     // mapping bookmarks of each user
    mapping(address => mapping(uint256 => bool)) public bookmarks;
    
    // all hedges
    uint[] private hedgesCreated;
    uint[] private hedgesTaken;

    // array of currently deposited tokens
    address[] private depositedTokens;
    
    uint public optionID;
    uint public takesCount;
    
    // fee variables
    uint256 public feeNumerator;
    uint256 public feeDenominator;
    
    address public feeReserveAddress;
    address public owner;

    address private constant UNISWAP_FACTORY_ADDRESS = 0xc35DADB65012eC5796536bD9864eD8773aBc74C4;
    address private constant UNISWAP_ROUTER_ADDRESS = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;
    address public wethAddress;
    address public usdtAddress;
    address public usdcAddress;

    event Received(address, uint);
    event onDeposit(address indexed token, uint256 indexed amount, address indexed wallet);
    event onWithdraw(address indexed token, uint256 indexed amount, address indexed wallet);
    event hedgeCreated(address indexed token, uint256 indexed optionId, uint256 amount, HedgeType hedgeType, uint256 cost);
    event hedgePurchased(address indexed token, uint256 indexed optionId, uint256 amount, HedgeType hedgeType, address buyer);
    event hedgeSettled(address indexed token, uint256 indexed optionId, uint256 amount, uint256 indexed payOff, uint256 endvalue);
    event bookmarkToggle(address indexed user, uint256 hedgeId, bool bookmarked);


    constructor() public {
      IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
      wethAddress = router.WETH();
      usdtAddress = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9; // USDT address on Arb
      usdcAddress = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d; // USDC address on Arb
      //BUSD 0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee

      feeNumerator = 3;
      feeDenominator = 1000;
      feeReserveAddress = msg.sender;
      owner = msg.sender;
    }

    function depositToken(address _token, uint256 _amount) public payable {
        require(_amount > 0, "Your attempting to transfer 0 tokens");
        if (!hedgedTokenLookup[_token]) {
            depositedTokens.push(_token);
            hedgedTokenLookup[_token] = true;
        }
        uint256 allowance = IERC20(_token).allowance(msg.sender, address(this));
        require(allowance >= _amount, "You need to set a higher allowance");
        //transfer tokens from sender to contract
        require(IERC20(_token).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        //global tracker for tokens on contract
        contractBalanceMap[_token].deposited += _amount;
        //personal tracker for user tokens on contract
        userBalance storage uto = userBalanceMap[_token][msg.sender];
        if(uto.deposited == 0){
          userERC20s[msg.sender].push(_token);
        }
        uto.deposited = uto.deposited.add(_amount);
        //store in storage
        userBalanceMap[_token][msg.sender] = uto;
        //emit
        emit onDeposit(_token, _amount, msg.sender);
    }

    //covers both call options and equity swaps
    //uses withdrawable balance as the current account
    //cap the max cost of option to the market standard for X years
    //this virtually means we have x max year options based on this cap
    //and we can calculate proportion for a lessor duration
    function createHedge(bool tool, address token, uint256 amount, uint256 cost, uint256 deadline) public nonReentrant {
        require(!locked, "Function is locked");
        locked = true;
        require(amount > 0 && cost > 0 && deadline > block.timestamp, "Invalid option parameters");
        uint256 withdrawable = getWithdrawableBalance(token, msg.sender);
        require(withdrawable > 0, "Insufficient free balance");
        require(token != address(0), "Token address cannot be zero");
        require(token != UNISWAP_ROUTER_ADDRESS, "Token address cannot be router address");
        require(token != UNISWAP_FACTORY_ADDRESS, "Token address cannot be factory address");
        require(token != address(this), "Token address cannot be contract address");

        // Assign option values directly to the struct
        hedgingOption storage newOption = hedgeMap[optionID];
        newOption.owner = msg.sender;
        newOption.token = token;
        newOption.status = 1;
        newOption.amount = amount;
        (, newOption.paired) = getUnderlyingValue(token, amount);
        newOption.cost = cost;
        newOption.dt_expiry = deadline;
        newOption.dt_created = block.timestamp;
        newOption.hedgeType = tool ? HedgeType.CALL : HedgeType.SWAP; // Use ternary operator for conditional assignment

        // Store only if data has changed or added to the struct
        hedgeMap[optionID] = newOption;

        // Update user balances for token in hedge
        userBalance storage hto = userBalanceMap[token][msg.sender]; // Use storage instead of memory for hto
        hto.lockedinuse += amount; // Modify the property of hto directly in storage
        // Emit events and update arrays
        myhedgesHistory[msg.sender].push(optionID);
        myhedgesCreated[msg.sender].push(optionID);
        hedgesCreated.push(optionID);
        tokenHedges[token].push(optionID);
        emit hedgeCreated(token, optionID, amount, newOption.hedgeType, cost);

        optionID++;
        locked = false;
    }

    function buyHedge(uint256 _optionId) public nonReentrant {
        // Use the nonReentrant modifier to prevent reentrancy attacks 
        // Locked as a manual lock to prevent concurrent execution of the same function by multiple users.
        require(!locked, "Function is locked");
        locked = true;

        hedgingOption storage hedge = hedgeMap[_optionId];
        userBalance storage stk = userBalanceMap[hedge.paired][msg.sender];

        // Check if the user has sufficient free base balance to buy the hedge
        require(getWithdrawableBalance(hedge.paired, msg.sender) >= hedge.cost, "Insufficient free base balance");

        // Check if the option ID is valid and the buyer is not the owner of the hedge
        require(_optionId < optionID && msg.sender != hedge.owner, "Invalid option ID | Owner cant buy");

        // Update the taker's lockedinuse balance
        stk.lockedinuse = stk.lockedinuse.add(hedge.cost);

        // Update the hedge details
        hedge.taker = msg.sender;
        hedge.status = 2;

        // Calculate the start value based on the hedge type
        (hedge.startvalue, ) = getUnderlyingValue(hedge.token, hedge.amount);
        if (hedge.hedgeType == HedgeType.CALL) {
            hedge.startvalue += hedge.cost;
        }

        // Check if the start value is greater than 0
        require(hedge.startvalue > 0, "Math error whilst getting price");

        // Update the hedge timestamp
        hedge.dt_started = block.timestamp;

        // Store the updated structs
        userBalanceMap[hedge.paired][msg.sender] = stk;
        hedgeMap[_optionId] = hedge;

        // Update user's hedges taken array and hedgesTaken count
        myhedgesHistory[msg.sender].push(optionID);
        myhedgesTaken[msg.sender].push(_optionId);
        hedgesTaken.push(_optionId);
        takesCount += 1;

        // Emit the hedgePurchased event
        emit hedgePurchased(hedge.token, _optionId, hedge.amount, hedge.hedgeType, msg.sender);

        // Unlock the function
        locked = false;
    }
    
    //settle hedge
    //this is a variable loss approach not textbook maximum loss approach, as calculated using 'getOptionValue' function
    //techically equity swaps have max loss of collateral at max strike, option calls have max loss of cost only
    //strike value is starting value when option was bought, less start value to determine if in the money
    //funds moved from locked in use to deposit balances for both parties, settlement in base or equivalent underlying
    //fees are collected on settlement and credited to contract balances
    struct HedgeInfo {
        uint256 payOff;
        uint256 priceNow;
        uint256 tokensDue;
        uint256 tokenfee;
        uint256 costfee;
    }
    function settleHedge(uint256 _optionId) external {
        HedgeInfo memory hedgeInfo;
        require(_optionId < optionID, "Invalid option ID");
        hedgingOption storage option = hedgeMap[_optionId];
        require(block.timestamp >= option.dt_expiry, "Option has not expired");

        // Initialize local variables
        bool isPayOffGreaterThanCost;
        uint256 startValue = option.startvalue;
        (uint256 underlying, ) = getUnderlyingValue(option.token, option.amount);
        
        // Get the user balances for the owner, taker, and contract
        userBalance storage oti = userBalanceMap[option.paired][option.owner];
        userBalance storage otiU = userBalanceMap[option.token][option.owner];
        userBalance storage tti = userBalanceMap[option.paired][option.taker];
        userBalance storage ttiU = userBalanceMap[option.token][option.taker];
        userBalance storage ccBT = userBalanceMap[option.paired][address(this)];
        userBalance storage ccUT = userBalanceMap[option.token][address(this)];

        if (option.hedgeType == HedgeType.CALL) {
            isPayOffGreaterThanCost = underlying > startValue.add(option.cost);
            if (isPayOffGreaterThanCost) {
                // Taker profit = underlying - cost - strikevalue
                hedgeInfo.payOff = underlying.sub(startValue.add(option.cost));
                // Convert to equiv tokens lockedinuse by owner, factor fee
                (hedgeInfo.priceNow, ) = getUnderlyingValue(option.token, 1);
                hedgeInfo.tokensDue = hedgeInfo.payOff.div(hedgeInfo.priceNow);
                uint256 tokenfee = calculateFee(hedgeInfo.tokensDue);
                uint256 costfee = calculateFee(option.cost);
                // Move money - take full gains from owner, give taxed amount to taker, pocket difference
                otiU.lockedinuse -= hedgeInfo.tokensDue;
                ttiU.deposited += hedgeInfo.tokensDue.sub(tokenfee);
                // Move money - pay cost to owner from taker
                tti.lockedinuse -= option.cost;
                oti.deposited += option.cost.sub(costfee);
                // Restore initials - continue from balance of oti.lockedinuse
                oti.lockedinuse -= option.amount - hedgeInfo.tokensDue;
                // Move money - take taxes from settlement
                ccUT.deposited += tokenfee;
                ccBT.deposited += costfee;
            } else {
                // Move money - maximum loss of base cost to taker only, owner loses nothing
                tti.lockedinuse -= option.cost;
                oti.deposited += option.cost.sub(calculateFee(option.cost));
                // Restore initials - continue from balance of oti.lockedinuse
                oti.lockedinuse -= option.amount;
                // Move money - take taxes from settlement
                ccBT.deposited += calculateFee(option.cost);
            }
        } else {
            if (underlying > startValue) {
                hedgeInfo.payOff = underlying.sub(startValue);
                // Max loss config
                if (hedgeInfo.payOff > option.cost) {
                    hedgeInfo.payOff = option.cost;
                }
                // Taker gains underlying tokens equiv
                (hedgeInfo.priceNow, ) = getUnderlyingValue(option.token, 1);
                uint256 tokensDue = hedgeInfo.payOff.div(hedgeInfo.priceNow);
                uint256 tokenfee = calculateFee(hedgeInfo.tokensDue);
                uint256 costfee = calculateFee(option.cost);
                // Move money - take full gains from owner, give taxed amount to taker, pocket difference
                otiU.lockedinuse -= tokensDue;
                ttiU.deposited += tokensDue.sub(tokenfee);
                // Move money - pay cost to owner from taker
                tti.lockedinuse -= option.cost;
                oti.deposited += option.cost.sub(costfee);
                // Restore initials - continue from balance of oti.lockedinuse
                oti.lockedinuse -= option.amount - tokensDue;
                // Move money - take taxes from settlement
                ccUT.deposited += tokenfee;
                ccBT.deposited += costfee;
            } else {
                // Move money - maximum loss of base cost to taker only, owner loses nothing
                tti.lockedinuse -= option.cost;
                oti.deposited += option.cost.sub(calculateFee(option.cost));
                // Restore initials - continue from balance of oti.lockedinuse
                oti.lockedinuse -= option.amount;
                // Move money - take taxes from settlement
                ccBT.deposited += calculateFee(option.cost);
            }
        }
        //update hedge
        option.status = 3;
        option.endvalue = underlying;
        option.dt_settled = block.timestamp;
        //emit
        emit hedgeSettled(option.token, _optionId, option.amount, hedgeInfo.payOff, underlying);
    }

    function withdrawToken(address token, uint256 amount) public {
        userBalance storage uto = userBalanceMap[token][msg.sender];
        uint256 withdrawable = getWithdrawableBalance(token, msg.sender);
        require(amount <= withdrawable, "You are attempting to withdraw more than you have available");

        // Update user's withdrawn balance
        uto.withdrawn = uto.withdrawn.add(amount);

        // Transfer tokens to the user
        require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");

        // Update contract's withdrawn balance for the token
        contractBalanceMap[token].withdrawn -= amount;

        // Emit withdrawal event
        emit onWithdraw(token, amount, msg.sender);
    }

    //utility functions
    function updateFee(uint256 numerator, uint256 denominator) onlyOwner public {
      feeNumerator = numerator;
      feeDenominator = denominator;
    }
    
    function calculateFee(uint256 amount) public view returns (uint256){
      require(amount >= feeDenominator, "Deposit is too small");    
      uint256 amountInLarge = amount.mul(feeDenominator.sub(feeNumerator));
      uint256 amountIn = amountInLarge.div(feeDenominator);
      uint256 fee = amount.sub(amountIn);
      return (fee);
    }

    // Function to toggle a bookmark for a Hedge by its ID
    function bookmarkHedge(uint256 _optionId) public {
        bool bookmarked = bookmarks[msg.sender][_optionId];
        bookmarks[msg.sender][_optionId] = !bookmarked;
        emit bookmarkToggle(msg.sender, _optionId, !bookmarked);
    }

    function getBookmark(address user, uint256 _optionId) public view returns (bool) {
        return bookmarks[user][_optionId];
    }

    //Getter functions start here.
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
    
    //get base value for amount of tokens, or value in paired currency.
    //base value is always the pair address of the token provided. get pair using UniswapV2 standard.
    function getUnderlyingValue(address _tokenAddress, uint256 _tokenAmount) public view returns (uint256, address) {
        PairInfo memory pairInfo;
        (pairInfo.pairAddress, pairInfo.pairedCurrency) = getPairAddressZK(_tokenAddress);
        IUniswapV2Pair pair = IUniswapV2Pair(pairInfo.pairAddress);
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
    
    //current account 
    function getWithdrawableBalance(address token, address user) public view returns (uint256) {
      userBalance memory uto = userBalanceMap[token][address(user)];
      uint256 withdrawable = 0;
      withdrawable = withdrawable.add(uto.deposited).sub(uto.withdrawn).sub(uto.lockedinuse);
      return withdrawable;
    }

    //zero knowledge pair addr generator
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

    //users base balances
    function getUserBases(address user) public view returns (uint256,uint256,uint256) {
      return (userBalanceMap[wethAddress][user].deposited, userBalanceMap[usdtAddress][user].deposited, userBalanceMap[usdcAddress][user].deposited);
    }

    //users token balances
    function getuserTokenBalances (address token, address user) public view returns (uint256, uint256, uint256, uint256, uint256, address) {
      userBalance memory uto = userBalanceMap[address(token)][address(user)];
      uint256 deposited = uto.deposited;
      uint256 withdrawn = uto.withdrawn;
      uint256 lockedinuse = uto.lockedinuse;
      uint256 withdrawableBalance = getWithdrawableBalance(token, msg.sender);
      uint256 withdrawableValue; address paired;
      if(token != wethAddress && token != usdtAddress && token != usdcAddress ){
        (withdrawableValue, paired) = getUnderlyingValue(token, withdrawableBalance);
      }else{
        (withdrawableValue, paired) = (withdrawableBalance, address(0));
      }
      return (deposited, withdrawn, lockedinuse, withdrawableBalance, withdrawableValue, paired);
    }
    
    //contract balances
    function getContractTokenBalances(address _token) public view returns (uint256, uint256) {
        return (contractBalanceMap[_token].deposited, contractBalanceMap[_token].withdrawn);
    }

    /*user's erc20 history interacted or traded: targeted search
    ~ user is the address of the user whose history is being searched in the userERC20s mapping. 
    ~ startIndex is used to specify the starting index in the tokens array for the user, 
    ~ and limit is used to determine the number of items to search. 
    ~ The loop iterates from startIndex to startIndex + actualLimit (exclusive) 
    ~ and populates the result array with the values from tokens starting from index startIndex to startIndex + actualLimit - 1. 
    ~ The startIndex is used to calculate the correct index in the result array by subtracting it from the loop variable i. 
    ~ Additionally, a check is added to ensure that startIndex is within the bounds of the tokens array using a require statement, 
    ~ and actualLimit is calculated as the minimum of length - startIndex and limit to avoid exceeding the length of tokens.
    */
    function getUserHistory(address user, uint startIndex, uint limit) public view returns (address[] memory) {
        address[] memory tokens = userERC20s[user];
        uint length = tokens.length;
        require(startIndex < length, "Invalid start index");
        uint actualLimit = length - startIndex < limit ? length - startIndex : limit;
        address[] memory result = new address[](actualLimit);
        for (uint i = startIndex; i < startIndex + actualLimit; i++) {
            result[i - startIndex] = tokens[i];
        }
        return result;
    }

    /*user hedge positions created/taken: targeted search
    ~  user is the address of the user whose positions are being searched in the myhedgesHistory mapping. 
    ~ startIndex is used to specify the starting index in the fullArray for the user, 
    ~ and limit is used to determine the number of items to search. 
    ~ The loop iterates from startIndex to startIndex + actualLimit (exclusive) 
    ~ and populates the subset array with the values from fullArray starting from index startIndex to startIndex + actualLimit - 1. 
    ~ The startIndex is used to calculate the correct index in the subset array by subtracting it from the loop variable i. 
    ~ Additionally, a check is added to ensure that startIndex is within the bounds of the fullArray using a require statement, 
    ~ and actualLimit is calculated as the minimum of length - startIndex and limit to avoid exceeding the length of fullArray.
    */
        function getUserPositionsSubset(address user, uint startIndex, uint limit) public view returns (uint[] memory) {
        uint[] memory fullArray = myhedgesHistory[user];
        uint length = fullArray.length;
        require(startIndex < length, "Invalid start index");
        uint actualLimit = length - startIndex < limit ? length - startIndex : limit;
        uint[] memory subset = new uint[](actualLimit);
        for (uint i = startIndex; i < startIndex + actualLimit; i++) {
            subset[i - startIndex] = fullArray[i];
        }
        return subset;
    }

    /*user hedges created: targeted search
    ~ user is the address of the user whose hedges are being searched in the myhedgesCreated mapping. 
    ~ startIndex is used to specify the starting index in the fullArray for the user, 
    ~ and limit is used to determine the number of items to search. 
    ~ The loop iterates from startIndex to startIndex + actualLimit (exclusive) 
    ~ and populates the subset array with the values from fullArray starting from index startIndex to startIndex + actualLimit - 1. 
    ~ The startIndex is used to calculate the correct index in the subset array by subtracting it from the loop variable i. 
    ~ Additionally, a check is added to ensure that startIndex is within the bounds of the fullArray using a require statement, 
    ~ and actualLimit is calculated as the minimum of length - startIndex and limit to avoid exceeding the length of fullArray.
    */
    function getUserHedgesCreated(address user, uint startIndex, uint limit) public view returns(uint[] memory){
        uint[] memory fullArray = myhedgesCreated[user];
        uint length = fullArray.length;
        require(startIndex < length, "Invalid start index");
        uint actualLimit = length - startIndex < limit ? length - startIndex : limit;
        uint[] memory subset = new uint[](actualLimit);
        for (uint i = startIndex; i < startIndex + actualLimit; i++) {
            subset[i - startIndex] = fullArray[i];
        }
        return subset;
    }

    /*user hedges taken: targeted search
     ~ user is the address of the user whose hedges are being searched in the myhedgesTaken mapping. 
     ~ startIndex is used to specify the starting index in the fullArray for the user, and limit is used to determine the number of items to search. 
     ~ The loop iterates from startIndex to startIndex + actualLimit (exclusive) 
     ~ and populates the subset array with the values from fullArray starting from index startIndex to startIndex + actualLimit - 1. 
     ~ The startIndex is used to calculate the correct index in the subset array by subtracting it from the loop variable i. 
     ~ Additionally, a check is added to ensure that startIndex is within the bounds of the fullArray using a require statement, 
     ~ and actualLimit is calculated as the minimum of length - startIndex and limit to avoid exceeding the length of fullArray.
     */
    function getUserHedgesTaken(address user, uint startIndex, uint limit) public view returns(uint[] memory){
        uint[] memory fullArray = myhedgesTaken[user];
        uint length = fullArray.length;
        require(startIndex < length, "Invalid start index");
        uint actualLimit = length - startIndex < limit ? length - startIndex : limit;
        uint[] memory subset = new uint[](actualLimit);
        for (uint i = startIndex; i < startIndex + actualLimit; i++) {
            subset[i - startIndex] = fullArray[i];
        }
        return subset;
    }


    /* all hedges created: targeted search
    ~ startIndex is used to specify the starting index in the hedgesCreated array, 
    ~ and limit is used to determine the number of items to search. 
    ~ The loop iterates from startIndex to startIndex + limit (exclusive) 
    ~ and populates the result array with the values from hedgesCreated array starting from index startIndex to startIndex + limit - 1. 
    ~ The startIndex is used to calculate the correct index in the result array by subtracting it from the loop variable i. 
    ~ Additionally, a check is added to ensure that startIndex is within the bounds of the hedgesCreated array using a require statement.
    */
    function getAllHedges(uint startIndex, uint limit) public view returns (uint[] memory) {
        require(startIndex < hedgesCreated.length, "Invalid start index");
        uint[] memory allHedges = hedgesCreated;
        uint[] memory result = new uint[](limit);
        for (uint i = startIndex; i < startIndex + limit && i < allHedges.length; i++) {
            result[i - startIndex] = allHedges[i];
        }
        return result;
    }

    /* all hedges taken: targeted search
    ~ startIndex is used to specify the starting index in the hedgesTaken array, 
    ~ and limit is used to determine the number of items to search. 
    ~ The loop iterates from startIndex to startIndex + limit (exclusive) 
    ~ and populates the result array with the values from hedgesTaken array starting from index startIndex to startIndex + limit - 1. 
    ~ The startIndex is used to calculate the correct index in the result array by subtracting it from the loop variable i. 
    ~ Additionally, a check is added to ensure that startIndex is within the bounds of the hedgesTaken array using a require statement.
    */
    function getAllHedgesTaken(uint startIndex, uint limit) public view returns (uint[] memory) {
        require(startIndex < hedgesTaken.length, "Invalid start index");
        uint[] memory allHedgesTaken = hedgesTaken;
        uint[] memory result = new uint[](limit);
        for (uint i = startIndex; i < startIndex + limit && i < allHedgesTaken.length; i++) {
            result[i - startIndex] = allHedgesTaken[i];
        }
        return result;
    }

    //deposited tokens
    function getDepositedTokens() external view returns (address[] memory) {
        return depositedTokens;
    }

    function getDepositedTokensLength() external view returns (uint) {
        return depositedTokens.length;
    }

    //hedges array under specific token
    function getTokenHedgesCount(address _token) public view returns (uint256) {
        return tokenHedges[_token].length;
    }

    /* hedges list under specific ERC20 address: targeted search
    ~ the startIndex parameter is used to specify the starting index of the array, 
    ~ and the limit parameter is used to determine the number of items to include in the result. 
    ~ The endIndex is calculated as the minimum value between startIndex + limit and the length of the full array to ensure that it does not exceed the array bounds. 
    ~ Then, the actualLimit is calculated as the difference between endIndex and startIndex, 
    ~ which represents the actual number of items in the result array. 
    ~ Finally, the subset array is populated with the elements from the fullArray using the calculated indices based on startIndex and actualLimit.
    */
    function getTokenHedgesList(address _token, uint startIndex, uint limit) public view returns(uint[] memory){
        uint[] memory fullArray = tokenHedges[_token];
        require(startIndex < fullArray.length, "Start index exceeds array length");
        uint endIndex = startIndex + limit > fullArray.length ? fullArray.length : startIndex + limit;
        uint actualLimit = endIndex - startIndex;
        uint[] memory subset = new uint[](actualLimit);
        for (uint i = 0; i < actualLimit; i++) {
            subset[i] = fullArray[startIndex + i];
        }
        return subset;
    }

    function getHedgeDetails(uint256 _optionId) public view returns (hedgingOption memory) {
        hedgingOption memory hedge = hedgeMap[_optionId];
        require(hedge.owner != address(0), "Option does not exist");
        return hedge;
    }

    //iterate array from index x to y
    function getHedgesFromXY(address token, uint x, uint y) public view returns (uint[] memory) {
        uint[] memory result = new uint[](y - x + 1);
        for (uint i = x; i <= y; i++) {
            result[i - x] = tokenHedges[token][i];
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
      contractBalanceMap[_tokenAddress].deposited += amountIn;
      //track users added tokens
      userTokenMap[msg.sender][_tokenAddress] = true;
      // token mapped to user
      userBalance storage uto = userBalanceMap[_tokenAddress][msg.sender];
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
