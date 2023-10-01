/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, getUserBalancesForToken } from './constants.js';
import { initWeb3 } from './dapp-web3-utils.js';
import { unlockedWallet, reqConnect} from './web3-walletstatus-module.js';
import { refreshDataOnElements, loadOptions, fetchOptionCard, fetchNameSymbol, prepareTimestamp, noOptionsSwal } from './module-market-card-fetchers.js';

/*=========================================================================
    INITIALIZE WEB3 & LOCAL CONSTANTS
==========================================================================*/

initWeb3();

/*========================================================================
    ON PAGE LOAD  
==========================================================================*/
//define globals
export const MyGlobals = {
	wallet	: '',
	Mode : 0,
	outputArray : [],
	startIndex : 0,
	lastItemIndex : 0,
	profitBg : 'imgs/repayment2.webp',
	lossBg : 'imgs/repayment2.webp'
};

//which tab is highlighted
$(document).ready(function(){
	$('#erc20Options').css({'background' : 'rgba(214, 24, 138,0.2)','border' : '1px solid rgb(214, 24, 138)'});//left panel
	$('#discoverTab').css({'border' : '1px solid #d6188a'});//try #87CEFA
	//set global
	window.nav = 1;
	window.filters = 1;
	window.readLimit = 30;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;
	loadOptions(MyGlobals.startIndex, window.readLimit);
});
$(document).on('click', '#erc20Options', function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid rgb(214, 24, 138)', 'background' : 'rgba(214, 24, 138,0.2)'});//set style
	//set global
	window.nav = 1;
	window.filters = 1;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;
	loadOptions(MyGlobals.startIndex, window.readLimit);
});
$(document).on('click', '#equitySwaps', function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid rgb(214, 24, 138)', 'background' : 'rgba(214, 24, 138,0.2)'});//set style
	//set global
	window.nav = 2;
	window.filters = 1;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;
	loadOptions(MyGlobals.startIndex, window.readLimit);
});
$(document).on('click', '#erc20Loans', function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid rgb(214, 24, 138)', 'background' : 'rgba(214, 24, 138,0.2)'});//set style
	//set global
	window.nav = 3;
	window.filters = 1;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;
	loadOptions(MyGlobals.startIndex, window.readLimit);
});
$(document).on('click', '#socialstream', function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #d6188a', 'background' : '#d6188a'});//set style
	//set global
		
});
//filters
$(document).on('click', '#discoverTab', function(e){
	$('.streamtype').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #d6188a'});//set style
	//set global
	window.filters = 1;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;
	loadOptions(MyGlobals.startIndex, window.readLimit);
});
$(document).on('click', '#mypositionsTabs', function(e){
	$('.streamtype').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #d6188a'});//set style
	//set global
	window.filters = 2;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;
	loadOptions(MyGlobals.startIndex, window.readLimit);
});
$(document).on('click', '#bookmarksTab', function(e){
	$('.streamtype').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #d6188a'});//set style
	//set global
	window.filters = 3;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;
	loadOptions(MyGlobals.startIndex, window.readLimit);
});

//notes:
//looping script to update options card
//script takes a global new array of optionIDs at any time then uses those IDs to update value, settlement state
//option cards are fetched on nav or tab click or results subset tabs in sets of 30
//each subset fetch stores the last array index to know where it left when fetching more results


$(document).ready(async function () {

    const unlockState = await unlockedWallet();
    if (unlockState === true) {

		const accounts = await web3.eth.requestAccounts();
		MyGlobals.wallet = accounts[0];

        const setAsyncInterval = (fn, ms) => {
            fn().then(() => {
                setTimeout(() => setAsyncInterval(fn, ms), ms);
            });
        };
        // Load sections automatically & periodically
        const refreshDealCards = async () => {
            const asyncFunctions = [ await refreshDataOnElements];
            for (const func of asyncFunctions) {
                await func();
            }
        };
        setAsyncInterval(async () => {
            await refreshDealCards();
        }, 30000);

        // Load more sections manually not automatically & periodically
        // Create an IntersectionObserver to load sections when in view
    } else {
        reqConnect();
    }
});


/*=========================================================================
    HELPER FUNCTIONS
==========================================================================*/

