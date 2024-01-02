/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, truncateAddress, fromBigIntNumberToDecimal, fromDecimalToBigInt } from './constants.js';

/*======================================================
    WRITE FUNCTION CALLS for the wallet module
======================================================*/
async function allowanceCheck(tokenAmount, tokenAddress) {
    // Check if wallet is connected
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
        console.error('No wallet connected. Please connect a wallet.');
        return;
    }

    // ERC20 ABI & contract instance
    const erc20ABI = [
        {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"},
        {"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"type":"function"}
    ];
    const erc20Contract = new web3.eth.Contract(erc20ABI, tokenAddress);

    try {
        const [allowanceResult, decimalsResult, symbolResult] = await Promise.all([
            erc20Contract.methods.allowance(accounts[0], vaultAddress).call(),
            erc20Contract.methods.decimals().call(),
            erc20Contract.methods.symbol().call()
        ]);

        // Convert the allowance to decimal
        const allowanceDecimal = fromBigIntNumberToDecimal(allowanceResult, decimalsResult);

        // Compare allowance with the input amount
        if (parseFloat(allowanceDecimal) >= parseFloat(tokenAmount)) {
            console.log('Allowance is sufficient for the transaction.');
            console.log(`Decimals: ${decimalsResult}, Symbol: ${symbolResult}`);
        } else {
            console.log('Insufficient allowance for the transaction.');
        }

        return {
            allowance: allowanceDecimal,
            symbol: symbolResult
        };
    } catch (error) {
        console.error('Error checking allowance and amount:', error);
    }
}

async function approvalDepositInterface(tokenAmount, tokenAddress) {
    // Check token allowance from wallet to Vault
    const { allowance, symbol } = await allowanceCheck(tokenAmount, tokenAddress);

    let transactionMessage = '';
    let proceedButtonText = 'checking ...';

    if (allowance < tokenAmount) {
        // prepare approved info panel for swal below
        transactionMessage = `
        <div class="approvalRequired">  
            <span class="approvalStatus">Approval Required</span>
            <div class="approvalInfo">
                <p>
                    <span class="approvalInfoValue">${tokenAmount}</span>
                    <span class="approvalInfoTitle"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
                <p>
                    <span class="approvalInfoValue">${walletAddressTrunc} <a href="https://etherscan.io/address/${walletAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>                    
                    <span class="approvalTo">To:</span>
                    <span class="approvalInfoValue">${vaultAddressTrunc} <a href="https://etherscan.io/address/${vaultAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                </p>
            </div>

            <div class="explainer">
                <span> 
                    <i class="fa fa-info-circle"></i>
                    Token approval is required before depositing to Vault. Click approve below to Sign the Approval Transaction with your wallet.
                </span>
            </div>
        </div> `;
        proceedButtonText = 'Approve';
    } else if (allowance >= tokenAmount) {
        transactionMessage = `
        <div class="approvalRequired">  
            <span class="approvalStatus">Proceed to Deposit</span>
            <div class="approvalInfo">
                <p>
                    <span class="approvalInfoValue">${tokenAmount}</span>
                    <span class="approvalInfoTitle"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
                <p>
                    <span class="approvalTo">Deposit To Vault:</span>
                    <span class="approvalInfoValue">${vaultAddressTrunc} <a href="https://etherscan.io/address/${vaultAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                </p>
            </div>

            <div class="explainer">
                <span> 
                    <i class="fa fa-info-circle"></i>
                    Click deposit below, your wallet will be prompted to Sign the Deposit Transaction. 
                </span>
            </div>
        </div> `;
        proceedButtonText = 'Deposit';
    }

    // if insufficient balance inform user
    if (walletBalance < tokenAmount) {
        transactionMessage = `
        <div class="approvalRequired">  
            <span class="approvalStatus">Insufficient Balance</span>
            <div class="approvalInfo">
                <p> 
                    <span class="approvalInfoValue">${walletBalance}</span>
                    <span class="approvalInfoTitle"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
                <p>
                    <span class="approvalTo">Required:</span>
                    <span class="approvalInfoValue">${tokenAmount}</span>
                    <span class="approvalInfoTitle"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
            </div>`;
    }

    // Prepare addresses
    const walletAddress = accounts[0];
    const walletAddressTrunc = truncateAddress(walletAddress);
    const vaultAddress = CONSTANTS.vaultAddress;
    const vaultAddressTrunc = truncateAddress(vaultAddress);

    // Prepare deposit states
    let approvalRequired = allowance < tokenAmount && walletBalance >= tokenAmount;
    let depositRequired = allowance >= tokenAmount && walletBalance >= tokenAmount;
    let approved = allowance >= tokenAmount && walletBalance >= tokenAmount;

    swal({
        title: "Depositing to Vault",
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
        if (!approved && !depositRequired) {
            $('.confirm').prop("disabled", true);
        } else {
            $('.confirm').prop("disabled", false);

            // Pop Processing Swal

            // Submit Transaction to Vault
            if (approvalRequired) {
                vaultApprove(tokenAddress, tokenAmount);
            } else if (depositRequired) {
                vaultDeposit(tokenAddress, tokenAmount);
            }
        } // close else            
    }); // close swal

}

async function vaultApprove(tokenAddress, tokenAmount) {
    // Retrieve wallet connected
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
        console.log('No wallet connected. Please connect a wallet.');
        return;
    }
    const walletAddress = accounts[0];
    const vaultAddress = CONSTANTS.vaultAddress;

    const [symbol, decimals] = await getSymbolAndDecimals(tokenAddress);
    const approveAmountWei = fromDecimalToBigInt(tokenAmount, decimals);

    // Request message displayed
    tokenApprovalSwal(tokenAddress, tokenAmount, symbol);

    // ERC20 ABI & instance
    const erc20ABI = [
        { constant: false, inputs: [{ name: '_spender', type: 'address', }, { name: '_value', type: 'uint256', },], name: 'approve', outputs: [{ name: 'success', type: 'bool', },], type: 'function', },
        { constant: true, inputs: [{ name: '_owner', type: 'address', },], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256', },], type: 'function', },
        { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8', },], type: 'function', },
        { constant: true, inputs: [{ name: '_owner', type: 'address', }, { name: '_spender', type: 'address', },], name: 'allowance', outputs: [{ name: 'remaining', type: 'uint256', },], type: 'function', },
        { constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string', },], type: 'function', },
    ];
    const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);

    // Prepare Tx
    const encodedData = tokenContract.methods.approve(vaultAddress, approveAmountWei).encodeABI();
    const transactionObject = {
        to: tokenAddress,
        data: encodedData,
        from: walletAddress
    };
    const gasEstimate = await web3.eth.estimateGas(transactionObject);
    transactionObject.gas = gasEstimate;
    
    // Submit deposit Tx & Listen for the transaction to be mined
    const transaction = await web3.eth.sendTransaction(transactionObject);

    // Listen for the transaction to be mined
    transaction.on('receipt', function (receipt) {
        if (receipt.status == true) {
            console.log('Approval status: ' + receipt.status);
            // Call functions on success
            tokenApprovedSwal(tokenAddress, tokenAmount, symbol, vaultAddress, walletAddress);
            // Popup success
            
        }
        else {
            console.log('Approval Failed Receipt status: ' + receipt.status);
            swal({ title: "Failed.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Transaction Failed Receipt status: " + receipt.status });
        }
    })
    transaction.on('error', function (error) {
        console.error('Approval error:', error);
        swal({ title: "Failed.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Transaction error: " + error });
    });
}

function tokenApprovalSwal(tokenAddress, amount, symbol) {
    const privatize = `
    <div class="shl_inputshold delegate_inputshold setBeneField">
        <br>
        <div class="walletBalancesTL">
        <p>approval tx pending... </p>
        <span class="walletbalanceSpan">Approving an amount of ${amount} ${symbol} to ${CONSTANTS.neonAddress} from ${tokenAddress}"></span></br>
        </div>
    </div>`;

    swal({
        title: "Sign Transaction",
        text: privatize,
        type: "prompt",
        html: true,
        dangerMode: true,
        closeOnConfirm: false,
        showConfirmButton: false,
        showCancelButton: false,
        animation: "slide-from-top"
    }, async function () {//on confirm click

    });
}

function tokenApprovedSwal(tokenAddress, tokenAmount, tokenSymbol, vaultAddress, walletAddress) {
    const vaultAddressTrunc = truncateAddress(vaultAddress);
    const walletAddressTrunc = truncateAddress(walletAddress);

    transactionMessage = `
        <div class="approvalRequired">  
            <span class="approvalStatus">Allowance</span>
            <div class="approvalInfo">
                <p>
                    <span class="approvalInfoValue">${tokenAmount}</span>
                    <span class="approvalInfoValue"> ${tokenSymbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
                <p>
                    <span class="approvalInfoTitle">${walletAddressTrunc} <a href="https://etherscan.io/address/${walletAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>                    
                    <span class="approvalTo">To:</span>
                    <span class="approvalInfoTitle">${vaultAddressTrunc} <a href="https://etherscan.io/address/${vaultAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                </p>
            </div>

            <div class="explainer">
                <span> 
                    <i class="fa fa-info-circle"></i>
                    Token allowance set. Click proceed below to deposit.
                </span>
            </div>
        </div> `;
        swal({
            title: "Vault Approved",
            text: transactionMessage,
            html: true,
            showCancelButton: true,
            confirmButtonColor: "#04C86C",
            confirmButtonText: "Proceed",
            cancelButtonText: "Cancel",
            closeOnConfirm: false,
            closeOnCancel: true
            },
             // restart the deposit interface, should take user to deposit ready swal
            function () {
                approvalDepositInterface(tokenAmount, tokenAddress)  
            } 
    );//close swal
}

async function vaultDeposit(tokenAddress, tokenAmount) {
    // Retrieve wallet connected
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
        console.log('No wallet connected. Please connect a wallet.');
        return;
    }
    const walletAddress = accounts[0];
    const vaultAddress = CONSTANTS.vaultAddress;

    const [symbol, decimals] = await getSymbolAndDecimals(tokenAddress);
    const depositAmountWei = fromDecimalToBigInt(tokenAmount, decimals);

    // Request message displayed
    tokenDepositSwal(tokenAddress, tokenAmount, symbol);

    // Prepare Tx
    const encodedData = hedgingInstance.methods.depositToken(tokenAddress, depositAmountWei).encodeABI();
    const transactionObject = {
        to: vaultAddress,
        data: encodedData,
        from: walletAddress
    };
    const gasEstimate = await web3.eth.estimateGas(transactionObject);
    transactionObject.gas = gasEstimate;
    
    // Submit deposit Tx & Listen for the transaction to be mined
    const transaction = await web3.eth.sendTransaction(transactionObject);

    // Listen for the transaction to be mined
    transaction.on('receipt', function (receipt) {
        if (receipt.status == true) {
            console.log('Deposit status: ' + receipt.status);
            // Call functions on success
            tokenDepositedSwal(tokenAddress, tokenAmount, symbol);
            // Popup success
            
        }
        else {
            console.log('Deposit Failed Receipt status: ' + receipt.status);
            swal({ title: "Failed.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Transaction Failed Receipt status: " + receipt.status });
        }
    })
    transaction.on('error', function (error) {
        console.error('Deposit error:', error);
        swal({ title: "Failed.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Transaction error: " + error });
    });
}

function tokenDepositSwal(tokenAddress, amount, symbol) {
    const privatize = `
    <div class="shl_inputshold delegate_inputshold setBeneField">
        <br>
        <div class="walletBalancesTL">
        <p>deposit tx pending... </p>
        <span class="walletbalanceSpan">Depositing an amount of ${amount} ${symbol} to ${CONSTANTS.neonAddress}"></span></br>
        </div>
    </div>`;

    swal({
        title: "Sign Transaction",
        text: privatize,
        type: "prompt",
        html: true,
        dangerMode: true,
        closeOnConfirm: false,
        showConfirmButton: false,
        showCancelButton: false,
        animation: "slide-from-top"
    }, async function () {//on confirm click

    });
}

function tokenDepositedSwal(tokenAddress, tokenAmount, tokenSymbol) {
    const vaultAddress = CONSTANTS.vaultAddress;
    const vaultAddressTrunc = truncateAddress(vaultAddress);

    transactionMessage = `
        <div class="approvalRequired">  
            <span class="approvalStatus">tx</span>
            <div class="approvalInfo">
                <p>
                    <span class="approvalInfoValue">${tokenAmount}</span>
                    <span class="approvalInfoTitle"> ${tokenSymbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
                <p>                   
                    <span class="approvalTo">To:</span>
                    <span class="approvalInfoValue">${vaultAddressTrunc} <a href="https://etherscan.io/address/${vaultAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                </p>
            </div>
        </div> `;
    swal({
        title: "Deposit Success",
        text: transactionMessage,
        html: true,
        showCancelButton: false,
        confirmButtonColor: "#04C86C",
        confirmButtonText: "Done",
        closeOnConfirm: true,
        closeOnOutsideClick: true
    });//close swal
}









/* WITHDRAWALs */










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

export { prepareDeposit, prepareWithdrawal, proceedDepositTx, proceedWithdrawTx, refreshBalances }
  