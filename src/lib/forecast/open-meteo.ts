import type { ForecastProvider, RawHour } from "./provider";

const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const FORECAST_DAYS = 7;
const TIMEOUT_MS = 10_000;

interface MarineResponse {
  utc_offset_seconds: number;
  hourly: {
    time: number[];
    wave_height: (number | null)[];
    swell_wave_height: (number | null)[];
    swell_wave_period: (number | null)[];
    swell_wave_direction: (number | null)[];
    sea_level_height_msl: (number | null)[];
  };
}

interface WeatherResponse {
  hourly: {
    time: number[];
    wind_speed_10m: (number | null)[];
    wind_direction_10m: (number | null)[];
    wind_gusts_10m: (number | null)[];
  };
  daily: {
    sunrise: number[];
    sunset: number[];
  };
}

async function getJson<T>(
  base: string,
  params: Record<string, string>,
): Promise<T> {
  const url = `${base}?${new URLSearchParams(params)}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Open-Meteo respondeu ${response.status} em ${base}`);
  }
  return response.json() as Promise<T>;
}

/** Open-Meteo Marine (swell e nível do mar) + API de tempo (vento e sol). */
export const fetchOpenMeteo: ForecastProvider = async (spot) => {
  const common = {
    latitude: String(spot.latitude),
    longitude: String(spot.longitude),
    timezone: "America/Sao_Paulo",
    timeformat: "unixtime",
    forecast_days: String(FORECAST_DAYS),
  };

  const [marine, weather] = await Promise.all([
    getJson<MarineResponse>(MARINE_URL, {
      ...common,
      hourly: [
        "wave_height",
        "swell_wave_height",
        "swell_wave_period",
        "swell_wave_direction",
        "sea_level_height_msl",
      ].join(","),
    }),
    getJson<WeatherResponse>(WEATHER_URL, {
      ...common,
      hourly: "wind_speed_10m,wind_direction_10m,wind_gusts_10m",
      daily: "sunrise,sunset",
      wind_speed_unit: "kmh",
    }),
  ]);

  const windIndex = new Map(
    weather.hourly.time.map((time, index) => [time, index]),
  );

  const hours: RawHour[] = [];
  marine.hourly.time.forEach((time, i) => {
    const w = windIndex.get(time);
    const swellHeight = marine.hourly.swell_wave_height[i];
    // Sem swell ou sem vento não dá para calcular a nota desse horário.
    if (w === undefined || swellHeight === null) return;

    hours.push({
      time,
      waveHeight: marine.hourly.wave_height[i] ?? swellHeight,
      swellHeight,
      swellPeriod: marine.hourly.swell_wave_period[i] ?? 0,
      swellDirection: marine.hourly.swell_wave_direction[i] ?? 0,
      windSpeed: weather.hourly.wind_speed_10m[w] ?? 0,
      windDirection: weather.hourly.wind_direction_10m[w] ?? 0,
      windGusts: weather.hourly.wind_gusts_10m[w] ?? 0,
      seaLevel: marine.hourly.sea_level_height_msl[i],
    });
  });

  if (hours.length === 0) {
    throw new Error("Open-Meteo não devolveu dados de swell para este ponto");
  }

  return {
    utcOffsetSeconds: marine.utc_offset_seconds,
    hours,
    days: weather.daily.sunrise.map((sunrise, index) => ({
      sunrise,
      sunset: weather.daily.sunset[index],
    })),
  };
};
