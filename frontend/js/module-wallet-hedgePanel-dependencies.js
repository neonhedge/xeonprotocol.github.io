import { CONSTANTS } from "./constants.js";

async function getUserHedgeVolume(user) {
    // Fetch arrays
    const optionsCreated = await hedgingInstance.getUserOptionsCreated(user, 0, 100);
    const swapsCreated = await hedgingInstance.getUserSwapsCreated(user, 0, 100);
    const optionsTaken = await hedgingInstance.getUserOptionsTaken(user, 0, 100);
    const swapsTaken = await hedgingInstance.getUserSwapsTaken(user, 0, 100);

    // Combine arrays into one final array
    const finalArray = [...optionsCreated, ...swapsCreated, ...optionsTaken, ...swapsTaken];

    // Initialize sums
    let startValueSumWETH = 0;
    let startValueSumUSDT = 0;
    let startValueSumUSDC = 0;

    let costSumWETH = 0;
    let costSumUSDT = 0;
    let costSumUSDC = 0;

    // Fetch details for each hedge and calculate sums
    for (const hedgeId of finalArray) {
        const hedgeDetails = await hedgingInstance.getHedgeDetails(hedgeId);

        // Check if creator or taker
        const isUserCreator = hedgeDetails.owner === user;
        const isUserTaker = hedgeDetails.taker === user;
        const pairedAddress = hedgeDetails.paired;

        // Start values based on creator or taker
        const valueToUse = isUserCreator ? hedgeDetails.startValue : hedgeDetails.cost;

        // Sum values based on paired address
        if (pairedAddress === CONSTANTS.wethAddress) {
            if (isUserCreator) {
                startValueSumWETH += convertBigIntToHumanReadable(valueToUse, 18); 
            } else if (isUserTaker) {
                costSumWETH += convertBigIntToHumanReadable(valueToUse, 18); 
            }
        } else if (pairedAddress === CONSTANTS.usdtAddress) {
            if (isUserCreator) {
                startValueSumUSDT += convertBigIntToHumanReadable(valueToUse, 6); 
            } else if (isUserTaker) {
                costSumUSDT += convertBigIntToHumanReadable(valueToUse, 6); 
            }
        } else if (pairedAddress === CONSTANTS.usdcAddress) {
            if (isUserCreator) {
                startValueSumUSDC += convertBigIntToHumanReadable(valueToUse, 6); 
            } else if (isUserTaker) {
                costSumUSDC += convertBigIntToHumanReadable(valueToUse, 6); 
            }
        }
    }

    // Consider conversion of all values to USD using convertToUSD
    // startValueSumWETH = convertToUSD(startValueSumWETH, CONSTANTS.wethAddress, ethUsdPrice);
    // costSumWETH = convertToUSD(costSumWETH, CONSTANTS.wethAddress, ethUsdPrice);

    // Return the converted sums
    return {
        startValueSumWETH,
        startValueSumUSDT,
        startValueSumUSDC,
        costSumWETH,
        costSumUSDT,
        costSumUSDC,
    };
}

async function getUserProfitLoss(user) {
    const pairedCurrencies = [CONSTANTS.wethAddress, CONSTANTS.usdtAddress, CONSTANTS.usdcAddress];

    // Initialize variables 
    let profitsWETH = 0;
    let profitsUSDT = 0;
    let profitsUSDC = 0;

    let lossesWETH = 0;
    let lossesUSDT = 0;
    let lossesUSDC = 0;

    // Fetch profits and losses for each paired currency
    for (const pairedCurrency of pairedCurrencies) {
        const [profits, losses] = await hedgingInstance.getEquivUserPL(user, pairedCurrency);
        const decimals = pairedCurrency === CONSTANTS.wethAddress ? 18 : 6;

        // Update the variables based on the paired currency
        if (pairedCurrency === CONSTANTS.wethAddress) {
            profitsWETH = convertBigIntToHumanReadable(profits);
            lossesWETH = convertBigIntToHumanReadable(losses);
        } else if (pairedCurrency === CONSTANTS.usdtAddress) {
            profitsUSDT = convertBigIntToHumanReadable(profits);
            lossesUSDT = convertBigIntToHumanReadable(losses);
        } else if (pairedCurrency === CONSTANTS.usdcAddress) {
            profitsUSDC = convertBigIntToHumanReadable(profits);
            lossesUSDC = convertBigIntToHumanReadable(losses);
        }
    }

    // Return the profits and losses for each paired currency
    return {
        profitsWETH,
        profitsUSDT,
        profitsUSDC,
        lossesWETH,
        lossesUSDT,
        lossesUSDC,
    };
}


function convertBigIntToHumanReadable = (value) => {
    const bigValue = ethers.BigNumber.from(value);
    const divisor = ethers.BigNumber.from(10).pow(decimals);
    const result = bigValue.div(divisor).toNumber();
    return result;
};

export { getUserHedgeVolume, getUserProfitLoss };