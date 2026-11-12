import type { Spot } from "../types";

/**
 * Contrato entre o site e a fonte de dados. Para trocar a Open-Meteo por
 * outra fonte, basta escrever outro provider que devolva este formato.
 */
export interface RawHour {
  /** Instante em segundos (epoch). */
  time: number;
  waveHeight: number;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  seaLevel: number | null;
}

export interface RawDay {
  sunrise: number;
  sunset: number;
}

export interface RawForecast {
  /** Diferença do horário local para UTC, em segundos. */
  utcOffsetSeconds: number;
  hours: RawHour[];
  days: RawDay[];
}

/**
 * Busca a previsão de vários pontos de uma vez. Devolve um item por ponto,
 * na mesma ordem; null quando a fonte não tem dado de mar para aquele ponto.
 */
export type ForecastProvider = (
  spots: Pick<Spot, "latitude" | "longitude">[],
) => Promise<(RawForecast | null)[]>;
