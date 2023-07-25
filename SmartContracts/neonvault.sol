// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;
// NEON HEDGE - hedge any ERC20 token. borrow with any ERC20 token.
// Expanding beyonunderlying assets.

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
    struct contractBalance {
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
      uint256 createValue;
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
    mapping(address => contractBalance) public protocolBalanceMap;

    // mapping of all hedge storages by Id
    mapping(uint => hedgingOption) private hedgeMap;

    // mapping of all hedges & swaps for each erc20
    mapping(address => uint[]) private tokenHedges;
    mapping(address => uint[]) private tokenSwaps;

    // mapping of all hedges for user by Id
    mapping(address => uint[]) myhedgesHistory;
    mapping(address => uint[]) myswapsHistory;
    mapping(address => uint[]) myhedgesCreated;
    mapping(address => uint[]) myhedgesTaken;
    mapping(address => uint[]) myswapsCreated;
    mapping(address => uint[]) myswapsTaken;
    
    // mapping of all tokens transacted by user
    mapping(address => address[]) public userERC20s;
    mapping(address => address[]) public baseERC20s;

    // mapping of all protocol profits and fees collected from hedges
    mapping(address => uint256) public protocolHedgeProfitsTokens;//liquidated to bases at discount
    mapping(address => uint256) public protocolHedgeProfitsBases;
    mapping(address => uint256) public protocolHedgeFeesTokens;//liquidated to bases at discount
    mapping(address => uint256) public protocolHedgeFeesBases;
    mapping(address => uint256) public protocolHedgesCreateValue;
    mapping(address => uint256) public protocolHedgesTakenValue;
    mapping(address => uint256) public protocolHedgesCostValue;
    mapping(address => uint256) public protocolHedgesSwapsValue;
    mapping(address => uint256) public protocolHedgesOptionsValue;
    mapping(address => uint256) public protocolHedgeSettleValue;

    // other protocol analytics mappings
    mapping(address => uint256) public protocolCashierFees;
    mapping(address => uint256) public protocolTokenTaxFees; // in WETH only

    // mapping bookmarks of each user
    mapping(address => mapping(uint256 => bool)) public bookmarks;
    mapping(address => uint256[]) public bookmarkedOptions; // Array to store bookmarked optionIds for each user
    
    // all hedges
    uint[] private hedgesCreated;
    uint[] private hedgesTaken;
    uint[] private equityswapsCreated;
    uint[] private equityswapsTaken;
    
    uint public optionID;
    uint public takesCount;
    
    // fee variables
    uint256 public feeNumerator;
    uint256 public feeDenominator;

    // erc20 deposits equiv in base currencies
    uint256 public wethEquivDeposits;
    uint256 public usdtEquivDeposits;
    uint256 public usdcEquivDeposits;

    // erc20 withdrawals equiv in base currencies
    uint256 public wethEquivWithdrawals;
    uint256 public usdtEquivWithdrawals;
    uint256 public usdcEquivWithdrawals;
    
    address public feeReserveAddress;
    address public owner;

    address private constant UNISWAP_FACTORY_ADDRESS = 0xc35DADB65012eC5796536bD9864eD8773aBc74C4;
    address private constant UNISWAP_ROUTER_ADDRESS = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;
    address public wethAddress;
    address public usdtAddress;
    address public usdcAddress;
    address public neonAddress;

    event Received(address, uint);
    event onDeposit(address indexed token, uint256 indexed amount, address indexed wallet);
    event onWithdraw(address indexed token, uint256 indexed amount, address indexed wallet);
    event hedgeCreated(address indexed token, uint256 indexed optionId, uint256 amount, HedgeType hedgeType, uint256 cost);
    event hedgePurchased(address indexed token, uint256 indexed optionId, uint256 amount, HedgeType hedgeType, address buyer);
    event hedgeSettled(address indexed token, uint256 indexed optionId, uint256 amount, uint256 indexed payOff, uint256 endvalue);
    event minedHedge(uint256 optionId, address indexed miner, address indexed token, address indexed paired, uint256 tokenFee, uint256 baseFee);
    event bookmarkToggle(address indexed user, uint256 hedgeId, bool bookmarked);


    constructor() public {
      IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
      wethAddress = router.WETH();
      usdtAddress = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9; // USDT address on Arb
      usdcAddress = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d; // USDC address on Arb
      neonAddress = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d;

      feeNumerator = 3;
      feeDenominator = 1000;
      feeReserveAddress = msg.sender;
      owner = msg.sender;
    }

    function depositToken(address _token, uint256 _amount) public payable {
        require(_amount > 0, "Your attempting to transfer 0 tokens");
        
        // Deposit token to contract
        uint256 allowance = IERC20(_token).allowance(msg.sender, address(this));
        require(allowance >= _amount, "You need to set a higher allowance");
        require(IERC20(_token).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Log user balance & tokens
        userBalance storage uto = userBalanceMap[_token][msg.sender];
        uto.deposited = uto.deposited.add(_amount);
        if(uto.deposited == 0){
          userERC20s[msg.sender].push(_token);
        }
        // Log contract balance & tokens
        // protocolBalanceMap ia analytics only. userBalanceMap stores withdrawable balance
        if(protocolBalanceMap[_token].deposited == 0){
          userERC20s[address(this)].push(_token);
        }
        protocolBalanceMap[_token].deposited += _amount;
        
        // Log erc20 base equivalents
        (uint256 marketValue, address paired) = getUnderlyingValue(_token, _amount);
        if(paired == wethAddress){wethEquivDeposits += marketValue;}
        if(paired == usdtAddress){usdtEquivDeposits += marketValue;}
        if(paired == usdcAddress){usdcEquivDeposits += marketValue;}        
        
        // Emit deposit event
        emit onDeposit(_token, _amount, msg.sender);
    }

    // Neon token tax deposits in WETH only
    function depositTokenTax(address _token, uint256 _amount) public payable {
        require(_token == wethAddress, "WETH only accepted");
        require(msg.sender == neonAddress,"Depositor not allowed");
        require(_amount > 0, "Attempting to deposit 0 ETHER");
        
        userBalanceMap[_token][address(this)].deposited.add(_amount);
        // Log token tax ether before conversion to WETH
        protocolTokenTaxFees[_token] += _amount;
        
        // Log erc20 base equivalents
        wethEquivDeposits += _amount;    
        
        // Emit deposit event
        emit onDeposit(_token, _amount, msg.sender);
    }

    function withdrawToken(address token, uint256 amount) public {
        userBalance storage uto = userBalanceMap[token][msg.sender];
        uint256 withdrawable = getWithdrawableBalance(token, msg.sender);
        require(amount <= withdrawable && amount > 0, "You have Insufficient available balance");
        require(msg.sender != address(this), "Not allowed");

        // Update user's withdrawn balance
        uint256 tokenFee;
        if(token == wethAddress || token == usdtAddress || token == usdcAddress) {
            tokenFee = calculateFee(amount) / 10;
        }
        uto.withdrawn = uto.withdrawn.add(amount);
        require(IERC20(token).transfer(msg.sender, amount - tokenFee), "Transfer failed");

        // log protocol cashier fees
        if(tokenFee > 0) {
            protocolCashierFees[token].add(tokenFee);
            userBalanceMap[token][address(this)].deposited.add(tokenFee);
        }

        //--for erc20 base equivalent
        (uint256 marketValue, address paired) = getUnderlyingValue(token, amount);
        if(paired == wethAddress){wethEquivWithdrawals += marketValue;}
        if(paired == usdtAddress){usdtEquivWithdrawals += marketValue;}
        if(paired == usdcAddress){usdcEquivWithdrawals += marketValue;}

        // Emit withdrawal event
        emit onWithdraw(token, amount, msg.sender);
    }

    //covers both call options and equity swaps
    //cost is in base currency or pair token
    //swap collateral must  be equal, settle function relies on this implementation here
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
        (newOption.createValue, newOption.paired) = getUnderlyingValue(token, amount);
        newOption.cost = cost;
        newOption.dt_expiry = deadline;
        newOption.dt_created = block.timestamp;
        newOption.hedgeType = tool ? HedgeType.CALL : HedgeType.SWAP;

        // Update user balances for token in hedge
        userBalance storage hto = userBalanceMap[token][msg.sender]; // Use storage instead of memory for hto
        hto.lockedinuse += amount; // Modify the property of hto directly in storage
        // Emit events and update arrays
        if (newOption.hedgeType == HedgeType.SWAP) {
            // diff maker
            require(cost >= newOption.createValue, " Swap collateral must be equal value");
            myswapsHistory[msg.sender].push(optionID);
            equityswapsCreated.push(optionID);
            myswapsCreated[msg.sender].push(optionID);
            tokenHedges[token].push(optionID);
        } else if(newOption.hedgeType == HedgeType.CALL) {
            myhedgesHistory[msg.sender].push(optionID);
            hedgesCreated.push(optionID);
            myhedgesCreated[msg.sender].push(optionID);
            tokenSwaps[token].push(optionID);         
        }

        // Log protocol analytics
        optionID++;
        protocolHedgesCreateValue[newOption.paired].add(newOption.createValue);

        // Emit
        emit hedgeCreated(token, optionID, amount, newOption.hedgeType, cost);

        locked = false;
    }

    function buyHedge(uint256 _optionId) public nonReentrant {
        require(!locked, "Function is locked");
        locked = true;
        hedgingOption storage hedge = hedgeMap[_optionId];
        userBalance storage stk = userBalanceMap[hedge.paired][msg.sender];

        // Check if the user has sufficient free base balance to buy the hedge
        require(getWithdrawableBalance(hedge.paired, msg.sender) >= hedge.cost, "Insufficient free base balance");

        // Check if option ID is valid and the buyer is not the owner of the hedge
        require(_optionId < optionID && msg.sender != hedge.owner, "Invalid option ID | Owner cant buy");

        // Update taker's lockedinuse balance
        stk.lockedinuse = stk.lockedinuse.add(hedge.cost);

        // Update hedge details
        hedge.taker = msg.sender;
        hedge.status = 2;

        // Calculate start value based on the hedge type
        (hedge.startvalue, ) = getUnderlyingValue(hedge.token, hedge.amount);
        if (hedge.hedgeType == HedgeType.CALL) {
            hedge.startvalue += hedge.cost;
        }

        // Check if start value is greater than 0
        require(hedge.startvalue > 0, "Math error whilst getting price");

        // Update hedge timestamp
        hedge.dt_started = block.timestamp;

        // Store updated structs
        userBalanceMap[hedge.paired][msg.sender] = stk;
        hedgeMap[_optionId] = hedge;

        // Update arrays and takes count
        if (hedge.hedgeType == HedgeType.SWAP) {
            myswapsHistory[msg.sender].push(_optionId);
            equityswapsTaken.push(_optionId);
            myswapsTaken[msg.sender].push(_optionId);
        } else if(hedge.hedgeType == HedgeType.CALL) {
            myhedgesHistory[msg.sender].push(_optionId);
            hedgesTaken.push(_optionId);
            myhedgesTaken[msg.sender].push(_optionId);            
        }

        // Log array of both token & base tokens involved in protocol revenue
        if(protocolHedgesTakenValue[hedge.paired] == 0){
          baseERC20s[address(this)].push(hedge.paired);
        }

        // Protocol trackers
        takesCount += 1;
        protocolHedgesTakenValue[hedge.paired].add(hedge.startvalue);
        protocolHedgesCostValue[hedge.paired].add(hedge.cost);
        if (hedge.hedgeType == HedgeType.SWAP) {
            protocolHedgesSwapsValue[hedge.paired].add(hedge.startvalue);
        } else if(hedge.hedgeType == HedgeType.CALL) {
            protocolHedgesOptionsValue[hedge.paired].add(hedge.startvalue);
        }

        // Emit the hedgePurchased event
        emit hedgePurchased(hedge.token, _optionId, hedge.amount, hedge.hedgeType, msg.sender);

        // Unlock the function
        locked = false;
    }
    
    //settle hedge
    //this is a variable loss approach not textbook maximum loss approach, as calculated using 'getOptionValue' function
    //strike value is determined by creator, thus pegging a strike price inherently. Start value is set when hedge is taken
    //for options cost is non-refundable i.e. remains in lockedinuse for taker 
    //for swaps the cost is the underlying value when hedge was created, this acts as collateral rather than hedge cost
    //funds moved from locked in use to deposit balances for both parties, settlement in base or equivalent underlying tokens
    //fees are collected on base tokens; if option cost was paid to owner as winning, if swap cost used as PayOff
    //fees are collected on underlying tokens; if option and swap PayOffs were done in underlying tokens
    //hedge fees are collected into address(this) userBalanceMap and manually distributed as dividents to a staking contract
    //miners are the ones who settle hedges. Stake tokens to be able to mine hedges.
    //miners can pick hedges with tokens and amounts they wish to mine & avoid accumulating mining rewards in unwanted tokens
    //miner dust can be deposited into mining dust liquidation pools that sell the tokens at a discount & miners claim their share
    struct HedgeInfo {
        uint256 startValue;
        uint256 underlyingValue;
        uint256 payOff;
        uint256 priceNow;
        uint256 tokensDue;
        uint256 tokenFee;
        uint256 baseFee;
        bool isPayoffOverCost;
    }
    function settleHedge(uint256 _optionId) external {
        HedgeInfo memory hedgeInfo;
        require(_optionId < optionID, "Invalid option ID");
        hedgingOption storage option = hedgeMap[_optionId];
        require(block.timestamp >= option.dt_expiry, "Option has not expired");

        // Initialize local variables
        hedgeInfo.startValue = option.startvalue;
        (hedgeInfo.underlyingValue, ) = getUnderlyingValue(option.token, option.amount);
        
        // Get the user balances for the owner, taker, and contract
        userBalance storage oti = userBalanceMap[option.paired][option.owner];
        userBalance storage otiU = userBalanceMap[option.token][option.owner];
        userBalance storage tti = userBalanceMap[option.paired][option.taker];
        userBalance storage ttiU = userBalanceMap[option.token][option.taker];
        userBalance storage ccBT = userBalanceMap[option.paired][address(this)];
        userBalance storage ccUT = userBalanceMap[option.token][address(this)];
        userBalance storage minrT = userBalanceMap[option.token][address(this)];
        userBalance storage minrB = userBalanceMap[option.paired][address(this)];

        hedgeInfo.baseFee = calculateFee(option.cost);

        if (option.hedgeType == HedgeType.CALL) {
            hedgeInfo.isPayoffOverCost = hedgeInfo.underlyingValue > hedgeInfo.startValue.add(option.cost);
            if (hedgeInfo.isPayoffOverCost) {
                // Taker profit in base = underlying - cost - strikevalue
                hedgeInfo.payOff = hedgeInfo.underlyingValue.sub(hedgeInfo.startValue.add(option.cost));
                // Convert to equiv tokens lockedinuse by owner, factor fee
                (hedgeInfo.priceNow, ) = getUnderlyingValue(option.token, 1);
                hedgeInfo.tokensDue = hedgeInfo.payOff.div(hedgeInfo.priceNow);
                hedgeInfo.tokenFee = calculateFee(hedgeInfo.tokensDue);                
                // Move money - in underlying, take full gains from owner, credit taxed amount to taker, pocket difference
                // ********** Motion to have lockedinuse not decremented when a party loses
                // this is because if we decrement that withdrawable balance increases
                // we do not decrement lockinuse for losing party, this locks the tokens forever. 
                // we then credit the tokens to winners deposited balance
                ttiU.deposited += hedgeInfo.tokensDue.sub(hedgeInfo.tokenFee);
                // Move money - pay cost to owner from taker. lockedinuse lock principle
                oti.deposited += option.cost.sub(hedgeInfo.baseFee);
                // Restore initials - for owner, lock the loss only using lockedinuse. for taker option cost is not repaid
                otiU.lockedinuse -= option.amount - hedgeInfo.tokensDue;
                // Move money - credit taxes in both, as profit is in underlying and cost is in base
                ccUT.deposited += (hedgeInfo.tokenFee * 85).div(100);
                ccBT.deposited += (hedgeInfo.baseFee * 85).div(100);
                // Miner fee - 15% of protocol fee for settling option. Mining call options always comes with 2 token fees
                minrT.deposited += (hedgeInfo.tokenFee * 15).div(100);
                minrB.deposited += (hedgeInfo.baseFee * 15).div(100);
            } else {
                // Move money - maximum loss of base cost to taker only, owner loses nothing. lockedinuse principle applies
                oti.deposited += option.cost.sub(hedgeInfo.baseFee);
                // Restore initials - underlying collateral to owner. none to taker as cost always lost in options
                oti.lockedinuse -= option.amount;
                // Move money - credit base fees only as profit and cost is in base. 
                ccBT.deposited += (hedgeInfo.baseFee * 85).div(100);
                // Miner fee - 15% of protocol fee for settling option
                minrB.deposited += (hedgeInfo.baseFee * 15).div(100);
            }
        } else if (option.hedgeType == HedgeType.SWAP) {
            if (hedgeInfo.underlyingValue > hedgeInfo.startValue) {
                hedgeInfo.payOff = hedgeInfo.underlyingValue.sub(hedgeInfo.startValue);
                // Max loss config
                if (hedgeInfo.payOff > option.cost) {
                    hedgeInfo.payOff = option.cost;
                }
                // Taker gains underlying tokens equiv
                (hedgeInfo.priceNow, ) = getUnderlyingValue(option.token, 1);
                hedgeInfo.tokensDue = hedgeInfo.payOff.div(hedgeInfo.priceNow);
                hedgeInfo.tokenFee = calculateFee(hedgeInfo.tokensDue);
                // Move money - in underlying, take full gains from owner, credit taxed amount to taker, pocket difference
                // ********** Motion to have lockedinuse not decremented when a party loses
                // this is because if we decrement that withdrawable balance increases
                // we do not decrement lockinuse for losing party, this locks the tokens forever. 
                // we then credit the tokens to winners deposited balance
                ttiU.deposited += hedgeInfo.tokensDue.sub(hedgeInfo.tokenFee);
                // Restore initials - for owner, lock the loss only using lockedinuse. for taker restore full cost in base
                otiU.lockedinuse -= option.amount.sub(hedgeInfo.tokensDue);
                tti.lockedinuse -= option.cost;
                // Move money - take taxes from winnings in underlying. none in base coz taker won underlying tokens
                ccUT.deposited += (hedgeInfo.tokenFee * 85).div(100);
                // Miner fee - 15% of protocol fee for settling option. none in base coz taker won underlying tokens
                minrT.deposited += (hedgeInfo.tokenFee * 15).div(100);
            } else {
                // Move money - equivalent loss of base cost to taker only, owner loses nothing
                hedgeInfo.payOff = hedgeInfo.startValue.sub(hedgeInfo.underlyingValue);
                // Max loss config
                if (hedgeInfo.payOff > option.cost) {
                    hedgeInfo.payOff = option.cost;
                }
                // taker losses equivalent cost (payoff) in base to owner. 
                // lockedinuse principle applies, lost tokens locked forever
                oti.deposited += hedgeInfo.payOff.sub(hedgeInfo.baseFee);
                // Restore initials - for owner, all underlying tokens. For taker, cost in base less payoff that was locked forever
                otiU.lockedinuse -= option.amount;
                tti.lockedinuse -= option.cost.sub(hedgeInfo.payOff);
                // Move money - winnings in base so only base fees credited
                ccBT.deposited += (hedgeInfo.baseFee * 85).div(100);
                // Miner fee - 15% of protocol fee for settling option. none in underlying tokens
                minrB.deposited += (hedgeInfo.baseFee * 15).div(100);
            }
        }
        // Log analytics
        logAnalyticsFees(option.token, hedgeInfo.tokenFee, hedgeInfo.baseFee, hedgeInfo.tokensDue, option.cost, hedgeInfo.underlyingValue);
        
        // Update hedge
        option.status = 3;
        option.endvalue = hedgeInfo.underlyingValue;
        option.dt_settled = block.timestamp;

        // Emit
        emit hedgeSettled(option.token, _optionId, option.amount, hedgeInfo.payOff, hedgeInfo.underlyingValue);
        emit minedHedge(_optionId, msg.sender, option.token, option.paired, hedgeInfo.tokenFee, hedgeInfo.baseFee);
    }

    // Log Analytics
    // - total profit to protocol
    // - total profit to miner
    // - split in weth, usdc, usdt
    // - use userBalanceMap to get raw revenue balances and populate sums frontend
    function logAnalyticsFees(address token, uint256 tokenFee, uint256 baseFee, uint256 tokenProfit, uint256 baseProfit, uint256 endValue) internal {
       (address paired, ) = getPairAddressZK(token);
        protocolHedgeProfitsTokens[token].add(tokenProfit);
        protocolHedgeProfitsBases[paired].add(baseProfit);
        protocolHedgeFeesTokens[token].add(tokenFee);
        protocolHedgeFeesBases[paired].add(baseFee);
        protocolHedgeSettleValue[paired].add(endValue);
    }

    // Utility functions
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

    // Toggle a bookmark for a Hedge by its ID
    function bookmarkHedge(uint256 _optionId) public {
        bool bookmarked = bookmarks[msg.sender][_optionId];
        bookmarks[msg.sender][_optionId] = !bookmarked;
        emit bookmarkToggle(msg.sender, _optionId, !bookmarked);
        // Update the bookmarkedOptions array for the user
        if (!bookmarked) {
            bookmarkedOptions[msg.sender].push(_optionId);
        } else {
            uint256[] storage options = bookmarkedOptions[msg.sender];
            for (uint256 i = 0; i < options.length; i++) {
                if (options[i] == _optionId) {
                    // Remove the optionId from the bookmarkedOptions array
                    if (i < options.length - 1) {
                        options[i] = options[options.length - 1];
                    }
                    options.pop();
                    break;
                }
            }
        }
    }

    // Get Bookmarks
    function getBookmark(address user, uint256 _optionId) public view returns (bool) {
        return bookmarks[user][_optionId];
    }

    function getmyBookmarks(address user) public view returns (uint256[] memory) {
        return bookmarkedOptions[user];
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
    
    // balance of tokens on protocol
    function getWithdrawableBalance(address token, address user) public view returns (uint256) {
      userBalance memory uto = userBalanceMap[token][address(user)];
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

    // get analytics - hedge created value; weth, usdt, usdc
    function getHedgesCreatedValue() public view returns (uint256, uint256, uint256) {
        return (protocolHedgesCreateValue[wethAddress], protocolHedgesCreateValue[usdtAddress], protocolHedgesCreateValue[usdcAddress]);
    }
    function getHedgesTakenValue() public view returns (uint256, uint256, uint256) {
        return (protocolHedgesTakenValue[wethAddress], protocolHedgesTakenValue[usdtAddress], protocolHedgesTakenValue[usdcAddress]);
    }
    function getHedgesCostValue() public view returns (uint256, uint256, uint256) {
        return (protocolHedgesCostValue[wethAddress], protocolHedgesCostValue[usdtAddress], protocolHedgesCostValue[usdcAddress]);
    }
    function getHedgesOptionsValue() public view returns (uint256, uint256, uint256) {
        return (protocolHedgesOptionsValue[wethAddress], protocolHedgesOptionsValue[usdtAddress], protocolHedgesOptionsValue[usdcAddress]);
    }
    function getHedgesSwapsValue() public view returns (uint256, uint256, uint256) {
        return (protocolHedgesSwapsValue[wethAddress], protocolHedgesSwapsValue[usdtAddress], protocolHedgesSwapsValue[usdcAddress]);
    }
    function getHedgesSettledValue() public view returns (uint256, uint256, uint256) {
        return (protocolHedgeSettleValue[wethAddress], protocolHedgeSettleValue[usdtAddress], protocolHedgeSettleValue[usdcAddress]);
    }
    function getHedgesProfitsValue() public view returns (uint256, uint256, uint256) {
        return (protocolHedgeProfitsBases[wethAddress], protocolHedgeProfitsBases[usdtAddress], protocolHedgeProfitsBases[usdcAddress]);
    }
    function getHedgesFeesValue() public view returns (uint256, uint256, uint256) {
        return (protocolHedgeFeesBases[wethAddress], protocolHedgeFeesBases[usdtAddress], protocolHedgeFeesBases[usdcAddress]);
    }
    function getProtocolRevenue() public view returns (uint256, uint256, uint256) {
        return (userBalanceMap[wethAddress][address(this)].deposited, userBalanceMap[usdtAddress][address(this)].deposited, userBalanceMap[usdcAddress][address(this)].deposited);
    }
    function getProtocolRevenueERC20(address token) public view returns (uint256) {
        return (userBalanceMap[token][address(this)].deposited);
    }
    // Cashier fees on base tokens only
    function getCashierFeesValue() public view returns (uint256, uint256, uint256) {
        return (protocolCashierFees[wethAddress], protocolCashierFees[usdtAddress], protocolCashierFees[usdcAddress]);
    }
    function getTokenTaxesValue() public view returns (uint256) {// returns weth only
        return (protocolTokenTaxFees[wethAddress]);
    }
    // Distributed revenue; withdrawn to staking contract for revenue
    function getTotalDistributed() public view returns (uint256) {
        return (userBalanceMap[wethAddress][address(this)].withdrawn);
    }
    // Contract balances for token
    function getContractTokenBalances(address _token) public view returns (uint256, uint256) {
        return (userBalanceMap[_token][address(this)].deposited, userBalanceMap[_token][address(this)].withdrawn);
    }
    // Contract base balances
    function getErc20Deposits() public view returns (uint256,uint256,uint256) {
      return (wethEquivDeposits, usdtEquivDeposits, usdcEquivDeposits);
    }
    // Contract base balances
    function getErc20Withdrawals() public view returns (uint256,uint256,uint256) {
      return (wethEquivWithdrawals, usdtEquivWithdrawals, usdcEquivWithdrawals);
    }

    // Users token balances
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

    function getUserSwapsCreated(address user, uint startIndex, uint limit) public view returns(uint[] memory){
        uint[] memory fullArray = myswapsCreated[user];
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

    function getUserSwapsTaken(address user, uint startIndex, uint limit) public view returns(uint[] memory){
        uint[] memory fullArray = myswapsTaken[user];
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

    /* all swaps created: targeted search
    ~ startIndex is used to specify the starting index in the equityswapsCreated array, 
    ~ and limit is used to determine the number of items to search. 
    ~ The loop iterates from startIndex to startIndex + limit (exclusive) 
    ~ and populates the result array with the values from equityswapsCreated array starting from index startIndex to startIndex + limit - 1. 
    ~ The startIndex is used to calculate the correct index in the result array by subtracting it from the loop variable i. 
    ~ Additionally, a check is added to ensure that startIndex is within the bounds of the equityswapsCreated array using a require statement.
    */
    function getAllSwaps(uint startIndex, uint limit) public view returns (uint[] memory) {
        require(startIndex < equityswapsCreated.length, "Invalid start index");
        uint[] memory allSwaps = equityswapsCreated;
        uint[] memory result = new uint[](limit);
        for (uint i = startIndex; i < startIndex + limit && i < allSwaps.length; i++) {
            result[i - startIndex] = allSwaps[i];
        }
        return result;
    }

    /* all swaps taken: targeted search
    ~ startIndex is used to specify the starting index in the equityswapsTaken array, 
    ~ and limit is used to determine the number of items to search. 
    ~ The loop iterates from startIndex to startIndex + limit (exclusive) 
    ~ and populates the result array with the values from equityswapsTaken array starting from index startIndex to startIndex + limit - 1. 
    ~ The startIndex is used to calculate the correct index in the result array by subtracting it from the loop variable i. 
    ~ Additionally, a check is added to ensure that startIndex is within the bounds of the equityswapsTaken array using a require statement.
    */
    function getAllSwapsTaken(uint startIndex, uint limit) public view returns (uint[] memory) {
        require(startIndex < equityswapsTaken.length, "Invalid start index");
        uint[] memory allSwapsTaken = equityswapsTaken;
        uint[] memory result = new uint[](limit);
        for (uint i = startIndex; i < startIndex + limit && i < allSwapsTaken.length; i++) {
            result[i - startIndex] = allSwapsTaken[i];
        }
        return result;
    }

    //deposited tokens
    function getDepositedTokens() external view returns (address[] memory) {
        return userERC20s[address(this)];
    }

    //get deposited tokens count
    function getDepositedTokensLength() external view returns (uint) {
        return userERC20s[address(this)].length;
    }

    //get all hedges count
    function getAllHedgesLength() public view returns (uint256) {
        return hedgesCreated.length;
    }

    //get all equity swaps count
    function getAllSwapsLength() public view returns (uint256) {
        return equityswapsCreated.length;
    }

    //get user hedges count
    function getUserHedgesLength(address user) public view returns (uint256) {
        return myhedgesHistory[user].length;
    }

    //get user equity swaps count
    function getUserSwapsLength(address user) public view returns (uint256) {
        return myswapsHistory[user].length;
    }

    //hedges count under specific token
    function getHedgesForTokenCount(address _token) public view returns (uint256) {
        return tokenHedges[_token].length;
    }

    //swaps count under specific token
    function getSwapsForTokenCount(address _token) public view returns (uint256) {
        return tokenSwaps[_token].length;
    }

    /* hedges list under specific ERC20 address: targeted search
    ~ the startIndex parameter is used to specify the starting index of the array, 
    ~ and the limit parameter is used to determine the number of items to include in the result. 
    ~ The endIndex is calculated as the minimum value between startIndex + limit and the length of the full array to ensure that it does not exceed the array bounds. 
    ~ Then, the actualLimit is calculated as the difference between endIndex and startIndex, 
    ~ which represents the actual number of items in the result array. 
    ~ Finally, the subset array is populated with the elements from the fullArray using the calculated indices based on startIndex and actualLimit.
    */
    function getHedgesForToken(address _token, uint startIndex, uint limit) public view returns(uint[] memory){
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

     function getSwapsForToken(address _token, uint startIndex, uint limit) public view returns(uint[] memory){
        uint[] memory fullArray = tokenSwaps[_token];
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

    //iterate users hedges from index x to y
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
    function getmySwapsFromXY(address user, uint x, uint y, bool arrayType) public view returns (uint[] memory) {
        uint[] memory result = new uint[](y - x + 1);
        for (uint i = x; i <= y; i++) {
          if(arrayType){
            result[i - x] = myswapsCreated[user][i];
          }else{
            result[i - x] = myswapsTaken[user][i];
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
      protocolBalanceMap[_tokenAddress].deposited += amountIn;
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
