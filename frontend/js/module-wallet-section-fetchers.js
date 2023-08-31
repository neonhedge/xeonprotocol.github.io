import { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, getTokenETHValue } from './constants.js';
import { updateSectionValues_Traffic, updateSectionValues_hedges, updateSectionValues_Earnings, updateSectionValues_Tokenomics } from './module-analytics-section-updaters.js';
import { updateChartValues_Cash, updateChartValues_PIE, updateChartValues_hedges, updateChartValues_Revenue, updateChartValues_Dividents, updateChartValues_Claims, updateChartValues_Staking, updateChartValues_Tokenomics } from './module-analytics-chart-updaters.js';

async function setCurrent_TrafficSection() {
    // Step 1: Read
    const wethBalances = await hedgingInstance.methods.contractBalanceMap(CONSTANTS.wethAddress).call();
    const wethDeposits = wethBalances[0];
    const wethWithdrawals = wethBalances[1];
    const usdtBalances = await hedgingInstance.methods.contractBalanceMap(CONSTANTS.usdtAddress).call();
    const usdtDeposits = usdtBalances[0];
    const usdtWithdrawals = usdtBalances[1];
    const usdcBalances = await hedgingInstance.methods.contractBalanceMap(CONSTANTS.usdcAddress).call();
    const usdcDeposits = usdcBalances[0];
    const usdcWithdrawals = usdcBalances[1];
    const erc20Deposits = await hedgingInstance.methods.getErc20Deposits().call();
    const wethERC20Deposits = erc20Deposits[0];
    const usdtERC20Deposits = erc20Deposits[1];
    const usdcERC20Deposits = erc20Deposits[2];
    const erc20Withdrawals = await hedgingInstance.methods.getErc20Withdrawals().call();
    const wethERC20Withdrawals = erc20Withdrawals[0];
    const usdtERC20Withdrawals = erc20Withdrawals[1];
    const usdcERC20Withdrawals = erc20Withdrawals[2];
    // Step 2: ETH USD price
    const ethUsdcPrice = await getCurrentEthUsdcPriceFromUniswapV2();
    
    // Step 3: Convert WETH amounts
    const wethDecimals = 18; 
    const totalDepositWeth = new BigNumber(wethDeposits).div(10 ** wethDecimals);
    const totalWithdrawalWeth = new BigNumber(wethWithdrawals).div(10 ** wethDecimals);

    // Step 4: Convert USDT amounts
    const usdtDecimals = 6; 
    const totalDepositUSDT = new BigNumber(usdtDeposits).div(10 ** usdtDecimals);
    const totalWithdrawalUSDT = new BigNumber(usdtWithdrawals).div(10 ** usdtDecimals);

    // Step 5: Convert USDC amounts
    const usdcDecimals = 6;
    const totalDepositUSDC = new BigNumber(usdcDeposits).div(10 ** usdcDecimals);
    const totalWithdrawalUSDC = new BigNumber(usdcWithdrawals).div(10 ** usdcDecimals);

    // Step 6: Convert ERC20 amounts
    const totalDepositERC20weth = new BigNumber(wethERC20Deposits).div(10 ** wethDecimals);
    const totalWithdrawalERC20weth = new BigNumber(wethERC20Withdrawals).div(10 ** wethDecimals);
    const totalDepositERC20usdt = new BigNumber(usdtERC20Deposits).div(10 ** usdtDecimals);
    const totalWithdrawalERC20usdt = new BigNumber(usdtERC20Withdrawals).div(10 ** usdtDecimals);
    const totalDepositERC20usdc = new BigNumber(usdcERC20Deposits).div(10 ** usdcDecimals);
    const totalWithdrawalERC20usdc = new BigNumber(usdcERC20Withdrawals).div(10 ** usdcDecimals);

    // Step 7: Calculate the total deposit amount in USD
    const totalDepositAmountUsd = (totalDepositWeth.times(ethUsdcPrice))
        .plus(totalDepositUSDT)
        .plus(totalDepositUSDC)
        .plus(totalDepositERC20weth.times(ethUsdcPrice))
        .plus(usdtERC20Deposits)
        .plus(usdcERC20Deposits);

    // Step 8: Calculate the total withdrawal amount in USD
    const totalWithdrawalAmountUsd = (totalWithdrawalWeth.times(ethUsdcPrice))
        .plus(totalWithdrawalUSDT)
        .plus(totalWithdrawalUSDC)
        .plus(totalWithdrawalERC20weth.times(ethUsdcPrice))
        .plus(usdtERC20Withdrawals)
        .plus(usdcERC20Withdrawals);

    // Step X: Calculate ERC20 total deposits
    const totalDepositERC20_weth = totalDepositERC20weth.plus(totalDepositERC20usdt.div(ethUsdcPrice)).plus(totalDepositERC20usdc.div(ethUsdcPrice));
    const totalDepositERC20 = totalDepositERC20_weth.times(ethUsdcPrice);

    const totalWithdrawalERC20_weth = totalDepositERC20weth.plus(totalWithdrawalERC20usdt.div(ethUsdcPrice)).plus(totalWithdrawalERC20usdc.div(ethUsdcPrice));
    const totalWithdrawalERC20 = totalWithdrawalERC20_weth.times(ethUsdcPrice);

    // Step X: Calculate the total transaction volume in USD
    const transactionVolume = totalDepositAmountUsd.plus(totalWithdrawalAmountUsd);

    const activeERC20S = await hedgingInstance.methods.getDepositedTokensLength().call();

    // Update the section with current values from protocol
    updateSectionValues_Traffic(
        activeWallets, 
        activeERC20S, 
        transactionVolume, 
        hedgeVolume, 
        totalDepositWeth, 
        totalDepositUSDT, 
        totalDepositUSDC, 
        totalDepositERC20, 
        totalWithdrawalWeth, 
        totalWithdrawalUSDT, 
        totalWithdrawalUSDC, 
        totalWithdrawalERC20
    );

    // Update the section charts
    updateChartValues_Cash(totalDepositAmountUsd, totalWithdrawalAmountUsd);
}

