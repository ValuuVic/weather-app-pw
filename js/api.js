const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`La API respondió con el estado HTTP ${response.status}.`);
  }

  return response.json();
}

/** Busca ubicaciones por nombre y devuelve los resultados de Geocoding. */
async function searchLocations(name, count = 10) {
  const parameters = new URLSearchParams({
    name: name.trim(),
    count: String(count),
    language: "es",
    format: "json",
  });
  const data = await fetchJson(`${GEOCODING_API_URL}?${parameters}`);

  if (!data || !Array.isArray(data.results)) {
    return [];
  }

  return data.results;
}

/** Obtiene las condiciones actuales y el pronóstico diario para unas coordenadas. */
async function fetchWeather(latitude, longitude, timezone = "auto") {
  const parameters = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone,
    forecast_days: "5",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
  });

  return fetchJson(`${WEATHER_API_URL}?${parameters}`);
}
