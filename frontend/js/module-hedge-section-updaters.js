// Update Section Values - Hedge Card
function updateSectionValues_HedgeCard(
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
    marketValue,
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
)   {
    try {
        const formatValue = (value) => {
        return `$${value.toFixed(2)}`;
        };

        const formatString = (number) => {
            return number.toLocaleString();
        };

        const formatStringDecimal = (number) => {
            const options = {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 7,
            };
            return number.toLocaleString('en-US', options);
        };

        // Step 1: Update Type
        // Define a mapping object for hedgeType values
        const hedgeTypeMapping = {
            'CALL': { text: 'Call Option', color: '#089353' }, // CALL
            'PUT': { text: 'Put Option', color: '#d6188a' },  // PUT
            'SWAP': { text: 'Equity Swap', color: '#440076' }, // SWAP
        };
        
        // Get the hedgeType value
        const hedgeTypeDiv = document.querySelector('#hedgeType'); 

        // Ensure hedgeType is a valid key our hedgeTypeMapping
        const hedgeTypeValue = hedgeTypeMapping.hasOwnProperty(hedgeType) ? hedgeTypeMapping[hedgeType] : { text: 'Unknown Hedge', color: '#FFF' };
        document.getElementById('hedgeTypeCard').style.backgroundColor = hedgeTypeValue.color;

        // Update the text content and background color of the div
        hedgeTypeDiv.textContent = hedgeTypeValue.text;

        // Step 2: Update token symbol & amount
        document.getElementById("tokenSymbol").textContent = tokenSymbol;
        document.getElementById("tokenAmount").textContent = formatStringDecimal(tokenAmount) + ' tokens';

        // Step 3: Update underlying / current value
        document.getElementById("marketValue").textContent = `${formatStringDecimal(marketValue)} ${pairedSymbol}`;

        // Step 4: Update hedge values
        document.getElementById("startValue").textContent = `${formatStringDecimal(startValue)} ${pairedSymbol}`;
        document.getElementById("strikeValue").textContent = `${formatStringDecimal(strikeValue)} ${pairedSymbol}`;
        document.getElementById("cost").textContent = `${formatStringDecimal(cost)} ${pairedSymbol}`;

        // Step 5: Update times
        document.getElementById("created").textContent = dt_createdFormatted;
        document.getElementById("taken").textContent = dt_startedFormatted;
        document.getElementById("expires").textContent = dt_expiryFormatted;
        
        // Update the tokenLogo background
        const tokenLogoDiv = document.getElementById('tokenLogo');
        const newBackgroundImageUrl = 'url(\'./imgs/tokens/ovela.webp\')'; 
        tokenLogoDiv.style.backgroundImage = newBackgroundImageUrl;

        // Update the requests list
        

    } catch (error) {
        console.error("Error Updating Net Worth section data:", error);
    }
}
function updateSectionValues_Progress(
    //date
    dt_createdFormatted,
    dt_startedFormatted,
    dt_expiryFormatted,
    dt_settledFormatted,
    timetoExpiry,
    lifespan,
    //status
    status
)   {
    const formatValue = (value) => {
        return `${value.toFixed(0)}`;
    };

    try {
        // Step 1: Update progress : hours left
        document.getElementById("timetoExpiry").textContent = `${timetoExpiry} hrs`;
        
        // Step 2: compare lifespan to timetoExpiry and set the width of a div with ID progressBar, if timetoExpiry is 10% of lifespan then width is 10% of 100%        
        const progressBar = document.getElementById('meter_guage');
        
        if (timetoExpiry < lifespan) {
            // Difference between them as %
            const diffPercent = ((lifespan - timetoExpiry) / lifespan) * 100;
            progressBar.style.width = `${diffPercent}%`;
            //update % text
            document.getElementById("measure").textContent = `${formatValue(diffPercent)} %`;
        } else {
            progressBar.style.width = '0%';
            //update % text
            document.getElementById("measure").textContent = `${0} %`;
        }
    } catch (error) {
        console.error("Error Updating Net Worth section data:", error);
    }
}

function updateSectionValues_Gains(
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
    marketValue,
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
) {

  try {
        const formatValue = (value) => {
            return `$${value.toFixed(2)}`;
        };

        const formatString = (number) => {
            return number.toLocaleString();
        };

        const formatStringDecimal = (number) => {
            const options = {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            };
            return number.toLocaleString('en-US', options);
        };

        // Check writer gains
        const writerGainsDiv = document.getElementById("writerGains");
        if (writerGains < 0) {
            writerGainsDiv.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        } else if (writerGains > 0) {
            writerGainsDiv.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
        }

        // Check taker gains
        const takerGainsDiv = document.getElementById("takerGains");
        if (takerGains < 0) {
            takerGainsDiv.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        } else if (takerGains > 0) {
            takerGainsDiv.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
        }

        // Display writer gains and taker gains with symbols
        //writer
        const writerGainsBaseDiv = document.getElementById("writerGainsBase");
        let formattedGainsWr;
        if (Math.abs(writerGains) == 0 || Math.abs(writerGains) >= 1) {
            formattedGainsWr = writerGains.toFixed(2);
        } else {
            formattedGainsWr = writerGains.toFixed(7);
        }
        writerGainsBaseDiv.innerText = `${writerGains >= 0 ? '+' : '-'}${formattedGainsWr} ${pairedSymbol}`;

        //taker
        const takerGainsBaseDiv = document.getElementById("takerGainsBase");
        let formattedGainsTk;
        if (Math.abs(takerGains) == 0 || Math.abs(takerGains) >= 1) {
            formattedGainsTk = takerGains.toFixed(2);
        } else {
            formattedGainsTk = takerGains.toFixed(7);
        }
        takerGainsBaseDiv.innerText = `${takerGains >= 0 ? '+' : '-'}${formattedGainsTk} ${pairedSymbol}`;

        // Truncate addresses
        const truncateAddress = (address) => {
            const first = address.substring(0, 5);
            const last = address.slice(address.length - 3);
            return `${first}..${last}`;
        };

        // Display privatised taker and owner addresses
        const hedgeTakerDiv = document.getElementById("takerTrunc");
        hedgeTakerDiv.innerText = truncateAddress(taker);

        const hedgeOwnerDiv = document.getElementById("ownerTrunc");
        hedgeOwnerDiv.innerText = truncateAddress(owner);

        // Show buttons based on status and userAddress
        const takeHedgeButton = document.getElementById("takeHedge");
        const deleteHedgeButton = document.getElementById("deleteHedge");
        const zapHedgeButton = document.getElementById("zapHedge");
        const settledAlreadyButton = document.getElementById("settledAlready");

        $(".dealButton").hide();
        if (status === 1) {
            if (userAddress !== owner) {
            takeHedgeButton.style.display = "inline-block";
            } else {
            deleteHedgeButton.style.display = "inline-block";
            }
        } else if (status === 2) {
            zapHedgeButton.style.display = "inline-block";
        } else if (status === 3) {
            settledAlreadyButton.style.display = "inline-block";
        }
  
    } catch (error) {
      console.error("Error Updating Net Worth section data:", error);
    }
}

// Export the fetch functions
export { updateSectionValues_HedgeCard, updateSectionValues_Progress, updateSectionValues_Gains };