async function setCurrent_HedgeSection() {
    // Fetch manually base address by base address. erc20s are sold at 10% discount in weth
    // Reading direct from solidity mappings
    const hedgesCreatedWETH = await contractInstance.hedgesCreatedVolume(CONSTANTS.wethAddress);
    const hedgesCreatedUSDT = await contractInstance.hedgesCreatedVolume(CONSTANTS.usdtAddress);
    const hedgesCreatedUSDC = await contractInstance.hedgesCreatedVolume(CONSTANTS.usdcAddress);

    const hedgesTradedWETH = await contractInstance.hedgesTakenVolume(CONSTANTS.wethAddress);
    const hedgesTradedUSDT = await contractInstance.hedgesTakenVolume(CONSTANTS.usdtAddress);
    const hedgesTradedUSDC = await contractInstance.hedgesTakenVolume(CONSTANTS.usdcAddress);

    const hedgeCostsWETH = await contractInstance.hedgesCostVolume(CONSTANTS.wethAddress);
    const hedgeCostsUSDT = await contractInstance.hedgesCostVolume(CONSTANTS.usdtAddress);
    const hedgeCostsUSDC = await contractInstance.hedgesCostVolume(CONSTANTS.usdcAddress);

    const optionsVolumeWETH = await contractInstance.optionsVolume(CONSTANTS.wethAddress);
    const optionsVolumeUSDT = await contractInstance.optionsVolume(CONSTANTS.usdtAddress);
    const optionsVolumeUSDC = await contractInstance.optionsVolume(CONSTANTS.usdcAddress);

    const swapsVolumeWETH = await contractInstance.swapsVolume(CONSTANTS.wethAddress);
    const swapsVolumeUSDT = await contractInstance.swapsVolume(CONSTANTS.usdtAddress);
    const swapsVolumeUSDC = await contractInstance.swapsVolume(CONSTANTS.usdcAddress);
    
    const settledVolumeWETH = await contractInstance.settledVolume(CONSTANTS.wethAddress);
    const settledVolumeUSDT = await contractInstance.settledVolume(CONSTANTS.usdtAddress);
    const settledVolumeUSDC = await contractInstance.settledVolume(CONSTANTS.usdcAddress);
    
    const hedgeProfitsWETH = await contractInstance.protocolBaseProfits(CONSTANTS.wethAddress);
    const hedgeProfitsUSDT = await contractInstance.protocolBaseProfits(CONSTANTS.usdtAddress);
    const hedgeProfitsUSDC = await contractInstance.protocolBaseProfits(CONSTANTS.usdcAddress);

    const hedgeFeesWETH = await contractInstance.protocolBaseFees(CONSTANTS.wethAddress);
    const hedgeFeesUSDT = await contractInstance.protocolBaseFees(CONSTANTS.usdtAddress);
    const hedgeFeesUSDC = await contractInstance.protocolBaseFees(CONSTANTS.usdcAddress);

    const cashierFeesWETH = await contractInstance.protocolCashierFees(CONSTANTS.wethAddress);
    const cashierFeesUSDT = await contractInstance.protocolCashierFees(CONSTANTS.usdtAddress);
    const cashierFeesUSDC = await contractInstance.protocolCashierFees(CONSTANTS.usdcAddress);
  
    // Fetch ETH to USD conversion rate
    const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

    // Step 3: Convert WETH amounts
    const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;

    const hedgesCreatedEth = new BigNumber(hedgesCreatedWETH).div(10 ** wethDecimals);
    const hedgesCreatedUsdt = new BigNumber(hedgesCreatedUSDT).div(10 ** usdtDecimals);
    const hedgesCreatedUsdc = new BigNumber(hedgesCreatedUSDC).div(10 ** usdcDecimals);
    const hedgesCreatedTUSD = (hedgesCreatedEth * ethUsdPrice) + hedgesCreatedUsdt + hedgesCreatedUsdc;
    
    const hedgesTradedEth = new BigNumber(hedgesTradedWETH).div(10 ** wethDecimals);
    const hedgesTradedUsdt = new BigNumber(hedgesTradedUSDT).div(10 ** usdtDecimals);
    const hedgesTradedUsdc = new BigNumber(hedgesTradedUSDC).div(10 ** usdcDecimals);
    const hedgesTradedTUSD = (hedgesTradedEth * ethUsdPrice) + hedgesTradedUsdt + hedgesTradedUsdc;

    const hedgeCostsEth = new BigNumber(hedgeCostsWETH).div(10 ** wethDecimals);
    const hedgeCostsUsdt = new BigNumber(hedgeCostsUSDT).div(10 ** usdtDecimals);
    const hedgeCostsUsdc = new BigNumber(hedgeCostsUSDC).div(10 ** usdcDecimals);
    const hedgeCostsTUSD = (hedgeCostsEth * ethUsdPrice) + hedgeCostsUsdt + hedgeCostsUsdc;

    const optionsVolumeEth = new BigNumber(optionsVolumeWETH).div(10 ** wethDecimals);
    const optionsVolumeUsdt = new BigNumber(optionsVolumeUSDT).div(10 ** usdtDecimals);
    const optionsVolumeUsdc = new BigNumber(optionsVolumeUSDC).div(10 ** usdcDecimals);
    const optionsVolumeTUSD = (optionsVolumeEth * ethUsdPrice) + optionsVolumeUsdt + optionsVolumeUsdc;

    const swapsVolumeEth = new BigNumber(swapsVolumeWETH).div(10 ** wethDecimals);
    const swapsVolumeUsdt = new BigNumber(swapsVolumeUSDT).div(10 ** usdtDecimals);
    const swapsVolumeUsdc = new BigNumber(swapsVolumeUSDC).div(10 ** usdcDecimals);
    const swapsVolumeTUSD = (swapsVolumeEth * ethUsdPrice) + swapsVolumeUsdt + swapsVolumeUsdc; 
    
    const settledVolumeEth = new BigNumber(settledVolumeWETH).div(10 ** wethDecimals);
    const settledVolumeUsdt = new BigNumber(settledVolumeUSDT).div(10 ** usdtDecimals);
    const settledVolumeUsdc = new BigNumber(settledVolumeUSDC).div(10 ** usdcDecimals);
    const settledVolumeTUSD = (settledVolumeEth * ethUsdPrice) + settledVolumeUsdt + settledVolumeUsdc; 

    const hedgeProfitsEth = new BigNumber(hedgeProfitsWETH).div(10 ** wethDecimals);
    const hedgeProfitsUsdt = new BigNumber(hedgeProfitsUSDT).div(10 ** usdtDecimals);
    const hedgeProfitsUsdc = new BigNumber(hedgeProfitsUSDC).div(10 ** usdcDecimals);
    const hedgeProfitsTUSD = (hedgeProfitsEth * ethUsdPrice) + hedgeProfitsUsdt + hedgeProfitsUsdc;

    const hedgeFeesEth = new BigNumber(hedgeFeesWETH).div(10 ** wethDecimals);
    const hedgeFeesUsdt = new BigNumber(hedgeFeesUSDT).div(10 ** usdtDecimals);
    const hedgeFeesUsdc = new BigNumber(hedgeFeesUSDC).div(10 ** usdcDecimals);
    const hedgeFeesTUSD = (hedgeFeesEth * ethUsdPrice) + hedgeFeesUsdt + hedgeFeesUsdc;

    const cashierFeesEth = new BigNumber(cashierFeesWETH).div(10 ** wethDecimals);
    const cashierFeesUsdt = new BigNumber(cashierFeesUSDT).div(10 ** usdtDecimals);
    const cashierFeesUsdc = new BigNumber(cashierFeesUSDC).div(10 ** usdcDecimals);
    const cashierFeesTUSD = (cashierFeesEth * ethUsdPrice) + cashierFeesUsdt + cashierFeesUsdc;
  
    // Convert ETH values to USD
    const hedgesTradedTWETH = hedgesTradedTUSD.div(ethUsdPrice);
    const hedgesCreatedTWETH = hedgesCreatedTUSD.div(ethUsdPrice);
    const swapsVolumeTWETH = swapsVolumeTUSD.div(ethUsdPrice);
    const optionsVolumeTWETH = optionsVolumeTUSD.div(ethUsdPrice);
    const settledVolumeTWETH = settledVolumeTUSD.div(ethUsdPrice);
    const hedgeCostsTWETH = hedgeCostsTUSD.div(ethUsdPrice);
    const hedgeProfitsTWETH = hedgeProfitsTUSD.div(ethUsdPrice);
    const hedgeFeesTWETH = hedgeFeesTUSD.div(ethUsdPrice);
  
    // Call the updateSectionValues_hedges function
    updateSectionValues_hedges(
        hedgesTradedTUSD,
        hedgesCreatedTUSD,
        swapsVolumeTUSD,
        optionsVolumeTUSD,        
        settledVolumeTUSD,
        hedgeCostsTUSD,
        hedgeProfitsTUSD,
        hedgeFeesTUSD,
        cashierFeesTUSD
    );

    updateChartValues_hedges(1, hedgesTradedTUSD, hedgesCreatedTUSD);
    updateChartValues_hedges(2, swapsVolumeTUSD, optionsVolumeTUSD);
    updateChartValues_hedges(3, hedgeCostsTUSD, hedgesTradedTUSD);
    updateChartValues_hedges(4, hedgeProfitsTUSD, hedgeFeesTUSD);
}

