import { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, getTokenUSDValue, getTokenETHValue } from "./constants.js";
import { getWalletTokenList } from "./module-wallet-tokenlist-dependencies.js";
  
// Function to calculate the total USD value of all token balances
async function getCurrentBalancesValue(walletAddress) {
    const transactedTokensArray = await getWalletTokenList(walletAddress);
    let totalUSDValue = 0;
    for (const underlyingTokenAddr of transactedTokensArray) {
        const result = await hedgingInstance.getUserTokenBalances(underlyingTokenAddr, walletAddress);
        const deposited = result[0];
        const withdrawn = result[1];
        const ethUsdPrice = getCurrentEthUsdcPriceFromUniswapV2();
        // Wei input for getTokenUSDValue
        const currentBalance = deposited - withdrawn;
        // Get the USD value for the token balance
		const usdValue = await getTokenUSDValue(underlyingTokenAddr, currentBalance);
        totalUSDValue += usdValue;
		console.log("underlying "+underlyingTokenAddr+", balance "+currentBalance+", usd "+usdValue+", total "+totalUSDValue+", ethusd "+ethUsdPrice+" -- from array: "+transactedTokensArray);
    }
    return totalUSDValue;
}

// Function to calculate staked tokens value
async function calculateStakedTokensValueETH(walletAddress) {
	const stakedBalanceRaw = await stakingInstance.getStakedBalance(walletAddress);
	const [stakedTokensValueETH, pairedSymbol] = await getTokenETHValue(CONSTANTS.wethAddress, stakedBalanceRaw);
  
	return stakedTokensValueETH;
}

// Function to calculate dividents due for claiming
async function calculateRewardsDue() {
    const rewardsDue = await stakingInstance.getRewardsDue();
    const rewardsDueETH = new BigNumber(rewardsDue).div(1e18);

    // Convert rewardsDueETH to a JavaScript number
    const rewardsDueETHNumber = Number(rewardsDueETH);
    return rewardsDueETHNumber;
}


// Function to calculate commission
async function calculateCommissionDueETH() {
	const liquidityRewardsDue = await stakingInstance.getLiquidityRewardsDue();
	const collateralRewardsDue = await stakingInstance.getCollateralRewardsDue();
	const liquidityRewardsDueETH = new BigNumber(liquidityRewardsDue).div(1e18);
	const collateralRewardsDueETH = new BigNumber(collateralRewardsDue).div(1e18);
	const commissionDueETH = liquidityRewardsDueETH + collateralRewardsDueETH;
  
	return [commissionDueETH, liquidityRewardsDueETH, collateralRewardsDueETH];
}

// Export the fetch functions
export { getCurrentBalancesValue, calculateStakedTokensValueETH, calculateRewardsDue, calculateCommissionDueETH };