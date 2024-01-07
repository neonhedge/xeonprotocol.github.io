/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, truncateAddress, fromBigIntNumberToDecimal, fromDecimalToBigInt, getAccounts, getTokenDecimalAndSymbol } from './constants.js';

/*======================================================
    WRITE FUNCTION CALLS for the wallet module
======================================================*/
async function allowanceCheck(tokenAddress) {
    const vaultAddress = CONSTANTS.hedgingAddress;
    const accounts = await getAccounts();

    if (accounts.length === 0) {
        console.error('No wallet connected. Please connect a wallet.');
        return;
    }

    const tokenContract = new ethers.Contract(tokenAddress, [
        { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "pure", "type": "function" },
        { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "pure", "type": "function" },
    ], provider);

    const [allowanceResult, decimals, symbol] = await Promise.all([
        tokenContract.allowance(accounts[0], vaultAddress),
        tokenContract.decimals(),
        tokenContract.symbol(),
    ]);
    
    console.log('allowance: '+allowanceResult+' decimal: '+decimals+' symbol: '+symbol)

    const allowanceDecimal = fromBigIntNumberToDecimal(allowanceResult, decimals);

    return { allowance: allowanceDecimal, symbol: symbol, decimals: decimals };
}

async function approvalDepositInterface(tokenAmount, tokenAddress) {
    
    // Prepare addresses
    const accounts = await getAccounts();
    const walletAddress = accounts[0];
    const walletAddressTrunc = truncateAddress(walletAddress);
    const vaultAddress = CONSTANTS.hedgingAddress;
    const vaultAddressTrunc = truncateAddress(vaultAddress);

    // token allowance from wallet to Vault
    const allowanceResult = await allowanceCheck(tokenAddress);
    const allowance = Number(allowanceResult.allowance);
    const decimals = Number(allowanceResult.decimals);
    const symbol = allowanceResult.symbol;
    tokenAmount = Number(tokenAmount);

    // token balance check
    const walletBalanceRaw = await neonInstance.balanceOf(walletAddress);
    const walletBalance = fromBigIntNumberToDecimal(walletBalanceRaw, decimals);

    let transactionMessage = '';
    let proceedButtonText = 'checking ...';
    // prepare approved info panel for swal below
    // classes on left are for size, on right are for coloring & font
    // interfaceWindow is displayed once in a swal popup, then changes messages on transaction status
    transactionMessage = `
            <div id="approvalRequired" class="interfaceWindow">  
                <span class="txStatus">Approval Required</span>
                <div class="approvalInfo">
                    <p>
                        <span class="txInfoHead txInfoAmount">${tokenAmount}</span>
                        <span class="txInfoHead txInfoSymbol"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                    </p>
                    <p>
                        <span class="txInfoBody txInfoAddress">${walletAddressTrunc} <a href="https://etherscan.io/address/${walletAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>                    
                        <span class="txInfoBody txActionTitle">To:</span>
                        <span class="txInfoBody txInfoAddress">${vaultAddressTrunc} <a href="https://etherscan.io/address/${vaultAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                    </p>
                </div>

                <div class="explainer">
                    <span> 
                        <i class="fa fa-info-circle"></i>
                        Token approval is required before depositing to Vault. Click approve below to Sign the Approval Transaction with your wallet.
                    </span>
                </div>
            </div>

            <div id="approvalInProgress" class="interfaceWindow">
                <span class="txStatus">Approval in progress</span>
                <div class="approvalInfo">
                    <p>Please confirm the transaction in your wallet.</p>
                </div>
                <span class="walletbalanceSpan">Approving ${tokenAmount} ${symbol} to <a href="https://etherscan.io/token/${vaultAddress}" target="_blank">Vault <i class="fa fa-external-link"></i></a></span>
            </div>

            <div id="depositInProgress" class="interfaceWindow">
                <span class="txStatus">Deposit in progress</span>
                <div class="approvalInfo">
                    <p>Please confirm the transaction in your wallet.</p>
                </div>
                <span class="walletbalanceSpan">Depositing ${tokenAmount} ${symbol} to <a href="https://etherscan.io/token/${vaultAddress}" target="_blank">Vault <i class="fa fa-external-link"></i></a></span>
            </div>

            <div id="withdrawInProgress" class="interfaceWindow">
                <span class="txStatus">Withdrawal in progress</span>
                <div class="approvalInfo">
                    <p>Please confirm the transaction in your wallet.</p>
                </div>
                <span class="walletbalanceSpan">Withdrawing ${tokenAmount} ${symbol} from <a href="https://etherscan.io/token/${vaultAddress}" target="_blank">Vault <i class="fa fa-external-link"></i></a></span>
            </div>

            <div id="depositRequired" class="interfaceWindow ">  
                <span class="txStatus">Proceed to Deposit</span>
                <div class="approvalInfo">
                    <p>
                        <span class="txInfoHead txInfoAmount">${tokenAmount}</span>
                        <span class="txInfoHead txInfoSymbol"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                    </p>
                    <p>
                        <span class="txInfoBody txActionTitle">Deposit To Vault:</span>
                        <span class="txInfoBody txInfoAddress">${vaultAddressTrunc} <a href="https://etherscan.io/address/${vaultAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                    </p>
                </div>

                <div class="explainer">
                    <span> 
                        <i class="fa fa-info-circle"></i>
                        Click deposit below, your wallet will be prompted to Sign the Deposit Transaction. 
                    </span>
                </div>
            </div>

            <div id="insufficientBalance" class="interfaceWindow">  
                <span class="txStatus">Insufficient Balance</span>
                <div class="approvalInfo">
                    <p> 
                        <span class="txInfoHead txInfoAmount">${walletBalance}</span>
                        <span class="txInfoHead txInfoSymbol"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                    </p>
                    <p>
                        <span class="txInfoBody txActionTitle">Required:</span>
                        <span class="txInfoBody txInfoAmount">${tokenAmount}</span>
                        <span class="txInfoBody txInfoSymbol"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                    </p>
                </div>
            </div>

            <div id="allowanceSuccess" class="interfaceWindow">
                <span class="txStatus">Allowance</span>
                <div class="approvalInfo">
                    <p>
                        <span class="txInfoHead txInfoAmount">${tokenAmount}</span>
                        <span class="txInfoHead txInfoSymbol"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                    </p>
                    <p>
                        <span class="txInfoBody txInfoAddress">${walletAddressTrunc} <a href="https://etherscan.io/address/${walletAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>                    
                        <span class="txInfoBody txActionTitle">To:</span>
                        <span class="txInfoBody txInfoAddress">${vaultAddressTrunc} <a href="https://etherscan.io/address/${vaultAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                    </p>
                </div>

                <div class="explainer">
                    <span> 
                        <i class="fa fa-info-circle"></i>
                        Token allowance set. Click proceed below to deposit.
                    </span>
                </div>
            </div>

            <div id="depositSuccess" class="interfaceWindow">
                <span class="txStatus">Deposit Success</span>
                <div class="approvalInfo">
                    <p>
                        <span class="txInfoHead txInfoAmount">${tokenAmount}</span>
                        <span class="txInfoHead txInfoSymbol"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                    </p>
                    <p>                   
                        <span class="txActionTitle">To:</span>
                        <span class="txInfoAddress">${vaultAddressTrunc} <a href="https://etherscan.io/address/${vaultAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                    </p>
                </div>
                <div class="explainer">
                    <span> 
                        <i class="fa fa-info-circle"></i>
                        Tokens deposited and ready to use.
                    </span>
                </div>
            </div>
            <div id="withdrawSuccess" class="interfaceWindow">
                <span class="txStatus">Withdrawal Success</span>
                <div class="approvalInfo">
                    <p>
                        <span class="txInfoHead txInfoAmount">${tokenAmount}</span>
                        <span class="txInfoHead txInfoSymbol"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                    </p>
                    <p>                   
                        <span class="txActionTitle">From:</span>
                        <span class="txInfoAddress">${vaultAddressTrunc} <a href="https://etherscan.io/address/${vaultAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                    </p>
                </div>
                <div class="explainer">
                    <span> 
                        <i class="fa fa-info-circle"></i>
                        Tokens withdrawn back to wallet.
                    </span>
                </div>
            </div>
        `;

    // Prepare deposit states
    let allowanceRequired = allowance < tokenAmount && walletBalance >= tokenAmount;
    let depositRequired = allowance >= tokenAmount && walletBalance >= tokenAmount;
    let approved = allowance >= tokenAmount && walletBalance >= tokenAmount;
    swal({
        title: "Vault Deposit",
        text: transactionMessage,
        html: true,
        showCancelButton: true,
        confirmButtonColor: "#04C86C",
        confirmButtonText: proceedButtonText,
        cancelButtonText: "Cancel",
        closeOnConfirm: false,
        closeOnCancel: true
    }, async function () {
        // Check if wallet has enough balance
        if (!allowanceRequired && !depositRequired && !approved) {
            $('.confirm').prop("disabled", true);
        } else {
            $('.confirm').prop("disabled", false);
            // change button text
            $('.confirm').html('<i class="fa fa-spinner fa-spin"></i> Processing...');
    
            if (allowanceRequired) {
                // Approving message
                tokenApprovingMessage();
                // Submit Transaction to Vault
                vaultApprove(tokenAddress, tokenAmount);
            } else if (depositRequired) {                
                // Request message displayed
                tokenDepositingMessage();
                // Submit Transaction to Vault
                vaultDeposit(tokenAddress, tokenAmount);
            }
            
        } // close else            
    }); // close swal

    // Run display scrips on swal load
    // Allowance or deposit
    console.log("allowance: " + allowance + ", tokenAmount: " + tokenAmount + ", walletBalance: " + walletBalance);
    $("#transactSubmit").html('<i class="fa fa-spinner fa-spin"></i> transacting...');
    if (allowance < tokenAmount) {
        // Slide out current message
        $(".interfaceWindow").hide();
        // Slide in approval success
        $("#approvalRequired").fadeIn("slow");
        // Proceed button text
        $('.confirm').html('Approve');

    } else if (allowance >= tokenAmount) {
        // Slide out current message
        $(".interfaceWindow").hide();
        // Slide in approval success
        $("#depositRequired").fadeIn("slow");
       // Proceed button text
       $('.confirm').html('Deposit');
    }
    // if insufficient balance inform user
    if (walletBalance < tokenAmount) {
       // Disable confirm button
       $("#confirmButton").prop("disabled", true);
       // Slide out current message
       $(".interfaceWindow").hide();
       // Slide in approval success
       $("#insufficientBalance").fadeIn("slow");
       // Proceed button text
       $('.confirm').html('<i class="fa fa-spinner fa-spin"></i> Wait...');
    }

}

