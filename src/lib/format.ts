import { angleDiff } from "./score";
import type { ScoreLabel, TidePreference } from "./types";

const TIME_ZONE = "America/Sao_Paulo";

const COMPASS = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];

/** Direção em graus para ponto cardeal em português (L = leste, O = oeste). */
export function compass(degrees: number): string {
  return COMPASS[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
}

export function formatNumber(value: number, digits = 1): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

const clockFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

/** Instante (epoch em segundos) para "05:12" no horário de Brasília. */
export function formatClock(time: number): string {
  return clockFormat.format(new Date(time * 1000));
}

const weekdayFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  weekday: "short",
});

/** "2026-11-14" para { weekday: "sáb", date: "14" }. */
export function formatDay(day: string): { weekday: string; date: string } {
  const date = new Date(`${day}T12:00:00Z`);
  return {
    weekday: weekdayFormat.format(date).replace(".", ""),
    date: day.slice(8),
  };
}

export type WindType = "terral" | "lateral" | "maral";

export function windType(direction: number, offshoreWind: number): WindType {
  const angle = angleDiff(direction, offshoreWind);
  if (angle <= 45) return "terral";
  if (angle <= 112) return "lateral";
  return "maral";
}

export const TIDE_LABELS: Record<TidePreference, string> = {
  seca: "Seca",
  cheia: "Cheia",
  enchente: "Enchendo",
  vazante: "Vazando",
  indiferente: "Indiferente",
};

/**
 * Cores da escala da nota. Classes completas (o Tailwind precisa enxergar o
 * nome inteiro) e o hex para os desenhos em SVG.
 */
export const SCORE_STYLES: Record<
  ScoreLabel,
  { bg: string; text: string; ink: string; hex: string }
> = {
  flat: { bg: "bg-slate-500", text: "text-white", ink: "text-slate-400", hex: "#64748b" },
  fraco: { bg: "bg-orange-400", text: "text-orange-950", ink: "text-orange-300", hex: "#fb923c" },
  surfável: { bg: "bg-yellow-400", text: "text-yellow-950", ink: "text-yellow-300", hex: "#facc15" },
  bom: { bg: "bg-lime-400", text: "text-lime-950", ink: "text-lime-300", hex: "#a3e635" },
  clássico: { bg: "bg-emerald-400", text: "text-emerald-950", ink: "text-emerald-300", hex: "#34d399" },
};

/** Remove acentos e caixa para a busca de picos. */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Frase curta que traduz o rótulo da nota em decisão. */
export const SCORE_PHRASES: Record<ScoreLabel, string> = {
  flat: "Mar parado para o seu nível.",
  fraco: "Tem onda, mas sem expectativa.",
  surfável: "Vale se você estiver perto.",
  bom: "Vale o deslocamento.",
  clássico: "Dia para não perder.",
};

/** "Hoje", "Amanhã" ou "Sáb 14", conforme a distância do dia. */
export function dayLabel(
  day: string,
  today: string,
  tomorrow: string | undefined,
): string {
  if (day === today) return "Hoje";
  if (day === tomorrow) return "Amanhã";
  const { weekday, date } = formatDay(day);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${date}`;
}
