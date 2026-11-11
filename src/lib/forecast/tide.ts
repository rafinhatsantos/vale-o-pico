import type { TideState } from "../types";

/** Horas para cada lado ao procurar a preamar e a baixa-mar mais próximas. */
const WINDOW_HOURS = 7;
/** Amplitude mínima (m) para considerar que há maré de verdade na série. */
const MIN_RANGE = 0.05;

/**
 * Classifica a maré de cada horário a partir de uma série horária de nível
 * do mar. É uma aproximação: serve para a fase 1, até entrarem as tábuas
 * oficiais da Marinha.
 */
export function classifyTides(levels: (number | null)[]): (TideState | null)[] {
  return levels.map((level, index) => {
    if (level === null) return null;

    const window = levels
      .slice(Math.max(0, index - WINDOW_HOURS), index + WINDOW_HOURS + 1)
      .filter((value): value is number => value !== null);
    const min = Math.min(...window);
    const max = Math.max(...window);
    if (max - min < MIN_RANGE) return null;

    const position = (level - min) / (max - min);
    if (position >= 0.8) return "cheia";
    if (position <= 0.2) return "seca";

    const previous = levels[index - 1] ?? level;
    const next = levels[index + 1] ?? level;
    return next >= previous ? "enchente" : "vazante";
  });
}
