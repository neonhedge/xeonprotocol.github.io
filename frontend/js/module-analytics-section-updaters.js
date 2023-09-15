
//*======================================================*/
// Functions to update the sections with the new values
//*======================================================*/

// 1. Update Section Values - Traffic Panel
//----------------------------------------------------
async function updateSectionValues_Traffic(activeWallets, activeERC20S, transactionVolume, hedgeVolume, totalDepositWeth, totalDepositUSDT, totalDepositUSDC, totalDepositERC20, totalDepositERC20_weth, totalWithdrawalWeth, totalWithdrawalUSDT, totalWithdrawalUSDC, totalWithdrawalERC20, totalWithdrawalERC20_weth) {
    
    // Format Amounts
    const formatAmount = (amount) => {
        return amount.toFixed(2);
    };

    // Format values
    const formatValue = (value) => {
        return `$${value.toFixed(2)}`;
    };

    // Fetch current ETH price in USD
    const ethUsdcPrice = await getCurrentEthUsdcPriceFromUniswapV2();

    // Convert values to USD
    const totalDepositWethUSD = totalDepositWeth.times(ethUsdcPrice);
    const totalWithdrawalWethUSD = totalWithdrawalWeth.times(ethUsdcPrice);
    const transactionVolumeUSD = transactionVolume.times(ethUsdcPrice);
    const hedgeVolumeUSD = hedgeVolume.times(ethUsdcPrice);

    // Update active wallets value
    document.getElementById("activeWalletsValue").textContent = activeWallets.toString();

    // Update active ERC20s value
    document.getElementById("activeTokensValue").textContent = activeERC20S.toString();

    // Update transaction volume value
    document.getElementById("swapsCountValue").textContent = formatValue(transactionVolumeUSD);

    // Update hedge volume value
    document.getElementById("hedgeVolumeValue").textContent = formatValue(hedgeVolumeUSD);

    // Update total deposits
    const totalDeposits = totalDepositWethUSD.plus(totalDepositUSDT).plus(totalDepositUSDC).plus(totalDepositERC20);
    document.getElementById("totalDepositsValue").textContent = formatValue(totalDeposits);

    // Update individual deposit amounts
    document.getElementById("deposits_wethAmnt").textContent = totalDepositWeth.toString();
    document.getElementById("deposits_wethValue").textContent = formatValue(totalDepositWethUSD);

    document.getElementById("deposits_usdcAmnt").textContent = totalDepositUSDC.toString();
    document.getElementById("deposits_usdcValue").textContent = formatValue(totalDepositUSDC);

    document.getElementById("deposits_usdtAmnt").textContent = totalDepositUSDT.toString();
    document.getElementById("deposits_usdtValue").textContent = formatValue(totalDepositUSDT);

    document.getElementById("deposits_erc20Amnt").textContent = formatAmount(totalDepositERC20_weth);
    document.getElementById("deposits_erc20Value").textContent = formatValue(totalDepositERC20);

    // Update total withdrawals
    const totalWithdrawals = totalWithdrawalWethUSD.plus(totalWithdrawalUSDT).plus(totalWithdrawalUSDC).plus(totalWithdrawalERC20);
    document.getElementById("totalWithdrawalsValue").textContent = formatValue(totalWithdrawals);

    // Update individual withdrawal amounts
    document.getElementById("withdrawals_wethAmnt").textContent = totalWithdrawalWeth.toString();
    document.getElementById("withdrawals_wethValue").textContent = formatValue(totalWithdrawalWethUSD);

    document.getElementById("withdrawals_usdcAmnt").textContent = totalWithdrawalUSDC.toString();
    document.getElementById("withdrawals_usdcValue").textContent = formatValue(totalWithdrawalUSDC);

    document.getElementById("withdrawals_usdtAmnt").textContent = totalWithdrawalUSDT.toString();
    document.getElementById("withdrawals_usdtValue").textContent = formatValue(totalWithdrawalUSDT);

    document.getElementById("withdrawals_erc20Amnt").textContent = formatAmount(totalWithdrawalERC20_weth);
    document.getElementById("withdrawals_erc20Value").textContent = formatValue(totalWithdrawalERC20);
}

// 2. Update Section Values - Hedges Panel
//----------------------------------------------------
function updateSectionValues_hedges(hedgesTraded, hedgesCreated, swapsVolume, optionsVolume, settledVolume, hedgeCostsTotal, hedgeProfits, hedgeFees, cashierFees) {
    // Format values
    const formatValue = (value) => {
      return `$${value.toFixed(2)}`;
    };
  
    // Update hedges traded and created
    document.getElementById("hedgesTraded").textContent = formatValue(hedgesTraded);
    document.getElementById("hedgesCreated").textContent = formatValue(hedgesCreated);
  
    // Update swaps volume and options volume
    document.getElementById("swapsVolume").textContent = formatValue(swapsVolume);
    document.getElementById("optionsVolume").textContent = formatValue(optionsVolume);
  
    // Update hedge costs total
    document.getElementById("hedgeCostsTotal").textContent = formatValue(hedgeCostsTotal);
    document.getElementById("hedgeValueTotal").textContent = formatValue(hedgesTraded);
  
    // Update hedge profits and losses
    document.getElementById("hedgeProfits").textContent = formatValue(hedgeProfits);
    document.getElementById("hedgeFees").textContent = formatValue(hedgeFees);
}