async function setCurrent_EarningsSection() {
  // Assuming you have a contract instance named 'contractInstance' to interact with your Solidity contract
  // Returned as (weth, usdt, usdc, erc20s) erc20s are sold at 10% discount in weth
  const totalProtocolRevenue = await contractInstance.getProtocolRevenue();

  const cashierFeesWETH = await contractInstance.protocolCashierFees(CONSTANTS.wethAddress);
  const cashierFeesUSDT = await contractInstance.protocolCashierFees(CONSTANTS.usdtAddress);
  const cashierFeesUSDC = await contractInstance.protocolCashierFees(CONSTANTS.usdcAddress);

  const hedgeFeesWETH = await contractInstance.protocolBaseFees(CONSTANTS.wethAddress);
  const hedgeFeesUSDT = await contractInstance.protocolBaseFees(CONSTANTS.usdtAddress);
  const hedgeFeesUSDC = await contractInstance.protocolBaseFees(CONSTANTS.usdcAddress);

  const tokentaxRevenue = await contractInstance.getTokenTaxesValue(); //tax from Token Dex Swapping, returns weth only
  
  const totalDistributed = await contractInstance.getTotalDistributed(); // total WETH withdrawn to staking contract. All rewards converted to WETH
  const totalClaimedWei = await contractInstance.getTotalClaimed(); // withdrawn to staking contract for claiming. pie chart with: withdrawn Vs claimed
  const totalUnclaimedWei = await contractInstance.getTotalUnclaimed(); // = deposited - withdrawn.
  const totalStakers = 1000; // to be developed. address(this) withdraws from userMapBalances to staking contract only
  const minedHedgesCount = 10;
  const minersCount = 5;
  
  // Fetch ETH to USD conversion rate
  const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

  // Step 3: Convert WETH amounts
  const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;
  
  // - Hedge Revenue = 5% Settlement Fee on profits
  // - Miner Fees = 15% of above, to miners settling hedges in real time manually
  // - Token Tax Revenue is Buy/Sell tax on NEON token
  // - Cashier Revenue = withdrawal charges on major base pairs; WETH, USDT, USDC
  //const totalRevenueEth = (hedgeRevenueEth - minerFeesEth) + tokenTaxRevenueEth + cashierRevenueEth;

  const totalRevenueEth = new BigNumber(totalProtocolRevenue[0]).div(10 ** wethDecimals);
  const totalRevenueUsdt = new BigNumber(totalProtocolRevenue[1]).div(10 ** usdtDecimals);
  const totalRevenueUsdc = new BigNumber(totalProtocolRevenue[2]).div(10 ** usdcDecimals);
  const totalRevenueTUSD = (totalRevenueEth * ethUsdPrice) + totalRevenueUsdt + totalRevenueUsdc;

  const cashierFeesEth = new BigNumber(cashierFeesWETH).div(10 ** wethDecimals);
  const cashierFeesUsdt = new BigNumber(cashierFeesUSDT).div(10 ** usdtDecimals);
  const cashierFeesUsdc = new BigNumber(cashierFeesUSDC).div(10 ** usdcDecimals);
  const cashierRevenueTUSD = (cashierFeesEth * ethUsdPrice) + cashierFeesUsdt + cashierFeesUsdc;

  const hedgeFeesEth = new BigNumber(hedgeFeesWETH).div(10 ** wethDecimals);
  const hedgeFeesUsdt = new BigNumber(hedgeFeesUSDT).div(10 ** usdtDecimals);
  const hedgeFeesUsdc = new BigNumber(hedgeFeesUSDC).div(10 ** usdcDecimals);
  const hedgeRevenueTUSD = (hedgeFeesEth * ethUsdPrice) + hedgeFeesUsdt + hedgeFeesUsdc;

  const tokenTaxRevenueEth = new BigNumber(tokentaxRevenue).div(10 ** wethDecimals);
  const tokenTaxRevenueTUSD = (tokenTaxRevenueEth * ethUsdPrice);
  // Convert remaining
  const distributedTWETH = web3.utils.fromWei(totalDistributed, 'ether');
  const totalClaimedTWETH = web3.utils.fromWei(totalClaimedWei, 'ether');
  const totalUnclaimedTWETH = web3.utils.fromWei(totalUnclaimedWei, 'ether');  
  // Convert USD values to WETH
  const minerFeesTWETH = (hedgeRevenueTUSD * 0.05).div(ethUsdPrice);
  const totalRevenueTWETH = totalRevenueTUSD.div(ethUsdPrice);
  const cashierRevenueTWETH = cashierRevenueTUSD.div(ethUsdPrice);
  const hedgeRevenueTWETH = hedgeRevenueTUSD.div(ethUsdPrice);
  const tokenTaxRevenueTWETH = tokenTaxRevenueTUSD.div(ethUsdPrice);
  // Convert WETH values to USD
  const minerFeesTUSD = minerFeesTWETH * ethUsdPrice; 
  const distributedTUSD = distributedTWETH.div(ethUsdPrice);
  const totalClaimedTUSD = totalClaimedTWETH.div(ethUsdPrice);
  const totalUnclaimedTUSD = totalUnclaimedTWETH.div(ethUsdPrice);
  const minedHedgesTUSD = minerFeesTUSD.div(0.05).div(0.15); //reverse settlement fees & miner fees

  // Call the updateSectionValues_Earnings function to update the HTML
  updateSectionValues_Earnings(
    totalRevenueTWETH,
    totalRevenueTUSD,
    cashierRevenueTWETH,
    cashierRevenueTUSD,
    hedgeRevenueTWETH,
    hedgeRevenueTUSD,
    tokenTaxRevenueTWETH,
    tokenTaxRevenueTUSD,
    
    minerFeesTWETH,
    minerFeesTUSD,
    distributedTWETH,
    distributedTUSD,
    totalUnclaimedTWETH,
    totalClaimedTUSD,
    totalUnclaimedTWETH,
    totalUnclaimedTUSD,
    minedHedgesCount,
    minedHedgesTUSD,
    minersCount,
    totalStakers
  );

  updateChartValues_Revenue(cashierRevenueTUSD, hedgeRevenueTUSD, tokenTaxRevenueTUSD);
  updateChartValues_Dividents(totalRevenueTUSD, distributedTUSD);
  updateChartValues_Claims(totalClaimedTUSD, totalUnclaimedTUSD);
  
}

