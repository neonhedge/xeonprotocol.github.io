import { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, getTokenETHValue, getTokenUSDValue, truncateAddress, getPairToken, getSymbol, } from './constants.js';
import { updateSectionValues_volumes, updateSectionValues_volumesERC20 } from './module-market-sidebar-updaters.js';
// Load hedge volume: created, bought, settled, payouts, fees
// Load token stats and information when searchBar contains token address
async function loadSidebar() {
    
    const searchInput = $('#searchBar').val();

    // check if address exists in search bar
    if (searchInput.length >= 40 && window.web3.utils.isAddress(searchInput) == true) {
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

  // Function to fetch the past events: hedgeCreated, hedgePurchased, hedgeSettled, minedHedge
  // Exploring Arbitrums official API - its the most convinient and well documented
  async function loadPastEvents() {
    const apiUrl = 'https://api.arbiscan.io/api';
    const apiKey = 'YourApiKeyToken'; 
  
    const latestBlock = 'latest'; 
    const fromBlock = latestBlock - 100;
    const toBlock = latestBlock;

    const topic0_hedgeCreated = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const topic0_hedgePurchased = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const topic0_hedgeSettled = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const topic0_minedHedge = '0x123456789abcdef';
  
    const url_hedgeCreated = `${apiUrl}?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&topic0=${topic0_hedgeCreated}&apikey=${apiKey}`;
    const url_hedgePurchased = `${apiUrl}?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&topic0=${topic0_hedgePurchased}&apikey=${apiKey}`;
    const url_hedgeSettled = `${apiUrl}?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&topic0=${topic0_hedgeSettled}&apikey=${apiKey}`;
    const url_minedHedge = `${apiUrl}?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&topic0=${topic0_minedHedge}&apikey=${apiKey}`;

    try {
        const response_hedgeCreated = await fetch(url_hedgeCreated);
        const response_hedgePurchased = await fetch(url_hedgePurchased);
        const response_hedgeSettled = await fetch(url_hedgeSettled);
        const response_minedHedge = await fetch(url_minedHedge);
    
        const data_hedgeCreated = await response_hedgeCreated.json();
        const data_hedgePurchased = await response_hedgePurchased.json();
        const data_hedgeSettled = await response_hedgeSettled.json();
        const data_minedHedge = await response_minedHedge.json();
    
        const events_hedgeCreated = data_hedgeCreated.result;
        const events_hedgePurchased = data_hedgePurchased.result;
        const events_hedgeSettled = data_hedgeSettled.result;
        const events_minedHedge = data_minedHedge.result;
        
        /* 
        // Considering the returned result by arbitrum is an array of objects, we read it in the pprepareEventListItem as this;
        const firstTopic = data_hedgeCreated.result[0].topics[0];
        const lastTopic = data_hedgeCreated.result[0].topics[data_hedgeCreated.result[0].topics.length - 1];
        const data = data_hedgeCreated.result[0].data;
        */

        // eventOne
        events_hedgeCreated.slice(0, 100).forEach((event) => {
            prepareEventListItem(event, topic0_hedgeCreated);
        });
        // eventTwo
        events_hedgePurchased.slice(0, 100).forEach((event) => {
            prepareEventListItem(event, topic0_hedgePurchased);
        });
        // eventThree
        events_hedgeSettled.slice(0, 100).forEach((event) => {
            prepareEventListItem(event, topic0_hedgeSettled);
        });
        // eventFour
        events_minedHedge.slice(0, 100).forEach((event) => {
            prepareEventListItem(event, topic0_minedHedge);
        });

    } catch (error) {
        console.error('Error fetching events:', error);
        // Handle the error or display an error message
    }
}

function prepareEventListItem(event, eventTopic) {
    // Display the events in the sidebar div
    const sidebarDiv = document.getElementById('eventsList');
    // Create the list item
    const listItem = document.createElement('li');
    
    /* OUR event.returnValues. approach is based on live events, here for placeholder only
    // we will change to array objects parsing during live testing after knowing how indexed topics are ordered for each event
    */
    // title
    const titleSpan = document.createElement('span');
    titleSpan.textContent = event.title;
    listItem.appendChild(titleSpan);
    
    // amount/value
    const amountSpan = document.createElement('span');
    const pairToken = getPairToken(event.returnValues.optionId);
    const pairTokenSymbol = getSymbol(pairToken);
    if(eventTopic == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {//if hedgeCreated
        amountSpan.textContent = (event.returnValues.createValue) + ' ' + pairTokenSymbol;
    }
    if(eventTopic == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {//if hedgePurchased
        amountSpan.textContent = (event.returnValues.payOff) + ' ' + pairTokenSymbol;
    }
    if(eventTopic == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {//if hedgeSettled
        amountSpan.textContent = (event.returnValues.endValue) + ' ' + pairTokenSymbol;
    }
    if(eventTopic == '0x123456789abcdef') {//if minedHedge
        amountSpan.textContent = (event.returnValues.payOff) + ' ' + pairTokenSymbol;
    }
    listItem.appendChild(amountSpan);
    
    // address
    const dealerSpan = document.createElement('span');
    dealerSpan.textContent = truncateAddress((event.returnValues.writer || event.returnValues.buyer || event.returnValues.miner));
    listItem.appendChild(dealerSpan);
    
    // link
    const txSpan = document.createElement('span');
    const link = document.createElement('a');
    link.href = 'https://arbiscan.io/tx/' + event.transactionHash;
    link.textContent = 'Transaction';
    txSpan.appendChild(link);
    listItem.appendChild(txSpan);
    
    // Add list item to the sidebar
    sidebarDiv.appendChild(listItem);
}

export { loadSidebar, loadSidebarVolume_All, loadSidebarVolume_Token, loadPastEvents }