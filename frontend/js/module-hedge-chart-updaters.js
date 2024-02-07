const formatStringDecimal = (number) => {
  const options = {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
  };
  return number.toLocaleString('en-US', options);
};

function updateChartValues_Hedge(prices, targetPrice) {
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
  
    // Calculate chart dimensions based on prices dataset
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
          tag.textContent = `Price: ${formatStringDecimal(prices[i])}`;
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
  
    // Temporary: dynamically updating the chart with new prices
    document.getElementById('refreshButton').addEventListener('click', () => {
      const newPrices = [110, 100, 90, 90, 130, 150];
      updateChart(newPrices);
    });
    

    // Draw chart
    function drawChart() {
      const chartDimensions = calculateChartDimensions();
      const step = chartWidth / (prices.length - 1);
  
      // Clear canvas
      ctx.clearRect(0, 0, chartWidth, chartHeight);
  
      // Disable image smoothing for crisp text rendering
      ctx.imageSmoothingEnabled = false;
  
      // Draw vertical lines representing prices
      ctx.strokeStyle = '#000'; // Black color for lines
      ctx.beginPath();
      for (let i = 0; i < prices.length; i++) {
          const x = i * step;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, chartHeight);
      }
      ctx.stroke();
  
      // Draw horizontal lines representing time
      ctx.beginPath();
      ctx.moveTo(0, chartHeight - 1);
      ctx.lineTo(chartWidth, chartHeight - 1);
      ctx.stroke();
  
      // Draw the line connecting prices on the chart
      ctx.fillStyle = areaColor;
      ctx.strokeStyle = 'rgba(0, 191, 255, 1)'; // Clear sky blue color with full opacity
      ctx.lineWidth = 1; // Set the line width for crisp lines
      ctx.beginPath();
      ctx.moveTo(0, chartHeight - ((prices[0] - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight);
      for (let i = 1; i < prices.length; i++) {
          const x = i * step;
          const y = chartHeight - ((prices[i] - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
          const prevY = chartHeight - ((prices[i - 1] - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
          const xc = (x + (x - step)) / 2; // Bezier control point x-coordinate
          ctx.bezierCurveTo(xc, prevY, xc, y, x, y); // Add a smooth curve to the path
      }
      ctx.stroke();
  
      // Draw target price level line (constant line)
      const targetY = chartHeight - ((targetPrice - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
      ctx.strokeStyle = '#d6188a'; // Red
      ctx.beginPath();
      ctx.moveTo(0, targetY);
      ctx.lineTo(chartWidth, targetY);
      ctx.stroke();
  
      // Draw current price level line
      const currentPrice = prices[prices.length - 1];
      const currentPriceY = chartHeight - ((currentPrice - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
      ctx.strokeStyle = '#089353'; // Green
      ctx.beginPath();
      ctx.moveTo(0, currentPriceY);
      ctx.lineTo(chartWidth, currentPriceY);
      ctx.stroke();
  
      // Draw price tags
      ctx.fillStyle = textColor;
      ctx.font = '100 10px sans-serif';
      for (let i = 0; i < prices.length; i++) {
          const x = i * step;
          const y = chartHeight - ((prices[i] - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText(formatStringDecimal(prices[i]), x + 5, y - 10); // Display price values at all times
      }
  
      // Draw labels for horizontal lines
      ctx.fillStyle = '#fff'; // White
      ctx.fillText(`start: ${formatStringDecimal(prices[0])}`, 10, chartHeight - 10); // Adjust x-coordinate as needed
      ctx.fillText(`strike: ${formatStringDecimal(targetPrice)}`, chartWidth / 2 - 30, targetY - 5); // Adjust x-coordinate as needed
      ctx.fillText(`current: ${formatStringDecimal(prices[prices.length - 1])}`, chartWidth - 100, currentPriceY - 5); // Adjust x-coordinate as needed
  }
  
  // Draw Price Chart with data provided
  drawChart();  
}
/*
function drawChart() {
  const chartDimensions = calculateChartDimensions();
  const step = chartWidth / (prices.length - 1);

  // Clear canvas
  ctx.clearRect(0, 0, chartWidth, chartHeight);

  // Disable image smoothing for crisp text rendering
  ctx.imageSmoothingEnabled = false;

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
  ctx.strokeStyle = '#d6188a'; // red
  ctx.beginPath();
  ctx.moveTo(0, targetY);
  ctx.lineTo(chartWidth, targetY);
  ctx.stroke();

  // Draw start price level line
  const startPrice = prices[0];
  const startPriceY = chartHeight - ((startPrice - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
  ctx.strokeStyle = 'rgb(8, 231, 254)'; // blue
  ctx.beginPath();
  ctx.moveTo(0, startPriceY);
  ctx.lineTo(chartWidth, startPriceY);
  ctx.stroke();

  // Draw current price level line
  const currentPrice = prices[prices.length - 1];
  const currentPriceY = chartHeight - ((currentPrice - chartDimensions.minPrice) / chartDimensions.priceRange) * chartHeight;
  ctx.strokeStyle = '#089353'; // green
  ctx.beginPath();
  ctx.moveTo(0, currentPriceY);
  ctx.lineTo(chartWidth, currentPriceY);
  ctx.stroke();

  // Draw price tags
  ctx.fillStyle = textColor;
  ctx.font = '100 10px sans-serif';
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
  ctx.fillText(`start: ${formatStringDecimal(prices[0])}`, chartWidth - 60, startPriceY - 5);
  ctx.fillText(`strike: ${formatStringDecimal(targetPrice)}`, chartWidth - 60, targetY - 5);
  ctx.fillText(`current: ${formatStringDecimal(prices[prices.length - 1])}`, chartWidth - 60, currentPriceY - 5);
  
}

// Draw Price Chart with data provided
drawChart();
*/
  /*===================================================*/

  
  // TODO: the circles generated below have a redish/brownish border how do i remove it

function updateChartValues_Assets(tokenNames, tokenAmounts) {

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
            Matter.Bodies.rectangle(width / 2, height, width, 1, { isStatic: true, render: { fillStyle: '#3399ff' } }),
            Matter.Bodies.rectangle(width / 2, 0, width, 0, { isStatic: true }),
            Matter.Bodies.rectangle(0, height / 2, 1, height, { isStatic: true, render: { fillStyle: '#3399ff' } }),
            Matter.Bodies.rectangle(width, height / 2, 1, height, { isStatic: true, render: { fillStyle: '#3399ff' } })
        ]);

        // Empty the container
        container.innerHTML = "";

        // Create the circles, use tokenlength as max counter
        for (let i = 0; i < tokenAmounts.length; i++) {
            // Random index for tokenNames and tokenAmount arrays
            const randomIndex = i;
    
            // Get the corresponding token name and amount
            const name = tokenNames[randomIndex];
            const amount = tokenAmounts[randomIndex];
            const amountFormated = formatStringDecimal(amount);
    
            // Calculate circle size based on token amount
            const amountRatio = (amount - Math.min(...tokenAmounts)) / (Math.max(...tokenAmounts) - Math.min(...tokenAmounts));
            const circleRadius = 30 + (30 * amountRatio);
    
            // Randomize the position within the container
            const x = Math.random() * (width - circleRadius * 2) + circleRadius;
            const y = Math.random() * (height - circleRadius * 2) + circleRadius;
    
            // Create the circle element
            const circle = document.createElement("div");
            circle.classList.add("assetCircle");
            circle.style.width = `${circleRadius * 2}px`;
            circle.style.height = `${circleRadius * 2}px`;
            circle.style.borderRadius = `${circleRadius}px`;
            // Assign a random color to the circle
            const uniqueColor = getRandomColor();
            circle.style.backgroundColor = uniqueColor;
            circle.style.border = `1px solid ${uniqueColor}`;
            // Add text
            circle.textContent = `${name}\n${amountFormated}`;
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
        Matter.Runner.run(engine);
        Matter.Render.run(Matter.Render.create({
            element: container,
            engine: engine,
            options: {
                wireframes: false,
                background: "rgba(0, 0, 0, 0)",
                showVelocity: true,
                width: "100%", // Set the width to "100%"
                height: "100%" // Set the height to "100%"
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
}

// Export the fetch functions
export { updateChartValues_Hedge, updateChartValues_Assets };
  
  