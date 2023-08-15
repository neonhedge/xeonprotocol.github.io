// Import modules
import { initWeb3 } from './hedge-web3-utils.js';
import { fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel } from './section-fetchers.js';
import { loadHedgesModule } from './hedgesModule.js.js';

// Initialize web3
initWeb3();

$(document).ready(async function () {
    const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];

    var unlockState = await unlockedWallet();
    if (unlockState === true) {
        const setatmIntervalAsync = (fn, ms) => {
        fn().then(() => {
            setTimeout(() => setatmIntervalAsync(fn, ms), ms);
        });
        };

        const callPageTries = async () => {
        const asyncFunctions = [fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel, loadHedgesModule(window.stakingContract, userAddress)];

        for (const func of asyncFunctions) {
            await func();
        }
        };

        setatmIntervalAsync(async () => {
        await callPageTries();
        }, 30000);

    } else {
        reqConnect();
    }
});
