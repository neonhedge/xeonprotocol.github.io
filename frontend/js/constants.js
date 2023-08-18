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
    stakingContractABI: [],
};

// CoinGecko API price call function
async function getCurrentEthUsdcPriceFromUniswapV2() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false'); // Replace with the actual API endpoint for fetching the price
    const data = await response.json();
    const ethUsdcPrice = data.ethereum.usd;  
    return ethUsdcPrice;
}

// Function to Validate the Ethereum wallet address format
function isValidEthereumAddress(address) {
    const ethereumAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
    return ethereumAddressRegex.test(address);
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

export { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, isValidEthereumAddress, truncateAddress, convertToUSD, getTokenUSDValue, getTokenETHValue, getUserBalancesForToken };