async function setCurrent_StakedSection() {
    
    const stakedSupply = await contractInstance.stakedTokens(); 
    const circSupply = await tokenInst.circulatingSupply(); 
    const totalStakers = 1000; // to be developed. address(this) withdraws from userMapBalances to staking contract only
    
    
    // Fetch ETH to USD conversion rate
    const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();
  
    // Step 3: Convert WETH amounts
    const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;
    
    // - Hedge Revenue = 5% tax on profits upon settlement
    // - Miner Fees = 15% of hedge revenue above, to miners settling hedges in real time manually
    // - Token Tax Revenue is token swap tax
    // - Cashier Revenue = protocol withdrawal charges
    //const totalRevenueEth = (hedgeRevenueEth - minerFeesEth) + tokenTaxRevenueEth + cashierRevenueEth;
    // == MORE ACCURATE READING OF TOTAL REVENUE 
    const totalRevenueEth = new BigNumber(totalProtocolRevenue[0]).div(10 ** wethDecimals);
    const totalRevenueUsdt = new BigNumber(totalProtocolRevenue[1]).div(10 ** usdtDecimals);
    const totalRevenueUsdc = new BigNumber(totalProtocolRevenue[2]).div(10 ** usdcDecimals);
    const totalRevenueTUSD = (totalRevenueEth * ethUsdPrice) + totalRevenueUsdt + totalRevenueUsdc;
  
    const cashierRevenueEth = new BigNumber(cashierRevenue[0]).div(10 ** wethDecimals);
    const cashierRevenueUsdt = new BigNumber(cashierRevenue[1]).div(10 ** usdtDecimals);
    const cashierRevenueUsdc = new BigNumber(cashierRevenue[2]).div(10 ** usdcDecimals);
    const cashierRevenueTUSD = (cashierRevenueEth * ethUsdPrice) + cashierRevenueUsdt + cashierRevenueUsdc;
  
    const hedgeRevenueEth = new BigNumber(hedgeRevenue[0]).div(10 ** wethDecimals);
    const hedgeRevenueUsdt = new BigNumber(hedgeRevenue[1]).div(10 ** usdtDecimals);
    const hedgeRevenueUsdc = new BigNumber(hedgeRevenue[2]).div(10 ** usdcDecimals);
    const hedgeRevenueTUSD = (hedgeRevenueEth * ethUsdPrice) + hedgeRevenueUsdt + hedgeRevenueUsdc;
  
    const tokenTaxRevenueEth = new BigNumber(tokentaxRevenue).div(10 ** wethDecimals);
    const tokenTaxRevenueTUSD = (tokenTaxRevenueEth * ethUsdPrice);
    // Convert remaining
    const minerFeesTWETH = web3.utils.fromWei(minerFeesWei, 'ether');
    const distributedTWETH = web3.utils.fromWei(totalDistributed, 'ether');
    const totalClaimedTWETH = web3.utils.fromWei(totalClaimedWei, 'ether');
    const totalUnclaimedTWETH = web3.utils.fromWei(totalUnclaimedWei, 'ether');
    
    // Convert USD values to WETH
    const totalRevenueTWETH = totalRevenueTUSD.div(ethUsdPrice);
    const cashierRevenueTWETH = cashierRevenueTUSD.div(ethUsdPrice);
    const hedgeRevenueTWETH = hedgeRevenueTUSD.div(ethUsdPrice);
    const tokenTaxRevenueTWETH = tokenTaxRevenueTUSD.div(ethUsdPrice);
    // Convert WETH values to USD
    const minerFeesTUSD = minerFeesTWETH.div(ethUsdPrice);
    const distributedTUSD = distributedTWETH.div(ethUsdPrice);
    const totalClaimedTUSD = totalClaimedTWETH.div(ethUsdPrice);
    const totalUnclaimedTUSD = totalUnclaimedTWETH.div(ethUsdPrice);
    const minedHedgesTUSD = minerFeesTUSD.div(0.05); //fees are 5%
  
    // Call the updateSectionValues_Earnings function to update the HTML
    updateSectionValues_Earnings(
      totalRevenueTWETH,
      totalRevenueTUSD,
      cashierRevenueTWETH,
      cashierRevenueTUSD,
      hedgeRevenueTWETH,
      hedgeRevenueTUSD,
      tokenTaxRevenueTWETH,
      tokenTaxRevenueTUSD,
      
      minerFeesTWETH,
      minerFeesTUSD,
      distributedTWETH,
      distributedTUSD,
      totalUnclaimedTWETH,
      totalClaimedTUSD,
      totalUnclaimedTWETH,
      totalUnclaimedTUSD,
      minedHedgesCount,
      minedHedgesTUSD,
      minersCount,
      totalStakers
    );
  
    updateChartValues_Revenue(cashierRevenueTUSD, hedgeRevenueTUSD, tokenTaxRevenueTUSD);
    updateChartValues_Dividents(totalRevenueTUSD, distributedTUSD);
    updateChartValues_Claims(totalClaimedTUSD, totalUnclaimedTUSD);
    
  }

