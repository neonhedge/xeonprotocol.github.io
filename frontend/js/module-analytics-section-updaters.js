
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

function updateSectionValues_Staking(
  totalStakers,
  totalStaked,
  totalStakedUSDT,
  circulatingSupply,
  circulatingSupplyUSDT,
  totalAssigned,
  totalAssignedUSDT,
  totalUnassigned,
  totalUnassignedUSDT,
  totalAssignmentsRewardsEth,
  totalAssignmentRewardsUSDT,
  AssignedRewardsMin,
  AssignedRewardsMinUSDT,
  AssignedRewardsCol,
  AssignedRewardsColUSDT,
  AssignedRewardsLiq,
  AssignedRewardsLiqUSDT
) {
  // Format amounts
  const formatAmount = (amount) => {
    return amount.toFixed(2);
  };

  // Format values
  const formatValue = (value) => {
    return `$${value.toFixed(2)}`;
  };

  // Update staked versus circulating totals
  document.getElementById("stakedAmount").textContent = formatAmount(totalStaked);
  document.getElementById("stakedValue").textContent = formatValue(totalStakedUSDT);
  document.getElementById("circAmount").textContent = formatAmount(circulatingSupply);
  document.getElementById("circValue").textContent = formatValue(circulatingSupplyUSDT);
  document.getElementById("stakersCount").textContent = formatAmount(totalStakers);

  // Update assigned totals
  document.getElementById("assignedStakesAmnt").textContent = formatAmount(totalAssigned);
  document.getElementById("assignedStakesValue").textContent = formatValue(totalAssignedUSDT);

  // Update unassigned totals
  document.getElementById("unAssignedStakesAmnt").textContent = formatAmount(totalUnassigned);
  document.getElementById("unAssignedStakesValue").textContent = formatValue(totalUnassignedUSDT);

  // Update assignment rewards
  document.getElementById("assignmentRewardsAmnt").textContent = formatAmount(totalAssignmentsRewardsEth);
  document.getElementById("assignmentRewardsValue").textContent = formatAmount(totalAssignmentRewardsUSDT);

  // Update assignment pools
  document.getElementById("assignedLiquidityAmnt").textContent = formatValue(AssignedRewardsLiq);
  document.getElementById("assignedLiquidityValue").textContent = formatValue(AssignedRewardsLiqUSDT);
  document.getElementById("assignedCollateralAmnt").textContent = formatValue(AssignedRewardsCol);
  document.getElementById("assignedCollateralValue").textContent = formatValue(AssignedRewardsColUSDT);
  document.getElementById("assignedMiningAmnt").textContent = formatValue(AssignedRewardsMin);
  document.getElementById("assignedMiningValue").textContent = formatValue(AssignedRewardsMinUSDT);

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
export { updateSectionValues_Traffic, updateSectionValues_hedges, updateSectionValues_Earnings, updateSectionValues_Staking, updateSectionValues_Tokenomics };