import { CONSTANTS } from './constants.js';
import { updateSectionValues_HedgeCard, updateSectionValues_Progress, updateSectionValues_Gains } from './module-hedge-section-updaters.js';
import { updateChartValues_Hedge, updateChartValues_Assets } from './module-hedge-chart-updaters.js';

// 1. Fetch Section Values - Hedge
//-----------------------------------------
async function fetchSection_HedgeCard(hedgeID){
    try {
        const accounts = await web3.eth.requestAccounts();
        const userAddress = accounts[0];
        // get hedge data
        const hedgeDataRaw = await hedgingInstance.methods.getHedgeDetails(hedgeID).call();
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
            endValue, // uint256
            cost, // uint256
            dt_created, // uint256
            dt_started, // uint256
            dt_expiry, // uint256
            dt_settled, // uint256
            hedgeType, // uint8 (enum value)
            topupRequests, // uint256[]
        } = hedgeDataRaw;        
        
        //standard ERC20 ABI
        const erc20ABI = [
            {
              constant: true,
              inputs: [],
              name: 'name',
              outputs: [{ name: '', type: 'string' }],
              type: 'function',
            },
            {
              constant: true,
              inputs: [],
              name: 'symbol', // Add the symbol function
              outputs: [{ name: '', type: 'string' }],
              type: 'function',
            },
        ];
    
        // ERC20 Instance 
        const tokenContract = new web3.eth.Contract(erc20ABI, token);
        // Token Name
        const tokenName = await tokenContract.methods.name().call();
        const tokenDecimal = await tokenContract.methods.decimals().call();
        const tokenSymbol = await tokenContract.methods.symbol().call();
        // Hedge Value
        const hedgeValueRaw = await hedgingInstance.methods.getUnderlyingValue(token, amount).call();
        const underlyingValueRaw = hedgeValueRaw[0];
        const pairedCurrency = hedgeValueRaw[1];
        // Fetch Symbol of paired currency
        const pairedContract = new web3.eth.Contract(erc20ABI, paired);
        const pairedSymbol = await pairedContract.methods.symbol().call();  
        const pairedDeciaml = await pairedContract.methods.decimals().call();
        // Amounts Conversion
        const tokenAmount = new BigNumber(amount).div(10 ** tokenDecimal);
        const underlyingValue = new BigNumber(underlyingValueRaw).div(10 ** pairedDeciaml);
        createValue = new BigNumber(createValue).div(10 ** pairedDeciaml);
        startValue = new BigNumber(startValue).div(10 ** pairedDeciaml);
        // Gains & Losses
        // +ve or -ve integers passed to update function.. logic below is sound       
        let takerGains;
        let writerGains;
        let strikeValue;
        switch (hedgeType) {
        case 0: // CALL - cost max loss if price goes down
            strikeValue = startValue + cost;
            if(underlyingValue > startValue + cost) {
                takerGains = underlyingValue - startValue + cost;
                writerGains = startValue + cost - underlyingValue;
            }else{
                takerGains =- cost;
                writerGains = cost;
            }
            break;
        case 1: // PUT - cost max loss if price goes up
            strikeValue = startValue - cost;
            if(underlyingValue > startValue - cost) {
                takerGains =- cost;
                writerGains = cost;
            }else{
                takerGains = startValue - underlyingValue - cost;
                writerGains = cost + underlyingValue - startValue;
            }
            break;
        case 2: // SWAP - no cost paid in equity swaps
            if(underlyingValue > startValue + cost) {
                takerGains = underlyingValue - startValue;
                writerGains = startValue - underlyingValue;
            }else{
                takerGains = startValue - underlyingValue;
                writerGains = underlyingValue - startValue;
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
            hedgeType,
            token,
            pairedCurrency,
            pairedSymbol,
            //values
            endValue,
            strikeValue,
            underlyingValue,
            startValue,
            createValue,
            cost,
            //parties
            owner,
            taker,
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
            status,
            //consent
            topupConsent, // bool
            zapTaker, // bool
            zapWriter, // bool
            //requests
            topupRequests, // uint256[]
        );
        updateSectionValues_Progress(
            pairedCurrency,
            pairedSymbol,
            //values
            endValue,
            strikeValue,
            underlyingValue,
            startValue,
            createValue,
            cost,
            //date
            dt_createdFormatted,
            dt_startedFormatted,
            dt_expiryFormatted,
            dt_settledFormatted,
            timetoExpiry,
            lifespan,
            //status
            status
        );
        // Gains, Buy & Requests. All variables needed to compile breakdown paragraph/ explainer for each party 
        //..(you wrote a swap of 1M TSUKA (TSU....) this means...
        // status to determine buttons to show
        updateSectionValues_Gains(
            tokenName,
            tokenSymbol,
            tokenAmount,
            hedgeType,
            token,
            pairedCurrency,
            pairedSymbol,
            //values
            endValue,
            strikeValue,
            underlyingValue,
            startValue,
            createValue,
            cost,
            //parties
            owner,
            taker,
            userAddress,
            takerGains,
            writerGains,
            //date
            timetoExpiry,
            //status
            status,
            //consent
            zapTaker, // bool
            zapWriter // bool
        );

        // Update Charts and Graphics and Buttons
        // Step 4: Update asset bubbles & type of asset basket
        // use chart updater function, like in networth, wc accepts values to display all; bubbles, price chart, etc
        // this way its easy to create a default load & separate an actual data update
        
        // Hedge Price Levels - First item is startValue, last item is underlying/current value
        const initialPrices = [0, createValue, startValue, underlyingValue];
        const initialTargetPrice = strikeValue;
        updateChartValues_Hedge(initialPrices, initialTargetPrice);

        // Hedge Underlying ERC20 Assets - Global arrays for token names and amounts
        // For Alpha and Beta V1, single assets, display underlying quantity & cost quantity in basket
        const costAmount = cost / (tokenAmount / underlyingValue);
        const tokenNamesArray = [tokenSymbol, pairedSymbol];
        const tokenAmountArray = [tokenAmount, costAmount];
        updateChartValues_Assets(tokenNamesArray, tokenAmountArray);

        // Hedge Requests - pull topup requests from mappings and populate list
        // Put in separate module after hedgeCard
        await fetchSection_HedgeRequests(topupRequests, owner, taker);

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
        const underlyingValue = 100;
        const initialPrices = [startValue, createValue, underlyingValue];
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
    const accounts = await web3.eth.requestAccounts();
    const userAddress = accounts[0];

    const requestList = document.getElementById("requestList");
    // Iterate the array IDs and retrieve the request status then append to requestList
    topupRequests.forEach(async (requestId) => {
        const topupData = await hedgingInstance.methods.topupMap(requestId).call();

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