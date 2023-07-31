/*
MyLibrary.network = "0x5"; //goerli 0x5 //bsc: 0x56
MyLibrary.etherScan = "https://goerli.etherscan.io"; //https://goerli.etherscan.io //https://bscscan.com/
MyLibrary.decimals = 18;
MyLibrary.platformAddress = '0x135Ca6fff3EcCd186d1bb4B518679e17115d0867';
MyLibrary.liquidity_pool_addy = '0x331bF350378d53Ac31d1D0520481000ca338ef27'; 

MyLibrary.wethAddress = '0xd0A1E359811322d97991E03f863a0C30C2cF029C';
MyLibrary.usdtAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
MyLibrary.usdcAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
MyLibrary.UniswapUSDCETH_LP = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc";

MyLibrary.popuptimer = 20;
MyLibrary.contractABI = [];

//Initialize WEB3
try{
	if (typeof window.ethereum == 'undefined') {
		swal({title: "Hold on!",type: "error",confirmButtonColor: "#F27474",text: "metamask missing, so is the full experience now..."});
	}else if (typeof window.ethereum !== 'undefined') {
		//Metamask on browser, get provider
		window.web3 = new Web3(window.ethereum);
		//Set instance
		window.contract = new window.web3.eth.Contract(MyLibrary.contractABI, MyLibrary.tokenAddress);		
	}
}
catch(error) {}
*/


/*
// Get the initial values of net profit and net loss from Solidity contract
async function getInitialValues() {
  const netProfit = await contract.methods.netProfit().call();
  const netLoss = await contract.methods.netLoss().call();

  // Update the chart with the initial values
  updateChartValues(netProfit, netLoss);
}

// Subscribe to the Profit event
contract.events.Profit({ fromBlock: 'latest' }, async (error, event) => {
  if (error) {
    console.error('Error:', error);
    return;
  }

  const amount = event.returnValues.amount;

  // Update the netProfit and netLoss values from Solidity contract
  const netProfit = await contract.methods.netProfit().call();
  const netLoss = await contract.methods.netLoss().call();

  // Update the chart with the new values
  updateChartValues(netProfit, netLoss);
});

// Subscribe to the Loss event
contract.events.Loss({ fromBlock: 'latest' }, async (error, event) => {
  if (error) {
    console.error('Error:', error);
    return;
  }

  const amount = event.returnValues.amount;

  // Update the netProfit and netLoss values from Solidity contract
  const netProfit = await contract.methods.netProfit().call();
  const netLoss = await contract.methods.netLoss().call();

  // Update the chart with the new values
  updateChartValues(netProfit, netLoss);
});

// Function to update the Net Profit versus Net Loss chart
function updateChartValues(netProfit, netLoss) {
  const chartData = [netProfit, netLoss];

  // Get the chart canvas element
  const chartCanvas = document.getElementById('netProfitLossChart').getContext('2d');

  // Create the chart
  new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: ['Net Profit', 'Net Loss'],
      datasets: [{
        label: 'Net Profit versus Net Loss',
        data: chartData,
        backgroundColor: ['#36A2EB', '#FF6384']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Call the function to get initial values and set up the chart
getInitialValues();

*/

// Define section WIDGET variables globally
// Set initial values in HTML, zeros on all widgets

// Define CHART variables globally
var netProfitChart = null;
var netCashingChart = null;
var cashingPieChart = null;
var hedgeBarChartA = null;
var hedgeBarChartB = null;
var hedgeBarChartC = null;
var hedgeBarChartD = null;
var dividentsChart = null;
var revenuePieChart = null;
var claimsPieChart = null;
var stakesBarChart = null;
var tokenomicsPieChart = null;

// FunctionS to set initial section values
// NOT NEEDED; since initials are set in HTML, zeros on all widgets

/***************************************
// FunctionS to set initial CHART values
/****************************************/
function setInitial_StakingChart() {
    const totalStaked = 100000000;
    const totalSupply = 300000000;

    updateChartValues_Staking(totalStaked, totalSupply);
}

function setInitial_CashingChart() {
    const initialNetDeposit = 15000;
    const initialNetWithdraw = -9000;

    updateChartValues_Cash(initialNetDeposit, initialNetWithdraw);
}

function setInitial_CashingChartPie() {
    const initialWeth = 200000;
    const initialUSDT = 450000;
    const initialUSDC = 350000;
    const initialERC20 = 720000;

    updateChartValues_PIE(initialWeth, initialUSDT, initialUSDC, initialERC20);
}

function setInitial_hedgesChartA() {
    const hedgesChartID = 1;
    const initialTraded = 7000;
    const initialCreated = 8000;

    updateChartValues_hedges(hedgesChartID, initialTraded, initialCreated);
}

function setInitial_hedgesChartB() {
    const hedgesChartID = 2;
    const initialSwapsVolume = 3000;
    const initialOptionsVolume = 5000;

    updateChartValues_hedges(hedgesChartID, initialSwapsVolume, initialOptionsVolume);
}

function setInitial_hedgesChartC() {
    const hedgesChartID = 3;
    const initialHedgeCost = 500;
    const initialHedgeValue = 5000;

    updateChartValues_hedges(hedgesChartID, initialHedgeCost, initialHedgeValue);
}

function setInitial_hedgesChartD() {
    const hedgesChartID = 4;
    const initialHedgeProfits = 4000;
    const initialHedgeLosses = 2000;
    updateChartValues_hedges(hedgesChartID, initialHedgeProfits, initialHedgeLosses);
    
}

function setInitial_dividentsChart() {
    const initialDistributed = 8000;
    const initialClaimed = 6000;

    updateChartValues_Dividents(initialDistributed, initialClaimed);
}

function setInitial_claimsChart() {
    const initialClaimed = 5000;
    const initialUnclaimed = 2500;

    updateChartValues_Claims(initialClaimed, initialUnclaimed);
}

function setInitial_revenueChart() {
    const cashierRevenueTUSD = 1000;
    const hedgeRevenueTUSD = 1500;
    const tokenTaxRevenueTUSD = 1200;

    updateChartValues_Revenue(cashierRevenueTUSD, hedgeRevenueTUSD, tokenTaxRevenueTUSD);
}

function setInitial_TokenomicsChart() {
    const burntSupplyTOKENS = 10000000;
    const circulatingSupplyTOKENS = 290000000;

    updateChartValues_Tokenomics(burntSupplyTOKENS, circulatingSupplyTOKENS);
}

