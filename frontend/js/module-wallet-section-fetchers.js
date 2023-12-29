import { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, getTokenETHValue, getTokenUSDValue } from './constants.js';
import { updateSectionValues_Networth, updateSectionValues_Hedges, updateSectionValues_Rewards, updateSectionValues_Staking } from './module-wallet-section-updaters.js';
import { getCurrentBalancesValue, calculateStakedTokensValueETH, calculateRewardsDue, calculateCommissionDueETH } from './module-wallet-networth-dependencies.js';
import { userTokenList, cashierErc20List } from './module-wallet-tokenlist-dependencies.js';
import { getUserHedgeVolume, getUserProfitLoss } from './module-wallet-hedgePanel-dependencies.js';

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
        const walletBalance = (BigInt(walletBalanceRaw) / BigInt(10) ** BigInt(CONSTANTS.decimals)).toString();
		const stakedBalance = (BigInt(stakedBalanceRaw) / BigInt(10) ** BigInt(CONSTANTS.decimals)).toString();

        // ETH USD price
        const ethUsdcPrice = getCurrentEthUsdcPriceFromUniswapV2();

        // ETH values
        const rewardsDue = await calculateRewardsDue(userAddress);
        const commissionDue = await calculateCommissionDueETH(userAddress);
        const totalCommissionDueETH = commissionDue[0]; //already formated
        const stakedTokensETH = await calculateStakedTokensValueETH(userAddress); //already formated
        const [walletTokensETH, pairedSymbol] = await getTokenETHValue(CONSTANTS.neonAddress, walletBalanceRaw); //input in wei, output already formated

        //USD values
        const totalDepositsUSD = await getCurrentBalancesValue(userAddress); //already formated
        const totalRewardsDueUSD = rewardsDue * ethUsdcPrice; //already formated
        const totalCommissionDueUSD = commissionDue[0] * ethUsdcPrice; //already formated
        const stakedTokensUSD = stakedTokensETH * ethUsdcPrice;
        const walletTokensUSD = walletTokensETH * ethUsdcPrice;
        const netWorthUSD = walletTokensUSD + stakedTokensUSD + totalCommissionDueUSD + totalRewardsDueUSD + totalDepositsUSD;	

		console.log("totalDepositsUSD: " + totalDepositsUSD + ", stakedTokensUSD: " + stakedTokensUSD + ", walletTokensUSD: " + walletTokensUSD + ", totalRewardsDueUSD: " + totalRewardsDueUSD + ", totalCommissionDueUSD " + totalCommissionDueUSD + ", netWorthUSD " + netWorthUSD);

        updateSectionValues_Networth(
            userAddress,
            walletBalance,
            stakedBalance,
            totalDepositsUSD,
            totalRewardsDueUSD,
            totalCommissionDueETH,
            totalCommissionDueUSD,
			walletTokensUSD,
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
	const userOptionsCreated = await hedgingInstance.methods.getUserOptionsCreated(userAddress, 0, CONSTANTS.tokenLimit).call();
	const userSwapsCreated = await hedgingInstance.methods.getUserSwapsCreated(userAddress, 0, CONSTANTS.tokenLimit).call();
	const userOptionsTaken = await hedgingInstance.methods.getUserOptionsTaken(userAddress, 0, CONSTANTS.tokenLimit).call();
	const userSwapsTaken = await hedgingInstance.methods.getUserSwapsTaken(userAddress, 0, CONSTANTS.tokenLimit).call();
	// Fetch volume
	// Manually fetch these: get hedges created + taken IDs, then compile createValue & startValue volumes from each ID
	const userHedgeVolume = await getUserHedgeVolume(userAddress);
	console.log(userHedgeVolume);

	// Fetch profits and losses: WETH, USDT, USDC support only for now
	const userProfitLoss = await getUserProfitLoss(userAddress);
	console.log(userProfitLoss)

	// Fetch ETH to USD conversion rate
	const ethUsdPrice = getCurrentEthUsdcPriceFromUniswapV2();

	// Step 1: Convert lengths
	const userOptionsCreatedCount = userOptionsCreated.length;
	const userSwapsCreatedCount = userSwapsCreated.length;
	const userHedgesCreated = userOptionsCreatedCount + userSwapsCreatedCount;

	const userOptionsTakenCount = userOptionsTaken.length;
	const userSwapsTakenCount = userSwapsTaken.length;
	const userHedgesTaken = userOptionsTakenCount + userSwapsTakenCount;
	
	const userOptionsHistoryCount = userOptionsCreated.length + userOptionsTaken.length;
	const userSwapsHistoryCount = userSwapsCreated.length + userSwapsTaken.length;
	
	// Step 2: Convert amounts
	const userCreateVolumeWETH = Number(userHedgeVolume[0]);
	const userCreateVolumeUSDT = Number(userHedgeVolume[1]);
	const userCreateVolumeUSDC = Number(userHedgeVolume[2]);
	const userBuyVolumeWETH = Number(userHedgeVolume[3]);
	const userBuyVolumeUSDT = Number(userHedgeVolume[4]);
	const userBuyVolumeUSDC = Number(userHedgeVolume[5]);

	const userProfitWETH = Number(userProfitLoss[0]);
	const userProfitUSDT = Number(userProfitLoss[1]);
	const userProfitUSDC = Number(userProfitLoss[2]);
	const userLossWETH = Number(userProfitLoss[3]);
	const userLossUSDT = Number(userProfitLoss[4]);
	const userLossUSDC = Number(userProfitLoss[5]);

	const totalCreatedWETH = userCreateVolumeWETH + (userCreateVolumeUSDT / ethUsdPrice) + (userCreateVolumeUSDC / ethUsdPrice);
	const totalCreateTWETH = userBuyVolumeWETH + (userBuyVolumeUSDT / ethUsdPrice) + (userBuyVolumeUSDC / ethUsdPrice);
	const totalProfitTWETH = userProfitWETH + (userProfitUSDT / ethUsdPrice) + (userProfitUSDC / ethUsdPrice);
	const totalLossTWETH = userLossWETH + (userLossUSDT / ethUsdPrice) + (userLossUSDC / ethUsdPrice);

	updateSectionValues_Hedges(
		userHedgesCreated,
		userHedgesTaken,
		totalCreatedWETH,
		totalCreateTWETH,
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
	const userRewardsClaimed = await stakingInstance.methods.claimedRewardsStaking(userAddress).call();
	const userLiqRewardsClaimed = await stakingInstance.methods.claimedRewardsLiquidity(userAddress).call();
	const userColRewardsClaimed = await stakingInstance.methods.claimedRewardsCollateral(userAddress).call();
	
	// Fetch ETH to USD conversion rate
	const ethUsdPrice = getCurrentEthUsdcPriceFromUniswapV2();

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
	const depositedBalanceRaw = await hedgingInstance.methods.getUserTokenBalances(CONSTANTS.neonAddress, userAddress).call();
	const deposited = depositedBalanceRaw.deposited;
	const withdrawn = depositedBalanceRaw.withdrawn;
	// Staked versus Supply
	const totalStakedRaw = await stakingInstance.methods.getTotalStaked().call();
	const circulatingSupplyRaw = await neonInstance.methods.circulatingSupply(); 
	// Distrubuted ETH rewards to staking contract
	const distributedRewards = await stakingInstance.methods.ethRewardBasis().call();
	const distributedRewardsLiqu = await stakingInstance.methods.ethLiquidityRewardBasis().call();
	const distributedRewardsColl = await stakingInstance.methods.ethCollateralRewardBasis().call();
	// Claimed ETH rewards to staking contract
	const claimedRewards = await stakingInstance.methods.claimedRewardsStaking().call(userAddress);
	const claimedRewardsLiqu = await stakingInstance.methods.claimedRewardsLiquidity(userAddress).call();
	const claimedRewardsColl = await stakingInstance.methods.claimedRewardsCollateral(userAddress).call();
	// My pool assignments
	const assignmentsRaw = await stakingInstance.methods.getAssignedAndUnassignedAmounts(userAddress).call();
	const assignedMiningRaw = assignmentsRaw.assignedForMining;
	const assignedLiquidityRaw = assignmentsRaw.assignedForLiquidity;
	const assignedCollateralRaw = assignmentsRaw.assignedForCollateral;
	const unassignedRaw = assignmentsRaw.unassigned;

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
	const xeonAddress = CONSTANTS.neonAddress;
	const walletBalanceUSDT = getTokenUSDValue(xeonAddress, walletBalance);
	const stakedBalanceUSDT = getTokenUSDValue(xeonAddress, stakedBalance);
	const depositedBalanceUSDT = getTokenUSDValue(xeonAddress, depositedBalance);
	const withdrawnBalanceUSDT = getTokenUSDValue(xeonAddress, withdrawnBalance);
	const totalHoldingsUSDT = getTokenUSDValue(xeonAddress, totalHoldings);

	const totalStakedUSDT = getTokenUSDValue(xeonAddress, totalStaked);
	const circulatingSupplyUSDT = getTokenUSDValue(xeonAddress, circulatingSupply);

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