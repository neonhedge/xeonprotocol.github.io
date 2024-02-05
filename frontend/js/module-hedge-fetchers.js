import { CONSTANTS, getTokenDecimals, cardCommaFormat, fromBigIntNumberToDecimal, fromDecimalToBigInt, getTokenDecimalSymbolName, getAccounts } from './constants.js';
import { updateSectionValues_HedgeCard, updateSectionValues_Progress, updateSectionValues_Gains } from './module-hedge-section-updaters.js';
import { updateChartValues_Hedge, updateChartValues_Assets } from './module-hedge-chart-updaters.js';

// 1. Fetch Section Values - Hedge
//-----------------------------------------
async function fetchSection_HedgeCard(){
            
    // Check if the webpage URL has '?id='
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    let optionId;
    if (idParam) {
       optionId = parseInt(idParam)
    } else {
        await fetchSection_HedgeCardDefault();
        return;
    }

    try {
        const accounts = await getAccounts();
        const userAddress = accounts[0];

        
        const hedgeResult = await hedgingInstance.getHedgeDetails(optionId);
        const {
            topupConsent, // bool
            zapTaker, // bool
            zapWriter, // bool
            owner, // address
            taker, // address
            token, // address
            paired, // address
            status, // uint256
            amount, // uint256
            createValue, // uint256
            startValue, // uint256
            strikeValue, // unit256
            endValue, // uint256
            cost, // uint256
            dt_created, // uint256
            dt_started, // uint256
            dt_expiry, // uint256
            dt_settled, // uint256
            hedgeType, // uint8 (enum value)
            topupRequests, // uint256[]
        } = hedgeResult;

		//name and symbol
		let tokenName,tokenSymbol, tokenDecimal;
        
		getTokenDecimalSymbolName(hedgeResult.token).then(t=>{tokenName=t.name,tokenSymbol=t.symbol, tokenDecimal=t.tokenDecimal}).catch(e=>console.error(e));
		//token & pair address
		let tokenAddress = hedgeResult.token;
		let tokenPairAddress = hedgeResult.paired;
		//owner
		let hedgeOwner = hedgeResult.owner;
        let truncatedOwner = hedgeOwner.substring(0, 6) + '...' + hedgeOwner.slice(-3);
		//taker
		let hedgeTaker = hedgeResult.taker;
        let truncatedTaker = hedgeTaker.substring(0, 6) + '...' + hedgeTaker.slice(-3);
		//hedge status
		let hedgeStatus = parseFloat(hedgeResult.status);		
		//amounts
		let tokenAmount = fromBigIntNumberToDecimal(hedgeResult.amount, tokenDecimal);
		let amountFormated = cardCommaFormat(tokenAmount);

		//hedge type
		let hedgeTypeString;
		if (hedgeResult.hedgeType === 0) {
			hedgeTypeString = 'CALL';
		} else if (hedgeResult.hedgeType === 1) {
			hedgeTypeString = 'PUT';
		} else if (hedgeResult.hedgeType === 2) {
			hedgeTypeString = 'SWAP';
		} else {
			console.log('Hedge type is unknown');
		}

		//paired symbol
		let pairSymbol;
		if (tokenPairAddress === CONSTANTS.usdtAddress) {
			pairSymbol = 'USDT';
		} else if (tokenPairAddress === CONSTANTS.usdcAddress) {
			pairSymbol = 'USDC';
		} else if (tokenPairAddress === CONSTANTS.wethAddress) {
			pairSymbol = 'WETH';
		}

		//market value current
		const [marketvalueCurrent, pairedAddress] = await hedgingInstance.getUnderlyingValue(tokenAddress, hedgeResult.amount);
		const pairedAddressDecimal = await getTokenDecimals(tokenPairAddress);
        const createValueDeci = fromBigIntNumberToDecimal(hedgeResult.createValue, pairedAddressDecimal);
		const marketvalue = fromBigIntNumberToDecimal(marketvalueCurrent, pairedAddressDecimal);
        const marketPrice = marketvalue / tokenAmount;
        const strikeValueDeci = fromBigIntNumberToDecimal(hedgeResult.strikeValue, pairedAddressDecimal);
        const strikePrice = strikeValueDeci / tokenAmount;
        const startValueDeci = fromBigIntNumberToDecimal(hedgeResult.startValue, pairedAddressDecimal);
        const costDeci = fromBigIntNumberToDecimal(hedgeResult.cost, pairedAddressDecimal);
        
        // Gains & Losses
        // +ve or -ve integers passed to update function.. logic below is sound       
        let takerGains;
        let writerGains;
        switch (hedgeTypeString) {
        case 0: // CALL - cost max loss if price goes down
            if(marketvalue > startValueDeci + costDeci) {
                takerGains = marketvalue - startValueDeci + costDeci;
                writerGains = startValueDeci + costDeci - marketvalue;
            }else{
                takerGains =- costDeci;
                writerGains = costDeci;
            }
            break;
        case 1: // PUT - cost max loss if price goes up
            if(marketvalue > startValueDeci - costDeci) {
                takerGains =- costDeci;
                writerGains = costDeci;
            }else{
                takerGains = startValueDeci - marketvalue - costDeci;
                writerGains = costDeci + marketvalue - startValueDeci;
            }
            break;
        case 2: // SWAP - no cost paid in equity swaps
            if(marketvalue > startValueDeci + costDeci) {
                takerGains = marketvalue - startValueDeci;
                writerGains = startValueDeci - marketvalue;
            }else{
                takerGains = startValueDeci - marketvalue;
                writerGains = marketvalue - startValueDeci;
            }
            break;
        default:
            takerGains = 0;
            writerGains = 0;
        }

        // helper to farmatting below, format dates to "DD/MM/YYYY"
        function formatTimestamp(timestamp) {
            const date = new Date(timestamp * 1000);
            const day = date.getDate();
            const month = date.getMonth() + 1; // Months are 0-indexed
            const year = date.getFullYear();
            return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
        }
        // Format the dates
        const dt_createdFormatted = formatTimestamp(dt_created);
        const dt_startedFormatted = formatTimestamp(dt_started);
        const dt_expiryFormatted = formatTimestamp(dt_expiry);
        const dt_settledFormatted = formatTimestamp(dt_settled);
        // Progress or time to expiry
        // get current timestamp in seconds
        const dt_today = Math.floor(Date.now() / 1000); 
        const lifespan = Math.floor((dt_expiry - dt_created) / 3600);
        let timetoExpiry = 0;
        if (dt_started > 0 && dt_today < dt_expiry) {
            timetoExpiry = dt_expiry - dt_today;
            // Convert seconds to hours
            timetoExpiry = Math.floor(timetoExpiry / 3600); // 1 hour = 3600 seconds
        }

        // USE 3 UPDATERS: HEDGE, PROGRESS, GAINS
        updateSectionValues_HedgeCard(
            tokenName,
            tokenSymbol,
            tokenAmount,
            hedgeTypeString,
            token,
            tokenPairAddress,
            pairSymbol,
            //values
            endValue,
            strikeValueDeci,
            marketvalue,
            startValueDeci,
            createValueDeci,
            costDeci,
            //parties
            hedgeOwner,
            hedgeTaker,
            userAddress,
            takerGains,
            writerGains,
            //date
            dt_createdFormatted,
            dt_startedFormatted,
            dt_expiryFormatted,
            dt_settledFormatted,
            timetoExpiry,
            //status
            hedgeStatus,
            //consent
            topupConsent, // bool
            zapTaker, // bool
            zapWriter, // bool
            //requests
            topupRequests, // uint256[]
        );
        updateSectionValues_Progress(
            tokenPairAddress,
            pairSymbol,
            //values
            endValue,
            strikeValueDeci,
            marketvalue,
            startValueDeci,
            createValueDeci,
            costDeci,
            //date
            dt_createdFormatted,
            dt_startedFormatted,
            dt_expiryFormatted,
            dt_settledFormatted,
            timetoExpiry,
            lifespan,
            //status
            hedgeStatus
        );
        // Gains, Buy & Requests. All variables needed to compile breakdown paragraph/ explainer for each party 
        //..(you wrote a swap of 1M TSUKA (TSU....) this means...
        // status to determine buttons to show
        updateSectionValues_Gains(
            tokenName,
            tokenSymbol,
            tokenAmount,
            hedgeTypeString,
            token,
            tokenPairAddress,
            pairSymbol,
            //values
            endValue,
            strikeValueDeci,
            marketvalue,
            startValueDeci,
            createValueDeci,
            costDeci,
            //parties
            hedgeOwner,
            hedgeTaker,
            userAddress,
            takerGains,
            writerGains,
            //date
            timetoExpiry,
            //status
            hedgeStatus,
            //consent
            zapTaker, // bool
            zapWriter // bool
        );

        // Update Charts and Graphics and Buttons
        // Step 4: Update asset bubbles & type of asset basket
        // use chart updater function, like in networth, wc accepts values to display all; bubbles, price chart, etc
        // this way its easy to create a default load & separate an actual data update
        
        // Hedge Price Levels - First item is startValue, last item is underlying/current value
        const initialPrices = [0, createValueDeci, startValueDeci, marketvalue];
        const initialTargetPrice = strikeValueDeci;
        updateChartValues_Hedge(initialPrices, initialTargetPrice);

        // Hedge Underlying ERC20 Assets - Global arrays for token names and amounts
        // For Alpha and Beta V1, single assets, display underlying quantity & cost quantity in basket
        const costAmount = costDeci / marketPrice;
        const tokenNamesArray = [tokenSymbol, pairSymbol];
        const tokenAmountArray = [tokenAmount, costAmount];
        updateChartValues_Assets(tokenNamesArray, tokenAmountArray);

        // Hedge Requests - pull topup requests from mappings and populate list
        // Put in separate module after hedgeCard
        await fetchSection_HedgeRequests(topupRequests, hedgeOwner, hedgeTaker);

    } catch (error) {
        console.error("Error fetching Hedge Panel section data:", error);
    }
}

