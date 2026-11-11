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

/** Classes completas (o Tailwind precisa enxergar o nome inteiro). */
export const SCORE_STYLES: Record<ScoreLabel, { bg: string; text: string }> = {
  flat: { bg: "bg-slate-300", text: "text-slate-700" },
  fraco: { bg: "bg-orange-300", text: "text-orange-950" },
  surfável: { bg: "bg-yellow-300", text: "text-yellow-950" },
  bom: { bg: "bg-lime-400", text: "text-lime-950" },
  clássico: { bg: "bg-emerald-500", text: "text-white" },
};

/** Remove acentos e caixa para a busca de picos. */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