/*************************************** */
// FunctionS to set current section values
/*************************************** */
async function setCurrent_TrafficSection() {
    // Step 1: Read
    const wethBalances = await contract.methods.contractBalanceMap(wethAddress).call();
    const wethDeposits = wethBalances[0];
    const wethWithdrawals = wethBalances[1];
    const usdtBalances = await contract.methods.contractBalanceMap(usdtAddress).call();
    const usdtDeposits = usdtBalances[0];
    const usdtWithdrawals = usdtBalances[1];
    const usdcBalances = await contract.methods.contractBalanceMap(usdcAddress).call();
    const usdcDeposits = usdcBalances[0];
    const usdcWithdrawals = usdcBalances[1];
    const erc20Deposits = await contract.methods.getErc20Deposits().call();
    const wethERC20Deposits = erc20Deposits[0];
    const usdtERC20Deposits = erc20Deposits[1];
    const usdcERC20Deposits = erc20Deposits[2];
    const erc20Withdrawals = await contract.methods.getErc20Withdrawals().call();
    const wethERC20Withdrawals = erc20Withdrawals[0];
    const usdtERC20Withdrawals = erc20Withdrawals[1];
    const usdcERC20Withdrawals = erc20Withdrawals[2];
    // Step 2: ETH USD price
    const ethUsdcPrice = await getCurrentEthUsdcPriceFromUniswapV2();
    
    // Step 3: Convert WETH amounts
    const wethDecimals = 18; 
    const totalDepositWeth = new BigNumber(wethDeposits).div(10 ** wethDecimals);
    const totalWithdrawalWeth = new BigNumber(wethWithdrawals).div(10 ** wethDecimals);

    // Step 4: Convert USDT amounts
    const usdtDecimals = 6; 
    const totalDepositUSDT = new BigNumber(usdtDeposits).div(10 ** usdtDecimals);
    const totalWithdrawalUSDT = new BigNumber(usdtWithdrawals).div(10 ** usdtDecimals);

    // Step 5: Convert USDC amounts
    const usdcDecimals = 6;
    const totalDepositUSDC = new BigNumber(usdcDeposits).div(10 ** usdcDecimals);
    const totalWithdrawalUSDC = new BigNumber(usdcWithdrawals).div(10 ** usdcDecimals);

    // Step 6: Convert ERC20 amounts
    const totalDepositERC20weth = new BigNumber(wethERC20Deposits).div(10 ** wethDecimals);
    const totalWithdrawalERC20weth = new BigNumber(wethERC20Withdrawals).div(10 ** wethDecimals);
    const totalDepositERC20usdt = new BigNumber(usdtERC20Deposits).div(10 ** usdtDecimals);
    const totalWithdrawalERC20usdt = new BigNumber(usdtERC20Withdrawals).div(10 ** usdtDecimals);
    const totalDepositERC20usdc = new BigNumber(usdcERC20Deposits).div(10 ** usdcDecimals);
    const totalWithdrawalERC20usdc = new BigNumber(usdcERC20Withdrawals).div(10 ** usdcDecimals);

    // Step 7: Calculate the total deposit amount in USD
    const totalDepositAmountUsd = (totalDepositWeth.times(ethUsdcPrice))
        .plus(totalDepositUSDT)
        .plus(totalDepositUSDC)
        .plus(totalDepositERC20weth.times(ethUsdcPrice))
        .plus(usdtERC20Deposits)
        .plus(usdcERC20Deposits);

    // Step 8: Calculate the total withdrawal amount in USD
    const totalWithdrawalAmountUsd = (totalWithdrawalWeth.times(ethUsdcPrice))
        .plus(totalWithdrawalUSDT)
        .plus(totalWithdrawalUSDC)
        .plus(totalWithdrawalERC20weth.times(ethUsdcPrice))
        .plus(usdtERC20Withdrawals)
        .plus(usdcERC20Withdrawals);

    // Step X: Calculate ERC20 total deposits
    const totalDepositERC20_weth = totalDepositERC20weth.plus(totalDepositERC20usdt.div(ethUsdcPrice)).plus(totalDepositERC20usdc.div(ethUsdcPrice));
    const totalDepositERC20 = totalDepositERC20_weth.times(ethUsdcPrice);

    const totalWithdrawalERC20_weth = totalDepositERC20weth.plus(totalWithdrawalERC20usdt.div(ethUsdcPrice)).plus(totalWithdrawalERC20usdc.div(ethUsdcPrice));
    const totalWithdrawalERC20 = totalWithdrawalERC20_weth.times(ethUsdcPrice);

    // Step X: Calculate the total transaction volume in USD
    const transactionVolume = totalDepositAmountUsd.plus(totalWithdrawalAmountUsd);

    const activeERC20S = await contract.methods.getDepositedTokensLength().call();

    // Update the section with current values from protocol
    updateSectionValues_Traffic(
        activeWallets, 
        activeERC20S, 
        transactionVolume, 
        hedgeVolume, 
        totalDepositWeth, 
        totalDepositUSDT, 
        totalDepositUSDC, 
        totalDepositERC20, 
        totalWithdrawalWeth, 
        totalWithdrawalUSDT, 
        totalWithdrawalUSDC, 
        totalWithdrawalERC20
    );

    // Update the section charts
    updateChartValues_Cash(totalDepositAmountUsd, totalWithdrawalAmountUsd);
}

