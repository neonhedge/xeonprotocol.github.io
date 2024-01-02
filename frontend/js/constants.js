const CONSTANTS = {
  network: '0x5', // goerli 0x5 // bsc: 0x56
chainID: '',
  etherScan: "https://goerli.etherscan.io", // https://goerli.etherscan.io // https://bscscan.com/
  decimals: 18,
  neonAddress: '0xF97Fcb2015eCd8F8063fE5DbBA98b5d8E2D9a53A',
  hedgingAddress: '0x85298306cf7E4562d355Bed07C49E550D0A8Dc1c',
  stakingAddress: '0x95F737BC4ebf0f010c643f99db048aCe864909fd',
burnAddress: '0x000000000000000000000000000000000000dEaD',
  wethAddress: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  usdtAddress: '0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49',
  usdcAddress: '0xde637d4C445cA2aae8F782FFAc8d2971b93A4998',
  UniswapUSDCETH_LP: '',
  UNISWAP_FACTORY_ADDRESS: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
ethUsdcPrice: 2000,
  popuptimer: 20,
tokenLimit: 100,
  neonContractABI: [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "_maxTxAmount", "type": "uint256" } ], "name": "MaxTxAmountUpdated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [], "name": "_maxTaxSwap", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_maxTxAmount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_maxWalletSize", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_taxSwapThreshold", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address[]", "name": "bots_", "type": "address[]" } ], "name": "addBots", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "cooldownTimerInterval", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [ { "internalType": "address[]", "name": "notbot", "type": "address[]" } ], "name": "delBots", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "a", "type": "address" } ], "name": "isBot", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "manualSwap", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "openTrading", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_newFee", "type": "uint256" } ], "name": "reduceFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "removeLimits", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "transferDelayEnabled", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" } ],
  hedgingContractABI: [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "hedgeId", "type": "uint256" }, { "indexed": false, "internalType": "bool", "name": "bookmarked", "type": "bool" } ], "name": "bookmarkToggle", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "createValue", "type": "uint256" }, { "indexed": false, "internalType": "enum NEONHEDGE.HedgeType", "name": "hedgeType", "type": "uint8" }, { "indexed": true, "internalType": "address", "name": "writer", "type": "address" } ], "name": "hedgeCreated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "startValue", "type": "uint256" }, { "indexed": false, "internalType": "enum NEONHEDGE.HedgeType", "name": "hedgeType", "type": "uint8" }, { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" } ], "name": "hedgePurchased", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "endValue", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "payOff", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "miner", "type": "address" } ], "name": "hedgeSettled", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "miner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "paired", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenFee", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "pairFee", "type": "uint256" } ], "name": "minedHedge", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" } ], "name": "onDeposit", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" } ], "name": "onWithdraw", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "received", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "party", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "hedgeId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "topupAmount", "type": "uint256" }, { "indexed": false, "internalType": "bool", "name": "consent", "type": "bool" } ], "name": "topupRequested", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "hedgeId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "party", "type": "address" } ], "name": "zapRequested", "type": "event" }, { "inputs": [], "name": "XeonAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_optionId", "type": "uint256" } ], "name": "bookmarkHedge", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "bookmarkedOptions", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "bookmarks", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_optionId", "type": "uint256" } ], "name": "buyHedge", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "calculateFee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_requestID", "type": "uint256" } ], "name": "cancelTopupRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tool", "type": "uint256" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "cost", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" } ], "name": "createHedge", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "depositToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "depositedTokensLength", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "equityswapsCreatedLength", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" } ], "name": "equivUserCosts", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" } ], "name": "equivUserHedged", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeDenominator", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeNumerator", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getAllOptions", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getAllOptionsTaken", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getAllSwaps", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getAllSwapsTaken", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" } ], "name": "getBookmark", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getBoughtOptionsERC20", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getBoughtSwapsERC20", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" }, { "internalType": "address", "name": "pairedCurrency", "type": "address" } ], "name": "getEquivUserPL", "outputs": [ { "internalType": "uint256", "name": "profits", "type": "uint256" }, { "internalType": "uint256", "name": "losses", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_optionId", "type": "uint256" } ], "name": "getHedgeDetails", "outputs": [ { "components": [ { "internalType": "bool", "name": "topupConsent", "type": "bool" }, { "internalType": "bool", "name": "zapTaker", "type": "bool" }, { "internalType": "bool", "name": "zapWriter", "type": "bool" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "taker", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "paired", "type": "address" }, { "internalType": "uint256", "name": "status", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "createValue", "type": "uint256" }, { "internalType": "uint256", "name": "startValue", "type": "uint256" }, { "internalType": "uint256", "name": "strikeValue", "type": "uint256" }, { "internalType": "uint256", "name": "endValue", "type": "uint256" }, { "internalType": "uint256", "name": "cost", "type": "uint256" }, { "internalType": "uint256", "name": "dt_created", "type": "uint256" }, { "internalType": "uint256", "name": "dt_started", "type": "uint256" }, { "internalType": "uint256", "name": "dt_expiry", "type": "uint256" }, { "internalType": "uint256", "name": "dt_settled", "type": "uint256" }, { "internalType": "enum NEONHEDGE.HedgeType", "name": "hedgeType", "type": "uint8" }, { "internalType": "uint256[]", "name": "topupRequests", "type": "uint256[]" } ], "internalType": "struct NEONHEDGE.hedgingOption", "name": "", "type": "tuple" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "startId", "type": "uint256" }, { "internalType": "uint256", "name": "endId", "type": "uint256" } ], "name": "getHedgeRange", "outputs": [ { "components": [ { "internalType": "bool", "name": "topupConsent", "type": "bool" }, { "internalType": "bool", "name": "zapTaker", "type": "bool" }, { "internalType": "bool", "name": "zapWriter", "type": "bool" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "taker", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "paired", "type": "address" }, { "internalType": "uint256", "name": "status", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "createValue", "type": "uint256" }, { "internalType": "uint256", "name": "startValue", "type": "uint256" }, { "internalType": "uint256", "name": "strikeValue", "type": "uint256" }, { "internalType": "uint256", "name": "endValue", "type": "uint256" }, { "internalType": "uint256", "name": "cost", "type": "uint256" }, { "internalType": "uint256", "name": "dt_created", "type": "uint256" }, { "internalType": "uint256", "name": "dt_started", "type": "uint256" }, { "internalType": "uint256", "name": "dt_expiry", "type": "uint256" }, { "internalType": "uint256", "name": "dt_settled", "type": "uint256" }, { "internalType": "enum NEONHEDGE.HedgeType", "name": "hedgeType", "type": "uint8" }, { "internalType": "uint256[]", "name": "topupRequests", "type": "uint256[]" } ], "internalType": "struct NEONHEDGE.hedgingOption[]", "name": "", "type": "tuple[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getOptionsForToken", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "tokenAddress", "type": "address" } ], "name": "getPairAddressZK", "outputs": [ { "internalType": "address", "name": "pairAddress", "type": "address" }, { "internalType": "address", "name": "pairedCurrency", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getSettledOptionsERC20", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getSettledSwapsERC20", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getSwapsForToken", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "_tokenAmount", "type": "uint256" } ], "name": "getUnderlyingValue", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getUserHistory", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getUserOptionsCreated", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getUserOptionsTaken", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getUserSwapsCreated", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256", "name": "startIndex", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" } ], "name": "getUserSwapsTaken", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "user", "type": "address" } ], "name": "getUserTokenBalances", "outputs": [ { "internalType": "uint256", "name": "deposited", "type": "uint256" }, { "internalType": "uint256", "name": "withdrawn", "type": "uint256" }, { "internalType": "uint256", "name": "lockedinuse", "type": "uint256" }, { "internalType": "uint256", "name": "withdrawable", "type": "uint256" }, { "internalType": "uint256", "name": "withdrawableValue", "type": "uint256" }, { "internalType": "address", "name": "paired", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ], "name": "getmyBookmarks", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "hedgesCostVolume", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "hedgesCreatedVolume", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "hedgesTakenVolume", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "myoptionsCreated", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "myoptionsTaken", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "myswapsCreated", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "myswapsTaken", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "optionID", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "optionsCreatedLength", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "optionsVolume", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "pairedERC20s", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "protocolBalanceMap", "outputs": [ { "internalType": "uint256", "name": "deposited", "type": "uint256" }, { "internalType": "uint256", "name": "withdrawn", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "protocolCashierFees", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "protocolFeesTokens", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "protocolPairProfits", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "protocolPairedFees", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "protocolProfitsTokens", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_requestID", "type": "uint256" } ], "name": "rejectTopupRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_optionId", "type": "uint256" } ], "name": "settleHedge", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "settledVolume", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "swapsVolume", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bool", "name": "action", "type": "bool" } ], "name": "topupHedge", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "topupMap", "outputs": [ { "internalType": "uint256", "name": "amountWriter", "type": "uint256" }, { "internalType": "uint256", "name": "amountTaker", "type": "uint256" }, { "internalType": "uint256", "name": "requestTime", "type": "uint256" }, { "internalType": "uint256", "name": "acceptTime", "type": "uint256" }, { "internalType": "uint256", "name": "rejectTime", "type": "uint256" }, { "internalType": "uint256", "name": "state", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "topupRequestID", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "numerator", "type": "uint256" }, { "internalType": "uint256", "name": "denominator", "type": "uint256" } ], "name": "updateFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "usdcAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "usdcEquivDeposits", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "usdcEquivWithdrawals", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "usdtAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "usdtEquivDeposits", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "usdtEquivWithdrawals", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "userERC20s", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "wethAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "wethEquivDeposits", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "wethEquivWithdrawals", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "withdrawToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_optionId", "type": "uint256" } ], "name": "zapRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" } ],
  stakingContractABI: [ { "inputs": [ { "internalType": "address", "name": "XeonToken", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "staker", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "poolID", "type": "uint256" } ], "name": "RewardClaimed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "poolID", "type": "uint256" } ], "name": "RewardsDistributed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "staker", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "Staked", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "staker", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amountForMining", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amountForLiquidity", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amountForCollateral", "type": "uint256" } ], "name": "TokensAssigned", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "staker", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amountFromMining", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amountFromLiquidity", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amountFromCollateral", "type": "uint256" } ], "name": "TokensUnassigned", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "staker", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "Unstaked", "type": "event" }, { "inputs": [ { "internalType": "uint256", "name": "_percentForMining", "type": "uint256" }, { "internalType": "uint256", "name": "_percentForLiquidity", "type": "uint256" }, { "internalType": "uint256", "name": "_percentForCollateral", "type": "uint256" } ], "name": "assignTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "claimCollateralRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "claimLiquidityRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "claimRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "claimedRewardsCollateral", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "claimedRewardsLiquidity", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "claimedRewardsStaking", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "depositCollateralRewards", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "depositLiquidityRewards", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "depositRewards", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "ethCollateralRewardBasis", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "ethLiquidityRewardBasis", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "ethRewardBasis", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "stakerAddress", "type": "address" } ], "name": "getAssignedAndUnassignedAmounts", "outputs": [ { "internalType": "uint256", "name": "assignedForMining", "type": "uint256" }, { "internalType": "uint256", "name": "assignedForLiquidity", "type": "uint256" }, { "internalType": "uint256", "name": "assignedForCollateral", "type": "uint256" }, { "internalType": "uint256", "name": "unassigned", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCollateralRewardsDue", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getLiquidityRewardsDue", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getRewardsDue", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "stakerAddress", "type": "address" } ], "name": "getStakedBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getStakers", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTotalAssigned", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTotalStaked", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTotalUnassigned", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "lastCollateralRewardBasis", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "lastLiquidityRewardBasis", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "lastRewardBasis", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextUnstakeDay", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "poolExpiry", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "restartPool", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "stakerAddresses", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "stakers", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "stakingTime", "type": "uint256" }, { "internalType": "uint256", "name": "lastClaimedDay", "type": "uint256" }, { "internalType": "uint256", "name": "assignedForMining", "type": "uint256" }, { "internalType": "uint256", "name": "assignedForLiquidity", "type": "uint256" }, { "internalType": "uint256", "name": "assignedForCollateral", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "stakingToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "startContract", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "totalAssignedForCollateral", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalAssignedForLiquidity", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalAssignedForMining", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_amountFromMining", "type": "uint256" }, { "internalType": "uint256", "name": "_amountFromLiquidity", "type": "uint256" }, { "internalType": "uint256", "name": "_amountFromCollateral", "type": "uint256" } ], "name": "unassignTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ],
};

