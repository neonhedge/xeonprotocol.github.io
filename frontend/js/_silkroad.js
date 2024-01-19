/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, getUserBalancesForToken, truncateAddress, getPairToken, getSymbol, getAccounts, isValidEthereumAddress, fromBigIntNumberToDecimal, fromDecimalToBigInt, getTokenDecimals, } from './constants.js';
import { initializeConnection, chainCheck, reqConnect, handleAccountChange, handleNetworkChange, popupSuccess} from './web3-walletstatus-module.js';
import { getTokenInfo } from './module-wallet-tokenlist-dependencies.js';
import { refreshDataOnElements, loadOptions, fetchOptionStrip, fetchNameSymbol, prepareTimestamp, noOptionsSwal } from './module-market-card-fetchers.js';
import { loadSidebar, loadSidebarVolume_All, loadSidebarVolume_Token, loadPastEvents } from './module-market-sidebar-fetchers.js';

/*=========================================================================
    Wallet Page Main Functions
==========================================================================*/
// This is the main loading script for the page
// It first checks if a wallet is connected || initialization passes
// Initialization always returns boolean on whether it passes to load page scripts or not
// scouter == wallect readiness check. If wallet check passes & sets all wallet dependencies, then we can load all other scripts below
// if conditions to continueLoading change the script stops at scouter, event listeners at bottom of page to help with alerts & state changes

// Start making calls to Dapp modules
export const checkAndCallPageTries = async () => {
    const scouter = await pageModulesLoadingScript();
    
	console.log('connection Scout: '+ scouter);  
    if (scouter) {
        const asyncFunctions = [refreshDataOnElements, loadSidebar ];
        for (const func of asyncFunctions) {
            func();
        }
    }  
	
};

const setatmIntervalAsync = (fn, ms) => {
    fn().then(() => {
        setTimeout(() => setatmIntervalAsync(fn, ms), ms);
    });
};


// Ready all incl wallet display
$(document).ready(async function () {
    $('.waiting_init').css('display', 'inline-block');

    // load sections periodically
    setatmIntervalAsync(async () => {
        checkAndCallPageTries();
    }, 45000);
});


// Checks if all wallet checks pass before calling page modules
async function pageModulesLoadingScript() {
    let continueLoad = false;
    try {
        continueLoad = initializeConnection();
		if (continueLoad) {
			return true;
		} else {
			return false;
		}
    } catch (error) {
        console.log(error);
		return false;
    }
}

//notes:
//looping script to update options card
//script takes a global new array of optionIDs at any time then uses those IDs to update value, settlement state
//option cards are fetched on nav or tab click or results subset tabs in sets of 30
//each subset fetch stores the last array index to know where it left when fetching more results

