/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, getUserBalancesForToken, truncateAddress, fromBigIntNumberToDecimal, fromDecimalToBigInt, getAccounts, getTokenDecimalAndSymbol, getSymbol, getTokenDecimals } from './constants.js';
import { initializeConnection } from './web3-walletstatus-module.js';

/*======================================================
    WRITE FUNCTION CALLS for the silkraod module
======================================================*/
async function purchaseInterface(optionId) {
    function cardCommaFormat(number){
		const options = {
			style: 'decimal',
			minimumFractionDigits: 2,
			maximumFractionDigits: 7,
		};
		return number.toLocaleString('en-US', options);
	}; 

	const accounts = await getAccounts();
    const userAddress = accounts[0];

    // Fetch the hedge data by ID
	let result = await hedgingInstance.getHedgeDetails(optionId);

    // token balance check
    let userwithdrawable, withdrawableTokens, tokenAmount;
    try { 
        const mybalances = await getUserBalancesForToken(result.token, userAddress);
        userwithdrawable = mybalances.withdrawableBalance;
        withdrawableTokens = fromBigIntNumberToDecimal(userwithdrawable);
        tokenAmount = fromBigIntNumberToDecimal(tokenAmount);
    } catch (error){
        console.log(error);
    }

    // Check hedge availability
    let status = parseFloat(result.status);     
    if (status > 0) {
        console.log('Hedge Already Taken.');
        swal({
            title: "Hedge Already Taken",
            type: "warning",
            text: "The hedge you're trying to buy has already been bought..",
            html: true,
            showCancelButton: false,
            confirmButtonColor: "#04C86C",
            confirmButtonText: "Ooops",
            closeOnConfirm: true
        }, async function(isConfirm) {  }); // close swal
        return;
    }

    // Check sufficient deposits
    if (withdrawableTokens > tokenAmount) {
        console.log('Insufficient Vault Balance.');
        swal({
            title: "Insufficient Vault Balance",
            type: "warning",
            text: "You don't have enough free tokens to continue..",
            html: true,
            showCancelButton: false,
            confirmButtonColor: "#04C86C",
            confirmButtonText: "Ooops",
            closeOnConfirm: true
        }, async function(isConfirm) {  }); // close swal
        return;
    }
    
    // Prepare required data for quick preview:
    // what - assets: 100K oVELA
    // worth - 5 ETH
    // cost - 0.2 ETH
    // expiry - 30 days
    // hedge - call option
    // strikeprice - 0.0000001 ETH

    //----typewriter effect:
    //> context
    //> youre giving him 0.2 ETH liquidity for 5 ETH worth of shitcoins over 30days
    //> all gains on the assets beyond strike price are yours
    //> your max loss is 0.2 ETH
    //> settlement is at these conditions in 30 days
    //> only buy if the RR is worth it. Read docs for technical guide into options>    

    try{
		// Fetch symbol
		let symbol;
		fetchNameSymbol(result.token).then(t=>{name=t.name,symbol=t.symbol}).catch(e=>console.error(e));
		// Fetch token & pair address
		let tokenAddress = result.token;
		let truncatedTokenAdd = tokenAddress.substring(0, 6) + '...' + tokenAddress.slice(-3);
		let tokenPairAddress = result.paired;
		let truncatedPairAdd = tokenPairAddress.substring(0, 6) + '...' + tokenPairAddress.slice(-3);
		// Fetch owner
		let owner = result.owner;
        let truncatedOwner = owner.substring(0, 6) + '...' + owner.slice(-3);
		// Fetch taker
		let taker = result.taker;
        let truncatedTaker = taker.substring(0, 6) + '...' + taker.slice(-3);
		// Fetch deal status
		let status = parseFloat(result.status);        
		// Format token amounts
		let amountFormated = cardCommaFormat(tokenAmount);		

		// Fetch hedge type
		let hedgeType;
		if (result.hedgeType === 0) {
			hedgeType = 'CALL';
		} else if (result.hedgeType === 1) {
			hedgeType = 'PUT';
		} else if (result.hedgeType === 2) {
			hedgeType = 'SWAP';
		} else {
			console.log('Hedge type is unknown');
		}
		// Format manually the paired symbol
		let pairSymbol;
		if (tokenPairAddress === CONSTANTS.usdtAddress) {
			pairSymbol = 'USDT';
		} else if (tokenPairAddress === CONSTANTS.usdcAddress) {
			pairSymbol = 'USDC';
		} else if (tokenPairAddress === CONSTANTS.wethAddress) {
			pairSymbol = 'WETH';
		}
        
		// Fetch underlying tokens market value
		const [marketvalueCurrent, pairedAddress] = await hedgingInstance.getUnderlyingValue(tokenAddress, result.amount);
		const pairedAddressDecimal = await getTokenDecimals(tokenPairAddress);
		const marketvalue = fromBigIntNumberToDecimal(marketvalueCurrent, pairedAddressDecimal);
		
		// Fetch startvalue, cost, strikeprice in BN - before fromBigIntNumberToDecimal conversion
        let cost, strikeprice;
		let costBN = ethers.BigNumber.from(result.cost);
		// based on token decimals, manual not function call to pair address as WETH on sepolia is 6 decimal
		if (tokenPairAddress === CONSTANTS.usdtAddress || tokenPairAddress === CONSTANTS.usdcAddress) { //USDT or USDC
			strikeprice = fromBigIntNumberToDecimal(strike, 6);
			cost = fromBigIntNumberToDecimal(costBN, 6);
		} else if (tokenPairAddress === CONSTANTS.wethAddress) { //WETH
			strikeprice = fromBigIntNumberToDecimal(strike, 18);
			cost = fromBigIntNumberToDecimal(costBN, 18);
		}

		// Format outputs
		let marketvalueFormatted = cardCommaFormat(marketvalue);
		let costFormatted = cardCommaFormat(cost);
		let strikeFormatted = cardCommaFormat(strikePrice);
		
		// Token logourl
		let logourl = result.logourl;

		// Dates to human-readable dates
		let dt_created = new Date(result.dt_created * 1000).toLocaleString();
		let dt_started = new Date(result.dt_started * 1000).toLocaleString();
		let dt_expiry = new Date(result.dt_expiry * 1000).toLocaleString();

		// Calculate time left for dt_expiry
		let timeNow = new Date().getTime();
		let timeDiff = result.dt_expiry * 1000 - timeNow;
		let days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
		let hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		let minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
		let seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
		let timeToExpiry = days + "d " + hours + "h " + minutes + "m ";

		//strategy description for the option
		let hedgeTypeFull, strategyWidget, description, typeClass, typeClassValue;
		if(hedgeType == 'CALL') {
            hedgeTypeFull = 'Call Option';
			typeClass = 'aType-call-option';
			description = `on ${timeToExpiry}\nTaker will be in profit when market price is ABOVE strike price. Market - Strike = Profit Margin. \nTaker's max loss is ${costFormatted}${pairSymbol} if market price is ABOVE strike price.`;
			strategyWidget = `
			<div class="strategyHold" title="`+description+`">
				<img class="strategyImage" src="./imgs/call-option.svg" />
				<div class="strategyDataHold">
					<div class="topValue-call">profit zone</div>
					<div class="bottomValue-call">max loss `+costFormatted+` `+pairSymbol+`</div>
				</div>
			</div>`;
		}
		if(hedgeType == 'PUT') {
            hedgeTypeFull = 'Put Option';
			typeClass = 'aType-put-option';
			description = `on ${timeToExpiry}\nTaker is in profit when market price is BELOW strike price. Strike - Market = Profit Margin. \nTakers max loss is ${costFormatted}${pairSymbol} if market price is ABOVE strike price.`;
			strategyWidget = `
			<div class="strategyHold" title="`+description+`">
				<img class="strategyImage" src="./imgs/put-option.svg" />
				<div class="strategyDataHold">
					<div class="topValue-put">max loss `+costFormatted+` `+pairSymbol+`</div>
					<div class="bottomValue-put">profit zone</div>
				</div>
			</div>`;
		}
		if(hedgeType == 'SWAP') {
            hedgeTypeFull = 'Equity Swap';
			typeClass = 'aType-swap-option';
			typeClassValue = 'style="background: none !important;"';
		}
        
    } catch (error){
        console.log(error);
    }

    let transactionMessage = '';
    let proceedButtonText = 'checking ...';
    // prepare approved info panel for swal below
    // classes on left are for size, on right are for coloring & font
    // interfaceWindow is displayed once in a swal popup, then changes messages on transaction status
    transactionMessage = `

            <div id="depositInProgress" class="interfaceWindow">
                <span class="txStatus">Purchase in progress</span>
                <div class="approvalInfo">
                    <p>Please confirm the transaction in your wallet.</p>
                </div>
                <span class="walletbalanceSpan">Buying a ${hedgeTypeFull} from <a href="https://etherscan.io/address/${owner}" target="_blank">${truncatedOwner} <i class="fa fa-external-link"></i></a></span>
                <span class="walletbalanceSpan">Underlying Tokens: ${amountFormated} ${symbol} </span>
                <span class="walletbalanceSpan">Cost to Buy: ${costFormatted} ${pairSymbol}</span>
            </div>

            <div id="depositRequired" class="interfaceWindow ">  
                <span class="txStatus">Buy Hedge</span>
                <div class="approvalInfo">
                    <p>
                        <div class="projectLogo" style="background-image:url('${logourl}')"></div>
                        <span class="txInfoHead txInfoAmount">${amountFormated}</span>
                        <span class="txInfoHead txInfoSymbol"> ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                    </p>
                    <p>
                        <span class="txInfoBody txActionTitle">Market Value:</span>
                        <span class="txInfoHead txInfoAmount">${marketvalueFormatted}</span>
                        <span class="txInfoHead txInfoSymbol"> ${pairSymbol} <a href="https://etherscan.io/token/${pairedAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                    </p>
                    <p>
                        <span class="txInfoBody txActionTitle">Buy Cost:</span>
                        <span class="txInfoBody txInfoAddress">${costFormatted} <a href="https://etherscan.io/address/${pairedAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                    </p>

                    <p>
                        <span class="txInfoBody txActionTitle">Duration:</span>
                        <span class="txInfoBody txInfoAddress">${timeToExpiry}</span>  
                    </p>

                    <p>
                        <span class="txInfoBody txActionTitle">Hedge Type:</span>
                        <span class="txInfoBody txInfoAddress">${hedgeTypeFull}</span>
                    </p>
                    
                </div>

                <div class="explainer">
                    <span> 
                        <i class="fa fa-info-circle"></i>
                        Click buy below, your wallet will be prompted to Sign the Purchase Transaction. 
                    </span>
                </div>
            </div>

            <div id="depositSuccess" class="interfaceWindow">
                <span class="txStatus">Purchase Successful</span>
                <div class="approvalInfo">
                    <p>
                        <span class="txInfoHead txInfoAmount">You have purchased the ${hedgeTypeFull} for ${amountFormated} ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                    </p>
                    <p>                   
                        <span class="txActionTitle">From:</span>
                        <span class="txInfoAddress">${truncatedOwner} <a href="https://etherscan.io/address/${owner}" target="_blank"><i class="fa fa-external-link"></i></a></span>  
                    </p>
                </div>
                <div class="explainer">
                    <span> 
                        <i class="fa fa-info-circle"></i>
                        Fetching the transaction...
                    </span>
                </div>
            </div>
        `;

    swal({
        type: "info",
        title: "Hedge Purchase",
        text: transactionMessage,
        html: true,
        showCancelButton: true,
        confirmButtonColor: "#04C86C",
        confirmButtonText: proceedButtonText,
        cancelButtonText: "Cancel",
        closeOnConfirm: false,
        closeOnCancel: true
    }, async function(isConfirm) {
        if (isConfirm) {
            // Check if wallet has enough permissions
            if (tokenAmount < walletBalance) {
                $('.confirm').prop("disabled", true);
            } else {
                $('.confirm').prop("disabled", false);
                $('.confirm').html('<i class="fa fa-spinner fa-spin"></i> Processing...');
        
                hedgeBuyingMessage();
                // Submit Transaction to Vault
                await buyHedge(optionId, pairedAddress, costBN);
            }
        }  else {
            // User clicked the cancel button
            swal("Cancelled", "Your money is safe :)", "error");
            $('#transactSubmit').html('Deposit');
        }       
    });
}