async function setCurrent_HedgeSection() {
    // Assuming you have a contract instance named 'contractInstance' to interact with your Solidity contract
    // Returned as (weth, usdt, usdc, erc20s) erc20s are sold at 10% discount in weth
    const hedgesCreated = await contractInstance.getHedgesCreatedValue();
    const hedgesTraded = await contractInstance.getHedgesTakenValue();
    const optionsVolume = await contractInstance.getHedgesOptionsValue();
    const swapsVolume = await contractInstance.getHedgesSwapsValue();    
    const hedgeCosts = await contractInstance.getHedgesCostValue();
    const hedgeProfits = await contractInstance.getHedgesProfitsValue(); // base values tracker after discounted liquidation
    const hedgeFees = await contractInstance.getHedgesFeesValue(); // base values tracker after discounted liquidation
  
    // Fetch ETH to USD conversion rate
    const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

    // Step 3: Convert WETH amounts
    const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;

    const hedgesCreatedEth = new BigNumber(hedgesCreated[0]).div(10 ** wethDecimals);
    const hedgesCreatedUsdt = new BigNumber(hedgesCreated[1]).div(10 ** usdtDecimals);
    const hedgesCreatedUsdc = new BigNumber(hedgesCreated[2]).div(10 ** usdcDecimals);
    const hedgesCreatedTUSD = (hedgesCreatedEth * ethUsdPrice) + hedgesCreatedUsdt + hedgesCreatedUsdc;
    
    const hedgesTradedEth = new BigNumber(hedgesTraded[0]).div(10 ** wethDecimals);
    const hedgesTradedUsdt = new BigNumber(hedgesTraded[1]).div(10 ** usdtDecimals);
    const hedgesTradedUsdc = new BigNumber(hedgesTraded[2]).div(10 ** usdcDecimals);
    const hedgesTradedTUSD = (hedgesTradedEth * ethUsdPrice) + hedgesTradedUsdt + hedgesTradedUsdc;

    const optionsVolumeEth = new BigNumber(optionsVolume[0]).div(10 ** wethDecimals);
    const optionsVolumeUsdt = new BigNumber(optionsVolume[1]).div(10 ** usdtDecimals);
    const optionsVolumeUsdc = new BigNumber(optionsVolume[2]).div(10 ** usdcDecimals);
    const optionsVolumeTUSD = (optionsVolumeEth * ethUsdPrice) + optionsVolumeUsdt + optionsVolumeUsdc;

    const swapsVolumeEth = new BigNumber(swapsVolume[0]).div(10 ** wethDecimals);
    const swapsVolumeUsdt = new BigNumber(swapsVolume[1]).div(10 ** usdtDecimals);
    const swapsVolumeUsdc = new BigNumber(swapsVolume[2]).div(10 ** usdcDecimals);
    const swapsVolumeTUSD = (swapsVolumeEth * ethUsdPrice) + swapsVolumeUsdt + swapsVolumeUsdc;

    const hedgeCostsEth = new BigNumber(hedgeCosts[0]).div(10 ** wethDecimals);
    const hedgeCostsUsdt = new BigNumber(hedgeCosts[1]).div(10 ** usdtDecimals);
    const hedgeCostsUsdc = new BigNumber(hedgeCosts[2]).div(10 ** usdcDecimals);
    const hedgeCostsTUSD = (hedgeCostsEth * ethUsdPrice) + hedgeCostsUsdt + hedgeCostsUsdc;

    const hedgeProfitsEth = new BigNumber(hedgeProfits[0]).div(10 ** wethDecimals);
    const hedgeProfitsUsdt = new BigNumber(hedgeProfits[1]).div(10 ** usdtDecimals);
    const hedgeProfitsUsdc = new BigNumber(hedgeProfits[2]).div(10 ** usdcDecimals);
    const hedgeProfitsTUSD = (hedgeProfitsEth * ethUsdPrice) + hedgeProfitsUsdt + hedgeProfitsUsdc;

    const hedgeFeesEth = new BigNumber(hedgeFees[0]).div(10 ** wethDecimals);
    const hedgeFeesUsdt = new BigNumber(hedgeFees[1]).div(10 ** usdtDecimals);
    const hedgeFeesUsdc = new BigNumber(hedgeFees[2]).div(10 ** usdcDecimals);
    const hedgeFeesTUSD = (hedgeFeesEth * ethUsdPrice) + hedgeFeesUsdt + hedgeFeesUsdc;
  
    // Convert ETH values to USD
    const hedgesTradedTWETH = hedgesTradedTUSD.div(ethUsdPrice);
    const hedgesCreatedTWETH = hedgesCreatedTUSD.div(ethUsdPrice);
    const swapsVolumeTWETH = swapsVolumeTUSD.div(ethUsdPrice);
    const optionsVolumeTWETH = optionsVolumeTUSD.div(ethUsdPrice);
    const hedgeCostsTWETH = hedgeCostsTUSD.div(ethUsdPrice);
    const hedgeProfitsTWETH = hedgeProfitsTUSD.div(ethUsdPrice);
    const hedgeFeesTWETH = hedgeFeesTUSD.div(ethUsdPrice);
  
    // Call the updateSectionValues_hedges function
    updateSectionValues_hedges(
        hedgesTradedTUSD,
        hedgesCreatedTUSD,
        swapsVolumeTUSD,
        optionsVolumeTUSD,
        hedgeCostsTUSD,
        hedgeProfitsTUSD,
        hedgeFeesTUSD
    );

    updateChartValues_hedges(1, hedgesTradedTUSD, hedgesCreatedTUSD);
    updateChartValues_hedges(2, swapsVolumeTUSD, optionsVolumeTUSD);
    updateChartValues_hedges(3, hedgeCostsTUSD, hedgesTradedTUSD);
    updateChartValues_hedges(4, hedgeProfitsTUSD, hedgeFeesTUSD);
}

