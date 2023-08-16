import { updateSectionValues_Networth, updateSectionValues_Hedges } from './module-wallet-section-updaters.js';
import { getCurrentBalancesValue, calculateStakedTokensValueETH, calculateRewardsDue, calculateCommissionDueETH } from './module-wallet-networth-dependencies.js';
import { userTokenList, cashierErc20List} from './module-wallet-tokenlist-dependencies.js';

// 1. Fetch Section Values - Net Worth
//-----------------------------------------
async function fetchSection_Networth(){
    try {
        const accounts = await web3.eth.requestAccounts();
        const userAddress = accounts[0];
        
        const walletBalanceRaw = await web3.eth.getBalance(userAddress);
        const stakedBalanceRaw = await stakingInstance.methods.getStakedBalance(userAddress).call();

        const transactedTokensArrayList = await hedgingInstance.methods.getUserTokenList(userAddress).call();
        const transactedTokensCount = transactedTokensArrayList.length;
        
        // Human Readable
        const walletBalance = new BigNumber(walletBalanceRaw).div(10 ** CONSTANTS.decimals);
        const stakedBalance = new BigNumber(stakedBalanceRaw).div(10 ** CONSTANTS.decimals);

        // ETH USD price
        const ethUsdcPrice = await getCurrentEthUsdcPriceFromUniswapV2();

        // ETH values
        const rewardsDue = await calculateRewardsDue(userAddress);
        const commissionDue = await calculateCommissionDueETH(userAddress);
        const rewardsDueETH = rewardsDue[0];
        const totalCommissionDueETH = commissionDue[0]; //already formated
        const stakedTokensETH = await calculateStakedTokensValueETH(userAddress); //already formated
        const walletTokensETH = await getTokenETHValue(CONSTANTS.tokenAddress, walletBalanceRaw); //already formated

        //USD values
        const totalDepositsUSD = await getCurrentBalancesValue(userAddress); //already formated
        const totalRewardsDueUSD = rewardsDue[1]; //already formated
        const totalCommissionDueUSD = commissionDue[0] * ethUsdcPrice; //already formated
        const stakedTokensUSD = stakedTokensETH * ethUsdcPrice;
        const walletTokensUSD = walletTokensETH * ethUsdcPrice;
        const netWorthUSD = walletTokensUSD + stakedTokensUSD + totalCommissionDueUSD + totalRewardsDueUSD + totalDepositsUSD;	

        updateSectionValues_Networth(
            userAddress,
            walletBalance,
            stakedBalance,
            totalDepositsUSD,
            totalRewardsDueUSD,
            totalCommissionDueETH,
            totalCommissionDueUSD,
            transactedTokensCount,
            netWorthUSD
        );
    } catch (error) {
        console.error("Error fetching Hedge Panel section data:", error);
    }
}

// 2. Fetch Section Values - ERC20 DEPOSIT BALANCES LIST
//---------------------------------------------------
async function fetchSection_BalanceList(){
	const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];

	await userTokenList(userAddress);
	await cashierErc20List(userAddress);

}

// 3. Fetch Section Values - HEDGING PANEL
//----------------------------------------------------
async function fetchSection_HedgePanel(){

	const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];
	// Fetch arrays
	const userOptionsCreated = await hedgingInstance.methods.myoptionsCreated(userAddress).call();
	const userSwapsCreated = await hedgingInstance.methods.myswapsCreated(userAddress).call();
	const userOptionsTaken = await hedgingInstance.methods.myoptionsTaken(userAddress).call();
	const userSwapsTaken = await hedgingInstance.methods.myswapsTaken(userAddress).call();
	const userOptionsHistory = await hedgingInstance.methods.myoptionsHistory(userAddress).call();
	const userSwapsHistory = await hedgingInstance.methods.myswapsHistory(userAddress).call();
	// Fetch volume
	const userWrite = await hedgingInstance.methods.getuserWriteVolume(userAddress).call();
	const userTake = await hedgingInstance.methods.getuserTakeVolume(userAddress).call();
	// Fetch profits and losses: WETH, USDT, USDC support only for now
	const userProfitWETH = await hedgingInstance.methods.getUserProfits(CONSTANTS.wethAddress, userAddress).call();
	const userProfitUSDT = await hedgingInstance.methods.getUserProfits(CONSTANTS.usdtAddress, userAddress).call();
	const userProfitUSDC = await hedgingInstance.methods.getUserProfits(CONSTANTS.usdcAddress, userAddress).call();
	const userLossWETH = await hedgingInstance.methods.getUserLosses(CONSTANTS.wethAddress, userAddress).call();
	const userLossUSDT = await hedgingInstance.methods.getUserLosses(CONSTANTS.usdtAddress, userAddress).call();
	const userLossUSDC = await hedgingInstance.methods.getUserLosses(CONSTANTS.usdcAddress, userAddress).call();
	// Fetch ETH to USD conversion rate
	const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

	// Step 1: Convert lengths
	const userOptionsCreatedCount = userOptionsCreated.length;
	const userSwapsCreatedCount = userSwapsCreated.length;
	const userHedgesCreated = userOptionsCreatedCount + userSwapsCreatedCount;

	const userOptionsTakenCount = userOptionsTaken.length;
	const userSwapsTakenCount = userSwapsTaken.length;
	const userHedgesTaken = userOptionsTakenCount + userSwapsTakenCount;
	
	const userOptionsHistoryCount = userOptionsHistory.length;
	const userSwapsHistoryCount = userSwapsHistory.length;
	
	// Step 2: Convert amounts
	const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;

	const userWriteEth = new BigNumber(userWrite[0]).div(10 ** wethDecimals);
	const userWriteUsdt = new BigNumber(userWrite[1]).div(10 ** usdtDecimals);
	const userWriteUsdc = new BigNumber(userWrite[2]).div(10 ** usdcDecimals);
	const totalWriteTWETH = userWriteEth + (userWriteUsdt / ethUsdPrice) + (userWriteUsdc / ethUsdPrice);	
	
	const userTakeEth = new BigNumber(userTake[0]).div(10 ** wethDecimals);
	const userTakeUsdt = new BigNumber(userTake[1]).div(10 ** usdtDecimals);
	const userTakeUsdc = new BigNumber(userTake[2]).div(10 ** usdcDecimals);
	const totalTakeTWETH = userTakeEth + (userTakeUsdt / ethUsdPrice) + (userTakeUsdc / ethUsdPrice);

	const userProfitEth = new BigNumber(userProfitWETH).div(10 ** wethDecimals);
	const userProfitUsdt = new BigNumber(userProfitUSDT).div(10 ** usdtDecimals);
	const userProfitUsdc = new BigNumber(userProfitUSDC).div(10 ** usdcDecimals);
	const totalProfitTWETH = userProfitEth + (userProfitUsdt / ethUsdPrice) + (userProfitUsdc / ethUsdPrice);

	const userLossEth = new BigNumber(userLossWETH).div(10 ** wethDecimals);
	const userLossUsdt = new BigNumber(userLossUSDT).div(10 ** usdtDecimals);
	const userLossUsdc = new BigNumber(userLossUSDC).div(10 ** usdcDecimals);
	const totalLossTWETH = userLossEth + (userLossUsdt / ethUsdPrice) + (userLossUsdc / ethUsdPrice);

	updateSectionValues_Hedges(
		userHedgesCreated,
		userHedgesTaken,
		totalWriteTWETH,
		totalTakeTWETH,
		userOptionsHistoryCount,
		userSwapsHistoryCount,
		totalProfitTWETH,
		totalLossTWETH
	);

}

// Export the fetch functions
export { fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel };