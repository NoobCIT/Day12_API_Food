//===================== REQUEST API DATA FROM ZOMATO =====================//
// Zomato only lets you grab 20 queries at a time,
// Retrieves the ranges [0, 20], [20, 40], [40, 60], [60, 80], [80, 100]

function* generateEndPoints(minDataRange, maxDataRange) {

  let entity_id = '306';      // id for San Francisco
  let entity_type = 'city';   // query type is city
  let searchDomain = 'https://developers.zomato.com/api/v2.1/search?';
  let queryId = `entity_id=${entity_id}`;
  let queryType = `entity_type=${entity_type}`;

  let start = minDataRange;
  while (start <= maxDataRange) {
    let request_url = searchDomain
                      + queryId + '&' + queryType
                      + '&' + `&start=${start}&count=${start + 20}`;
    start += 20;
    yield request_url;
  }
}

let urls = [...generateEndPoints(0, 100)]; // stores urls/endpoints

var options = {
  method: 'GET',
  headers: {
    'user-key': config.ENV_USER_KEY,
    'Content-Type': 'application/json'
  }
};

let fetchCalls = urls.map(url => {
  return fetch(url, options);
});

function getData(arrayOfPromises) {
  return new Promise((resolve, reject) => {
    Promise.all(arrayOfPromises)
      .then(responses => {
        return responses.map(response => response.json());
      })
      .then(responses => {
        Promise.all(responses)
          .then(resolve);
      })
      .catch(reject);
  })
}

function getListOfRestaurants(dataResults) {
  let listOfRestaurants = [];
  dataResults.forEach((data) => {
    data.restaurants.forEach(restaurant => {
      listOfRestaurants.push(restaurant);
    });
  });
  return listOfRestaurants;
}

getData(fetchCalls)
  .then(result => {
    displayRestaurants(getListOfRestaurants(result));
  });

//===================== DISPLAY RESULTS FROM REQUESTS =====================//

let list = document.querySelector('.list'); // aappend all entries here in DOM

function displayRestaurants(restaurantsList) {
  for (let item of restaurantsList) {

    let restaurant  = item.restaurant;
    let thumbnail   = restaurant.thumb;
    let name        = restaurant.name;
    let address     = restaurant.location.address;
    let votes       = restaurant.user_rating.votes;
    let rating      = restaurant.user_rating.aggregate_rating;
    let cost        = restaurant.average_cost_for_two;
    let container   = createDiv('restaurant');

    container.appendChild(createTypElem(thumbnail, 'icon', 'IMG'));
    container.appendChild(createTypElem(name, 'restaurantName', 'H3'));
    container.appendChild(createTypElem(address, 'address', 'H5'));
    container.appendChild(createTypElem(votes, 'votes', 'P'));
    container.appendChild(createTypElem(rating, 'rating', 'P'));
    container.appendChild(createTypElem(cost, 'cost', 'P'));
    list.appendChild(container);
  }
}

function createDiv(yourClass) {
  let newDiv = document.createElement('DIV');
  newDiv.classList.add(yourClass);
  return newDiv;
}

function createTypElem(data, yourClass, element) {
  let subContainer = createDiv(yourClass);
  let newElement = document.createElement(element);
  if (element == 'IMG') {
    newElement.src = data;
  } else {
    newElement.innerHTML = data;
  }
  subContainer.appendChild(newElement);
  return subContainer;
}