// CoinGecko API price call function
function getCurrentEthUsdcPriceFromUniswapV2() { 
  return CONSTANTS.ethUsdcPrice;
}

// Function to Validate the Ethereum wallet address format
function isValidEthereumAddress(address) {
  const ethereumAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
  return ethereumAddressRegex.test(address);
}

// Function to Truncate the token address for display
function truncateAddress(address) {
return address.slice(0, 6) + '...' + address.slice(-4);
}

// Function to Convert to USD value based on pair
// accepts Number
function convertToUSD(value, pairedCurrency, ethUsdPrice) {
console.log('outputUSD ' + value + ", worthOf " + pairedCurrency + ", @ ethusd: " + ethUsdPrice);
switch (pairedCurrency) {
  case CONSTANTS.wethAddress:
  return value * ethUsdPrice;
  case CONSTANTS.usdtAddress:
  case CONSTANTS.usdcAddress:
  return value;
  default:
  return 0;
}
}
// Function to get token USD value
// accepts bigInt & BigNumber
// outputs Number
async function getTokenUSDValue(underlyingTokenAddr, balanceRaw) {	
const ethUsdPrice = getCurrentEthUsdcPriceFromUniswapV2();
try {
  if (underlyingTokenAddr === CONSTANTS.wethAddress) {
    const balance = new BigNumber(balanceRaw).div(new BigNumber(10).pow(18));
    const usdValue = convertToUSD(balance, CONSTANTS.wethAddress, ethUsdPrice);
    return usdValue;
  } else {
    const underlyingValue = await getTokenETHValue(underlyingTokenAddr, balanceRaw);
    const balanceNumber = Number(underlyingValue[0]);
    const pairSymbol = underlyingValue[1];
    
    // reverse engineer pair address needed for USD conversion
    let pairedAddress;
    if (pairSymbol === 'USDT') {
      pairedAddress = CONSTANTS.usdtAddress;
    } else if (pairSymbol === 'USDC') {
      pairedAddress = CONSTANTS.usdcAddress;
    } else if (pairSymbol === 'WETH') {
      pairedAddress = CONSTANTS.wethAddress;
    }
    // accepts Number not wei & BigNumber
    const usdValue = convertToUSD(balanceNumber, pairedAddress, ethUsdPrice);
    console.log('converted to: '+balanceNumber + ', usd: ' + usdValue);
    return usdValue;
  }
} catch (error) {
  console.error("Error getting token USD value:", error);
  return 0;
}
}
// Function to get token paired currency value
// accepts wei & BigNumber of all decimals; XEON, USDT, USDC, WETH
// outputs Number ready to display
// Rename to getUnderlyingValue
async function getTokenETHValue(underlyingTokenAddr, bigIntBalanceInput) {
  try {
      // Convert balance to string
      const input_balance = bigIntBalanceInput.toString();
      console.log('>input: ' + input_balance + ', token: ' + underlyingTokenAddr + ' bal: ' + bigIntBalanceInput);

      const result = await hedgingInstance.methods.getUnderlyingValue(underlyingTokenAddr, input_balance).call();
      
      const underlyingValue = result[0];
      const pairedAddress = result[1];

      if (!result) {
          console.error("Invalid result:", result);
          return [new BigNumber(0), ''];
      }
      // convert from BigNumber to Number
      const pairedAddressDecimal = await getTokenDecimals(pairedAddress);
      const balance = new BigNumber(underlyingValue).div(new BigNumber(10).pow(pairedAddressDecimal));
      const trueValue = Number(balance);
  /* troubleshoot why this approach isnt working for ERC20 tokens:
  // convert from BigNumber to Number
      const pairedAddressDecimal = await getTokenDecimals(pairedAddress);
      const trueValue = fromBigIntNumberToDecimal(underlyingValue, pairedAddressDecimal);
  */

      let pairSymbol;
      if (pairedAddress === '0xdac17f958d2ee523a2206206994597c13d831ec7') {
          pairSymbol = 'USDT';
      } else if (pairedAddress === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
          pairSymbol = 'USDC';
      } else if (pairedAddress === CONSTANTS.wethAddress) {
          pairSymbol = 'WETH';
      }
  console.log('<output: ' + result[0] + ', token: ' + result[1] + ', TV: ' + trueValue + ', ' + pairSymbol);
      return [trueValue, pairSymbol];
  } catch (error) {
      console.error("Error getting token ETH value:", error);
      return [new BigNumber(0), ''];
  }
}

