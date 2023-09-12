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

function updateSectionValues_StakingRewards(
    totalRewardsDueWETH,
    totalRewardsDueUSDT,
    totalRewardsClaimedWETH,
    totalRewardsClaimedUSDT,
    userRewardsDueEth,
    userRewardsDueUSDT,
    userLiqRewardsDueEth,
    userLiqRewardsDueUSDT,
    userColRewardsDueEth,
    userColRewardsDueUSDT
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

    // Update rewards due panel
    document.getElementById("totalRewardsDueAmnt").textContent = totalRewardsDueWETH;
    document.getElementById("rewardsDueAmnt").textContent = userRewardsDueEth;
    document.getElementById("rewardsDueAmntLiq").textContent = userLiqRewardsDueEth;
    document.getElementById("rewardsDueAmntLend").textContent = userColRewardsDueEth;
    

	document.getElementById("totalRewardsDueValue").textContent = formatString(totalRewardsDueUSDT);
    document.getElementById("rewardsDueValue").textContent = formatString(userRewardsDueUSDT);
    document.getElementById("rewardsDueValueLend").textContent = formatString(userLiqRewardsDueUSDT);
    document.getElementById("rewardsDueValueLiq").textContent = formatString(userColRewardsDueUSDT);

    // Update rewards claimed panel
    document.getElementById("totalRewardsClaimedAmnt").textContent = totalRewardsClaimedWETH;
    document.getElementById("rewardsClaimedAmnt").textContent = userRewardsClaimedEth;
    document.getElementById("rewardsClaimedAmntLiq").textContent = userLiqRewardsClaimedEth;
    document.getElementById("rewardsClaimedAmntLend").textContent = userColRewardsClaimedEth;

    document.getElementById("totalRewardsClaimedValue").textContent = formatString(totalRewardsClaimedUSDT);
    document.getElementById("rewardsClaimedValue").textContent = formatString(userRewardsClaimedUSDT);
    document.getElementById("rewardsClaimedValueLend").textContent = formatString(userLiqRewardsClaimedUSDT);
    document.getElementById("rewardsClaimedValueLiq").textContent = formatString(userColRewardsClaimedUSDT);
}

// Export the fetch functions
export { updateSectionValues_Networth, updateSectionValues_Hedges, updateSectionValues_StakingRewards };