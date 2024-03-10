
import { fromBigIntNumberToDecimal, fromDecimalToBigInt, getAccounts, getTokenDecimalSymbolName } from './constants.js';


// Uniswap V2 Router address, Sepolia testnet
let uniswapRouterAddress = '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008';

// Uniswap V2 Router ABI
let uniswapRouterABI = [
    {inputs: [{internalType: 'uint', name: 'amountOutMin', type: 'uint'}, {internalType: 'address[]', name: 'path', type: 'address[]'}, {internalType: 'address', name: 'to', type: 'address'}, {internalType: 'uint', name: 'deadline', type: 'uint'}], name: 'swapExactETHForTokensSupportingFeeOnTransferTokens', outputs: [{internalType: 'uint[]', name: 'amounts', type: 'uint[]'}], stateMutability: 'payable', type: 'function'},
    {inputs: [{internalType: 'uint', name: 'amountIn', type: 'uint'}, {internalType: 'uint', name: 'amountOutMin', type: 'uint'}, {internalType: 'address[]', name: 'path', type: 'address[]'}, {internalType: 'address', name: 'to', type: 'address'}, {internalType: 'uint', name: 'deadline', type: 'uint'}], name: 'swapExactTokensForETHSupportingFeeOnTransferTokens', outputs: [{internalType: 'uint[]', name: 'amounts', type: 'uint[]'}], stateMutability: 'nonpayable', type: 'function'},
    {inputs: [{internalType: 'uint', name: 'amountIn', type: 'uint'}, {internalType: 'address[]', name: 'path', type: 'address[]'}], name: 'getAmountsOut', outputs: [{internalType: 'uint[]', name: 'amounts', type: 'uint[]'}], stateMutability: 'view', type: 'function'}
];

// Initialize Uniswap V2 Router contract
let deadAddress = '0x000000000000000000000000000000000000dEaD';
let wethAddress = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';
let wethDecimal = 18;

// Format output
const formatStringDecimal = (number) => {
    const options = {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 10,
    };
    return number.toLocaleString('en-US', options);
};

// Function to estimate output amount for a given input amount
async function estimateOutputAmount(inputAmount, inputTokenAddress, outputTokenAddress) {
    
    let uniswapRouterContract = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, window.provider);
    const path = [inputTokenAddress, outputTokenAddress];
    const amountsOut = await uniswapRouterContract.getAmountsOut(inputAmount, path);
    const amountConsole1 = parseInt(amountsOut[1], 16).toString();
    const amountConsole0 = parseInt(amountsOut[0], 16).toString();
    console.log('amount console1',amountConsole1);
    console.log('amount console0',amountConsole0);
    return amountsOut[1];
}

// Function to calculate adjusted amountOutMin considering slippage
async function calculateAdjustedAmountOutMin(inputAmount, inputTokenAddress, outputTokenAddress, slippagePercentage) {
    const outputAmount = await estimateOutputAmount(inputAmount, inputTokenAddress, outputTokenAddress);
    const slippageFactor = 100 - slippagePercentage;
    const adjustedAmountOutMin = outputAmount.mul(slippageFactor).div(100);
    return adjustedAmountOutMin;
}

// Function to buy ERC20 tokens using ETH
async function buyTokens(tokenAddress, amountInETH, slippagePercentage) {
    try {
        const userAddress = await getAccounts();
        const walletAddress = userAddress[0];
        let uniswapRouterContract = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, window.provider);

        // Convert the amountInETH value to a BigNumber
        const amountIn = await fromDecimalToBigInt(amountInETH, wethDecimal);
        const adjustedAmountOutMin = await calculateAdjustedAmountOutMin(amountIn, wethAddress, tokenAddress, slippagePercentage);
        const path = [wethAddress, tokenAddress]; // WETH to token
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

        // Prep 
        const [, decimals, symbol] = await getTokenDecimalSymbolName(tokenAddress);
        const amountOut = fromBigIntNumberToDecimal(adjustedAmountOutMin, decimals);
        const amountDisplay = formatStringDecimal(amountOut);

        // Throw swal
        claimingSwal(amountDisplay, symbol);

        // Send transaction
        const signer = window.signer;
        const tx = await uniswapRouterContract.connect(signer).swapExactETHForTokensSupportingFeeOnTransferTokens(
            adjustedAmountOutMin,
            path,
            walletAddress,
            deadline,
            { value: amountIn }
        );

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            // Swal
            const transactionMessage = `
            <div><p>${amountDisplay} + ' ' + symbol + ' Claimed'</p></div>
            <div><p>Proceed to the `+ '<a href="../wallet.html">Wallet Page</a>' +` to make a Deposit into our Testnet Vault to get started with trading.</p></div>`;
            swal({
                type: "success",
                title: "Tokens Claimed",
                text: transactionMessage,
                html: true,
                showCancelButton: false,
                confirmButtonColor: "#04C86C",
                confirmButtonText: "Done!",
                closeOnConfirm: true
            }, async function (isConfirm) {
                
            });
        } else {
            // Transaction failed
            console.log('Claim failed. Receipt status: ' + receipt.status);
            swal({ title: "Failed to Claim.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Receipt status: " + receipt.status });
        }    
    } catch (error) {
        console.error('Error:', error.message);
        swal({ title: "Failed to Claim.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Receipt status: " + error.message });
    }
}

async function claimingSwal(amountOut, symbol) {
    
    const transactionMessage = amountOut + ' ' + symbol;
    swal({
        type: "info",
        title: "Claiming Testnet Tokens",
        text: transactionMessage,
        html: true,
        showCancelButton: false,
        confirmButtonColor: "#04C86C",
        confirmButtonText: "Confirm",
        closeOnConfirm: true
    }, async function (isConfirm) {
        
    });
}

// Function to sell ERC20 tokens for ETH
async function sellTokens(tokenAddress, amountInTokens, slippagePercentage) {
    
    let uniswapRouterContract = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, window.provider);
    
    const amountIn = fromDecimalToBigInt(amountInTokens, 18); // Assuming 18 decimals for the token
    const adjustedAmountOutMin = await calculateAdjustedAmountOutMin(amountIn, tokenAddress, deadAddress, slippagePercentage);
    const path = [tokenAddress, deadAddress]; // Token to ETH
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    const signer = provider.getSigner();
    const tx = await uniswapRouterContract.connect(signer).swapExactTokensForETHSupportingFeeOnTransferTokens(
        amountIn,
        adjustedAmountOutMin,
        path,
        await signer.getAddress(),
        deadline
    );

    await tx.wait();
    console.log('Tokens sold successfully.');
}

export { buyTokens, sellTokens };
