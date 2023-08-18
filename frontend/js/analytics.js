const CONSTANTS = {
	network: "0x5", // goerli 0x5 // bsc: 0x56
	etherScan: "https://goerli.etherscan.io", // https://goerli.etherscan.io // https://bscscan.com/
	decimals: 18,
    neonAddress: '0x135Ca6fff3EcCd186d1bb4B518679e17115d0867',
	hedgingAddress: '0x135Ca6fff3EcCd186d1bb4B518679e17115d0867',
    stakingAddress: '0x135Ca6fff3EcCd186d1bb4B518679e17115d0867',
	wethAddress: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
	usdtAddress: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
	usdcAddress: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
	UniswapUSDCETH_LP: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
	popuptimer: 20,
    neonContractABI: [],
	hedgingContractABI: [],
    hedgingInstanceABI: [],
};

/*=========================================================================
    Import modules
==========================================================================*/

import { initWeb3 } from './dapp-web3-utils.js';
import { setCurrent_TrafficSection, setCurrent_HedgeSection, setCurrent_EarningsSection, setCurrent_StakedSection, setCurrent_TokenomicsSection } from './module-analytics-section-fetchers.js';

/*=========================================================================
    HELPER FUNCTIONS
==========================================================================*/
// Set initial values in HTML, zeros on all widgets

// Define CHART variables globally
var netProfitChart = null;
var netCashingChart = null;
var cashingPieChart = null;
var hedgeBarChartA = null;
var hedgeBarChartB = null;
var hedgeBarChartC = null;
var hedgeBarChartD = null;
var dividentsChart = null;
var revenuePieChart = null;
var claimsPieChart = null;
var stakesBarChart = null;
var tokenomicsPieChart = null;


// FunctionS to set initial CHART values
function setInitial_StakingChart() {
    const totalStaked = 100000000;
    const totalSupply = 300000000;

    updateChartValues_Staking(totalStaked, totalSupply);
}

function setInitial_CashingChart() {
    const initialNetDeposit = 15000;
    const initialNetWithdraw = -9000;

    updateChartValues_Cash(initialNetDeposit, initialNetWithdraw);
}

function setInitial_CashingChartPie() {
    const initialWeth = 200000;
    const initialUSDT = 450000;
    const initialUSDC = 350000;
    const initialERC20 = 720000;

    updateChartValues_PIE(initialWeth, initialUSDT, initialUSDC, initialERC20);
}

function setInitial_hedgesChartA() {
    const hedgesChartID = 1;
    const initialTraded = 7000;
    const initialCreated = 8000;

    updateChartValues_hedges(hedgesChartID, initialTraded, initialCreated);
}

function setInitial_hedgesChartB() {
    const hedgesChartID = 2;
    const initialSwapsVolume = 3000;
    const initialOptionsVolume = 5000;

    updateChartValues_hedges(hedgesChartID, initialSwapsVolume, initialOptionsVolume);
}

function setInitial_hedgesChartC() {
    const hedgesChartID = 3;
    const initialHedgeCost = 500;
    const initialHedgeValue = 5000;

    updateChartValues_hedges(hedgesChartID, initialHedgeCost, initialHedgeValue);
}

function setInitial_hedgesChartD() {
    const hedgesChartID = 4;
    const initialHedgeProfits = 4000;
    const initialHedgeLosses = 2000;
    updateChartValues_hedges(hedgesChartID, initialHedgeProfits, initialHedgeLosses);
    
}

function setInitial_dividentsChart() {
    const initialDistributed = 8000;
    const initialClaimed = 6000;

    updateChartValues_Dividents(initialDistributed, initialClaimed);
}

function setInitial_claimsChart() {
    const initialClaimed = 5000;
    const initialUnclaimed = 2500;

    updateChartValues_Claims(initialClaimed, initialUnclaimed);
}

function setInitial_revenueChart() {
    const cashierRevenueTUSD = 1000;
    const hedgeRevenueTUSD = 1500;
    const tokenTaxRevenueTUSD = 1200;

    updateChartValues_Revenue(cashierRevenueTUSD, hedgeRevenueTUSD, tokenTaxRevenueTUSD);
}

function setInitial_TokenomicsChart() {
    const burntSupplyTOKENS = 10000000;
    const circulatingSupplyTOKENS = 290000000;

    updateChartValues_Tokenomics(burntSupplyTOKENS, circulatingSupplyTOKENS);
}

/*=========================================================================
    INITIALIZE WEB3
==========================================================================*/
initWeb3();

$(document).ready(async function () {
    const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];

    const unlockState = await unlockedWallet();
    if (unlockState === true) {
        const setatmIntervalAsync = (fn, ms) => {
            fn().then(() => {
                setTimeout(() => setatmIntervalAsync(fn, ms), ms);
            });
        };
        // Load sections automatically & periodically
        const callPageTries = async () => {
            const asyncFunctions = [setCurrent_TrafficSection, setCurrent_HedgeSection, setCurrent_EarningsSection, setCurrent_StakedSection, setCurrent_TokenomicsSection];
            for (const func of asyncFunctions) {
                await func();
            }
        };
        setatmIntervalAsync(async () => {
            await callPageTries();
        }, 30000);

        // Load more sections manually not automatically & periodically
        // Create an IntersectionObserver to load sections when in view
    } else {
        reqConnect();
    }
});

/**************************
    ON PAGE LOAD CALLS 
**************************/
$(document).ready(function() {
    
    setInitial_CashingChart();
    setInitial_CashingChartPie();
    setInitial_hedgesChartA();
    setInitial_hedgesChartB();
    setInitial_hedgesChartC();
    setInitial_hedgesChartD();
    setInitial_dividentsChart();
    setInitial_claimsChart();
    setInitial_revenueChart();
    setInitial_StakingChart();
    setInitial_TokenomicsChart();
});

/**************************
    HELPERS 
**************************/

async function getCurrentEthUsdcPriceFromUniswapV2() {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false'); // Replace with the actual API endpoint for fetching the price
  const data = await response.json();

  // Assuming the API response contains the price in the desired format
  const ethUsdcPrice = data.price;

  return ethUsdcPrice;
}