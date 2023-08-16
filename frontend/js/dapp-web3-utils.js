// Initialize Web3
export function initWeb3() {
  if (typeof window.ethereum == 'undefined') {
    swal({
      title: "Hold on!",
      type: "error",
      confirmButtonColor: "#F27474",
      text: "Web3 Wallet is missing, full functionality is not available."
    });
  } else if (typeof window.ethereum !== 'undefined') {
    // Metamask on the browser, get provider
    window.web3 = new Web3(window.ethereum);

    // Create Instances
    window.neonInstance = new window.web3.eth.Contract(CONSTANTS.neonContractABI, CONSTANTS.neonAddress);
    window.hedgingInstance = new window.web3.eth.Contract(CONSTANTS.hedgingContractABI, CONSTANTS.hedgingAddress);
    window.stakingInstance = new window.web3.eth.Contract(CONSTANTS.stakingContractABI, CONSTANTS.stakingAddress);
  }
}


// Other utility functions defined here if needed


// Export the fetch functions
export { initWeb3 };
