import { CONSTANTS } from './constants.js';
import { updateSectionValues_HedgeCard, updateSectionValues_Progress, updateSectionValues_Gains } from './module-hedge-section-updaters.js';

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

        // Update Charts and Graphics
        // Step 4: Update asset bubbles & type of asset basket
        // use chart updater function, like in networth, wc accepts values to display all; bubbles, price chart, etc
        // this way its easy to create a default load & separate an actual data update
        updateChartValues_Hedge(
            
        );
    } catch (error) {
        console.error("Error fetching Hedge Panel section data:", error);
    }
}

// 2. Fetch Section Values - ERC20 DEPOSIT BALANCES LIST
//---------------------------------------------------
async function fetchSection_BalanceList(){
	const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];

	await userTokenList(userAddress);
	await cashierErc20List(userAddress);

}

// 3. Fetch Section Values - HEDGING PANEL
//----------------------------------------------------
async function fetchSection_HedgePanel(){

	const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];
	// Fetch arrays
	const userOptionsCreated = await hedgingInstance.methods.myoptionsCreated(userAddress).call();
	const userSwapsCreated = await hedgingInstance.methods.myswapsCreated(userAddress).call();
	const userOptionsTaken = await hedgingInstance.methods.myoptionsTaken(userAddress).call();
	const userSwapsTaken = await hedgingInstance.methods.myswapsTaken(userAddress).call();
	const userOptionsHistory = await hedgingInstance.methods.myoptionsHistory(userAddress).call();
	const userSwapsHistory = await hedgingInstance.methods.myswapsHistory(userAddress).call();
	// Fetch volume
	const userWrite = await hedgingInstance.methods.getuserWriteVolume(userAddress).call();
	const userTake = await hedgingInstance.methods.getuserTakeVolume(userAddress).call();
	// Fetch profits and losses: WETH, USDT, USDC support only for now
	const userProfitWETH = await hedgingInstance.methods.getUserProfits(CONSTANTS.wethAddress, userAddress).call();
	const userProfitUSDT = await hedgingInstance.methods.getUserProfits(CONSTANTS.usdtAddress, userAddress).call();
	const userProfitUSDC = await hedgingInstance.methods.getUserProfits(CONSTANTS.usdcAddress, userAddress).call();
	const userLossWETH = await hedgingInstance.methods.getUserLosses(CONSTANTS.wethAddress, userAddress).call();
	const userLossUSDT = await hedgingInstance.methods.getUserLosses(CONSTANTS.usdtAddress, userAddress).call();
	const userLossUSDC = await hedgingInstance.methods.getUserLosses(CONSTANTS.usdcAddress, userAddress).call();
	// Fetch ETH to USD conversion rate
	const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

	// Step 1: Convert lengths
	const userOptionsCreatedCount = userOptionsCreated.length;
	const userSwapsCreatedCount = userSwapsCreated.length;
	const userHedgesCreated = userOptionsCreatedCount + userSwapsCreatedCount;

	const userOptionsTakenCount = userOptionsTaken.length;
	const userSwapsTakenCount = userSwapsTaken.length;
	const userHedgesTaken = userOptionsTakenCount + userSwapsTakenCount;
	
	const userOptionsHistoryCount = userOptionsHistory.length;
	const userSwapsHistoryCount = userSwapsHistory.length;
	
	// Step 2: Convert amounts
	const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;

	const userWriteEth = new BigNumber(userWrite[0]).div(10 ** wethDecimals);
	const userWriteUsdt = new BigNumber(userWrite[1]).div(10 ** usdtDecimals);
	const userWriteUsdc = new BigNumber(userWrite[2]).div(10 ** usdcDecimals);
	const totalWriteTWETH = userWriteEth + (userWriteUsdt / ethUsdPrice) + (userWriteUsdc / ethUsdPrice);	
	
	const userTakeEth = new BigNumber(userTake[0]).div(10 ** wethDecimals);
	const userTakeUsdt = new BigNumber(userTake[1]).div(10 ** usdtDecimals);
	const userTakeUsdc = new BigNumber(userTake[2]).div(10 ** usdcDecimals);
	const totalTakeTWETH = userTakeEth + (userTakeUsdt / ethUsdPrice) + (userTakeUsdc / ethUsdPrice);

	const userProfitEth = new BigNumber(userProfitWETH).div(10 ** wethDecimals);
	const userProfitUsdt = new BigNumber(userProfitUSDT).div(10 ** usdtDecimals);
	const userProfitUsdc = new BigNumber(userProfitUSDC).div(10 ** usdcDecimals);
	const totalProfitTWETH = userProfitEth + (userProfitUsdt / ethUsdPrice) + (userProfitUsdc / ethUsdPrice);

	const userLossEth = new BigNumber(userLossWETH).div(10 ** wethDecimals);
	const userLossUsdt = new BigNumber(userLossUSDT).div(10 ** usdtDecimals);
	const userLossUsdc = new BigNumber(userLossUSDC).div(10 ** usdcDecimals);
	const totalLossTWETH = userLossEth + (userLossUsdt / ethUsdPrice) + (userLossUsdc / ethUsdPrice);

	updateSectionValues_Hedges(
		userHedgesCreated,
		userHedgesTaken,
		totalWriteTWETH,
		totalTakeTWETH,
		userOptionsHistoryCount,
		userSwapsHistoryCount,
		totalProfitTWETH,
		totalLossTWETH
	);

}