async function addBookmark(optionId) {
	try {
	  // Estimate gasLimit
	  const encodedData = hedgingInstance.methods.bookmarkHedge(optionId).encodeABI();
	  const estimateGas = await web3.eth.estimateGas({
		data: encodedData,
		from: MyGlobals.wallet,
		to: CONSTANTS.hedgingAddress
	  });
  
	  // Estimate gasPrice
	  const gasPrice = await web3.eth.getGasPrice();
  
	  // Send transaction
	  const receipt = await hedgingInstance.methods.bookmarkHedge(optionId).send({
		from: MyGlobals.wallet,
		gasPrice: gasPrice,
		gasLimit: estimateGas,
	  });
  
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
  
	  let message, nonTxAction;
	  if (state) {
		message = 'Bookmark saved!';
		nonTxAction = 'hedge: ' + hedge + ' bookmarked: ';
	  } else {
		message = 'Bookmark removed!';
		nonTxAction = 'hedge: ' + hedge + ' unmarked: ';
	  }
  
	  // Call popupSuccess function without waiting for it to complete (async)
	  popupSuccess(type, outputCurrency, tx_hash, message, 0, receivedTokens, wallet, nonTxAction);
	} catch (error) {
	  // Handle error
	  const text = error.message;
	  swal({
		title: "Cancelled.",
		type: "error",
		allowOutsideClick: true,
		text: text,
		html: false,
		confirmButtonColor: "#8e523c"
	  });
	}
}  

//search for a project
async function onSearchSubmit(event) {
	event.preventDefault();
	var inputText = $('#swapsearch').val();
	if( address > 0){
		console.log('fetching hedge...');	
		searchHedge(inputText);
	}
}

async function searchHedge(inputText){
	if (inputText.length >= 40 && web3.utils.isAddress(inputText) == true) {
		//set global
		window.nav = 1;
		window.filters = 4;
		//check load continuation
		MyGlobals.outputArray = [];
		MyGlobals.startIndex = 0;
		MyGlobals.lastItemIndex = 0;
		loadOptions(MyGlobals.startIndex, readLimit);	
	}
	if(Number.isInteger(inputText)){
		await fetchOptionStrip(inputText);
	}
}

async function fetchOptionStrip(optionId){
    try{
		let result = await hedgingInstance.methods.getHedgeDetails(optionId).call();
		//name and symbol
		let name; let symbol;
		fetchNameSymbol(result.token).then(t=>{name=t.name,symbol=t.symbol}).catch(e=>console.error(e));
		//token & pair address
		let tokenAddress = result.token;
		let truncatedTokenAdd = tokenAddress.substring(0, 6) + '...' + tokenAddress.slice(-3);
		let pairAddress = result.paired;
		let truncatedPairAdd = pairAddress.substring(0, 6) + '...' + pairAddress.slice(-3);
		//owner
		let owner = result.owner;
        let truncatedOwner = owner.substring(0, 6) + '...' + owner.slice(-3);
		//taker
		let taker = result.taker;
        let truncatedTaker = taker.substring(0, 6) + '...' + taker.slice(-3);
		//hedge status
		let status = parseFloat(result.status);
		//hedge type
		let hedgeType;
		if (result.hedgeType === 'CALL') {
			hedgeType = 'CALL';
		} else if (result.hedgeType === 'PUT') {
			hedgeType = 'PUT';
		} else if (result.hedgeType === 'SWAP') {
			hedgeType = 'SWAP';
		} else {
			console.log('Hedge type is unknown');
		}
		//amount
		let amount = parseFloat((result.amount / Math.pow(10, MyGlobals.decimals)).toFixed(2));
		//market value
		const [marketvalue, pairedAddress] = await hedgingInstance.methods.getUnderlyingValue(tokenAddress, result.amount).call();
		let pairSymbol;
		if (pairedAddress === '0xdac17f958d2ee523a2206206994597c13d831ec7') {
			pairSymbol = 'USDT';
		} else if (pairedAddress === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
			pairSymbol = 'USDC';
		} else if (pairedAddress === '0x0000000000000000000000000000000000000000') {
			pairSymbol = 'ETH';
		}
		//start value
		let startvalue = parseFloat(fromWeiToFixed5(result.startvalue));
		//end value
		let endvalue = parseFloat(fromWeiToFixed5(result.endvalue));
		//cost value
		let cost = parseFloat(fromWeiToFixed5(result.cost));
		//strike value
		let strikevalue;
		if(startvalue > 0){
			strikevalue = cost + startvalue;
		}else{
			strikevalue = cost + marketvalue;
		}
		//logourl
		let logourl = result.logourl;
		//dates to human-readable dates
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
		let timeToExpiry = days + " D " + hours + " H " + minutes + " M " + seconds + " S";
		//prepare strip
		var resultStrip = '<a href="hedge.html?id='+optionId+'" class="searchresultStrip"><div class="projectLogoLeft" style="background-image:url(' + logourl + ')"></div><div class="projectName">' + symbol + '</div><div class="projectName">' + amount + '</div><div class="projectName"> Value: ' + marketvalue + ' '+ pairSymbol +'</div></a>';
		
		$('#searchresult').empty().append(resultStrip);
		
	}catch(error) {
		console.log(error);
	}
}