async function vaultApprove(tokenAddress, tokenAmount) {
    try {
        // Retrieve wallet connected
        const accounts = await getAccounts();
        if (accounts.length === 0) {
            console.log('No wallet connected. Please connect a wallet.');
            return;
        }
        const walletAddress = accounts[0];
        const vaultAddress = CONSTANTS.hedgingAddress;

        const [decimals, symbol] = await getTokenDecimalAndSymbol(tokenAddress);
        const approveAmountWei = fromDecimalToBigInt(tokenAmount, decimals);

        // ERC20 ABI & instance
        const erc20ABI = [
            { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
        ];
        
        const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, window.provider);
        
        // Prepare Tx
        const transaction = await tokenContract.connect(signer).approve(vaultAddress, approveAmountWei);

        // Wait for the transaction to be mined
        const receipt = await transaction.wait();

        if (receipt.status === 1) {
            // Show success message
            tokenApprovedMessage(tokenAmount, tokenAddress);
            console.log('Approval successful.');
        } else {
            // Transaction failed
            console.log('Approval failed. Receipt status: ' + receipt.status);
            swal({ title: "Failed.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Transaction failed. Receipt status: " + receipt.status });
        }

        // Enable confirm button again
        $('.confirm').prop("disabled", false);
    } catch (error) {
        console.error('Approval error:', error);
        swal({ title: "Failed.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Transaction error: " + error.message });
    }
}