// 2. Fetch Section Values - HedgeCard Default Load
async function fetchSection_HedgeCardDefault(){
    try {
        // Hedge Price Levels - First item is startValue, last item is underlying/current value
        const startValue = 0;
        const createValue = 50;
        const marketvalue = 100;
        const initialPrices = [startValue, createValue, marketvalue];
        const initialTargetPrice = 80;
        updateChartValues_Hedge(initialPrices, initialTargetPrice);

        // Hedge Underlying ERC20 Assets - Global arrays for token names and amounts
        // For Alpha and Beta V1, single assets, display underlying quantity & cost quantity in basket
        const tokenNamesArray = ["ZKS", "ZRO", "GMX", "ARB", "VELA"];
        const tokenAmountArray = [1000000, 2000000, 3000000, 4000000, 5000000];
        updateChartValues_Assets(tokenNamesArray, tokenAmountArray);

    } catch (error) {
        console.error("Error fetching Hedge Panel section data:", error);
    }
}


    // Fetch topup requests
    //topupRequests is an array if intergers that point to mapping locations in solidity
    // storage is as follows;
    //struct topupData { uint256 amountWriter;  uint256 amountTaker; uint256 requestTime, uint256 acceptTime, uint256 rejectTime, uint state; }
    // where state is, 0 - requested, 1 accepted, 2 rejected
    // mapping topup requests 
    //mapping(uint => topupData) public topupMap;
    // fetch the individual mappings using IDs in array topupRequests
    // if state == 0 and owner == userAddress and amountTaker > 0, then it's a taker request
    // if state == 0 and owner == userAddress and amountWriter > 0, then it's a writer request
    // if state == 0 and taker == userAddress and amountWriter > 0, then its writer request
    // if state == 0 and taker == userAddress and amountTaker > 0, then its taker request
    // i want to display this HTML to a list, this HTML is for a request open (i.e state == 0); <span><i class="fa fa-superpowers"></i> Topup Request Pending <button class="requestButton actonRequest">Accept</button></span>
    // this HTML is for a request accepted (i.e state == 1); <span><i class="fa fa-handshake-o"></i> Topup Accepted 20/05/2023</span>
    // if state == 1 then create a request rejected list entry and timestamp simialr to the type for accepted
    //the ID of the HTML ul element to append to is "requestList".


