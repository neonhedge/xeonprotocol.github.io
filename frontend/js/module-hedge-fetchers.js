import { CONSTANTS } from './constants.js';
import { updateSectionValues_HedgeCard, updateSectionValues_Progress, updateSectionValues_Gains } from './module-hedge-section-updaters.js';
import { updateChartValues_Hedge } from './module-hedge-chart-updaters.js';

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
        const underlyingValue = hedgeValueRaw[0];
        const pairedCurrency = hedgeValueRaw[1];
        // Fetch Symbol of paired currency
        const pairedContract = new web3.eth.Contract(erc20ABI, paired);
        const pairedSymbol = await pairedContract.methods.symbol().call();  
        // Token Amount
        const tokenAmount = new BigNumber(amount).div(10 ** tokenDecimal);
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
        
        // Example usage:
        const initialPrices = [100, 110, 150, 80, 130];
        const initialTargetPrice = 120;
        updateChartValues_Hedge(initialPrices, initialTargetPrice);

        // Fetch Hedge Requests from mappings and populate requests list

    } catch (error) {
        console.error("Error fetching Hedge Panel section data:", error);
    }
}


// Export the fetch functions
export { fetchSection_HedgeCard };