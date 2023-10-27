/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS } from './constants.js';

/*======================================================
    WRITE FUNCTION CALLS for the wallet module
======================================================*/

async function prepareDeposit(tokenAddress, tokenAmount) {
    // Retrieve wallet connected
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
        console.log('No wallet connected. Please connect a wallet.');
        return;
    }
    const walletAddress = accounts[0];

    // ERC20 ABI
    const erc20ABI = [ { constant: false, inputs: [ { name: '_spender', type: 'address', }, { name: '_value', type: 'uint256', }, ], name: 'approve', outputs: [ { name: 'success', type: 'bool', }, ], type: 'function', }, { constant: true, inputs: [ { name: '_owner', type: 'address', }, ], name: 'balanceOf', outputs: [ { name: 'balance', type: 'uint256', }, ], type: 'function', }, { constant: true, inputs: [], name: 'decimals', outputs: [ { name: '', type: 'uint8', }, ], type: 'function', }, { constant: true, inputs: [ { name: '_owner', type: 'address', }, { name: '_spender', type: 'address', }, ], name: 'allowance', outputs: [ { name: 'remaining', type: 'uint256', }, ], type: 'function', }, { constant: true, inputs: [], name: 'symbol', outputs: [ { name: '', type: 'string', }, ], type: 'function', }, ];

    // Check wallet's token balance, already in wei
    const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
    const balance = await tokenContract.methods.balanceOf(walletAddress).call();

    // Convert token amount to wei
    const tokenDecimals = await tokenContract.methods.decimals().call();
    const deposit_amountWei = new BigNumber(tokenAmount.toString()).times(10 ** tokenDecimals);
    const tokenSymbol = await tokenContract.methods.symbol().call();

    if (deposit_amountWei <= balance) {
        // Progress notification
        tokenApprovalSwal(tokenAddress, tokenAmount, tokenSymbol);
        // Approve neonAddress to handle the token amount

        // Estimate gasLimit
        var encodedData = tokenContract.methods.approve(CONSTANTS.neonAddress, deposit_amountWei).encodeABI();
        const estimateGas = await web3.eth.estimateGas({
            data: encodedData,
            from: walletAddress,
            to: tokenAddress
        });
        // Estimate the gasPrice
        const gasPrice = await web3.eth.getGasPrice(); 
        // Deposit transaction
        tokenContract.methods.approve(CONSTANTS.neonAddress, deposit_amountWei).send({
            from: MyGlobals.wallet,
            gasPrice: gasPrice,
            gasLimit: estimateGas,
        })
        // Listen for the transaction to be mined
        .on('receipt', function(receipt){
            if(receipt.status == true){//1 also matches true
                console.log('Approval status: '+receipt.status);console.log('Transaction hash:', receipt);
                // Proceed to Call Deposit Function now
                // Progress notification
                tokenDepositSwal(tokenAddress, tokenAmount, tokenSymbol);
                // Call proceedDepositTx function
                proceedDepositTx(tokenAddress, deposit_amountWei, tokenSymbol);
            }
            else{
                console.log('Approval Failed Receipt status: '+receipt.status);
                swal({title: "Failed.",type: "error",allowOutsideClick: true,confirmButtonColor: "#F27474",text: "Transaction Failed Receipt status: "+receipt.status});
            }
        })
        .on('error', function (error) {
            console.error('Approval error:', error);
            swal({title: "Failed.",type: "error",allowOutsideClick: true,confirmButtonColor: "#F27474",text: "Transaction error: "+error});
        });
    } else {
            console.log('Insufficient funds to deposit.');
    }
}


