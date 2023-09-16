// JavaScript Document

const CONSTANTS = {
  network: "0x5", // goerli 0x5 // bsc: 0x56
  etherScan: "https://goerli.etherscan.io", // https://goerli.etherscan.io // https://bscscan.com/
  decimals: 18,
  hedgingAddress: '0x135Ca6fff3EcCd186d1bb4B518679e17115d0867',
  wethAddress: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
  usdtAddress: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
  usdcAddress: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
  UniswapUSDCETH_LP: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
  popuptimer: 20,
  hedgingInstanceABI: []
};
/*=========================================================================
  Import modules
==========================================================================*/

import { initWeb3 } from './dapp-web3-utils.js';
import { fetchSection_Hedge, fetchSection_Progress, fetchSection_Gains } from './module-hedge-fetchers.js';
import { loadHedgesModule } from './module-wallet-section-hedgesList.js';

/*=========================================================================
  HELPER FUNCTIONS
==========================================================================*/

// Function to Validate the Ethereum wallet address format
function isValidEthereumAddress(address) {
  const ethereumAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
  return ethereumAddressRegex.test(address);
}
// CoinGecko API price call function
async function getCurrentEthUsdcPriceFromUniswapV2() {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false'); // Replace with the actual API endpoint for fetching the price
  const data = await response.json();
  const ethUsdcPrice = data.ethereum.usd;  
  return ethUsdcPrice;
}
// Function to Truncate the token address for display
function truncateAddress(address) {
return address.slice(0, 6) + '...' + address.slice(-4);
}
// Function to Convert to USD value based on pair
function convertToUSD(value, pairedCurrency, ethUsdPrice) {
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
// Function to get all Deposited ERC20 tokens
async function getDepositedTokens() {
try {
  const depositedTokens = await hedgingInstance.methods.getDepositedTokens().call();
  return depositedTokens;
} catch (error) {
  console.error("Error fetching deposited tokens:", error);
  return [];
}
}
// Function to get token USD value
async function getTokenUSDValue(underlyingTokenAddr, balance) {
try {
  const underlyingValue = await hedgingInstance.methods.getUnderlyingValue(underlyingTokenAddr, balance).call();
  const ethUsdPrice = await getCurrentEthUsdcPriceFromUniswapV2();
  const usdValue = convertToUSD(underlyingValue[0], underlyingValue[1], ethUsdPrice);
  return usdValue;
} catch (error) {
  console.error("Error getting token USD value:", error);
  return 0;
}
}
// Function to get token ETH value
async function getTokenETHValue(underlyingTokenAddr, balance) {
try {
  const underlyingValue = await hedgingInstance.methods.getUnderlyingValue(underlyingTokenAddr, balance).call();
  return new BigNumber(underlyingValue[0]).div(1e18);
} catch (error) {
  console.error("Error getting token ETH value:", error);
  return new BigNumber(0);
}
}
// Function to fetch user's token balances
async function getUserBalancesForToken(tokenAddress, userAddress) {
  try {
      const [deposited, withdrawn, lockedInUse, withdrawableBalance, withdrawableValue, paired] = await hedgingInstance.methods.getuserTokenBalances(tokenAddress, userAddress).call();
      const depositedBalance = web3.utils.fromWei(deposited);
      const withdrawnBalance = web3.utils.fromWei(withdrawn);
      const lockedInUseBalance = web3.utils.fromWei(lockedInUse);
      const withdrawableBalanceEth = web3.utils.fromWei(withdrawableBalance);    
      // Display balances in the HTML form
      document.getElementById('depositedBalance').textContent = depositedBalance;
      document.getElementById('withdrawnBalance').textContent = withdrawnBalance;
      document.getElementById('lockedInUseBalance').textContent = lockedInUseBalance;
      document.getElementById('withdrawableBalance').textContent = withdrawableBalanceEth;
  } catch (error) {
      console.error("Error fetching user's token balances:", error);
      // Clear the balances display if an error occurs
      document.getElementById('depositedBalance').textContent = '';
      document.getElementById('withdrawnBalance').textContent = '';
      document.getElementById('lockedInUseBalance').textContent = '';
      document.getElementById('withdrawableBalance').textContent = '';
  }
}

/*=========================================================================
  INITIALIZE WEB3
==========================================================================*/
initWeb3();

$(document).ready(async function () {
  const accounts = await web3.eth.requestAccounts();
const userAddress = accounts[0];

  const unlockState = await unlockedWallet();
  if (unlockState === true) {
      const setatmIntervalAsync = (fn, ms) => {
          fn().then(() => {
              setTimeout(() => setatmIntervalAsync(fn, ms), ms);
          });
      };
      // Load sections automatically & periodically
      const callPageTries = async () => {
          const asyncFunctions = [fetchSection_Hedge, fetchSection_Progress, fetchSection_Gains];
          for (const func of asyncFunctions) {
              await func();
          }
      };

      setatmIntervalAsync(async () => {
          await callPageTries();
      }, 30000);
  } else {
      reqConnect();
  }
});


/*=========================================================================
  INITIALIZE OTHER MODULES
==========================================================================*/





/*==============================
       Configuration
==============================*/
document.addEventListener('DOMContentLoaded', function () {

let prices = [100, 110, 150, 80, 130]; // Default prices
let targetPrice = 120; // Default target price

// Canvas setup
const canvas = document.getElementById('priceChangeChart');
const ctx = canvas.getContext('2d');

// Chart dimensions
const chartWidth = 250;
const chartHeight = 250;
let maxPrice = Math.max(...prices); // Default maximum price
let minPrice = Math.min(...prices); // Default minimum price

canvas.width = chartWidth;
canvas.height = chartHeight;

// Chart styling
const lineColor = '#ffffff';
const textColor = '#ffffff';
const areaColor = '#222870'; // dark blue. ALT #2a3082

// Function to calculate chart dimensions based on prices dataset
function calculateChartDimensions() {
  maxPrice = Math.max(...prices);
  minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1; // Add 10% padding to the price range
  const adjustedMaxPrice = maxPrice + padding;
  const adjustedMinPrice = minPrice - padding;

  return {
    maxPrice: adjustedMaxPrice,
    minPrice: adjustedMinPrice,
    priceRange: adjustedMaxPrice - adjustedMinPrice,
  };
}

// Draw chart
function drawChart() {
  const chartDimensions = calculateChartDimensions();
  const step = chartWidth / (prices.length - 1);

  // Clear canvas
  ctx.clearRect(0, 0, chartWidth, chartHeight);

  // Draw area below the charted points
  ctx.fillStyle = areaColor;
  ctx.beginPath();
  ctx.moveTo(0, chartHeight);
  for (let i = 0; i < prices.length; i++) {
    const x = i * step;
    const y = chartHeight - ((prices[i] - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(chartWidth, chartHeight);
  ctx.closePath();
  ctx.fill();

  // Draw target price level line (constant line)
  const targetY = chartHeight - ((targetPrice - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
  ctx.strokeStyle = '#25d366'; // Green
  ctx.beginPath();
  ctx.moveTo(0, targetY);
  ctx.lineTo(chartWidth, targetY);
  ctx.stroke();

  // Draw start price level line
  const startPrice = prices[0];
  const startPriceY = chartHeight - ((startPrice - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
  ctx.strokeStyle = '#d6188a'; // Red
  ctx.beginPath();
  ctx.moveTo(0, startPriceY);
  ctx.lineTo(chartWidth, startPriceY);
  ctx.stroke();

  // Draw current price level line
  const currentPrice = prices[prices.length - 1];
  const currentPriceY = chartHeight - ((currentPrice - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
  ctx.strokeStyle = '#0dcaf1'; // Blue
  ctx.beginPath();
  ctx.moveTo(0, currentPriceY);
  ctx.lineTo(chartWidth, currentPriceY);
  ctx.stroke();

  // Draw price tags
  ctx.fillStyle = textColor;
  ctx.font = '11px Arial';
  for (let i = 0; i < prices.length; i++) {
    const x = i * step;
    const y = chartHeight - ((prices[i] - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(prices[i].toString(), x + 5, y - 10); // Display price values at all times
  }

  // Draw labels for horizontal lines
  ctx.fillStyle = '#fff'; // White
  ctx.fillText(`Start: ${prices[0]}`, chartWidth - 60, startPriceY - 5);
  ctx.fillText(`Target: ${targetPrice}`, chartWidth - 60, targetY - 5);
  ctx.fillText(`Now: ${prices[prices.length - 1]}`, chartWidth - 60, currentPriceY - 5);
}

// Initial draw with sample data
drawChart();

// Handle mousemove event to show/hide price change tag
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const step = chartWidth / (prices.length - 1);
  const chartDimensions = calculateChartDimensions();

  for (let i = 0; i < prices.length; i++) {
    const x = i * step;
    const y = chartHeight - ((prices[i] - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;

    if (mouseX > x - 2 && mouseX < x + 2 && mouseY > y - 2 && mouseY < y + 2) {
      const tag = document.getElementById('priceChangeTag');
      tag.textContent = `Price: ${prices[i]}`;
      tag.style.top = `${y}px`;
      tag.style.left = `${x + 5}px`;
      tag.classList.add('show');
    }
  }

  // Hide tag if not hovered over a price point
  const tag = document.getElementById('priceChangeTag');
  tag.classList.remove('show');
});

// Function to update the chart with new prices
function updateChart(newPrices) {
  prices = newPrices;
  drawChart();
}

// Example of dynamically updating the chart with new prices (replace with your own logic)
document.getElementById('refreshButton').addEventListener('click', () => {
  // Replace the newPrices array with your desired prices
  const newPrices = [110, 100, 90, 90, 130, 150];
  updateChart(newPrices);
});

});

/*===================================================*/
document.addEventListener('DOMContentLoaded', function () {

// Global arrays for token names and amounts
const tokenNames = ["ZKS", "ZRO", "GMX", "ARB", "VELA"];
const tokenAmount = [1000000, 2000000, 3000000, 4000000, 5000000];

// Function to generate a random color
function getRandomColor() {
    // Generate random RGB components in the range 0-127 (dark colors)
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    // Convert RGB components to a hexadecimal color string
    const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    
    return color;
}

// Function to create random circles with token names and amounts
function createRandomCircles(container) {
  // Matter.js engine and world
  const engine = Matter.Engine.create();
  const world = engine.world;

  // Configure gravity and bounds
  world.gravity.y = 0.8;
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Create boundaries to keep circles within the container
  Matter.World.add(world, [
    Matter.Bodies.rectangle(width / 2, height, width, 1, { isStatic: true, render: { fillStyle: '#3399ff' }  }),
    Matter.Bodies.rectangle(width / 2, 0, width, 0, { isStatic: true }),
    Matter.Bodies.rectangle(0, height / 2, 1, height, { isStatic: true, render: { fillStyle: '#3399ff' }  }),
    Matter.Bodies.rectangle(width, height / 2, 1, height, { isStatic: true, render: { fillStyle: '#3399ff' }  })
  ]);

  // Create the circles
  for (let i = 0; i < 5; i++) {
    // Random index for tokenNames and tokenAmount arrays
    const randomIndex = i;

    // Get the corresponding token name and amount
    const name = tokenNames[randomIndex];
    const amount = tokenAmount[randomIndex];

    // Calculate circle size based on token amount
    const amountRatio = (amount - Math.min(...tokenAmount)) / (Math.max(...tokenAmount) - Math.min(...tokenAmount));
    const circleRadius = 30 + (30 * amountRatio);

    // Randomize the position within the container
    const x = Math.random() * (width - circleRadius * 2) + circleRadius;
    const y = Math.random() * (height - circleRadius * 2) + circleRadius;

    // Create the circle element
    const circle = document.createElement("div");
    circle.classList.add("assetCircle");
    circle.textContent = `${name}\n${amount}`;
    circle.style.width = `${circleRadius * 2}px`;
    circle.style.height = `${circleRadius * 2}px`;
    circle.style.borderRadius = `${circleRadius}px`;

    // Add class "text" to circles with text

    // Assign a random color to the circle
    const randomColor = getRandomColor();
    circle.style.backgroundColor = randomColor;

    // Add the circle to the container
    container.appendChild(circle);

    // Create a Matter.js circle
    const matterCircle = Matter.Bodies.circle(x, y, circleRadius, {
      restitution: 0.5,
      friction: 0.1
    });

    // Add the Matter.js circle to the world
    Matter.World.add(world, matterCircle);

    // Update the positions of both circles after each physics update
    Matter.Events.on(engine, "afterUpdate", () => {
      const circlePos = matterCircle.position;
      const translateX = circlePos.x - circleRadius;
      const translateY = circlePos.y - circleRadius;

      circle.style.transform = `translate(${translateX}px, ${translateY}px)`;

      // Remove opacity when the physics simulation settles down. works in collab with CSS currently it displays text by default
      if (engine.timing.timestamp >= 2000) {
        circle.style.opacity = 1;
      }
    });
  }

  // Run the Matter.js engine
  Matter.Engine.run(engine);
  Matter.Render.run(Matter.Render.create({
    element: container,
    engine: engine,
    options: {
      wireframes: false,
      background: "rgba(0, 0, 0, 0)",
      showVelocity: true
    }
  }));
}

// Function to initialize the circles
function initCircles() {
  const container = document.getElementById("assetBasket");
  createRandomCircles(container);
}

// Call the function to initialize the circles
initCircles();

});