async function tokenApprovingMessage() {
    // Slide out the existing content
    $(".interfaceWindow").hide();
    // Slide in the new content
    $("#approvalInProgress").fadeIn(2);

    // Disable confirm button
    $('.confirm').prop("disabled", true);
}


function tokenApprovedMessage(tokenAmount, tokenAddress) {
    // Slide out approval in progress
    $(".interfaceWindow").hide();
    // Slide in approval success
    $("#allowanceSuccess").fadeIn("slow");

    approvalDepositInterface(tokenAmount, tokenAddress);    
}

async function vaultDeposit(tokenAddress, tokenAmount) {
    try {
        // Retrieve wallet connected
        const accounts = await getAccounts();
        if (accounts.length === 0) {
            console.log('No wallet connected. Please connect a wallet.');
            return;
        }
        const walletAddress = accounts[0];
        const vaultAddress = CONSTANTS.hedgingAddress;

        const [decimals, symbol] = await getTokenDecimalAndSymbol(tokenAddress);
        const depositAmountWei = fromDecimalToBigInt(tokenAmount, decimals);

        // Prepare Tx
        const transaction = await hedgingInstance.connect(signer).depositToken(tokenAddress, depositAmountWei);

        // Wait for the transaction to be mined
        const receipt = await transaction.wait();

        if (receipt.status === 1) {
            // Call functions on success
            tokenDepositedMessage(receipt.transactionHash);
            console.log('Deposit successful...');
            console.log('Transaction Hash: '+ receipt.transactionHash);
        } else {
            // Transaction failed
            console.log('Deposit failed. Receipt status: ' + receipt.status);
            swal({ title: "Failed.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Transaction failed. Receipt status: " + receipt.status });
        }
    } catch (error) {
        console.error('Deposit error:', error);
        swal({ title: "Failed.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Transaction error: " + error.message });
    }
}

