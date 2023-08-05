MyGlobals = {"wallet":"0x61418293d8649Cc9066cb103028710253184CE77"};
MyGlobals.clubaddress = '0x569Da12383141d95162dd3C9c83A4Eb7a22A9174';
MyGlobals.Mode = 0;
MyGlobals.outputArray = [];
MyGlobals.startIndex;
MyGlobals.lastItemIndex;
MyGlobals.profitBg = 'imgs/repayment2.webp';
MyGlobals.lossBg = 'imgs/repayment2.webp';

MyGlobals.clubABI = [ { "inputs": [ { "internalType": "address payable", "name": "_tokenAdd", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "project", "type": "address" }, { "indexed": true, "internalType": "address", "name": "funder", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "funded", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "owed", "type": "uint256" } ], "name": "LiquidityFunded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "project", "type": "address" }, { "indexed": true, "internalType": "address", "name": "receiver", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "balance", "type": "uint256" } ], "name": "RepaidWithLove", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "project", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "funded", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "due", "type": "uint256" } ], "name": "projectFunded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "project", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "loaned", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "due", "type": "uint256" } ], "name": "projectLoaned", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "project", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "repayer", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "what", "type": "uint256" } ], "name": "projectRepaid", "type": "event" }, { "inputs": [], "name": "_fundingRate", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_managerWallet", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_memebankVaultFXD", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_memebankVaultLP", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_minHoldings", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_minimumFunding", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalCurrentAccount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalDividentsAvailable", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalFundingFromVault", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalFundingPaidout", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalFundingPaidoutWallets", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalFundingRepaid", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "_totalFundingRepaidTerm", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalFundingRepaidWallets", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "_totalFundingTerm", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "_totalLoanRepaidTerm", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalLoansPaidout", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalLoansRepaid", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalLoansRepaidWallets", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "_totalLoansTerm", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "_totalProceedsWithdrawn", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_address", "type": "address" } ], "name": "bookmarkProject", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "depositFundingCapital", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" }, { "internalType": "uint256", "name": "amountFunded", "type": "uint256" } ], "name": "fundProjectX", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "getAllFundingRequests", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getAllLoanRequests", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" } ], "name": "getBankFundingProfile", "outputs": [ { "internalType": "uint256", "name": "_due", "type": "uint256" }, { "internalType": "uint256", "name": "_repaid", "type": "uint256" }, { "internalType": "uint256", "name": "_time", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getClubFundedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getClubLoanedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCrowdFundedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCrowdLoanedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getFundedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "timestampStart", "type": "uint256" }, { "internalType": "uint256", "name": "timestampTo", "type": "uint256" } ], "name": "getFundingForTerm", "outputs": [ { "internalType": "uint256", "name": "sum", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" } ], "name": "getLaunchAddrs", "outputs": [ { "internalType": "address", "name": "pair", "type": "address" }, { "internalType": "address", "name": "router", "type": "address" }, { "internalType": "address", "name": "factory", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" } ], "name": "getLaunchAmnts", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "due", "type": "uint256" }, { "internalType": "uint256", "name": "repaid", "type": "uint256" }, { "internalType": "uint256", "name": "fundingTime", "type": "uint256" }, { "internalType": "uint256", "name": "managerstamped", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "requestID", "type": "uint256" } ], "name": "getLoanAmnts", "outputs": [ { "internalType": "uint256", "name": "startedTime", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "_due", "type": "uint256" }, { "internalType": "uint256", "name": "_repaid", "type": "uint256" }, { "internalType": "uint256", "name": "collateral", "type": "uint256" }, { "internalType": "address", "name": "collateralAddy", "type": "address" }, { "internalType": "address", "name": "receiverWallet", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getLoanedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_wallet", "type": "address" } ], "name": "getMyFundedProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_wallet", "type": "address" } ], "name": "getMyLoansProjects", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "loanID", "type": "uint256" } ], "name": "getProfileAddy", "outputs": [ { "internalType": "address", "name": "projectAddr", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" } ], "name": "getProfileILL", "outputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "website", "type": "string" }, { "internalType": "string", "name": "telegram", "type": "string" }, { "internalType": "string", "name": "url", "type": "string" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "funder", "type": "uint256" }, { "internalType": "uint256", "name": "hedgeStatus", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "loanID", "type": "uint256" } ], "name": "getProfileOPL", "outputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "website", "type": "string" }, { "internalType": "string", "name": "telegram", "type": "string" }, { "internalType": "string", "name": "url", "type": "string" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "hedgeStatus", "type": "uint256" }, { "internalType": "uint256", "name": "managerstamped", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" } ], "name": "getProjectsLoanHistory", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "timestampStart", "type": "uint256" }, { "internalType": "uint256", "name": "timestampTo", "type": "uint256" } ], "name": "getRepaidForTerm", "outputs": [ { "internalType": "uint256", "name": "sum", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" } ], "name": "getWalletFundingProfile", "outputs": [ { "internalType": "uint256", "name": "_due", "type": "uint256" }, { "internalType": "uint256", "name": "_repaid", "type": "uint256" }, { "internalType": "uint256", "name": "_time", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "requestID", "type": "uint256" } ], "name": "getWalletLoanProfile", "outputs": [ { "internalType": "uint256", "name": "_due", "type": "uint256" }, { "internalType": "uint256", "name": "_repaid", "type": "uint256" }, { "internalType": "uint256", "name": "_time", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_address", "type": "address" } ], "name": "getbookmarkOnProject", "outputs": [ { "internalType": "bool", "name": "marking", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "globalLoanCount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" }, { "internalType": "uint256", "name": "requestID", "type": "uint256" } ], "name": "loanProjectX", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "_projectAddr", "type": "address" }, { "internalType": "address", "name": "_liquidityAddr", "type": "address" } ], "name": "mapPermissions", "outputs": [ { "internalType": "bool", "name": "pass", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "repayFundingCapital", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" } ], "name": "repayProjectFunding", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" }, { "internalType": "uint256", "name": "request", "type": "uint256" } ], "name": "repayProjectLoan", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" }, { "internalType": "address", "name": "router", "type": "address" }, { "internalType": "address", "name": "factory", "type": "address" }, { "internalType": "uint256", "name": "fundingtype", "type": "uint256" }, { "internalType": "uint256", "name": "amountETH", "type": "uint256" }, { "internalType": "uint256", "name": "tokens", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "website", "type": "string" }, { "internalType": "string", "name": "telegram", "type": "string" }, { "internalType": "string", "name": "icon_128px_url", "type": "string" } ], "name": "requestFunding", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" }, { "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "address", "name": "LPaddress", "type": "address" }, { "internalType": "uint256", "name": "fundingtype", "type": "uint256" }, { "internalType": "uint256", "name": "amountETH", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "website", "type": "string" }, { "internalType": "string", "name": "telegram", "type": "string" }, { "internalType": "string", "name": "icon_128px_url", "type": "string" } ], "name": "requestLoan", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "sendDividents", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "_vaultFixedTerm", "type": "address" } ], "name": "setFixedTermVault", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_rate", "type": "uint256" } ], "name": "setLiquidityFundRate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "_vaultLiquidity", "type": "address" } ], "name": "setLiquidityVault", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_ethWEI", "type": "uint256" } ], "name": "setMinFunding", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_minTokens", "type": "uint256" } ], "name": "setMinHoldings", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_wallet", "type": "address" } ], "name": "setmanager", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" }, { "internalType": "bool", "name": "stamp", "type": "bool" }, { "internalType": "bool", "name": "poach", "type": "bool" } ], "name": "stampFundingRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "project", "type": "address" }, { "internalType": "uint256", "name": "request", "type": "uint256" }, { "internalType": "bool", "name": "stamp", "type": "bool" }, { "internalType": "bool", "name": "poach", "type": "bool" } ], "name": "stampLoanRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "tokenAddress", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_project", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "withdrawProceeds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" } ];


