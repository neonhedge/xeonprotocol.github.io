/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, getUserBalancesForToken, getTokenETHValue, truncateAddress, isValidEthereumAddress, cardCommaFormat, fromBigIntNumberToDecimal, fromDecimalToBigInt, getAccounts, getTokenDecimalSymbolName, getSymbol, getTokenDecimals } from './constants.js';
import { loadOptions } from './module-market-card-fetchers.js';
import { initializeConnection } from './web3-walletstatus-module.js';

//==============================================================
// Validity Checkers
//==============================================================
function isValidInput(hedgeType, tokenAddress, tokenAmount, premium, strikePrice) {
    if (isNaN(tokenAmount) || parseFloat(tokenAmount) <= 0) {
        showInvalidInputMessage('Invalid token amount. Please enter an amount greater than 0.');
        return false;
    }

    if (!tokenAddress || !isValidEthereumAddress(tokenAddress)) {
        showInvalidInputMessage('Invalid ERC20 token address. Please enter a valid address.');
        return false;
    }

    if (isNaN(premium) || parseFloat(premium) <= 0) {
        showInvalidInputMessage('Invalid premium. Please enter a premium greater than 0.');
        return false;
    }

    if (isNaN(strikePrice) || parseFloat(strikePrice) <= 0) {
        showInvalidInputMessage('Invalid strike price. Please enter a strike price greater than 0.');
        return false;
    }

    return true;
}

function showInvalidInputMessage(message) {
    swal({
        title: 'Invalid Tx Inputs...',
        text: message,
        type: 'info',
        html: false,
        dangerMode: false,
        confirmButtonText: 'Okay',
        showConfirmButton: true,
        showCancelButton: false,
        animation: 'Pop',
    }, function () {
        console.log('Invalid input...');
    });
}

