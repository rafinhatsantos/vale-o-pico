import type {
  Conditions,
  Level,
  ScoreLabel,
  Scores,
  Spot,
  TidePreference,
  TideState,
} from "./types";

/**
 * Função única da nota (0 a 10).
 *
 *   nota = 10 × tamanho (ajustado ao nível) × período × vento × maré
 *
 * Os fatores são multiplicados: um fator ruim derruba tudo.
 * Todos os números abaixo são um chute inicial, a calibrar contra o mar real.
 */

type SpotProfile = Pick<
  Spot,
  "swellWindow" | "exposure" | "offshoreWind" | "tide"
>;

/** Faixa de tamanho efetivo (m) por nível: abaixo de min ou acima de max a nota zera. */
export const SIZE_RANGES: Record<
  Level,
  { min: number; idealMin: number; idealMax: number; max: number }
> = {
  iniciante: { min: 0.2, idealMin: 0.4, idealMax: 1.0, max: 1.6 },
  intermediario: { min: 0.3, idealMin: 0.8, idealMax: 1.8, max: 2.8 },
  avancado: { min: 0.5, idealMin: 1.2, idealMax: 3.0, max: 5.0 },
};

/** Graus de tolerância fora da janela de swell até o encaixe zerar. */
const WINDOW_FALLOFF = 45;

/** Peso da maré na fase 1 (dado aproximado): fora da preferida custa pouco. */
const TIDE_OFF_FACTOR = 0.85;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Interpola linearmente em uma lista de pontos [x, y] ordenada por x. */
function interpolate(points: [number, number][], x: number): number {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    if (x <= x1) {
      const [x0, y0] = points[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return points[points.length - 1][1];
}

/** Menor diferença entre duas direções, de 0 a 180 graus. */
export function angleDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/** Encaixe da direção do swell na janela do pico (0 a 1). */
export function directionFit(
  direction: number,
  window: { from: number; to: number },
): number {
  const span = (window.to - window.from + 360) % 360;
  const offset = (direction - window.from + 360) % 360;
  if (offset <= span) return 1;
  const outside = Math.min(offset - span, 360 - offset);
  return clamp01(1 - outside / WINDOW_FALLOFF);
}

/** Altura do swell × exposição do pico × encaixe da direção. */
export function effectiveSize(
  conditions: Pick<Conditions, "swellHeight" | "swellDirection">,
  spot: Pick<Spot, "swellWindow" | "exposure">,
): number {
  return (
    Math.max(0, conditions.swellHeight) *
    spot.exposure *
    directionFit(conditions.swellDirection, spot.swellWindow)
  );
}

/** Quanto o tamanho efetivo serve para o nível (0 a 1). */
export function sizeFactor(size: number, level: Level): number {
  const range = SIZE_RANGES[level];
  if (size <= range.min || size >= range.max) return 0;
  if (size < range.idealMin) {
    return (size - range.min) / (range.idealMin - range.min);
  }
  if (size <= range.idealMax) return 1;
  return (range.max - size) / (range.max - range.idealMax);
}

/** Abaixo de 7 s: ruim. 8 a 10 s: ok. 11 a 14 s: bom. Acima de 14 s: excelente. */
export function periodFactor(period: number): number {
  return interpolate(
    [
      [5, 0.2],
      [7, 0.4],
      [8, 0.6],
      [10, 0.7],
      [11, 0.85],
      [14, 0.95],
      [16, 1],
    ],
    period,
  );
}

/**
 * Terral fraco ou sem vento: 1,0. Lateral: ~0,6. Maral fraco: 0,5.
 * Maral forte: 0,2. Terral forte demais também perde pontos.
 */
export function windFactor(
  speed: number,
  direction: number,
  offshoreWind: number,
): number {
  // 0 = terral puro, 90 = lateral, 180 = maral puro.
  const angle = angleDiff(direction, offshoreWind);

  const weak = interpolate(
    [
      [45, 1],
      [90, 0.6],
      [180, 0.5],
    ],
    angle,
  );
  const strong = interpolate(
    [
      [45, 1],
      [90, 0.45],
      [180, 0.2],
    ],
    angle,
  );

  let factor: number;
  if (speed <= 6) {
    factor = 1;
  } else if (speed <= 12) {
    factor = 1 + ((weak - 1) * (speed - 6)) / 6;
  } else {
    factor = weak + (strong - weak) * clamp01((speed - 12) / 18);
  }

  // Terral forte demais achata a onda e dificulta a remada.
  const tooStrong = interpolate(
    [
      [30, 1],
      [50, 0.6],
    ],
    speed,
  );
  return factor * tooStrong;
}

export function tideFactor(
  state: TideState | null,
  preference: TidePreference,
): number {
  if (preference === "indiferente" || state === null) return 1;
  return state === preference ? 1 : TIDE_OFF_FACTOR;
}

/** Nota de 0 a 10 (uma casa decimal) para um pico, um horário e um nível. */
export function score(
  conditions: Conditions,
  spot: SpotProfile,
  level: Level,
): number {
  const value =
    10 *
    sizeFactor(effectiveSize(conditions, spot), level) *
    periodFactor(conditions.swellPeriod) *
    windFactor(
      conditions.windSpeed,
      conditions.windDirection,
      spot.offshoreWind,
    ) *
    tideFactor(conditions.tide, spot.tide);
  return Math.round(Math.min(10, Math.max(0, value)) * 10) / 10;
}

export function scoreAllLevels(
  conditions: Conditions,
  spot: SpotProfile,
): Scores {
  return {
    iniciante: score(conditions, spot, "iniciante"),
    intermediario: score(conditions, spot, "intermediario"),
    avancado: score(conditions, spot, "avancado"),
  };
}

export function scoreLabel(value: number): ScoreLabel {
  if (value < 1.5) return "flat";
  if (value < 3.5) return "fraco";
  if (value < 5.5) return "surfável";
  if (value < 7.5) return "bom";
  return "clássico";
}