/*========================================================================
    On page load
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

//define tab is highlighted
$(document).ready(async function(){
	$('#erc20Options').css({'background' : 'rgba(214, 24, 138,0.1)','border' : '1px solid #62006b'});//left panel
	$('#discoverTab').css({'background' : 'rgba(214, 24, 138, 0.1)','border' : '1px solid #62006b'});//try rgb(8, 231, 254) - bright blue
	//set global
	window.nav = 1;
	window.filters = 1;
	window.readLimit = 30;
	window.sidebarTab = 1; // stats
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;

	const scouter = await pageModulesLoadingScript();
	if(scouter){
		loadOptions(MyGlobals.startIndex, window.readLimit);

		//load sidebar
		loadSidebar();

		//load past events
		loadPastEvents();
	}
});
$(document).on('click', '#erc20Options', async function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #62006b', 'background' : 'rgba(214, 24, 138,0.1)'});//set style
	//set global
	window.nav = 1;
	window.filters = 1;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;

	const scouter = await pageModulesLoadingScript();
	if(scouter){
		loadOptions(MyGlobals.startIndex, window.readLimit);
	}
});
$(document).on('click', '#equitySwaps', async function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #62006b', 'background' : 'rgba(214, 24, 138,0.1)'});//set style
	//set global
	window.nav = 2;
	window.filters = 1;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;
	//scout
	const scouter = await pageModulesLoadingScript();
	if(scouter){
		loadOptions(MyGlobals.startIndex, window.readLimit);
	}
});
$(document).on('click', '#erc20Loans', async function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #62006b', 'background' : 'rgba(214, 24, 138,0.1)'});//set style
	//set global
	window.nav = 3;
	window.filters = 1;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;
	//scout
	const scouter = await pageModulesLoadingScript();
	if(scouter){
		loadOptions(MyGlobals.startIndex, window.readLimit);
	}
});
$(document).on('click', '#socialstream', function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #62006b', 'background' : 'rgba(214, 24, 138, 0.15)'});//set style
	//set global
	swal(
		{
			title: 'Coming...',
			text: 'Social will be introduced in later Beta testing. \nIt will provide a live feed of opinions on deals.',
			type: 'info',
			html: false,
			dangerMode: false,
			confirmButtonText: 'okay',
			showConfirmButton: true,
			showCancelButton: false,
			animation: 'slide-from-top',
		}, function () {
			console.log('social feed coming soon...');
		}); 
});
//filters
$(document).on('click', '#discoverTab', function(e){
	$('.streamtype').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #62006b', 'background' : 'rgba(214, 24, 138, 0.1)'});//set style
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
	$(this).css({'border' : '1px solid #62006b', 'background' : 'rgba(214, 24, 138, 0.1)'});//set style
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
	$(this).css({'border' : '1px solid #62006b', 'background' : 'rgba(214, 24, 138, 0.1)'});//set style
	//set global
	window.filters = 3;
	//check load continuation
	MyGlobals.outputArray = [];
	MyGlobals.startIndex = 0;
	MyGlobals.lastItemIndex = 0;
	loadOptions(MyGlobals.startIndex, window.readLimit);
});


/*=========================================================================
    HELPER FUNCTIONS
==========================================================================*/

async function addBookmark(optionId) {
	try {
		
		// Submit Tx
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
		
			let message, nonTxAction;
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

// Filter hedges using token address or token id
async function onSearchSubmit(event) {
	event.preventDefault();
	var inputText = $('#searchBar').val();
	// Check if token address pasted
	if (inputText.length >= 40 && isValidEthereumAddress(inputText)) {
		
		// Set global filters
		window.nav = 1;
		window.filters = 4;

		// Check load continuation
		MyGlobals.outputArray = [];
		MyGlobals.startIndex = 0;
		MyGlobals.lastItemIndex = 0;

		// A - Fetch Options matching address
		await loadOptions(MyGlobals.startIndex, readLimit);

		// B - Update sidebar with token infor: hedge volume and listen to events
		// function determines what to load based on searchBar input
		// events are constantly loaded all but filtered only when searchBar contains erc20 address
		await loadSidebar();
	}
	// if option ID pasted 
	else if (Number.isInteger(inputText)) {
		console.log('fetching hedge by ID provided...');	
		await fetchOptionStrip(inputText);
	}
	else {
		const privatize = `Only token address or option ID accepted when filtering storage!`;
  
	swal({
		title: "Invalid Prompt",
		text: privatize,
		type: "warning",
		html: true,
		dangerMode: true,
		confirmButtonText: "go back",
		confirmButtonColor: "#171716",
		closeOnConfirm: false,
		showConfirmButton: true,
		showCancelButton: false,
		timer: 4000,
		animation: "slide-from-top"
	},async function(){//on confirm click
		//clear search bar
		document.getElementById("searchBar").value = "";

	});
	}
}

async function createForm() {
	let trader = MyGlobals.wallet;
	let truncatedUser = '';
	let depositedBalance = 0;
	let withdrawnBalance = 0;
	let lockedInUseBalance = 0;
	let withdrawableBalance = 0;
  
	if (isValidEthereumAddress(trader)) {
	  truncatedUser = truncateAddress(trader);
	} else {
	  truncatedUser = 'Connect Wallet';
	}
  
	const privatize = `
	  <div class="shl_inputshold delegate_inputshold setBeneField">
		<label id="typeLabel" class="labels"><img src="imgs/info.png" title="Options or Equity Swaps (read docs)">hedge type:</label>
		<select id="hedgeType" name="hedgeType">
		  <option value="0">Call Option</option>
		  <option value="1">Put Option</option>
		  <option value="2">Equity Swap</option>
		  <option value="3">Loan Request (coming)</option>
		</select>
		<label id="tokenLabel" class="labels"><img src="imgs/info.png" title="token address of the underlying assets or tokens">token address:</label>
		<input id="tokenAddy" class="sweetInput shldi benown" aria-invalid="false" autocomplete="ERC20 token to hedge">
		<label id="amountLabel" class="labels"><img src="imgs/info.png" title="amount of the tokens you want to hedge. \nNote: Tokens should be deposited to Vault first, visit wallet page">token amount:</label>
		<input id="tokenAmount" class="sweetInput shldi benown" aria-invalid="false" autocomplete="amount of tokens in trade">
		<label id="premiumLabel" class="labels"><img src="imgs/info.png" title="in paired currency, the cost the buyer has to pay to take the OTC trade">premium:</label>
		<input id="premium" class="sweetInput shldi benown" aria-invalid="false" autocomplete="cost of buying trade">
		<label id="strikeLabel" class="labels"><img src="imgs/info.png" title="strike price of the underlying tokens in paired currency">strike price:</label>
		<input id="strikePrice" class="sweetInput shldi benown" aria-invalid="false" autocomplete="break even value for the trade">
		<br>
		<div class="walletBalancesTL">
		  <p>paste token address above & view your balances: </p>
		  <span class="walletbalanceSpan">${truncatedUser} <img src="imgs/info.png" title="protocol balances on connected wallet"></span></br>
		  <div><span class="walBalTitle">deposited:</span><span id="depositedBalance">${depositedBalance}</span></div>
		  <div><span class="walBalTitle">locked:</span><span id="lockedInUseBalance">${lockedInUseBalance}</span></div>
		  <div><span class="walBalTitle">withdrawn:</span><span id="withdrawnBalance">${withdrawnBalance}</span></div>
		  <div><span class="walBalTitle">available:</span><span id="withdrawableBalance">${withdrawableBalance}</span></div>
		</div>
	  </div>`;
  
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
		showCancelButton: true,
		timer: 4000,
		animation: "slide-from-top"
	},async function(){//on confirm click
		await createHedgeSubmit();
	});
}

