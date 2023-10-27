/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, isValidEthereumAddress, getUserBalancesForToken } from './constants.js';
import { initWeb3 } from './dapp-web3-utils.js';
import { unlockedWallet, reqConnect} from './web3-walletstatus-module.js';
import { prepareDeposit, refreshBalances } from './module-wallet-writer.js';
import { fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel, fetchSection_RewardsPanel, fetchSection_StakingPanel } from './module-wallet-section-fetchers.js';
import { loadHedgesModule } from './module-wallet-section-hedgesList.js';

/*=========================================================================
    INITIALIZE WEB3
==========================================================================*/
initWeb3();

$(document).ready(async function () {

    // Ready event listeners on wallet
    setupToggleElements();
    
    // Proceed to fetch data for sections
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
        console.log('PLEASE CONNECT YOUR WALLET');
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
                // change styling on form
                document.getElementById('erc20-address').style.color = '#F6F';//withdraw effect
                document.getElementById('erc20-amount').style.color = '#F6F';
            } else {
                modeSpan.textContent = 'Deposit Mode Active';            
                document.getElementById('erc20-address').style.color = ''; //reset styles
                document.getElementById('erc20-amount').style.color = '';
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
    document.getElementById('erc20-address').addEventListener('paste', async (event) => {
        const pastedAddress = event.clipboardData.getData('text/plain');
        const accounts = await web3.eth.requestAccounts();
        const userAddress = accounts[0];
        const mybalances = {};
        if (!isValidEthereumAddress(pastedAddress)) {
            alert('Please enter a valid Ethereum wallet address.');
            return;
        }
        try {
            mybalances = await getUserBalancesForToken(pastedAddress, userAddress);
            // format output
            const formatValue = (value) => {
                return `$${value.toFixed(2)}`;
            };    
            const formatString = (number) => {
                return number.toLocaleString();
            };    
            const formatStringDecimal = (number) => {
                const options = {
                    style: 'decimal',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                };
                return number.toLocaleString('en-US', options);
            };
            // Display balances in the HTML form
            document.getElementById('depositedBalance').textContent = formatStringDecimal(mybalances.deposited);
            document.getElementById('withdrawnBalance').textContent = formatStringDecimal(mybalances.withdrwan);
            document.getElementById('lockedInUseBalance').textContent = formatStringDecimal(mybalances.lockedInUse);
            document.getElementById('withdrawableBalance').textContent = formatStringDecimal(mybalances.withdrawableBalance);
            
        } catch (error) {
            console.error("Error processing wallet address:", error);
        }
    });
    
}

/* ========================================================================
    Write Function Code starts here
======================================================================== */

document.querySelector('#cashierForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const form = event.target;
    const formData = new FormData(form);
  
    // Prepare the form values
    const values = {};
    for (let [key, value] of formData.entries()) {
      values[key] = value;
    }
    // Add the checkbox value to object
    values['checkbox'] = form.querySelector('input[type="checkbox"]').checked;
  
    console.log(values);
  
    // pass to setup deposits fr prep
    setupDepositModule(values);
});

export function setupDepositModule(formValues) {

    console.log(formValues);

    //const tokenAddress = formValues['erc20-address'] ? formValues['erc20-address'] : formValues['erc20-select'];
    const tokenAddress = formValues['erc20-address'];
    const tokenAmount = formValues['transact-amount'];
    const checkboxValue = formValues['checkbox'];

    if (tokenAmount <= 0 || tokenAddress == '' || !isValidEthereumAddress(tokenAddress)) {
        swal(
            {
                title: 'Invalid Tx Inputs...',
                text: 'Please enter a valid token address and amount.',
                type: 'info',
                html: false,
                dangerMode: false,
                confirmButtonText: 'Okay',
                showConfirmButton: true,
                showCancelButton: false,
                animation: 'slide-from-top',
            }, function () {
                console.log('invalid token address...');
            });
        return;
    }

    try {
        if (!tokenAddress || !isValidEthereumAddress(tokenAddress)) {
            //throw new Error('Please enter a valid ERC20 token address.');
            swal(
                {
                    title: 'Invalid ERC20 address pasted...',
                    text: 'Please enter a valid ERC20 token address.',
                    type: 'info',
                    html: false,
                    dangerMode: false,
                    confirmButtonText: 'Okay',
                    showConfirmButton: true,
                    showCancelButton: false,
                    animation: 'slide-from-top',
                }, function () {
                    console.log('incorrect token address...');
                }); 
            return;
        }

        if (isNaN(tokenAmount) || parseFloat(tokenAmount) <= 0) {
            //throw new Error('Please enter a valid token amount greater than 0.');
            swal(
                {
                    title: 'Invalid token amount pasted...',
                    text: 'Please enter an amount greater than 0.',
                    type: 'info',
                    html: false,
                    dangerMode: false,
                    confirmButtonText: 'Okay',
                    showConfirmButton: true,
                    showCancelButton: false,
                    animation: 'slide-from-top',
                }, function () {
                    console.log('invalid token amount...');
                });
            return;
        }

        // If validation passes, proceed to approval first
        if (!checkboxValue) {
            prepareDeposit(tokenAddress, tokenAmount);
        } else {
            prepareWithdrawal(tokenAddress, tokenAmount);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }

}