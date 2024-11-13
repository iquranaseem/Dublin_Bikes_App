let markers = [];
let userLocationMarker;
let map;
let directionsRenderer = null;
let heatmapLayer;

let cachedLocation = null;

function searchStations(stations, map, availability) {
  const searchInput = document.getElementById("search-input");
  const dropdown = document.getElementById("stations-dropdown");
  const restoreBasicViewButton = document.getElementById("restore-basic-view");


  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    dropdown.innerHTML = "";

    if (searchTerm) {
      dropdown.style.display = "block";
      const filteredStations = stations.filter(station =>
        station.nameStation.toLowerCase().startsWith(searchTerm)
      );

      for (const station of filteredStations) {
        const stationElement = document.createElement("div");
        stationElement.classList.add("station");
        stationElement.innerText = station.nameStation;
        stationElement.addEventListener("click", () => {
          removeAllMarkers();
          addMarkers([station], map, availability);
          map.setCenter({ lat: station.latPositionStation, lng: station.lngPositionStation }); // center the map on the selected station's location
          dropdown.style.display = "none";
          searchInput.value = "";
        });
        dropdown.appendChild(stationElement);
      }
    } else {
      dropdown.style.display = "none";
    }
  });

  restoreBasicViewButton.addEventListener("click", () => {
    removeAllMarkers();
    createUserMarker(map);
    addMarkers(stations, map, availability);
    searchInput.value = "";
    dropdown.style.display = "none";

    // Remove the route from the map
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    // Remove the heatmap
    if (heatmapLayer) {
      heatmapLayer.setMap(null);
    }

    // Reset filters and buttons state
    showOnlyAvailable = false;
    showOnlyAvailableStands = false;
    toggleAvailableStationsButton.textContent = "Toggle stations with available bikes";
    toggleAvailableStandsButton.textContent = "Toggle available stands";
  
      // Reset weather info box
  getWeather();

  // Reset station info box
document.getElementById("station-info").innerHTML = `
<h2>Click on a station marker to display station information or get directions</h2>
`;

// Reset occupancy info box
document.getElementById("occupancy-info").innerHTML = `
<h2>Click on a station marker to display the prediction graphs</h2>
`;
});

}

function removeAllMarkers() {
  for (const marker of markers) {
    marker.setMap(null);
  }
  markers = [];
  if (userLocationMarker) {
    google.maps.event.clearListeners(userLocationMarker, 'click');
    // userLocationMarker.setMap(null);
    // userLocationMarker = null;
  }
}