// Function to get token decimals
async function getTokenDecimals(tokenAddress) {
  // standard ERC20 ABI
const erc20ABI = [
  { constant: true, inputs: [], name: 'name', outputs: [{ name: '', type: 'string' }], type: 'function' },
  { constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], type: 'function' },
  { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], type: 'function' },
];

const pairedContract = new web3.eth.Contract(erc20ABI, tokenAddress);
const [pairedSymbol, pairDecimals] = await Promise.all([
  pairedContract.methods.symbol().call(),
  pairedContract.methods.decimals().call()
]);
return Number(pairDecimals);	
}

async function getTokenDecimalAndSymbol(tokenAddress) {
// ERC20 ABI
  const erc20ABI = [
      {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
      {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"},
      {"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"type":"function"}
  ]    
  const erc20Contract = new web3.eth.Contract(erc20ABI, tokenAddress); 

  try {
      const [decimalsResult, symbolResult] = await Promise.all([
          erc20Contract.methods.decimals().call(),
          erc20Contract.methods.symbol().call()
      ]);
  } catch (error) {
      console.log(error);
  }
  return [Number(decimalsResult), symbolResult];
}


// Function to fetch user's token balances
async function getUserBalancesForToken(tokenAddress, userAddress) {
console.log('getUserBalancesForToken: ' + tokenAddress + ', ' + userAddress);
  try {
      const userBalances = await hedgingInstance.methods.getUserTokenBalances(tokenAddress, userAddress).call();
  const deposited = userBalances[0];
  const withdrawn = userBalances[1];
  const lockedInUse = userBalances[2];
  const withdrawable = userBalances[3];
  const withdrawableValue = userBalances[4];
  const pairedAddress = userBalances[5];

  console.log('deposited: ' + deposited + ', withdrawn: ' + withdrawn + ', lockedInUse: ' + lockedInUse + ', withdrawable: ' + withdrawable + ', withdrawableValue: ' + withdrawableValue + ', paired: ' + pairedAddress);

  // Use pair to convert to correct decimals
  
      const pairedAddressDecimal = await getTokenDecimals(pairedAddress);
      const depositedBalance = fromBigIntNumberToDecimal(deposited, pairedAddressDecimal);
      const withdrawnBalance = fromBigIntNumberToDecimal(withdrawn, pairedAddressDecimal);
      const lockedInUseBalance = fromBigIntNumberToDecimal(lockedInUse, pairedAddressDecimal);
      const withdrawableBalanceEth = fromBigIntNumberToDecimal(withdrawable, pairedAddressDecimal);
         
      return {
          deposited: depositedBalance,
          withdrawn: withdrawnBalance,
          lockedInUse: lockedInUseBalance,
          withdrawableBalance: withdrawableBalanceEth,
          withdrawableValue: withdrawableValue
      }
  } catch (error) {
      console.error("Error fetching user's token balances:", error);
      
      return {
          deposited: 0,
          withdrawn: 0,
          lockedInUse: 0,
          withdrawableBalance: 0,
          withdrawableValue: 0
      };
  }
}

async function getPairToken(optionId) {
const result = await hedgingInstance.methods.getHedgeDetails(optionId).call();
return result.paired;
}

async function getSymbol(tokenAddress) {
const tokenAbi = [
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
    {
      "name": "",
      "type": "string"
    }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];
const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
const symbol = await tokenContract.methods.symbol().call();
return symbol;
}

// HELPERS
//Tokens unrounded
function fromWeiToFixed2_unrounded(amount) {//doesnt round up figures
  var amount = amount / Math.pow(10, CONSTANTS.decimals);
  var fixed = 2;
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return amount.toString().match(re)[0];
}
//ETH unrounded
function toFixed8_unrounded(amount) {
  //accepts decimals
  var parsed_eth = parseFloat(amount);
  var fixed = 8;//8 is good for all esp RBW
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return parsed_eth.toString().match(re)[0];
}
function fromWeiToFixed5_unrounded(amount) {//doesnt round up figures
  //accepts wei only not decimals, also no need to string wei
  var raw_eth = web3.utils.fromWei(amount, "ether");
  var parsed_eth = parseFloat(raw_eth);
  var fixed = 5;//6 is good for all esp RBW
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return parsed_eth.toString().match(re)[0];
}
function fromWeiToFixed8_unrounded(amount) {//doesnt round up figures
  //accepts wei only not decimals, also no need to string wei
  var raw_eth = web3.utils.fromWei(amount, "ether");
  var parsed_eth = parseFloat(raw_eth);
  var fixed = 8;
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return parsed_eth.toString().match(re)[0];
}
function fromWeiToFixed8(amount){
  var raw_eth = web3.utils.fromWei(amount, "ether");
  var parsed_eth = parseFloat(raw_eth);
  var ethFriendly = parsed_eth.toFixed(8);
  return ethFriendly;
}
function fromWeiToFixed12(amount){
  var raw_eth = web3.utils.fromWei(amount, "ether");
  var parsed_eth = parseFloat(raw_eth);
  var ethFriendly = parsed_eth.toFixed(12);
  return ethFriendly;
}
function fromWeiToFixed5(amount){
  var raw_eth = web3.utils.fromWei(amount, "ether");
  var parsed_eth = parseFloat(raw_eth);
  var ethFriendly = parsed_eth.toFixed(5);
  return ethFriendly;
}
function fromBigIntNumberToDecimal(number, decimals) {
  const BigIntNumber = BigInt(number);
  const BigIntDecimals = BigInt(decimals);
      return Number(BigIntNumber / BigInt(10) ** BigIntDecimals);
}

function fromDecimalToBigInt(number, decimals) {
  const BigIntNumber = BigInt(number);
  const BigIntDecimals = BigInt(decimals);
  return BigIntNumber * BigInt(10) ** BigIntDecimals;
}

function commaNumbering(number){
  return Number(number).toLocaleString();
}; 

export { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, isValidEthereumAddress, truncateAddress, convertToUSD, getTokenUSDValue, getTokenETHValue, getUserBalancesForToken, getPairToken, getSymbol, getTokenDecimals };
export { fromBigIntNumberToDecimal, commaNumbering, fromWeiToFixed12, fromWeiToFixed5, fromWeiToFixed8, fromWeiToFixed8_unrounded, fromWeiToFixed5_unrounded, fromWeiToFixed2_unrounded, toFixed8_unrounded };
