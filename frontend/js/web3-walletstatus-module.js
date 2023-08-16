export function loadHedgesModule(userAddress) {
	const CONFIG = {
		wallet: "0x61418293d8649Cc9066cb103028710253184CE77",
		network: "0x5", // Goerli: 0x5, BSC: 0x56
		etherScan: "https://goerli.etherscan.io", //https://goerli.etherscan.io //https://ETHERscan.com/
		decimals: 18,
		tokenAddress: "0x967677a31A149Ebd5E605b2a7C85E850bb0dd00F",
		tokenBalance: 0,
		popuptimer: 20,
		contractABI: [],
		disconnected: 0,
	};

	// Initialize B
	try {
		if (typeof window.ethereum == 'undefined') {
			swal({
				title: "Hold on!",
				type: "error",
				confirmButtonColor: "#F27474",
				text: "Metamask is missing, so is the full experience now..."
			});
		} else if (typeof window.ethereum !== 'undefined') {
			window.web3 = new Web3(window.ethereum);
			var tokenAddress = CONFIG.tokenAddress;
			var erc20Abi = CONFIG.contractABI;
			window.tokenInst = new window.web3.eth.Contract(erc20Abi, tokenAddress);
		} else {
			console.warn("No web3 detected. Fallback to local node.");
			App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
		}
	} catch (error) {}

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
			blockTimer = setInterval(currentBlock, 40000);

			if (!(await unlockedWallet())) {
				reqConnect();
			} else {
				walletCheckProceed();
				checks = setInterval(walletCheckProceed, 40000);
			}
		} else {
			if (switchNetwork()) {
				initializeConnection();
			} else {
				// Handle error from switchNetwork function
			}
		}
	}

	async function handleAccountChange(accounts) {
		console.log("Account changed:", accounts);
		CONFIG.wallet = accounts.length ? accounts[0] : null;
		if (accounts.length === 0) {
			console.log("Please connect to MetaMask.");
		} else if (accounts[0] !== window.currentAccount) {
			window.currentAccount = accounts[0];
			initializeConnection();
		}
	}

	async function handleNetworkChange(networkId) {
		console.log("Network changed:", networkId);
		window.chainID = networkId;
		if (networkId !== CONFIG.network) {
			console.log("Reading other chain:", networkId);
			$(".wallets").css("display", "none");
			$(".network_switch").css("display", "inline-block");
		} else {
			initializeConnection();
			console.log("Reading eth mainnet");
		}
	}

	// Other functions follow...

	async function unlockedWallet() {
		const accounts = await window.web3.eth.getAccounts();
		if (accounts.length > 0) {
		CONFIG.wallet = accounts[0];
		$('.wallets').css('display', 'none');
		$('.walletpur').css('display', 'inline-block');
		return true;
		} else if (accounts.length === 0 || CONFIG.disconnected === 1) {
		$('.wallets').css('display', 'none');
		$('.wallet_connect').css('display', 'inline-block');
		return false;
		}
	}
	
	async function balanceOf(account) {
		try {
		const result = await tokenInst.methods.balanceOf(account).call();
		const decimals = CONFIG.decimals;
		const balance = (result / Math.pow(10, decimals)).toFixed(2);
		CONFIG.tokenBalance = balance;
	
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
		document.getElementById('blocknumber').innerHTML = `<a href="${CONFIG.etherScan}/block/${block}" target="_blank">${block}</a>`;
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
		const chainID = await ethereum.request({ method: 'eth_chainId' });
		if (chainID === CONFIG.network) {
		console.log(`${chainID} == ${CONFIG.network}`);
		$('.wallets').css('display', 'none');
		$('.waiting_init').css('display', 'inline-block');
		return true;
		} else if (chainID !== CONFIG.network) {
		console.log(`wrong chain: ${chainID} vs ${CONFIG.network}`);
		$('.wallets').css('display', 'none');
		$('.network_switch').css('display', 'inline-block');
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
					blockExplorerUrls: [CONFIG.etherScan],
					rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
					},
				],
				});
				$('.wallets').css('display', 'none');
				$('.walletpur').css('display', 'inline-block');
				initializeConnection();
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
		const permissions = await ethereum.request({
			method: 'wallet_requestPermissions',
			params: [{ eth_accounts: {} }],
		});
	
		const accountsPermission = permissions.find(permission => permission.parentCapability === 'eth_accounts');
		if (accountsPermission) {
			CONFIG.disconnected = 0;
			console.log(`eth_accounts permission successfully requested! set: ${CONFIG.disconnected}`);
			initializeConnection();
			return true;
		}
		} catch (error) {
		if (error.code === 4001) {
			console.log('Permissions needed to continue.');
			swal(
			{
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
			},
			function () {
				console.log('permissions retry...');
				reqConnect();
			}
			);
		} else {
			console.log(error);
		}
		return false;
		}
	}
	
	async function walletCheckProceed() {
		try {
		CONFIG.decimals = await tokenInst.methods.decimals().call();
		} catch (error) {
		console.log(error);
		}
	
		try {
		const account = CONFIG.wallet;
		balanceOf(CONFIG.wallet);
		} catch (error) {
		console.log('Metamask Locked');
		}
	}
	
	// Rest of our code...

	// Function to show popup and initiate countdown animation
	async function popupSuccess(type, currency, Txhash, title, amountEth, amountTokens, wallet, nonTxAction) {
		// Reset pop-up timer and styling
		CONFIG.popuptimer = 20;
		$("#popupNotify, #pNt").removeAttr("style");
		$('#pNt').css({ 'width': '100% !important' });
		$('#pNotifyX').click();
	
		// Set title and amount based on currency
		$('#popupTitle').empty().append(title);
		if (currency === 'GUNS') {
		$('#popupAmounts').empty().append(Number(amountTokens).toLocaleString() + ' ' + currency);
		} else if (currency === 'BNB') {
		$('#popupAmounts').empty().append(amountEth + ' ' + currency);
		} else {
		if (nonTxAction.length > 2) {
			$('#popupAmounts').empty().append(nonTxAction);
		}
		}
	
		// Set transaction hash link and display pop-up
		$('#popupTxhash').empty().append('<a href="' + CONFIG.etherScan + '/tx/' + Txhash + '" target="_blank">View Transaction on ETHERscan..</a>');
		$('#popupNotify').css('display', 'flex');
	
		// Initiate countdown animation
		CONFIG.resumeclock = CONFIG.popuptimer * 1000;
		$('#pNt').animate({ width: "0px" }, CONFIG.resumeclock, "swing", function () {
		$('#pNotifyX').click();
		});
	}
	
	// Function to decrement the pop-up timer
	function decrementSeconds() {
		if (CONFIG.popuptimer > 0) {
		CONFIG.popuptimer -= 1;
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
			CONFIG.popuptimer = (x / 280) * 10;
		}
		});
	
		popup.on("mouseleave", function (event) {
		const resumeclock = CONFIG.popuptimer * 1000;
		if (CONFIG.popuptimer > 0) {
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
		initializeConnection();
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
	


	// HELPERS
	//Tokens unrounded
	function fromWeiToFixed2_unrounded(amount) {//doesnt round up figures
		var amount = amount / Math.pow(10, CONFIG.decimals);
		var fixed = 2;
		var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
		return amount.toString().match(re)[0];
	}
	//ETH unrounded
	function toFixed8_unrounded(amount) {
		//accepts decimals
		var parsed_eth = parseFloat(amount);
		var fixed = 8;//8 is good for all esp RBW
		var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
		return parsed_eth.toString().match(re)[0];
	}
	function fromWeiToFixed5_unrounded(amount) {//doesnt round up figures
		//accepts wei only not decimals, also no need to string wei
		var raw_eth = web3.utils.fromWei(amount, "ether");
		var parsed_eth = parseFloat(raw_eth);
		var fixed = 5;//6 is good for all esp RBW
		var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
		return parsed_eth.toString().match(re)[0];
	}
	function fromWeiToFixed8_unrounded(amount) {//doesnt round up figures
		//accepts wei only not decimals, also no need to string wei
		var raw_eth = web3.utils.fromWei(amount, "ether");
		var parsed_eth = parseFloat(raw_eth);
		var fixed = 8;
		var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
		return parsed_eth.toString().match(re)[0];
	}
	function fromWeiToFixed8(amount){
		var raw_eth = web3.utils.fromWei(amount, "ether");
		var parsed_eth = parseFloat(raw_eth);
		var ethFriendly = parsed_eth.toFixed(8);
		return ethFriendly;
	}
	function fromWeiToFixed12(amount){
		var raw_eth = web3.utils.fromWei(amount, "ether");
		var parsed_eth = parseFloat(raw_eth);
		var ethFriendly = parsed_eth.toFixed(12);
		return ethFriendly;
	}
	function fromWeiToFixed5(amount){
		var raw_eth = web3.utils.fromWei(amount, "ether");
		var parsed_eth = parseFloat(raw_eth);
		var ethFriendly = parsed_eth.toFixed(5);
		return ethFriendly;
	}
}