function addMarkers(stations, map, availability, showOnlyAvailable = false, showOnlyAvailableStands = false) {
  removeAllMarkers();
  
  for (const station of stations) {
    const av = availability.find(x => x.nameStation === station.nameStation)

    // Skip the station if the name matches 'Oriel Street Test Terminal', case-insensitive
    if (station.nameStation.toLowerCase() === 'oriel street test terminal'.toLowerCase()) {
      continue;
    }

    if (showOnlyAvailable && (!av || av.availableBikes === 0)) {
      continue; // Skip the station if the filter is enabled and the station is not available
    }
    if (showOnlyAvailableStands && (!av || av.availableBikeStands === 0)) {
      continue; // Skip the station if the filter is enabled and there are no available stands
    }
    // Format the station name
    let stationNameFormatted = station.nameStation.replace(/\w\S*/g, (word) => {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });
    

    // Format the status
    let statusFormatted = av ? av.status.charAt(0).toUpperCase() + av.status.slice(1).toLowerCase() : 'Not found';

    let bankingStatus = station.bankingStation === 1 ? "Yes" : "No";
    let content = `
  <div id="content" style="width: 100%; max-width: 300px;">
    <h2>Station: ${stationNameFormatted}</h2>
    ${av ? `
      <p>Available bike stands: ${av.availableBikeStands}</p>
      <p>Available bikes: ${av.availableBikes}</p>
      <p>Status: ${statusFormatted}</p> <!-- Updated status -->
      <p>Station number: ${station.idStation}</p>
      <p>Banking: ${bankingStatus}</p>
    ` : '<p>Station not found</p>'}
  </div>
`;

    const infowindow = new google.maps.InfoWindow({
      content: content
    });

    const markerColor = av && av.availableBikes > 5 ? "green" : av && av.availableBikes > 0 ? "orange" : "red";
    const marker = new google.maps.Marker({
      position: {
        lat: station.latPositionStation,
        lng: station.lngPositionStation
      },
      map: map,
      title: station.nameStation,
      station_number: station.idStation,
      icon: `https://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`,
    });

    marker.addListener('mouseover', function () {
      infowindow.open(map, marker);
    });

    marker.addListener('mouseout', function () {
      infowindow.close(map, marker);
    });

    marker.addListener('click', function () {
      map.setCenter({ lat: station.latPositionStation, lng: station.lngPositionStation });
      const stationInfoDiv = document.querySelector('#station-info');
      stationInfoDiv.innerHTML = content;

      const occupancyInfo = document.querySelector('#occupancy-info');
      const imageNameBikes = `${station.nameStation.toUpperCase().replace('/', 'or')}.png`;
      const imageNameStands = `${station.nameStation.toUpperCase().replace('/', 'or')}.png`;

      const imageSrcBikes = '/static/plotsbikes/' + imageNameBikes;
      const imageSrcStands = '/static/plotsstands/' + imageNameStands;
    
   // Create "Show Available Bikes" button
  const showBikesButton = document.createElement('button');
  showBikesButton.innerText = 'Show Bike Prediction';
  showBikesButton.classList.add('occupancy-button');
  showBikesButton.addEventListener('click', function() {
    occupancyInfo.querySelector('h2').innerText = 'Available Bikes Prediction Graph';
    occupancyInfo.querySelector('#occupancy-image').src = imageSrcBikes;
  });

  // Create "Show Available Bike Stands" button
  const showStandsButton = document.createElement('button');
  showStandsButton.innerText = 'Show Bike Stand Prediction';
  showStandsButton.classList.add('occupancy-button');
  showStandsButton.addEventListener('click', function() {
    occupancyInfo.querySelector('h2').innerText = 'Available Stands Prediction Graph';
    occupancyInfo.querySelector('#occupancy-image').src = imageSrcStands;
  });


      // Add both buttons and image to occupancyInfo div
      occupancyInfo.innerHTML = `<h2> Available Bikes Prediction Graph</h2>
    <img id="occupancy-image" class="prediction-graph" src="${imageSrcBikes}" alt="Bikes Prediction Graph">`;
      occupancyInfo.appendChild(showStandsButton);
      occupancyInfo.appendChild(showBikesButton);
      // Call function to add "Get Directions" button to station info box
      addDirectionsButton();

      
          // Fetch the MSE data
fetch('/mse')
  .then(response => response.json())
  .then(mseData => {
    console.log('MSE data is', mseData);

    // Fetch the weather prediction data
    fetch(`/predict/${station.nameStation}`)
      .then(response => response.json())
      .then(data => {
        console.log("Data is", data);
        const weatherInfoDiv = document.querySelector('#weather-info');
        const mseValue = mseData[station.nameStation];

        const mseSqrt = Math.sqrt(mseValue).toFixed(2);

        // Format the station name
        let stationNameFormatted = station.nameStation.charAt(0).toUpperCase() + station.nameStation.slice(1).toLowerCase();

        const content = `
          <div id="content" style="width: 100%; max-width: 300px;">
            <h2>Weather based prediction of available bikes</h2>
            <p>Predicted number of available bikes accounting for weather in ${stationNameFormatted}: ${data.prediction.toFixed(2)} bikes</p>
            <p>Error estimate: +/- ${mseSqrt} bikes</p>
          </div>
        `;

        weatherInfoDiv.innerHTML = content;
      });
  });


    });



    markers.push(marker); // Add the marker to the markers array

  }


}