// 4. Fetch Section Values - REWARDS PANEL
//----------------------------------------------------
async function fetchSection_RewardsPanel(){
	
	const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];
	// Fetch rewards due
	const userRewardsDue = await stakingInstance.methods.getRewardsDue(userAddress).call();
	const userLiqRewardsDue = await stakingInstance.methods.getLiquidityRewardsDue(userAddress).call();
	const userColRewardsDue = await stakingInstance.methods.getCollateralRewardsDue(userAddress).call();
	// ~ mining rewards are automatically credited to miner on every hedge settlement.
	// ~ mining rewards are accumulated in the token addresses of underlying & pair, endless erc20 fee types
	// ~ mining rewards are not automatically loaded to wallet page as they need to be populated from past events
	
	// Fetch rewards claimed
	const userRewardsClaimed = await stakingInstance.methods.stakerRewardsClaimed(userAddress).call();
	const userLiqRewardsClaimed = await stakingInstance.methods.stakerLiquidityClaimed(userAddress).call();
	const userColRewardsClaimed = await stakingInstance.methods.stakerCollateralClaimed(userAddress).call();
	
	// Fetch ETH to USD conversion rate
	const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

	// Step 1: Convert amounts
	const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;

	// Step 2: Convert eth values
	const userRewardsDueEth = new BigNumber(userRewardsDue).div(10 ** wethDecimals);
	const userLiqRewardsDueEth = new BigNumber(userLiqRewardsDue).div(10 ** wethDecimals);
	const userColRewardsDueEth = new BigNumber(userColRewardsDue).div(10 ** wethDecimals);
	const totalRewardsDueWETH = userRewardsDueEth + userLiqRewardsDueEth + userColRewardsDueEth;

	const userRewardsClaimedEth = new BigNumber(userRewardsClaimed).div(10 ** wethDecimals);
	const userLiqRewardsClaimedEth = new BigNumber(userLiqRewardsClaimed).div(10 ** wethDecimals);
	const userColRewardsClaimedEth = new BigNumber(userColRewardsClaimed).div(10 ** wethDecimals);
	const totalRewardsClaimedWETH = userRewardsClaimedEth + userLiqRewardsClaimedEth + userColRewardsClaimedEth;

	// Step 3: Convert usdt values
	const userRewardsDueUSDT = userRewardsDueEth * ethUsdPrice;
	const userLiqRewardsDueUSDT = userLiqRewardsDueEth * ethUsdPrice;
	const userColRewardsDueUSDT = userColRewardsDueEth * ethUsdPrice;	
	const totalRewardsDueUSDT = userRewardsDueUSDT + userLiqRewardsDueUSDT + userColRewardsDueUSDT;

	const userRewardsClaimedUSDT = userRewardsClaimedEth * ethUsdPrice;
	const userLiqRewardsClaimedUSDT = userLiqRewardsClaimedEth * ethUsdPrice;
	const userColRewardsClaimedUSDT = userColRewardsClaimedEth * ethUsdPrice;
	const totalRewardsClaimedUSDT = userRewardsClaimedUSDT + userLiqRewardsClaimedUSDT + userColRewardsClaimedUSDT;

	updateSectionValues_Rewards(
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
	);

}

