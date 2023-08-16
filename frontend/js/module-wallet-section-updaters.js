// Update Section Values - Networth
function updateSectionValues_Networth(
    userAddress,
    walletBalance,
    stakedBalance,
    totalDepositsUSD,
    totalRewardsDueUSD,
    totalCommissionDueETH,
    totalCommissionDueUSD,
    transactedTokensCount,
    netWorthUSD
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

        var first = userAddress.substring(0, 5);//get first chars
        var last = userAddress.slice(userAddress.length - 3);//get last chars
        var privatize = first+'..'+last;
    
        // Update wallet address
        document.getElementById("walletAddress").textContent = privatize;
        document.getElementById("stakedBalance").textContent = formatString(stakedBalance);
        document.getElementById("walletBalance").textContent = formatString(walletBalance);
        document.getElementById("netWorthUSD").textContent = formatStringDecimal(netWorthUSD);
        document.getElementById("netDepositsUSD").textContent = formatStringDecimal(totalDepositsUSD);
        document.getElementById("netRewardsUSD").textContent = formatStringDecimal(totalRewardsDueUSD);
        document.getElementById("netCommissionUSD").textContent = formatStringDecimal(totalCommissionDueUSD);
        document.getElementById("tokensCount").textContent = formatValue(transactedTokensCount);
    } catch (error) {
        console.error("Error Updating Net Worth section data:", error);
    }
}

// Update Section Values - Networth
function updateSectionValues_Hedges(
	userHedgesCreated,
	userHedgesTaken,
	totalWriteTWETH,
	totalTakeTWETH,
	userOptionsHistoryCount,
	userSwapsHistoryCount,
	totalProfitTWETH,
	totalLossTWETH
	) {
    
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
  
    // Update panel
    document.getElementById("hedgesCreatedCount").textContent = userHedgesCreated;
    document.getElementById("hedgesTakenCount").textContent = userHedgesTaken;
	document.getElementById("writeVolume").textContent = formatString(totalWriteTWETH);
    document.getElementById("takeVolume").textContent = formatString(totalTakeTWETH);
    document.getElementById("optionsCount").textContent = userOptionsHistoryCount;
    document.getElementById("swapsCount").textContent = userSwapsHistoryCount;
    document.getElementById("profitsETH").textContent = formatString(totalProfitTWETH);
    document.getElementById("lossesETH").textContent = formatString(totalLossTWETH);
}

// Export the fetch functions
export { updateSectionValues_Networth, updateSectionValues_Hedges };