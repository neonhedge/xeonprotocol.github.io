// JavaScript Document

/*==============================
         Configuration
==============================*/

const MyLibrary = {
	network: "0x5", // goerli 0x5 // bsc: 0x56
	etherScan: "https://goerli.etherscan.io", // https://goerli.etherscan.io // https://bscscan.com/
	decimals: 18,
	stakingAddress: '0x135Ca6fff3EcCd186d1bb4B518679e17115d0867',
	wethAddress: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
	usdtAddress: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
	usdcAddress: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
	UniswapUSDCETH_LP: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
	popuptimer: 20,
	stakingContractABI: [], // Add the actual ABI for the staking contract here
  };
  
  /*=========================================================================
		  Initialization
  ==========================================================================*/
  
  // Initialize WEB3 and staking contract instance
  try {
	if (typeof window.ethereum == 'undefined') {
	  swal({
		title: "Hold on!",
		type: "error",
		confirmButtonColor: "#F27474",
		text: "Metamask is missing, so the full experience is not available."
	  });
	} else if (typeof window.ethereum !== 'undefined') {
	  // Metamask on the browser, get provider
	  window.web3 = new Web3(window.ethereum);
	  // Set instance
	  window.stakingContract = new window.web3.eth.Contract(MyLibrary.stakingContractABI, MyLibrary.stakingAddress);
	}
  } catch (error) {
	console.error("Error initializing WEB3:", error);
  }
  
  /*=========================================================================
		  READ FUNCTIONS
  ==========================================================================*/  

$(document).ready(async function() {
	var unlockState = await unlockedWallet();
	if (unlockState === true) {
	  const setatmIntervalAsync = (fn, ms) => {
		fn().then(() => {
		  setTimeout(() => setatmIntervalAsync(fn, ms), ms);
		});
	  };
  
	  const callPageTries = async () => {
		const asyncFunctions = [fetchSection_Networth, fetchSection_BalanceList, asyncFunc3]; // Replace with your list of async functions
  
		for (const func of asyncFunctions) {
		  await func();
		}
	  };

	  setatmIntervalAsync(async () => {
		await callPageTries(); // await ensures we wait for callPageTries to finish
	  }, 30000);

	} else {
	  reqConnect();
	}
});

// 1. Fetch Section Values - Net Worth
//-----------------------------------------
async function fetchSection_Networth(){
	const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];
	
	const walletBalanceRaw = await web3.eth.getBalance(userAddress);
	const stakedBalanceRaw = await stakingContract.methods.getStakedBalance(userAddress).call();

	const transactedTokensArrayList = await stakingContract.methods.getWalletTokenList(userAddress).call();
	const transactedTokensCount = transactedTokensArrayList.length;
	
	// Human Readable
    const walletBalance = new BigNumber(walletBalanceRaw).div(10 ** MyLibrary.decimals);
	const stakedBalance = new BigNumber(stakedBalanceRaw).div(10 ** MyLibrary.decimals);

	// ETH USD price
	const ethUsdcPrice = await getCurrentEthUsdcPriceFromUniswapV2();

	// ETH values
	const rewardsDue = await calculateRewardsDue(userAddress);
	const commissionDue = await calculateCommissionDueETH(userAddress);
	const rewardsDueETH = rewardsDue[0];
	const totalCommissionDueETH = commissionDue[0]; //already formated
	const stakedTokensETH = await calculateStakedTokensValueETH(userAddress); //already formated
	const walletTokensETH = await getTokenETHValue(MyLibrary.tokenAddress, walletBalanceRaw); //already formated

	//USD values
	const totalDepositsUSD = await getCurrentBalancesValue(userAddress); //already formated
	const totalRewardsDueUSD = rewardsDue[1]; //already formated
	const totalCommissionDueUSD = commissionDue[0] * ethUsdcPrice; //already formated
	const stakedTokensUSD = stakedTokensETH * ethUsdcPrice;
	const walletTokensUSD = walletTokensETH * ethUsdcPrice;
	const netWorthUSD = walletTokensUSD + stakedTokensUSD + totalCommissionDueUSD + totalRewardsDueUSD + totalDepositsUSD;	

	updateSectionValues_Networth(
		userAddress,
		walletBalance,
		stakedBalance,
		totalDepositsUSD,
		totalRewardsDueUSD,
		totalCommissionDueETH,
		totalCommissionDueUSD,
		transactedTokensCount,
		netWorthUSD
	);
}

// Update Section Values - Networth
function updateSectionValues_Networth(
	userAddress,
	walletBalance,
	stakedBalance,
	totalDepositsUSD,
	totalRewardsDueUSD,
	totalCommissionDueETH,
	totalCommissionDueUSD,
	transactedTokensCount,
	netWorthUSD
	) {
    
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

	var first = userAddress.substring(0, 5);//get first chars
	var last = userAddress.slice(userAddress.length - 3);//get last chars
	var privatize = first+'..'+last;
  
    // Update wallet address
    document.getElementById("walletAddress").textContent = privatize;
    document.getElementById("stakedBalance").textContent = formatString(stakedBalance);
	document.getElementById("walletBalance").textContent = formatString(walletBalance);
    document.getElementById("netWorthUSD").textContent = formatStringDecimal(netWorthUSD);
    document.getElementById("netDepositsUSD").textContent = formatStringDecimal(totalDepositsUSD);
    document.getElementById("netRewardsUSD").textContent = formatStringDecimal(totalRewardsDueUSD);
    document.getElementById("netCommissionUSD").textContent = formatStringDecimal(totalCommissionDueUSD);
    document.getElementById("tokensCount").textContent = formatValue(transactedTokensCount);
}

// 2. Fetch Section Values - ERC20 DEPOSIT BALANCES LIST
//---------------------------------------------------
async function fetchSection_BalanceList(){
	
	await displayTokenList();
	await cashierErc20List();

}


/*+++++++++++++++++++++++++++++++++++
  		WALLET NETWORTH DEPENDENCIES
  +++++++++++++++++++++++++++++++++++*/

// Function to fetch the number of deposited tokens by a wallet
async function getWalletTokenList(walletAddress) {
	try {
	  const transactedTokensArray = await stakingContract.methods.getWalletTokenList(walletAddress).call();
	  return transactedTokensArray;
	} catch (error) {
	  console.error("Error fetching deposited tokens:", error);
	  return [];
	}
}
  
  // Function to calculate the total USD value of all token balances
async function getCurrentBalancesValue(walletAddress) {
	const transactedTokensArray = await getWalletTokenList(walletAddress);
	let totalUSDValue = 0;
	for (const underlyingTokenAddr of transactedTokensArray) {
		const [deposited, withdrawn, , ,] = await stakingContract.methods.getuserTokenBalances(underlyingTokenAddr, walletAddress).call();
		const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();
		// Convert deposited and withdrawn balances to BigNumber and handle 1e18 format
		const depositedBalance = new BigNumber(deposited).div(new BigNumber(10).pow(18));
		const withdrawnBalance = new BigNumber(withdrawn).div(new BigNumber(10).pow(18));
		const currentBalance = depositedBalance.minus(withdrawnBalance);
		// Get the USD value for the token balance
		const usdValue = await getTokenUSDValue(underlyingTokenAddr, currentBalance, ethUsdPrice);
		totalUSDValue = totalUSDValue.plus(usdValue);
	}
	return totalUSDValue;
}

// Function to calculate staked tokens value
async function calculateStakedTokensValueETH(walletAddress) {
	const stakedBalanceRaw = await stakingContract.methods.getStakedBalance(walletAddress).call();
	const stakedBalance = new BigNumber(stakedBalanceRaw).div(1e18);
	const stakedTokensValueETH = await getTokenETHValue(MyLibrary.wethAddress, stakedBalance);
  
	return stakedTokensValueETH;
}

// Function to calculate dividents due for claiming
async function calculateRewardsDue(walletAddress, ethUsdPrice) {
	const rewardsDue = await stakingContract.methods.getRewardsDue().call({ from: walletAddress });
	const rewardsDueETH = new BigNumber(rewardsDue).div(1e18);
	const rewardsDueUSD = rewardsDueETH.times(ethUsdPrice);
  
	return [rewardsDueETH, rewardsDueUSD];
}

// Function to calculate commission
async function calculateCommissionDueETH(walletAddress) {
	const liquidityRewardsDue = await stakingContract.methods.getLiquidityRewardsDue().call({ from: walletAddress });
	const collateralRewardsDue = await stakingContract.methods.getCollateralRewardsDue().call({ from: walletAddress });
	const liquidityRewardsDueETH = new BigNumber(liquidityRewardsDue).div(1e18);
	const collateralRewardsDueETH = new BigNumber(collateralRewardsDue).div(1e18);
	const commissionDueETH = liquidityRewardsDueETH.plus(collateralRewardsDueETH);
  
	return [commissionDueETH, liquidityRewardsDueETH, collateralRewardsDueETH];
}


