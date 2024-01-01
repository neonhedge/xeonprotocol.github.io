/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, fromBigIntNumberToDecimal } from './constants.js';

/*======================================================
    WRITE FUNCTION CALLS for the wallet module
======================================================*/
async function allowanceCheck(tokenAmount, tokenAddress){
    // ERC20 ABI & contract instance
    [
        {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"},
        {"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"type":"function"}
    ]    
    const erc20Contract = new web3.eth.Contract(erc20ABI, tokenAddress); 

    try {
        const [allowanceResult, decimalsResult, symbolResult] = await Promise.all([
            erc20Contract.methods.allowance(walletAddress, vaultAddress).call(),
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
    } catch (error) {
        console.error('Error checking allowance and amount:', error);
    }
    return {
        allowance: allowanceDecimal,
        symbol: symbolResult
    };
}
async function approvalInterface(tokenAmount, tokenAddress){

    // Check token allowance from wallet to Vault
    const { allowance, tokenSymbol } = await allowanceCheck(tokenAmount, tokenAddress);

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
                    <span class="approvalInfoTitle"> ${tokenSymbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
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
    } else if(allowance >= tokenAmount) {
        transactionMessage = `
        <div class="approvalRequired">  
            <span class="approvalStatus">Proceed to Deposit</span>
            <div class="approvalInfo">
                <p>
                    <span class="approvalInfoValue">${tokenAmount}</span>
                    <span class="approvalInfoTitle"> ${tokenSymbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
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

    // if inssuficient balance inform user
    if (walletBalance < tokenAmount) {
        transactionMessage = `
        <div class="approvalRequired">  
            <span class="approvalStatus">Insufficient Balance</span>
            <div class="approvalInfo">
                <p> 
                    <span class="approvalInfoValue">${walletBalance}</span>
                    <span class="approvalInfoTitle"> ${tokenSymbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
                <p>
                    <span class="approvalTo">Required:</span>
                    <span class="approvalInfoValue">${tokenAmount}</span>
                    <span class="approvalInfoTitle"> ${tokenSymbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
            </div>`;
    }

    // Prepare addresses
    const walletAddress = accounts[0];
    const walletAddressTrunc = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
    const vaultAddress = CONSTANTS.vaultAddress;
    const vaultAddressTrunc = vaultAddress.slice(0, 6) + '...' + vaultAddress.slice(-4);
    // Prepare deposit states
    let approvalRequired = false;
    let depositRequired = false;
    let approved = false;
    if (allowance < tokenAmount && walletBalance >= tokenAmount) {
        approvalRequired = true;
    }
    if (allowance >= tokenAmount && walletBalance >= tokenAmount) {
        depositRequired = true;
        approved = true;
    }
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
            },
             // Callback on proceed click
            function () {
                // Check if wallet has enough balance
                if (!approved && !depositRequired) {
                    $('.confirm').prop("disabled", true);
                }else{
                    $('.confirm').prop("disabled", false);

                    // Check which function call is required
                    let operationTitle = 'Processing Transaction';
                    if (approvalRequired) {
                        operationTitle = 'Approving Tokens to Vault';
                    } else if (depositRequired) {
                        operationTitle = 'Depositing Tokens to Vault';
                    }

                    var inputf = '<span class="initiatingmeta">initiating, please wait...</br>(<span id="liveconfirms">0</span> / 24 block confirmations)</span>';
                    // Show transacting swal message
                    swal({
                            title: operationTitle,
                            text: inputf,
                            html: true,
                            showCancelButton: false,
                            showConfirmButton: false,
                            confirmButtonText: "processing...",
                            confirmButtonColor: "#4CAF50",
                            closeOnConfirm: false,
                            animation: "slide-from-top",
                            showLoaderOnConfirm: true
                    });
                    
                    // Submit Transaction to Vault
                    if (approvalRequired) {
                        vaultApprove();
                    } else if (depositRequired) {
                        vaultDeposit();
                    }                            
                }//close else            
            } // callback
    );//close swal
    
    //////////////////////////////////////////////////////////////
    //now that the form is displayed try initialize new elements
    /////////////////////////////////////////////////////////////
    //alert('1ST FORM revealed');
    $('.confirm').prop("disabled", true);	//DISABLE CONFRIM BUTTON ON LOAD BEFORE ANY CLICK	 
    
    // DETECT CLICK ON FORM SELECT RADIO BUTTON
    $(".stakelabel").click(function () {
        $('.confirm').prop("disabled", false);
    })
        
                                
}//function close

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

export { prepareDeposit, prepareWithdrawal, proceedDepositTx, proceedWithdrawTx, refreshBalances }
  