/*======================================================
    WRITE FUNCTION CALLS for the silkraod module
======================================================*/
async function setupWritingModule(formValues) {
    // Get form inputs
    const hedgeType = formValues['hedgeType'];
    const tokenAddress = formValues['tokenAddress'];
    const tokenAmount = formValues['tokenAmount'];
    const premium = formValues['premium'];
    const strikePrice = formValues['strikePrice'];

	//console.log("hedgeType: " + hedgeType + "\ntokenAddress: " + tokenAddress + "\ntokenAmount: " + tokenAmount + "\npremium: " + premium + "\nstrikePrice: " + strikePrice);
    
	try {
        // Validate form inputs
        if (!isValidInput(hedgeType, tokenAddress, tokenAmount, premium, strikePrice)) {
            return;
        }

        // Pass form values to write function
        await submitWriting(hedgeType, tokenAddress, tokenAmount, premium, strikePrice);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function createForm() {
	const trader = await getAccounts();
	let truncatedUser = '';
	let depositedBalance = 0, withdrawnBalance = 0, lockedInUseBalance = 0, withdrawableBalance = 0;

  	const isValid = isValidEthereumAddress(trader[0]);
	if (isValid) {
	  truncatedUser = truncateAddress(trader[0]);
	} else {
	  truncatedUser = 'Connect Wallet';
	}
  
	const privatize = `
	<form id="writeForm">
	  <div class="shl_inputshold delegate_inputshold setBeneField">
		<label id="typeLabel" class="labels"><img src="imgs/info.png" title="Options or Equity Swaps (read docs)">hedge type:</label>
		<select id="hedgeType" name="hedgeType">
		  <option value="0">Call Option</option>
		  <option value="1">Put Option</option>
		  <option value="2">Equity Swap</option>
		  <option value="3">Loan Request (coming)</option>
		</select>
		<label id="tokenLabel" class="labels"><img src="imgs/info.png" title="token address of the underlying assets or tokens">token address:</label>
		<input id="tokenAddy" class="sweetInput shldi benown" type="text" aria-invalid="false" autocomplete="ERC20 token to hedge">
		<label id="amountLabel" class="labels"><img src="imgs/info.png" title="amount of the tokens you want to hedge. \nNote: Tokens should be deposited to Vault first, visit wallet page">token amount:</label>
		<input id="tokenAmount" class="sweetInput shldi benown" type="number"  aria-invalid="false" autocomplete="amount of tokens in trade">
		<label id="premiumLabel" class="labels"><img src="imgs/info.png" title="in paired currency, the cost the buyer has to pay to take the OTC trade">premium:</label>
		<input id="premium" class="sweetInput shldi benown" type="number" step="any" aria-invalid="false" autocomplete="cost of buying trade">
		<label id="strikeLabel" class="labels"><img src="imgs/info.png" title="strike price of the underlying tokens in paired currency">strike price:</label>
		<input id="strikePrice" class="sweetInput shldi benown" type="number" step="any" aria-invalid="false" autocomplete="break even value for the trade">
		<br>
        <div id="tokenAmountValueDiv" class="swal-button-container" style="display:none;">
            <span class="tokenAmountValue">Token Value: </span><span id="tokenAmountValue" title="value of tokens in deal. your premium or cost should be a fraction of this value. eg 10% of value"></span>
        </div>
		<div class="walletBalancesTL">
		  <p>paste token address above & view your balances: </p>
		  <span class="walletbalanceSpan">${truncatedUser} <img src="imgs/info.png" title="protocol balances on connected wallet"></span></br>
		  <div><span class="walBalTitle">deposited:</span><span id="depositedBalance">${depositedBalance}</span></div>
		  <div><span class="walBalTitle">locked:</span><span id="lockedInUseBalance">${lockedInUseBalance}</span></div>
		  <div><span class="walBalTitle">withdrawn:</span><span id="withdrawnBalance">${withdrawnBalance}</span></div>
		  <div><span class="walBalTitle">available:</span><span id="withdrawableBalance">${withdrawableBalance}</span></div>
		</div>
	  </div>
	</form>`;
  
	swal({
		title: "Create OTC Trade",
		text: privatize,
		type: "prompt",
		html: true,
		dangerMode: true,
		confirmButtonText: "Write",
		confirmButtonColor: "#171716",
		cancelButtonText: "Cancel",
		closeOnConfirm: false,
		showLoaderOnConfirm: true,
		showConfirmButton: true,
		showCancelButton: true
	},async function(value){
		if (value) {
			// Manually select input elements
			const hedgeType = document.getElementById('hedgeType').value;
			const tokenAddress = document.getElementById('tokenAddy').value;
			const tokenAmount = document.getElementById('tokenAmount').value;
			const premium = document.getElementById('premium').value;
			const strikePrice = document.getElementById('strikePrice').value;

			// Prepare the form values if needed
			const values = {
				hedgeType,
				tokenAddress,
				tokenAmount,
				premium,
				strikePrice,
			};

            // You can use 'values' as needed
            console.log(values);

            // Continue with your logic here
            await setupWritingModule(values);

        } else {
            // Handle cancel or empty input
            swal.close();
        }
	});

    // Listen to form fields
    // Token amount valuator listener
    document.getElementById('tokenAmount').addEventListener('input', async (event) => {

        const tokenAddress = document.getElementById('tokenAddy').value.trim();
        const tokenAmount = event.target.value.trim();

        if (isNaN(tokenAmount) || parseFloat(tokenAmount) < 0) {
            alert('Please enter a valid amount.');
            return;
        }
        
        if (!isValidEthereumAddress(tokenAddress)) {
            alert('Please enter a valid ERC20 token address.');
            return;
        }
        // prep
        const tokenDecimals = await getTokenDecimals(tokenAddress);
        const tokenAmountBN = fromDecimalToBigInt(tokenAmount, tokenDecimals);
        try {
            const [tokensPairedValue, pairedSymbol] = await getTokenETHValue(tokenAddress, tokenAmountBN); //input in wei, output already formated

            // Display value in the HTML form
            const displayBalance = cardCommaFormat(tokensPairedValue);
            const tokenAmountValueDiv = document.getElementById("tokenAmountValueDiv");
            const tokenAmountValue = document.getElementById("tokenAmountValue");

            // show div and display value 
            tokenAmountValueDiv.style.display = "block";
            tokenAmountValue.innerHTML = displayBalance + " " + pairedSymbol;

        } catch (error) {
            console.error("Error processing wallet address:", error);
        }
    });
}

async function submitWriting(hedgeType, tokenAddress, tokenAmount, premium, strikePrice) {
    const accounts = await getAccounts();
    if (accounts.length === 0) {
        alert('Please connect your wallet');
        return;
    }
    
    // get token info and pair infor, price and cost are in pair currency
    const tokenDecimals = await getTokenDecimals(tokenAddress);
    const tokenAmountWei = fromDecimalToBigInt(tokenAmount, tokenDecimals);
    // get dependency variables
    const pairAddress = await hedgingInstance.getPairAddressZK(tokenAddress);
	let pairDecimals;
	if (pairAddress == CONSTANTS.wethAddress) {
		pairDecimals = 18;
	} else if (pairAddress == CONSTANTS.usdtAddress) {
		pairDecimals = 6;
	} else if (pairAddress == CONSTANTS.usdcAddress) {
		pairDecimals = 6;
	} else { // remove above hack when on mainnet with actual 18 decimal WETH not 6 on Sepolia
		pairDecimals = await getTokenDecimals(pairAddress.pairedCurrency);
	}

    // prepare other inputs
    const premiumWei = fromDecimalToBigInt(premium, pairDecimals);
    const strikePriceWei = fromDecimalToBigInt(strikePrice, pairDecimals);

    // Add deadline value
	hedgeType = parseInt(hedgeType);
	
	// *** TESTING ONLY ***
    // Get the current timestamp in seconds & add 6 months for testing
	const currentTimestamp = Math.floor(Date.now() / 1000);
	const sixMonthsInSeconds = 6 * 30 * 24 * 60 * 60;
	const deadline = currentTimestamp + sixMonthsInSeconds;

	console.log('hedgeType: ' + hedgeType + '\ntokenAddress: ' + tokenAddress + '\ntokenAmountWei: ' + tokenAmountWei + '\npremiumWei: ' + premiumWei + '\nstrikePriceWei: ' + strikePriceWei + '\ndeadline: ' + deadline);

    try {
        // Prepare Tx
        const transaction = await hedgingInstance.connect(signer).createHedge(
            hedgeType, //pass as integer, uint in solidity
            tokenAddress, 
            tokenAmountWei, 
            premiumWei,
			strikePriceWei,
            deadline  //pass as integer, uint in solidity
        );

        // Wait for the transaction to be mined
        const receipt = await transaction.wait();

        if (receipt.status === 1) {
            console.log('Transaction hash:', receipt.transactionHash);
            handleTransactionSuccess(receipt.transactionHash); 
            loadOptions(MyGlobals.startIndex, window.readLimit);
        } else {
            console.log('Transaction failed. Receipt status:', receipt.status);
            handleTransactionFailure(receipt.status); 
        }
    } catch (error) {
        console.error('Transaction error:', error);
        const text = error.message;
        swal({
            title: 'Transaction error.',
            type: 'error',
            confirmButtonColor: '#F27474',
            text: text,
        });
    }
}

function handleTransactionSuccess(transactionHash) {
	// Display a success message based on the status
	var message = "Trade has been created..\nIt will now appear on the OTC timeline to buyers.";
	swal({
	  title: "Transaction Submitted Successfully",
	  type: "success",
	  confirmButtonText: "Yay!",
	  confirmButtonColor: "#F27474",
	  allowOutsideClick: true,
	  text: message,
	});
}
  
function handleTransactionFailure(status) {
	// Display a user-friendly message based on the status
	var message = status ? "Transaction Failed" : "Transaction Reverted";
	swal({
	  title: "Writing Failed.",
	  type: "error",
	  confirmButtonColor: "#F27474",
	  text: message,
	});
}

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

    // Token balance check
    let userwithdrawable, withdrawableTokens, tokenAmount;
    try { 
        const mybalances = await getUserBalancesForToken(result.token, userAddress);
        userwithdrawable = mybalances.withdrawableBalance;
        withdrawableTokens = fromBigIntNumberToDecimal(userwithdrawable);
        tokenAmount = fromBigIntNumberToDecimal(result.amount);
    } catch (error){
        console.log(error);
    }

    // Check hedge availability
    let status = parseFloat(result.status);     
    if (status > 1) {
        console.log('Hedge Already Taken.');
        swal({
            title: "Hedge Already Taken",
            type: "warning",
            text: "You were late to this one..",
            html: true,
            showCancelButton: false,
            confirmButtonColor: "#04C86C",
            confirmButtonText: "Oops..",
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
            confirmButtonText: "Oops..",
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
		// Format token amounts
		let amountFormated = cardCommaFormat(tokenAmount);        
		// Fetch symbol
		//let symbol = await getTokenDecimalAndSymbol(tokenAddress);

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
		let tokenSymbol, pairSymbol;
        tokenSymbol = await getSymbol(tokenAddress);

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
		
		// Fetch startvalue, cost, strikeprice
        let cost, strikevalue;

		// based on token decimals, manual not function call to pair address as WETH on sepolia is 6 decimal
		if (tokenPairAddress === CONSTANTS.usdtAddress || tokenPairAddress === CONSTANTS.usdcAddress) { //USDT or USDC
            cost = fromBigIntNumberToDecimal(result.cost, 6);
            strikevalue = fromBigIntNumberToDecimal(result.strikeValue, 6);
		} else if (tokenPairAddress === CONSTANTS.wethAddress) { //WETH
			cost = fromBigIntNumberToDecimal(result.cost, 18);
            strikevalue = fromBigIntNumberToDecimal(result.strikeValue, 18);
		}
        
        let strikeprice = strikevalue / tokenAmount;

		// Format outputs
		let marketvalueFormatted = cardCommaFormat(marketvalue);
		let costFormatted = cardCommaFormat(cost);
		let strikeFormatted = cardCommaFormat(strikeprice);
		
		// Token logourl
		let logourl = './imgs/tokens/ovela.webp';

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
        let transactionMessage = '';
        let proceedButtonText = 'Buy';
        // prepare approved info panel for swal below
        // classes on left are for size, on right are for coloring & font
        // interfaceWindow is displayed once in a swal popup, then changes messages on transaction status
        transactionMessage = `
                <div id="depositInProgress" class="interfaceWindow">
                    <span class="txStatus">in progress...</span>
                    <div class="approvalInfo">
                        <p>Please confirm the transaction in your wallet.</p>
                    </div>
                    </br>
                    <span class="walletbalanceSpan">Buying a ${hedgeTypeFull} from <a href="https://etherscan.io/address/${owner}" target="_blank">${truncatedOwner} <i class="fa fa-external-link"></i></a></span>
                    </br>
                    <span class="walletbalanceSpan">Underlying Tokens: ${amountFormated} ${tokenSymbol} </span>
                    </br>
                    <span class="walletbalanceSpan">Cost to Buy: ${costFormatted} ${pairSymbol}</span>
                </div>

                <div id="depositRequired" class="interfaceWindow ">
                    <div class="approvalInfo">
                        <p>
                            <span class="projectLogo" style="background-image:url('${logourl}')"></span>
                        </p>
                        <p>
                            <span class="txInfoHead txInfoAmount">${amountFormated} ${tokenSymbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a></span>
                        </p>
                        </br>
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
                        </br>
                    </div>

                    <div class="explainer">
                        <span> 
                            <i class="fa fa-info-circle"></i>
                            Proceed below, you will be prompted to Sign the transaction in your wallet. 
                        </span>
                    </div>
                </div>

                <div id="depositSuccess" class="interfaceWindow">
                    <span class="txStatus">Purchase Successful</span>
                    <div class="approvalInfo">
                        <p>
                            <span class="txInfoHead txInfoAmount">You have purchased the ${hedgeTypeFull} for ${amountFormated} ${pairSymbol} <a href="https://etherscan.io/token/${tokenAddress}" target="_blank"><i class="fa fa-external-link"></i></a> </span>
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
                if (tokenAmount < withdrawableTokens) {
                    $('.confirm').prop("disabled", true);
                } else {
                    $('.confirm').prop("disabled", false);
                    $('.confirm').html('<i class="fa fa-spinner fa-spin"></i> buying...');
            
                    hedgeBuyingMessage();
                    // Submit Transaction to Vault
                    await buyHedge(optionId);
                }
            }  else {
                // User clicked the cancel button
                swal("Cancelled", "Your money is safe :)", "error");
                $('#transactSubmit').html('Deposit');
            }       
        });

        // Run display scrips on swal load
        $(".interfaceWindow").hide();
        $("#depositRequired").fadeIn("slow");

    } catch (error){
        console.log(error.message);
    }
}

async function buyHedge(optionId) {
    // Run display scrips on swal load
    $(".interfaceWindow").hide();
    $("#depositInProgress").fadeIn("slow");

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
        //Purchase error: Error: cannot estimate gas; transaction may fail or may require manual gas limit (error={"code":-32603,"message":"execution reverted: Invalid option ID | Owner can't buy","data":{"originalError":{"code":3,"data":"0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000023496e76616c6964206f7074696f6e204944207c204f776e65722063616e2774206275790000000000000000000000000000000000000000000000000000000000","message":"execution reverted: Invalid option ID | Owner can't buy"}}}, method="estimateGas", transaction={"from":"0xFe395BDfBc00484658b83088Edf7E0E19cD7A6cd","to":"0xa50E605f76661d4C0e36a78C588E084D779B05fE","data":"0x5000d7480000000000000000000000000000000000000000000000000000000000000000"}, code=UNPREDICTABLE_GAS_LIMIT, 
        console.error('Purchase error:', error.messages);
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

    // Fetch symbol//name and symbol
    let name, decimals, symbol;
    [name, decimals, symbol] = await getTokenDecimalSymbolName(result.token);
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
    
    // Fetch underlying tokens market value. then others
    const [marketvalueCurrent, pairedAddress] = await hedgingInstance.getUnderlyingValue(tokenAddress, result.amount);
    const pairedAddressDecimal = await getTokenDecimals(tokenPairAddress);
    const marketvalue = fromBigIntNumberToDecimal(marketvalueCurrent, pairedAddressDecimal);

    //start value in BN - before fromBigIntNumberToDecimal conversion
    let costBN = ethers.BigNumber.from(result.cost);

    // Format outputs
    let marketvalueFormatted = cardCommaFormat(marketvalue);
    let costFormatted = cardCommaFormat(costBN);
    
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
            confirmButtonText: "Oops..",
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
            confirmButtonText: "Oops..",
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
            confirmButtonText: "Oops..",
            closeOnConfirm: true
        }, async function(isConfirm) {
            
        }); // close swal
    }
    
    try {
        // classes on left are for size, on right are for coloring & font
        // interfaceWindow is displayed once in a swal popup, then changes messages on transaction status
        let proceedButtonText = 'checking ...';
        let transactionMessage = `
            <div>
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
            </div>
            `;

        swal({
            title: "",
            text: transactionMessage,
            type: "warning",
            html: true,
            dangerMode: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#171716",
            cancelButtonText: "Cancel",
            closeOnConfirm: false,
            showCancelButton: true
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
        $(".interfaceWindow").hide();
        $("#withdrawConfirm").fadeIn("slow");
        $('.confirm').html('Delete');
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

// Bookmark Toggle
async function toggleBookmark(optionID) {
    let optionId = ethers.BigNumber.from(parseInt(optionID));
	try {
		
		// Submit Tx, accepts uint256 or BN
        const transaction = await hedgingInstance.connect(signer).bookmarkHedge(optionId);

        // Wait for the transaction to be mined
        const receipt = await transaction.wait();

        if (receipt.status === 1) {
	
			// Bookmark state updated successfully
			console.log('Bookmark State Updated:', receipt.events.BookmarkToggle.returnValues.bookmarked);
		
			// Display bookmark state in a browser alert
			alert('Bookmark State Updated: ' + receipt.events.BookmarkToggle.returnValues.bookmarked);
		
			const state = receipt.events.bookmarked.returnValues[2];
			const hedge = receipt.events.bookmarked.returnValues[1];
		
			const tx_hash = receipt.transactionHash;
			const outputCurrency = ''; // or GUN - currency focus is outcome of Tx
			const type = 'success'; // or error
			const wallet = '';
			const receivedTokens = 0;
		
			let message = '', title = '', nonTxAction = '';
			if (state) {
				message = 'Bookmark saved..';
				title = 'Bookmarked!';
				nonTxAction = 'hedge: ' + hedge + ' bookmarked: ';
			} else {
				title = 'Removed!';
				message = 'Bookmark removed..';
				nonTxAction = 'hedge: ' + hedge + ' unmarked: ';
			}
		
			// Call popupSuccess function without waiting for it to complete (async)
			popupSuccess(type, outputCurrency, tx_hash, message, 0, receivedTokens, wallet, nonTxAction);

			swal ({
				title: title,
				text: message,
				type: 'success',
				html: false,
				dangerMode: false,
				showConfirmButton: false,
				showCancelButton: false,
				animation: "Pop",
				allowOutsideClick: true,
				timer: 1800,
			})
		} else {
            console.log('Bookmarking failed. Receipt status:', receipt.status);
            swal({
                title: "Bookmarking Failed.",
                type: "error",
                allowOutsideClick: true,
                confirmButtonColor: "#F27474",
                text: "Transaction Failed. Receipt status: " + receipt.status
            });
        }

	} catch (error) {
		// Handle error
		const text = error.message;
		swal({
			title: "Cancelled.",
			type: "error",
			allowOutsideClick: true,
			text: text,
			html: false,
			confirmButtonColor: "#F27474"
		});
	}
}  

// Dummy refresh balances on networth card & append <li> to token list
function refreshBalances() {
    console.log('Refreshing balances...');
}

export { setupWritingModule, createForm, submitWriting, purchaseInterface, deleteInterface, toggleBookmark};
  