async function buyHedge(optionId, pairAddress, costBN) {
    try {
        // Retrieve wallet connected
        const accounts = await getAccounts();
        if (accounts.length === 0) {
            console.log('No wallet connected. Please connect a wallet.');
            return;
        }
        // Prepare Tx
        const transaction = await hedgingInstance.connect(signer).buyHedge(optionId);

        // Wait for the transaction to be mined
        const receipt = await transaction.wait();

        if (receipt.status === 1) {
            // Call functions on success
            hedgePurchasedMessage(receipt.transactionHash);
            console.log('Deposit successful...');
            console.log('Transaction Hash: '+ receipt.transactionHash);
        } else {
            // Transaction failed
            console.log('Purchase failed. Receipt status: ' + receipt.status);
            swal({ title: "Failed.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Transaction failed. Receipt status: " + receipt.status });
        }
    } catch (error) {
        console.error('Purchase error:', error);
        swal({ title: "Failed.", type: "error", allowOutsideClick: true, confirmButtonColor: "#F27474", text: "Transaction error: " + error.message });
    }
}

// Delete process handler
// Receives decimals 
async function deleteInterface(optionId) {
    
    const accounts = await getAccounts();
    const walletAddress = accounts[0];

    // Fetch the hedge owner by ID
    let result = await hedgingInstance.getHedgeDetails(optionId);
    let owner = result.owner;

    // Fetch symbol
    let symbol;
    fetchNameSymbol(result.token).then(t=>{name=t.name,symbol=t.symbol}).catch(e=>console.error(e));
    // Fetch token & pair address
    let tokenAddress = result.token;
    let truncatedTokenAdd = tokenAddress.substring(0, 6) + '...' + tokenAddress.slice(-3);
    let tokenPairAddress = result.paired;
    let truncatedPairAdd = tokenPairAddress.substring(0, 6) + '...' + tokenPairAddress.slice(-3);
    // Prepare owner
    let truncatedOwner = owner.substring(0, 6) + '...' + owner.slice(-3);
    // Fetch taker
    let taker = result.taker;
    let truncatedTaker = taker.substring(0, 6) + '...' + taker.slice(-3);
    // Fetch deal status
    let status = parseFloat(result.status);        
    // Format token amounts
    let amountFormated = cardCommaFormat(tokenAmount);		

    // Fetch hedge type
    let hedgeType;
    if (result.hedgeType === 0) {
        hedgeType = 'CALL';
    } else if (result.hedgeType === 1) {
        hedgeType = 'PUT';
    } else if (result.hedgeType === 2) {
        hedgeType = 'SWAP';
    } else {
        console.log('Hedge type is unknown');
    }
    // Format manually the paired symbol
    let pairSymbol;
    if (tokenPairAddress === CONSTANTS.usdtAddress) {
        pairSymbol = 'USDT';
    } else if (tokenPairAddress === CONSTANTS.usdcAddress) {
        pairSymbol = 'USDC';
    } else if (tokenPairAddress === CONSTANTS.wethAddress) {
        pairSymbol = 'WETH';
    }
    
    // Fetch underlying tokens market value
    const [marketvalueCurrent, pairedAddress] = await hedgingInstance.getUnderlyingValue(tokenAddress, result.amount);
    const pairedAddressDecimal = await getTokenDecimals(tokenPairAddress);
    const marketvalue = fromBigIntNumberToDecimal(marketvalueCurrent, pairedAddressDecimal);

    // Format outputs
    let marketvalueFormatted = cardCommaFormat(marketvalue);
    let costFormatted = cardCommaFormat(cost);
    let strikeFormatted = cardCommaFormat(strikePrice);
    
    // Token logourl
    let logourl = result.logourl;

    //strategy description for the option
    let hedgeTypeFull;
    if(hedgeType == 'CALL') {
        hedgeTypeFull = 'Call Option';
    }
    if(hedgeType == 'PUT') {
        hedgeTypeFull = 'Put Option';
    }
    if(hedgeType == 'SWAP') {
        hedgeTypeFull = 'Equity Swap';
    }

    if (accounts.length === 0) {
        console.log('No wallet connected. Please connect a wallet.');
        swal({
            title: "Connect Wallet",
            text: "Please connect your wallet to proceed..",
            html: true,
            showCancelButton: false,
            confirmButtonColor: "#04C86C",
            confirmButtonText: "Ooops",
            closeOnConfirm: true
        }, async function(isConfirm) {
            $("#transactSubmit").html('Withdraw');
        }); // close swal
        return;
    }
    // Check ownership
    if (walletAddress != owner) {
        console.log('Connected wallet is not owner');
        swal({
            title: "Connect Owner Wallet",
            text: "Only the owner address can delete the hedge. \n Connect before it's bought..",
            html: true,
            showCancelButton: false,
            confirmButtonColor: "#04C86C",
            confirmButtonText: "Ooops",
            closeOnConfirm: true
        }, async function(isConfirm) {
            
        }); // close swal
        return;
    }

    // Check hedge status
    if (status == 0) {
        console.log('Hedge already purchased');
        const purchaseSummary = `Bought by ${truncatedTaker}  <a href="https://etherscan.io/address/${taker}" target="_blank"><i class="fa fa-external-link"></i></a>\n For ${costFormatted} ${pairSymbol}.`
        swal({
            title: "Hedge has already been purchased",
            text: purchaseSummary,
            html: true,
            showCancelButton: false,
            confirmButtonColor: "#04C86C",
            confirmButtonText: "Ooops",
            closeOnConfirm: true
        }, async function(isConfirm) {
            
        }); // close swal
    }
        
    // Format output
    const formatStringDecimal = (number) => {
        const options = {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 5,
        };
        return number.toLocaleString('en-US', options);
    };
    
    try {
        // classes on left are for size, on right are for coloring & font
        // interfaceWindow is displayed once in a swal popup, then changes messages on transaction status
        let transactionMessage = '';
        let proceedButtonText = 'checking ...';
        transactionMessage = `
                <div id="withdrawConfirm" class="interfaceWindow">
                    <span class="txStatus">You are about to Delete</span>
                    <span class="walletbalanceSpan">${hedgeTypeFull} for ${amountFormated} ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank">${truncatedTokenAdd} <i class="fa fa-external-link"></i></a></span>
                    <div class="approvalInfo">
                        <p>Proceed and confirm the transaction in your wallet.</p>
                    </div>
                </div>
                <div id="withdrawInProgress" class="interfaceWindow">
                    <span class="txStatus">Deleting in progress...</span>
                    <div class="approvalInfo">
                        <p>Please confirm the transaction in your wallet.</p>
                    </div>
                    <span class="walletbalanceSpan">${hedgeTypeFull} for ${amountFormated} ${symbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank">${truncatedTokenAdd} <i class="fa fa-external-link"></i></a></span>
                </div>
                <div id="withdrawSuccess" class="interfaceWindow">
                    <span class="txStatus">Hedge Deleted!</span>
                    <div class="approvalInfo">
                        <p>
                            <span class="txInfoHead txInfoAmount">${amountFormated} ${symbol}  <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> released from deal collateral back to balances.</span>
                        </p>
                    </div>
                    <div class="explainer">
                        <span> 
                            <i class="fa fa-info-circle"></i>
                            Tokens restored from lockedInUse to withdrawable.
                        </span>
                    </div>
                </div>
            `;

        swal({
            type: swalType,
            title: "Hedge Deletion",
            text: transactionMessage,
            html: true,
            showCancelButton: showCancelButton,
            confirmButtonColor: "#04C86C",
            confirmButtonText: proceedButtonText,
            cancelButtonText: "Cancel",
            closeOnConfirm: closeOnConfirm,
            closeOnCancel: true
        }, async function (isConfirm) {
            if (isConfirm) {
                    $('.confirm').prop("disabled", false);
                    $('.confirm').html('<i class="fa fa-spinner fa-spin"></i> Processing...');
                    // Progress notification
                    hedgeDeletingMessage();
                    // Call proceed function
                    await deleteHedge();
            } else {
                // User clicked the cancel button
                swal("Cancelled", "Your money is safe :)", "error");
                $("#transactSubmit").html('Withdraw');
            }
        });

        // Run display scrips on swal load
        console.log("request: " + tokenAmount + ", walletBalance: " + walletBalance);
        if (walletBalance < tokenAmount) {
            $(".interfaceWindow").hide();
            $("#insufficientBalance").fadeIn("slow");
            $('.confirm').html('Oops!');
        } else {
            $(".interfaceWindow").hide();
            $("#withdrawConfirm").fadeIn("slow");
            $('.confirm').html('Withdraw...');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function deleteHedge(optionId) {
    try {
        // Submit Tx
        const transaction = await hedgingInstance.connect(signer).deleteHedge(optionId);
        // Wait for the transaction to be mined
        const receipt = await transaction.wait();

        if (receipt.status === 1) {
            console.log('Deleted successfully. Transaction hash:', receipt.transactionHash);
            // Progress notification
            hedgeDeletedMessage(receipt.transactionHash);
            // Hide hedge card
            
        } else {
            console.log('Deletion failed. Receipt status:', receipt.status);
            swal({
                title: "Failed to Delete.",
                type: "error",
                allowOutsideClick: true,
                confirmButtonColor: "#F27474",
                text: "Transaction Failed. Receipt status: " + receipt.status
            });
        }
    } catch (error) {
        console.error('Deletion error:', error.message);
        swal({
            title: "Failed.",
            type: "error",
            allowOutsideClick: true,
            confirmButtonColor: "#F27474",
            text: "Transaction error: " + error.message
        });
    }
}

async function hedgeBuyingMessage() {
    // Slide out the existing content
    $(".interfaceWindow").hide();
    // Slide in the new content
    $("#depositInProgress").fadeIn(2);

    // Disable confirm button
    $('.confirm').prop("disabled", true);
}

function hedgePurchasedMessage(transactionHash) {
    // Slide out approval in progress
    $(".interfaceWindow").hide();
    // Slide in approval success
    $("#depositSuccess").fadeIn("slow");
    // Disable all buttons
    $('.cancel').prop("disabled", true);

    // Wait for 3 seconds
    setTimeout(function() {
        // Disable confirm button again
        $('.confirm').prop("disabled", true);

        const transactionMessage = `
        <div class="interfaceWindow">  
            <div class="approvalInfo">
                <p>
                    <span class="txInfoHead txInfoSymbol">Hedge is active, view transaction... <a href="https://sepolia.etherscan.io/tx/${transactionHash}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
            </div>
        </div>`;

        swal({
            title: "Purchase Successful",
            type: "success",
            text: transactionMessage,
            html: true,
            showCancelButton: false,
            confirmButtonColor: "#04C86C",
            confirmButtonText: "Wow!",
            cancelButtonText: "Cancel",
            closeOnConfirm: true
        }, async function(isConfirm) {
            if (isConfirm) {
                await initializeConnection();
            }  else {
                // User clicked the cancel button
                swal("Cancelled", "Your money is safe :)", "error");
            }       
        }); // close swal
    }, 3000); 
}

function hedgeDeletingMessage() {
    // Slide out the existing content
    $(".interfaceWindow").hide();
    // Slide in the new content
    $("#withdrawInProgress").fadeIn("slow");
    // Disable confirm button
    $('.confirm').prop("disabled", true);
}

function hedgeDeletedMessage(transactionHash) {

    // Slide out approval in progress
    $(".interfaceWindow").hide();
    // Slide in approval success
    $("#withdrawSuccess").fadeIn("slow");
    // Disable all buttons
    $('.cancel').prop("disabled", true);
    $('.confirm').prop("disabled", true);

    // Wait for 3 seconds
    setTimeout(function() {
        const transactionMessage = `
        <div class="interfaceWindow">  
            <div class="approvalInfo">
                <p>
                    <span class="txInfoHead txInfoSymbol"> view transaction... <a href="https://sepolia.etherscan.io/tx/${transactionHash}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
                </p>
            </div>
        </div>`;

        swal({
            title: "Hedge Deleted Successfully..",
            type: "success",
            text: transactionMessage,
            html: true,
            showCancelButton: false,
            confirmButtonColor: "#04C86C",
            confirmButtonText: "Wow!",
            cancelButtonText: "Cancel",
            closeOnConfirm: true
        }, async function(isConfirm) {
            if (isConfirm) {
                await initializeConnection();
            }  else {
                // User clicked the cancel button
                swal("Cancelled", "Your money is safe :)", "error");
                $('#transactSubmit').html('Deposit Again..');
            }       
        }); // close swal
    }, 3000); 
}


// Dummy refresh balances on networth card & append <li> to token list
function refreshBalances() {
    console.log('Refreshing balances...');
}

export { purchaseInterface, deleteInterface };
  