function tokenDepositingMessage() {

    // Slide out the existing content
    $(".interfaceWindow").hide();
    // Slide in the new content
    $("#depositInProgress").fadeIn("slow");

    // Disable confirm button
    $('.confirm').prop("disabled", true);
}

function tokenDepositedMessage(transactionHash) {
    // Slide out approval in progress
    $(".interfaceWindow").hide();
    // Slide in approval success
    $("#depositSuccess").fadeIn("slow");
    // Wait for 3 seconds
    setTimeout(function() {
        // Enable confirm button again
        $('.confirm').prop("disabled", true);

        const transactionMessage = `
        <div class="interfaceWindow">  
            <div class="approvalInfo">
                <p>
                    <span class="txInfoHead txInfoSymbol"> view transaction... <a href="https://sepolia.etherscan.io/tx/${transactionHash}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
            </div>
        </div>`;

        swal({
            title: "Vault Deposit Successful",
            type: "success",
            text: transactionMessage,
            html: true,
            showCancelButton: false,
            confirmButtonColor: "#04C86C",
            confirmButtonText: "Wow!",
            cancelButtonText: "Cancel",
            closeOnConfirm: true
        });
    }, 3000); 
}

function tokenWithdrawingMessage() {

    // Slide out the existing content
    $(".interfaceWindow").hide();
    // Slide in the new content
    $("#withdrawInProgress").fadeIn("slow");

    // Disable confirm button
    $('.confirm').prop("disabled", true);
}

function tokenWithdrawnMessage() {

    // Slide out approval in progress
    $(".interfaceWindow").hide();
    // Slide in approval success
    $("#depositSuccess").fadeIn("slow");

    // Enable confirm button again
    $('.confirm').prop("disabled", false);
}








/* WITHDRAWALs */










