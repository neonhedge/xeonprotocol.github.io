/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS } from './constants.js';
import { initializeConnection, handleAccountChange, handleNetworkChange} from './web3-walletstatus-module.js';
import { setCurrent_TrafficSection, setCurrent_HedgeSection, setCurrent_EarningsSection, setCurrent_StakedSection, setCurrent_TokenomicsSection } from './module-analytics-section-fetchers.js';
import { updateChartValues_Cash, updateChartValues_PIE, updateChartValues_hedges, updateChartValues_Revenue, updateChartValues_Dividents, updateChartValues_Claims, updateChartValues_Staking, updateChartValues_Tokenomics } from './module-analytics-chart-updaters.js';

/*=========================================================================
    Analytics Page Main Functions
==========================================================================*/
// Start making calls to Dapp modules
// Each page has this, loads content
// Has to be called from here (main page script module) not wallet status modules, has to run last on condition wallet unlocked
export const checkAndCallPageTries = async () => {

    const scouter = await pageModulesLoadingScript();
    console.log('connection Scout: '+ scouter);
    // If wallet check passes & sets all wallet dependencies, then we can load all other scripts below
    if (scouter) {
        const asyncFunctions = [setCurrent_TrafficSection, setCurrent_HedgeSection, setCurrent_EarningsSection, setCurrent_StakedSection, setCurrent_TokenomicsSection];
        for (const func of asyncFunctions) {
            await func();
        }
    }    
};

const setatmIntervalAsync = (fn, ms) => {
    fn().then(() => {
        setTimeout(() => setatmIntervalAsync(fn, ms), ms);
    });
};

// This is the main loading script for the page
// It first checks if a wallet is connected || initialization passes
// Initialization always returns boolean on whether it passes to load page scripts or not
// Continue load is the variable catching this state continuosly & triggers event when it changes to stop loading timeout
$(document).ready(async function () {
    // Ready stuff: variables & wallet display
    $('.waiting_init').css('display', 'inline-block');

    // Load sections automatically & periodically
    setatmIntervalAsync(async () => {
        await checkAndCallPageTries();
    }, 45000);
});

async function pageModulesLoadingScript() {
    // Check if all wallet checks pass before calling page scripts
    let continueLoad = false;
    try {
        continueLoad = await initializeConnection();
    } catch (error) {
        console.log(error);
    }

    if (continueLoad) {
        return true;
    } else {
        // Force interface to indicate connection needs
        handleAccountChange([]);
    }
    return false;
}
/* UNREFACTORED & REINFORCED - Depracated
$(document).ready(async function () {
    // each page main script starts with initializing wallet
    $('.waiting_init').css('display', 'inline-block');
    try{
        // Now initialize wallet module
        await initializeConnection();
    } catch (error) {
        console.log(error);
    }

    let userAddress = '';
    const unlockState = await unlockedWallet();

    if (unlockState === true) {
        const accounts = await getAccounts();
        userAddress = accounts[0];
        
        // Load sections automatically & periodically
        setatmIntervalAsync(async () => {
            await checkAndCallPageTries();
        }, 45000);

    } else {
        console.log('Requesting Wallet Connection...');
        reqConnect();
    }
});
*/

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

/*=========================================================================
    HELPER FUNCTIONS
==========================================================================*/

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


// Provider Listeners
ethereum.on("connect", (chainID) => {
	// Update chainID on connect
	CONSTANTS.chainID = chainID.chainId;
	console.log("Connected to chain:", CONSTANTS.chainID);
	handleNetworkChange(chainID.chainId)
});

ethereum.on("accountsChanged", (accounts) => {
	console.log("Account changed:", accounts);
	handleAccountChange(accounts);

    // Refresh page
    checkAndCallPageTries();
});

ethereum.on("chainChanged", (chainID) => {
	console.log("Network changed:", chainID);
	handleNetworkChange(chainID);
	window.location.reload();
});