//Initialize B
try{
	if (typeof window.ethereum == 'undefined') {
		swal({title: "Hold on!",type: "error",confirmButtonColor: "#F27474",text: "metamask missing, so is the full experience now..."});
	}else if (typeof window.ethereum !== 'undefined') {
		//Metamask on BROWSER, NOW SET WEB3 PROVIDER
		window.web3 = new Web3(window.ethereum);
		//SET INSTANCE
		const tokenAddress = MyGlobals.clubaddress;		
		const erc20Abi = MyGlobals.clubABI;
		window.clubInst = new window.web3.eth.Contract(erc20Abi, tokenAddress);
		
	} else {
		console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live");
		// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
		App.web3 = new Web3( new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
	}
}catch(error) {}

//Hedge cards data refresh
$(document).ready(async function(){
	const unlockState = await unlockedWallet();
	if (unlockState === true){
		if (outputArray.length > 0){
			// Repeat, with async and promise so it doesn't overspill
			async function updateDataInterval() {
			  await assignDataToElements(); // Call the function to update data in HTML elements
			  // Schedule the next update after 30 seconds
			  setTimeout(async () => {
			    await updateDataInterval();
			  }, 30000);
			}
			// Call the function to start the initial update
			updateDataInterval();
		}
	}else{
		reqConnect();
	}	
});

//Updates
async function assignDataToElements() {
	// Fetch data for all items in outputArray concurrently
	const promises = outputArray.map(async (optionId) => {
		const result = await clubInst.methods.getHedgeDetails(optionId).call();
		// Convert timestamp to human-readable dates
		const dt_created = new Date(result.dt_created * 1000).toLocaleString();
		const dt_started = new Date(result.dt_started * 1000).toLocaleString();
		const dt_expiry = new Date(result.dt_expiry * 1000).toLocaleString();

		// Calculate time left for dt_expiry
		const timeNow = new Date().getTime();
		const timeDiff = result.dt_expiry * 1000 - timeNow;
		const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

		// Assign the data to HTML elements using element IDs
		$(`#${optionId}owner`).text(result.owner);
		$(`#${optionId}taker`).text(result.taker);
		// ... (assign other data to HTML elements here)
		$(`#${optionId}dt_created`).text(dt_created);
		$(`#${optionId}dt_started`).text(dt_started);
		$(`#${optionId}dt_expiry`).text(dt_expiry);
		$(`#${optionId}time_left`).text(`${days} D ${hours} H ${minutes} M ${seconds} S`);

		// Values 
		//..if option available then show market & current strike price
		//..if option is taken then show start and market price
		const [marketvalue, pairedAddress] = await clubInst.methods.getUnderlyingValue(tokenAddress, result.amount).call();
		const element = $(`#${optionId}buyButton`);
		let profit = marketvalue - (result.startvalue + result.cost);
		let borderColor = '';
		let boxShadowColor = '';
		let textColor = '';
		let backgroundImage = '';
		let newText = '';

		if (result.status === 2) {
			const neonGlow = Math.round(profit / 10); // Adjust neon glow proportionally
			borderColor = marketvalue >= result.startvalue + result.cost ? '#00ff00' : '#ff0000';
			boxShadowColor = borderColor;
			textColor = borderColor;
			backgroundImage = marketvalue >= result.startvalue + result.cost ? `url(${MyGlobals.profitBg})` : `url(${MyGlobals.lossBg})`;
			newText = profit >= 0 ? `+${profit}` : `${profit}`; // Add "+" sign for positive profit, remove for negative profit
			element.css({
				'background-image': backgroundImage,
				'background-repeat': 'no-repeat',
				'background-position': 'left center',
				'padding-left': '20px',
				'border': `0.5px solid ${borderColor}`, // Update border thickness
				'box-shadow': `0 0 ${neonGlow}px ${boxShadowColor}, 0 0 ${neonGlow * 4}px ${boxShadowColor}, 0 0 ${neonGlow * 6}px ${boxShadowColor}`, // Update neon glow
				'color': textColor
			});

			element.text(newText); // Set the new text 
		}
	});
	await Promise.all(promises); // wait for all promises to resolve
}

/*=========================================================================
	LOAD OPTION CARDS BASED ON TIMELINE FILTERS
==========================================================================*/
//consider fetching from index X - Y i.e. 30 max each load
//will load from last index only to a certain limit

async function loadOptions(){
	//CALL OPTIONS
	if (window.nav === 1 && window.filters === 1) { // Get vacant call options, exclude taken
		if (lastItemIndex !== 0) {
		  if (countLimit + 1 > lastItemIndex) {
			countLimit = lastItemIndex - 1;
		  }
		  startIndex = lastItemIndex - countLimit - 1;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract countLimit -1 point to pick correct starting point for reads
		  let allHedgesLength = await clubInst.methods.getAllHedgesLength().call();
		  startIndex = allHedgesLength - countLimit - 1;
		}
	  
		let optionsArray = await clubInst.methods.getAllHedges(startIndex, countLimit).call();
		let takenArray = await clubInst.methods.getAllHedgesTaken(startIndex, 1000000000).call();
	  
		// Use filter() method to get vacant options
		let vacantOptionsArray = optionsArray.filter(hedgeID => !takenArray.includes(hedgeID));
	  
		if (vacantOptionsArray.length > 0) {
		  $('#hedgesTimeline').empty();
	  
		  // Update outputArray directly
		  MyGlobals.outputArray.push(...vacantOptionsArray);
	  
		  for (const hedgeID of vacantOptionsArray) {
			await fetchOptionCard(hedgeID);
		  }
	  
		  // Update last result index
		  lastItemIndex = startIndex;
		} else {
		  noOptionsSwal();
		}
	}
	  
	//CALL OPTIONS MY POSITIONS
	if (window.nav === 1 && window.filters === 2) { // Get my positions; mix of taken and created
		if (lastItemIndex !== 0) {
		  if (countLimit + 1 > lastItemIndex) {
			countLimit = lastItemIndex - 1;
		  }
		  startIndex = lastItemIndex - 1 - countLimit;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract countLimit -1 point to pick correct starting point for reads
			let myHedgesLength = await clubInst.methods.getUserHedgesLength(MyLibrary.wallet).call();
		  	startIndex = myHedgesLength - 1 - countLimit;
		}
	  
		let arrayType = true;
		let optionsArray = await clubInst.methods.getmyHedgesFromXY(startIndex, countLimit, arrayType).call({ from: MyLibrary.wallet });
	  
		if (optionsArray.length > 0) {
		  $('#hedgesTimeline').empty();
	  
		  // Update outputArray directly
		  MyGlobals.outputArray.push(...optionsArray);
	  
		  for (const hedgeID of optionsArray) {
			await fetchOptionCard(hedgeID);
		  }
	  
		  // Update last result index
		  lastItemIndex = startIndex;
		} else {
		  noOptionsSwal();
		}
	}

	//BOOKMARKED HEDGES
	if(window.nav === 1 && window.filters === 3){//get my bookmarks
		let optionsArray = await clubInst.methods.getmyBookmarks(MyLibrary.wallet).call();
		if(optionsArray.length > 0){
			$('#hedgesTimeline').empty();
			// Update outputArray directly
			MyGlobals.outputArray.push(...optionsArray);

			//for each element in array
			let array = optionsArray;
			for (const hedgeID of array){
				await fetchOptionCard(hedgeID);
			}
		}else {//no hedges
			noOptionsSwal();
		}
	}

	//FILTER BY TOKEN ADDRESS
	let filterAddress = $('#swapsearch').val();
	if(window.nav == 1 && window.filters == 4 && filterAddress.length >= 40 && web3.utils.isAddress(filterAddress) == true){//filter by token address
		if (lastItemIndex !== 0) {
			if (countLimit + 1 > lastItemIndex) {
				countLimit = lastItemIndex - 1;
			}
			startIndex = lastItemIndex - 1 - countLimit;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract countLimit -1 point to pick correct starting point for reads
			let allHedgesLength = await clubInst.methods.getHedgesForTokenCount(filterAddress).call();
			startIndex = allHedgesLength - 1 - countLimit;
		}
			
		let optionsArray = await clubInst.methods.getHedgesForToken(filterAddress, startIndex, countLimit).call();

		if (optionsArray.length > 0) {
			$('#hedgesTimeline').empty();		
			// Update outputArray directly
			MyGlobals.outputArray.push(...optionsArray);		
			for (const hedgeID of optionsArray) {
				await fetchOptionCard(hedgeID);
			}		
			// Update last result index
			lastItemIndex = startIndex;
		} else {
			noOptionsSwal();
		}
	}

	/*===================================================================================================

	====================================================================================================*/
	//EQUITY SWAPS
	if (window.nav === 2 && window.filters === 1) { // Get vacant equity swaps, exclude taken
		if (lastItemIndex !== 0) {
		  if (countLimit + 1 > lastItemIndex) {
			countLimit = lastItemIndex - 1;
		  }
		  startIndex = lastItemIndex - countLimit - 1;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract countLimit -1 point to pick correct starting point for reads
		  let allSwapsLength = await clubInst.methods.getAllSwapsLength().call();
		  startIndex = allSwapsLength - countLimit - 1;
		}
	  
		let optionsArray = await clubInst.methods.getAllSwaps(startIndex, countLimit).call();
		let takenArray = await clubInst.methods.getAllSwapsTaken(startIndex, 1000000000).call();
	  
		// Use filter() method to get vacant swaps
		let vacantOptionsArray = optionsArray.filter(hedgeID => !takenArray.includes(hedgeID));
	  
		if (vacantOptionsArray.length > 0) {
		  $('#hedgesTimeline').empty();
	  
		  // Update outputArray directly
		  MyGlobals.outputArray.push(...vacantOptionsArray);
	  
		  for (const hedgeID of vacantOptionsArray) {
			await fetchOptionCard(hedgeID);
		  }
	  
		  // Update last result index
		  lastItemIndex = startIndex;
		} else {
		  noOptionsSwal();
		}
	}
	//EQUITY SWAPS MY POSITIONS
	if (window.nav === 2 && window.filters === 2) { // Get my positions; mix of taken and created
		if (lastItemIndex !== 0) {
		  if (countLimit + 1 > lastItemIndex) {
			countLimit = lastItemIndex - 1;
		  }
		  startIndex = lastItemIndex - 1 - countLimit;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract countLimit -1 point to pick correct starting point for reads
			let mySwapsLength = await clubInst.methods.getUserSwapsLength(MyLibrary.wallet).call();
		  	startIndex = mySwapsLength - 1 - countLimit;
		}
	  
		let arrayType = false;
		let optionsArray = await clubInst.methods.getmySwapsFromXY(startIndex, countLimit, arrayType).call({ from: MyLibrary.wallet });
	  
		if (optionsArray.length > 0) {
		  $('#hedgesTimeline').empty();
	  
		  // Update outputArray directly
		  MyGlobals.outputArray.push(...optionsArray);
	  
		  for (const hedgeID of optionsArray) {
			await fetchOptionCard(hedgeID);
		  }
	  
		  // Update last result index
		  lastItemIndex = startIndex;
		} else {
		  noOptionsSwal();
		}
	}
	//BOOKMARKED EQUITY SWAPS
	if(window.nav === 2 && window.filters === 3){//get my bookmarks
		let optionsArray = await clubInst.methods.getmyBookmarks(MyLibrary.wallet).call();
		if(optionsArray.length > 0){
			$('#hedgesTimeline').empty();
			// Update outputArray directly
			MyGlobals.outputArray.push(...optionsArray);

			//for each element in array
			let array = optionsArray;
			for (const hedgeID of array){
				await fetchOptionCard(hedgeID);
			}
		}else {//no hedges
			noOptionsSwal();
		}
	}

	//FILTER BY TOKEN ADDRESS
	let filterAddress2 = $('#swapsearch').val();
	if(window.nav == 1 && window.filters == 4 && filterAddress2.length >= 40 && web3.utils.isAddress(filterAddress2) == true){//filter by token address
		if (lastItemIndex !== 0) {
			if (countLimit + 1 > lastItemIndex) {
				countLimit = lastItemIndex - 1;
			}
			startIndex = lastItemIndex - 1 - countLimit;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract countLimit -1 point to pick correct starting point for reads
			let allSwapsLength = await clubInst.methods.getSwapsForTokenCount(filterAddress).call();
			startIndex = allSwapsLength - 1 - countLimit;
		}
			
		let optionsArray = await clubInst.methods.getSwapsForToken(filterAddress2, startIndex, countLimit).call();

		if (optionsArray.length > 0) {
			$('#hedgesTimeline').empty();		
			// Update outputArray directly
			MyGlobals.outputArray.push(...optionsArray);		
			for (const hedgeID of optionsArray) {
				await fetchOptionCard(hedgeID);
			}		
			// Update last result index
			lastItemIndex = startIndex;
		} else {
			noOptionsSwal();
		}
	}
	
	//LOANS

	//SOCIAL TWITTER FEED #neonhedge
	
}

async function fetchOptionCard(optionId){
    try{
		let result = await clubInst.methods.getHedgeDetails(optionId).call();
		//name and symbol
		let name,symbol;
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
		let amount = parseFloat((result.amount / Math.pow(10, MyLibrary.decimals)).toFixed(2));
		//market value
		const [marketvalue, pairedAddress] = await clubInst.methods.getUnderlyingValue(tokenAddress, result.amount).call();
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
		//option action button: buy, running/settle, expired
		let action_btn, activity_btn;
		if(status == 1){
			action_btn = "<div id='"+optionId+"buyButton' class='option_S_tab actionButton buyButton'>Buy Option</div>";
			activity_btn = `
			<div class="option_S_tab _bullbear">
				<span class="status-dot inprogress"><svg stroke="currentColor" fill="#188dd6" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Vacant</span></span>
			</div>`;
		}
		if(status == 2){
			action_btn = "<div id='"+optionId+"buyButton' class='option_S_tab actionButton activeButton'>Active</div>";
			activity_btn = `
			<div class="option_S_tab _bullbear">
				<span class="status-dot inprogress"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Running</span></span>
			</div>`;
		}
		if(status == 3){
			action_btn = "<div id='"+optionId+"buyButton' class='option_S_tab actionButton expiredButton'>Settle</div>";
			activity_btn = `
			<div class="option_S_tab _bullbear">
				<span class="status-dot ended"><svg stroke="currentColor" fill="orange" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Expired</span></span>
			</div>`;
		}
		//bookmark check
		var bookmark = 'addBookmark("'+optionId+'")';
		var unbookmark = 'removeBookmark("'+optionId+'")';
		var bookmarkState = await clubInst.methods.getBookmark(MyLibrary.wallet, optionId).call();
		if(!bookmarkState){
			var bookmark_btn = "<div class='raise_S_tab _bookmarkjump' onclick='"+bookmark+"'><img src='imgs/bookmark_.png' width='18px'/></div>";
		}
		if(bookmarkState){
			var bookmark_btn = "<div class='raise_S_tab _bookmarkjump' onclick='"+unbookmark+"'><img src='imgs/unbookmark_.png' width='18px'/></div>";
		}
		//display nav 1 - vacant option
		if(window.nav == 1 && window.filters == 1){
			var projectCard = `
			<div class="hedgeCard statemark_ill_wish">				
				<div class="hedgeGrid">
					<div class="projectLogoLeft" style="background-image:url('imgs/monkeytrain.png')"></div>
					<div class="projectName">
						<div><a`+name+`<a class="social_links" href="https://etherscan.io/address/'`+pairAddress+`" target="_blank" alt="SC" title="Go to Etherscan">`+truncatedTokenAdd+`</a></div>
						<div class="bagsize">`+amount+` `+symbol+`</div>
					</div>
				</div>
				<div class="valueHold">
					<div class="optionMarketValue flux highlightOption">`+marketvalue+` `+pairSymbol+`</div>
					<div class="optionType flux highlightOption">`+hedgeType+`</div>
				</div>
				<div class="optionMark"><span>Strk:</span><span class="oMfigure">`+strikevalue+` `+pairSymbol+`</span></div>
				<div class="optionMark"><span>Cost:</span><span class="oMfigure">`+cost+` `+pairSymbol+`</span></div>
				<div class="optionMark"><span>Time:</span><span class="oMfigure">`+timeToExpiry+`</span></div>
				<div class="optionSummary">
					`+activity_btn+`
					`+action_btn+`
					<div class="option_S_tab _bookmarkjump">
						<a class="view_project" href="hedge.html?id=`+optionId+`" target="_blank" alt="View" title="full details">view</a>
						`+bookmark_btn+`
					</div>
				</div>
			</div>`;
			$('#hedgesTimeline').append(projectCard);
		}else{
			//dont display, already funded
		}
		//display nav 1 - repayments
		if(window.nav == 1 && window.filters == 2 && due >= target){//repaying funding
			var funded = await prepareTimestamp(startedTime);
			//prepare the project card
			var projectCard = '<div class="projectCard raisemark_ill_repayments"><div class="kickoff">funded: ' + startedTime+ ' </div><div class="projectLogoLeft" style="background-image:url(' + logourl + ')"></div><div class="projectName">' + name + '</div><div class="projectRaiseTarget">' + raised + ' ETH</div><div class="mbcard_detail rb_detail"><div class="parent_meter"><div id="meter_guage" style="width:' + length + '%;"></div><span class="measure">' + length +'%</span></div></div><div class="raiseSummary raisemark_ill_repayments"><div class="raise_S_tab _bullbear"><span class="status-dot inrepaying"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8"></circle></svg><span style="white-space: nowrap;">Repaying</span></span></div><div class="raise_S_tab _socials"><a class="social_links" href="' + twitterURL + '" target="_blank" alt="TWT" title="Go to Twitter page"><img src="imgs/twitter.svg" width="32px"/></a><a class="social_links" href="https://' + telegramURL + '" target="_blank" alt="TG" title="Go to Telegram group"><img src="imgs/telegram.svg" width="32px"/></a><a class="social_links" href="https://etherscan.io/address/' + address + '" target="_blank" alt="SC" title="Go to Etherscan"><img src="imgs/etherscan.svg" width="32px"/></a></div><div class="raise_S_tab _bookmarkjump"><a class="view_project" href="hedge.html?address='+address+'" target="_blank" alt="View" title="Open project">view</a>'+ action_btn +'</div></div></div>';
			$('#hedgesTimeline').append(projectCard);
		}else{
			//dont display, finished repaying
		}
		//display nav 1 - awaiting approval
		if(window.nav == 1 && window.filters == 3 && hedgeStatus == 0){//requesting funding
			//prepare the project card
			var projectCard = '<div class="projectCard raisemark_ill_application"><div class="kickoff">ILL requester: <a href="https://etherscan.io/address/' + owner + '" target="_blank" title="requester/owner">' + truncatedOwner+ ' </a></div><div class="projectLogoLeft" style="background-image:url(' + logourl + ')"></div><div class="projectName">' + name + '</div><div class="mbcard_detail rb_detail mbcardpending"><div class="parent_meter"><div class="projectRaiseTarget pendingapproval">ILL Request: ' + amount + ' ETH</div></div></div><div class="raiseSummary"><div class="raise_S_tab _socials"><a class="social_links" href="' + twitterURL + '" target="_blank" alt="TWT" title="Go to Twitter page"><img src="imgs/twitter.svg" width="32px"/></a><a class="social_links" href="https://' + telegramURL + '" target="_blank" alt="TG" title="Go to Telegram group"><img src="imgs/telegram.svg" width="32px"/></a><a class="social_links" href="https://etherscan.io/address/' + address + '" target="_blank" alt="SC" title="Go to Etherscan"><img src="imgs/etherscan.svg" width="32px"/></a></div><div class="raise_S_tab _bookmarkjump">'+ action_btn +'</div></div></div>';
			$('#hedgesTimeline').append(projectCard);
		}else{
			//dont display, finished repaying
		}
	}catch(error) {
		console.log(error);
	}
}

// Standard ERC20 ABI
const erc20ABI=[{"constant":!0,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":!1,"stateMutability":"view","type":"function"},{"constant":!0,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":!1,"stateMutability":"view","type":"function"}];

async function fetchNameSymbol(tokenAddress){
	try {
		const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
		const name = await tokenContract.methods.name().call();
		const symbol = await tokenContract.methods.symbol().call();
		// Return the token information
		return { name, symbol };
	  } catch (error) {console.error('Failed to fetch token information:', error);}
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
async function noOptionsSwal(){
	$('#sl_leases').empty().append('<span id="sl_refreshing" class="sl_refresh">no hedges found...</span>');
	//proceed to swal
	var privatize = '<div class="clms_case">nothing to find here...</div>';
	swal({
			title: "Projects Not Found",
			text: privatize,
			type: "info",  //var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];
			html: true,
					dangerMode: true,
					confirmButtonText: "Okay",
					confirmButtonColor: "#d6188a", //site pink
			showConfirmButton: true,
			showCancelButton: false,
			allowOutsideClick: true,
			timer: 80000,
			animation: "slide-from-top"
	},function(){//on confirm click
	
	});//confirm swal close
}
async function addBookmark(optionId) {
	try {
	  // Estimate gasLimit
	  const encodedData = clubInst.methods.bookmarkHedge(optionId).encodeABI();
	  const estimateGas = await web3.eth.estimateGas({
		data: encodedData,
		from: MyLibrary.wallet,
		to: MyGlobals.clubaddress
	  });
  
	  // Estimate gasPrice
	  const gasPrice = await web3.eth.getGasPrice();
  
	  // Send transaction
	  const receipt = await clubInst.methods.bookmarkHedge(optionId).send({
		from: MyLibrary.wallet,
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
		let result = await clubInst.methods.getHedgeDetails(optionId).call();
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
		let amount = parseFloat((result.amount / Math.pow(10, MyLibrary.decimals)).toFixed(2));
		//market value
		const [marketvalue, pairedAddress] = await clubInst.methods.getUnderlyingValue(tokenAddress, result.amount).call();
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
	let trimUser = MyLibrary.wallet;
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
		clubInst.methods.getUserBases(MyLibrary.wallet).call().then((result) => {
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
	clubInst.methods.getWithdrawableBalance(tokenAddress, MyLibrary.wallet).call().then((result) => {
		const tokenBal = parseFloat((result / Math.pow(10, MyLibrary.decimals)).toFixed(2));
		// Assign values to HTML elements
		document.getElementById('tokenBal').innerText = `${tokenBal}`;
	})
	.catch((error) => {
		console.error(error);
	});
}