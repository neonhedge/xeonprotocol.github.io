/*=========================================================================
    Import modules
==========================================================================*/
import { CONSTANTS, commaNumbering } from './constants.js';
import { initWeb3 } from './dapp-web3-utils.js';
import { checkAndCallPageTries } from './_wallet.js'

/*=========================================================================
    wallet module functions
==========================================================================*/

async function initializeConnection() {

	
	//before initializing, make sure global contract instances are set
	await initWeb3();

    const correctChain = await chainCheck();
	
    if (correctChain) {
        // waiting stance
        $('.wallets').css('display', 'none');
        $('.walletpur').css('display', 'inline-block');

        currentBlock();
        setInterval(() => currentBlock(), 40000);

        if (!(await unlockedWallet())) {
            reqConnect(provider);
        } else {
            walletCheckProceed();
            setInterval(() => walletCheckProceed(), 40000);
        }
    } else {
        //waiting stance
        $('.wallets').css('display', 'none');
        $('.network_switch').css('display', 'inline-block');
        switchNetwork(provider);

        swal(
            {
                title: 'Switch to Sepolia Testnet...',
                text: 'Failed to initialize Chain and Wallet. \nClick retry button to try again.',
                type: 'info',
                html: false,
                dangerMode: false,
                confirmButtonText: 'retry',
                cancelButtonText: 'cancel',
                showConfirmButton: true,
                showCancelButton: true,
                animation: 'Pop',
            }, function () {
                console.log('initialize retry...');
                switchNetwork(provider);
            });
    }
}

async function handleAccountChange(wallets, provider) {
    let wallet = wallets[0];
    wallet = wallets.length ? wallets[0] : null;
    if (wallets.length === 0) {
		
        console.log("Please connect to MetaMask.");
		$('.wallets').css('display', 'none');
        $('.wallet_connect').css('display', 'inline-block');
    } else if (wallets[0] !== window.currentAccount) {
        console.log("Wallet connected:", wallets);
        window.currentAccount = wallets[0];
        await initializeConnection(provider);
		await checkAndCallPageTries();
    }
}

async function handleNetworkChange(networkId, provider) {
    CONSTANTS.chainID = networkId;
    if (networkId !== CONSTANTS.network) {
        console.log("Reading chain:" + networkId + ", instead of, " + CONSTANTS.network);
        $(".wallets, .walletpur").css("display", "none");
        $(".network_switch").css("display", "inline-block");
    } else {
        console.log("Reading from mainnet: ", networkId);
		$(".wallets, .network_switch").css("display", "none");
        await initializeConnection(provider);
		await checkAndCallPageTries();
    }
	
	await checkAndCallPageTries();
}
// Listeners
ethereum.on("connect", (chainID) => {
	CONSTANTS.chainID = chainID.chainId;
	console.log("Connected to chain:", CONSTANTS.chainID);
});

ethereum.on("accountsChanged", (accounts) => {
	console.log("Account changed:", accounts);
	handleAccountChange(accounts, provider);
});

ethereum.on("chainChanged", (networkId) => {
	console.log("Network changed:", networkId);
	handleNetworkChange(networkId, provider);
	window.location.reload();
});

// Other functions follow...

async function unlockedWallet() {
    const accounts = await provider.listAccounts();
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

async function balanceOf(account) {
    try {
        const result = await neonInstance.balanceOf(account);
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
                animation: 'Pop',
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
            animation: 'Pop',
            text: `> Wallet Locked. \nPlease Unlock Wallet.`,
        });
    }
}

async function currentBlock() {
    try {
        const block = await provider.getBlockNumber();
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
        const chainID = await provider.getNetwork();
        const networkId = CONSTANTS.network;

        // Returned as HEX from getChainId so Convert to string	 
        // const chainIDString = '0x' + chainID.toString(16);

        console.log("Chain ID:", chainID.chainId);
        console.log("Network ID:", networkId);

		const chainIDString = '0x' + (chainID.chainId).toString(16);
		//console.log(chainIDString)

        if (networkId === chainIDString) {
            console.log("correct chain: ", chainIDString);
            $('.wallets').css('display', 'none');
            $('.waiting_init').css('display', 'inline-block');
            return true;
        } else {
            console.log("wrong chain: ", chainIDString);
            $('.wallets').css('display', 'none');
            $('.network_switch').css('display', 'inline-block');
            return false;
        }
    } catch (error) {
        console.error('chain ID retrieval failed:', error);
        return false;
    }
}


async function switchNetwork(provider) {
    if (window.ethereum) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }] // not hex
            });
            // success in switch, reinitialize
			console.log("Connected to chain:", CONSTANTS.chainID);
            console.log('Successfully switched to the Sepolia Testnet');
            await initializeConnection();
            return true;
        } catch (error) {
            // error
            console.log('Error switching to Sepolia Testnet:', error);
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0xaa36a7', // using the Sepolia testnet chain ID
                                chainName: 'Sepolia Testnet',
                                nativeCurrency: {
                                    name: 'Sepolia',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                blockExplorerUrls: [CONSTANTS.etherScan],
                                rpcUrls: ['https://sepolia.infura.io/v3/'] // using the Sepolia testnet RPC URL
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
                        text: 'Try again to switch to the Sepolia Testnet.',
                        showConfirmButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Switch',
                        cancelButtonText: 'Cancel',
                        animation: 'Pop',
                    }, function () {
                        console.log('initialize retry...');
                        switchNetwork(provider);
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
                    text: 'Please switch to the Sepolia Testnet.',
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Switch',
                    cancelButtonText: 'Cancel',
                    animation: 'Pop',
                }, function () {
                    console.log('initialize retry...');
                    switchNetwork(provider);
                });
            }
            return false;
        }
    } else {
        swal({
            title: 'Web3 Provider Missing!',
            type: 'error',
            confirmButtonColor: '#F27474',
            animation: 'Pop',
            text: 'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html',
        });
    }
}

async function reqConnect() {
    try {
		const accounts = await provider.listAccounts();

		if (window.ethereum) {
			// Request account access if needed
			await window.ethereum.request({ method: 'eth_requestAccounts' });
			
			// Accounts now exposed
			const accounts = await window.ethereum.request({ method: 'eth_accounts' });
			console.log('Wallet unlocked. Selected account:', accounts[0]);
	  
		} else {
			console.error('MetaMask is not installed.');
		}
    } catch (error) {
        console.log('connection error code: ' + error.code)
        if (error.code === 4001) { // 4001 indicates that the user rejected the request
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
                animation: 'Pop',
            }, function () {
                console.log('permissions retry...');
                reqConnect();
            });
        } else if (error.code === 100) { // 100 indicates that the user has not made a request yet
            console.log('Already requested permissions.');
        }
    }
    return false;
}

async function walletCheckProceed() {
    try {
        CONSTANTS.decimals = await neonInstance.decimals();
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
        const accounts = await provider.listAccounts();
        balanceOf(accounts[0]);
    } catch (error) {
        console.log('Metamask Locked');
    }
}

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


	export { initializeConnection, unlockedWallet, reqConnect, popupSuccess };
