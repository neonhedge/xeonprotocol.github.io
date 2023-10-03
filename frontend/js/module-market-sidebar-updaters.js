// 1. Update Sidebar Hedge Volumes 
//----------------------------------------------------
function updateSectionValues_volumes(hedgesTraded, hedgesCreated, swapsVolume, optionsVolume, settledVolume, hedgeCostsTotal, hedgeProfits, hedgeFees, cashierFees) {
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

  export { updateSectionValues_volumes };