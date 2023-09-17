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
        const hedgeTypeDiv = document.querySelector('.hedgetype');        
        // Get the hedgeType value
        const hedgeTypeValue = hedgeTypeMapping[hedgeType] || { text: 'Unknown', color: '#000000' };
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

function updateSectionValues_Rewards(
    totalRewardsDueWETH,
    totalRewardsDueUSDT,
    totalRewardsClaimedWETH,
    totalRewardsClaimedUSDT,
    userRewardsDueEth,
    userRewardsDueUSDT,
    userLiqRewardsDueEth,
    userLiqRewardsDueUSDT,
    userColRewardsDueEth,
    userColRewardsDueUSDT,
    userRewardsClaimedEth,
    userRewardsClaimedUSDT,
    userLiqRewardsClaimedEth,
    userLiqRewardsClaimedUSDT,
    userColRewardsClaimedEth,
    userColRewardsClaimedUSDT
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

function updateSectionValues_Staking(
    walletBalance,
    stakedBalance,
    depositedBalance,
    withdrawnBalance,
    totalHoldings,
    totalStaked,
    circulatingSupply,
    distributedRewardsEth,
    distributedRewardsLiquEth,
    distributedRewardsCollEth,
    distributedRewardsTotalEth,
    claimedRewardsEth,
    claimedRewardsLiquEth,
    claimedRewardsCollEth,
    claimedRewardsTotalEth,
    assignedMining,
    assignedLiquidity,
    assignedCollateral,
    unassigned,
    totalAssigned,
    walletBalanceUSDT,
    stakedBalanceUSDT,
    depositedBalanceUSDT,
    withdrawnBalanceUSDT,
    totalHoldingsUSDT,
    totalStakedUSDT,
    circulatingSupplyUSDT,
    distributedRewardsUSDT,
    distributedRewardsLiqUSDT,
    distributedRewardsColUSDT,
    distributedRewardsTotalUSDT,
    claimedRewardsUSDT,
    claimedRewardsLiqUSDT,
    claimedRewardsColUSDT,
    claimedRewardsTotalUSDT,
    assignedMiningUSDT,
    assignedLiquidityUSDT,
    assignedCollateralUSDT,
    unassignedUSDT,
    totalAssignedUSDT
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

    // Update staking panel
    document.getElementById("stakedBalanceAmnt").textContent = formatString(stakedBalance);
    document.getElementById("stakedBalanceValue").textContent = formatString(stakedBalanceUSDT);
    document.getElementById("totalBalanceAmnt").textContent = formatString(totalHoldings);
    document.getElementById("totalBalanceValue").textContent = formatString(totalHoldingsUSDT);
    document.getElementById("stakedSupplyAmnt").textContent = formatString(totalStaked);
	document.getElementById("stakedSupplyValue").textContent = formatString(totalStakedUSDT);
    document.getElementById("circSupplyAmnt").textContent = formatString(circulatingSupply);
    document.getElementById("circSupplyValue").textContent = formatString(circulatingSupplyUSDT);
    document.getElementById("divDistributedAmnt").textContent = formatString(distributedRewardsTotalEth);
    document.getElementById("divDistributedValue").textContent = formatString(distributedRewardsTotalUSDT);
    document.getElementById("divClaimedAmnt").textContent = formatString(claimedRewardsTotalEth);
    document.getElementById("divClaimedValue").textContent = formatString(claimedRewardsTotalUSDT);

    document.getElementById("tokensAvailableWallet").textContent = formatString(walletBalance);
    document.getElementById("tokensStakedWallet").textContent = formatString(stakedBalance);
    
    // Update assignments panel
    document.getElementById("mystakedTokensAmnt").textContent = formatString(stakedBalance);
    document.getElementById("myStakedTokensValue").textContent = formatString(stakedBalanceUSDT);
    document.getElementById("myAssignedAmnt").textContent = formatString(totalAssigned);
    document.getElementById("myAssignedValue").textContent = formatString(totalAssignedUSDT);
    document.getElementById("myUnassignedAmnt").textContent = formatString(unassigned);
    document.getElementById("myUnassignedValue").textContent = formatString(unassignedUSDT);

    document.getElementById("assignedToLiquidityAmnt").textContent = formatString(assignedLiquidity);
    document.getElementById("assignedToLiquidityAmnt").textContent = formatString(assignedLiquidityUSDT);
    document.getElementById("assignedToCollateralAmnt").textContent = formatString(assignedCollateral);
    document.getElementById("assignedToCollateralValue").textContent = formatString(assignedCollateralUSDT);
    document.getElementById("assignedToMiningAmnt").textContent = formatString(assignedMining);
    document.getElementById("assignedToMiningValue").textContent = formatString(assignedMiningUSDT);
    
}
// Export the fetch functions
export { updateSectionValues_Networth, updateSectionValues_Hedges, updateSectionValues_Rewards, updateSectionValues_Staking };