// Listeners: create button click, sidebar tab click
$(document).on('click', '#create_button', function(e){
	createForm();
});
// Listeners: set sidebar globals
$(document).on('click', '#statsLabel', async function(e){
	window.sidebarTab = 1;
	// quick one: refresh sidebar
	const searchInput = $('#searchBar').val();
    if (searchInput.length >= 40 && isValidEthereumAddress(searchInput)) {
        // filter sidebar infor for token
        await loadSidebarVolume_Token(searchInput);
    } else {
        await loadSidebarVolume_All();
    }
});

$(document).on('click', '#eventsLabel', async function(e){
	window.sidebarTab = 2;
	// quick one: refresh sidebar
	await loadPastEvents();
});

// Attach event handler to document object for event delegation
document.addEventListener('paste', async function(event) {
    if (event.target.id === 'tokenAddy') {
        await handlePaste(event);
    }
	if (event.target.id === 'searchBar') {
		await onSearchSubmit(event);
	}
});

async function handlePaste(event) {
    event.preventDefault();
    // Get the pasted text from the clipboard
    var clipboardData = event.clipboardData || window.clipboardData;
    var pastedText = clipboardData.getData('text');

    // Check if the pasted text is a valid ERC20 token address
    if (isValidEthereumAddress(pastedText)) {
        // update the input field value with the pasted token address
        event.target.value = pastedText;
		await fetchUserTokenBalance(pastedText);
    } else {
        console.log('Invalid ERC20 token address pasted:', pastedText);
    }
}