async function createForm(){
	let trimUser = MyGlobals.wallet;
	let truncatedUser = '';
		const depositedBalance = 0;
		const withdrawnBalance = 0;
		const lockedInUseBalance = 0;
		const withdrawableBalance = 0;
	//check if address is valid and not empty
	if(trimUser.length == 42){
		truncatedUser = trimUser.substring(0, 6) + '...' + trimUser.slice(-3);
		//fetch balances for user under token address
		const mybalances = await getUserBalancesForToken(pastedAddress, userAddress);
		// Access the balances
		depositedBalance = mybalances.deposited;
		withdrawnBalance = mybalances.withdrawn;
		lockedInUseBalance = mybalances.lockedInUse;
		withdrawableBalance = mybalances.withdrawableBalance;
	}else{
		truncatedUser = 'Connect Wallet';
	}
	
	var privatize = `
	<div class="shl_inputshold delegate_inputshold setBeneField">
		<label id="typeLabel" class="labels"><img src="imgs/info.png" title="Options or Equity Swaps (read docs)">hedge type:</label>
		<select id="hedgeType" name="hedgeType">
			<option value="0">Call Option</option>
			<option value="1">Put Option</option>
			<option value="2">Equity Swap</option>
			<option value="3">Loan Request (coming)</option>
		</select>
		<label id="tokenLabel" class="labels"><img src="imgs/info.png" title="token address of the tokens you want to hedge">token Address:</label>
		<input id="tokenAddy" class="sweetInput shldi benown" aria-invalid="false" autocomplete="ERC20 token to hedge">
		<label id="amountLabel" class="labels"><img src="imgs/info.png" title="amount of the tokens you want to hedge P.S should deposit first, visit wallet page">token amount:</label>
		<input id="tokenAmount" class="sweetInput shldi benown" aria-invalid="false" autocomplete="amount of tokens to hedge">
		<label id="costLabel" class="labels"><img src="imgs/info.png" title="cost in paired currency on dex">premium:</label>
		<input id="" class="sweetInput shldi benown" aria-invalid="false" autocomplete="cost in paired currency to buy hedge">
		<label id="strikeLabel" class="labels"><img src="imgs/info.png" title="strike value in paired currency on dex">strike price:</label>
		<input id="" class="sweetInput shldi benown" aria-invalid="false" autocomplete="strike value in paired currency at which hedge breaks even for the buyer">
		<br>
		<div class="walletBalancesTL">
			<p>paste token address above & view your balances: </p>
			<span class="walletbalanceSpan">`+truncatedUser+` <img src="imgs/info.png" title="protocol balances on connected wallet"></span></br>
			<div><span class="walBalTitle">deposited:</span><span id="depositedBalance">`+depositedBalance+`</span></div>
			<div><span class="walBalTitle">locked:</span><span id="lockedInUseBalance">`+lockedInUseBalance+`</span></div>
			<div><span class="walBalTitle">withdrawn:</span><span id="withdrawnBalance">`+withdrawnBalance+`</span></div>
			<div><span class="walBalTitle">available:</span><span id="withdrawableBalance">`+withdrawableBalance+`</span></div>
		</div>
	</div>`;
	swal({
			title: "Write: Option | Swap | Loan",
			text: privatize,
			type: "prompt",  //var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];
			html: true,
					dangerMode: true,
					confirmButtonText: "Write",
					confirmButtonColor: "#171716", //cowboy brown
					cancelButtonText: "Cancel",
					closeOnConfirm: false,
					showLoaderOnConfirm: true,
			showConfirmButton: true,
			showCancelButton: true,
			timer: 4000,
			animation: "slide-from-top"
	},async function(){//on confirm click
		await createHedgeSubmit();
	});
}

$(document).on('click', '#create_button', function(e){
	createForm();
});

// Attach event handler to document object for event delegation
document.addEventListener('paste', async function(event) {
    if (event.target.id === 'tokenAddy') {
        await handlePaste(event);
    }
});

async function handlePaste(event) {
    event.preventDefault();
    // Get the pasted text from the clipboard
    var clipboardData = event.clipboardData || window.clipboardData;
    var pastedText = clipboardData.getData('text');

    // Check if the pasted text is a valid ERC20 token address
    if (isERC20TokenAddress(pastedText)) {
        // update the input field value with the pasted token address
        event.target.value = pastedText;
		await fetchUserTokenBalance(pastedText);
    } else {
        console.log('Invalid ERC20 token address pasted:', pastedText);
    }
}

function isERC20TokenAddress(address) {
    return web3.utils.isAddress(address);
}