async function setCurrent_EarningsSection() {
  // Assuming you have a contract instance named 'contractInstance' to interact with your Solidity contract
  // Returned as (weth, usdt, usdc, erc20s) erc20s are sold at 10% discount in weth
  const totalProtocolRevenue = await contractInstance.getProtocolRevenue();
  const cashierRevenue = await contractInstance.getCashierFeesValue();
  const hedgeRevenue = await contractInstance.getHedgesFeesValue();
  const tokentaxRevenue = await contractInstance.getTokenTaxesValue(); //returns weth only
  const minerFeesWei = hedgeRevenueWei * 0.15; // 15% of protocol fee is Miner's fee
  const totalDistributed = await contractInstance.getTotalDistributed();
  const totalClaimedWei = await contractInstance.getTotalClaimed(); // withdrawn to staking contract for claiming. pie chart with: withdrawn Vs claimed
  const totalUnclaimedWei = await contractInstance.getTotalUnclaimed(); // = deposited - withdrawn.
  const totalStakers = 1000; // to be developed. address(this) withdraws from userMapBalances to staking contract only
  const minedHedgesCount = 10;
  const minersCount = 5;
  
  // Fetch ETH to USD conversion rate
  const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

  // Step 3: Convert WETH amounts
  const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;
  
  // - Hedge Revenue = 5% tax on profits upon settlement
  // - Miner Fees = 15% of hedge revenue above, to miners settling hedges in real time manually
  // - Token Tax Revenue is token swap tax
  // - Cashier Revenue = protocol withdrawal charges
  //const totalRevenueEth = (hedgeRevenueEth - minerFeesEth) + tokenTaxRevenueEth + cashierRevenueEth;
  // == MORE ACCURATE READING OF TOTAL REVENUE 
  const totalRevenueEth = new BigNumber(totalProtocolRevenue[0]).div(10 ** wethDecimals);
  const totalRevenueUsdt = new BigNumber(totalProtocolRevenue[1]).div(10 ** usdtDecimals);
  const totalRevenueUsdc = new BigNumber(totalProtocolRevenue[2]).div(10 ** usdcDecimals);
  const totalRevenueTUSD = (totalRevenueEth * ethUsdPrice) + totalRevenueUsdt + totalRevenueUsdc;

  const cashierRevenueEth = new BigNumber(cashierRevenue[0]).div(10 ** wethDecimals);
  const cashierRevenueUsdt = new BigNumber(cashierRevenue[1]).div(10 ** usdtDecimals);
  const cashierRevenueUsdc = new BigNumber(cashierRevenue[2]).div(10 ** usdcDecimals);
  const cashierRevenueTUSD = (cashierRevenueEth * ethUsdPrice) + cashierRevenueUsdt + cashierRevenueUsdc;

  const hedgeRevenueEth = new BigNumber(hedgeRevenue[0]).div(10 ** wethDecimals);
  const hedgeRevenueUsdt = new BigNumber(hedgeRevenue[1]).div(10 ** usdtDecimals);
  const hedgeRevenueUsdc = new BigNumber(hedgeRevenue[2]).div(10 ** usdcDecimals);
  const hedgeRevenueTUSD = (hedgeRevenueEth * ethUsdPrice) + hedgeRevenueUsdt + hedgeRevenueUsdc;

  const tokenTaxRevenueEth = new BigNumber(tokentaxRevenue).div(10 ** wethDecimals);
  const tokenTaxRevenueTUSD = (tokenTaxRevenueEth * ethUsdPrice);
  // Convert remaining
  const minerFeesTWETH = web3.utils.fromWei(minerFeesWei, 'ether');
  const distributedTWETH = web3.utils.fromWei(totalDistributed, 'ether');
  const totalClaimedTWETH = web3.utils.fromWei(totalClaimedWei, 'ether');
  const totalUnclaimedTWETH = web3.utils.fromWei(totalUnclaimedWei, 'ether');
  
  // Convert USD values to WETH
  const totalRevenueTWETH = totalRevenueTUSD.div(ethUsdPrice);
  const cashierRevenueTWETH = cashierRevenueTUSD.div(ethUsdPrice);
  const hedgeRevenueTWETH = hedgeRevenueTUSD.div(ethUsdPrice);
  const tokenTaxRevenueTWETH = tokenTaxRevenueTUSD.div(ethUsdPrice);
  // Convert WETH values to USD
  const minerFeesTUSD = minerFeesTWETH.div(ethUsdPrice);
  const distributedTUSD = distributedTWETH.div(ethUsdPrice);
  const totalClaimedTUSD = totalClaimedTWETH.div(ethUsdPrice);
  const totalUnclaimedTUSD = totalUnclaimedTWETH.div(ethUsdPrice);
  const minedHedgesTUSD = minerFeesTUSD.div(0.05); //fees are 5%

  // Call the updateSectionValues_Earnings function to update the HTML
  updateSectionValues_Earnings(
    totalRevenueTWETH,
    totalRevenueTUSD,
    cashierRevenueTWETH,
    cashierRevenueTUSD,
    hedgeRevenueTWETH,
    hedgeRevenueTUSD,
    tokenTaxRevenueTWETH,
    tokenTaxRevenueTUSD,
    
    minerFeesTWETH,
    minerFeesTUSD,
    distributedTWETH,
    distributedTUSD,
    totalUnclaimedTWETH,
    totalClaimedTUSD,
    totalUnclaimedTWETH,
    totalUnclaimedTUSD,
    minedHedgesCount,
    minedHedgesTUSD,
    minersCount,
    totalStakers
  );

  updateChartValues_Revenue(cashierRevenueTUSD, hedgeRevenueTUSD, tokenTaxRevenueTUSD);
  updateChartValues_Dividents(totalRevenueTUSD, distributedTUSD);
  updateChartValues_Claims(totalClaimedTUSD, totalUnclaimedTUSD);
  
}

