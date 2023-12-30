export async function loadHedgesModule(userAddress) {
  let startIndex = 0;
  const limit = 50;
  let dataType = 'Options Created';

  const loadMoreButton = document.createElement('button');
  loadMoreButton.textContent = 'Load More';
  loadMoreButton.classList.add('load-more-button');
  loadMoreButton.style.display = 'none';

  const hedgesList = document.querySelector('.hedges-trade-list');

  async function fetchDataAndPopulateList() {
    let data;

    switch (dataType) {
      case 'Options Created':
        data = await hedgingInstance.methods.getUserOptionsCreated(userAddress, startIndex, limit).call();
        break;
      case 'Options Taken':
        data = await hedgingInstance.methods.getUserOptionsTaken(userAddress, startIndex, limit).call();
        break;
      case 'Swaps Created':
        data = await hedgingInstance.methods.getUserSwapsTaken(userAddress, startIndex, limit).call();
        break;
      case 'Swaps Taken':
        data = await hedgingInstance.methods.getUserSwapsTaken(userAddress, startIndex, limit).call();
        break;
      case 'My Bookmarks':
        data = await hedgingInstance.methods.getmyBookmarks(userAddress).call();
        break;
      // Handle other cases
      default:
        break;
    }

    const fragment = document.createDocumentFragment();

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

    hedgesList.appendChild(fragment);

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
  }, 300)); // Adjust delay (in milliseconds) for responsiveness
}