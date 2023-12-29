import { CONSTANTS, fromBigIntNumberToDecimal } from "./constants.js";

async function getUserHedgeVolume(user) {
    // Fetch arrays
    const optionsCreated = await hedgingInstance.methods.getUserOptionsCreated(user, 0, 100).call();
    const swapsCreated = await hedgingInstance.methods.getUserSwapsCreated(user, 0, 100).call();
    const optionsTaken = await hedgingInstance.methods.getUserOptionsTaken(user, 0, 100).call();
    const swapsTaken = await hedgingInstance.methods.getUserSwapsTaken(user, 0, 100).call();

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
        const hedgeDetails = await hedgingInstance.methods.getHedgeDetails(hedgeId).call;

        // Check if creator or taker
        const isUserCreator = hedgeDetails.owner === user;
        const isUserTaker = hedgeDetails.taker === user;
        const pairedAddress = hedgeDetails.paired;

        // Start values based on creator or taker
        const valueToUse = isUserCreator ? hedgeDetails.startValue : hedgeDetails.cost;

        // Sum values based on paired address
        if (pairedAddress === CONSTANTS.wethAddress) {
            if (isUserCreator) {
                startValueSumWETH += fromBigIntNumberToDecimal(valueToUse, 18); 
            } else if (isUserTaker) {
                costSumWETH += fromBigIntNumberToDecimal(valueToUse, 18); 
            }
        } else if (pairedAddress === CONSTANTS.usdtAddress) {
            if (isUserCreator) {
                startValueSumUSDT += fromBigIntNumberToDecimal(valueToUse, 6); 
            } else if (isUserTaker) {
                costSumUSDT += fromBigIntNumberToDecimal(valueToUse, 6); 
            }
        } else if (pairedAddress === CONSTANTS.usdcAddress) {
            if (isUserCreator) {
                startValueSumUSDC += fromBigIntNumberToDecimal(valueToUse, 6); 
            } else if (isUserTaker) {
                costSumUSDC += fromBigIntNumberToDecimal(valueToUse, 6); 
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
        const { profits, losses } = await hedgingInstance.methods.getEquivUserPL(user, pairedCurrency).call();
        const decimals = pairedCurrency === CONSTANTS.wethAddress ? 18 : 6;

        // Update the variables based on the paired currency
        if (pairedCurrency === CONSTANTS.wethAddress) {
            profitsWETH = fromBigIntNumberToDecimal(profits, decimals);
            lossesWETH = fromBigIntNumberToDecimal(losses, decimals);
        } else if (pairedCurrency === CONSTANTS.usdtAddress) {
            profitsUSDT = fromBigIntNumberToDecimal(profits, decimals);
            lossesUSDT = fromBigIntNumberToDecimal(losses, decimals);
        } else if (pairedCurrency === CONSTANTS.usdcAddress) {
            profitsUSDC = fromBigIntNumberToDecimal(profits, decimals);
            lossesUSDC = fromBigIntNumberToDecimal(losses, decimals);
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

export { getUserHedgeVolume, getUserProfitLoss };