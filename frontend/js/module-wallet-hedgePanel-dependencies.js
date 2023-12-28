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

        // Convert BigInt to human-readable using respective token decimals
        const convertBigIntToHumanReadable = (value, decimals) => {
            const bigValue = ethers.BigNumber.from(value);
            const divisor = ethers.BigNumber.from(10).pow(decimals);
            const result = bigValue.div(divisor).toNumber();
            return result;
        };

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


export { getUserHedgeVolume };