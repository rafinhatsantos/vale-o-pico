export const LEVELS = ["iniciante", "intermediario", "avancado"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export type TidePreference =
  | "seca"
  | "cheia"
  | "enchente"
  | "vazante"
  | "indiferente";

/** Estado da maré em um horário (nunca "indiferente"). */
export type TideState = Exclude<TidePreference, "indiferente">;

export type Region =
  | "litoral-sul-sc"
  | "grande-florianopolis"
  | "litoral-norte-sc"
  | "litoral-sul-sp"
  | "baixada-santista"
  | "litoral-norte-sp"
  | "rio-niteroi"
  | "regiao-dos-lagos"
  | "costa-verde"
  | "litoral-sul-es"
  | "grande-vitoria";

export const REGION_LABELS: Record<Region, string> = {
  "litoral-sul-sc": "Litoral sul de SC",
  "grande-florianopolis": "Grande Florianópolis",
  "litoral-norte-sc": "Litoral norte de SC",
  "litoral-sul-sp": "Litoral sul de SP",
  "baixada-santista": "Baixada Santista",
  "litoral-norte-sp": "Litoral norte de SP",
  "rio-niteroi": "Rio capital e Niterói",
  "regiao-dos-lagos": "Região dos Lagos",
  "costa-verde": "Costa Verde",
  "litoral-sul-es": "Litoral sul do ES",
  "grande-vitoria": "Grande Vitória",
};

export const REGION_ORDER: Region[] = [
  "litoral-sul-sc",
  "grande-florianopolis",
  "litoral-norte-sc",
  "litoral-sul-sp",
  "baixada-santista",
  "litoral-norte-sp",
  "costa-verde",
  "rio-niteroi",
  "regiao-dos-lagos",
  "litoral-sul-es",
  "grande-vitoria",
];

/** Ficha de um pico. Direções em graus, no sentido "de onde vem" (0 = N, 90 = L). */
export interface Spot {
  slug: string;
  name: string;
  city: string;
  region: Region;
  latitude: number;
  longitude: number;
  /** Para onde a praia está virada. */
  coastOrientation: number;
  /** Faixa de direções de swell que entram bem, em sentido horário. */
  swellWindow: { from: number; to: number };
  /** 0 a 1. Compensa sombra de ilhas e costões que o modelo global não enxerga. */
  exposure: number;
  /** Direção de onde sopra o terral. */
  offshoreWind: number;
  tide: TidePreference;
  bottom: "areia" | "pedra" | "coral";
  level: Level;
  /** false enquanto a ficha não foi conferida com quem surfa no pico. */
  validated: boolean;
}

/** Condições brutas de um horário, já independentes da fonte de dados. */
export interface Conditions {
  /** Altura do swell em metros. */
  swellHeight: number;
  /** Período do swell em segundos. */
  swellPeriod: number;
  /** Direção de onde vem o swell. */
  swellDirection: number;
  /** Velocidade do vento em km/h. */
  windSpeed: number;
  /** Direção de onde vem o vento. */
  windDirection: number;
  /** Estado da maré, ou null quando não há dado. */
  tide: TideState | null;
}

export type ScoreLabel = "flat" | "fraco" | "surfável" | "bom" | "clássico";

export type Scores = Record<Level, number>;

/** Um horário da previsão, com as condições e a nota para cada nível. */
export interface ForecastHour extends Conditions {
  /** Instante em segundos (epoch). */
  time: number;
  /** Dia local no formato AAAA-MM-DD. */
  day: string;
  /** Hora local, de 0 a 23. */
  hour: number;
  /** Altura total das ondas (swell + vento) em metros. */
  waveHeight: number;
  windGusts: number;
  /** Nível do mar modelado em metros (aproximado). */
  seaLevel: number | null;
  daylight: boolean;
  scores: Scores;
}

export interface ForecastDay {
  day: string;
  sunrise: number;
  sunset: number;
}

export interface Forecast {
  slug: string;
  /** Quando os dados foram buscados, em segundos (epoch). */
  generatedAt: number;
  hours: ForecastHour[];
  days: ForecastDay[];
}

/** Resumo leve para as listas: só as notas das próximas horas. */
export interface ForecastSummary {
  slug: string;
  generatedAt: number;
  hours: { time: number; scores: Scores }[];
}
