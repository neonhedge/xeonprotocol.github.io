// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;

// NEON Protocol - ERC20 based tools for hedging and lending.
// Deposit, Withdraw ERC20 tokens
// Get underlying value for tokens in WETH, USDT AND USDC
// Create, Take Call Options, Put Options and Equity Swaps OTC
// Settle trade in base or underlying value equivalent on maturity
// Payout profits and fees to parties, protocol, miner
// Distribute revenue or third party service stakes
// Read hedging data storages; array lists, individual mappings and structs, collective mappings and variables

//  Functionality targets
//1. to receive any ERC20 token as collateral/underlying tokens
//2. Price tokens in base currency via getUnderlyingValue
//4. enable hedge writing using tokens as underlying assets
//5. enable hedge buying in base currency for stipulated duration
//6. settlement based on price of assets in comparison to strike value & terms
//7. allow settle-now or topup-topup consensus between parties during a deal
//8. payment and logging of proceeds, fees and commissions for protocol and parties involved
//9. read smart contract data on wallet balances, hedge activity, revenue logs

// key functions list
// - deposit
// - withdraw
// - get pair addresses of all erc20
// - get underlying value of all erc20
// - cashier fees calculation
// - create hedge
// - buy hedge
// - settlement
// - mine hedges / deals
// - revenue and fees logging for all stakeholders
// - get hedge details by id
// - fetch hedges array; created, taken, settled

// key dependencies
// 1. getReserves - Uniswap
// 2. getPair - Uniswap
// 3. getPairAddressZK - Custom
// 4. getUnderlyingValue - Custom