function centerMapOnUserLocation(map) {
  if (navigator.geolocation && cachedLocation == null) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        cachedLocation = userLocation
        map.setCenter(userLocation);
        addUserLocationMarker(userLocation, map);
      },
      (e) => {
        console.error("Error: The Geolocation service failed.", e);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  } 
  else if (cachedLocation != null) {
    map.setCenter(cachedLocation);
    addUserLocationMarker(cachedLocation, map);
  }
  else {
    console.error("Error: Your browser doesn't support geolocation.");
  }
}

function createUserMarker(map) {
  if (navigator.geolocation && cachedLocation == null) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        cachedLocation = userLocation;
        addUserLocationMarker(userLocation, map);
      },
      (e) => {
        console.error("Error: The Geolocation service failed.", e);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  } else if (cachedLocation != null) {
    console.log("Setting from cache");
    addUserLocationMarker(cachedLocation, map);
  }
  else {
    console.error("Error: Your browser doesn't support geolocation.");
  }
} 

function addUserLocationMarker(position, map) {
  userLocationMarker = new google.maps.Marker({
    position: position,
    map: map,
    title: "You are here",
    icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  });

  fetch("/stations")
    .then((response) => response.json())
    .then((stations) => {
      const closestStation = findClosestStation(position, stations);
      console.log("Closest station:", closestStation);

      // Create an info window for the closest station
      const closestStationInfoWindow = new google.maps.InfoWindow({
        content: `<h3>Closest Station: ${closestStation.nameStation}</h3>`
      });

      // Show the info window when clicking on the user location marker
      userLocationMarker.addListener('click', () => {
        closestStationInfoWindow.open(map, userLocationMarker);
      });
    });
}

function getStations(map) {
  fetch("/stations")
    .then((response) => response.json())
    .then((stations) => {
      fetch("/availability")
        .then((response) => response.json())
        .then((availability) => {
          addMarkers(stations, map, availability);
          searchStations(stations, map, availability);

          // Add heatmap
          const heatmapData = generateHeatmapData(stations, availability);
          heatmapLayer = addHeatmapLayer(map, heatmapData, false);
        });
    });
}

function initMap() {
  const dublin = { lat: 53.3498, lng: -6.2603 };
  map = new google.maps.Map(document.getElementById("map"), { // Remove the 'const' keyword
    zoom: 14,
    center: dublin,
  });
  createLegend(map);
  getStations(map);
  centerMapOnUserLocation(map);
}