async function fetchUserTokenBalance(tokenAddress){
	const accounts = await web3.eth.requestAccounts();
    const userAddress = accounts[0];
	//fetch balances for user under token address
	const mybalances = await getUserBalancesForToken(tokenAddress, userAddress);
	// format output
	const formatValue = (value) => {
		return `$${value.toFixed(2)}`;
	};    
	const formatString = (number) => {
		return number.toLocaleString();
	};    
	const formatStringDecimal = (number) => {
		const options = {
			style: 'decimal',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		};
		return number.toLocaleString('en-US', options);
	};
	// Display balances in the HTML form
	document.getElementById('depositedBalance').textContent = formatStringDecimal(mybalances.deposited);
	document.getElementById('withdrawnBalance').textContent = formatStringDecimal(mybalances.withdrawn);
	document.getElementById('lockedInUseBalance').textContent = formatStringDecimal(mybalances.lockedInUse);
	document.getElementById('withdrawableBalance').textContent = formatStringDecimal(mybalances.withdrawableBalance);
}

//==============================================================
// Move to writes module
//==============================================================
async function createHedgeSubmit() {
	const accounts = await web3.eth.getAccounts();
	if (accounts.length === 0) {
	  alert('Please connect your wallet');
	  return;
	}
  
	// Get form inputs
	const hedgeType = document.getElementById('hedgeType').value;
	const tokenAddy = document.getElementById('tokenAddy').value;
	const tokenAmount = parseFloat(document.getElementById('tokenAmount').value);
	const cost = parseFloat(document.getElementById('cost').value);
	const strikePrice = parseFloat(document.getElementById('strikePrice').value);
  
	// Validate form inputs
	if (tokenAddy.length < 40 || !web3.utils.isAddress(tokenAddy)) {
		alert('Invalid token address provided');
		return;
	}
	if (!(tokenAmount > 0 && cost > 0 && strikePrice > 0)) {
		alert('Invalid amounts provided');
		return;
	}
	if (!(hedgeType === 'option1' || hedgeType === 'option2' || hedgeType === 'option3')) {
		alert('Invalid hedge type');
		return;
	}
	// Convert ether values to Wei
	const amountWei = web3.utils.toWei(tokenAmount.toString());
	const costWei = web3.utils.toWei(cost.toString());
	const strikePriceWei = web3.utils.toWei(strikePrice.toString());

	//estimate gasLimit
	var encodedData = hedgingInstance.methods.createHedge(
		hedgeType,
		tokenAddy,
		amountWei,
		costWei,
		strikePriceWei,
		deadline
	).encodeABI();
	//gas estimation error can occur on overpricing, even the local network test Txs can fail
	var estimateGas = await web3.eth.estimateGas({
		data: encodedData,
		from: accounts[0],
		to: CONSTANTS.hedgingAddress
	});
	// estimate the gasPrice
	var gasPrice = await web3.eth.getGasPrice(); 

	// Call createHedge function
	try {
	  const deadline = Math.floor(Date.now() / 1000);

	  const tx = hedgingInstance.methods.createHedge(
		hedgeType,
		tokenAddy,
		amountWei,
		costWei,
		strikePriceWei,
		deadline
	  );
  
	  tx.send({ from: accounts[0], gasPrice: gasPrice, gasLimit: estimateGas })
		.on('receipt', function (receipt) { // use .on to avoid blocking behavior - i.e. If Ethereum node experiences delays, our JavaScript code will be blocked while waiting for the transaction receipt 
		  console.log('Transaction hash:', receipt.transactionHash);
  
		  if (receipt.status === true) {
			alert('Transaction submitted successfully');
			handleTransactionSuccess(); // Define this function as needed
		  } else {
			alert('Transaction failed');
			handleTransactionFailure(); // Define this function as needed
		  }
		})
		.on('error', function (error) {
		  console.error('Transaction error:', error);
		  alert('Transaction failed');
		  handleTransactionError(error.message); // Define this function as needed
		});
	} catch (error) {
	  console.error('Transaction error:', error);
	  alert('Transaction failed');
	}
  }

  function handleTransactionSuccess(wallet, txHash) {
	var first = wallet.substring(0, 10); // Get first chars
	var last = wallet.slice(wallet.length - 5); // Get last chars
	var nonTxAction = first + ".." + last;
	var type = "success";
	var outputCurrency = "";
  
	// Show success message and update UI
	popupSuccess(type, outputCurrency, txHash, "Hedge Created", 0, 0, "", nonTxAction);
	swal.close();
  }
  
  function handleTransactionFailure(status) {
	// Display a user-friendly message based on the status
	var message = status ? "Transaction Failed" : "Transaction Reverted";
	swal({
	  title: "Failed.",
	  type: "error",
	  confirmButtonColor: "#F27474",
	  text: message,
	});
  }
  

// END OF JAVASCRIPT