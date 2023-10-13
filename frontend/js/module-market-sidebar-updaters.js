// 1. Update Sidebar Hedge Volumes 
//----------------------------------------------------
function updateSectionValues_volumes(hedgesTraded, hedgesCreated, swapsVolume, optionsVolume, settledVolume, hedgeCostsTotal, hedgeProfits, hedgeFees, cashierFees) {
  // Format values
  const formatValue = (value) => {
    return `$${value.toFixed(2)}`;
  };

  // Update hedges traded and created
  document.getElementById("hedgeVolume").textContent = formatValue(hedgesTraded);
  // Update hedge premiums
  document.getElementById("premiumVolume").textContent = formatValue(hedgeCostsTotal);
  // Update settled volume
  document.getElementById("settleVolume").textContent = formatValue(settledVolume);  
  // Update hedge profits and losses
  document.getElementById("payoffVolume").textContent = formatValue(hedgeProfits);

}

function updateSectionValues_volumesERC20(tokenAddress, tokenName, tokenPrice, pairedSymbol, boughtOptionsCount, boughtSwapsCount, settledOptionsCount, settledSwapsCount, optionsCount, swapsCount) {
// prepare token summary
const tokenHeader = `
<div class="tokenHead">
  <div class="projectLogo sidebarLogo" style="background-image:url('./imgs/erc20-shitcoin-tr.png')"></div>
  <div class="projectName sidebarName">
    <div>`+tokenName+`</div>
    <div class="token_links">
      <span>`+tokenPrice+` `+pairedSymbol+`</span>
      <a class="etherscanLink" href="https://etherscan.io/address/'`+tokenAddress+`" target="_blank" alt="SC" title="Go to Etherscan">0x00..000</a>
    </div>
  </div>
</div>
<div class="neon-container">
  <span class="neon-text">Hedges Bought</span>
  <span id="premiumVolume" class="neon-amount boughtVolume">`+boughtOptionsCount + boughtSwapsCount+`</span>
</div>
<div class="neon-container">
  <span class="neon-text">Options</span>
  <span id="payoffVolume" class="neon-amount settledVolume">`+optionsCount+`</span>
</div>
<div class="neon-container">
  <span class="neon-text">Swaps</span>
  <span id="payoffVolume" class="neon-amount settledVolume">`+swapsCount+`</span>
</div>
<div class="neon-container">
  <span class="neon-text">Hedges Settled</span>
  <span id="settleVolume" class="neon-amount settledVolume">`+settledOptionsCount + settledSwapsCount+`</span>
</div>`;

// Update hedges traded and created
document.getElementById("hedgeVolume").empty().append = tokenHeader;
}
export { updateSectionValues_volumes, updateSectionValues_volumesERC20 };