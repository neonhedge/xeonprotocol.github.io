MyGlobals = {"wallet":"0x61418293d8649Cc9066cb103028710253184CE77"};
MyGlobals.clubaddress = '0x569Da12383141d95162dd3C9c83A4Eb7a22A9174';
MyGlobals.Mode = 0;

MyGlobals.clubABI = [ { "inputs": [ { "internalType": "address payable", "name": "_tokenAdd", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "project", "type": "address" }, { "indexed": true, "internalType": "address", "name": "funder", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "funded", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "owed", "type": "uint256" } ], "name": "LiquidityFunded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "project", "type": "address" }, { "indexed": true, "internalType": "address", "name": "receiver", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "balance", "type": "uint256" } ], "name": "RepaidWithLove", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "project", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "funded", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "due", "type": "uint256" } ], "name": "projectFunded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "project", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "loaned", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "due", "type": "uint256" } ], "name": "projectLoaned", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "project", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "repayer", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "what", "type": "uint256" } ], "name": "projectRepaid", "type": "event" }, { "inputs": [], "name": "_fundingRate", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_managerWallet", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_memebankVaultFXD", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_memebankVaultLP", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_minHoldings", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_minimumFunding", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalCurrentAccount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalDividentsAvailable", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalFundingFromVault", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalFundingPaidout", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalFundingPaidoutWallets", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalFundingRepaid", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "_totalFundingRepaidTerm", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalFundingRepaidWallets", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "_totalFundingTerm", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "_totalLoanRepaidTerm", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalLoansPaidout", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalLoansRepaid", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalLoansRepaidWallets", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "_totalLoansTerm", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalProceedsWithdrawn", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_address", "type": "address" } ], "name": "bookmarkProject", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "depositFundingCapital", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" }, { "internalType": "uint256", "name": "amountFunded", "type": "uint256" } ], "name": "fundProjectX", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "getAllFundingRequests", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getAllLoanRequests", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" } ], "name": "getBankFundingProfile", "outputs": [ { "internalType": "uint256", "name": "_due", "type": "uint256" }, { "internalType": "uint256", "name": "_repaid", "type": "uint256" }, { "internalType": "uint256", "name": "_time", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getClubFundedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getClubLoanedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCrowdFundedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCrowdLoanedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getFundedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "timestampStart", "type": "uint256" }, { "internalType": "uint256", "name": "timestampTo", "type": "uint256" } ], "name": "getFundingForTerm", "outputs": [ { "internalType": "uint256", "name": "sum", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" } ], "name": "getLaunchAddrs", "outputs": [ { "internalType": "address", "name": "pair", "type": "address" }, { "internalType": "address", "name": "router", "type": "address" }, { "internalType": "address", "name": "factory", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" } ], "name": "getLaunchAmnts", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "due", "type": "uint256" }, { "internalType": "uint256", "name": "repaid", "type": "uint256" }, { "internalType": "uint256", "name": "fundingTime", "type": "uint256" }, { "internalType": "uint256", "name": "managerstamped", "type": "uint256" }, { "internalType": "uint256", "name": "tokensAdded", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "requestID", "type": "uint256" } ], "name": "getLoanAmnts", "outputs": [ { "internalType": "uint256", "name": "fundedTime", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "_due", "type": "uint256" }, { "internalType": "uint256", "name": "_repaid", "type": "uint256" }, { "internalType": "uint256", "name": "collateral", "type": "uint256" }, { "internalType": "address", "name": "collateralAddy", "type": "address" }, { "internalType": "address", "name": "receiverWallet", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getLoanedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_wallet", "type": "address" } ], "name": "getMyFundedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_wallet", "type": "address" } ], "name": "getMyLoansProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "loanID", "type": "uint256" } ], "name": "getProfileAddy", "outputs": [ { "internalType": "address", "name": "projectAddr", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" } ], "name": "getProfileILL", "outputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "website", "type": "string" }, { "internalType": "string", "name": "telegram", "type": "string" }, { "internalType": "string", "name": "url", "type": "string" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "funder", "type": "uint256" }, { "internalType": "uint256", "name": "requestState", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "loanID", "type": "uint256" } ], "name": "getProfileOPL", "outputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "website", "type": "string" }, { "internalType": "string", "name": "telegram", "type": "string" }, { "internalType": "string", "name": "url", "type": "string" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "requestState", "type": "uint256" }, { "internalType": "uint256", "name": "managerstamped", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" } ], "name": "getProjectsLoanHistory", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "timestampStart", "type": "uint256" }, { "internalType": "uint256", "name": "timestampTo", "type": "uint256" } ], "name": "getRepaidForTerm", "outputs": [ { "internalType": "uint256", "name": "sum", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" } ], "name": "getWalletFundingProfile", "outputs": [ { "internalType": "uint256", "name": "_due", "type": "uint256" }, { "internalType": "uint256", "name": "_repaid", "type": "uint256" }, { "internalType": "uint256", "name": "_time", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "requestID", "type": "uint256" } ], "name": "getWalletLoanProfile", "outputs": [ { "internalType": "uint256", "name": "_due", "type": "uint256" }, { "internalType": "uint256", "name": "_repaid", "type": "uint256" }, { "internalType": "uint256", "name": "_time", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_address", "type": "address" } ], "name": "getbookmarkOnProject", "outputs": [ { "internalType": "bool", "name": "marking", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "globalLoanCount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" }, { "internalType": "uint256", "name": "requestID", "type": "uint256" } ], "name": "loanProjectX", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "_projectAddr", "type": "address" }, { "internalType": "address", "name": "_liquidityAddr", "type": "address" } ], "name": "mapPermissions", "outputs": [ { "internalType": "bool", "name": "pass", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "repayFundingCapital", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" } ], "name": "repayProjectFunding", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" }, { "internalType": "uint256", "name": "request", "type": "uint256" } ], "name": "repayProjectLoan", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" }, { "internalType": "address", "name": "router", "type": "address" }, { "internalType": "address", "name": "factory", "type": "address" }, { "internalType": "uint256", "name": "fundingtype", "type": "uint256" }, { "internalType": "uint256", "name": "amountETH", "type": "uint256" }, { "internalType": "uint256", "name": "tokens", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "website", "type": "string" }, { "internalType": "string", "name": "telegram", "type": "string" }, { "internalType": "string", "name": "icon_128px_url", "type": "string" } ], "name": "requestFunding", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" }, { "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "address", "name": "LPaddress", "type": "address" }, { "internalType": "uint256", "name": "fundingtype", "type": "uint256" }, { "internalType": "uint256", "name": "amountETH", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "website", "type": "string" }, { "internalType": "string", "name": "telegram", "type": "string" }, { "internalType": "string", "name": "icon_128px_url", "type": "string" } ], "name": "requestLoan", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "sendDividents", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "_vaultFixedTerm", "type": "address" } ], "name": "setFixedTermVault", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_rate", "type": "uint256" } ], "name": "setLiquidityFundRate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "_vaultLiquidity", "type": "address" } ], "name": "setLiquidityVault", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_ethWEI", "type": "uint256" } ], "name": "setMinFunding", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_minTokens", "type": "uint256" } ], "name": "setMinHoldings", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_wallet", "type": "address" } ], "name": "setmanager", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" }, { "internalType": "bool", "name": "stamp", "type": "bool" }, { "internalType": "bool", "name": "poach", "type": "bool" } ], "name": "stampFundingRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" }, { "internalType": "uint256", "name": "request", "type": "uint256" }, { "internalType": "bool", "name": "stamp", "type": "bool" }, { "internalType": "bool", "name": "poach", "type": "bool" } ], "name": "stampLoanRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "tokenAddress", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "withdrawProceeds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" } ];
//Initialize B
try{
	if (typeof window.ethereum == 'undefined') {
		swal({title: "Hold on!",type: "error",confirmButtonColor: "#F27474",text: "metamask missing, so is the full experience now..."});
	}else if (typeof window.ethereum !== 'undefined') {
		//Metamask on BROWSER, NOW SET WEB3 PROVIDER
		window.web3 = new Web3(window.ethereum);
		//SET INSTANCE
		var tokenAddress = MyGlobals.clubaddress;		
		var erc20Abi = MyGlobals.clubABI;
		window.clubInst = new window.web3.eth.Contract(erc20Abi, tokenAddress);
		
	} else {
		console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live");
		// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
		App.web3 = new Web3( new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
	}
}catch(error) {}

// Calls
$(document).ready(async function(){
	//proceed
	var unlockState = await unlockedWallet();
	if (unlockState === true){
		callPageTries();
		//repeat, with async and promise so it dont overspill
		const setbankIntervalAsync = (fn, ms) => {
			fn().then(() => {
				setTimeout(() => setbankIntervalAsync(fn, ms), ms);
			});
		};
		setbankIntervalAsync(async () => {
			callPageTries();
		}, 30000);
		
	}else{
		reqConnect();
	}	
});

/*
PAGE'S CUSTOM TRIES: each page's callPageTries()
=========================================================================*/
async function callPageTries(){
	//we have data modes
	//default mode is the project card data fetch timeouts
	//you can also set in future:
	//details page
	//perfomance page
	//loans stats page
	//credit stats page
	//social stream
	//...all the navs on the side panel
	var queryString = window.location.search;
	var urlParams = new URLSearchParams(queryString);
	var address = urlParams.get('address');
	var curMode = urlParams.get('mode');
	if(curMode.length > 0){
		var curMode = parseInt(curMode);
	}
	if(curMode == 0){
		//click correct tab
		$("#projectSummary").click();
	}
	if(curMode == 1){
		//click correct tab
		$("#illoanSummary").click();
	}
	if(curMode == 2){
		//click correct tab
		$("#oploanSummary").click();
	}
	//now fetch main page data
	if(MyGlobals.Mode == 0){
		await fetchSummary(address);
	}
	if(MyGlobals.Mode == 1){
		await fetchILLoan(address);
	}
	if(MyGlobals.Mode == 2){
		//get list of loans under project
		var loansArray = await clubInst.methods.getProjectsLoanHistory(address).call();
		//use one of the applications as profile head
		var lastLoan = loansArray.length - 1;
		if(loansArray.length > 0){
			//fetch header, use the most recent version submitted
			var lastLoanID = loansArray[lastLoan];
			$('#projectsTimeline').empty();
			await fetchOPHeader(lastLoanID);
			//for each element in array
			let array = loansArray;
			for (const loanID of array){
				await fetchOPLoan(loanID);
			}
		}else {//no projects
			noProjectsSwal();
		}
	}
}
async function fetchILLoan(address){
    try{
		var projectItem = await clubInst.methods.getProfileILL(address).call();
		var projectAmnts = await clubInst.methods.getLaunchAmnts(address).call();
		var fundingRate = await clubInst.methods._fundingRate().call();
		var fundingRate = parseFloat(fundingRate);
		//name
		var name = projectItem[0];
		//owner
		var owner = projectItem[4];
        var first = owner.substring(0, 6);//get first 5 chars
        var last = owner.slice(owner.length - 3);//get last 5
        var trancatedOwner = first+'...'+last;
		//amount
		var amount = projectAmnts[0];
		var amount = fromWeiToFixed5(amount);
		var amount = parseFloat(amount);
		//due
		var due = projectAmnts[1];
		var due = fromWeiToFixed5(due);
		var due = parseFloat(due);
		var target = (amount * fundingRate) / 100;
		//repaid
		var repaid = projectAmnts[2];
		var repaid = fromWeiToFixed5(repaid);
		var repaid = parseFloat(repaid);
		//request state
		var requestState = parseFloat(projectItem[6]);
		//logourl
		var logourl = projectItem[3];
		//twitter - for now website is twitter link, depracate website requirement
		var twitterURL = projectItem[1];
		//telegram
		var telegramURL = projectItem[2];
		//raise and time stamped
		var raised = due;
		var fundedtime = parseFloat(projectAmnts[3]);
		var timestamp = parseFloat(projectAmnts[4]);
		//progress bar 
		var length = (due / target) * 100;
		if(length < 0){ //correct
			var length = 0;
		}else if(length > 100){//upper limit
			var length = 100;
		}
		//bookmark check
		var bookmark = 'saveProject("'+address+'")';
		var unbookmark = 'discardProject("'+address+'")';
		var bookmarkState = await clubInst.methods.getbookmarkOnProject(address).call({from: MyGlobals.wallet});
		if(!bookmarkState){
			var action_btn = "<span id='_leaseTakeBtn' class='portfolioBtn' style='display: inline-block;' onclick='"+bookmark+"'><img src='imgs/bookmark_.png' width='18px'/></span>";
		}
		if(bookmarkState){
			var action_btn = "<span id='_leaseTakeBtn' class='portfolioBtn' style='display: inline-block;' onclick='"+unbookmark+"'><img src='imgs/unbookmark_.png' width='18px'/></span>";
		}
		//display openraise
		if(due < target){//need funding
			var start = await prepareTimestamp(timestamp);
			//prepare the project card
			var projectCard = '<div class="projectCard"><div class="projectLogoLeft"  style="background-image:url(' + logourl + ')"></div><div class="projectTitleRight"><div class="projectName">' + name + '</div><div class="raise_S_tab _socials"><a class="social_links" href="' + twitterURL + '" target="_blank" alt="TWT" title="Go to Twitter page"><img src="imgs/twitter.svg" width="32px"/></a><a class="social_links" href="https://' + telegramURL + '" target="_blank" alt="TG" title="Go to Telegram group"><img src="imgs/telegram.svg" width="32px"/></a><a class="social_links" href="https://etherscan.io/address/' + address + '" target="_blank" alt="SC" title="Go to Etherscan"><img src="imgs/etherscan.svg" width="32px"/></a></div>' + action_btn + '</div><h5 title="this project is requesting a Initial Liquidity loan, do you want to help launch it? loan it for 20% interest">Initial Liquidity Loan:</h5><div class="raiseSummary raisemark_ill_inprogress"><span class="status-dot inprogress"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Raise Live</span></span><div class="kickoff">approved: ' + start+ ' </div><div class="projectRaiseTarget">' + amount + ' ETH</div><div class="mbcard_detail rb_detail"><div class="parent_meter"><div id="meter_guage" style="width:' + length + '%;"></div><span class="measure">' + length +'%</span></div></div></div></div>';
			
			$('#projectsTimeline').empty().append(projectCard);
		}else{
			//dont display, already funded
		}
		//display repayments
		if(due >= target){//repaying funding
			var start = await prepareTimestamp(fundedtime);
			//prepare the project card
			var projectCard = '<div class="projectCard"><div class="projectLogoLeft"  style="background-image:url(' + logourl + ')"></div><div class="projectTitleRight"><div class="projectName">' + name + '</div><div class="raise_S_tab _socials"><a class="social_links" href="' + twitterURL + '" target="_blank" alt="TWT" title="Go to Twitter page"><img src="imgs/twitter.svg" width="32px"/></a><a class="social_links" href="https://' + telegramURL + '" target="_blank" alt="TG" title="Go to Telegram group"><img src="imgs/telegram.svg" width="32px"/></a><a class="social_links" href="https://etherscan.io/address/' + address + '" target="_blank" alt="SC" title="Go to Etherscan"><img src="imgs/etherscan.svg" width="32px"/></a></div>' + action_btn + '</div><h5 title="this project requested a Initial Liquidity loan, its repaying it with 20% interest">Repaying:</h5><div class="raiseSummary raisemark_ill_repayments"><span class="status-dot inrepaying"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Repaying</span></span><div class="kickoff">approved: ' + fundedtime+ ' </div><div class="projectRaiseTarget">' + raised + ' ETH</div><div class="mbcard_detail rb_detail"><div class="parent_meter"><div id="meter_guage" style="width:' + length + '%;"></div><span class="measure">' + length +'%</span></div></div></div></div>';
		}else{
			//dont display, finished repaying
		}
		//display repaid in full
		if(repaid >= due){//repaid
			var start = await prepareTimestamp(fundedtime);
			//prepare the project card
			var projectCard = '<div class="projectCard"><div class="projectLogoLeft"  style="background-image:url(' + logourl + ')"></div><div class="projectTitleRight"><div class="projectName">' + name + '</div><div class="raise_S_tab _socials"><a class="social_links" href="' + twitterURL + '" target="_blank" alt="TWT" title="Go to Twitter page"><img src="imgs/twitter.svg" width="32px"/></a><a class="social_links" href="https://' + telegramURL + '" target="_blank" alt="TG" title="Go to Telegram group"><img src="imgs/telegram.svg" width="32px"/></a><a class="social_links" href="https://etherscan.io/address/' + address + '" target="_blank" alt="SC" title="Go to Etherscan"><img src="imgs/etherscan.svg" width="32px"/></a></div>' + action_btn + '</div><h5 title="this project requested a Initial Liquidity loan and repaid it fully">Full Repayment:</h5><div class="raiseSummary raisemark_ill_repaid"><span class="status-dot ended"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Full Repayment</span></span><div class="kickoff">approved: ' + fundedtime+ ' </div><div class="projectRaiseTarget">' + raised + ' ETH</div><div class="mbcard_detail rb_detail"><div class="parent_meter"><div id="meter_guage" style="width:' + length + '%;"></div><span class="measure">' + length +'%</span></div></div></div></div>';
		}else{
			//dont display, finished repaying
		}
		//display awaiting approval
		if(due == 0 && requestState == 0){
			var projectCard = '<div class="projectCard"><div class="projectLogoLeft"></div><div class="projectTitleRight"><div class="projectName">!! unknown project !! </br>Do not loan such projects.</br>Wait for approved projects only.</div><div class="raise_S_tab _socials"><a class="social_links" href="" target="_blank" alt="TWT" title="Go to Twitter page"><img src="imgs/twitter.svg" width="32px"/></a><a class="social_links" href="" target="_blank" alt="TG" title="Go to Telegram group"><img src="imgs/telegram.svg" width="32px"/></a><a class="social_links" href="https://etherscan.io/address/' + address + '" target="_blank" alt="SC" title="Go to Etherscan"><img src="imgs/etherscan.svg" width="32px"/></a></div>' + action_btn + '</div><h5 title="this project is still submitting an application. their application hasnt been vetted, approved or rejected yet.">Application stage:</h5><div class="raiseSummary raisemark_ill_application"><span class="status-dot ended"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Unapproved</span></span><div class="kickoff">waiting approval..</div><div class="projectRaiseTarget">' + amount + ' ETH</div></div></div>';
			$('#projectsTimeline').empty().append(projectCard);
		}else{
			//dont display, finished repaying
		}
	}catch(error) {
		console.log(error);
	}
}

async function fetchOPLoan(loanID){
    try{
		var loanItem = await clubInst.methods.getProfileOPL(loanID).call();
		var projectAmnts = await clubInst.methods.getLoanAmnts(loanID).call();
		var fundingRate = await clubInst.methods._fundingRate().call();
		var fundingRate = parseFloat(fundingRate);
		
		//amount
		var amount = projectAmnts[1];
		var amount = fromWeiToFixed5(amount);
		var amount = parseFloat(amount);
		//due
		var due = projectAmnts[2];
		var due = fromWeiToFixed5(due);
		var due = parseFloat(due);
		var target = (amount * fundingRate) / 100;
		//repaid
		var repaid = projectAmnts[3];
		var repaid = fromWeiToFixed5(repaid);
		var repaid = parseFloat(repaid);
		//request state
		var requestState = parseFloat(loanItem[5]);
		//raise and time stamped
		var raised = due;
		var timestamp = parseFloat(loanItem[6]);
		var fundedtime = parseFloat(projectAmnts[0]);
		//progress bar 
		var length = (due / target) * 100;
		if(length < 0){ //correct
			var length = 0;
		}else if(length > 100){//upper limit
			var length = 100;
		}
		//bookmark check
		var bookmark = 'saveProject("'+address+'")';
		var unbookmark = 'discardProject("'+address+'")';
		var bookmarkState = await clubInst.methods.getbookmarkOnProject(address).call({from: MyGlobals.wallet});
		if(!bookmarkState){
			var action_btn = "<span id='_leaseTakeBtn' class='portfolioBtn' style='display: inline-block;' onclick='"+bookmark+"'><img src='imgs/bookmark_.png' width='18px'/></span>";
		}
		if(bookmarkState){
			var action_btn = "<span id='_leaseTakeBtn' class='portfolioBtn' style='display: inline-block;' onclick='"+unbookmark+"'><img src='imgs/unbookmark_.png' width='18px'/></span>";
		}
		//funding open
		if(due < target){//need funding
			var start = await prepareTimestamp(timestamp);
			//prepare the project card
			var projectCard = '<div class="projectCard"><h5 title="this project is requesting an loan to help its operations, do you want to help fund it? loan it for 20% interest">Crypto Loan:</h5><div class="raiseSummary raisemark_opl_inprogress"><span class="status-dot inprogress"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Raise Live</span></span><div class="kickoff">approved: ' + start+ ' </div><div class="projectRaiseTarget">' + amount + ' ETH</div><div class="mbcard_detail rb_detail"><div class="parent_meter"><div id="meter_guage" style="width:' + length + '%;"></div><span class="measure">' + length +'%</span></div></div></div>';
		}
		//display repayments
		if(due >= target){//repaying funding
			var fundedtime = await prepareTimestamp(timestamp);
			//prepare the project card
			var projectCard = '<div class="projectCard"><h5 title="this project is requested a short term loan to finance operations, repaying with 20% interest">Repaying:</h5><div class="raiseSummary raisemark_opl_repayments"><span class="status-dot inrepaying"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Raise Live</span></span><div class="kickoff">funded: ' + fundedtime+ ' </div><div class="projectRaiseTarget">' + raised + ' ETH</div><div class="mbcard_detail rb_detail"><div class="parent_meter"><div id="meter_guage" style="width:' + length + '%;"></div><span class="measure">' + length +'%</span></div></div></div>';
		}
		//display repaid in full
		if(repaid >= due){//repaid
			var start = await prepareTimestamp(timestamp);
			//prepare the project card
			var projectCard = '<div class="projectCard"><h5 title="this project is requested a short term loan to finance operations, and repaid fully with 20% interest">Full Repayment:</h5><div class="raiseSummary raisemark_opl_repaid"><span class="status-dot ended"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Raise Live</span></span><div class="kickoff">funded: ' + fundedtime+ ' </div><div class="projectRaiseTarget">' + raised + ' ETH</div><div class="mbcard_detail rb_detail"><div class="parent_meter"><div id="meter_guage" style="width:' + length + '%;"></div><span class="measure">' + length +'%</span></div></div></div>';
		}
		//display nav 1 - awaiting approval
		if(due == 0 && requestState == 0){
			var projectCard = '<div class="projectCard"><h5 title="this project is still submitting an application. their application hasnt been vetted, approved or rejected yet.">Application stage:</h5><div class="raiseSummary raisemark_opl_application"><span class="status-dot ended"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Unapproved</span></span><div class="kickoff">waiting approval..</div><div class="projectRaiseTarget">' + amount + ' ETH</div></div></div>';
		}

		$('#projectLoansHeaderCont').append(projectCard);
	}catch(error) {
		console.log(error);
	}
}
async function fetchSummary(address){
    try{
		var projectItem = await clubInst.methods.getProfileILL(address).call();
		var projectAmnts = await clubInst.methods.getLaunchAmnts(address).call();
		var projectAddrs = await clubInst.methods.getLaunchAddrs(address).call();
		var fundingRate = await clubInst.methods._fundingRate().call();
		var fundingRate = parseFloat(fundingRate);
		//name
		var name = projectItem[0];
		//owner
		var owner = projectItem[4];
        var first = owner.substring(0, 6);//get first 5 chars
        var last = owner.slice(owner.length - 3);//get last 5
        var trancatedOwner = first+'...'+last;
		//fundtype
		var fundtypeText;
		var fundtype = parseInt(projectItem[5]);
		if(fundtype == 1){fundtypeText = 'Club';}
		if(fundtype == 2){fundtypeText = 'Crowd fund';}
		//request state
		var requestState = parseFloat(projectItem[6]);
		if(requestState == 0){requestState = 'Pending';}
		if(requestState == 1){requestState = 'Approved';}
		if(requestState == 2){requestState = 'Rejected';}
		//stamp time 
		var stampInt = parseFloat(projectAmnts[4]);
		var stampedAt = await prepareTimestamp(stampInt)
		//funded time 
		var fundedInt = parseFloat(projectAmnts[3]);
		var fundedAt = await prepareTimestamp(fundedInt)
		//amount
		var amount = projectAmnts[0];
		var amount = fromWeiToFixed5(amount);
		var amount = parseFloat(amount);
		//due
		var due = projectAmnts[1];
		var due = fromWeiToFixed5(due);
		var due = parseFloat(due);
		var target = (amount * fundingRate) / 100;
		//repaid
		var repaid = projectAmnts[2];
		var repaid = fromWeiToFixed5(repaid);
		var repaid = parseFloat(repaid);
		//tokens added
		var tokensAdded = projectAmnts[5];
		var tokensAdded = (tokensAdded / Math.pow(10, MyLibrary.decimals)).toFixed(2);
		var tokensAdded = parseFloat(tokensAdded);
		//pair address
		var pairaddr = projectAddrs[0];
		var routerAddr = projectAddrs[1];
		var factoryaddr = projectAddrs[2];
		//logourl
		var logourl = projectItem[3];
		//twitter - for now website is twitter link, depracate website requirement
		var twitterURL = projectItem[1];
		//telegram
		var telegramURL = projectItem[2];
		//progress bar 
		var length = (due / target) * 100;
		if(length < 0){ //correct
			var length = 0;
		}else if(length > 100){//upper limit
			var length = 100;
		}
		//bookmark check
		var bookmark = 'saveProject("'+address+'")';
		var unbookmark = 'discardProject("'+address+'")';
		var bookmarkState = await clubInst.methods.getbookmarkOnProject(address).call({from: MyGlobals.wallet});
		if(!bookmarkState){
			var action_btn = "<div class='raise_S_tab _bookmarkjump' onclick='"+bookmark+"'><img src='imgs/bookmark_.png' width='18px'/></div>";
		}
		if(bookmarkState){
			var action_btn = "<div class='raise_S_tab _bookmarkjump' onclick='"+unbookmark+"'><img src='imgs/unbookmark_.png' width='18px'/></div>";
		}
		var projectCard = '<div class="projectCard"><div class="projectLogoLeft"  style="background-image:url(' + logourl + ')"></div><div class="projectTitleRight"><div class="projectName">' + name + '</div><div class="raise_S_tab _socials"><a class="social_links" href="' + twitterURL + '" target="_blank" alt="TWT" title="Go to Twitter page"><img src="imgs/twitter.svg" width="32px"/></a><a class="social_links" href="https://' + telegramURL + '" target="_blank" alt="TG" title="Go to Telegram group"><img src="imgs/telegram.svg" width="32px"/></a><a class="social_links" href="https://etherscan.io/address/' + address + '" target="_blank" alt="SC" title="Go to Etherscan"><img src="imgs/etherscan.svg" width="32px"/></a></div>' + action_btn + '</div><h5>Project Info:</h5><div class="raiseSummary"><div class="projectInfo"><span class="infoTitle">Owner: </span><span class="infoData"><a href="https://etherscan.io/address/' + owner + '" target="_blank">' + trancatedOwner + '</a></span></div><div class="projectInfo"><span class="infoTitle">Fund Type: </span><span class="infoData">' + fundtypeText + '</span></div><div class="projectInfo"><span class="infoTitle">Fund From: </span><span class="infoData">' + requestState + '</span></div><div class="projectInfo"><span class="infoTitle">Admin Stamp: </span><span class="infoData">' + stampedAt + '</span></div><div class="projectInfo"><span class="infoTitle">Funded Time: </span><span class="infoData">' + fundedAt + '</span></div><div class="projectInfo"><span class="infoTitle">Loan Amount: </span><span class="infoData">' + amount + ' ETH</span></div><div class="projectInfo"><span class="infoTitle">Repayment Due: </span><span class="infoData">' + due + ' ETH</span></div><div class="projectInfo"><span class="infoTitle">Repaid Total: </span><span class="infoData">' + repaid + ' ETH</span></div></br><div class="projectInfo"><span class="infoTitle">Tokens Added: </span><span class="infoData">' + tokensAdded + ' Tokens</span></div><div class="projectInfo"><span class="infoTitle">Pair Address: </span><span class="infoData">' + pairaddr + '</span></div><div class="projectInfo"><span class="infoTitle">Router Address: </span><span class="infoData">' + routerAddr + '</span></div><div class="projectInfo"><span class="infoTitle">Factory Address: </span><span class="infoData">' + factoryaddr + '</span></div></div></div>';
		$('#projectsTimeline').empty().append(projectCard);
		
	}catch(error) {
		console.log(error);
	}
}
async function fetchOPHeader(loanID){
    var bookmark = 'saveProject("'+loanID+'")';
    try{
		var projectItem = await clubInst.methods.getProfileOPL(loanID).call();
		//name
		var name = projectItem[0];
		//owner
		var owner = projectItem[4];
        var first = owner.substring(0, 6);//get first 5 chars
        var last = owner.slice(owner.length - 3);//get last 5
        var trancatedOwner = first+'...'+last;
		//logourl
		var logourl = projectItem[3];
		//twitter - for now website is twitter link, depracate website requirement
		var twitterURL = projectItem[1];
		//telegram
		var telegramURL = projectItem[2];
		//bookmark check
		var bookmark = 'saveProject("'+address+'")';
		var unbookmark = 'discardProject("'+address+'")';
		var bookmarkState = await clubInst.methods.getbookmarkOnProject(address).call({from: MyGlobals.wallet});
		if(!bookmarkState){
			var action_btn = "<div class='raise_S_tab _bookmarkjump' onclick='"+bookmark+"'><img src='imgs/bookmark_.png' width='18px'/></div>";
		}
		if(bookmarkState){
			var action_btn = "<div class='raise_S_tab _bookmarkjump' onclick='"+unbookmark+"'><img src='imgs/unbookmark_.png' width='18px'/></div>";
		}
		//prepare the project card
		var projectCard = '<div class="projectCard"><div class="projectLogoLeft"  style="background-image:url(' + logourl + ')"></div><div class="projectTitleRight"><div class="projectName">' + name + '</div><div class="raise_S_tab _socials"><a class="social_links" href="' + twitterURL + '" target="_blank" alt="TWT" title="Go to Twitter page"><img src="imgs/twitter.svg" width="32px"/></a><a class="social_links" href="https://' + telegramURL + '" target="_blank" alt="TG" title="Go to Telegram group"><img src="imgs/telegram.svg" width="32px"/></a><a class="social_links" href="https://etherscan.io/address/' + address + '" target="_blank" alt="SC" title="Go to Etherscan"><img src="imgs/etherscan.svg" width="32px"/></a></div>' + action_btn + '</div><h5 title="past loans taken by project">Crypto Loan History:</h5><div id="projectLoansHeaderCont" class="raiseSummary raisemark_opl_inprogress">---</div></div>';
		
		$('#projectsTimeline').empty().append(projectCard);
		
	}catch(error) {
		console.log(error);
	}
}
async function prepareTimestamp(timeprint){
	//timestamps
	if(timeprint > 0){
		var start = new Date(timeprint * 1000).toLocaleString();
	}else{
		var start = '0/0/0000, 00:00:00';
	}
	return start;
}
async function noProjectsSwal(){
	$('#sl_leases').empty().append('<span id="sl_refreshing" class="sl_refresh">nothing found...</span>');
	//proceed to swal
	var privatize = '<div class="clms_case">nothing to find here...</div>';
	swal({
			title: "Not Found",
			text: privatize,
			type: "info",  //var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];
			html: true,
					dangerMode: true,
					confirmButtonText: "Okay",
					confirmButtonColor: "#d6188a", //site pink
			showConfirmButton: true,
			showCancelButton: false,
			timer: 4000,
			animation: "slide-from-top"
	},function(){//on confirm click
	
	});//confirm swal close
}
async function saveProject(address){
	//estimate gasLimit
	var encodedData = clubInst.methods.bookmarkProject(address).encodeABI();
	const estimateGas = await web3.eth.estimateGas({
		data: encodedData,
		from: MyGlobals.wallet,
		to: MyGlobals.clubaddress
	});
	//estimate the gasPrice
	const gasPrice = await web3.eth.getGasPrice(); 
	//transaction
	clubInst.methods.bookmarkProject(address).send({
		from: MyGlobals.wallet,
   		gasPrice: gasPrice,
		gasLimit: estimateGas,
	})
	//send
	.on('receipt', function(receipt){
        if(receipt.status == true){//1 also matches true
            console.log('Mined', receipt);//console.log('Transaction Success. Receipt status: '+receipt.status);console.log('Tx_hash: '+receipt.transactionHash);
        }
        else{
            console.log('Transaction Failed Receipt status: '+receipt.status);
            swal({title: "Failed.",type: "error",allowOutsideClick: true,confirmButtonColor: "#F27474",text: "Transaction Failed Receipt status: "+receipt.status});
        }
	})
	.on('confirmation', async function(confirmationNumber, receipt){
		console.log('Mined', receipt);
		console.log('confirmation: '+confirmationNumber);
		if (confirmationNumber === 2) {
			console.log('bookmarked: '+receipt.events.bookmarked.returnValues[1]);
			var state = receipt.events.bookmarked.returnValues[2];
			var project = receipt.events.bookmarked.returnValues[1];
			var first = project.substring(0, 6);//get first 5 chars
			var last = project.slice(project.length - 3);//get last 5
			var trancatedProj = first+'...'+last;

			var tx_hash = receipt.transactionHash;
			var outputCurrency = '';//or GUN - currency focus is outcome of Tx
			var type = 'success';//or error
			var wallet = '';
			var receivedTokens;
			if(state){
				var message = 'Bookmark saved!';
				var nonTxAction = 'project: '+trancatedProj+' bookmarked: ';
			}else{
				var message = 'Bookmark removed!';
				var nonTxAction = 'project: '+trancatedProj+' unmarked: ';
			}
			popupSuccess(type,outputCurrency,tx_hash,message,0,receivedTokens,wallet,nonTxAction);//async wont wait	//format: tx_hash, title, amounts{eth}, amountsT
		}
	})
	.on('error', (error) => {
		var text = error.message;
		swal({
			title: "Cancelled.",
			type: "error",
			allowOutsideClick: true,
			text: text,
			html: false,
			confirmButtonColor: "#8e523c"
		});
	});
}
//which tab is highlighted
$(document).ready(function(){
	$('#projectSummary').css({'background-color' : '#d6188a'});//left panel
	//set global
	MyGlobals.Mode = 0;
	callPageTries();
});
$(document).on('click', '#projectSummary', function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #d6188a', 'background-color' : '#d6188a'});//set style
	//set global
	MyGlobals.Mode = 0;  
	callPageTries();         
});
$(document).on('click', '#illoanSummary', function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #d6188a', 'background-color' : '#d6188a'});//set style
	//set global
	MyGlobals.Mode = 1; 
	callPageTries();         
});
$(document).on('click', '#oploanSummary', function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #d6188a', 'background-color' : '#d6188a'});//set style
	//set global
	MyGlobals.Mode = 2;
	callPageTries();     
});
$(document).on('click', '#creditSummary', function(e){
	$('.asideNavsinside').removeAttr('style'); //reset styles
	$(this).css({'border' : '1px solid #d6188a', 'background-color' : '#d6188a'});//set style
	//set global
	MyGlobals.Mode = 3;
	callPageTries();    
});