// 3. Update Section Values - Earnings Panel
//----------------------------------------------------
function updateSectionValues_Earnings(
    totalRevenueEth,
    totalRevenueUsd,
    cashierRevenueEth,
    cashierRevenueUsd,
    hedgeRevenueEth,
    hedgeRevenueUsd,
    tokenTaxRevenueEth,
    tokenTaxRevenueUsd,
    minerFeesEth,
    minerFeesUsd,
    distributedEth,
    distributedUsd,
    totalClaimedEth,
    totalClaimedUsd,
    totalUnclaimedEth,
    totalUnclaimedUsd,
    minedHedgesCount,
    minedHedgesUsd,
    minersCount,
    totalStakers
  ){
    // Format amounts
    const formatAmount = (amount) => {
      return amount.toFixed(2);
    };
  
    // Format values
    const formatValue = (value) => {
      return `$${value.toFixed(2)}`;
    };

    // Update cashier fees
    document.getElementById("cashierRevenueAmnt").textContent = formatAmount(cashierRevenueEth);
    document.getElementById("cashierRevenueValue").textContent = formatValue(cashierRevenueUsd);
  
    // Update hedge revenue
    document.getElementById("hedgeRevenueAmnt").textContent = formatAmount(hedgeRevenueEth);
    document.getElementById("hedgeRevenueValue").textContent = formatValue(hedgeRevenueUsd);
  
    // Update tax revenue
    document.getElementById("taxRevenueAmnt").textContent = formatAmount(tokenTaxRevenueEth);
    document.getElementById("taxRevenueValue").textContent = formatValue(tokenTaxRevenueUsd);
  
    // Update total revenues    
    document.getElementById("totalRevenueAmnt").textContent = formatAmount(totalRevenueEth);
    document.getElementById("totalRevenueValue").textContent = formatValue(totalRevenueUsd);

    // Update distributed
    document.getElementById("totalRevenueDistrAmnt").textContent = formatValue(distributedEth);
    document.getElementById("totalRevenueDistrValue").textContent = formatValue(distributedUsd);
  
    // Update total claimed
    document.getElementById("totalClaimedAmnt").textContent = formatAmount(totalClaimedEth);
    document.getElementById("totalClaimedValue").textContent = formatValue(totalClaimedUsd);
  
    // Update total unclaimed
    document.getElementById("totalUnclaimedAmnt").textContent = formatAmount(totalUnclaimedEth);
    document.getElementById("totalUnclaimedValue").textContent = formatValue(totalUnclaimedUsd);

    // Update miner fees
    document.getElementById("minerFeesAmnt").textContent = formatAmount(minerFeesEth);
    document.getElementById("minerFeesValue").textContent = formatValue(minerFeesUsd);

    // Update miners stats  
    document.getElementById("minedHedgesCount").textContent = minedHedgesCount;
    document.getElementById("minedHedgesValue").textContent = formatValue(minedHedgesUsd);
    document.getElementById("minersCount").textContent = minersCount;
  
    // Update total stakers
    document.getElementById("totalStakers").textContent = totalStakers;
  
    // Calculate and update total fees
    const totalFeesEth = minerFeesEth.plus(protocolFeesEth);
    const totalFeesUsd = minerFeesUsd.plus(protocolFeesUsd);
    document.getElementById("totalFeesValue").textContent = formatValue(totalFeesUsd);
}

// 4. Fetch Section Values - Staking Panel
//----------------------------------------------------
async function fetchSection_StakingPanel(){
	
	// Staked versus Supply
	const totalStakedRaw = await stakingInstance.methods.getTotalStaked().call();
	const circulatingSupplyRaw = await tokenInst.circulatingSupply(); 
  const totalStakersRaw = await tokenInst.getTotalStakers(); 
	// Distrubuted ETH rewards to staking contract
	const distributedRewards = await stakingInstance.methods.ethRewardBasis().call();
	const distributedRewardsLiqu = await stakingInstance.methods.ethLiquidityRewardBasis().call();
	const distributedRewardsColl = await stakingInstance.methods.ethCollateralRewardBasis().call();
	// Claimed ETH rewards to staking contract
	const claimedRewards = await stakingInstance.methods.rewardsClaimed().call();
	const claimedRewardsLiqu = await stakingInstance.methods.rewardsClaimedLiquidity().call();
	const claimedRewardsColl = await stakingInstance.methods.rewardsClaimedCollateral().call();
	
	// Fetch ETH to USD conversion rate
	const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

	// Step 1: Convert amounts
	const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;
	
	// Step 2: Convert ETH values
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
		claimedRewardsTotalUSDT
	);

}

function updateSectionValues_Tokenomics(symbol, decimals, contractAddress, buyTax, sellTax, priceTWETH, priceTUSD, burntSupply, circulatingSupply, totalSupply) {
    // Format amounts
    const formatAmount = (amount) => {
        return amount.toFixed(2);
    };
    
    // Format values
    const formatValue = (value) => {
        return `$${value.toFixed(2)}`;
    };
  
      // Update
      document.getElementById("tokenoSymbol").textContent = symbol;
      document.getElementById("tokenoDecimals").textContent = decimals;
      document.getElementById("tokenoCA").textContent = contractAddress;
      document.getElementById("tokenoTaxes").textContent = buyTax + '/' + sellTax;
    
      // Update price
      document.getElementById("tokenoPriceUSD").textContent = formatAmount(priceTUSD);
    
      // Update supply  
      document.getElementById("tokenoBurnt").textContent = formatValue(burntSupply);
      document.getElementById("tokenoCirculating").textContent = formatValue(circulatingSupply);
      document.getElementById("tokenoTotalSupply").textContent = formatValue(totalSupply);
}

// Export the fetch functions
export { updateSectionValues_Traffic, updateSectionValues_hedges, updateSectionValues_Earnings, updateSectionValues_Tokenomics };