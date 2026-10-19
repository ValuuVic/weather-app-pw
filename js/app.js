const QUETZALTENANGO = {
  name: "Quetzaltenango",
  country: "Guatemala",
  latitude: 14.83,
  longitude: -91.52,
  timezone: "auto",
};

async function loadInitialWeather() {
  try {
    const weather = await fetchWeather(
      QUETZALTENANGO.latitude,
      QUETZALTENANGO.longitude,
      QUETZALTENANGO.timezone,
    );

    console.log(`Clima de ${QUETZALTENANGO.name}, ${QUETZALTENANGO.country}:`, weather);
  } catch (error) {
    console.error("No se pudo consultar el clima inicial:", error);
  }
}

loadInitialWeather();
