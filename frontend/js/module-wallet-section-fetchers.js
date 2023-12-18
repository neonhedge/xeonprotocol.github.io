import { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, getTokenETHValue, getTokenUSDValue } from './constants.js';
import { updateSectionValues_Networth, updateSectionValues_Hedges, updateSectionValues_Rewards, updateSectionValues_Staking } from './module-wallet-section-updaters.js';
import { getCurrentBalancesValue, calculateStakedTokensValueETH, calculateRewardsDue, calculateCommissionDueETH } from './module-wallet-networth-dependencies.js';
import { userTokenList, cashierErc20List } from './module-wallet-tokenlist-dependencies.js';

// 1. Fetch Section Values - Net Worth
//-----------------------------------------
async function fetchSection_Networth(){
    try {
        const accounts = await web3.eth.requestAccounts();
        const userAddress = accounts[0];
        
        const walletBalanceRaw = await neonInstance.methods.balanceOf(userAddress).call();
        const stakedBalanceRaw = await stakingInstance.methods.getStakedBalance(userAddress).call();

        const transactedTokensArrayList = await hedgingInstance.methods.getUserHistory(userAddress, 0, CONSTANTS.tokenLimit).call();
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
        const [walletTokensETH, pairedSymbol] = await getTokenETHValue(CONSTANTS.tokenAddress, walletBalanceRaw); //already formated

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
	return;
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

// 4. Fetch Section Values - REWARDS PANEL
//----------------------------------------------------
async function fetchSection_RewardsPanel(){
	
	const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];
	// Fetch rewards due
	const userRewardsDue = await stakingInstance.methods.getRewardsDue(userAddress).call();
	const userLiqRewardsDue = await stakingInstance.methods.getLiquidityRewardsDue(userAddress).call();
	const userColRewardsDue = await stakingInstance.methods.getCollateralRewardsDue(userAddress).call();
	// ~ mining rewards are automatically credited to miner on every hedge settlement.
	// ~ mining rewards are accumulated in the token addresses of underlying & pair, endless erc20 fee types
	// ~ mining rewards are not automatically loaded to wallet page as they need to be populated from past events
	
	// Fetch rewards claimed
	const userRewardsClaimed = await stakingInstance.methods.stakerRewardsClaimed(userAddress).call();
	const userLiqRewardsClaimed = await stakingInstance.methods.stakerLiquidityClaimed(userAddress).call();
	const userColRewardsClaimed = await stakingInstance.methods.stakerCollateralClaimed(userAddress).call();
	
	// Fetch ETH to USD conversion rate
	const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

	// Step 1: Convert amounts
	const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;

	// Step 2: Convert eth values
	const userRewardsDueEth = new BigNumber(userRewardsDue).div(10 ** wethDecimals);
	const userLiqRewardsDueEth = new BigNumber(userLiqRewardsDue).div(10 ** wethDecimals);
	const userColRewardsDueEth = new BigNumber(userColRewardsDue).div(10 ** wethDecimals);
	const totalRewardsDueWETH = userRewardsDueEth + userLiqRewardsDueEth + userColRewardsDueEth;

	const userRewardsClaimedEth = new BigNumber(userRewardsClaimed).div(10 ** wethDecimals);
	const userLiqRewardsClaimedEth = new BigNumber(userLiqRewardsClaimed).div(10 ** wethDecimals);
	const userColRewardsClaimedEth = new BigNumber(userColRewardsClaimed).div(10 ** wethDecimals);
	const totalRewardsClaimedWETH = userRewardsClaimedEth + userLiqRewardsClaimedEth + userColRewardsClaimedEth;

	// Step 3: Convert usdt values
	const userRewardsDueUSDT = userRewardsDueEth * ethUsdPrice;
	const userLiqRewardsDueUSDT = userLiqRewardsDueEth * ethUsdPrice;
	const userColRewardsDueUSDT = userColRewardsDueEth * ethUsdPrice;	
	const totalRewardsDueUSDT = userRewardsDueUSDT + userLiqRewardsDueUSDT + userColRewardsDueUSDT;

	const userRewardsClaimedUSDT = userRewardsClaimedEth * ethUsdPrice;
	const userLiqRewardsClaimedUSDT = userLiqRewardsClaimedEth * ethUsdPrice;
	const userColRewardsClaimedUSDT = userColRewardsClaimedEth * ethUsdPrice;
	const totalRewardsClaimedUSDT = userRewardsClaimedUSDT + userLiqRewardsClaimedUSDT + userColRewardsClaimedUSDT;

	updateSectionValues_Rewards(
		totalRewardsDueWETH,
		totalRewardsDueUSDT,
		totalRewardsClaimedWETH,
		totalRewardsClaimedUSDT,
		userRewardsDueEth,
		userRewardsDueUSDT,
		userLiqRewardsDueEth,
		userLiqRewardsDueUSDT,
		userColRewardsDueEth,
		userColRewardsDueUSDT,
		userRewardsClaimedEth,
		userRewardsClaimedUSDT,
		userLiqRewardsClaimedEth,
		userLiqRewardsClaimedUSDT,
		userColRewardsClaimedEth,
		userColRewardsClaimedUSDT
	);

}

// 5. Fetch Section Values - STAKING PANEL
//----------------------------------------------------
async function fetchSection_StakingPanel(){
	
	const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];
	
	const walletBalanceRaw = await neonInstance.methods.balanceOf(userAddress).call();
	const stakedBalanceRaw = await stakingInstance.methods.getStakedBalance(userAddress).call();
	const depositedBalanceRaw = await hedgingInstance.methods.getuserTokenBalances(CONSTANTS.neonAddress, userAddress).call();
	const [deposited, withdrawn] = depositedBalanceRaw;
	// Staked versus Supply
	const totalStakedRaw = await stakingInstance.methods.getTotalStaked().call();
	const circulatingSupplyRaw = await tokenInst.circulatingSupply(); 
	// Distrubuted ETH rewards to staking contract
	const distributedRewards = await stakingInstance.methods.ethRewardBasis().call();
	const distributedRewardsLiqu = await stakingInstance.methods.ethLiquidityRewardBasis().call();
	const distributedRewardsColl = await stakingInstance.methods.ethCollateralRewardBasis().call();
	// Claimed ETH rewards to staking contract
	const claimedRewards = await stakingInstance.methods.rewardsClaimed().call(userAddress);
	const claimedRewardsLiqu = await stakingInstance.methods.rewardsClaimedLiquidity(userAddress).call();
	const claimedRewardsColl = await stakingInstance.methods.rewardsClaimedCollateral(userAddress).call();
	// My pool assignments
	const assignmentsRaw = await stakingInstance.methods.getAssignedAndUnassignedAmounts(userAddress).call();
	const [assignedMiningRaw, assignedLiquidityRaw, assignedCollateralRaw, unassignedRaw] = assignmentsRaw;
	
	// Fetch ETH to USD conversion rate
	const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();
	const tokenUsdPrice = await getTokenUSDValue();

	// Step 1: Convert amounts
	const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;
	
	// Step 2: Convert normal values
	const walletBalance = new BigNumber(walletBalanceRaw).div(10 ** CONSTANTS.decimals);
	const stakedBalance = new BigNumber(stakedBalanceRaw).div(10 ** CONSTANTS.decimals);
	const depositedBalance = new BigNumber(deposited).div(10 ** CONSTANTS.decimals);
	const withdrawnBalance = new BigNumber(withdrawn).div(10 ** CONSTANTS.decimals);
	const totalHoldings = walletBalance + stakedBalance + (depositedBalance - withdrawnBalance);

	const totalStaked = new BigNumber(totalStakedRaw).div(10 ** CONSTANTS.decimals);
	const circulatingSupply = new BigNumber(circulatingSupplyRaw).div(10 ** CONSTANTS.decimals);

	const distributedRewardsEth = new BigNumber(distributedRewards).div(10 ** wethDecimals);
	const distributedRewardsLiquEth = new BigNumber(distributedRewardsLiqu).div(10 ** wethDecimals);
	const distributedRewardsCollEth = new BigNumber(distributedRewardsColl).div(10 ** wethDecimals);
	const distributedRewardsTotalEth = distributedRewardsEth + distributedRewardsLiquEth + distributedRewardsCollEth;
	
	const claimedRewardsEth = new BigNumber(claimedRewards).div(10 ** wethDecimals);
	const claimedRewardsLiquEth = new BigNumber(claimedRewardsLiqu).div(10 ** wethDecimals);
	const claimedRewardsCollEth = new BigNumber(claimedRewardsColl).div(10 ** wethDecimals);
	const claimedRewardsTotalEth = distributedRewardsEth + distributedRewardsLiquEth + distributedRewardsCollEth;

	const assignedMining = new BigNumber(assignedMiningRaw).div(10 ** CONSTANTS.decimals);
	const assignedLiquidity = new BigNumber(assignedLiquidityRaw).div(10 ** CONSTANTS.decimals);
	const assignedCollateral = new BigNumber(assignedCollateralRaw).div(10 ** CONSTANTS.decimals);
	const unassigned = new BigNumber(unassignedRaw).div(10 ** CONSTANTS.decimals);
	const totalAssigned = assignedMining + assignedLiquidity + assignedCollateral;

	// Step 3: Convert usdt values
	const walletBalanceUSDT = walletBalance * getTokenUSDValue;
	const stakedBalanceUSDT = stakedBalance * getTokenUSDValue;
	const depositedBalanceUSDT = depositedBalance * getTokenUSDValue;
	const withdrawnBalanceUSDT = withdrawnBalance * getTokenUSDValue;
	const totalHoldingsUSDT = totalHoldings * getTokenUSDValue;

	const totalStakedUSDT = totalStaked * getTokenUSDValue;
	const circulatingSupplyUSDT = circulatingSupply * getTokenUSDValue;

	const distributedRewardsUSDT = distributedRewardsEth * ethUsdPrice;
	const distributedRewardsLiqUSDT = distributedRewardsLiquEth * ethUsdPrice;	
	const distributedRewardsColUSDT = distributedRewardsCollEth * ethUsdPrice;	
	const distributedRewardsTotalUSDT = distributedRewardsTotalEth * ethUsdPrice;

	const claimedRewardsUSDT = claimedRewardsEth * ethUsdPrice;
	const claimedRewardsLiqUSDT = claimedRewardsLiquEth * ethUsdPrice;	
	const claimedRewardsColUSDT = claimedRewardsCollEth * ethUsdPrice;	
	const claimedRewardsTotalUSDT = claimedRewardsTotalEth * ethUsdPrice;

	const assignedMiningUSDT = assignedMining * tokenUsdPrice;
	const assignedLiquidityUSDT = assignedLiquidity * tokenUsdPrice;
	const assignedCollateralUSDT = assignedCollateral * tokenUsdPrice;
	const unassignedUSDT = unassigned * tokenUsdPrice;
	const totalAssignedUSDT = assignedMiningUSDT + assignedLiquidityUSDT + assignedCollateralUSDT;

	updateSectionValues_Staking(
		walletBalance,
		stakedBalance,
		depositedBalance,
		withdrawnBalance,
		totalHoldings,
		totalStaked,
		circulatingSupply,
		distributedRewardsEth,
		distributedRewardsLiquEth,
		distributedRewardsCollEth,
		distributedRewardsTotalEth,
		claimedRewardsEth,
		claimedRewardsLiquEth,
		claimedRewardsCollEth,
		claimedRewardsTotalEth,
		assignedMining,
		assignedLiquidity,
		assignedCollateral,
		unassigned,
		totalAssigned,
		walletBalanceUSDT,
		stakedBalanceUSDT,
		depositedBalanceUSDT,
		withdrawnBalanceUSDT,
		totalHoldingsUSDT,
		totalStakedUSDT,
		circulatingSupplyUSDT,
		distributedRewardsUSDT,
		distributedRewardsLiqUSDT,
		distributedRewardsColUSDT,
		distributedRewardsTotalUSDT,
		claimedRewardsUSDT,
		claimedRewardsLiqUSDT,
		claimedRewardsColUSDT,
		claimedRewardsTotalUSDT,
		assignedMiningUSDT,
		assignedLiquidityUSDT,
		assignedCollateralUSDT,
		unassignedUSDT,
		totalAssignedUSDT
	);

}

// Export the fetch functions
export { fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel, fetchSection_RewardsPanel, fetchSection_StakingPanel };