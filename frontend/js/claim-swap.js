/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, getAccounts, isValidEthereumAddress, getUserBalancesForToken, getSymbol, fromBigIntNumberToDecimal, commaNumbering } from './constants.js';
import { initializeConnection, chainCheck, unlockedWallet, reqConnect, handleAccountChange, handleNetworkChange} from './web3-walletstatus-module.js';

// Uniswap V2 Router address
const uniswapRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

// Uniswap V2 Router ABI
const uniswapRouterABI = [
    'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
    'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
];

// Initialize Uniswap V2 Router contract
let provider = window.provider;
const uniswapRouterContract = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, provider);

// Function to estimate output amount for a given input amount
async function estimateOutputAmount(inputAmount, inputTokenAddress, outputTokenAddress) {
    const path = [inputTokenAddress, outputTokenAddress];
    const amountsOut = await uniswapRouterContract.getAmountsOut(inputAmount, path);
    return amountsOut[1]; // Output amount
}

// Function to calculate adjusted amountOutMin considering slippage
async function calculateAdjustedAmountOutMin(inputAmount, inputTokenAddress, outputTokenAddress, slippagePercentage) {
    const outputAmount = await estimateOutputAmount(inputAmount, inputTokenAddress, outputTokenAddress);
    const slippageFactor = ethers.utils.parseUnits((100 - slippagePercentage).toString(), 18);
    const adjustedAmountOutMin = outputAmount.mul(slippageFactor).div(ethers.utils.parseUnits('100', 18));
    return adjustedAmountOutMin;
}

// Function to buy ERC20 tokens using ETH
async function buyTokens(tokenAddress, amountInETH, slippagePercentage) {
    const amountIn = ethers.utils.parseEther(amountInETH.toString());
    const adjustedAmountOutMin = await calculateAdjustedAmountOutMin(amountIn, provider.ethers.constants.AddressZero, tokenAddress, slippagePercentage);
    const path = [provider.ethers.constants.AddressZero, tokenAddress]; // ETH to token
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    const signer = provider.getSigner();
    const tx = await uniswapRouterContract.connect(signer).swapExactETHForTokensSupportingFeeOnTransferTokens(
        adjustedAmountOutMin,
        path,
        await signer.getAddress(),
        deadline,
        { value: amountIn }
    );

    await tx.wait();
    console.log('Tokens bought successfully.');
}

// Function to sell ERC20 tokens for ETH
async function sellTokens(tokenAddress, amountInTokens, slippagePercentage) {
    const amountIn = ethers.utils.parseUnits(amountInTokens.toString(), 18); // Assuming 18 decimals for the token
    const adjustedAmountOutMin = await calculateAdjustedAmountOutMin(amountIn, tokenAddress, provider.ethers.constants.AddressZero, slippagePercentage);
    const path = [tokenAddress, provider.ethers.constants.AddressZero]; // Token to ETH
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