//search for a project
function onSearchSubmit(event) {
	event.preventDefault();
	var address = $('#swapsearch').val();
	if( address > 0){
		console.log('fetching project...');	
		searchProject(address);
	}
	
}
async function searchProject(address){
	if (address.length >= 40 && web3.utils.isAddress(address) == true) {}else{console.log("Invalid address provided"); return;}
	
	var project = await clubInst.methods.getProfileILL(address).call();
	console.log(project[5])
	var fundingType = parseFloat(project[5]);
	//if requested funding type is zero then project has no ILL profile, use last OP loan profile
	if(fundingType == 0){
		//get last loan by project & use one of the applications as profile head
		var loansArray = await clubInst.methods.getProjectsLoanHistory(address).call();
		var lastLoan = loansArray.length - 1;
		if(loansArray.length > 0){
			//fetch header, use the most recent version submitted
			var lastLoanID = loansArray[lastLoan];
			await fetchSearchResultOPLoan(lastLoanID, address);
		}
	}else{
		await fetchSearchResultProfile(address);
	}
}

async function fetchSearchResultOPLoan(loanID, projectAddr){
    try{
		var projectItem = await clubInst.methods.getProfileOPL(loanID).call();
		//name
		var name = projectItem[0];
		//owner
		var owner = projectItem[4];
        var first = owner.substring(0, 6);//get first 5 chars
        var last = owner.slice(owner.length - 3);//get last 5
        var trancatedOwner = first+'...'+last;
		//logourl
		var logourl = projectItem[3];
		//prepare strip
		var resultStrip = '<a href="project.html?address='+projectAddr+'" class="searchresultStrip"><div class="projectLogoLeft" style="background-image:url(' + logourl + ')"></div><div class="searchprojectName">' + name + '</div></a>';
		
		$('#searchresult').empty().append(resultStrip);
		
	}catch(error) {
		console.log(error);
	}
}

async function fetchSearchResultProfile(projectAddr){
    try{
		var projectItem = await clubInst.methods.getProfileILL(projectAddr).call();
		//name
		var name = projectItem[0];
		//owner
		var owner = projectItem[4];
        var first = owner.substring(0, 6);//get first 5 chars
        var last = owner.slice(owner.length - 3);//get last 5
        var trancatedOwner = first+'...'+last;
		//logourl
		var logourl = projectItem[3];
		//prepare strip
		var resultStrip = '<a class="searchresultStrip" href="project.html?address='+projectAddr+'"><img src="' + logourl + '" alt="logo"><span class="searchprojectName">' + name + '</span></a>';
		
		$('#searchresult').empty().append(resultStrip);
		
	}catch(error) {
		console.log(error);
	}
}