async function prepareWithdrawal(tokenAddress, tokenAmount) {
    // Retrieve wallet connected
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
        console.log('No wallet connected. Please connect a wallet.');
        return;
    }
    const walletAddress = accounts[0];

    // ERC20 ABI
    const erc20ABI = [ { constant: false, inputs: [ { name: '_spender', type: 'address', }, { name: '_value', type: 'uint256', }, ], name: 'approve', outputs: [ { name: 'success', type: 'bool', }, ], type: 'function', }, { constant: true, inputs: [ { name: '_owner', type: 'address', }, ], name: 'balanceOf', outputs: [ { name: 'balance', type: 'uint256', }, ], type: 'function', }, { constant: true, inputs: [], name: 'decimals', outputs: [ { name: '', type: 'uint8', }, ], type: 'function', }, { constant: true, inputs: [ { name: '_owner', type: 'address', }, { name: '_spender', type: 'address', }, ], name: 'allowance', outputs: [ { name: 'remaining', type: 'uint256', }, ], type: 'function', }, { constant: true, inputs: [], name: 'symbol', outputs: [ { name: '', type: 'string', }, ], type: 'function', }, ];

    // Check wallet's token balance, already in wei
    const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
    const balance = await tokenContract.methods.balanceOf(walletAddress).call();

    // Convert token amount to wei
    const tokenDecimals = await tokenContract.methods.decimals().call();
    const withdraw_amountWei = new BigNumber(tokenAmount.toString()).times(10 ** tokenDecimals);
    const tokenSymbol = await tokenContract.methods.symbol().call();

    if (withdraw_amountWei <= balance) {
        
        // Progress notification
        tokenWithdrawSwal(tokenAddress, tokenAmount, tokenSymbol);
        // Call proceed function
        proceedWithdrawTx(tokenAddress, withdraw_amountWei, tokenSymbol);
    
    } else {
            console.log('Insufficient funds to deposit.');
    }
}
  
/* Depracated use of txHash to get receipt
async function hasReceiptSuccess(txHash, callback) {
    let interval;
    // Check the receipt status and wait for it to be successful
    const checkForSuccess = async () => {
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        if (receipt) {
            if (receipt.status === true) {
                // Transaction was successful
                clearInterval(interval); // Clear the interval
                callback(); // Call the provided callback
            } else if (receipt.status === false) {
                console.log('Transaction failed. Deposit canceled.');
                clearInterval(interval); // Clear the interval
            } else {
                console.log('Transaction is still pending. Awaiting confirmation...');
            }
        } else {
            console.log('Transaction not yet mined. Waiting for confirmation...');
        }
    };
    interval = setInterval(checkForSuccess, 10000); // Check every 10 seconds
    // Call the initial check immediately
    checkForSuccess();
}
*/

