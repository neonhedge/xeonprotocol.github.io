import { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, getTokenETHValue, getTokenUSDValue } from './constants.js';
import { updateSectionValues_volumes, updateSectionValues_volumesERC20 } from './module-market-sidebar-updaters.js';
// Load hedge volume: created, bought, settled, payouts, fees
// Load token stats and information when searchBar contains token address
async function loadSidebar() {
    
    const searchInput = $('#searchBar').val();

    // check if address exists in search bar
    if (searchInput.length >= 40 && web3.utils.isAddress(searchInput) == true) {
        // filter sidebar infor for token
        await loadSidebarVolume_Token(searchInput);
    } else { 
        // fetch all
        await loadSidebarVolume_All();
    }
    
}

async function loadSidebarVolume_All() {
    
    const hedgesCreatedWETH = await hedgingInstance.hedgesCreatedVolume(CONSTANTS.wethAddress);
    const hedgesCreatedUSDT = await hedgingInstance.hedgesCreatedVolume(CONSTANTS.usdtAddress);
    const hedgesCreatedUSDC = await hedgingInstance.hedgesCreatedVolume(CONSTANTS.usdcAddress);

    const hedgesTradedWETH = await hedgingInstance.hedgesTakenVolume(CONSTANTS.wethAddress);
    const hedgesTradedUSDT = await hedgingInstance.hedgesTakenVolume(CONSTANTS.usdtAddress);
    const hedgesTradedUSDC = await hedgingInstance.hedgesTakenVolume(CONSTANTS.usdcAddress);

    const hedgeCostsWETH = await hedgingInstance.hedgesCostVolume(CONSTANTS.wethAddress);
    const hedgeCostsUSDT = await hedgingInstance.hedgesCostVolume(CONSTANTS.usdtAddress);
    const hedgeCostsUSDC = await hedgingInstance.hedgesCostVolume(CONSTANTS.usdcAddress);

    const optionsVolumeWETH = await hedgingInstance.optionsVolume(CONSTANTS.wethAddress);
    const optionsVolumeUSDT = await hedgingInstance.optionsVolume(CONSTANTS.usdtAddress);
    const optionsVolumeUSDC = await hedgingInstance.optionsVolume(CONSTANTS.usdcAddress);

    const swapsVolumeWETH = await hedgingInstance.swapsVolume(CONSTANTS.wethAddress);
    const swapsVolumeUSDT = await hedgingInstance.swapsVolume(CONSTANTS.usdtAddress);
    const swapsVolumeUSDC = await hedgingInstance.swapsVolume(CONSTANTS.usdcAddress);
    
    const settledVolumeWETH = await hedgingInstance.settledVolume(CONSTANTS.wethAddress);
    const settledVolumeUSDT = await hedgingInstance.settledVolume(CONSTANTS.usdtAddress);
    const settledVolumeUSDC = await hedgingInstance.settledVolume(CONSTANTS.usdcAddress);
    
    const hedgeProfitsWETH = await hedgingInstance.protocolBaseProfits(CONSTANTS.wethAddress);
    const hedgeProfitsUSDT = await hedgingInstance.protocolBaseProfits(CONSTANTS.usdtAddress);
    const hedgeProfitsUSDC = await hedgingInstance.protocolBaseProfits(CONSTANTS.usdcAddress);

    const hedgeFeesWETH = await hedgingInstance.protocolBaseFees(CONSTANTS.wethAddress);
    const hedgeFeesUSDT = await hedgingInstance.protocolBaseFees(CONSTANTS.usdtAddress);
    const hedgeFeesUSDC = await hedgingInstance.protocolBaseFees(CONSTANTS.usdcAddress);

    const cashierFeesWETH = await hedgingInstance.protocolCashierFees(CONSTANTS.wethAddress);
    const cashierFeesUSDT = await hedgingInstance.protocolCashierFees(CONSTANTS.usdtAddress);
    const cashierFeesUSDC = await hedgingInstance.protocolCashierFees(CONSTANTS.usdcAddress);
  
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

async function loadSidebarVolume_Token(tokenAddress) {
    const boughtOptions = await contract.methods.getBoughtOptionsERC20(tokenAddress, startIndex, limit).call();
    const boughtSwaps = await contract.methods.getBoughtSwapsERC20(tokenAddress, startIndex, limit).call();
    const settledOptions = await contract.methods.getSettledOptionsERC20(tokenAddress, startIndex, limit).call();
    const settledSwaps = await contract.methods.getSettledSwapsERC20(tokenAddress, startIndex, limit).call();
    const options = await contract.methods.getOptionsForToken(tokenAddress, startIndex, limit).call();
    const swaps = await contract.methods.getSwapsForToken(tokenAddress, startIndex, limit).call();

    // token price in paired currency
    const [tokenPrice, pairedSymbol] = await getTokenETHValue(tokenAddress);

    // fetch more infor
    // standard ERC20 ABI
	  const erc20ABI = [
		{
		  constant: true,
		  inputs: [],
		  name: 'name',
		  outputs: [{ name: '', type: 'string' }],
		  type: 'function',
		},
		{
		  constant: true,
		  inputs: [],
		  name: 'symbol', // Add the symbol function
		  outputs: [{ name: '', type: 'string' }],
		  type: 'function',
		},
	];
	let tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
	let tokenName = await tokenContract.methods.name().call(); 
  
    const boughtOptionsCount = boughtOptions.length;
    const boughtSwapsCount = boughtSwaps.length;
    const settledOptionsCount = settledOptions.length;
    const settledSwapsCount = settledSwaps.length;
    const optionsCount = options.length;
    const swapsCount = swaps.length;
  
    // Call the updateSectionValues_hedges function
    updateSectionValues_volumesERC20(
        tokenAddress,
        tokenName,
        tokenPrice,
        pairedSymbol,
        boughtOptionsCount,
        boughtSwapsCount,
        settledOptionsCount,
        settledSwapsCount,
        optionsCount,
        swapsCount
    );
  }

export { loadSidebar, loadSidebarVolume_All, loadSidebarVolume_Token }