async function fetchSection_HedgeRequests(topupRequests, owner, taker) {
    const accounts = await getAccounts();
    const userAddress = accounts[0];

    const requestList = document.getElementById("requestList");
    // Iterate the array IDs and retrieve the request status then append to requestList
    topupRequests.forEach(async (requestId) => {
        const topupData = await hedgingInstance.topupMap(requestId);

        if (topupData.state == 0) {
            if (owner == userAddress && topupData.amountTaker > 0) {
                requestList.innerHTML += `<span><i class="fa fa-superpowers"></i> Topup Request Pending <button class="requestButton actonRequest">Accept</button></span>`;
            }

            if (owner == userAddress && topupData.amountWriter > 0) {
                requestList.innerHTML += `<span><i class="fa fa-superpowers"></i> Topup Request Pending <button class="requestButton actonRequest">Accept</button></span>`;
            }

            if (taker == userAddress && topupData.amountWriter > 0) {
                requestList.innerHTML += `<span><i class="fa fa-superpowers"></i> Topup Request Pending <button class="requestButton actonRequest">Accept</button></span>`;
            }

            if (taker == userAddress && topupData.amountTaker > 0) {
                requestList.innerHTML += `<span><i class="fa fa-superpowers"></i> Topup Request Pending <button class="requestButton actonRequest">Accept</button></span>`;
            }
        } else if (topupData.state == 1) {
            const acceptTime = formatDate(topupData.acceptTime);
            requestList.innerHTML += `<span><i class="fa fa-handshake-o"></i> Topup Accepted ${acceptTime}</span>`;
        } else if (topupData.state == 2) {
            const rejectTime = formatDate(topupData.rejectTime);
            requestList.innerHTML += `<span><i class="fa fa-times-circle"></i> Topup Rejected ${rejectTime}</span>`;
        }
    });
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Export the fetch functions
export { fetchSection_HedgeCard, fetchSection_HedgeCardDefault };