async function fetchUserTokenBalance(tokenAddress){
	const accounts = await getAccounts();
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

// Submit call function to hedging contract to create hedge
async function createHedgeSubmit() {
	const accounts = await getAccounts();
	if (accounts.length === 0) {
	  alert('Please connect your wallet');
	  return;
	}
  
	// Get form inputs
	const hedgeType = document.getElementById('hedgeType').value;
	const tokenAddy = document.getElementById('tokenAddy').value;
	const tokenAmount = parseFloat(document.getElementById('tokenAmount').value);
	const cost = parseFloat(document.getElementById('premium').value);
	const strikePrice = parseFloat(document.getElementById('strikePrice').value);
  
	// Validate form inputs
	if (tokenAddy.length < 40 || !isValidEthereumAddress(tokenAddy)) {
		alert('Invalid token address provided');
		return;
	}
	if (!(tokenAmount > 0 && cost > 0 && strikePrice > 0)) {
		alert('Invalid amounts provided');
		return;
	}
	if (!(hedgeType == 0 || hedgeType == 1 || hedgeType == 2)) {
		alert('Invalid hedge type');
		return;
	}
    
	// get token info and pair infor, price and cost is in pair currency	
	const tokenDecimals = await getTokenDecimals(tokenAddress);
	const tokenAmountWei = await fromDecimalToBigInt(tokenAmount, tokenDecimals);
	// get dependency variables
	const pairAddress = await hedgingInstance.getPairAddressZK(tokenAddress);
	const pairInfo = await getTokenInfo(pairAddress.pairedCurrency);
	const pairDecimals = pairInfo.decimals;
	// prepare other inputs
	const costWei = fromBigIntNumberToDecimal(cost, pairDecimals);
	const strikePriceWei = fromBigIntNumberToDecimal(strikePrice, pairDecimals);

	try {
		// prepare Tx
		const transaction = await hedgingInstance.connect(signer).createHedge(hedgeType, tokenAddy, tokenAmountWei, costWei, strikePriceWei);
		// Wait for the transaction to be mined
		const receipt = await transaction.wait();

		if (receipt.status === true) {
			console.log('Transaction hash:', receipt.transactionHash);
			handleTransactionSuccess(receipt.transactionHash); // Define this function as needed
		} else {
			console.log('Transaction failed. Receipt status:', receipt.status);
			handleTransactionFailure(receipt.status); // Define this function as needed
		}
		
	} catch (error) {
		console.error('Transaction error:', error);
		const text = error.message;
		swal({
			title: "Transaction error.",
			type: "error",
			confirmButtonColor: "#F27474",
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
	swal.close();
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


// Listen to live events
// ADD HEDGE MINED - to be used for live transactions on sidebar
// when user searches or filters by token address, only events matching the address will be displayed/filtered
async function createEventListItem(event) {
	const searchBarValue = getSearchBarValue();

	// Check if the ERC20 token address exists in the search bar
	const tokenAddressExists = (searchBarValue !== '' && event.returnValues.token === searchBarValue);

	// If the token address exists in the search bar, display only matching list items
	if (tokenAddressExists) {
		const listItem = document.createElement('li');
		listItem.classList.add('event-item');

		const title = document.createElement('span');
		title.textContent = event.event;
		listItem.appendChild(title);

		// display cost/premium/value with pair symbol
		const pairToken = await getPairToken(event.returnValues.optionId);
		const pairTokenSymbol = await getSymbol(pairToken);

		const amount = document.createElement('span');
		amount.textContent = (event.returnValues.createValue || event.returnValues.startValue || event.returnValues.endValue || event.returnValues.payOff) + ' ' + pairTokenSymbol;
		listItem.appendChild(amount);

		// trim address
		const truncatedAddress = truncateAddress((event.returnValues.writer || event.returnValues.buyer || event.returnValues.miner));
		const dealer = document.createElement('span');
		dealer.textContent = truncatedAddress;
		listItem.appendChild(dealer);
		
		// tx link
		const linkSpan = document.createElement('span'); 
		const link = document.createElement('a');
		link.href = 'https://etherscan.io/tx/' + event.transactionHash;
		link.textContent = 'View Transaction';
		linkSpan.appendChild(link);
		listItem.appendChild(linkSpan);

		return listItem;
  	}

	// If the token address doesn't exist in the search bar, display all list items
	const listItem = document.createElement('li');
	listItem.classList.add('event-item');

	const title = document.createElement('span');
	title.textContent = event.event;
	listItem.appendChild(title);

	// display cost/premium/value with pair symbol
	const pairToken = await getPairToken(event.returnValues.optionId);
	const pairTokenSymbol = await getSymbol(pairToken);

	const amount = document.createElement('span');
	amount.textContent = (event.returnValues.createValue || event.returnValues.startValue || event.returnValues.endValue || event.returnValues.payOff) + ' ' + pairTokenSymbol;
	listItem.appendChild(amount);

	// trim address
	const truncatedAddress = truncateAddress((event.returnValues.writer || event.returnValues.buyer || event.returnValues.miner));
	const dealer = document.createElement('span');
	dealer.textContent = truncatedAddress;
	listItem.appendChild(dealer);

	const link = document.createElement('a');
	link.href = 'https://etherscan.io/tx/' + event.transactionHash;
	link.textContent = 'View Transaction';
	listItem.appendChild(link);

  return listItem;
}


/*  ---------------------------------------
    HEDGING EVENT LISTENING
-------------------------------------- */
$(document).ready(async function () {

    setupEventListening();

});

async function setupEventListening() {
	let hedgingInstance = window.hedgingInstance;
	
	// Hedging Events
	try {
        const filter_hedgeCreated = await hedgingInstance.filters.hedgeCreated();
        hedgingInstance.on(filter_hedgeCreated, handleHedgeCreatedEvent);

        const filter_hedgePurchased = await hedgingInstance.filters.hedgePurchased();
        hedgingInstance.on(filter_hedgePurchased, handleHedgePurchasedEvent);

        const filter_hedgeSettled = await hedgingInstance.filters.hedgeSettled();
        hedgingInstance.on(filter_hedgeSettled, handleHedgeSettledEvent);

        const filter_minedHedge = await hedgingInstance.filters.minedHedge();
        hedgingInstance.on(filter_minedHedge, handleMinedHedgeEvent);

    } catch (error) {
        console.error('Error setting up event listening:', error);
    }
}

function handleHedgeCreatedEvent(token, hedgeID, createValue, type, owner) {
    const event = { returnValues: { token, hedgeID, createValue, type, owner } };
    const listItem = createEventListItem(event);
    document.getElementById('eventsList').appendChild(listItem);
}

function handleHedgePurchasedEvent(token, hedgeID, startValue, type, buyer) {
    const event = { returnValues: { token, hedgeID, startValue, type, buyer } };
    const listItem = createEventListItem(event);
    document.getElementById('eventsList').appendChild(listItem);
}

function handleHedgeSettledEvent(token, hedgeID, endValue, payOff, miner) {
    const event = { returnValues: { token, hedgeID, endValue, payOff, miner } };
    const listItem = createEventListItem(event);
    document.getElementById('eventsList').appendChild(listItem);
}

function handleMinedHedgeEvent(optionId, miner, token, paired, tokenFee, pairFee) {
    const event = { returnValues: { optionId, miner, token, paired, tokenFee, pairFee } };
    const listItem = createEventListItem(event);
    document.getElementById('eventsList').appendChild(listItem);
}

function handleHedgeCreatedSuccessEvent(token, optionId, amount, hedgeType, cost, tx_hash) {
    const outputCurrency = ''; // using nonTxBased message with empty currency
    const type = 'success'; // or error
    const wallet = '';
    const message = 'Hedge Created Successfully';
    const nonTxAction = 'Token: ' + truncateAddress(token) + '<br>Hedge ID: ' + optionId + '<br>Amount: ' + amount + '<br>Hedge Type: ' + hedgeType + '<br>Premium: ' + cost;
    popupSuccess(type, outputCurrency, tx_hash, message, 0, 0, wallet, nonTxAction);
}


/*  ---------------------------------------
    BOTTOM OF EVERY MAIN SCRIPT MODULE 
-------------------------------------- */
// Provider Listeners
ethereum.on("connect", (chainID) => {
	// Update chainID on connect
	CONSTANTS.chainID = chainID.chainId;
	console.log("Connected to chain:", CONSTANTS.chainID);
	handleNetworkChange(chainID.chainId)
	chainCheck();
});

ethereum.on("accountsChanged", async (accounts) => {
    console.log("Account changed:", accounts);
	if(accounts.length > 0) {
		// Refresh accounts & page Feed
		checkAndCallPageTries();
		loadOptions();
	} else {
		// Refresh wallet widget directly		
		handleAccountChange(accounts);
		checkAndCallPageTries();
	}
});

ethereum.on("chainChanged", (chainID) => {
	console.log("Network changed:", chainID);
	handleNetworkChange(chainID);
	window.location.reload();
});



