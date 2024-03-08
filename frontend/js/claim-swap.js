
import { fromDecimalToBigInt, getAccounts } from './constants.js';


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

// Function to estimate output amount for a given input amount
async function estimateOutputAmount(inputAmount, inputTokenAddress, outputTokenAddress) {
    
    let uniswapRouterContract = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, window.provider);
    const path = [outputTokenAddress, inputTokenAddress];
    const amountsOut = await uniswapRouterContract.getAmountsOut(inputAmount, path);
    console.log('path ',path);
    console.log('amountsOut ',amountsOut);
    return amountsOut[1];
}

// Function to calculate adjusted amountOutMin considering slippage
async function calculateAdjustedAmountOutMin(inputAmount, inputTokenAddress, outputTokenAddress, slippagePercentage) {
    const outputAmount = await estimateOutputAmount(inputAmount, inputTokenAddress, outputTokenAddress);
    const slippageFactor = ethers.utils.parseUnits((100 - slippagePercentage).toString(), wethDecimal);
    const adjustedAmountOutMin = outputAmount.mul(slippageFactor).div(ethers.utils.parseUnits('100', wethDecimal));
    return adjustedAmountOutMin;
}

// Function to buy ERC20 tokens using ETH
async function buyTokens(tokenAddress, amountInETH, slippagePercentage) {
    const userAddress = await getAccounts();
    const walletAddress = userAddress[0];
    let uniswapRouterContract = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, window.provider);

    // Convert the amountInETH value to a BigNumber
    const amountIn = await fromDecimalToBigInt(amountInETH, wethDecimal);
    const adjustedAmountOutMin = await calculateAdjustedAmountOutMin(amountIn, wethAddress, tokenAddress, slippagePercentage);
    const path = [wethAddress, tokenAddress]; // WETH to token
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    const signer = window.signer;
    const tx = await uniswapRouterContract.connect(signer).swapExactETHForTokensSupportingFeeOnTransferTokens(
        adjustedAmountOutMin,
        path,
        walletAddress,
        deadline,
        { value: amountIn }
    );

    await tx.wait();
    console.log('Tokens bought successfully.');
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
