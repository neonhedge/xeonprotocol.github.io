import { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, getTokenETHValue, getTokenUSDValue } from './constants.js';
import { updateSectionValues_volumes } from './module-market-sidebar-updaters.js';
// Load hedge volume: created, bought, settled, payouts, fees
async function loadSidebarVolume() {
    
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
    updateSectionValues_volumes(
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
}

export { loadSidebarVolume }