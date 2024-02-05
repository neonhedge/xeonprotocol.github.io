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
                maximumFractionDigits: 2,
            };
            return number.toLocaleString('en-US', options);
        };

        // Step 1: Update Type
        // Define a mapping object for hedgeType values
        const hedgeTypeMapping = {
            0: { text: 'Call Option', color: '#089353' }, // CALL
            1: { text: 'Put Option', color: '#d6188a' },  // PUT
            2: { text: 'Equity Swap', color: '#7e22ce' }, // SWAP
        };
alert(hedgeType)
        // Get the hedgeType value
        const hedgeTypeDiv = document.querySelector('#hedgeType'); 

        // Ensure hedgeType is a valid key our hedgeTypeMapping
        const hedgeTypeValue = hedgeTypeMapping.hasOwnProperty(hedgeType) ? hedgeTypeMapping[hedgeType] : { text: 'Unknown Hedge', color: '#000000' };

        // Update the text content and background color of the div
        hedgeTypeDiv.textContent = hedgeTypeValue.text;
        hedgeTypeDiv.style.backgroundColor = hedgeTypeValue.color;


        // Step 2: Update token symbol & amount
        document.getElementById("tokenSymbol").textContent = tokenSymbol;
        document.getElementById("tokenAmount").textContent = tokenAmount;

        // Step 3: Update underlying / current value
        document.getElementById("underlyingValue").textContent = `${underlyingValue} ${pairedSymbol}`;

        // Step 4: Update hedge values
        document.getElementById("startValue").textContent = `${formatValue(startValue)} ${pairedSymbol}`;
        document.getElementById("strikeValue").textContent = `${formatValue(strikeValue)} ${pairedSymbol}`;
        document.getElementById("hedgeCost").textContent = `${formatValue(cost)} ${pairedSymbol}`;

        // Step 5: Update times
        document.getElementById("dateCreate").textContent = dt_createdFormatted;
        document.getElementById("dateStart").textContent = dt_startedFormatted;
        document.getElementById("dateExpiry").textContent = dt_expiryFormatted;

    } catch (error) {
        console.error("Error Updating Net Worth section data:", error);
    }
}
function updateSectionValues_Progress(
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
)   {
    try {
        // Step 1: Update progress : hours left
        document.getElementById("timetoExpiry").textContent = `${timetoExpiry} hrs`;
        
        // Step 2: compare lifespan to timetoExpiry and set the width of a div with ID progressBar, if timetoExpiry is 10% of lifespan then width is 10% of 100%        
        const progressBar = document.getElementById('progressBar');
        
        if (lifespan >= 0 && timetoExpiry < lifespan) {
          const percentage = (timetoExpiry / lifespan) * 100;
          const percentWidth = 100 - percentage;
          progressBar.style.width = `${percentWidth}%`;
        } else {
          progressBar.style.width = '0%';
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
        const writerGainsBaseDiv = document.getElementById("writerGainsBase");
        writerGainsBaseDiv.innerText = `${writerGains >= 0 ? '+' : '-'}${Math.abs(writerGains).toFixed(2)} ${pairedSymbol}`;
        
        const takerGainsBaseDiv = document.getElementById("takerGainsBase");
        takerGainsBaseDiv.innerText = `${takerGains >= 0 ? '+' : '-'}${Math.abs(takerGains).toFixed(2)} ${pairedSymbol}`;

        // Truncate addresses
        const truncateAddress = (address) => {
            const first = address.substring(0, 5);
            const last = address.slice(address.length - 3);
            return `${first}..${last}`;
        };

        // Display privatised taker and owner addresses
        const hedgeTakerDiv = document.getElementById("hedgeTaker");
        hedgeTakerDiv.innerText = truncateAddress(taker);

        const hedgeOwnerDiv = document.getElementById("hedgeOwner");
        hedgeOwnerDiv.innerText = truncateAddress(owner);

        // Show buttons based on status and userAddress
        const takeHedgeButton = document.getElementById("takeHedge");
        const deleteHedgeButton = document.getElementById("deleteHedge");
        const zapHedgeButton = document.getElementById("zapHedge");
        const settledAlreadyButton = document.getElementById("settledAlready");

        if (status === 1) {
            if (userAddress !== owner) {
            takeHedgeButton.style.display = "block";
            deleteHedgeButton.style.display = "block";
            }
        } else if (status === 2) {
            zapHedgeButton.style.display = "block";
        } else if (status === 3) {
            settledAlreadyButton.style.display = "block";
        }
  
    } catch (error) {
      console.error("Error Updating Net Worth section data:", error);
    }
}

// Export the fetch functions
export { updateSectionValues_HedgeCard, updateSectionValues_Progress, updateSectionValues_Gains };