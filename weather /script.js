let currentTempC = null;
let currentTempF = null;
let currentUnit = "C";
let currentWind = null;
let currentHumidity = null;
let forecastData = null;
let forecastVisible = false;

document.addEventListener("DOMContentLoaded", function () {

    const forecastBtn = document.getElementById("forecastToggle");

    // Forecast toggle button
    forecastBtn.addEventListener("click", function () {
        if (!forecastData) return;

        if (!forecastVisible) {
            displayForecast(forecastData);
            forecastBtn.textContent = "Hide 3-Day Forecast";
            forecastVisible = true;
        } else {
            removeForecast();
            forecastBtn.textContent = "Show 3-Day Forecast";
            forecastVisible = false;
        }
    });

    // 🌙 Dark Mode toggle
    const toggleBtn = document.getElementById("toggleMode");
    if (toggleBtn) {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark");
            toggleBtn.textContent = "☀️ Light Mode";
        }

        toggleBtn.addEventListener("click", function () {
            document.body.classList.toggle("dark");
            if (document.body.classList.contains("dark")) {
                toggleBtn.textContent = "☀️ Light Mode";
                localStorage.setItem("theme", "dark");
            } else {
                toggleBtn.textContent = "🌙 Dark Mode";
                localStorage.setItem("theme", "light");
            }
        });
    }

    // 🌡 Unit toggle
    const unitBtn = document.getElementById("unitToggle");
    if (unitBtn) {
        unitBtn.addEventListener("click", function () {
            if (currentTempC === null) return;

            currentUnit = currentUnit === "C" ? "F" : "C";
            this.textContent = currentUnit === "C" ? "Switch to °F" : "Switch to °C";

            const cityText = document.querySelector("#weatherResult h2")?.textContent;
            const conditionText = document.querySelector("#weatherResult p")?.textContent;

            if (cityText && conditionText) {
                const [city, country] = cityText.split(", ");
                displayWeather(city, country, conditionText);

                if (forecastVisible && forecastData) {
                    removeForecast();
                    displayForecast(forecastData);
                }
            }
        });
    }
});

async function getWeather() {
    const location = document.getElementById("locationInput").value;
    const resultDiv = document.getElementById("weatherResult");

    if (!location) {
        resultDiv.innerHTML = "Please enter a location.";
        return;
    }

    const apiKey = "583cb68d735d45c8834131359261402";
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3&aqi=yes&alerts=no`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            resultDiv.innerHTML = "Location not found!";
            document.getElementById("forecastToggle").style.display = "none";
            return;
        }

        currentTempC = data.current.temp_c;
        currentTempF = data.current.temp_f;
        currentWind = data.current.wind_kph;
        currentHumidity = data.current.humidity;
        currentUnit = "C";

        displayWeather(data.location.name, data.location.country, data.current.condition.text);

        forecastData = data.forecast.forecastday;
        forecastVisible = false;

        const forecastBtn = document.getElementById("forecastToggle");
        forecastBtn.style.display = "inline-block";
        forecastBtn.textContent = "Show 3-Day Forecast";

    } catch (error) {
        resultDiv.innerHTML = "Error fetching weather data.";
        document.getElementById("forecastToggle").style.display = "none";
    }
}

function displayWeather(city, country, condition) {
    const resultDiv = document.getElementById("weatherResult");
    const temperature = currentUnit === "C" ? `${currentTempC}°C` : `${currentTempF}°F`;

    resultDiv.innerHTML = `
        <h2>${city}, ${country}</h2>
        <div class="temperature">${temperature}</div>
        <p>${condition}</p>
        <div class="extra-info">
            <p>🌬 Wind Speed: ${currentWind} km/h</p>
            <p>💧 Humidity: ${currentHumidity}%</p>
        </div>
    `;
}

function displayForecast(forecastDays) {
    removeForecast(); // remove old forecast

    const resultDiv = document.getElementById("weatherResult");

    let forecastHTML = `<div class="forecast-container show" id="forecastSection">`;

    forecastDays.forEach(day => {
        const date = day.date;
        const maxTemp = currentUnit === "C" ? `${day.day.maxtemp_c}°C` : `${day.day.maxtemp_f}°F`;
        const minTemp = currentUnit === "C" ? `${day.day.mintemp_c}°C` : `${day.day.mintemp_f}°F`;
        const icon = day.day.condition.icon;
        const condition = day.day.condition.text;

        forecastHTML += `
            <div class="forecast-card">
                <h4>${date}</h4>
                <img src="https:${icon}" alt="${condition}">
                <p>${condition}</p>
                <p>⬆ ${maxTemp}</p>
                <p>⬇ ${minTemp}</p>
            </div>
        `;
    });

    forecastHTML += `</div>`;

    resultDiv.insertAdjacentHTML('beforeend', forecastHTML);
}

function removeForecast() {
    const forecastSection = document.getElementById("forecastSection");
    if (forecastSection) {
        forecastSection.remove();
    }
}
