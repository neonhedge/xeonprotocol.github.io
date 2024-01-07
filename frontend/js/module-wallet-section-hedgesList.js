export async function loadHedgesModule(userAddress) {
  let startIndex = 0;
  const limit = 50;
  let dataType = 'Options Created';

  const loadMoreButton = document.createElement('button');
  loadMoreButton.textContent = 'Load More';
  loadMoreButton.classList.add('load-more-button');
  loadMoreButton.style.display = 'none';

  const hedgesList = document.querySelector('#hedges-trade-list');

  async function fetchDataAndPopulateList() {
    let data;
    console.log('fetching hedges for wallet: ', userAddress)
    switch (dataType) {
      case 'Options Created':
        data = await hedgingInstance.getUserOptionsCreated(userAddress, startIndex, limit);
        break;
      case 'Options Taken':
        data = await hedgingInstance.getUserOptionsTaken(userAddress, startIndex, limit);
        break;
      case 'Swaps Created':
        data = await hedgingInstance.getUserSwapsTaken(userAddress, startIndex, limit);
        break;
      case 'Swaps Taken':
        data = await hedgingInstance.getUserSwapsTaken(userAddress, startIndex, limit);
        break;
      case 'My Bookmarks':
        data = await hedgingInstance.getmyBookmarks(userAddress);
        break;
      // Handle other cases
      default:
        break;
    }

    const fragment = document.createDocumentFragment();

    if (data.length === 0 && startIndex > 0) {
      // If data is empty, append a message to inform the user
      const noHedgesMessage = document.createElement('div');
      noHedgesMessage.textContent = 'no more hedges to load';
      noHedgesMessage.classList.add('no-hedges-message');
      hedgesList.appendChild(noHedgesMessage);
    } else if (data.length === 0 && startIndex === 0) {
      // Clear existing content in hedgesList
      hedgesList.innerHTML = '';
      const noHedgesMessage = document.createElement('div');
      noHedgesMessage.textContent = 'No Hedges Found. Write or buy Options and Swaps to populate this area.';
      noHedgesMessage.classList.add('no-hedges-message');
      hedgesList.prepend(noHedgesMessage);
    }
     else {
      // If data is not empty, populate the list as before
      // For works better than foreach inside async function
      for (const item of data) {
          const result = await getHedgeDetails(item); 

          const listItem = document.createElement('li');
          listItem.classList.add('hedge-item');

          const hedgeType = document.createElement('div');
          hedgeType.classList.add('hedge-type', 'hedge-i-cat');
          hedgeType.textContent = result.hedgeType;
          listItem.appendChild(hedgeType);

          const tokenInfo = document.createElement('div');
          tokenInfo.classList.add('token-info');

          const hedgeSymbol = document.createElement('div');
          hedgeSymbol.classList.add('hedge-symbol', 'hedge-i-cat');
          hedgeSymbol.textContent = result.hedgeSymbol;
          tokenInfo.appendChild(hedgeSymbol);

          const hedgeValue = document.createElement('div');
          hedgeValue.classList.add('hedge-value', 'hedge-i-cat');
          hedgeValue.textContent = result.hedgeValue; 
          tokenInfo.appendChild(hedgeValue);

          const tokenAddress = document.createElement('div');
          tokenAddress.classList.add('token-address');
          let truncatedAddr = tokenAddress.substring(0, 6) + '...' + tokenAddress.slice(-3);
          tokenAddress.textContent = truncatedAddr; 
          tokenInfo.appendChild(tokenAddress);

          listItem.appendChild(tokenInfo);

          const hedgeTxBtn = document.createElement('button');
          hedgeTxBtn.classList.add('hedgeTxBtn');
          hedgeTxBtn.textContent = 'Tx';
          listItem.appendChild(hedgeTxBtn);

          // Use fragments instead of adding elements one by one
          fragment.appendChild(listItem);
      }
      // Append the fragment to the list
      hedgesList.appendChild(fragment);
    }

    startIndex += data.length;

    loadMoreButton.style.display = data.length === limit ? 'block' : 'none';
  }

  // Event listener, check efficiency
  loadMoreButton.addEventListener('click', fetchDataAndPopulateList);

  const buttons = document.querySelectorAll('.list-toggle button');
  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      startIndex = 0;
      dataType = button.getAttribute('data-type');

      hedgesList.innerHTML = '';
      loadMoreButton.style.display = 'none';

      fetchDataAndPopulateList();
    });
  });

  // Limits the execution of the callback to once every specified delay
  function throttle(callback, delay) {
    let lastTime = 0;
    return function () {
      const currentTime = new Date();
      if (currentTime - lastTime >= delay) {
        callback.apply(null, arguments);
        lastTime = currentTime;
      }
    };
  }

  // Attach scroll event listener to the window using throttling
  window.addEventListener('scroll', throttle(() => {
    const scrollPosition = window.scrollY;
    const listHeight = hedgesList.clientHeight;
    const windowHeight = window.innerHeight;

    if (scrollPosition + windowHeight >= listHeight) {
      loadMoreButton.click();
    }
  }, 15000)); // Adjust delay (in milliseconds) for responsiveness
}