// Function to fetch user's token balances from the smart contract
async function getUserTokenBalances(tokenAddress, userAddress) {
  try {
    const [deposited, withdrawn, lockedInUse, withdrawableBalance, withdrawableValue, paired] = await stakingContract.methods.getuserTokenBalances(tokenAddress, userAddress).call();
    
    // Convert the balances to human-readable format (if needed)
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

  
/*+++++++++++++++++++++++++++++++++++++++
  		ERC20 BALANCES LIST DEPENDENCIES
  ++++++++++++++++++++++++++++++++++++++*/
  
// Function to calculate ERC20 token information
async function getTokenInfo(tokenAddress, balance) {
	const ERC20_ABI = [
		{
		  constant: true,
		  inputs: [],
		  name: "name",
		  outputs: [{ name: "", type: "string" }],
		  payable: false,
		  stateMutability: "view",
		  type: "function",
		},
		{
		  constant: true,
		  inputs: [],
		  name: "symbol",
		  outputs: [{ name: "", type: "string" }],
		  payable: false,
		  stateMutability: "view",
		  type: "function",
		},
		{
		  constant: true,
		  inputs: [],
		  name: "decimals",
		  outputs: [{ name: "", type: "uint8" }],
		  payable: false,
		  stateMutability: "view",
		  type: "function",
		},
	];	  
	  
    try {
        // Fetch token name, symbol, and decimals from the ERC20 contract
        const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
        const [tokenName, tokenSymbol, tokenDecimals] = await Promise.all([
            tokenContract.methods.name().call(),
            tokenContract.methods.symbol().call(),
            tokenContract.methods.decimals().call(),
        ]);
        // Convert the balance to a BigNumber and handle 1e18 format
        const tokenBalance = new BigNumber(balance).div(new BigNumber(10).pow(tokenDecimals));
        // Fetch the USD value of the token balance
        const usdValue = await getTokenUSDValue(tokenAddress, balance);
        const tokenInfo = {
            name: tokenName,
            symbol: tokenSymbol,
            address: tokenAddress,
            amount: tokenBalance.toFormat(),
            valueInUSD: usdValue,
        };

        return tokenInfo;
    } catch (error) {
        console.error("Error getting token information:", error);
        return null;
    }
}

// Function to update the HTML with the ERC20 token list
async function displayTokenList() {
    const tokenListContainer = document.querySelector('.trade-list'); // Get the container for the token list
	const accounts = await web3.eth.requestAccounts();
	const walletAddress = accounts[0];

    const tokenAddresses = await getWalletTokenList(walletAddress);

    for (const tokenAddress of tokenAddresses) {
        const [deposited, withdrawn, , ,] = await stakingContract.methods.getuserTokenBalances(tokenAddress, walletAddress).call();
        const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

        // Convert deposited and withdrawn balances to BigNumber and handle 1e18 format
        const depositedBalance = new BigNumber(deposited).div(new BigNumber(10).pow(18));
        const withdrawnBalance = new BigNumber(withdrawn).div(new BigNumber(10).pow(18));
        const currentBalance = depositedBalance.minus(withdrawnBalance);

        const tokenInfo = await getTokenInfo(tokenAddress, currentBalance);

        if (tokenInfo) {
            const listItem = document.createElement('li');
            listItem.classList.add('trade-item');
            listItem.innerHTML = `
                <div class="token-icon" style="background: url('./imgs/${tokenInfo.symbol.toLowerCase()}.webp');"></div>
                <div class="token-info">
                    <div class="token-name">${tokenInfo.name}</div>
                    <div class="token-symbol">${tokenInfo.symbol}</div>
                    <div class="token-address">${tokenInfo.address}</div>
                    <div class="token-copy"><i class="far fa-copy"></i></div>
                    <div class="token-tamount">${tokenInfo.amount}</div>
                </div>
                <div class="trade-amount">$${tokenInfo.valueInUSD}</div>
            `;
            tokenListContainer.appendChild(listItem);
        }
    }
}



/*++++++++++++++++++++++++++++++++++
  	UTILITY HELPER FUNCTIONS
  +++++++++++++++++++++++++++++++*/

// Function to truncate the token address for display
function truncateAddress(address) {
	return address.slice(0, 6) + '...' + address.slice(-4);
}

// Function to get deposited ERC20 tokens from the smart contract
async function getDepositedTokens() {
	try {
		const depositedTokens = await stakingContract.methods.getDepositedTokens().call();
		return depositedTokens;
	} catch (error) {
		console.error("Error fetching deposited tokens:", error);
		return [];
	}
}

// Function to update the HTML with the ERC20 token list
async function cashierErc20List() {
    const selectElement = document.getElementById('erc20-select');
    selectElement.innerHTML = '<option value="">Select token...</option>'; // Reset select options

    try {
        const depositedTokens = await getDepositedTokens();
        const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

        // Fetch token information for each deposited token and add them as options
        for (const tokenAddress of depositedTokens) {
            const [deposited, withdrawn, , ,] = await stakingContract.methods.getuserTokenBalances(tokenAddress, walletAddress).call();

            // Convert deposited and withdrawn balances to BigNumber and handle 1e18 format
            const depositedBalance = new BigNumber(deposited).div(new BigNumber(10).pow(18));
            const withdrawnBalance = new BigNumber(withdrawn).div(new BigNumber(10).pow(18));
            const currentBalance = depositedBalance.minus(withdrawnBalance);

            const tokenInfo = await getTokenInfo(tokenAddress, currentBalance);

            if (tokenInfo) {
                const optionElement = document.createElement('option');
                optionElement.value = tokenInfo.address;
                optionElement.textContent = `${tokenInfo.name} (${truncateAddress(tokenInfo.address)})`;
                selectElement.appendChild(optionElement);
            }
        }
    } catch (error) {
        console.error("Error populating ERC20 options:", error);
    }
}

async function getTokenUSDValue(underlyingTokenAddr, balance) {
	try {
	  const underlyingValue = await stakingContract.methods.getUnderlyingValue(underlyingTokenAddr, balance).call();
	  const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();
	  // You may need to implement a conversion function from the paired currency value to USD value
	  const usdValue = convertToUSD(underlyingValue[0], underlyingValue[1], ethUsdPrice);
	  return usdValue;
	} catch (error) {
	  console.error("Error getting token USD value:", error);
	  return 0;
	}
}

async function getTokenETHValue(underlyingTokenAddr, balance) {
	try {
	  const underlyingValue = await stakingContract.methods.getUnderlyingValue(underlyingTokenAddr, balance).call();
	  return new BigNumber(underlyingValue[0]).div(1e18);
	} catch (error) {
	  console.error("Error getting token ETH value:", error);
	  return new BigNumber(0);
	}
}

function convertToUSD(value, pairedCurrency, ethUsdPrice) {
	switch (pairedCurrency) {
	  case MyLibrary.wethAddress:
		return value * ethUsdPrice;
	  case MyLibrary.usdtAddress:
	  case MyLibrary.usdcAddress:
		return value;
	  default:
		return 0;
	}
}

/*=========================================================================
		WRITE FUNCTIONS
==========================================================================*/


/*=========================================================================
		HELPER FUNCTIONS
==========================================================================*/

// Function to validate the Ethereum wallet address format
function isValidEthereumAddress(address) {
	const ethereumAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
	return ethereumAddressRegex.test(address);
  }

function weiToEther(weiValue) {
	return web3.utils.fromWei(weiValue, "ether");
}

async function getCurrentEthUsdcPriceFromUniswapV2() {
	const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false'); // Replace with the actual API endpoint for fetching the price
	const data = await response.json();
	const ethUsdcPrice = data.price;  
	return ethUsdcPrice;
}

async function tokenETHprice(){
	try {
		var price = await tokenInst.methods.price().call();
		var pricein_eth = fromWeiToFixed12(price);
		return pricein_eth;
	}catch(error){
		return 0;
	}
}

$(document).on('click', '#create_button', function(e){
	createForm();
});





/*=========================================================================
		TOGGLE ELEMENTS/DESIGN
==========================================================================*/

// Event listener for the cashier balances expand/hide 
document.addEventListener('DOMContentLoaded', function() {
	const toggleBalancesContainer = () => {
		const balancesContainer = document.getElementById('balancesSection');
		balancesContainer.classList.toggle('expanded');
		const expandHeight = balancesContainer.classList.contains('expanded') ? balancesContainer.scrollHeight + 'px' : '0';
		balancesContainer.style.maxHeight = expandHeight;
	};
	document.getElementById('expandClose').addEventListener('click', toggleBalancesContainer);  
});

// Cashier Modes
$(document).on('click', 'input[type="checkbox"]', function(e){
	const modeSpan = document.querySelector('.mode');
	if (this.checked) {
	modeSpan.textContent = 'Withdraw Mode Active';
	} else {
	modeSpan.textContent = 'Deposit Mode Active';
	}
});

// Hedges Panel - toggle active class on button click
$(document).ready(async function() {
	const buttons = document.querySelectorAll('.list-toggle button');
	buttons.forEach((button) => {
		button.addEventListener('click', () => {
			buttons.forEach((button) => button.classList.remove('active'));
			button.classList.add('active');
		});
	});
});

// Token address paste listener
document.getElementById('walletAddressInput').addEventListener('paste', async (event) => {
	const pastedAddress = event.clipboardData.getData('text/plain');
  
	const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];
	// Validate the Ethereum address format
	if (!isValidEthereumAddress(pastedAddress)) {
	  alert('Please enter a valid Ethereum wallet address.');
	  return;
	}
  
	try {
	  await getUserTokenBalances(pastedAddress, userAddress);
	} catch (error) {
	  console.error("Error processing wallet address:", error);
	}
});


  