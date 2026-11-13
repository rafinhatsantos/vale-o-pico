import type { ForecastProvider, RawForecast, RawHour } from "./provider";
import { dominantSwell } from "./swell";

const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const FORECAST_DAYS = 7;
const TIMEOUT_MS = 20_000;
/** Espera antes de tentar de novo quando a API responde 429 (muitas requisições). */
const RETRY_DELAYS_MS = [2_000, 6_000];

interface MarineResponse {
  utc_offset_seconds: number;
  hourly: {
    time: number[];
    wave_height: (number | null)[];
    swell_wave_height: (number | null)[];
    swell_wave_period: (number | null)[];
    swell_wave_direction: (number | null)[];
    secondary_swell_wave_height: (number | null)[];
    secondary_swell_wave_period: (number | null)[];
    secondary_swell_wave_direction: (number | null)[];
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

/**
 * Uma chamada para todos os pontos. Com um ponto só a API devolve um objeto;
 * com vários, uma lista na mesma ordem das coordenadas.
 */
async function getJson<T>(
  base: string,
  params: Record<string, string>,
): Promise<T[]> {
  const url = `${base}?${new URLSearchParams(params)}`;

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.ok) {
      const json = (await response.json()) as T | T[];
      return Array.isArray(json) ? json : [json];
    }
    if (response.status !== 429 || attempt >= RETRY_DELAYS_MS.length) {
      throw new Error(`Open-Meteo respondeu ${response.status} em ${base}`);
    }
    await new Promise((resolve) =>
      setTimeout(resolve, RETRY_DELAYS_MS[attempt]),
    );
  }
}

function combine(
  marine: MarineResponse,
  weather: WeatherResponse,
): RawForecast | null {
  const windIndex = new Map(
    weather.hourly.time.map((time, index) => [time, index]),
  );

  const hours: RawHour[] = [];
  marine.hourly.time.forEach((time, i) => {
    const w = windIndex.get(time);
    const swellHeight = marine.hourly.swell_wave_height[i];
    // Sem swell ou sem vento não dá para calcular a nota desse horário.
    if (w === undefined || swellHeight === null) return;

    const secondaryHeight = marine.hourly.secondary_swell_wave_height[i];
    const secondaryPeriod = marine.hourly.secondary_swell_wave_period[i];
    const secondaryDirection = marine.hourly.secondary_swell_wave_direction[i];
    const swell = dominantSwell(
      {
        height: swellHeight,
        period: marine.hourly.swell_wave_period[i] ?? 0,
        direction: marine.hourly.swell_wave_direction[i] ?? 0,
      },
      secondaryHeight === null ||
        secondaryPeriod === null ||
        secondaryDirection === null
        ? null
        : {
            height: secondaryHeight,
            period: secondaryPeriod,
            direction: secondaryDirection,
          },
    );

    hours.push({
      time,
      waveHeight: marine.hourly.wave_height[i] ?? swellHeight,
      swellHeight: swell.height,
      swellPeriod: swell.period,
      swellDirection: swell.direction,
      windSpeed: weather.hourly.wind_speed_10m[w] ?? 0,
      windDirection: weather.hourly.wind_direction_10m[w] ?? 0,
      windGusts: weather.hourly.wind_gusts_10m[w] ?? 0,
      seaLevel: marine.hourly.sea_level_height_msl[i],
    });
  });

  // Ponto que caiu em terra no modelo de ondas: sem dado de mar.
  if (hours.length === 0) return null;

  return {
    utcOffsetSeconds: marine.utc_offset_seconds,
    hours,
    days: weather.daily.sunrise.map((sunrise, index) => ({
      sunrise,
      sunset: weather.daily.sunset[index],
    })),
  };
}

/**
 * Open-Meteo Marine (swell e nível do mar) + API de tempo (vento e sol).
 * São duas chamadas no total, não importa quantos picos.
 */
export const fetchOpenMeteo: ForecastProvider = async (spots) => {
  const common = {
    latitude: spots.map((spot) => spot.latitude).join(","),
    longitude: spots.map((spot) => spot.longitude).join(","),
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
        "secondary_swell_wave_height",
        "secondary_swell_wave_period",
        "secondary_swell_wave_direction",
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

  if (marine.length !== spots.length || weather.length !== spots.length) {
    throw new Error("Open-Meteo devolveu um número de pontos diferente do pedido");
  }

  return spots.map((_, index) => combine(marine[index], weather[index]));
};
