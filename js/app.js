const QUETZALTENANGO = {
  name: "Quetzaltenango",
  country: "Guatemala",
  latitude: 14.83,
  longitude: -91.52,
  timezone: "auto",
};

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchMessage = document.querySelector("#search-message");
const locationOptions = document.querySelector("#location-options");
const currentWeather = document.querySelector("#current-weather");
const forecastSection = document.querySelector("#forecast-section");
const forecastCards = document.querySelector("#forecast-cards");

const weatherDescriptions = {
  0: { description: "Despejado", icon: "☀️" },
  1: { description: "Mayormente despejado", icon: "🌤️" },
  2: { description: "Parcialmente nublado", icon: "⛅" },
  3: { description: "Nublado", icon: "☁️" },
  45: { description: "Niebla", icon: "🌫️" },
  48: { description: "Niebla con escarcha", icon: "🌫️" },
  51: { description: "Llovizna ligera", icon: "🌦️" },
  53: { description: "Llovizna moderada", icon: "🌦️" },
  55: { description: "Llovizna intensa", icon: "🌧️" },
  56: { description: "Llovizna helada ligera", icon: "🌧️" },
  57: { description: "Llovizna helada intensa", icon: "🌧️" },
  61: { description: "Lluvia ligera", icon: "🌦️" },
  63: { description: "Lluvia moderada", icon: "🌧️" },
  65: { description: "Lluvia intensa", icon: "🌧️" },
  66: { description: "Lluvia helada ligera", icon: "🌧️" },
  67: { description: "Lluvia helada intensa", icon: "🌧️" },
  71: { description: "Nevada ligera", icon: "🌨️" },
  73: { description: "Nevada moderada", icon: "🌨️" },
  75: { description: "Nevada intensa", icon: "❄️" },
  77: { description: "Granos de nieve", icon: "🌨️" },
  80: { description: "Chubascos ligeros", icon: "🌦️" },
  81: { description: "Chubascos moderados", icon: "🌧️" },
  82: { description: "Chubascos violentos", icon: "⛈️" },
  85: { description: "Chubascos de nieve ligeros", icon: "🌨️" },
  86: { description: "Chubascos de nieve intensos", icon: "❄️" },
  95: { description: "Tormenta", icon: "⛈️" },
  96: { description: "Tormenta con granizo ligero", icon: "⛈️" },
  99: { description: "Tormenta con granizo intenso", icon: "⛈️" },
};

function getWeatherDescription(code) {
  return weatherDescriptions[code] ?? { description: "Condición no disponible", icon: "🌡️" };
}

function setMessage(message) {
  searchMessage.textContent = message;
}

function clearLocations() {
  locationOptions.replaceChildren();
  locationOptions.hidden = true;
}

function renderCurrentWeather(location, data) {
  const current = data.current;
  const condition = getWeatherDescription(current.weather_code);
  const locationParts = [location.admin1, location.country].filter(Boolean);

  document.querySelector("#weather-city").textContent = location.name;
  document.querySelector("#weather-location").textContent = locationParts.join(", ");
  document.querySelector("#weather-icon").textContent = condition.icon;
  document.querySelector("#weather-temperature").textContent = `${Math.round(current.temperature_2m)}°`;
  document.querySelector("#weather-description").textContent = condition.description;
  document.querySelector("#weather-apparent").textContent = `${Math.round(current.apparent_temperature)}°C`;
  document.querySelector("#weather-humidity").textContent = `${current.relative_humidity_2m}%`;
  document.querySelector("#weather-wind").textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  document.querySelector("#weather-updated").textContent = `Hora local: ${current.time.replace("T", " ")}`;
  currentWeather.hidden = false;
}