async function setCurrent_StakedSection() {
    
    const stakedSupply = await contractInstance.stakedTokens(); 
    const circSupply = await tokenInst.circulatingSupply(); 
    const totalStakers = 1000; // to be developed. address(this) withdraws from userMapBalances to staking contract only
    
    
    // Fetch ETH to USD conversion rate
    const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();
  
    // Step 3: Convert WETH amounts
    const wethDecimals = 18; const usdtDecimals = 6; const usdcDecimals = 6;
    
    // - Hedge Revenue = 5% tax on profits upon settlement
    // - Miner Fees = 15% of hedge revenue above, to miners settling hedges in real time manually
    // - Token Tax Revenue is token swap tax
    // - Cashier Revenue = protocol withdrawal charges
    //const totalRevenueEth = (hedgeRevenueEth - minerFeesEth) + tokenTaxRevenueEth + cashierRevenueEth;
    // == MORE ACCURATE READING OF TOTAL REVENUE 
    const totalRevenueEth = new BigNumber(totalProtocolRevenue[0]).div(10 ** wethDecimals);
    const totalRevenueUsdt = new BigNumber(totalProtocolRevenue[1]).div(10 ** usdtDecimals);
    const totalRevenueUsdc = new BigNumber(totalProtocolRevenue[2]).div(10 ** usdcDecimals);
    const totalRevenueTUSD = (totalRevenueEth * ethUsdPrice) + totalRevenueUsdt + totalRevenueUsdc;
  
    const cashierRevenueEth = new BigNumber(cashierRevenue[0]).div(10 ** wethDecimals);
    const cashierRevenueUsdt = new BigNumber(cashierRevenue[1]).div(10 ** usdtDecimals);
    const cashierRevenueUsdc = new BigNumber(cashierRevenue[2]).div(10 ** usdcDecimals);
    const cashierRevenueTUSD = (cashierRevenueEth * ethUsdPrice) + cashierRevenueUsdt + cashierRevenueUsdc;
  
    const hedgeRevenueEth = new BigNumber(hedgeRevenue[0]).div(10 ** wethDecimals);
    const hedgeRevenueUsdt = new BigNumber(hedgeRevenue[1]).div(10 ** usdtDecimals);
    const hedgeRevenueUsdc = new BigNumber(hedgeRevenue[2]).div(10 ** usdcDecimals);
    const hedgeRevenueTUSD = (hedgeRevenueEth * ethUsdPrice) + hedgeRevenueUsdt + hedgeRevenueUsdc;
  
    const tokenTaxRevenueEth = new BigNumber(tokentaxRevenue).div(10 ** wethDecimals);
    const tokenTaxRevenueTUSD = (tokenTaxRevenueEth * ethUsdPrice);
    // Convert remaining
    const minerFeesTWETH = web3.utils.fromWei(minerFeesWei, 'ether');
    const distributedTWETH = web3.utils.fromWei(totalDistributed, 'ether');
    const totalClaimedTWETH = web3.utils.fromWei(totalClaimedWei, 'ether');
    const totalUnclaimedTWETH = web3.utils.fromWei(totalUnclaimedWei, 'ether');
    
    // Convert USD values to WETH
    const totalRevenueTWETH = totalRevenueTUSD.div(ethUsdPrice);
    const cashierRevenueTWETH = cashierRevenueTUSD.div(ethUsdPrice);
    const hedgeRevenueTWETH = hedgeRevenueTUSD.div(ethUsdPrice);
    const tokenTaxRevenueTWETH = tokenTaxRevenueTUSD.div(ethUsdPrice);
    // Convert WETH values to USD
    const minerFeesTUSD = minerFeesTWETH.div(ethUsdPrice);
    const distributedTUSD = distributedTWETH.div(ethUsdPrice);
    const totalClaimedTUSD = totalClaimedTWETH.div(ethUsdPrice);
    const totalUnclaimedTUSD = totalUnclaimedTWETH.div(ethUsdPrice);
    const minedHedgesTUSD = minerFeesTUSD.div(0.05); //fees are 5%
  
    // Call the updateSectionValues_Earnings function to update the HTML
    updateSectionValues_Earnings(
      totalRevenueTWETH,
      totalRevenueTUSD,
      cashierRevenueTWETH,
      cashierRevenueTUSD,
      hedgeRevenueTWETH,
      hedgeRevenueTUSD,
      tokenTaxRevenueTWETH,
      tokenTaxRevenueTUSD,
      
      minerFeesTWETH,
      minerFeesTUSD,
      distributedTWETH,
      distributedTUSD,
      totalUnclaimedTWETH,
      totalClaimedTUSD,
      totalUnclaimedTWETH,
      totalUnclaimedTUSD,
      minedHedgesCount,
      minedHedgesTUSD,
      minersCount,
      totalStakers
    );
  
    updateChartValues_Revenue(cashierRevenueTUSD, hedgeRevenueTUSD, tokenTaxRevenueTUSD);
    updateChartValues_Dividents(totalRevenueTUSD, distributedTUSD);
    updateChartValues_Claims(totalClaimedTUSD, totalUnclaimedTUSD);
    
  }

async function setCurrent_TokenomicsSection() {
    //tokenInst instead of contractInst
    const symbol = await tokenInst.symbol();
    const decimals = await tokenInst.decimals();
    const contractAddress = MyLibrary.platformAddress;
    const buyTax = await tokenInst.buyTax(); 
    const sellTax = await tokenInst.sellTax(); 
    const priceWETH = await tokenInst.price(); 
    const circSupply = await tokenInst.circulatingSupply(); 
    const totaSupply = await tokenInst.totalSupply(); 
    
    // Fetch ETH to USD conversion rate
    const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();

    // Convert WETH to human readable
    const circulatingSupply = new BigNumber(circSupply).div(10 ** decimals);
    const totalSupply = new BigNumber(totaSupply).div(10 ** decimals);
    const burntSupply = totalSupply.minus(circulatingSupply);
    const priceTWETH = web3.utils.fromWei(priceWETH, 'ether');
    
    // Convert USD values to WETH
    const priceTUSD = priceTWETH.div(ethUsdPrice);
  
    // Call the updateSectionValues_Tokenomics function to update the HTML
    updateSectionValues_Tokenomics(
        symbol,
        decimals,
        contractAddress,
        buyTax,
        sellTax,
        priceTWETH,
        priceTUSD,
        burntSupply,
        circulatingSupply
    );

    updateChartValues_Tokenomics(burntSupply, circulatingSupply);
    
  }


//*======================================================*/
// Function to update the sections with the new values
//*======================================================*/
// Update PL Section
async function updateSectionValues_Traffic(activeWallets, activeERC20S, transactionVolume, hedgeVolume, totalDepositWeth, totalDepositUSDT, totalDepositUSDC, totalDepositERC20, totalDepositERC20_weth, totalWithdrawalWeth, totalWithdrawalUSDT, totalWithdrawalUSDC, totalWithdrawalERC20, totalWithdrawalERC20_weth) {
    
    // Format Amounts
    const formatAmount = (amount) => {
        return amount.toFixed(2);
    };

    // Format values
    const formatValue = (value) => {
        return `$${value.toFixed(2)}`;
    };

    // Fetch current ETH price in USD
    const ethUsdcPrice = await getCurrentEthUsdcPriceFromUniswapV2();

    // Convert values to USD
    const totalDepositWethUSD = totalDepositWeth.times(ethUsdcPrice);
    const totalWithdrawalWethUSD = totalWithdrawalWeth.times(ethUsdcPrice);
    const transactionVolumeUSD = transactionVolume.times(ethUsdcPrice);
    const hedgeVolumeUSD = hedgeVolume.times(ethUsdcPrice);

    // Update active wallets value
    document.getElementById("activeWalletsValue").textContent = activeWallets.toString();

    // Update active ERC20s value
    document.getElementById("activeTokensValue").textContent = activeERC20S.toString();

    // Update transaction volume value
    document.getElementById("swapsCountValue").textContent = formatValue(transactionVolumeUSD);

    // Update hedge volume value
    document.getElementById("hedgeVolumeValue").textContent = formatValue(hedgeVolumeUSD);

    // Update total deposits
    const totalDeposits = totalDepositWethUSD.plus(totalDepositUSDT).plus(totalDepositUSDC).plus(totalDepositERC20);
    document.getElementById("totalDepositsValue").textContent = formatValue(totalDeposits);

    // Update individual deposit amounts
    document.getElementById("deposits_wethAmnt").textContent = totalDepositWeth.toString();
    document.getElementById("deposits_wethValue").textContent = formatValue(totalDepositWethUSD);

    document.getElementById("deposits_usdcAmnt").textContent = totalDepositUSDC.toString();
    document.getElementById("deposits_usdcValue").textContent = formatValue(totalDepositUSDC);

    document.getElementById("deposits_usdtAmnt").textContent = totalDepositUSDT.toString();
    document.getElementById("deposits_usdtValue").textContent = formatValue(totalDepositUSDT);

    document.getElementById("deposits_erc20Amnt").textContent = formatAmount(totalDepositERC20_weth);
    document.getElementById("deposits_erc20Value").textContent = formatValue(totalDepositERC20);

    // Update total withdrawals
    const totalWithdrawals = totalWithdrawalWethUSD.plus(totalWithdrawalUSDT).plus(totalWithdrawalUSDC).plus(totalWithdrawalERC20);
    document.getElementById("totalWithdrawalsValue").textContent = formatValue(totalWithdrawals);

    // Update individual withdrawal amounts
    document.getElementById("withdrawals_wethAmnt").textContent = totalWithdrawalWeth.toString();
    document.getElementById("withdrawals_wethValue").textContent = formatValue(totalWithdrawalWethUSD);

    document.getElementById("withdrawals_usdcAmnt").textContent = totalWithdrawalUSDC.toString();
    document.getElementById("withdrawals_usdcValue").textContent = formatValue(totalWithdrawalUSDC);

    document.getElementById("withdrawals_usdtAmnt").textContent = totalWithdrawalUSDT.toString();
    document.getElementById("withdrawals_usdtValue").textContent = formatValue(totalWithdrawalUSDT);

    document.getElementById("withdrawals_erc20Amnt").textContent = formatAmount(totalWithdrawalERC20_weth);
    document.getElementById("withdrawals_erc20Value").textContent = formatValue(totalWithdrawalERC20);
}