//dev notes
// - addresses can deposit or withdraw erc20 tokens 
// - all tokens are treated as ERC20
// - uniswap version 2 router is used in beta protocol
// - deposits, lockedinuse and withdrawals track wallets balances
// - lockedinuse is the current account (+-) on trades, and acts as escrow for each deal
// - only base currencies :weth, usdt and usdc contract balance tracked
// - getUnderlyingValue fetches value of tokens & returns base value & pair address
// - unified writing, taking and settlement functions for all hedge types
// - each hedge is taxed upon settlement, in relevant tokens (base or underlying)
// - contract taxes credited in mappings under address(this) and send out to staking/rewards contract
// - optionID / optionId used loosely to refer to all hedge types: swaps, call, put

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
        uint256 withdrawn; // incremented on successful withdrawal
        uint256 lockedinuse; // adjust on deal creation or buy or settle
    }
    struct contractBalance {
        uint256 deposited;
        uint256 withdrawn;
    }
    struct hedgingOption {
        bool topupConsent;
        bool zapTaker;
        bool zapWriter;
        address owner;
        address taker;
        address token;
        address paired;
        uint status; //0 - none, 1 - created, 2 - taken, 3 - settled
        uint256 amount;
        uint256 createValue;
        uint256 startValue;
        uint256 strikeValue;
        uint256 endValue;
        uint256 cost;
        uint256 dt_created;
        uint256 dt_started;
        uint256 dt_expiry;
        uint256 dt_settled;
        HedgeType hedgeType;
        uint256 [] topupRequests;
    }
    enum HedgeType {CALL, PUT, SWAP}

    struct userPL{
        uint256 profits;
        uint256 losses;
    }

    struct topupData {
        uint256 amountWriter;
        uint256 amountTaker;
        uint256 requestTime;
        uint256 acceptTime;
        uint256 rejectTime;
        uint state; // 0 - requested, 1 accepted, 2 rejected
    }

    // mapping of wallet token balances [token][user]
    mapping(address => mapping(address => userBalance)) private userBalanceMap;

    //mapping of user-hedge-Ids array for each erc20 token
    mapping(address => mapping(address => uint[])) private userHedgesForTokenMap;

    // mapping of wallet profit & loss [pair][user]
    mapping(address => mapping(address => userPL)) private userPLMap;

    // track all erc20 deposits and withdrawals to contract
    mapping(address => contractBalance) public protocolBalanceMap;

    // mapping of all hedge storages by Id
    mapping(uint => hedgingOption) private hedgeMap;

    // mapping topup requests 
    mapping(uint => topupData) public topupMap;

    // mapping of all hedges & swaps for each erc20
    mapping(address => uint[]) private tokenOptions;
    mapping(address => uint[]) private tokenSwaps;

    // mapping of all hedges for user by Id
    mapping(address => uint[]) myoptionsHistory;
    mapping(address => uint[]) myswapsHistory;
    mapping(address => uint[]) myoptionsCreated;
    mapping(address => uint[]) myoptionsTaken;
    mapping(address => uint[]) myswapsCreated;
    mapping(address => uint[]) myswapsTaken;
    
    // mapping of all tokens transacted by user
    mapping(address => address[]) public userERC20s;
    mapping(address => address[]) public baseERC20s;

    // mapping of all protocol profits and fees collected from hedges
    mapping(address => uint256) public protocolProfitsTokens;//liquidated to bases at discount
    mapping(address => uint256) public protocolBaseProfits;
    mapping(address => uint256) public protocolFeesTokens;//liquidated to bases at discount
    mapping(address => uint256) public protocolBaseFees;
    mapping(address => uint256) public hedgesCreatedVolume;//volume saved in paired currency
    mapping(address => uint256) public hedgesTakenVolume;
    mapping(address => uint256) public hedgesCostVolume;
    mapping(address => uint256) public swapsVolume;
    mapping(address => uint256) public optionsVolume;
    mapping(address => uint256) public settledVolume;

    // more volume mappings
    mapping(address => uint256) public protocolCashierFees;
    mapping(address => uint256) public wethEquivUserHedged;
    mapping(address => uint256) public usdtEquivUserHedged;
    mapping(address => uint256) public usdcEquivUserHedged;
    mapping(address => uint256) public wethEquivUserCosts;
    mapping(address => uint256) public usdtEquivUserCosts;
    mapping(address => uint256) public usdcEquivUserCosts;    

    // mapping bookmarks of each user
    mapping(address => mapping(uint256 => bool)) public bookmarks;
    mapping(address => uint256[]) public bookmarkedOptions; // Array to store bookmarked optionIds for each user
    
    // all hedges
    uint[] private optionsCreated;
    uint[] private hedgesTaken;
    uint[] private equityswapsCreated;
    uint[] private equityswapsTaken;
    
    // global counters
    uint public optionID;
    uint public topupRequestIDuestID;
    uint public topupRequestID;
    
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
    
    // core addresses
    address private constant UNISWAP_FACTORY_ADDRESS = 0xc35DADB65012eC5796536bD9864eD8773aBc74C4;
    address private constant UNISWAP_ROUTER_ADDRESS = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;
    address public wethAddress;
    address public usdtAddress;
    address public usdcAddress;
    address public neonAddress;
    address public owner;

    //events
    event Received(address, uint);
    event onDeposit(address indexed token, uint256 indexed amount, address indexed wallet);
    event onWithdraw(address indexed token, uint256 indexed amount, address indexed wallet);
    event hedgeCreated(address indexed token, uint256 indexed optionId, uint256 amount, HedgeType hedgeType, uint256 cost);
    event hedgePurchased(address indexed token, uint256 indexed optionId, uint256 startValue, HedgeType hedgeType, address buyer);
    event hedgeSettled(address indexed token, uint256 indexed optionId, uint256 amount, uint256 indexed payOff, uint256 endValue);
    event minedHedge(uint256 optionId, address indexed miner, address indexed token, address indexed paired, uint256 tokenFee, uint256 baseFee);
    event bookmarkToggle(address indexed user, uint256 hedgeId, bool bookmarked);
    event topupRequested(address indexed party, uint256 indexed hedgeId, uint256 topupAmount, bool consent);
    event zapRequested(uint indexed hedgeId, address indexed party);

    constructor() public {
        IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
        wethAddress = router.WETH();
        usdtAddress = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9; // USDT address on Arb
        usdcAddress = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d; // USDC address on Arb
        neonAddress = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d;
        // variables
        feeNumerator = 5;
        feeDenominator = 1000;
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
        // Log new token address
        // protocolBalanceMap ia analytics only. userBalanceMap stores withdrawable balance
        if(protocolBalanceMap[_token].deposited == 0){
          userERC20s[address(this)].push(_token);
        }
        protocolBalanceMap[_token].deposited += _amount;
        
        // Log main base equivalents
        (uint256 marketValue, address paired) = getUnderlyingValue(_token, _amount);
        if(paired == wethAddress){wethEquivDeposits += marketValue;}
        if(paired == usdtAddress){usdtEquivDeposits += marketValue;}
        if(paired == usdcAddress){usdcEquivDeposits += marketValue;}        
        
        // Emit deposit event
        emit onDeposit(_token, _amount, msg.sender);
    }

    function withdrawToken(address token, uint256 amount) public {
        userBalance storage uto = userBalanceMap[token][msg.sender];
        uint256 withdrawable = getWithdrawableBalance(token, msg.sender);
        require(amount <= withdrawable && amount > 0, "You have Insufficient available balance");
        require(msg.sender != address(this), "Not allowed");

        // Tax withdrawals on bases only; WETH, USDT, USDC. 1/10 of settle tax
        uint256 tokenFee;
        if(token == wethAddress || token == usdtAddress || token == usdcAddress) {
            tokenFee = calculateFee(amount) / 10;
        }
        if(tokenFee > 0) {
            protocolCashierFees[token].add(tokenFee);
            userBalanceMap[token][address(this)].deposited.add(tokenFee);
        }
        // Withdraw
        uto.withdrawn = uto.withdrawn.add(amount);
        require(IERC20(token).transfer(msg.sender, amount - tokenFee), "Transfer failed");

        // Log main base value equivalents
        (uint256 marketValue, address paired) = getUnderlyingValue(token, amount);
        if(paired == wethAddress){wethEquivWithdrawals += marketValue;}
        if(paired == usdtAddress){usdtEquivWithdrawals += marketValue;}
        if(paired == usdcAddress){usdcEquivWithdrawals += marketValue;}

        // Emit withdrawal event
        emit onWithdraw(token, amount, msg.sender);
    }

    // Create Hedge: covers both call options and equity swaps. put options to be enabled in Beta V2
    //cost is in base currency or pair token
    //swap collateral must  be equal, settle function relies on this implementation here
    //put options will have amax loss check to only accept a strike price 50% away max
    function createHedge(uint tool, address token, uint256 amount, uint256 cost, uint256 deadline) public nonReentrant {
        require(!locked, "Function is locked");
        locked = true;
        require(tool <= 2 && amount > 0 && cost > 0 && deadline > block.timestamp, "Invalid option parameters");
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
        if (tool == 0) {
            newOption.hedgeType = HedgeType.CALL;
        } else if (tool == 1) {
            newOption.hedgeType = HedgeType.PUT;
        } else if (tool == 2) {
            newOption.hedgeType = HedgeType.SWAP;
        } else {
            revert("Invalid tool option");
        }

        // Update user balances for token in hedge
        userBalance storage hto = userBalanceMap[token][msg.sender]; 
        hto.lockedinuse += amount;
        // Update arrays
        if (newOption.hedgeType == HedgeType.SWAP) {
            require(cost >= newOption.createValue, " Swap collateral must be equal value");
            myswapsHistory[msg.sender].push(optionID);
            myswapsCreated[msg.sender].push(optionID);
            equityswapsCreated.push(optionID);
            tokenOptions[token].push(optionID);
        } else {
            myoptionsHistory[msg.sender].push(optionID);
            myoptionsCreated[msg.sender].push(optionID);
            optionsCreated.push(optionID);
            tokenSwaps[token].push(optionID);
        }
        // Log protocol analytics
        optionID++;
        hedgesCreatedVolume[newOption.paired].add(newOption.createValue);

        // Wallet hedge volume in main bases only
        if(newOption.paired == wethAddress){wethEquivUserHedged[msg.sender] += newOption.createValue;}
        if(newOption.paired == usdtAddress){usdtEquivUserHedged[msg.sender] += newOption.createValue;}
        if(newOption.paired == usdcAddress){usdcEquivUserHedged[msg.sender] += newOption.createValue;}

        // Emit
        emit hedgeCreated(token, optionID, amount, newOption.hedgeType, cost);
        locked = false;
    }

    // DRAFT - FUNCTION TO ADD/REMOVE TOKENS TO BASKET; TOKEN & AMOUNT
    // > mapping inside hedge struct, with tokenaddress & amount, 3 slots max allowed when adding
    // > same mapping is checked & iterated on settlement whilst deducting from totalPayOff 
    // > only same pair tokens can be in same basket, this brings settlement efficiency when iterating as above
    // > consider limiting the basket feature to loans only where its relevant not with hedges
    // DRAFT - FUNCTION TO EDIT HEDGE; COST, STRIKE, DURATION ONLY BEFORE ITS TAKEN

    // Hedges are bought in base or paired currency of underlying token
    // For Call and Put Options cost is premium, lockedinuse here but paid out on settlement
    // For Equity Swaps cost is equal to underlying value as 100% collateral is required. There is no premium
    // Strike value is not set here, maturity calculations left to the settlement function
    function buyHedge(uint256 _optionId) public nonReentrant {
        require(!locked, "Function is locked");
        locked = true;
        hedgingOption storage hedge = hedgeMap[_optionId];
        userBalance storage stk = userBalanceMap[hedge.paired][msg.sender];
        require(getWithdrawableBalance(hedge.paired, msg.sender) >= hedge.cost, "Insufficient free base balance");
        require(_optionId < optionID && msg.sender != hedge.owner, "Invalid option ID | Owner cant buy");
       
        // Calculate, check and update start value based on the hedge type
        (hedge.startValue, ) = getUnderlyingValue(hedge.token, hedge.amount);
        if (hedge.hedgeType == HedgeType.SWAP) {
            hedge.startValue += hedge.cost;
        }
        require(hedge.startValue > 0, "Math error whilst getting price");
        stk.lockedinuse = stk.lockedinuse.add(hedge.cost);
        hedge.dt_started = block.timestamp;
        hedge.taker = msg.sender;
        hedge.status = 2;
        // Store updated structs
        userBalanceMap[hedge.paired][msg.sender] = stk;
        hedgeMap[_optionId] = hedge;
        // Update arrays and takes count
        if (hedge.hedgeType == HedgeType.SWAP) {
            myswapsHistory[msg.sender].push(_optionId);
            equityswapsTaken.push(_optionId);
            myswapsTaken[msg.sender].push(_optionId);
        } else if(hedge.hedgeType == HedgeType.CALL) {
            myoptionsHistory[msg.sender].push(_optionId);
            hedgesTaken.push(_optionId);
            myoptionsTaken[msg.sender].push(_optionId);            
        }
        // Log base tokens involved in protocol revenue
        if(hedgesTakenVolume[hedge.paired] == 0){
            baseERC20s[address(this)].push(hedge.paired);
        }
        // Protocol Revenue Trackers
        hedgesTakenVolume[hedge.paired].add(hedge.startValue);
        hedgesCostVolume[hedge.paired].add(hedge.cost);
        if (hedge.hedgeType == HedgeType.SWAP) {
            swapsVolume[hedge.paired].add(hedge.startValue);
        } else if(hedge.hedgeType == HedgeType.CALL) {
            optionsVolume[hedge.paired].add(hedge.startValue);
        }
        // Wallet hedge volume analytics in main bases only
        if(hedge.paired == wethAddress){wethEquivUserCosts[msg.sender] += hedge.startValue;}
        if(hedge.paired == usdtAddress){usdtEquivUserCosts[msg.sender] += hedge.startValue;}
        if(hedge.paired == usdcAddress){usdcEquivUserCosts[msg.sender] += hedge.startValue;}

        // Emit the hedgePurchased event
        emit hedgePurchased(hedge.token, _optionId, hedge.startValue, hedge.hedgeType, msg.sender);
        locked = false;
    }

    // topup Request & Accept function
    // any party can initiate & accepter only matches amount
    // Action is request (false) or accept (true)
    // Request amount can be incremented if not accepted yet
    function topupHedge(uint _optionId, uint256 amount, bool action) public nonReentrant {
        hedgingOption storage hedge = hedgeMap[_optionId];
        require(msg.sender == hedge.owner || msg.sender == hedge.taker, "Invalid party to request");
        require(topupMap[topupRequestID].state == 0, "Request already accepted");

        bool requestAccept; 
        if(!action) {
            topupRequestID += 1;
            hedge.topupRequests.push(topupRequestID);
        } else {
            requestAccept = true;
            topupMap[topupRequestID].state = 1;
        }
        if (msg.sender == hedge.owner) {
            //topup underlying tokens
            require(getWithdrawableBalance(hedge.token, msg.sender) >= amount, "Insufficient token balance");
            //update lockedinuse
            userBalance storage bal = userBalanceMap[hedge.token][msg.sender];
            bal.lockedinuse = bal.lockedinuse.add(hedge.cost);
            userBalanceMap[hedge.token][msg.sender] = bal;
            //update hedge amount
            hedge.amount += amount;
            topupMap[topupRequestID].amountWriter += amount;
        } else {
            //topup base tokens
            require(getWithdrawableBalance(hedge.paired, msg.sender) >= amount, "Insufficient base balance");
            //update lockedinuse
            userBalance storage bal = userBalanceMap[hedge.paired][msg.sender];
            bal.lockedinuse = bal.lockedinuse.add(hedge.cost);
            userBalanceMap[hedge.paired][msg.sender] = bal;
            //update hedge cost
            hedge.cost += amount;
            topupMap[topupRequestID].amountTaker += amount;
        }
        emit topupRequested(msg.sender, _optionId, amount, requestAccept);
    }

    function rejectTopupRequest(uint _optionId, uint _requestID) public {
        require(topupMap[_requestID].state == 0, "Request already accepted or rejected");
        hedgingOption storage hedge = hedgeMap[_optionId];
        hedge.topupConsent = true;
        topupMap[_requestID].state = 2;
    }

    function cancelTopupRequest(uint _optionId, uint _requestID) public {
        require(topupMap[_requestID].amountTaker == 0, "Request already accepted");
        require(hedgeMap[_optionId].owner == msg.sender, "Only owner can cancel");
        hedgingOption storage hedge = hedgeMap[_optionId];
        hedge.topupConsent = true;
        topupMap[_requestID].state = 2;
    }

    function zapRequest(uint _optionId) public {  
        hedgingOption storage hedge = hedgeMap[_optionId];    
        require(msg.sender == hedge.owner || msg.sender == hedge.taker, "Invalid party to request");
        require(hedge.dt_started > block.timestamp, "Hedge has not started yet");
        if(msg.sender == hedge.owner) {
            hedge.zapWriter = true;
        } else {
            hedge.zapTaker = true;
        }
        emit zapRequested(_optionId, msg.sender);
    }
    
    //Settlement 
    //value is calculated using 'getOptionValue' function
    //strike value is determined by writer, thus pegging a strike price inherently. Start value is set when hedge is taken
    //premium is cost and paid in base currency of underlying token
    //for swaps the cost is 100% equal value to underlying start value, this acts as collateral rather than hedge premium
    //the payoff (difference between start and strike value) is paid in underlying or base
    //losses are immediately debited from withdrawn. for winner, profits are credited to deposited balance direct
    //restore initials for both parties, funds are moved from lockedinuse to deposit, reverse of creating or buying
    //fees are collected on base tokens; if option cost was paid to owner as winning, if swap cost used as PayOff
    //fees are collected on underlying tokens; if option and swap PayOffs were done in underlying tokens
    //hedge fees are collected into address(this) userBalanceMap and manually distributed as dividents to a staking contract
    //miners are the ones who settle hedges. Stake tokens to be able to mine hedges.
    //miners can pick hedges with tokens and amounts they wish to mine & avoid accumulating mining rewards in unwanted tokens
    //miner dust can be deposited into mining dust liquidation pools that sell the tokens at a discount & miners claim their share
    //each wallet has to log each token interacted with for the sake of pulling all balances credited to it on settlement. This allows for net worth valuations on wallets
    //protocol revenues are stored under userBalanceMap[address(this)] storage
    //on revenue; protocol revenue from taxing hedges ARE moved to staking contract as staking dividents
    //on revenue; proceeds for mining a hedge, are NOT moved to staking contract
    //on revenue; native equity swap liquidity proceeds ARE moved to staking contract
    //on revenue; revenue for providing native-collateral ARE transferred to staking contract
    
    struct HedgeInfo {
        uint256 underlyingValue;
        uint256 payOff;
        uint256 priceNow;
        uint256 tokensDue;
        uint256 tokenFee;
        uint256 baseFee;
        bool marketOverStart;
        bool isBelowStrikeValue;
        bool newAddressFlag;
    }

    // Settle a hedge
    function settleHedge(uint256 _optionId) external {
        HedgeInfo memory hedgeInfo;
        require(_optionId < optionID, "Invalid option ID");
        hedgingOption storage option = hedgeMap[_optionId];

        // Check if either zapWriter or zapTaker flags are true, or if the hedge has expired
        require(option.zapWriter || option.zapTaker || block.timestamp >= option.dt_expiry, "Hedge cannot be settled yet");

        // Initialize local variables
        (hedgeInfo.underlyingValue, ) = getUnderlyingValue(option.token, option.amount);

        // Get storage ready for user balances of the owner, taker, and contract
        userBalance storage oti = userBalanceMap[option.paired][option.owner];
        userBalance storage otiU = userBalanceMap[option.token][option.owner];
        userBalance storage tti = userBalanceMap[option.paired][option.taker];
        userBalance storage ttiU = userBalanceMap[option.token][option.taker];
        userBalance storage ccBT = userBalanceMap[option.paired][address(this)];
        userBalance storage ccUT = userBalanceMap[option.token][address(this)];
        userBalance storage minrT = userBalanceMap[option.token][address(this)];
        userBalance storage minrB = userBalanceMap[option.paired][address(this)];

        hedgeInfo.baseFee = calculateFee(option.cost);
        hedgeInfo.newAddressFlag = ttiU.deposited == 0;

        if (option.hedgeType == HedgeType.CALL) {
            hedgeInfo.marketOverStart = hedgeInfo.underlyingValue > option.startValue.add(option.cost);
            if (hedgeInfo.marketOverStart) {
                // Taker profit in base = underlying - cost - strike value
                hedgeInfo.payOff = hedgeInfo.underlyingValue.sub(option.startValue.add(option.cost));
                // DRAFT - for bundled underlying assets, take list of all tokens in basket & iterate payment code below until payOff is zero {
                // ..
                // ..
                    // Convert to equivalent tokens lockedInUse by owner, factor fee
                    (hedgeInfo.priceNow, ) = getUnderlyingValue(option.token, 1);
                    hedgeInfo.tokensDue = hedgeInfo.payOff.div(hedgeInfo.priceNow);
                    // Check if collateral is enough, otherwise use max balance from Owner lockedInUse
                    if (otiU.lockedinuse < hedgeInfo.tokensDue){
                        hedgeInfo.tokensDue = otiU.lockedinuse;
                    }
                    hedgeInfo.tokenFee = calculateFee(hedgeInfo.tokensDue);
                    // Move payoff - in underlying, take full gains from owner, credit taxed payoff to taker, pocket difference
                    ttiU.deposited += hedgeInfo.tokensDue.sub(hedgeInfo.tokenFee);
                    otiU.lockedinuse -= option.amount - hedgeInfo.tokensDue;
                    otiU.withdrawn += hedgeInfo.tokensDue;
                    // Restore winners collateral
                    oti.deposited += option.cost.sub(hedgeInfo.baseFee);
                    tti.lockedinuse -= option.cost;
                    tti.withdrawn += option.cost;
                    // Move cost - credit taxes in both, as profit is in underlying and cost is in base
                    ccUT.deposited += (hedgeInfo.tokenFee * 85).div(100);
                    ccBT.deposited += (hedgeInfo.baseFee * 85).div(100);
                    // Miner fee - 15% of protocol fee for settling option. Mining call options always come with 2 token fees
                    minrT.deposited += (hedgeInfo.tokenFee * 15).div(100);
                    minrB.deposited += (hedgeInfo.baseFee * 15).div(100);
                    // Log wallet PL: 0 - owner won, 1 taker won
                    logPL(hedgeInfo.payOff - calculateFee(hedgeInfo.payOff), option.paired, option.owner, option.taker, 1);
                //  ..
                //  ..
                // }
            } else {
                // Move payoff - owner wins cost & losses nothing. 
                oti.deposited += option.cost.sub(hedgeInfo.baseFee);
                tti.lockedinuse -= option.cost;
                tti.withdrawn += option.cost;
                // Restore winners collateral - underlying to owner. none to taker.
                oti.lockedinuse -= option.amount;
                // Move money - credit base fees only as the payout is in base. 
                ccBT.deposited += (hedgeInfo.baseFee * 85).div(100);
                // Miner fee - 15% of protocol fee for settling option
                minrB.deposited += (hedgeInfo.baseFee * 15).div(100);
                // Log wallet PL: 0 - owner won, 1 taker won
                logPL(option.cost.sub(hedgeInfo.baseFee), option.paired, option.owner, option.taker, 0);
            }
        } else if (option.hedgeType == HedgeType.PUT) {
            hedgeInfo.isBelowStrikeValue = hedgeInfo.underlyingValue < option.startValue.sub(option.cost);
            if (hedgeInfo.isBelowStrikeValue) {
                // Taker profit in base = strike value - underlying - cost
                hedgeInfo.payOff = option.startValue.sub(hedgeInfo.underlyingValue).sub(option.cost);
                // Convert to equivalent tokens lockedInUse by writer, factor fee
                (hedgeInfo.priceNow, ) = getUnderlyingValue(option.token, 1);
                hedgeInfo.tokensDue = hedgeInfo.payOff.div(hedgeInfo.priceNow);
                // Check if writer collateral is enough, otherwise use max balance from writer lockedInUse
                if (otiU.lockedinuse < hedgeInfo.tokensDue){
                    hedgeInfo.tokensDue = otiU.lockedinuse;
                }
                hedgeInfo.tokenFee = calculateFee(hedgeInfo.tokensDue);
                // Move payoff - in underlying, take value difference from writer, credit taxed payoff to taker, pocket difference
                ttiU.deposited += hedgeInfo.tokensDue.sub(hedgeInfo.tokenFee);
                otiU.lockedinuse -= option.amount - hedgeInfo.tokensDue;
                otiU.withdrawn += hedgeInfo.tokensDue;
                // Restore winners collateral
                oti.deposited += option.cost.sub(hedgeInfo.baseFee);
                tti.lockedinuse -= option.cost;
                tti.withdrawn += option.cost;
                // Move cost - credit taxes in both, as profit is in underlying and cost is in base
                ccUT.deposited += (hedgeInfo.tokenFee * 85).div(100);
                ccBT.deposited += (hedgeInfo.baseFee * 85).div(100);
                // Miner fee - 15% of protocol fee for settling option. Mining call options always come with 2 token fees
                minrT.deposited += (hedgeInfo.tokenFee * 15).div(100);
                minrB.deposited += (hedgeInfo.baseFee * 15).div(100);
                // Log wallet PL: 0 - owner won, 1 taker won
                logPL(hedgeInfo.payOff - calculateFee(hedgeInfo.payOff), option.paired, option.owner, option.taker, 1);
            } else {
                // Move payoff - owner wins cost & losses nothing
                oti.deposited += option.cost.sub(hedgeInfo.baseFee);
                tti.lockedinuse -= option.cost;
                tti.withdrawn += option.cost;
                // Restore winners collateral - underlying to owner. none to taker
                oti.lockedinuse -= option.amount;
                // Move money - credit base fees only as the payout is in base. 
                ccBT.deposited += (hedgeInfo.baseFee * 85).div(100);
                // Miner fee - 15% of protocol fee for settling option
                minrB.deposited += (hedgeInfo.baseFee * 15).div(100);
                // Log wallet PL: 0 - owner won, 1 taker won
                logPL(option.cost.sub(hedgeInfo.baseFee), option.paired, option.owner, option.taker, 0);
            }
        } else if (option.hedgeType == HedgeType.SWAP) {
            if (hedgeInfo.underlyingValue > option.startValue) {
                hedgeInfo.payOff = hedgeInfo.underlyingValue.sub(option.startValue);
                // Max loss config
                if (hedgeInfo.payOff > option.cost) {
                    hedgeInfo.payOff = option.cost;
                }
                // Convert equivalent in tokens
                (hedgeInfo.priceNow, ) = getUnderlyingValue(option.token, 1);
                hedgeInfo.tokensDue = hedgeInfo.payOff.div(hedgeInfo.priceNow);
                hedgeInfo.tokenFee = calculateFee(hedgeInfo.tokensDue);
                // Move money - in underlying, take full gains from owner, credit taxed amount to taker, pocket difference
                ttiU.deposited += hedgeInfo.tokensDue.sub(hedgeInfo.tokenFee);
                otiU.lockedinuse -= option.amount;
                otiU.withdrawn += hedgeInfo.tokensDue;
                // Restore winner collateral - for taker restore cost (swaps have no premium)
                tti.lockedinuse -= option.cost;
                // Move money - take taxes from profits in underlying. none in base because taker won underlying tokens
                ccUT.deposited += (hedgeInfo.tokenFee * 85).div(100);
                // Miner fee - 15% of protocol fee for settling option. none in base because taker won underlying tokens
                minrT.deposited += (hedgeInfo.tokenFee * 15).div(100);
                // Log wallet PL: 0 - owner won, 1 taker won
                logPL(hedgeInfo.payOff - calculateFee(hedgeInfo.payOff), option.paired, option.owner, option.taker, 0);
            } else {                
                hedgeInfo.payOff = option.startValue.sub(hedgeInfo.underlyingValue);
                // Max loss config
                if (hedgeInfo.payOff > option.cost) {
                    hedgeInfo.payOff = option.cost;
                }
                // Move payoff - loss of base cost to taker only, owner loses nothing
                // 1. credit equivalent payoff in base to owner
                // 2. credit takers full cost back & then debit loss using withrawn instantly
                oti.deposited += hedgeInfo.payOff.sub(hedgeInfo.baseFee);
                tti.lockedinuse -= option.cost;
                tti.withdrawn += hedgeInfo.payOff;
                // Restore winner collateral - for owner, all underlying tokens
                otiU.lockedinuse -= option.amount;
                // Move money - profits in base so only base fees credited
                ccBT.deposited += (hedgeInfo.baseFee * 85).div(100);
                // Miner fee - 15% of protocol fee for settling option. none in underlying tokens
                minrB.deposited += (hedgeInfo.baseFee * 15).div(100);
                // Log wallet PL: 0 - owner won, 1 taker won
                logPL(hedgeInfo.payOff, option.paired, option.owner, option.taker, 1);
            }
        }
        // Log analytics
        logAnalyticsFees(option.token, hedgeInfo.tokenFee, hedgeInfo.baseFee, hedgeInfo.tokensDue, option.cost, hedgeInfo.underlyingValue);
        // Update hedge
        option.status = 3;
        option.endValue = hedgeInfo.underlyingValue;
        option.dt_settled = block.timestamp;
        // catch new erc20 address so that wallet can log all underlying token balances credited to it
        // base addresses already caught on deposit by wallet
        if(hedgeInfo.tokensDue > 0 && hedgeInfo.newAddressFlag) {            
            userERC20s[option.taker].push(option.token);            
        }
        // Emit
        emit hedgeSettled(option.token, _optionId, option.amount, hedgeInfo.payOff, hedgeInfo.underlyingValue);
        emit minedHedge(_optionId, msg.sender, option.token, option.paired, hedgeInfo.tokenFee, hedgeInfo.baseFee);
    }

    // Log Protocol Revenue
    // - use userBalanceMap to get raw revenue balances and populate sums frontend
    function logAnalyticsFees(address token, uint256 tokenFee, uint256 baseFee, uint256 tokenProfit, uint256 baseProfit, uint256 endValue) internal {
       (address paired, ) = getPairAddressZK(token);
        protocolProfitsTokens[token].add(tokenProfit);
        protocolBaseProfits[paired].add(baseProfit);
        protocolFeesTokens[token].add(tokenFee);
        protocolBaseFees[paired].add(baseFee);
        settledVolume[paired].add(endValue);
    }

    // Log User PL in base value
    function logPL(uint256 amount, address paired, address optionowner, address optiontaker, uint winner) internal {
        if(winner == 0) {
            userPLMap[paired][optionowner].profits += amount;
            userPLMap[paired][optiontaker].losses += amount;
        }else if(winner == 1) {
            userPLMap[paired][optiontaker].profits += amount;
            userPLMap[paired][optionowner].losses += amount;
        }
    }

    // Fees
    function updateFee(uint256 numerator, uint256 denominator) onlyOwner public {
      feeNumerator = numerator;
      feeDenominator = denominator;
    }
    
    function calculateFee(uint256 amount) public view returns (uint256){
      require(amount >= feeDenominator, "Revenue is too small");    
      uint256 amountInLarge = amount.mul(feeDenominator.sub(feeNumerator));
      uint256 amountIn = amountInLarge.div(feeDenominator);
      uint256 fee = amount.sub(amountIn);
      return (fee);
    }

    // Toggle hedge bookmark using ID
    function bookmarkHedge(uint256 _optionId) public {
        bool bookmarked = bookmarks[msg.sender][_optionId];
        bookmarks[msg.sender][_optionId] = !bookmarked;
        emit bookmarkToggle(msg.sender, _optionId, !bookmarked);
        // Update bookmarkedOptions array for wallet
        if (!bookmarked) {
            bookmarkedOptions[msg.sender].push(_optionId);
        } else {
            uint256[] storage options = bookmarkedOptions[msg.sender];
            for (uint256 i = 0; i < options.length; i++) {
                if (options[i] == _optionId) {
                    // When values match remove the optionId from array
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

    //==============================
    //Getter functions start here.
    //==============================

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
    
    // get base value for amount of tokens, or value in paired currency.
    // base value is always the pair address of the token provided. get pair using UniswapV2 standard.
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

    
    // Withdrawable token balance for wallet
    function getWithdrawableBalance(address token, address user) public view returns (uint256) {
      userBalance memory uto = userBalanceMap[token][address(user)];
      uint256 withdrawable = 0;
      withdrawable = withdrawable.add(uto.deposited).sub(uto.withdrawn).sub(uto.lockedinuse);
      return withdrawable;
    }

    // Token balances breakdown for wallet
    function getuserTokenBalances (address token, address user) public view returns (uint256, uint256, uint256, uint256, uint256, address) {
      userBalance memory uto = userBalanceMap[address(token)][address(user)];
      uint256 deposited = uto.deposited;
      uint256 withdrawn = uto.withdrawn;
      uint256 lockedinuse = uto.lockedinuse;
      uint256 withdrawableBalance = (uto.deposited).sub(uto.withdrawn).sub(uto.lockedinuse);
      uint256 withdrawableValue; address paired;
      if(token != wethAddress && token != usdtAddress && token != usdcAddress ){
        (withdrawableValue, paired) = getUnderlyingValue(token, withdrawableBalance);
      }else{
        (withdrawableValue, paired) = (withdrawableBalance, address(0));
      }
      return (deposited, withdrawn, lockedinuse, withdrawableBalance, withdrawableValue, paired);
    }
    
    // Internal function to retrieve a subset of an array based on startIndex and limit
    function getSubset(uint[] storage fullArray, uint startIndex, uint limit) internal view returns (uint[] memory) {
        uint length = fullArray.length;
        require(startIndex < length, "Invalid start index");
        uint actualLimit = (length - startIndex < limit) ? length - startIndex : limit;
        uint[] memory subset = new uint[](actualLimit);
        for (uint i = 0; i < actualLimit; i++) {
            subset[i] = fullArray[startIndex + i];
        }
        return subset;
    }

    // Function to retrieve a subset of tokens from a user's history. cant merge with above coz one is uint[] and other address []
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

    // Helper function to retrieve a subset of options or swaps
    function getSubsetOfOptionsOrSwaps(uint[] storage fullArray, uint startIndex, uint limit) internal view returns (uint[] memory) {
        return getSubset(fullArray, startIndex, limit);
    }

    // Function to retrieve a subset of options or swaps created/taken by a user
    function getUserOptionsHistory(address user, uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(myoptionsHistory[user], startIndex, limit);
    }
    function getUserSwapsHistory(address user, uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(myswapsHistory[user], startIndex, limit);
    }
    function getUserOptionsCreated(address user, uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(myoptionsCreated[user], startIndex, limit);
    }

    function getUserSwapsCreated(address user, uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(myswapsCreated[user], startIndex, limit);
    }

    function getUserOptionsTaken(address user, uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(myoptionsTaken[user], startIndex, limit);
    }

    function getUserSwapsTaken(address user, uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(myswapsTaken[user], startIndex, limit);
    }

    // Helper function to retrieve a subset of options or swaps created/taken by all users
    function getAllOptions(uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(optionsCreated, startIndex, limit);
    }

    function getAllSwaps(uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(equityswapsCreated, startIndex, limit);
    }

    // Function to retrieve a subset of options or swaps taken
    function getAllOptionsTaken(uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(hedgesTaken, startIndex, limit);
    }

    function getAllSwapsTaken(uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(equityswapsTaken, startIndex, limit);
    }

    // Function to retrieve a subset of options or swaps for a specific token
    function getOptionsForToken(address _token, uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(tokenOptions[_token], startIndex, limit);
    }

    function getSwapsForToken(address _token, uint startIndex, uint limit) public view returns (uint[] memory) {
        return getSubsetOfOptionsOrSwaps(tokenSwaps[_token], startIndex, limit);
    }

    // Function to get hedge details
    function getHedgeDetails(uint256 _optionId) public view returns (hedgingOption memory) {
        hedgingOption storage hedge = hedgeMap[_optionId];
        require(hedge.owner != address(0), "Option does not exist");
        return hedge;
    }

    // Function to get the length of deposited tokens
    function getDepositedTokensLength() external view returns (uint) {
        return userERC20s[address(this)].length;
    }

    // Function to get the length of all options and swaps created
    function getAllOptionsLength() public view returns (uint256) {
        return optionsCreated.length;
    }

    function getAllSwapsLength() public view returns (uint256) {
        return equityswapsCreated.length;
    }

    // Function to get the count of options under a specific token
    function getOptionsForTokenCount(address _token) public view returns (uint256) {
        return tokenOptions[_token].length;
    }

    function getSwapsForTokenCount(address _token) public view returns (uint256) {
        return tokenSwaps[_token].length;
    }

    // Receive function to accept Ether
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