function formatForecastDate(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  // daily.time contiene fechas del día local solicitado; se formatea en UTC para preservar ese día.
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function renderForecast(daily) {
  const forecastDays = daily.time.slice(0, 5).map((date, index) => ({
    date,
    maximum: daily.temperature_2m_max[index],
    minimum: daily.temperature_2m_min[index],
    weatherCode: daily.weather_code[index],
  }));

  forecastCards.replaceChildren();

  for (const day of forecastDays) {
    const condition = getWeatherDescription(day.weatherCode);
    const card = document.createElement("article");
    const date = document.createElement("p");
    const icon = document.createElement("span");
    const description = document.createElement("p");
    const temperatures = document.createElement("p");
    const maximum = document.createElement("strong");
    const minimum = document.createElement("span");

    card.className = "forecast-day";
    date.className = "forecast-date";
    date.textContent = formatForecastDate(day.date);
    icon.className = "forecast-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = condition.icon;
    description.className = "forecast-condition";
    description.textContent = condition.description;
    temperatures.className = "forecast-temperatures";
    maximum.textContent = `${Math.round(day.maximum)}°`;
    minimum.textContent = `${Math.round(day.minimum)}°`;
    temperatures.append(maximum, minimum);

    card.append(date, icon, description, temperatures);
    forecastCards.append(card);
  }

  forecastSection.hidden = forecastDays.length === 0;
}

async function selectLocation(location) {
  clearLocations();
  setMessage(`Consultando el clima de ${location.name}...`);

  try {
    const weather = await fetchWeather(location.latitude, location.longitude, location.timezone || "auto");

    if (
      !weather.current ||
      !weather.daily?.time ||
      !weather.daily.temperature_2m_max ||
      !weather.daily.temperature_2m_min ||
      !weather.daily.weather_code
    ) {
      throw new Error("La respuesta no incluye los datos meteorológicos actuales y diarios esperados.");
    }

    renderCurrentWeather(location, weather);
    renderForecast(weather.daily);
    setMessage("");
  } catch (error) {
    console.error("No se pudo consultar el clima:", error);
    setMessage("No se pudo obtener el clima. Comprueba tu conexión e inténtalo de nuevo.");
  }
}

function renderLocationOptions(locations) {
  locationOptions.replaceChildren();

  for (const location of locations) {
    const option = document.createElement("button");
    const name = document.createElement("span");
    const details = document.createElement("span");
    const locationParts = [location.admin1, location.country].filter(Boolean);

    option.type = "button";
    option.className = "location-option";
    name.className = "location-option-name";
    name.textContent = location.name;
    details.className = "location-option-meta";
    details.textContent = locationParts.join(", ") || "Ubicación";
    option.append(name, details);
    option.addEventListener("click", () => selectLocation(location));
    locationOptions.append(option);
  }

  locationOptions.hidden = false;
  setMessage("Encontramos varias ubicaciones. Elige la correcta:");
}

async function searchCity(cityName) {
  clearLocations();
  setMessage("Buscando ciudad...");

  try {
    const locations = await searchLocations(cityName);

    if (locations.length === 0) {
      setMessage("No encontramos esa ciudad. Revisa el nombre e inténtalo de nuevo.");
      return;
    }

    if (locations.length === 1) {
      await selectLocation(locations[0]);
      return;
    }

    renderLocationOptions(locations);
  } catch (error) {
    console.error("No se pudo buscar la ciudad:", error);
    setMessage("No se pudo buscar la ciudad. Comprueba tu conexión e inténtalo de nuevo.");
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const cityName = cityInput.value.trim();

  if (!cityName) {
    setMessage("Escribe el nombre de una ciudad para buscarla.");
    cityInput.focus();
    return;
  }

  searchCity(cityName);
});

async function loadInitialWeather() {
  try {
    const weather = await fetchWeather(
      QUETZALTENANGO.latitude,
      QUETZALTENANGO.longitude,
      QUETZALTENANGO.timezone,
    );

    renderCurrentWeather(QUETZALTENANGO, weather);
    if (weather.daily) {
      renderForecast(weather.daily);
    }
  } catch (error) {
    console.error("No se pudo consultar el clima inicial:", error);
    setMessage("No se pudo cargar el clima inicial. Comprueba tu conexión e inténtalo de nuevo.");
  }
}

loadInitialWeather();
