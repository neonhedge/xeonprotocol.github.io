/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, isValidEthereumAddress, getUserBalancesForToken, getSymbol, fromBigIntNumberToDecimal } from './constants.js';
import { initWeb3 } from './dapp-web3-utils.js';
import { unlockedWallet, reqConnect} from './web3-walletstatus-module.js';
import { prepareDeposit, prepareWithdrawal, refreshBalances } from './module-wallet-writer.js';
import { fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel, fetchSection_RewardsPanel, fetchSection_StakingPanel } from './module-wallet-section-fetchers.js';
import { loadHedgesModule } from './module-wallet-section-hedgesList.js';

/*=========================================================================
    INITIALIZE WEB3
==========================================================================*/
initWeb3();

// Start making calls to Dapp modules
export const checkAndCallPageTries = async () => {
    const asyncFunctions = [fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel, fetchHedgeList, fetchSection_RewardsPanel, fetchSection_StakingPanel];
    for (const func of asyncFunctions) {
        func();
    }
};
const setatmIntervalAsync = (fn, ms) => {
    fn().then(() => {
        setTimeout(() => setatmIntervalAsync(fn, ms), ms);
    });
};

$(document).ready(async function () {

    // Ready event listeners on the wallet
    setupToggleElements();

    let userAddress = '';
    const unlockState = await unlockedWallet();

    if (unlockState === true) {
        const accounts = await web3.eth.requestAccounts();
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

export async function fetchHedgeList() {
    // Wallet connect has to PASS first, so account is available, refresh to avoid empty section
    const accounts = await web3.eth.requestAccounts();
    const userAddress = accounts[0];

    // Load more sections manually not automatically & periodically
    // Create an IntersectionObserver to load hedges when #hedgingSection is in view    
    const loadHedgesSection = async (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                // Call the loadHedgesModule function
                await loadHedgesModule(userAddress);
                // Remove the observer once the section has been loaded
                observer.unobserve(entry.target);
            }
        }
    };
    
    // Now, Load the hedges section
    const hedgingSection = document.getElementById('hedgingSection');
    const observer = new IntersectionObserver(loadHedgesSection, { root: null, threshold: 0.1 });
    observer.observe(hedgingSection);
}


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
        let mybalances = {};
        if (!isValidEthereumAddress(pastedAddress)) {
            alert('Please enter a valid Ethereum wallet address.');
            return;
        }
        try {
            // show address indicators
            const tokenSymbol = await getSymbol(pastedAddress);
            const addressDataSpan = document.getElementById("addressData");
            // replace **** with name. escape the stars with \
            addressDataSpan.innerHTML = addressDataSpan.innerHTML.replace(/\*\*\*\*/g, tokenSymbol);
            // get balances
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
            document.getElementById('withdrawnBalance').textContent = formatStringDecimal(mybalances.withdrawn);
            document.getElementById('lockedInUseBalance').textContent = formatStringDecimal(mybalances.lockedInUse);
            document.getElementById('withdrawableBalance').textContent = formatStringDecimal(mybalances.withdrawableBalance);

            // Check if the container is already expanded
            const balancesContainer = document.getElementById('balancesSection');
            const isExpanded = balancesContainer.classList.contains('expanded');
            if (!isExpanded) {
                // If not expanded, toggle to expand
                balancesContainer.classList.add('expanded');
                const expandHeight = balancesContainer.scrollHeight + 'px';
                balancesContainer.style.maxHeight = expandHeight;
            }            
        } catch (error) {
            console.error("Error processing wallet address:", error);
        }
    });

    // Cashier Amount paste listener
    document.getElementById('erc20-amount').addEventListener('input', async (event) => {
        const tokenAddress = document.getElementById('erc20-address').value.trim();
        const tokenAmount = event.target.value.trim();
    
        if (isNaN(tokenAmount) || parseFloat(tokenAmount) <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        if (!isValidEthereumAddress(tokenAddress)) {
            alert('Please enter a valid ERC20 token address.');
            return;
        }
        
        const accounts = await web3.eth.requestAccounts();
        const userAddress = accounts[0];
    
        try {
            // Fetch balance for ERC20 token address provided using ERC20 balance ABI 
            const erc20ABI = [
                { inputs: [{ internalType: 'address', name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
                { inputs: [], name: 'decimals', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'pure', type: 'function' },
            ];            
   
            const pairedContract = new web3.eth.Contract(erc20ABI, tokenAddress);
            const [walletBalance, pairDecimals] = await Promise.all([
                pairedContract.methods.balanceOf(userAddress).call(),
                pairedContract.methods.decimals().call(),
            ]);            
    
            // Format output
            const formatStringDecimal = (number) => {
                const options = {
                    style: 'decimal',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                };
                return number.toLocaleString('en-US', options);
            };
    
            // Display balances in the HTML form
            const balance = fromBigIntNumberToDecimal(walletBalance, pairDecimals);
            const displayBalance = formatStringDecimal(balance);
            const walletDataSpan = document.getElementById("walletData");
    
            // Replace 0,00 with balance. Escape the stars with \
            walletDataSpan.innerHTML = walletDataSpan.innerHTML.replace(/0,00/g, displayBalance);
    
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
    setupCashingModule(values);
});

export function setupCashingModule(formValues) {

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

// address indicator spans
$(document).ready(function () {
    $('#erc20-address').on('focus', function () {
        $('#addressData').addClass('expandedData');
    });
    $('#erc20-amount').on('focus', function () {
        $('#walletData').addClass('expandedData');
    });
});

// Copy text to clipboard
document.addEventListener('click', function (event) {
    const copyIcon = event.target.closest('.copy-icon');

    if (copyIcon) {
        const nearestParent = copyIcon.closest('.token-info');
        const textToCopyElement = nearestParent.querySelector('.text-to-copy');

        if (textToCopyElement) {
            const textToCopy = textToCopyElement.innerText.trim();

            // Create a temporary input element
            const tempInput = document.createElement('textarea');
            tempInput.value = textToCopy;
            document.body.appendChild(tempInput);

            // Select and copy the text
            tempInput.select();
            document.execCommand('copy');

            // Remove the temporary input element
            document.body.removeChild(tempInput);

            swal ({
                title: 'Copied!',
                text: 'Address copied to clipboard.',
                type: 'success',
                html: false,
                dangerMode: false,
                showConfirmButton: false,
                showCancelButton: false,
                animation: 'slide-from-top',
                allowOutsideClick: true,
                timer: 2000
            })
        } else {
            console.error('No text-to-copy element found.');
        }
    }
});



