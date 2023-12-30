/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, commaNumbering } from './constants.js';
import { checkAndCallPageTries } from './_wallet.js'

/*=========================================================================
    run functions
==========================================================================*/
async function unlockedWallet() {
	const accounts = await web3.eth.getAccounts();
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
			CONSTANTS.chainID = chainID.chainId;
			console.log("Connected to chain:", CONSTANTS.chainID);
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
			// waiting stance
			$('.wallets').css('display', 'none');
			$('.walletpur').css('display', 'inline-block');

			currentBlock();
			setInterval(currentBlock, 40000);

			if (!(await unlockedWallet())) {
				reqConnect();
			} else {
				walletCheckProceed();
				setInterval(walletCheckProceed, 40000);
			}
		} else {
			//waiting stance
			$('.wallets').css('display', 'none');
			$('.network_switch').css('display', 'inline-block');
			switchNetwork();

			swal(
				{
					title: 'Switch to Goerli Testnet...',
					text: 'Failed to initialize Chain and Wallet. \nClick retry button to try again.',
					type: 'info',
					html: false,
					dangerMode: false,
					confirmButtonText: 'retry',
					cancelButtonText: 'cancel',
					showConfirmButton: true,
					showCancelButton: true,
					animation: 'slide-from-top',
				}, function () {
					console.log('initialize retry...');
					switchNetwork();
				}); 
		}
	}

	async function handleAccountChange(wallets) {
		console.log("Wallet connected:", wallets);
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
		CONSTANTS.chainID = networkId;
		if (networkId !== CONSTANTS.network) {
			console.log("Reading chain:" + networkId + ", instead of, " + CONSTANTS.network);
			$(".wallets").css("display", "none");
			$(".network_switch").css("display", "inline-block");
		} else {
			await initializeConnection();
			console.log("Reading from mainnet: ", networkId);
		}
	}

	// Other functions follow...
	
	async function balanceOf(account) {
		try {
		const result = await neonInstance.methods.balanceOf(account).call();
		const decimals = CONSTANTS.decimals;
		const balance = (BigInt(result) / BigInt(10) ** BigInt(decimals)).toString();
		const balance_toLocale = commaNumbering(balance);
		CONSTANTS.tokenBalance = balance;
	
		if (result) {
			const first = account.substring(0, 5);
			const last = account.slice(account.length - 3);
			const privatize = `${first}..${last}`;
	
			$('#wallet_id').empty().append(privatize);
			$('#wallet_balance').empty().append(`${balance_toLocale} XEON`);
			$(".dot").css({ 'background-color': 'rgb(39, 174, 96)' });
			return balance;
		} else {
			console.log(result);
			swal({
			title: 'Failed to compute.',
			type: 'error',
			allowOutsideClick: true,
			confirmButtonColor: '#F27474',
			text: 'Issue: Something went wrong.',
			});
		}
		} catch (error) {
		console.log(error);
		swal({
			title: 'Neon Hedge Disconnected.',
			type: 'error',
			allowOutsideClick: true,
			confirmButtonColor: '#F27474',
			text: `> Wallet Locked. \nPlease Unlock Wallet.`,
		});
		}
	}
	
	async function currentBlock() {
		try {
			const block = await web3.eth.getBlockNumber();
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
			const [chainId, networkId] = await Promise.all([
				web3.eth.getChainId(),
				// alt approach
				// window.web3.eth.net.getId(),
				Promise.resolve(CONSTANTS.network),
			]);
			
			// Returned as  HEX from getChainId so Convert to string	 
			const chainIdString = '0x' + chainId.toString(16);  
			console.log("Chain ID:", chainIdString);
			console.log("default ID:", networkId);
		
			if (networkId === CONSTANTS.chainID.toLowerCase() || chainIdString.toLowerCase() === networkId.toLowerCase()) {
				console.log("correct chain: ", chainIdString);
				$('.wallets').css('display', 'none');
				$('.waiting_init').css('display', 'inline-block');
				return true;
			} else {
				console.log("wrong chain: ", chainIdString);
				$('.wallets').css('display', 'none');
				$('.network_switch').css('display', 'inline-block');
				return false;
			}
		} catch (error) {
		  console.error('chain ID retrieval failed:', error);
		  return false;
		}
	}  
	
	async function switchNetwork() {
		if (window.ethereum) {
			try {
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x5' }] // Use the Goerli testnet chain ID
				});
				// success in switch, reinitialize
				console.log('Successfully switched to the Goerli Testnet');
				await initializeConnection();
				return true;
			} catch (error) {
				//	error
				console.log('Error switching to Goerli Testnet:', error);
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{
								chainId: '0x5', // using the Goerli testnet chain ID
								chainName: 'Goerli Testnet',
								nativeCurrency: {
									name: 'Goerli',
									symbol: 'ETH',
									decimals: 18
								},
								blockExplorerUrls: [CONSTANTS.etherScan],
								rpcUrls: ['https://goerli.infura.io/v3/'] // using the Goerli testnet RPC URL
								}
							]
						});
						await initializeConnection();
						return true;
					} catch (addError) {
						console.log('add error', addError);
						$('.wallets').css('display', 'none');
						$('.network_switch').css('display', 'inline-block');
						swal({
							title: 'Failed to Switch Network',
							type: 'info',
							text: 'Try again to switch to the Goerli Testnet.',
							showConfirmButton: true,
							showCancelButton: true,
							confirmButtonText: 'Switch',
							cancelButtonText: 'Cancel',
							animation: 'slide-from-top',
							}, function () {
								console.log('initialize retry...');
								switchNetwork();
							});
					}
					return false;
				} else {
					console.log('switch error', error);
					$('.wallets').css('display', 'none');
					$('.network_switch').css('display', 'inline-block');
					swal({
						title: 'Request Denied by User..',
						type: 'info',
						text: 'Please switch to the Goerli Testnet.',
						showConfirmButton: true,
						showCancelButton: true,
						confirmButtonText: 'Switch',
						cancelButtonText: 'Cancel',
						animation: 'slide-from-top',
						}, function () {
							console.log('initialize retry...');
							switchNetwork();
						}); 
				}
				return false;
			}
		} else {
		  swal({
			title: 'Web3 Provider Missing!',
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
			  text: 'Permissions needed here..',
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
			const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false'); 
			const data = await response.json();
			CONSTANTS.ethUsdcPrice = data.ethereum.usd; 
		} catch (error) {
			console.log(error);
		}
	
		try {
			const account = await web3.eth.getAccounts();
			balanceOf(account[0]);
		} catch (error) {
			console.log('Metamask Locked');
		}

		try { 
			await checkAndCallPageTries();
		} catch (error) {
			console.log(error);
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