async function proceedDepositTx(tokenAddress, tokenAmount, tokenSymbol) {
    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            throw new Error('No wallet connected. Please connect a wallet.');
        }
        const walletAddress = accounts[0];

        const functionSelector = hedgingInstance.methods.depositToken(tokenAddress, tokenAmount).encodeABI();
    
        const transactionObject = {
            to: CONSTANTS.neonAddress,
            data: functionSelector,
            from: walletAddress
        };
    
        const gasEstimate = await web3.eth.estimateGas(transactionObject);
        transactionObject.gas = gasEstimate;
    
        // Submit deposit Tx & Listen for the transaction to be mined
        const receipt = await web3.eth.sendTransaction(transactionObject)
        .on('receipt', function(receipt){
            // Proceed to Call Deposit Function now
            if(receipt.status == true){//1 also matches true
                console.log('Deposit status: '+receipt.status);console.log('Transaction hash:', receipt);
                // Progress notification
                tokenDepositSwal(tokenAddress, tokenAmount, tokenSymbol);
                // Call refresh function
                refreshBalances();
            }
            else{
                console.log('Deposit Failed Receipt status: '+receipt.status);
                swal({title: "Failed.",type: "error",allowOutsideClick: true,confirmButtonColor: "#F27474",text: "Transaction Failed Receipt status: "+receipt.status});
            }
        })
        .on('error', function (error) {
            console.error('Deposit error:', error);
            swal({title: "Failed.",type: "error",allowOutsideClick: true,confirmButtonColor: "#F27474",text: "Transaction error: "+error});
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function proceedWithdrawTx(tokenAddress, tokenAmount, tokenSymbol) {
    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            throw new Error('No wallet connected. Please connect a wallet.');
        }
        const walletAddress = accounts[0];

        const functionSelector = hedgingInstance.methods.withdrawToken(tokenAddress, tokenAmount).encodeABI();
    
        const transactionObject = {
            to: CONSTANTS.neonAddress,
            data: functionSelector,
            from: walletAddress
        };
    
        const gasEstimate = await web3.eth.estimateGas(transactionObject);
        transactionObject.gas = gasEstimate;
    
        // Submit withdraw Tx & Listen for the transaction to be mined
        const receipt = await web3.eth.sendTransaction(transactionObject)
        .on('receipt', function(receipt){
            // Proceed to Call Withdraw Function now
            if(receipt.status == true){//1 also matches true
                console.log('Withdrawal status: '+receipt.status);console.log('Transaction hash:', receipt);
                // Progress notification
                tokenWithdrawSwal(tokenAddress, tokenAmount, tokenSymbol);
                // Call refresh function
                refreshBalances();
            }
            else{
                console.log('Withdrawal Failed Receipt status: '+receipt.status);
                swal({title: "Failed.",type: "error",allowOutsideClick: true,confirmButtonColor: "#F27474",text: "Transaction Failed Receipt status: "+receipt.status});
            }
        })
        .on('error', function (error) {
            console.error('Withdrawal error:', error);
            swal({title: "Failed.",type: "error",allowOutsideClick: true,confirmButtonColor: "#F27474",text: "Transaction error: "+error});
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}
  
  // Dummy refresh balances on networth card & append <li> to token list
function refreshBalances() {
    console.log('Refreshing balances...');
}

  // Tx approval request notification
function tokenApprovalSwal(tokenAddress, amount, tokenSymbol) {
    const privatize = `
    <div class="shl_inputshold delegate_inputshold setBeneField">
        <br>
        <div class="walletBalancesTL">
        <p>approval tx pending... </p>
        <span class="walletbalanceSpan">Approving an amount of ${amount} ${tokenSymbol} to ${CONSTANTS.neonAddress} from ${tokenAddress}"></span></br>
        </div>
    </div>`;

    swal({
        title: "Approve Tokens to Neon Vault",
        text: privatize,
        type: "prompt",
        html: true,
        dangerMode: true,
        confirmButtonText: "Approve",
        confirmButtonColor: "#171716",
        cancelButtonText: "Cancel",
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        showConfirmButton: true,
        showCancelButton: true,
        animation: "slide-from-top"
    },async function(){//on confirm click
        
    });
}

  // Tx deposit notification
function tokenDepositSwal(tokenAddress, amount, tokenSymbol) {
    const privatize = `
    <div class="shl_inputshold delegate_inputshold setBeneField">
        <br>
        <div class="walletBalancesTL">
        <p>deposit tx pending... </p>
        <span class="walletbalanceSpan">Depositing an amount of ${amount} ${tokenSymbol} to Neon Vault ${CONSTANTS.neonAddress}"></span></br>
        </div>
    </div>`;

    swal({
        title: "Depositing Tokens",
        text: privatize,
        type: "prompt",
        html: true,
        dangerMode: true,
        confirmButtonText: "Depositing",
        confirmButtonColor: "#171716",
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        showConfirmButton: true,
        showCancelButton: false,
        animation: "slide-from-top"
    },async function(){//on confirm click
        
    });
}

  // Tx withdrawal notification
  function tokenWithdrawSwal(tokenAddress, amount, tokenSymbol) {
    const privatize = `
    <div class="shl_inputshold delegate_inputshold setBeneField">
        <br>
        <div class="walletBalancesTL">
        <p>withdraw tx pending... </p>
        <span class="walletbalanceSpan">Withdrawing an amount of ${amount} ${tokenSymbol} from Neon Vault ${CONSTANTS.neonAddress}"></span></br>
        </div>
    </div>`;

    swal({
        title: "Withdrawing Tokens",
        text: privatize,
        type: "prompt",
        html: true,
        dangerMode: true,
        confirmButtonText: "Withdrawing",
        confirmButtonColor: "#171716",
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        showConfirmButton: true,
        showCancelButton: false,
        animation: "slide-from-top"
    },async function(){//on confirm click
        
    });
}

export { prepareDeposit, refreshBalances }
  