function loadMap() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=[INSERT_KEY]&libraries=geometry,visualization&callback=initMap`;
  script.defer = true;
  script.async = true;
  document.head.appendChild(script);
}

function getWeather() {
  fetch("/weather")
    .then((response) => response.json())
    .then((data) => {
      const weatherInfoDiv = document.querySelector("#weather-info");

      weatherInfoDiv.innerHTML = `
        <div id="content" style="width: 100%; max-width: 300px;">
          <h2>Weather information</h2>
          <p>Temperature: ${data.tempInC}°C</p>
          <p>Weather condition: ${data.condition}</p>
          <p>Precipitation: ${data.precipInMm} mm</p>
          <p>Wind speed: ${data.windInKph} kph</p>
          <p>Last updated: ${data.timeInDublin}</p>
        </div>
      `;
    });
}

function findClosestStation(userLocation, stations) {
  console.log("Finding closest station for", {userLocation, stations})
  let closestStation = null;
  let shortestDistance = Infinity;

  for (const station of stations) {
    const stationLocation = {
      lat: station.latPositionStation,
      lng: station.lngPositionStation,
    };
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(userLocation),
      new google.maps.LatLng(stationLocation)
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestStation = station;
    }
  }

  return closestStation;
}

function addDirectionsButton() {
  const stationInfo = document.querySelector('#station-info');
  const directionsButton = document.createElement('button');
  directionsButton.textContent = 'Get Directions';

  const selectedMarker = markers.find(marker => marker.station_number === parseInt(document.querySelector('#station-info > div > p:nth-child(5)').textContent.split(': ')[1]));

  directionsButton.addEventListener('click', () => {
    calculateAndDisplayRoute(selectedMarker);
  });
  stationInfo.appendChild(directionsButton);
}

function removeMarkersExcept(selectedMarker) {
  for (const marker of markers) {
    if (marker !== userLocationMarker && marker !== selectedMarker) {
      marker.setMap(null);
    }
  }
}

function calculateAndDisplayRoute(selectedMarker) {
  createUserMarker();

  if (!userLocationMarker || !selectedMarker) {
    console.error('Error: userLocationMarker or selectedMarker is not defined.');
    return;
  }

  if (directionsRenderer) {
    directionsRenderer.setMap(null);
  }

  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  const directionsService = new google.maps.DirectionsService();

  directionsService.route(
    {
      origin: userLocationMarker.getPosition(),
      destination: selectedMarker.getPosition(),
      travelMode: google.maps.TravelMode.BICYCLING,
    },
    (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        removeMarkersExcept(selectedMarker);
        directionsRenderer.setDirections(response);
      } else {
        console.error('Error: Directions request failed due to ' + status);
      }
    }
  );
}

// had to impose different gradient to make heatmap consistent with bike markers
const gradient = [
  "rgba(255, 0, 0, 0)", // red to orange
  "rgba(255, 63, 0, 1)",
  "rgba(255, 127, 0, 1)",
  "rgba(255, 191, 0, 1)",
  "rgba(255, 255, 0, 1)",
  "rgba(0, 255, 0, 1)" // green
];

function generateHeatmapData(stations, availability) {
  return stations.map((station) => {
    const av = availability.find((x) => x.nameStation === station.nameStation);
    const weight = av ? av.availableBikes : 0;
    const opacity = weight ? 0.7 : 0; // set opacity to 0 if weight is 0
    return {
      location: new google.maps.LatLng(station.latPositionStation, station.lngPositionStation),
      weight: weight,
      opacity: opacity,
    };
  });
}

function addHeatmapLayer(map, heatmapData, toggle = false) {
  const heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    map: toggle ? map : null, // If toggle is true, set the map, otherwise set to null
    radius: 50,
    gradient: gradient,
  });
  return heatmap;
}

function addToggleHeatmapButton() {
  const toggleHeatmapButton = document.getElementById("toggle-heatmap");
  toggleHeatmapButton.addEventListener("click", () => {
    if (heatmapLayer.getMap()) {
      heatmapLayer.setMap(null);
    } else {
      heatmapLayer.setMap(map);
    }
  });
}

let showOnlyAvailable = false;
let showOnlyAvailableStands = false;

function toggleAvailableStations() {
  const toggleAvailableStationsButton = document.getElementById("toggle-available-stations");

  toggleAvailableStationsButton.addEventListener("click", () => {
    showOnlyAvailable = !showOnlyAvailable;

    fetch("/stations")
      .then((response) => response.json())
      .then((stations) => {
        fetch("/availability")
          .then((response) => response.json())
          .then((availability) => {
            addMarkers(stations, map, availability, showOnlyAvailable);
          });
      });
  });
}

function toggleAvailableStands() {
  const toggleAvailableStandsButton = document.getElementById("toggle-available-stands");

  toggleAvailableStandsButton.addEventListener("click", () => {
    showOnlyAvailableStands = !showOnlyAvailableStands;

    fetch("/stations")
      .then((response) => response.json())
      .then((stations) => {
        fetch("/availability")
          .then((response) => response.json())
          .then((availability) => {
            addMarkers(stations, map, availability, showOnlyAvailable, showOnlyAvailableStands);
          });
      });
  });
}

function getClosestStationsWithBikes(userLocation, stations, availability, count = 5) {
  const stationsWithBikes = stations.filter(station => {
    const av = availability.find(x => x.nameStation === station.nameStation);
    return av && av.availableBikes > 0;
  });

  const stationsWithDistances = stationsWithBikes.map(station => {
    const stationLocation = {
      lat: station.latPositionStation,
      lng: station.lngPositionStation
    };
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(userLocation),
      new google.maps.LatLng(stationLocation)
    );
    return { ...station, distance };
  });

  return stationsWithDistances.sort((a, b) => a.distance - b.distance).slice(0, count);
}

function initShowWalkingDistanceButton(stations, availability) {
  const showWalkingDistanceButton = document.getElementById("show-walking-distance");

  showWalkingDistanceButton.addEventListener("click", () => {
    createUserMarker(map)
    if (userLocationMarker) {
      const userLocation = userLocationMarker.getPosition().toJSON();
      const closestStationsWithBikes = getClosestStationsWithBikes(userLocation, stations, availability);
      removeAllMarkers();
      addMarkers(closestStationsWithBikes, map, availability);

      // Update station info box with walking distance and station names
      const stationInfoDiv = document.querySelector('#station-info');
      let stationList = '';

      for (const station of closestStationsWithBikes) {
        const av = availability.find(x => x.nameStation === station.nameStation);
        let formattedName = '';
        for (const word of station.nameStation.split(' ')) {
          formattedName += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() + ' ';
        }
        stationList += `
          <p class="small-text">
            ${formattedName.trim()} - Distance: ${Math.round(station.distance)} meters
          </p>
        `;
      }

      stationInfoDiv.innerHTML = `
        <h2>Closest Stations with Available Bikes</h2>
        ${stationList}
      `;
    } else {
      alert("User location not available.");
    }
  });
}

function createLegend(map) {
  const legend = document.createElement('div');
  legend.id = 'legend';
  legend.style.backgroundColor = 'white';
  legend.style.padding = '10px';
  legend.style.border = '1px solid #999';
  legend.style.borderRadius = '5px';
  legend.innerHTML = `
    <h3>Legend</h3>
    <div><span style="background-color: green; width: 16px; height: 16px; display: inline-block; border-radius: 50%;"></span> More than 5 bikes available</div>
    <div><span style="background-color: orange; width: 16px; height: 16px; display: inline-block; border-radius: 50%;"></span> 1 to 5 bikes available</div>
    <div><span style="background-color: red; width: 16px; height: 16px; display: inline-block; border-radius: 50%;"></span> No bikes available</div>
    <div><span style="background-color: blue; width: 16px; height: 16px; display: inline-block; border-radius: 50%;"></span> User location</div>
  `;
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);
}

function addRecenterMapOnUserButton() {
  const recenterMapOnUserButton = document.createElement("button");
  recenterMapOnUserButton.textContent = "Recenter Map on User";
  recenterMapOnUserButton.style.marginLeft = "10px";
  document.getElementById("restore-basic-view").insertAdjacentElement("beforebegin", recenterMapOnUserButton);

  recenterMapOnUserButton.addEventListener("click", () => {
    if (userLocationMarker) {
      map.setCenter(userLocationMarker.getPosition());
    } else {
      alert("User location not available.");
    }
  });
}


window.addEventListener("DOMContentLoaded", () => {
  loadMap(); // Loads the Google Map
  getWeather(); // Fetches weather information

  // Initialize buttons and event listeners
  addToggleHeatmapButton(); // Adds a button to toggle the heatmap
  toggleAvailableStations(); // Adds an event listener to show/hide stations with available bikes
  toggleAvailableStands(); // Adds an event listener to show/hide stations with available stands
  addRecenterMapOnUserButton();
  
  fetch("/stations")
    .then((response) => response.json())
    .then((stations) => {
      fetch("/availability")
        .then((response) => response.json())
        .then((availability) => {
          initShowWalkingDistanceButton(stations, availability); // Adds an event listener to show the closest stations with available bikes
        });
    });
});