// Update Hedges Section
function updateSectionValues_hedges(hedgesTraded, hedgesCreated, swapsVolume, optionsVolume, hedgeCostsTotal, hedgeProfits, hedgeFees) {
    // Format values
    const formatValue = (value) => {
      return `$${value.toFixed(2)}`;
    };
  
    // Update hedges traded and created
    document.getElementById("hedgesTraded").textContent = formatValue(hedgesTraded);
    document.getElementById("hedgesCreated").textContent = formatValue(hedgesCreated);
  
    // Update swaps volume and options volume
    document.getElementById("swapsVolume").textContent = formatValue(swapsVolume);
    document.getElementById("optionsVolume").textContent = formatValue(optionsVolume);
  
    // Update hedge costs total
    document.getElementById("hedgeCostsTotal").textContent = formatValue(hedgeCostsTotal);
    document.getElementById("hedgeValueTotal").textContent = formatValue(hedgesTraded);
  
    // Update hedge profits and losses
    document.getElementById("hedgeProfits").textContent = formatValue(hedgeProfits);
    document.getElementById("hedgeFees").textContent = formatValue(hedgeFees);
}

function updateSectionValues_Earnings(
    totalRevenueEth,
    totalRevenueUsd,
    cashierRevenueEth,
    cashierRevenueUsd,
    hedgeRevenueEth,
    hedgeRevenueUsd,
    tokenTaxRevenueEth,
    tokenTaxRevenueUsd,
    minerFeesEth,
    minerFeesUsd,
    distributedEth,
    distributedUsd,
    totalClaimedEth,
    totalClaimedUsd,
    totalUnclaimedEth,
    totalUnclaimedUsd,
    minedHedgesCount,
    minedHedgesUsd,
    minersCount,
    totalStakers
  ){
    // Format amounts
    const formatAmount = (amount) => {
      return amount.toFixed(2);
    };
  
    // Format values
    const formatValue = (value) => {
      return `$${value.toFixed(2)}`;
    };

    // Update cashier fees
    document.getElementById("cashierRevenueAmnt").textContent = formatAmount(cashierRevenueEth);
    document.getElementById("cashierRevenueValue").textContent = formatValue(cashierRevenueUsd);
  
    // Update hedge revenue
    document.getElementById("hedgeRevenueAmnt").textContent = formatAmount(hedgeRevenueEth);
    document.getElementById("hedgeRevenueValue").textContent = formatValue(hedgeRevenueUsd);
  
    // Update tax revenue
    document.getElementById("taxRevenueAmnt").textContent = formatAmount(tokenTaxRevenueEth);
    document.getElementById("taxRevenueValue").textContent = formatValue(tokenTaxRevenueUsd);
  
    // Update total revenues    
    document.getElementById("totalRevenueAmnt").textContent = formatAmount(totalRevenueEth);
    document.getElementById("totalRevenueValue").textContent = formatValue(totalRevenueUsd);

    // Update distributed
    document.getElementById("totalRevenueDistrAmnt").textContent = formatValue(distributedEth);
    document.getElementById("totalRevenueDistrValue").textContent = formatValue(distributedUsd);
  
    // Update total claimed
    document.getElementById("totalClaimedAmnt").textContent = formatAmount(totalClaimedEth);
    document.getElementById("totalClaimedValue").textContent = formatValue(totalClaimedUsd);
  
    // Update total unclaimed
    document.getElementById("totalUnclaimedAmnt").textContent = formatAmount(totalUnclaimedEth);
    document.getElementById("totalUnclaimedValue").textContent = formatValue(totalUnclaimedUsd);

    // Update miner fees
    document.getElementById("minerFeesAmnt").textContent = formatAmount(minerFeesEth);
    document.getElementById("minerFeesValue").textContent = formatValue(minerFeesUsd);

    // Update miners stats  
    document.getElementById("minedHedgesCount").textContent = minedHedgesCount;
    document.getElementById("minedHedgesValue").textContent = formatValue(minedHedgesUsd);
    document.getElementById("minersCount").textContent = minersCount;
  
    // Update total stakers
    document.getElementById("totalStakers").textContent = totalStakers;
  
    // Calculate and update total fees
    const totalFeesEth = minerFeesEth.plus(protocolFeesEth);
    const totalFeesUsd = minerFeesUsd.plus(protocolFeesUsd);
    document.getElementById("totalFeesValue").textContent = formatValue(totalFeesUsd);
}

function updateSectionValues_Tokenomics(symbol, decimals, contractAddress, buyTax, sellTax, priceTWETH, priceTUSD, burntSupply, circulatingSupply, totalSupply) {
    // Format amounts
    const formatAmount = (amount) => {
        return amount.toFixed(2);
    };
    
    // Format values
    const formatValue = (value) => {
        return `$${value.toFixed(2)}`;
    };
  
      // Update
      document.getElementById("tokenoSymbol").textContent = symbol;
      document.getElementById("tokenoDecimals").textContent = decimals;
      document.getElementById("tokenoCA").textContent = contractAddress;
      document.getElementById("tokenoTaxes").textContent = buyTax + '/' + sellTax;
    
      // Update price
      document.getElementById("tokenoPriceUSD").textContent = formatAmount(priceTUSD);
    
      // Update supply  
      document.getElementById("tokenoBurnt").textContent = formatValue(burntSupply);
      document.getElementById("tokenoCirculating").textContent = formatValue(circulatingSupply);
      document.getElementById("tokenoTotalSupply").textContent = formatValue(totalSupply);
}
  
  

