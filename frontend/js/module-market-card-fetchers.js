import { MyGlobals } from './_floor.js';

async function refreshDataOnElements() {
	// Fetch data for all items in MyGlobals.outputArray concurrently
	const promises = MyGlobals.outputArray.map(async (optionId) => {
		const result = await hedgingInstance.methods.getHedgeDetails(optionId).call();
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
		const [marketvalue, pairedAddress] = await hedgingInstance.methods.getUnderlyingValue(tokenAddress, result.amount).call();
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
		if (MyGlobals.lastItemIndex !== 0) {
		  if (window.readLimit + 1 > MyGlobals.lastItemIndex) {
			window.readLimit = MyGlobals.lastItemIndex - 1;
		  }
		  MyGlobals.startIndex = MyGlobals.lastItemIndex - window.readLimit - 1;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract window.readLimit -1 point to pick correct starting point for reads
		  let allHedgesLength = await hedgingInstance.methods.getAllHedgesLength().call();
		  MyGlobals.startIndex = allHedgesLength - window.readLimit - 1;
		}
	  
		let optionsArray = await hedgingInstance.methods.getAllHedges(MyGlobals.startIndex, window.readLimit).call();
		let takenArray = await hedgingInstance.methods.getAllHedgesTaken(MyGlobals.startIndex, 1000000000).call();
	  
		// Use filter() method to get vacant options
		let vacantOptionsArray = optionsArray.filter(hedgeID => !takenArray.includes(hedgeID));
	  
		if (vacantOptionsArray.length > 0) {
		  $('#hedgesTimeline').empty();
	  
		  // Update MyGlobals.outputArray directly
		  MyGlobals.MyGlobals.outputArray.push(...vacantOptionsArray);
	  
		  for (const hedgeID of vacantOptionsArray) {
			await fetchOptionCard(hedgeID);
		  }
	  
		  // Update last result index
		  MyGlobals.lastItemIndex = MyGlobals.startIndex;
		} else {
		  noOptionsSwal();
		}
	}
	  
	//CALL OPTIONS MY POSITIONS
	if (window.nav === 1 && window.filters === 2) { // Get my positions; mix of taken and created
		if (MyGlobals.lastItemIndex !== 0) {
		  if (window.readLimit + 1 > MyGlobals.lastItemIndex) {
			window.readLimit = MyGlobals.lastItemIndex - 1;
		  }
		  MyGlobals.startIndex = MyGlobals.lastItemIndex - 1 - window.readLimit;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract window.readLimit -1 point to pick correct starting point for reads
			let myHedgesLength = await hedgingInstance.methods.getUserHedgesLength(userAddress).call();
		  	MyGlobals.startIndex = myHedgesLength - 1 - window.readLimit;
		}
	  
		let arrayType = true;
		let optionsArray = await hedgingInstance.methods.getmyHedgesFromXY(MyGlobals.startIndex, window.readLimit, arrayType).call({ from: MyGlobals.wallet });
	  
		if (optionsArray.length > 0) {
		  $('#hedgesTimeline').empty();
	  
		  // Update MyGlobals.outputArray directly
		  MyGlobals.MyGlobals.outputArray.push(...optionsArray);
	  
		  for (const hedgeID of optionsArray) {
			await fetchOptionCard(hedgeID);
		  }
	  
		  // Update last result index
		  MyGlobals.lastItemIndex = MyGlobals.startIndex;
		} else {
		  noOptionsSwal();
		}
	}

	//BOOKMARKED HEDGES
	if(window.nav === 1 && window.filters === 3){//get my bookmarks
		let optionsArray = await hedgingInstance.methods.getmyBookmarks(MyGlobals.wallet).call();
		if(optionsArray.length > 0){
			$('#hedgesTimeline').empty();
			// Update MyGlobals.outputArray directly
			MyGlobals.MyGlobals.outputArray.push(...optionsArray);

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
		if (MyGlobals.lastItemIndex !== 0) {
			if (window.readLimit + 1 > MyGlobals.lastItemIndex) {
				window.readLimit = MyGlobals.lastItemIndex - 1;
			}
			MyGlobals.startIndex = MyGlobals.lastItemIndex - 1 - window.readLimit;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract window.readLimit -1 point to pick correct starting point for reads
			let allHedgesLength = await hedgingInstance.methods.getHedgesForTokenCount(filterAddress).call();
			MyGlobals.startIndex = allHedgesLength - 1 - window.readLimit;
		}
			
		let optionsArray = await hedgingInstance.methods.getHedgesForToken(filterAddress, MyGlobals.startIndex, window.readLimit).call();

		if (optionsArray.length > 0) {
			$('#hedgesTimeline').empty();		
			// Update MyGlobals.outputArray directly
			MyGlobals.MyGlobals.outputArray.push(...optionsArray);		
			for (const hedgeID of optionsArray) {
				await fetchOptionCard(hedgeID);
			}		
			// Update last result index
			MyGlobals.lastItemIndex = MyGlobals.startIndex;
		} else {
			noOptionsSwal();
		}
	}

	/*===================================================================================================

	====================================================================================================*/
	//EQUITY SWAPS
	if (window.nav === 2 && window.filters === 1) { // Get vacant equity swaps, exclude taken
		if (MyGlobals.lastItemIndex !== 0) {
		  if (window.readLimit + 1 > MyGlobals.lastItemIndex) {
			window.readLimit = MyGlobals.lastItemIndex - 1;
		  }
		  MyGlobals.startIndex = MyGlobals.lastItemIndex - window.readLimit - 1;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract window.readLimit -1 point to pick correct starting point for reads
		  let allSwapsLength = await hedgingInstance.methods.getAllSwapsLength().call();
		  MyGlobals.startIndex = allSwapsLength - window.readLimit - 1;
		}
	  
		let optionsArray = await hedgingInstance.methods.getAllSwaps(MyGlobals.startIndex, window.readLimit).call();
		let takenArray = await hedgingInstance.methods.getAllSwapsTaken(MyGlobals.startIndex, 1000000000).call();
	  
		// Use filter() method to get vacant swaps
		let vacantOptionsArray = optionsArray.filter(hedgeID => !takenArray.includes(hedgeID));
	  
		if (vacantOptionsArray.length > 0) {
		  $('#hedgesTimeline').empty();
	  
		  // Update MyGlobals.outputArray directly
		  MyGlobals.MyGlobals.outputArray.push(...vacantOptionsArray);
	  
		  for (const hedgeID of vacantOptionsArray) {
			await fetchOptionCard(hedgeID);
		  }
	  
		  // Update last result index
		  MyGlobals.lastItemIndex = MyGlobals.startIndex;
		} else {
		  noOptionsSwal();
		}
	}
	//EQUITY SWAPS MY POSITIONS
	if (window.nav === 2 && window.filters === 2) { // Get my positions; mix of taken and created
		if (MyGlobals.lastItemIndex !== 0) {
		  if (window.readLimit + 1 > MyGlobals.lastItemIndex) {
			window.readLimit = MyGlobals.lastItemIndex - 1;
		  }
		  MyGlobals.startIndex = MyGlobals.lastItemIndex - 1 - window.readLimit;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract window.readLimit -1 point to pick correct starting point for reads
			let mySwapsLength = await hedgingInstance.methods.getUserSwapsLength(MyGlobals.wallet).call();
		  	MyGlobals.startIndex = mySwapsLength - 1 - window.readLimit;
		}
	  
		let arrayType = false;
		let optionsArray = await hedgingInstance.methods.getmySwapsFromXY(MyGlobals.startIndex, window.readLimit, arrayType).call({ from: MyGlobals.wallet });
	  
		if (optionsArray.length > 0) {
		  $('#hedgesTimeline').empty();
	  
		  // Update MyGlobals.outputArray directly
		  MyGlobals.MyGlobals.outputArray.push(...optionsArray);
	  
		  for (const hedgeID of optionsArray) {
			await fetchOptionCard(hedgeID);
		  }
	  
		  // Update last result index
		  MyGlobals.lastItemIndex = MyGlobals.startIndex;
		} else {
		  noOptionsSwal();
		}
	}
	//BOOKMARKED EQUITY SWAPS
	if(window.nav === 2 && window.filters === 3){//get my bookmarks
		let optionsArray = await hedgingInstance.methods.getmyBookmarks(MyGlobals.wallet).call();
		if(optionsArray.length > 0){
			$('#hedgesTimeline').empty();
			// Update MyGlobals.outputArray directly
			MyGlobals.MyGlobals.outputArray.push(...optionsArray);

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
		if (MyGlobals.lastItemIndex !== 0) {
			if (window.readLimit + 1 > MyGlobals.lastItemIndex) {
				window.readLimit = MyGlobals.lastItemIndex - 1;
			}
			MyGlobals.startIndex = MyGlobals.lastItemIndex - 1 - window.readLimit;
		} else { // Start from the latest item in the array, our solidity reads incrementally so subtract window.readLimit -1 point to pick correct starting point for reads
			let allSwapsLength = await hedgingInstance.methods.getSwapsForTokenCount(filterAddress).call();
			MyGlobals.startIndex = allSwapsLength - 1 - window.readLimit;
		}
			
		let optionsArray = await hedgingInstance.methods.getSwapsForToken(filterAddress2, MyGlobals.startIndex, window.readLimit).call();

		if (optionsArray.length > 0) {
			$('#hedgesTimeline').empty();		
			// Update MyGlobals.outputArray directly
			MyGlobals.MyGlobals.outputArray.push(...optionsArray);		
			for (const hedgeID of optionsArray) {
				await fetchOptionCard(hedgeID);
			}		
			// Update last result index
			MyGlobals.lastItemIndex = MyGlobals.startIndex;
		} else {
			noOptionsSwal();
		}
	}
	
	//LOANS

	//SOCIAL TWITTER FEED #neonhedge
	
}

async function fetchOptionCard(optionId){
    try{
		let result = await hedgingInstance.methods.getHedgeDetails(optionId).call();
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
		var bookmarkState = await hedgingInstance.methods.getBookmark(MyGlobals.wallet, optionId).call();
		if(!bookmarkState){
			var bookmark_btn = "<div class='raise_S_tab _bookmarkjump' onclick='"+bookmark+"'><img src='imgs/bookmark_.png' width='18px'/></div>";
		}
		if(bookmarkState){
			var bookmark_btn = "<div class='raise_S_tab _bookmarkjump' onclick='"+unbookmark+"'><img src='imgs/unbookmark_.png' width='18px'/></div>";
		}
		//display nav 1 - vacant option
		if(window.nav == 1){
			var projectCard = `
			<div class="tl_hedgeCard statemark_ill_wish">				
				<div class="tl_hedgeGrid">
					<div class="projectLogo" style="background-image:url('imgs/monkeytrain.png')"></div>
					<div class="projectName">
						<div>`+name+`<a class="social_links" href="https://etherscan.io/address/'`+pairAddress+`" target="_blank" alt="SC" title="Go to Etherscan">`+truncatedTokenAdd+`</a></div>
						<div class="tl_bagsize">`+amount+` `+symbol+`</div>
					</div>
				</div>
				<div class="valueHold">
					<div class="assetsValue">
						<div class="valueTitle">VALUE</div>
						<div class="assetsMarketValue flux highlightOption">`+marketvalue+` `+pairSymbol+`</div>
					</div>
					<div class="assetsType">
						<div class="typeTitle">HEDGE</div>
						<div class="assetsTypeValue flux highlightOption">`+hedgeType+`</div>
					</div>
				</div>
				<div class="optionMark"><span>Strike:</span><span class="oMfigure">`+strikevalue+` `+pairSymbol+`</span></div>
				<div class="optionMark"><span>Premium:</span><span class="oMfigure">`+cost+` `+pairSymbol+`</span></div>
				<div class="optionMark"><span>Expires:</span><span class="oMfigure">`+timeToExpiry+` `+timeToExpiry+`</span></div>
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

export { refreshDataOnElements, loadOptions, fetchOptionCard, fetchNameSymbol, prepareTimestamp, noOptionsSwal };