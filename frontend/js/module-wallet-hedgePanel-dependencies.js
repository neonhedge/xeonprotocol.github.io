import { CONSTANTS, getCurrentEthUsdcPriceFromUniswapV2, getTokenUSDValue, getTokenETHValue, getTokenDecimals } from "./constants.js";

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


function convertToUSD(value, pairedCurrency, ethUsdPrice) {
	console.log('outputUSD ' + value + ", worthOf " + pairedCurrency + ", @ ethusd: " + ethUsdPrice);
	switch (pairedCurrency) {
	  case CONSTANTS.wethAddress:
		return value * ethUsdPrice;
	  case CONSTANTS.usdtAddress:
	  case CONSTANTS.usdcAddress:
		return value;
	  default:
		return 0;
	}
}
// Function to get token USD value
// accepts wei & BigNumber
// outputs Number
async function getTokenUSDValue(underlyingTokenAddr, balanceRaw) {	
	const ethUsdPrice = getCurrentEthUsdcPriceFromUniswapV2();
	try {
		if (underlyingTokenAddr === CONSTANTS.wethAddress) {
			const balance = new BigNumber(balanceRaw).div(new BigNumber(10).pow(18));
			const usdValue = convertToUSD(balance, CONSTANTS.wethAddress, ethUsdPrice);
			return usdValue;
		} else {
			const underlyingValue = await getTokenETHValue(underlyingTokenAddr, balanceRaw);
			const balanceNumber = Number(underlyingValue[0]);
			const pairSymbol = underlyingValue[1];
			
			// reverse engineer pair address needed for USD conversion
			let pairedAddress;
			if (pairSymbol === 'USDT') {
				pairedAddress = CONSTANTS.usdtAddress;
			} else if (pairSymbol === 'USDC') {
				pairedAddress = CONSTANTS.usdcAddress;
			} else if (pairSymbol === 'WETH') {
				pairedAddress = CONSTANTS.wethAddress;
			}
			// accepts Number not wei & BigNumber
			const usdValue = convertToUSD(balanceNumber, pairedAddress, ethUsdPrice);
			console.log('for: '+balanceNumber + ', usd: ' + usdValue);
			return usdValue;
		}
	} catch (error) {
	  console.error("Error getting token USD value:", error);
	  return 0;
	}
}
// Function to get token paired currency value
// accepts wei & BigNumber of all decimals; XEON, USDT, USDC, WETH
// outputs Number ready to display
// Rename to getUnderlyingValue
async function getTokenETHValue(underlyingTokenAddr, bigIntBalanceInput) {
    try {
        // Convert balance to string
        const input_balance = bigIntBalanceInput.toString();
        console.log('>input: ' + input_balance + ', token: ' + underlyingTokenAddr + ' bal: ' + bigIntBalanceInput);

        const result = await hedgingInstance.methods.getUnderlyingValue(underlyingTokenAddr, input_balance).call();
        
        const underlyingValue = result[0];
        const pairedAddress = result[1];

        if (!result) {
            console.error("Invalid result:", result);
            return [new BigNumber(0), ''];
        }
        // convert from BigNumber to Number
        const pairedAddressDecimal = await getTokenDecimals(pairedAddress);
        const balance = new BigNumber(underlyingValue).div(new BigNumber(10).pow(pairedAddressDecimal));
        const trueValue = Number(balance);

        let pairSymbol;
        if (pairedAddress === '0xdac17f958d2ee523a2206206994597c13d831ec7') {
            pairSymbol = 'USDT';
        } else if (pairedAddress === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
            pairSymbol = 'USDC';
        } else if (pairedAddress === CONSTANTS.wethAddress) {
            pairSymbol = 'WETH';
        }
		console.log('<output: ' + result[0] + ', token: ' + result[1] + ', TV: ' + trueValue + ', ' + pairSymbol);
        return [trueValue, pairSymbol];
    } catch (error) {
        console.error("Error getting token ETH value:", error);
        return [new BigNumber(0), ''];
    }
}

export { getUserHedgeVolume };