// Receives decimals
async function withdrawInterface(tokenAddress, tokenAmount) {
    try {
        const accounts = await getAccounts();

        if (accounts.length === 0) {
            console.log('No wallet connected. Please connect a wallet.');
            return;
        }

        const walletAddress = accounts[0];
        const erc20ABI = [
            { name: 'approve', inputs: [{ name: '_spender', type: 'address' }, { name: '_value', type: 'uint256' }], outputs: [{ name: 'success', type: 'bool' }], type: 'function' },
            { name: 'balanceOf', inputs: [{ name: '_owner', type: 'address' }], outputs: [{ name: 'balance', type: 'uint256' }], type: 'function' },
            { name: 'decimals', constant: true, inputs: [], outputs: [{ name: '', type: 'uint8' }], type: 'function' },
            { name: 'symbol', constant: true, inputs: [], outputs: [{ name: '', type: 'string' }], type: 'function' }
        ];

        const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, window.provider);
        const balance = await tokenContract.balanceOf(walletAddress);
        const tokenDecimals = await tokenContract.decimals();
        const withdrawAmountWei = fromDecimalToBigInt(tokenAmount, tokenDecimals);
        const balanceWei = fromDecimalToBigInt(balance, tokenDecimals);
        const tokenSymbol = await tokenContract.symbol();

        if (withdrawAmountWei > balanceWei) {
            // Progress notification
            tokenWithdrawingMessage(tokenAddress, tokenAmount, tokenSymbol);
            // Call proceed function
            await proceedWithdrawTx(tokenAddress, withdrawAmountWei, tokenSymbol);
        } else {
            console.log('Insufficient funds to withdraw.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function proceedWithdrawTx(tokenAddress, tokenAmount, tokenSymbol) {
    try {
        const accounts = await getAccounts();

        if (accounts.length === 0) {
            throw new Error('No wallet connected. Please connect a wallet.');
        }

        const walletAddress = accounts[0];
        const functionSelector = hedgingInstance.withdrawToken(tokenAddress, tokenAmount).encodeABI();
        const transactionObject = {
            to: CONSTANTS.neonAddress,
            data: functionSelector,
            from: walletAddress
        };
        const gasEstimate = await window.provider.estimateGas(transactionObject);
        transactionObject.gasLimit = gasEstimate;

        // Submit withdraw Tx
        const transaction = await window.provider.sendTransaction(transactionObject);
        console.log('Transaction sent:', transaction.hash);

        // Wait for the transaction to be mined
        const receipt = await transaction.wait();

        if (receipt.status === 1) {
            console.log('Withdrawal successful. Transaction hash:', receipt.transactionHash);
            // Progress notification
            tokenWithdrawnMessage(tokenAddress, tokenAmount, tokenSymbol);
            // Call refresh function
            refreshBalances();
        } else {
            console.log('Withdrawal failed. Receipt status:', receipt.status);
            swal({
                title: "Failed.",
                type: "error",
                allowOutsideClick: true,
                confirmButtonColor: "#F27474",
                text: "Transaction Failed. Receipt status: " + receipt.status
            });
        }
    } catch (error) {
        console.error('Withdrawal error:', error.message);
        swal({
            title: "Failed.",
            type: "error",
            allowOutsideClick: true,
            confirmButtonColor: "#F27474",
            text: "Transaction error: " + error.message
        });
    }
}


async function proceedDepositTx(tokenAddress, tokenAmount, tokenSymbol) {
    try {
        const accounts = await getAccounts();

        if (accounts.length === 0) {
            throw new Error('No wallet connected. Please connect a wallet.');
        }

        const walletAddress = accounts[0];
        const functionSelector = hedgingInstance.depositToken(tokenAddress, tokenAmount).encodeABI();
        const transactionObject = {
            to: CONSTANTS.neonAddress,
            data: functionSelector,
            from: walletAddress
        };
        const gasEstimate = await window.provider.estimateGas(transactionObject);
        transactionObject.gasLimit = gasEstimate;

        // Submit deposit Tx & Listen for the transaction to be mined
        const transaction = await window.ethereum.sendTransaction(transactionObject);
        const receipt = await transaction.wait();

        if (receipt.status === 1) {
            console.log('Deposit status: ' + receipt.status);
            console.log('Transaction hash:', receipt.transactionHash);
            // Progress notification
            tokenDepositedMessage(tokenAddress, tokenAmount, tokenSymbol);
            // Call refresh function
            refreshBalances();
        } else {
            console.log('Deposit Failed Receipt status: ' + receipt.status);
            swal({
                title: "Failed.",
                type: "error",
                allowOutsideClick: true,
                confirmButtonColor: "#F27474",
                text: "Transaction Failed Receipt status: " + receipt.status
            });
        }
    } catch (error) {
        console.error('Deposit error:', error);
        swal({
            title: "Failed.",
            type: "error",
            allowOutsideClick: true,
            confirmButtonColor: "#F27474",
            text: "Transaction error: " + error.message
        });
    }
}
// Dummy refresh balances on networth card & append <li> to token list
function refreshBalances() {
    console.log('Refreshing balances...');
}


// Event listener for modal being hidden
/*
Swal.fire({
    onClose: () => {
        $("#transactSubmit").html('Transact');
    },
});
*/
export { allowanceCheck, approvalDepositInterface, withdrawInterface, proceedDepositTx, proceedWithdrawTx };
  