// 5. Fetch Section Values - STAKING PANEL
//----------------------------------------------------
async function fetchSection_StakingPanel(){
	
	const accounts = await web3.eth.requestAccounts();
	const userAddress = accounts[0];
	
	const walletBalanceRaw = await neonInstance.methods.balanceOf(userAddress).call();
	const stakedBalanceRaw = await stakingInstance.methods.getStakedBalance(userAddress).call();
	const depositedBalanceRaw = await hedgingInstance.methods.getuserTokenBalances(CONSTANTS.neonAddress, userAddress).call();
	const [deposited, withdrawn] = depositedBalanceRaw;
	// Staked versus Supply
	const totalStakedRaw = await stakingInstance.methods.getTotalStaked().call();
	const circulatingSupplyRaw = await tokenInst.circulatingSupply(); 
	// Distrubuted ETH rewards to staking contract
	const distributedRewards = await stakingInstance.methods.ethRewardBasis().call();
	const distributedRewardsLiqu = await stakingInstance.methods.ethLiquidityRewardBasis().call();
	const distributedRewardsColl = await stakingInstance.methods.ethCollateralRewardBasis().call();
	// Claimed ETH rewards to staking contract
	const claimedRewards = await stakingInstance.methods.rewardsClaimed().call(userAddress);
	const claimedRewardsLiqu = await stakingInstance.methods.rewardsClaimedLiquidity(userAddress).call();
	const claimedRewardsColl = await stakingInstance.methods.rewardsClaimedCollateral(userAddress).call();
	// My pool assignments
	const assignmentsRaw = await stakingInstance.methods.getAssignedAndUnassignedAmounts(userAddress).call();
	const [assignedMiningRaw, assignedLiquidityRaw, assignedCollateralRaw, unassignedRaw] = assignmentsRaw;
	
	// Fetch ETH to USD conversion rate
	const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();
	const tokenUsdPrice = await getTokenUSDValue();

	// Step 1: Convert amounts
	const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;
	
	// Step 2: Convert normal values
	const walletBalance = new BigNumber(walletBalanceRaw).div(10 ** CONSTANTS.decimals);
	const stakedBalance = new BigNumber(stakedBalanceRaw).div(10 ** CONSTANTS.decimals);
	const depositedBalance = new BigNumber(deposited).div(10 ** CONSTANTS.decimals);
	const withdrawnBalance = new BigNumber(withdrawn).div(10 ** CONSTANTS.decimals);
	const totalHoldings = walletBalance + stakedBalance + (depositedBalance - withdrawnBalance);

	const totalStaked = new BigNumber(totalStakedRaw).div(10 ** CONSTANTS.decimals);
	const circulatingSupply = new BigNumber(circulatingSupplyRaw).div(10 ** CONSTANTS.decimals);

	const distributedRewardsEth = new BigNumber(distributedRewards).div(10 ** wethDecimals);
	const distributedRewardsLiquEth = new BigNumber(distributedRewardsLiqu).div(10 ** wethDecimals);
	const distributedRewardsCollEth = new BigNumber(distributedRewardsColl).div(10 ** wethDecimals);
	const distributedRewardsTotalEth = distributedRewardsEth + distributedRewardsLiquEth + distributedRewardsCollEth;
	
	const claimedRewardsEth = new BigNumber(claimedRewards).div(10 ** wethDecimals);
	const claimedRewardsLiquEth = new BigNumber(claimedRewardsLiqu).div(10 ** wethDecimals);
	const claimedRewardsCollEth = new BigNumber(claimedRewardsColl).div(10 ** wethDecimals);
	const claimedRewardsTotalEth = distributedRewardsEth + distributedRewardsLiquEth + distributedRewardsCollEth;

	const assignedMining = new BigNumber(assignedMiningRaw).div(10 ** CONSTANTS.decimals);
	const assignedLiquidity = new BigNumber(assignedLiquidityRaw).div(10 ** CONSTANTS.decimals);
	const assignedCollateral = new BigNumber(assignedCollateralRaw).div(10 ** CONSTANTS.decimals);
	const unassigned = new BigNumber(unassignedRaw).div(10 ** CONSTANTS.decimals);
	const totalAssigned = assignedMining + assignedLiquidity + assignedCollateral;

	// Step 3: Convert usdt values
	const walletBalanceUSDT = walletBalance * getTokenUSDValue;
	const stakedBalanceUSDT = stakedBalance * getTokenUSDValue;
	const depositedBalanceUSDT = depositedBalance * getTokenUSDValue;
	const withdrawnBalanceUSDT = withdrawnBalance * getTokenUSDValue;
	const totalHoldingsUSDT = totalHoldings * getTokenUSDValue;

	const totalStakedUSDT = totalStaked * getTokenUSDValue;
	const circulatingSupplyUSDT = circulatingSupply * getTokenUSDValue;

	const distributedRewardsUSDT = distributedRewardsEth * ethUsdPrice;
	const distributedRewardsLiqUSDT = distributedRewardsLiquEth * ethUsdPrice;	
	const distributedRewardsColUSDT = distributedRewardsCollEth * ethUsdPrice;	
	const distributedRewardsTotalUSDT = distributedRewardsTotalEth * ethUsdPrice;

	const claimedRewardsUSDT = claimedRewardsEth * ethUsdPrice;
	const claimedRewardsLiqUSDT = claimedRewardsLiquEth * ethUsdPrice;	
	const claimedRewardsColUSDT = claimedRewardsCollEth * ethUsdPrice;	
	const claimedRewardsTotalUSDT = claimedRewardsTotalEth * ethUsdPrice;

	const assignedMiningUSDT = assignedMining * tokenUsdPrice;
	const assignedLiquidityUSDT = assignedLiquidity * tokenUsdPrice;
	const assignedCollateralUSDT = assignedCollateral * tokenUsdPrice;
	const unassignedUSDT = unassigned * tokenUsdPrice;
	const totalAssignedUSDT = assignedMiningUSDT + assignedLiquidityUSDT + assignedCollateralUSDT;

	updateSectionValues_Staking(
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
	);

}

// Export the fetch functions
export { fetchSection_Networth, fetchSection_BalanceList, fetchSection_HedgePanel, fetchSection_RewardsPanel, fetchSection_StakingPanel };