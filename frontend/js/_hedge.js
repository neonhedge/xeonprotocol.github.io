/*=========================================================================
    Import Modules
==========================================================================*/

import { CONSTANTS } from './constants.js';
import { initializeConnection, chainCheck, unlockedWallet, reqConnect, handleAccountChange, handleNetworkChange, popupSuccess} from './web3-walletstatus-module.js';
import { fetchSection_HedgeCard, fetchSection_HedgeCardDefault } from './module-hedge-fetchers.js';
import { prepareEventListItem, } from './module-market-sidebar-fetchers.js';
import { setupWritingModule, createForm, submitWriting, purchaseInterface, deleteInterface, toggleBookmark } from './module-silkroad-writer.js';

/*=========================================================================
    Hedge Page Main Scripts
==========================================================================*/
// This is the main loading script for the page
// It first checks if a wallet is connected || initialization passes
// Initialization always returns boolean on whether it passes to load page scripts or not
// scouter == wallect readiness check. If wallet check passes & sets all wallet dependencies, then we can load all other scripts below
// if conditions to continueLoading change the script stops at scouter, event listeners at bottom of page to help with alerts & state changes

// Start making calls to Dapp modules
export const checkAndCallPageTries = async () => {
  let scouter = await pageModulesLoadingScript();
  
  console.log('connection Scout: '+ scouter);  
  if (scouter) {
    // Load sections automatically & periodically
    const asyncFunctions = [fetchSection_HedgeCard];
    
    // Check if the webpage URL has '?id='
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    if (idParam) {
        for (const func of asyncFunctions) {
            await func();
        }
    } else {
        await fetchSection_HedgeCardDefault();
        // Get the page-title section
        const pageTitleSection = document.getElementById('page-title');
        pageTitleSection.innerHTML = '';
        // Create the rewardsInformer div with the specified text and icon
        const rewardsInformerDiv = document.createElement('div');
        rewardsInformerDiv.classList.add('rewardsInformer');
        // Create the icon element
        const icon = document.createElement('i');
        icon.classList.add('fa', 'fa-exclamation-triangle');
        icon.setAttribute('aria-hidden', 'true');
        // Create the text element
        const text = document.createTextNode(' Hedge ID not found in URL, sample data displayed instead as default');
        // Append the icon and text elements to the rewardsInformer div
        rewardsInformerDiv.appendChild(icon);
        rewardsInformerDiv.appendChild(text);

        if (pageTitleSection) {
            // Append the rewardsInformer div to the page-title section
            pageTitleSection.appendChild(rewardsInformerDiv);
        }
    }
  }
};

$(document).ready(async function () {

  // Countdown timer refresh
  const setatmIntervalAsync = (fn, ms) => {
    let countdown = ms / 1000;
    const refreshCounter = document.getElementById('refreshCounter');
    const updateCountdown = () => {
      countdown--;
      refreshCounter.innerText = countdown;
    };

    // Update the countdown in real time
    fn().then(() => {
      updateCountdown();
      const intervalId = setInterval(() => {
        updateCountdown();
        if (countdown === 0) {
          clearInterval(intervalId);
          setatmIntervalAsync(fn, ms);
        }
      }, 1000);
    });
  };

  // Load sections periodically
  setatmIntervalAsync(async () => {
    checkAndCallPageTries();
  }, 45000);

  // Update optionId
  // Check if the webpage URL has '?id='
  const urlParams = new URLSearchParams(window.location.search);
  window.optionID = urlParams.get('id');
});


// Checks if all wallet checks pass before calling page modules
async function pageModulesLoadingScript() {
  let continueLoad = false;
  try {
      continueLoad = initializeConnection();
  if (continueLoad) {
    return true;
  } else {
    return false;
  }
  } catch (error) {
      console.log(error);
  return false;
  }
}


/*=========================================================================
    INITIALIZE OTHER MODULES
==========================================================================*/
// Button Listeners: buy
$(document).on('click', '#takeHedge', function(e){
  const optionId = parseInt(window.optionID);
  if (optionId) {
    purchaseInterface(optionId);
  }
});
$(document).on('click', '#deleteHedge', function(e){
  const optionId = parseInt(window.optionID);
  if (optionId) {
    deleteInterface(optionId);
  }
});
$(document).on('click', '#zapHedge', function(e){

});
$(document).on('click', '#settleHedge', function(e){
  
});
$(document).on('click', '#toggleBookmark', function(e){
  const optionId = parseInt(window.optionID);
  if (optionId) {
    toggleBookmark();
  }
});

/* NEW UPDATE: 24/02/2024 - PRICE CHART */


/*  ---------------------------------------
    HEDGING EVENT LISTENING
-------------------------------------- */
$(document).ready(async function () {

  setupEventListening();

});

