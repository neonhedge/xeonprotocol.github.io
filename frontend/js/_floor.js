const MyGlobals = {
	wallet	: '',
	Mode : 0,
	outputArray : [],
	startIndex : 0,
	lastItemIndex : 0,
	profitBg : 'imgs/repayment2.webp',
	lossBg : 'imgs/repayment2.webp'
};

/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS } from './constants.js';
import { initWeb3 } from './dapp-web3-utils.js';
import { refreshDataOnElements, loadOptions, fetchOptionCard, fetchNameSymbol, prepareTimestamp, noOptionsSwal } from './module-floor-card-fetchers.js';

/*=========================================================================
    INITIALIZE WEB3
==========================================================================*/

initWeb3();

/*========================================================================
    ON PAGE LOAD  
==========================================================================*/

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
		if(startvalue>0){
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

function createForm(){
	let trimUser = MyGlobals.wallet;
	let truncatedUser = trimUser.substring(0, 6) + '...' + trimUser.slice(-3);
	var privatize = `
	<div class="shl_inputshold delegate_inputshold setBeneField">
		<label id="tokenLabel" class="labels"><img src="imgs/info.png" title="token address of the tokens you want to hedge">token Addr:</label>
		<input id="tokenAddy" class="sweetInput shldi benown" aria-invalid="false" autocomplete="token to hedge ERC20">
		<label id="amountLabel" class="labels"><img src="imgs/info.png" title="amount of the tokens you want to hedge P.S should be deposited first">token amount:</label>
		<input id="tokenAmount" class="sweetInput shldi benown" aria-invalid="false" autocomplete="amount of tokens to hedge">
		<label id="costLabel" class="labels"><img src="imgs/info.png" title="cost in paired currency or base">hedge cost:</label>
		<input id="" class="sweetInput shldi benown" aria-invalid="false" autocomplete="cost in base to buy hedge">
		<label id="typeLabel" class="labels"><img src="imgs/info.png" title="Call Option or Equity Swap (read docs)">hedge type:</label>
		<select id="hedgeType" name="hedgeType">
			<option value="option1">Call Option</option>
			<option value="option3">Put Option (coming)</option>
			<option value="option2">Equity Swap</option>
			<option value="option3">Crypto Loan (coming)</option>
		</select>

		<br>
		<div class="walletBalancesTL">
			<span class="walletbalanceSpan">`+truncatedUser+` <img src="imgs/info.png" title="withdrawable or free balances for connected wallet"></span></br>
			<div><span class="walBalTitle">TOKEN:</span><span id="tokenBal">120,000,000</span></div>
			<div><span class="walBalTitle">WETH:</span><span id="wethBal">2.6</span></div>
			<div><span class="walBalTitle">USDT:</span><span id="usdtBal">10,000</span></div>
			<div><span class="walBalTitle">USDC:</span><span id="usdcBal">204,000</span></div>
		</div>
	</div>`;
	swal({
			title: "Create New",
			text: privatize,
			type: "prompt",  //var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];
			html: true,
					dangerMode: true,
					confirmButtonText: "Create",
					confirmButtonColor: "#171716", //cowboy brown
					cancelButtonText: "Cancel",
					closeOnConfirm: false,
					showLoaderOnConfirm: true,
			showConfirmButton: true,
			showCancelButton: true,
			timer: 4000,
			animation: "slide-from-top"
	},function(){//on confirm click
		var address = $('#submitwallet').val();
		setBeneficiaryWallet(address);
	});

	//proceed; get base balances
	userBalances = setTimeout( function() {
		hedgingInstance.methods.getUserBases(MyGlobals.wallet).call().then((result) => {
			const wethBalance = web3.utils.fromWei(result[0], 'ether'); // Convert wei to ether
			// Get the decimal values for USDT and USDC tokens
			const usdtDecimals = 6;
			const usdcDecimals = 6;
			// Convert USDT and USDC balances from wei to human-readable format using the decimal values
			const usdtBalance = parseFloat((result[1] / Math.pow(10, usdtDecimals)).toFixed(2));
			const usdcBalance = parseFloat((result[2] / Math.pow(10, usdcDecimals)).toFixed(2));
			// Assign values to HTML elements
			document.getElementById('wethBal').innerText = `${wethBalance.toFixed(2)}`;
			document.getElementById('usdtBal').innerText = `${usdtBalance}`;
			document.getElementById('usdcBal').innerText = `${usdcBalance}`;
		})
		.catch((error) => {
			console.error(error);
		});
	}, 2000);
}

$(document).on('click', '#create_button', function(e){
	createForm();
});

// Attach event handler to document object for event delegation
document.addEventListener('paste', function(event) {
    if (event.target.id === 'tokenAddy') {
        handlePaste(event);
    }
});

function handlePaste(event) {
    event.preventDefault();
    // Get the pasted text from the clipboard
    var clipboardData = event.clipboardData || window.clipboardData;
    var pastedText = clipboardData.getData('text');

    // Check if the pasted text is a valid ERC20 token address
    if (isERC20TokenAddress(pastedText)) {
        // update the input field value with the pasted token address
        event.target.value = pastedText;
		fetchUserTokenBalance(pastedText);
    } else {
        console.log('Invalid ERC20 token address pasted:', pastedText);
    }
}

function isERC20TokenAddress(address) {
    return web3.utils.isAddress(address);
}

async function fetchUserTokenBalance(tokenAddress){
	hedgingInstance.methods.getWithdrawableBalance(tokenAddress, MyGlobals.wallet).call().then((result) => {
		const tokenBal = parseFloat((result / Math.pow(10, MyGlobals.decimals)).toFixed(2));
		// Assign values to HTML elements
		document.getElementById('tokenBal').innerText = `${tokenBal}`;
	})
	.catch((error) => {
		console.error(error);
	});
}