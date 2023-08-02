// JavaScript Document

/*==============================
         Configuration
==============================*/
document.addEventListener('DOMContentLoaded', function () {
  // Sample data (replace this with your dynamic data)
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
  const areaColor = '#32388a '; // dark blue. ALT #0e3155

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
