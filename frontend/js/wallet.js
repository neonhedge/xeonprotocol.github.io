/*=========================================================================
    Import modules
==========================================================================*/

import { initWeb3 } from './dapp-web3-utils.js';
import { fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel, fetchSection_RewardsPanel, fetchSection_StakingPanel } from './module-wallet-section-fetchers.js';
import { loadHedgesModule } from './module-wallet-section-hedgesList.js';

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
            const asyncFunctions = [fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel, fetchSection_RewardsPanel, fetchSection_StakingPanel];
            for (const func of asyncFunctions) {
                await func();
            }
        };

        setatmIntervalAsync(async () => {
            await callPageTries();
        }, 30000);

        // Load more sections manually not automatically & periodically
        // Create an IntersectionObserver to load hedges when #hedgingSection is in view
        const loadHedgesSection = async (entries) => {
            const accounts = await web3.eth.requestAccounts();
            const userAddress = accounts[0];
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    // Call the loadHedgesModule function
                    await loadHedgesModule(userAddress);
                    // Remove the observer once the section has been loaded
                    observer.unobserve(entry.target);
                }
            }
        };
        const hedgingSection = document.getElementById('hedgingSection');
        const observer = new IntersectionObserver(loadHedgesSection, { root: null, threshold: 0.1 }); //{ root: null, threshold: 0.1 } specifies that the observer is relative to the viewport (root: null) and will trigger the callback function when at least 10% of the target element (hedgingSection) is visible
        observer.observe(hedgingSection);
    } else {
        reqConnect();
    }
});


/*=========================================================================
    INITIALIZE OTHER MODULES
==========================================================================*/

export function setupToggleElements() {
    // Event listener for the cashier balances expand/hide
    const toggleBalancesContainer = () => {
        const balancesContainer = document.getElementById('balancesSection');
        balancesContainer.classList.toggle('expanded');
        const expandHeight = balancesContainer.classList.contains('expanded') ? balancesContainer.scrollHeight + 'px' : '0';
        balancesContainer.style.maxHeight = expandHeight;
    };
    document.getElementById('expandClose').addEventListener('click', toggleBalancesContainer);
    // Cashier Modes
    document.addEventListener('change', function (e) {
        if (e.target && e.target.matches('input[type="checkbox"]')) {
            const modeSpan = document.querySelector('.mode');
            if (e.target.checked) {
            modeSpan.textContent = 'Withdraw Mode Active';
            } else {
            modeSpan.textContent = 'Deposit Mode Active';
            }
        }
    });  
    // Hedges Panel - toggle active class on button click
    const buttons = document.querySelectorAll('.list-toggle button');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            buttons.forEach((button) => button.classList.remove('active'));
            button.classList.add('active');
        });
    });  
    // Cashier Token Address paste listener
    document.getElementById('walletAddressInput').addEventListener('paste', async (event) => {
        const pastedAddress = event.clipboardData.getData('text/plain');
        const accounts = await web3.eth.requestAccounts();
        const userAddress = accounts[0];
        if (!isValidEthereumAddress(pastedAddress)) {
            alert('Please enter a valid Ethereum wallet address.');
            return;
        }
        try {
            await getUserBalancesForToken(pastedAddress, userAddress);
        } catch (error) {
            console.error("Error processing wallet address:", error);
        }
    });
}
  