async function setupEventListening() {
let hedgingInstance = window.hedgingInstance;

// Hedging Events
try {
      const filter_hedgeCreated = await hedgingInstance.filters.hedgeCreated();
      hedgingInstance.on(filter_hedgeCreated, handleHedgeCreatedEvent);

      const filter_hedgePurchased = await hedgingInstance.filters.hedgePurchased();
      hedgingInstance.on(filter_hedgePurchased, handleHedgePurchasedEvent);

      const filter_hedgeSettled = await hedgingInstance.filters.hedgeSettled();
      hedgingInstance.on(filter_hedgeSettled, handleHedgeSettledEvent);

      const filter_minedHedge = await hedgingInstance.filters.minedHedge();
      hedgingInstance.on(filter_minedHedge, handleMinedHedgeEvent);

  } catch (error) {
      console.error('Error setting up event listening:', error);
  }
}
/* GitHub https://github.com/ethers-io/ethers.js/issues/1307
hedgingInstance.on(filter_hedgeCreated, async (...args) => {
console.log(args[args.length - 1].transactionHash);
});
*/
async function handleHedgeCreatedEvent(token, optionId, createValue, type, writer, transactionHash) {

const event = { 
  returnValues: { token, optionId, createValue, type, writer },
  event: 'hedgeCreated',
  transactionHash: transactionHash.transactionHash
};
//console.log(transactionHash.transactionHash);
const listItem = await prepareEventListItem(event, "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
}

async function handleHedgePurchasedEvent(token, optionId, startValue, type, buyer, transactionHash) {
const event = {
  returnValues: { token, optionId, startValue, type, buyer },
  event: 'hedgePurchased',
  transactionHash: transactionHash.transactionHash
};
const listItem = await prepareEventListItem(event, "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
}

async function handleHedgeSettledEvent(token, optionId, endValue, payOff, miner, transactionHash) {
const event = {
  returnValues: { token, optionId, endValue, payOff, miner },
  event: 'hedgeSettled',
  transactionHash: transactionHash.transactionHash
};
const listItem = await prepareEventListItem(event, "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
}

async function handleMinedHedgeEvent(optionId, miner, token, paired, tokenFee, pairFee, transactionHash) {
const event = {
  returnValues: { optionId, miner, token, paired, tokenFee, pairFee },
  event: 'minedHedge',
  transactionHash: transactionHash.transactionHash
};
const listItem = await prepareEventListItem(event, "0x123456789abcdef");
}

function handleHedgeCreatedSuccessEvent(token, optionId, amount, hedgeType, cost, tx_hash) {
  const outputCurrency = ''; // using nonTxBased message with empty currency
  const type = 'success'; // or error
  const wallet = '';
  const message = 'Hedge Created Successfully';
  const nonTxAction = 'Token: ' + truncateAddress(token) + '<br>Hedge ID: ' + optionId + '<br>Amount: ' + amount + '<br>Hedge Type: ' + hedgeType + '<br>Premium: ' + cost;
  popupSuccess(type, outputCurrency, tx_hash, message, 0, 0, wallet, nonTxAction);
}


/*  ---------------------------------------
  BOTTOM OF EVERY MAIN SCRIPT MODULE 
-------------------------------------- */
// Provider Listeners
ethereum.on("connect", (chainID) => {
  // Update chainID on connect
  CONSTANTS.chainID = chainID.chainId;
  console.log("Connected to chain:", CONSTANTS.chainID);
  handleNetworkChange(chainID.chainId)
  chainCheck();
});

ethereum.on("accountsChanged", async (accounts) => {
  console.log("Account changed:", accounts);
  if(accounts.length > 0) {
    handleAccountChange(accounts);
    // Refresh accounts & page Feed
    checkAndCallPageTries();
    loadOptions();
  } else {
    handleAccountChange(accounts);
    // Refresh wallet widget directly, force wallet initialization check first		
    window.currentAccount = null;
    checkAndCallPageTries();
  }
});

ethereum.on("chainChanged", (chainID) => {
  console.log("Network changed:", chainID);
  handleNetworkChange(chainID);
  window.location.reload();
});








/*
//==============================================
         Configuration
//==============================================
document.addEventListener('DOMContentLoaded', function () {
  
  let prices = [100, 80, 130]; // Default prices
  let targetPrice = 120; // Default target price

  // Canvas setup
  const canvas = document.getElementById('priceChangeChart');
  const ctx = canvas.getContext('2d');

  // Chart dimensions
  const chartWidth = 250;
  const chartHeight = 250;

  canvas.width = chartWidth;
  canvas.height = chartHeight;

  // Chart styling
  const lineColor = '#ffffff';
  const textColor = '#ffffff';
  const areaColor = '#222870'; // dark blue. ALT #2a3082

  // Function to calculate chart dimensions based on prices dataset
  function calculateChartDimensions() {
    
    //add targetprice to array so it shows on chart even if price doesnt go there
    //pop it from array afterwards so we dont plot it with the other prices
    prices.push(targetPrice);
    let maxPrice = Math.max(...prices); // Default maximum price
    let minPrice = Math.min(...prices); // Default minimum price
    prices.pop();
    //proceed
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
  document.getElementById('refreshCounter').addEventListener('click', () => {
    // Replace the newPrices array with your desired prices
    const newPrices = [110, 100, 90, 90, 130, 150];
    updateChart(newPrices);
  });

});

// =================================================================================

document.addEventListener('DOMContentLoaded', function () {

  // Global arrays for token names and amounts
  // For Alpha and Beta V1, single assets, display underlying quantity & cost quantity
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

*/
