/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS } from './constants.js';

/*=========================================================================
    run functions
==========================================================================*/
async function unlockedWallet() {
	const accounts = await window.web3.eth.getAccounts();
	if (accounts.length > 0) {
		$('.wallets').css('display', 'none');
		$('.walletpur').css('display', 'inline-block');
		return true;
	} else if (accounts.length === 0) {
		$('.wallets').css('display', 'none');
		$('.wallet_connect').css('display', 'inline-block');
		return false;
	}
}

// Event listeners for window load
	window.addEventListener("load", () => {
		const ethereum = window.ethereum;

		ethereum.on("connect", (chainID) => {
			window.chainID = chainID.chainId;
			console.log("Connected to chain:", window.chainID);
		});

		ethereum.on("accountsChanged", (accounts) => {
			console.log("Account changed:", accounts);
			handleAccountChange(accounts);
		});

		ethereum.on("chainChanged", (networkId) => {
			console.log("Network changed:", networkId);
			handleNetworkChange(networkId);
			window.location.reload();
		});
	});

	async function initializeConnection() {
		const correctChain = await chainCheck();
		if (correctChain) {
			currentBlock();
			setInterval(currentBlock, 40000);

			if (!(await unlockedWallet())) {
				reqConnect();
			} else {
				walletCheckProceed();
				setInterval(walletCheckProceed, 40000);
			}
		} else {
			if (switchNetwork()) {
				//await initializeConnection();
				// pop up retry swal to recall initializeConnection
				swal(
					{
						title: 'Ooops...',
						text: 'Failed to initialize Chain and Wallet. \nClick retry button to try again.',
						type: 'info',
						html: false,
						dangerMode: false,
						confirmButtonText: 'retry',
						cancelButtonText: 'cancel',
						showConfirmButton: true,
						showCancelButton: true,
						timer: 10000,
						animation: 'slide-from-top',
					}, function () {
						console.log('intialize retry...');
						initializeConnection();
					}); 
			} else {
				// Handle error from switchNetwork function
			}
		}
	}

	async function handleAccountChange(wallets) {
		console.log("Account changed:", wallets);
    	let wallet = wallets[0];
		wallet = wallets.length ? wallets[0] : null;
		if (wallets.length === 0) {
			console.log("Please connect to MetaMask.");
		} else if (wallets[0] !== window.currentAccount) {
			window.currentAccount = wallets[0];
			await initializeConnection();
		}
	}

	async function handleNetworkChange(networkId) {
		console.log("Network changed:", networkId);
		window.chainID = networkId;
		if (networkId !== CONSTANTS.network) {
			console.log("Reading other chain:", networkId);
			$(".wallets").css("display", "none");
			$(".network_switch").css("display", "inline-block");
		} else {
			await initializeConnection();
			console.log("Reading eth mainnet");
		}
	}

	// Other functions follow...
	
	async function balanceOf(account) {
		try {
		const result = await neonInstance.methods.balanceOf(account).call();
		const decimals = CONSTANTS.decimals;
		const balance = (result / Math.pow(10, decimals)).toFixed(2);
		CONSTANTS.tokenBalance = balance;
	
		if (result) {
			const first = account.substring(0, 5);
			const last = account.slice(account.length - 3);
			const privatize = `${first}..${last}`;
	
			$('#wallet_id').empty().append(privatize);
			$('#wallet_balance').empty().append(`${balance} NEON`);
			$(".dot").css({ 'background-color': 'rgb(39, 174, 96)' });
			return balance;
		} else {
			console.log(result);
			swal({
			title: 'Failed.',
			type: 'error',
			allowOutsideClick: true,
			confirmButtonColor: '#F27474',
			text: 'Issue: Something went wrong.',
			});
		}
		} catch (error) {
		console.log(error);
		swal({
			title: 'Failed.',
			type: 'error',
			allowOutsideClick: true,
			confirmButtonColor: '#F27474',
			text: `Issue: ${error.message}`,
		});
		}
	}
	
	async function currentBlock() {
		try {
			const block = await window.web3.eth.getBlockNumber();
			document.getElementById('blocknumber').innerHTML = `<a href="${CONSTANTS.etherScan}/block/${block}" target="_blank">${block}</a>`;
			console.log('block: ', block);
		} catch (error) {
		console.log(error);
		swal({
			title: 'Offline',
			type: 'error',
			allowOutsideClick: true,
			confirmButtonColor: '#F27474',
			text: error.message,
		});
		$('.dot').css({ 'background-color': '#ec0624' });
		}
	}
	
	async function chainCheck() {	  
		try {
			await window.web3.eth.getChainId()
			.then((chainId) => {
				console.log("Chain ID:", chainId);
				const chainID = chainId;

				if (chainID === CONSTANTS.network) {
					console.log(`${chainID} == ${CONSTANTS.network}`);
					$('.wallets').css('display', 'none');
					$('.waiting_init').css('display', 'inline-block');
					return true;
				} else if (chainID !== CONSTANTS.network) {
					console.log(`wrong chain: ${chainID} vs ${CONSTANTS.network}`);
					$('.wallets').css('display', 'none');
					$('.network_switch').css('display', 'inline-block');
					return false;
				}
			})
			.catch((error) => {
				console.error("Error fetching chain ID:", error);
			});		  
		} catch (error) {
		  console.error('Error checking chain:', error);
		  // Handle errors, e.g., chain ID retrieval failed
		  return false;
		}
	}
	  
	
	async function switchNetwork() {
		if (window.ethereum) {
		try {
			await window.ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: '0x5' }],
			});
		} catch (error) {
			if (error.code === 4902) {
			try {
				await window.ethereum.request({
				method: 'wallet_addEthereumChain',
				params: [
					{
					chainId: '0x5',
					chainName: 'Goerli Testnet',
					nativeCurrency: {
						name: 'GOERLI',
						symbol: 'ETH',
						decimals: 18,
					},
					blockExplorerUrls: [CONSTANTS.etherScan],
					rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
					},
				],
				});
				$('.wallets').css('display', 'none');
				$('.walletpur').css('display', 'inline-block');
				await initializeConnection();
			} catch (addError) {
				console.log(addError);
				$('.network_switch').css('display', 'inline-block');
				swal(
				{
					title: '',
					text: 'Please Switch Network',
					type: 'info',
					html: false,
					dangerMode: false,
					confirmButtonText: 'switch',
					cancelButtonText: 'cancel',
					showConfirmButton: true,
					showCancelButton: true,
					timer: 4000,
					animation: 'slide-from-top',
				},
				function () {
					switchNetwork();
				}
				);
				return false;
			}
			} else {
			console.log(error);
			$('.network_switch').css('display', 'inline-block');
			return false;
			}
		}
		} else {
		swal({
			title: 'Hold on!',
			type: 'error',
			confirmButtonColor: '#F27474',
			text: 'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html',
		});
		}
	}
	
	async function reqConnect() {
		try {
		  const permissions = await web3.eth.requestAccounts();
		  
		  if (permissions.length > 0) {
			console.log(`eth_accounts permission successfully requested!`);
			await initializeConnection();
			return true;
		  }
		} catch (error) {
		  if (error.code === 4001) {
			console.log('Permissions needed to continue.');
			swal({
			  title: '',
			  text: 'Permissions needed on dashboard..',
			  type: 'info',
			  html: false,
			  dangerMode: false,
			  confirmButtonText: 'try again',
			  cancelButtonText: 'cancel',
			  showConfirmButton: true,
			  showCancelButton: true,
			  timer: 4000,
			  animation: 'slide-from-top',
			}, function () {
			  console.log('permissions retry...');
			  reqConnect();
			});
		  } else {
			console.log(error);
		  }
		}
		return false;
	}	  
	
	async function walletCheckProceed() {
		try {
			CONSTANTS.decimals = await neonInstance.methods.decimals().call();
		} catch (error) {
			console.log(error);
		}
	
		try {
			const account = await window.web3.eth.getAccounts();
			balanceOf(account);
		} catch (error) {
			console.log('Metamask Locked');
		}
	}
	
	// Rest of our code...

	// Function to show popup and initiate countdown animation
	async function popupSuccess(type, currency, Txhash, title, amountEth, amountTokens, wallet, nonTxAction) {
		// Reset pop-up timer and styling
		CONSTANTS.popuptimer = 20;
		$("#popupNotify, #pNt").removeAttr("style");
		$('#pNt').css({ 'width': '100% !important' });
		$('#pNotifyX').click();
	
		// Set title and amount based on currency
		$('#popupTitle').empty().append(title);
		if (currency === 'NEON') {
		$('#popupAmounts').empty().append(Number(amountTokens).toLocaleString() + ' ' + currency);
		} else if (currency === 'ETH') {
		$('#popupAmounts').empty().append(amountEth + ' ' + currency);
		} else {
		if (nonTxAction.length > 2) {
			$('#popupAmounts').empty().append(nonTxAction);
		}
		}
	
		// Set transaction hash link and display pop-up
		$('#popupTxhash').empty().append('<a href="' + CONSTANTS.etherScan + '/tx/' + Txhash + '" target="_blank">View Transaction on Etherscan..</a>');
		$('#popupNotify').css('display', 'flex');
	
		// Initiate countdown animation
		CONSTANTS.resumeclock = CONSTANTS.popuptimer * 1000;
		$('#pNt').animate({ width: "0px" }, CONSTANTS.resumeclock, "swing", function () {
		$('#pNotifyX').click();
		});
	}
	
	// Function to decrement the pop-up timer
	function decrementSeconds() {
		if (CONSTANTS.popuptimer > 0) {
		CONSTANTS.popuptimer -= 1;
		}
	}
	
	$(document).on('click', '#pNotifyX', function (e) {
		// Stop animation and reset pop-up styling
		$('#pNt').stop(true, true);
		$("#popupNotify, #pNt").removeAttr("style");
		$('#popupNotify').css({ 'display': 'none' });
	});
	
	$(document).ready(function () {
		const popup = $("#popupNotify");
	
		popup.on("mouseover", function (event) {
		if (typeof window.pauseCount === 'undefined') {
			$('#pNt').stop(true);
			const x = $('#pNt').width();
			CONSTANTS.popuptimer = (x / 280) * 10;
		}
		});
	
		popup.on("mouseleave", function (event) {
		const resumeclock = CONSTANTS.popuptimer * 1000;
		if (CONSTANTS.popuptimer > 0) {
			$('#pNt').animate({ width: "0px" }, resumeclock, "swing", function () {
			$('#pNotifyX').click();
			});
		}
		window.pauseCount = 1;
		});
	});

	// Make sure to call the required functions to start the process
	$(document).ready(function (e) {
		$('.waiting_init').css('display', 'inline-block');
		try{
			initializeConnection();
		} catch (error) {
			console.log(error);
		}
	});
	
	$(document).on('click', '.wallet_connect', function () {
		reqConnect();
	});
	
	$(document).on('click', '.network_switch', function () {
		switchNetwork();
	});
	
	$(document).on('click', '#wallet_id', function () {
		disconnectwallet();
	});
	
	$(document).on('click', '#discon', function () {
		// Handle disconnect logic here
	});


	export { unlockedWallet, reqConnect, popupSuccess };
