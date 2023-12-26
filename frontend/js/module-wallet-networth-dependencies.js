import { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, getTokenUSDValue, getTokenETHValue } from "./constants.js";
import { getWalletTokenList } from "./module-wallet-tokenlist-dependencies.js";
  
// Function to calculate the total USD value of all token balances
async function getCurrentBalancesValue(walletAddress) {
    const transactedTokensArray = await getWalletTokenList(walletAddress);
    let totalUSDValue = new BigNumber(0); // Initialize as a BigNumber
    for (const underlyingTokenAddr of transactedTokensArray) {
        const result = await hedgingInstance.methods.getUserTokenBalances(underlyingTokenAddr, walletAddress).call();
        const deposited = result[0];
        const withdrawn = result[1];
        const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();
        // Convert deposited and withdrawn balances to BigNumber and handle 1e18 format
        const depositedBalance = new BigNumber(deposited).div(new BigNumber(10).pow(18));
        const withdrawnBalance = new BigNumber(withdrawn).div(new BigNumber(10).pow(18));
        const currentBalance = depositedBalance.minus(withdrawnBalance);
        // Get the USD value for the token balance
        const usdValue = await getTokenUSDValue(underlyingTokenAddr, currentBalance, ethUsdPrice);
        totalUSDValue = totalUSDValue.plus(usdValue);
    }
    return totalUSDValue;
}

// Function to calculate staked tokens value
async function calculateStakedTokensValueETH(walletAddress) {
	const stakedBalanceRaw = await stakingInstance.methods.getStakedBalance(walletAddress).call();
	const [stakedTokensValueETH, pairedSymbol] = await getTokenETHValue(CONSTANTS.wethAddress, stakedBalanceRaw);
  
	return stakedTokensValueETH;
}

// Function to calculate dividents due for claiming
async function calculateRewardsDue(walletAddress) {
    const rewardsDue = await stakingInstance.methods.getRewardsDue().call({ from: walletAddress });
    const rewardsDueETH = new BigNumber(rewardsDue).div(1e18);

    // Convert rewardsDueETH to a JavaScript number
    const rewardsDueETHNumber = Number(rewardsDueETH);
    return rewardsDueETHNumber;
}


// Function to calculate commission
async function calculateCommissionDueETH(walletAddress) {
	const liquidityRewardsDue = await stakingInstance.methods.getLiquidityRewardsDue().call({ from: walletAddress });
	const collateralRewardsDue = await stakingInstance.methods.getCollateralRewardsDue().call({ from: walletAddress });
	const liquidityRewardsDueETH = new BigNumber(liquidityRewardsDue).div(1e18);
	const collateralRewardsDueETH = new BigNumber(collateralRewardsDue).div(1e18);
	const commissionDueETH = liquidityRewardsDueETH.plus(collateralRewardsDueETH);
  
	return [commissionDueETH, liquidityRewardsDueETH, collateralRewardsDueETH];
}

// Export the fetch functions
export { getCurrentBalancesValue, calculateStakedTokensValueETH, calculateRewardsDue, calculateCommissionDueETH };