import { cacheLife } from "next/cache";

import { scoreAllLevels } from "../score";
import { getSpot } from "../spots";
import type {
  Forecast,
  ForecastDay,
  ForecastHour,
  ForecastSummary,
} from "../types";
import { fetchOpenMeteo } from "./open-meteo";
import type { ForecastProvider } from "./provider";
import { classifyTides } from "./tide";

/**
 * Camada de dados. É o único ponto do site que conhece a fonte da previsão:
 * páginas e componentes só chamam getForecast / getForecastSummary.
 */
const provider: ForecastProvider = fetchOpenMeteo;

/** Quantas horas à frente entram no resumo usado nas listas. */
const SUMMARY_HOURS = 30;

function localDate(time: number, utcOffsetSeconds: number) {
  const date = new Date((time + utcOffsetSeconds) * 1000);
  return { day: date.toISOString().slice(0, 10), hour: date.getUTCHours() };
}

/**
 * Previsão de 7 dias de um pico, com a nota já calculada para cada nível.
 * Fica em cache no servidor por cerca de 1 hora; nenhum visitante dispara
 * chamada direta à API. Devolve null se a fonte estiver fora do ar.
 */
export async function getForecast(slug: string): Promise<Forecast | null> {
  "use cache";

  const spot = getSpot(slug);
  if (!spot) {
    cacheLife("hours");
    return null;
  }

  let raw;
  try {
    raw = await provider(spot);
  } catch (error) {
    console.error(`Falha ao buscar previsão de ${slug}:`, error);
    // Guarda a falha por pouco tempo para tentar de novo logo.
    cacheLife("minutes");
    return null;
  }
  cacheLife("hours");

  const days: ForecastDay[] = raw.days.map((day) => ({
    day: localDate(day.sunrise, raw.utcOffsetSeconds).day,
    sunrise: day.sunrise,
    sunset: day.sunset,
  }));
  const sunByDay = new Map(days.map((day) => [day.day, day]));
  const tides = classifyTides(raw.hours.map((hour) => hour.seaLevel));

  const hours: ForecastHour[] = raw.hours.map((hour, index) => {
    const local = localDate(hour.time, raw.utcOffsetSeconds);
    const sun = sunByDay.get(local.day);
    const conditions = {
      swellHeight: hour.swellHeight,
      swellPeriod: hour.swellPeriod,
      swellDirection: hour.swellDirection,
      windSpeed: hour.windSpeed,
      windDirection: hour.windDirection,
      tide: tides[index],
    };

    return {
      ...conditions,
      time: hour.time,
      day: local.day,
      hour: local.hour,
      waveHeight: hour.waveHeight,
      windGusts: hour.windGusts,
      seaLevel: hour.seaLevel,
      // A hora cheia conta como dia se o sol nasce até a metade dela.
      daylight: sun
        ? hour.time + 1800 >= sun.sunrise && hour.time < sun.sunset
        : local.hour >= 6 && local.hour < 18,
      scores: scoreAllLevels(conditions, spot),
    };
  });

  return {
    slug,
    generatedAt: Math.floor(Date.now() / 1000),
    hours,
    days,
  };
}

/** Só as notas das próximas horas, para a home não carregar a semana inteira. */
export async function getForecastSummary(
  slug: string,
): Promise<ForecastSummary | null> {
  const forecast = await getForecast(slug);
  if (!forecast) return null;

  const from = forecast.generatedAt - 3600;
  return {
    slug,
    generatedAt: forecast.generatedAt,
    hours: forecast.hours
      .filter((hour) => hour.time > from)
      .slice(0, SUMMARY_HOURS)
      .map(({ time, scores }) => ({ time, scores })),
  };
}