/*======================================================*/
// Function to update the chart with the new values
/*======================================================*/
function updateChartValues_Cash(netDeposit, netWithdraw) {
    const chartDataCash = [netDeposit, netWithdraw];

    // Get the chart canvas element
    const chartCanvasCash = document.getElementById('depositWithdrawalChart').getContext('2d');

    // Destroy the chart if it already exists
    if (netCashingChart !== null) {
        netCashingChart.destroy();
    }

    // Create the chart
    netCashingChart = new Chart(chartCanvasCash, {
        type: "bar",
        data: {
            labels: [""],
            datasets: [
                {
                    label: "Net Deposits",
                    data: [chartDataCash[0]],
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    fill: true
                },
                {
                    label: "Net Withdrawals",
                    data: [chartDataCash[1]],
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                    fill: true
                }
            ]
        },
        options: {
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5000,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                        lineWidth: 1
                    },
                    title: {
                        display: false,
                        text: 'Amount (USD)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    title: {
                        display: false,
                        text: '' // Set the y-axis title to an empty string
                    }
                }
            }
        },
        aspectRatio: 1.8,
        responsive: true,
        maintainAspectRatio: true
    });
}

function updateChartValues_PIE(weth, usdt, usdc, erc20) {
    const chartDataPie = [weth, usdt, usdc, erc20];
    const chartLabelsPie = ['WETH', 'USDT', 'USDC', 'ERC20'];

    // Get the chart canvas element
    const chartCanvasPie = document.getElementById('cashingPieChart').getContext('2d');
    // Set the height of the canvas to 300 pixels
    chartCanvasPie.height = '300px';

    // Destroy the chart if it already exists
    if (cashingPieChart !== null) {
        cashingPieChart.destroy();
    }

    // Create the chart
    cashingPieChart = new Chart(chartCanvasPie, {
        type: 'doughnut',
        data: {
            labels: chartLabelsPie,
            datasets: [
                {
                    data: chartDataPie,
                    backgroundColor: [
                        'rgba(31, 72, 147, 0.6)',   // More vibrant dark blue
                        'rgba(54, 162, 235, 0.6)',   // More vibrant blue
                        'rgba(38, 161, 123, 0.6)',   // More vibrant green
                        'rgba(255, 206, 86, 0.6)'    // More vibrant yellow
                    ],
                    borderColor: [
                        'rgba(51, 153, 255, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            cutout: '55%',  // Adjust the value to control the size of the hollow center
            plugins: {
                legend: {
                    display: true,
                    position: 'left'
                },
                tooltip: {
                    enabled: true
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                }
            },
            aspectRatio: 1.5,
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

//Do for all charts in one go
function updateChartValues_hedges(chartID, valueA, valueB){

    const chartDataHedgeA = [valueA, valueB];

    // Modularize
    if (chartID == 1) {
        var hedgeChartID = "hedgeBarChartA";
        var chartLabels = ["Traded Hedges", "Created Hedges"];
    }
    if (chartID == 2) {
        var hedgeChartID = "hedgeBarChartB";
        var chartLabels = ["Options Volume", "Swaps Volume"];
    }
    if (chartID == 3) {
        var hedgeChartID = "hedgeBarChartC";
        var chartLabels = ["Hedge Costs", "Underlying Value"];
    }
    if (chartID == 4) {
        var hedgeChartID = "hedgeBarChartD";
        var chartLabels = ["Hedge Profits", "Hedge Losses"];
    }
    
    var hedgeData = {
        labels: chartLabels,
        datasets: [
        {
            data: chartDataHedgeA,
            backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(75, 192, 192, 0.5)"],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }
        ]
    };
    
    var hedgeChart = new Chart(document.getElementById(hedgeChartID), {
        type: "doughnut",
        data: hedgeData,
        options: {
            cutout: '55%',  // Adjust the value to control the size of the hollow center
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true
                }
            },
            aspectRatio: 2.5,
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

function updateChartValues_Revenue(cashierRevenue, hedgeRevenue, tokenRevenue) {
    const chartData = [cashierRevenue, hedgeRevenue, tokenRevenue];
    const chartLabelsRevenue = ['Cashier', 'Hedges', 'TokenTax'];

    // Get the chart canvas element
    const chartCanvasRevenue = document.getElementById('revenuesplitChart').getContext('2d');
    // Set the height of the canvas
    chartCanvasRevenue.height = '200px';

    // Destroy the chart if it already exists
    if (revenuePieChart !== null) {
        revenuePieChart.destroy();
    }

    // Create the chart
    revenuePieChart = new Chart(chartCanvasRevenue, {
        type: 'doughnut',
        data: {
            labels: chartLabelsRevenue,
            datasets: [
                {
                    data: chartData,
                    backgroundColor: [
                        'rgba(181, 37, 232, 0.6)',   // More vibrant purple
                        'rgba(54, 162, 235, 0.6)',   // More vibrant blue
                        'rgba(75, 192, 192, 0.6)'    // More vibrant green
                    ],
                    borderColor: [
                        'rgba(107, 16, 170, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            cutout: '55%',  // Adjust the value to control the size of the hollow center
            plugins: {
                legend: {
                    display: true,
                    position: 'left'
                },
                tooltip: {
                    enabled: true
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                }
            },
            aspectRatio: 1.5,
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

function updateChartValues_Dividents(netRevenue, netDistributed) {
    const chartData = [netRevenue, netDistributed];
    
    // Get the chart canvas element
    const chartCanvasDividents = document.getElementById('dividentsChart').getContext('2d');
    // Set the height of the canvas
    chartCanvasDividents.height = '200px';
    
    // Destroy the chart if it already exists
    if (dividentsChart !== null) {
        dividentsChart.destroy();
    }
    
    // Create the chart
    dividentsChart = new Chart(chartCanvasDividents, {
        type: "bar",
        data: {
            labels: ["Present"],
            datasets: [
                {
                    label: "Net Revenue",
                    data: [chartData[0]],
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    fill: true
                },
                {
                    label: "Total Distributed",
                    data: [chartData[1]],
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                    fill: true
                }
            ]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                        lineWidth: 1
                    },
                    title: {
                        display: true,
                        text: 'Amount (USD)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                }
            }
        },
        responsive: true,
        maintainAspectRatio: true
    });
}

function updateChartValues_Claims(netClaimed, netUnclaimed) {
    const chartData = [netClaimed, netUnclaimed];
    const chartLabelsClaims = ['Claimed', 'Unclaimed'];

    // Get the chart canvas element
    const chartCanvasClaims = document.getElementById('claimsChart').getContext('2d');
    // Set the height of the canvas
    chartCanvasClaims.height = '200px';
    
    // Destroy the chart if it already exists
    if (claimsPieChart !== null) {
        claimsPieChart.destroy();
    }
    
    // Create the chart
    claimsPieChart = new Chart(chartCanvasClaims, {
        type: 'doughnut',
        data: {
            labels: chartLabelsClaims,
            datasets: [
                {
                    data: chartData,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',   // More vibrant blue
                        'rgba(255, 206, 86, 0.6)'   // More vibrant yellow
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            cutout: '55%',  // Adjust the value to control the size of the hollow center
            plugins: {
                legend: {
                    display: true,
                    position: 'left'
                },
                tooltip: {
                    enabled: true
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                }
            },
            aspectRatio: 1.5,
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

// Update Chart Staking
function updateChartValues_Staking(netProfit, netLoss) {
    const chartDataStake = [netProfit, netLoss];
    
    // Get the chart canvas element
    const chartCanvasStaked = document.getElementById('stakedsupplyChart').getContext('2d');
    
    // Destroy the chart if it already exists
    if (stakesBarChart !== null) {
        stakesBarChart.destroy();
    }
    
     // Create the chart
     stakesBarChart = new Chart(chartCanvasStaked, {
        type: "bar",
        data: {
            labels: [""],
            datasets: [
                {
                    label: "Staked",
                    data: [chartDataStake[0]],
                    backgroundColor: "rgba(31, 72, 147, 0.5)",
                    borderColor: "rgba(51, 153, 255, 1)",
                    borderWidth: 1,
                    fill: true
                },
                {
                    label: "C.Supply",
                    data: [chartDataStake[1]],
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    fill: true
                }
            ]
        },
        options: {
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 50000000,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.1)",
                        lineWidth: 1
                    },
                    title: {
                        display: false,
                        text: 'tokens',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    title: {
                        display: false,
                        text: '' // Set the y-axis title to an empty string
                    }
                }
            }
        },
        aspectRatio: 1.8,
        responsive: true,
        maintainAspectRatio: true
    });
}


function updateChartValues_Tokenomics(burntSupplyT, circulatingSupplyT) {
    const chartData = [burntSupplyT, circulatingSupplyT];
    const chartLabelsTokenomics = ['Burnt', 'Circulating'];

    // Get the chart canvas element
    const chartCanvasTokenomics = document.getElementById('tokenomicsChart').getContext('2d');

    // Destroy the chart if it already exists
    if (tokenomicsPieChart !== null) {
        tokenomicsPieChart.destroy();
    }

    // Create the chart
    tokenomicsPieChart = new Chart(chartCanvasTokenomics, {
        type: 'doughnut',
        data: {
            labels: chartLabelsTokenomics,
            datasets: [
                {
                    data: chartData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',   // More vibrant red
                        'rgba(54, 162, 235, 0.6)'   // More vibrant blue
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            cutout: '55%',  // Adjust the value to control the size of the hollow center
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                },
                tooltip: {
                    enabled: true
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                }
            },
            aspectRatio: 1.5,
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

/**************************
    ON PAGE LOAD CALLS 
**************************/
$(document).ready(function() {
    
    setInitial_CashingChart();
    setInitial_CashingChartPie();
    setInitial_hedgesChartA();
    setInitial_hedgesChartB();
    setInitial_hedgesChartC();
    setInitial_hedgesChartD();
    setInitial_dividentsChart();
    setInitial_claimsChart();
    setInitial_revenueChart();
    setInitial_StakingChart();
    setInitial_TokenomicsChart();
});


/**************************
    HELPERS 
**************************/

async function getCurrentEthUsdcPriceFromUniswapV2() {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false'); // Replace with the actual API endpoint for fetching the price
  const data = await response.json();

  // Assuming the API response contains the price in the desired format
  const ethUsdcPrice = data.price;

  return ethUsdcPrice;
}


/*
$(document).ready(async function(){
    // Net Profit versus Loss
    var netProfitData = {
        labels: ["All Time"],
        datasets: [
        {
            label: "Net Profit",
            data: [chartData[0]],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            fill: true
        },
        {
            label: "Net Loss",
            data: [chartData[1]],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
            fill: true
        }
        ]
    };
    
    var netProfitChart = new Chart(document.getElementById("netProfitChart"), {
        type: "line",
        data: netProfitData,
        options: {}
    });
    
    // Deposits versus Withdrawals
    var depositWithdrawalData = {
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
        datasets: [
        {
            label: "Deposits",
            data: [2000, 1500, 1800, 2200, 2500],
            backgroundColor: "rgba(75, 192, 192, 0.5)"
        },
        {
            label: "Withdrawals",
            data: [1200, 800, 1000, 1500, 900],
            backgroundColor: "rgba(255, 99, 132, 0.5)"
        }
        ]
    };
    
    var depositWithdrawalChart = new Chart(document.getElementById("depositWithdrawalChart"), {
        type: "bar",
        data: depositWithdrawalData,
        options: {
        scales: {
            x: { stacked: true },
            y: { stacked: true }
        }
        }
    });
    
    // Hedges Created versus Taken
    var hedgeData = {
        labels: ["Hedges Created", "Hedges Taken"],
        datasets: [
        {
            data: [30, 70],
            backgroundColor: ["green", "red"]
        }
        ]
    };
    
    var hedgeChart = new Chart(document.getElementById("hedgeChart"), {
        type: "doughnut",
        data: hedgeData,
        options: {}
    });
    
    // Volume of Hedges Created versus Hedge Costs Paid
    var volumeCostData = {
        labels: ["Low Volume", "Medium Volume", "High Volume"],
        datasets: [
        {
            label: "Hedge Costs Paid",
            data: [100, 250, 400],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
        }
        ]
    };
    
    var volumeCostChart = new Chart(document.getElementById("volumeCostChart"), {
        type: "bar",
        data: volumeCostData,
        options: {}
    });
});

*/
