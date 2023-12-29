import { getTokenUSDValue, getCurrentEthUsdcPriceFromUniswapV2, getTokenETHValue, CONSTANTS } from './constants.js';

// Function to fetch the number of deposited tokens by a wallet
async function getWalletTokenList(walletAddress) {
	try {
      const transactedTokensArray = await hedgingInstance.methods.getUserHistory(walletAddress, 0, CONSTANTS.tokenLimit).call();
	  return transactedTokensArray;
	} catch (error) {
	  console.error("Error fetching deposited tokens:", error);
	  return [];
	}
}

// Function to update the HTML with the ERC20 token list
async function userTokenList(walletAddress) {
    const tokenListContainer = $('.trade-list');
    tokenListContainer.empty();
    const tokenAddresses = await getWalletTokenList(walletAddress);

    for (const tokenAddress of tokenAddresses) {
        const result = await hedgingInstance.methods.getUserTokenBalances(tokenAddress, walletAddress).call();
        const depositedBalance = result[0];
        const withdrawnBalance = result[1];

        // Convert deposited and withdrawn balances to BigNumber and handle 1e18 format
        const currentBalance = depositedBalance - withdrawnBalance;
        const tokenInfo = await getTokenInfo(tokenAddress, currentBalance);

        if (tokenInfo) {
            const listItem = $('<li></li>'); // Use jQuery to create a new list item
            listItem.addClass('trade-item');
            listItem.html(`
                <div class="token-icon" style="background: url('./imgs/${tokenInfo.symbol.toLowerCase()}.webp');"></div>
                <div class="token-info">
                    <div class="token-name">${tokenInfo.name}</div>
                    <div class="token-symbol">${tokenInfo.symbol}</div>
                    <div class="token-address">${tokenInfo.address}</div>
                    <div class="token-copy"><i class="far fa-copy"></i></div>
                    <div class="token-tamount">${tokenInfo.amount}</div>
                </div>
                <div class="trade-amount">$${tokenInfo.valueInUSD}</div>
            `);
            tokenListContainer.append(listItem); // Use jQuery's append method
            console.log("deposits info:", tokenInfo);
        }
    }
}

// Function to calculate ERC20 token information
async function getTokenInfo(tokenAddress, balance) {
    let balanceRaw = balance;
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
        // Format from BigNumber to human readable
        const balance = new BigNumber(balanceRaw).div(new BigNumber(10).pow(tokenDecimals));
        const trueValue = Number(balance);

        // Fetch the USD value of the token balance: accepts wei & BigNumber
        const usdValue = await getTokenUSDValue(tokenAddress, balanceRaw);
        const tokenInfo = {
            name: tokenName,
            symbol: tokenSymbol,
            address: tokenAddress,
            amount: trueValue,
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
        //const ethUsdPrice = getCurrentEthUsdcPriceFromUniswapV2();
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
export { getWalletTokenList, userTokenList, getTokenInfo, cashierErc20List, getDepositedTokens };