export function loadHedgesModule(contractInstance, userAddress) {
  let startIndex = 0;
  const limit = 50;
  let dataType = 'Options Created';

  const loadMoreButton = document.createElement('button');
  loadMoreButton.textContent = 'Load More';
  loadMoreButton.classList.add('load-more-button');
  loadMoreButton.style.display = 'none'; // Initially hide the button

  const hedgesList = document.querySelector('.hedges-trade-list');

  async function fetchDataAndPopulateList() {
    // Fetch data
    let data;
    switch (dataType) {
      case 'Options Created':
        data = await contractInstance.methods.getUserOptionsCreated(userAddress, startIndex, limit).call();
        break;
      case 'Options Taken':
        data = await contractInstance.methods.getUserOptionsTaken(userAddress, startIndex, limit).call();
        break;
      // Add
      default:
        break;
    }

    // Iterate through the fetched data and create HTML elements
    data.forEach(async item => {
      // Create and append the HTML elements
      const listItem = document.createElement('li');
      listItem.classList.add('hedge-item');
      // Populate list item with data
      // ...

      // Append the new list item to the hedgesList
      hedgesList.appendChild(listItem);
    });

    // Update startIndex for the next batch
    startIndex += data.length;

    // Show the "Load More" button if there's more data to load
    if (data.length === limit) {
      loadMoreButton.style.display = 'block';
    } else {
      loadMoreButton.style.display = 'none';
    }
  }

  loadMoreButton.addEventListener('click', () => {
    fetchDataAndPopulateList();
  });

  // Attach scroll event listener to the window
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const listHeight = hedgesList.clientHeight;
    const windowHeight = window.innerHeight;

    // When the user scrolls to the bottom of the list, trigger "Load More"
    if (scrollPosition + windowHeight >= listHeight) {
      loadMoreButton.click();
    }
  });

  // Attach event listeners to buttons
  const buttons = document.querySelectorAll('.list-toggle button');
  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      // Reset pagination when a different button is clicked
      startIndex = 0;
      dataType = button.textContent;

      // Clear existing data and hide "Load More" button
      hedgesList.innerHTML = '';
      loadMoreButton.style.display = 'none';

      // Fetch and populate initial data
      fetchDataAndPopulateList();
    });
  });
}