async function setCurrent_TokenomicsSection() {
    //tokenInst instead of contractInst
    const symbol = await tokenInst.symbol();
    const decimals = await tokenInst.decimals();
    const contractAddress = MyLibrary.platformAddress;
    const buyTax = await tokenInst.buyTax(); 
    const sellTax = await tokenInst.sellTax(); 
    const priceWETH = await tokenInst.price(); 
    const circSupply = await tokenInst.circulatingSupply(); 
    const totaSupply = await tokenInst.totalSupply(); 
    
    // Fetch ETH to USD conversion rate
    const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

    // Convert WETH to human readable
    const circulatingSupply = new BigNumber(circSupply).div(10 ** decimals);
    const totalSupply = new BigNumber(totaSupply).div(10 ** decimals);
    const burntSupply = totalSupply.minus(circulatingSupply);
    const priceTWETH = web3.utils.fromWei(priceWETH, 'ether');
    
    // Convert USD values to WETH
    const priceTUSD = priceTWETH.div(ethUsdPrice);
  
    // Call the updateSectionValues_Tokenomics function to update the HTML
    updateSectionValues_Tokenomics(
        symbol,
        decimals,
        contractAddress,
        buyTax,
        sellTax,
        priceTWETH,
        priceTUSD,
        burntSupply,
        circulatingSupply
    );

    updateChartValues_Tokenomics(burntSupply, circulatingSupply);
    
}
// Export the fetch functions
export { setCurrent_TrafficSection, setCurrent_HedgeSection, setCurrent_EarningsSection, setCurrent_StakedSection, setCurrent_TokenomicsSection };
