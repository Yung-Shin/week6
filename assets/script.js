
$(document).ready(function () {

// declare variables
  let apiKey = "04b224ea6e7cb3656cbadc58a9e5d125";
  let baseUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
  let callUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=";
  let searchCity = $("#city");
  let searchCityForm = $("#search-city");
  let searchHistoryList = $("#search-history");
  let fiveDayForecast = $("#five-day"); 
  let presentDay = dayjs().format("dddd,MM/D/YYYY");
  
  const weatherIconUrl = "https://openweathermap.org/img/wn/";


// capitalize first letter of strings
  function capitalFirst(str) {
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
  }


// load previous cities from local storage
  function loadHistory() {
    var historyArray = JSON.parse(
      localStorage.getItem("searched-cities")
    );
    console.log(historyArray);
    if (!historyArray) {
      localStorage.setItem("searched-cities", JSON.stringify([]));
    }
    searchHistoryList.empty();
    historyArray.reverse();


// search history button
    for (var i = 0; i < historyArray.length; i++) {
      searchHistory(historyArray[i]);
    }
    return historyArray;
  }


//save to local storage
  function saveHistory(city) {
    var historyArray = JSON.parse(
      localStorage.getItem("searched-cities")
    );
    if (historyArray.includes(city)) {
      return;
    }
    historyArray.push(city);
    if (historyArray.length > 5) {
      historyArray.shift();
    }
    localStorage.setItem("searched-cities", JSON.stringify(historyArray));
    loadHistory();
  }


// history button function
  function searchHistory(city) {
    var searchHistoryButton = $("<button>")
      .addClass("button")
      .text(city)
      .on("click", function () {
        $("#current-weather").remove();
        $("#five-day").empty();
        $("#five-day-header").remove();
        coordinate(city);
      })
      .attr({
        type: "button",
      });

  
  searchHistoryList.append(searchHistoryButton);
  }


// function for city coordinate
  function coordinate(city) {
    var cityCoordinate = baseUrl + city + "&appid=" + apiKey;

    fetch(cityCoordinate)
      .then(function (response) {
        console.log(response);
        if (response.ok) {
          return response.json();
        }
      })
      .then(function (city) {
        console.log(city.name);
        saveHistory(city.name);
        weather(city.coord.lat, city.coord.lon, city.name);
      });
  }


// function for weather
  function weather(lat, lon, cityName) {
    var apiCall =
      callUrl + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=imperial";
    fetch(apiCall)
      .then(function (response) {
        console.log(response);
        if (response.ok) {
          return response.json();
        }
      })
      .then(function (data) {
        console.log(data.daily);
        displayWeather(data.daily, cityName);
      });
  }


// function for displaying weather
  function displayWeather(data, cityName) {
    var currentWeather = $("<div>").attr({
      id: "current-weather",
    });
    var weatherIcon = data[0].weather[0].icon;
    var currentWeatherIcon = weatherIconUrl + weatherIcon + ".png";
    var currentWeatherDisplay = $("<h2>").text(cityName + " (" + presentDay + ")");
    var iconImage = $("<img>").attr({
      id: "current-weather-icon",
      src: currentWeatherIcon,
      alt: "Weather Icon",
    });
    var currentWeatherList = $("<ul>");
    var currentWeatherCondition = [
      "Temp: " + data[0].temp.day + "°F",
      "Wind: " + data[0].wind_speed + " MPH",
      "Humidity: " + data[0].humidity + " %",
    ];


  // append weather conditions
    for (var i = 0; i < currentWeatherCondition.length; i++) {
      if (currentWeatherCondition[i] === "Temp: " + data[0].uvi) {
        var currWeatherListItem = $("<li>").text("Temp: ");
        
        currentWeatherList.append(currWeatherListItem);
      } else {
        var currWeatherListItem = $("<li>").text(currentWeatherCondition[i]);
      
        currentWeatherList.append(currWeatherListItem);
      }
    }

   
    $("#five-day").before(currentWeather);
    currentWeather.append(currentWeatherDisplay);
    currentWeatherDisplay.append(iconImage);
    currentWeather.append(currentWeatherList);

    

// 5 days forecasts
    var fiveDays = $("<h2>")
      .text("5 Day Forecasts:")
      .attr({id: "five-day-header"})
      .addClass("forcast");
    $("#current-weather").after(fiveDays);


    var fiveDaysArray = [];

    for (var i = 0; i < 5; i++) {
      let forecastDate = dayjs()
        .add(i + 1, "days")
        .format("MM/D/YYYY");
      fiveDaysArray.push(forecastDate);
    }


// display weather conditions for each day of forecast
  for (var i = 0; i < fiveDaysArray.length; i++) {
// css for forecast block
      var forecastCard = $("<div>").addClass("col3");
      var forecastCardBody = $("<div>").addClass("card-body");
      var forecastCardTitle = $("<h3>").addClass("card-title").text(fiveDaysArray[i]);
      var forecastIcon = data[i].weather[0].icon;
      var forecastIconAttr = $("<img>").attr({
        src: weatherIconUrl + forecastIcon + ".png",
        alt: "Weather Icon",
      });
// temperature, wind, and humidity
      var temperature = $("<p>")
        .addClass("card-text")
        .text("Temp:" + data[i].temp.day + "°F");
    
      var wind = $("<p>")
        .addClass("card-text")
        .text("Wind:" + data[i].wind_speed + "MPH");
 
      var humidity = $("<p>")
        .addClass("card-text")
        .text("Humidity:" + data[0].humidity + "%");

// append data
      fiveDayForecast.append(forecastCard);
      forecastCard.append(forecastCardBody);
      forecastCardBody.append(forecastCardTitle);
      forecastCardBody.append(forecastIconAttr);
      forecastCardBody.append(temperature);
      forecastCardBody.append(wind);
      forecastCardBody.append(humidity);
    }
  }


  function submitSearchCity(event) {
// to prevent default because of using form
    event.preventDefault();
    let city = capitalFirst(searchCity.val().trim());
    coordinate(city);
    console.log(city);
    searchCity.val("");
  }
  searchCityForm.on("submit", submitSearchCity);


// clears the current display once users click search
  $("#search-button").on("click", function () {
    $("#current-weather").remove();
    $("#five-day").empty();
    $("#five-day-header").remove();
  });

  loadHistory();
});