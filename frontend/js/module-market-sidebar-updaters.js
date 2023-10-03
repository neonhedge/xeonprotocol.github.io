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

export { updateSectionValues_volumes };