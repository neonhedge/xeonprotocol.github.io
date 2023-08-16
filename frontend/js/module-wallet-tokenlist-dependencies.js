/*+++++++++++++++++++++++++++++++++++++++
  		ERC20 BALANCES LIST DEPENDENCIES
  ++++++++++++++++++++++++++++++++++++++*/

// Function to update the HTML with the ERC20 token list
async function userTokenList(walletAddress) {
    const tokenListContainer = document.querySelector('.trade-list'); // Get the container for the token list
    const tokenAddresses = await getWalletTokenList(walletAddress);

    for (const tokenAddress of tokenAddresses) {
        const [deposited, withdrawn, , ,] = await hedgingInstance.methods.getuserTokenBalances(tokenAddress, walletAddress).call();
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
async function cashierErc20List(walletAddress) {
    const selectElement = document.getElementById('erc20-select');
    selectElement.innerHTML = '<option value="">Select token...</option>'; // Reset select option
    try {
        const depositedTokens = await getDepositedTokens();
        //const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();
        // Fetch token information for each deposited token and add them as options
        for (const tokenAddress of depositedTokens) {
            const [deposited, withdrawn, , ,] = await hedgingInstance.methods.getuserTokenBalances(tokenAddress, walletAddress).call();
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

// Function to get deposited ERC20 tokens
async function getDepositedTokens() {
	try {
		const depositedTokens = await hedgingInstance.methods.getProtocolTokenList().call();
		return depositedTokens;
	} catch (error) {
		console.error("Error fetching deposited tokens:", error);
		return [];
	}
}

// Export the fetch functions
export { userTokenList, cashierErc20List };