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
import { fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel } from './module-wallet-section-fetchers.js';
import { loadHedgesModule } from './module-wallet-section-hedgesList.js';

/*=========================================================================
    HELPER FUNCTIONS
==========================================================================*/

// Function to Validate the Ethereum wallet address format
function isValidEthereumAddress(address) {
    const ethereumAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
    return ethereumAddressRegex.test(address);
}
// CoinGecko API price call function
async function getCurrentEthUsdcPriceFromUniswapV2() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false'); // Replace with the actual API endpoint for fetching the price
    const data = await response.json();
    const ethUsdcPrice = data.ethereum.usd;  
    return ethUsdcPrice;
}
// Function to Truncate the token address for display
function truncateAddress(address) {
	return address.slice(0, 6) + '...' + address.slice(-4);
}
// Function to Convert to USD value based on pair
function convertToUSD(value, pairedCurrency, ethUsdPrice) {
	switch (pairedCurrency) {
	  case CONSTANTS.wethAddress:
		return value * ethUsdPrice;
	  case CONSTANTS.usdtAddress:
	  case CONSTANTS.usdcAddress:
		return value;
	  default:
		return 0;
	}
}
// Function to get all Deposited ERC20 tokens
async function getDepositedTokens() {
	try {
		const depositedTokens = await hedgingInstance.methods.getDepositedTokens().call();
		return depositedTokens;
	} catch (error) {
		console.error("Error fetching deposited tokens:", error);
		return [];
	}
}
// Function to get token USD value
async function getTokenUSDValue(underlyingTokenAddr, balance) {
	try {
	  const underlyingValue = await hedgingInstance.methods.getUnderlyingValue(underlyingTokenAddr, balance).call();
	  const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();
	  const usdValue = convertToUSD(underlyingValue[0], underlyingValue[1], ethUsdPrice);
	  return usdValue;
	} catch (error) {
	  console.error("Error getting token USD value:", error);
	  return 0;
	}
}
// Function to get token ETH value
async function getTokenETHValue(underlyingTokenAddr, balance) {
	try {
	  const underlyingValue = await hedgingInstance.methods.getUnderlyingValue(underlyingTokenAddr, balance).call();
	  return new BigNumber(underlyingValue[0]).div(1e18);
	} catch (error) {
	  console.error("Error getting token ETH value:", error);
	  return new BigNumber(0);
	}
}
// Function to fetch user's token balances
async function getUserBalancesForToken(tokenAddress, userAddress) {
    try {
        const [deposited, withdrawn, lockedInUse, withdrawableBalance, withdrawableValue, paired] = await hedgingInstance.methods.getuserTokenBalances(tokenAddress, userAddress).call();
        const depositedBalance = web3.utils.fromWei(deposited);
        const withdrawnBalance = web3.utils.fromWei(withdrawn);
        const lockedInUseBalance = web3.utils.fromWei(lockedInUse);
        const withdrawableBalanceEth = web3.utils.fromWei(withdrawableBalance);    
        // Display balances in the HTML form
        document.getElementById('depositedBalance').textContent = depositedBalance;
        document.getElementById('withdrawnBalance').textContent = withdrawnBalance;
        document.getElementById('lockedInUseBalance').textContent = lockedInUseBalance;
        document.getElementById('withdrawableBalance').textContent = withdrawableBalanceEth;
    } catch (error) {
        console.error("Error fetching user's token balances:", error);
        // Clear the balances display if an error occurs
        document.getElementById('depositedBalance').textContent = '';
        document.getElementById('withdrawnBalance').textContent = '';
        document.getElementById('lockedInUseBalance').textContent = '';
        document.getElementById('withdrawableBalance').textContent = '';
    }
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
            const asyncFunctions = [fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel];
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
  