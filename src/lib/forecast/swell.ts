import type { SwellPartition } from "../types";

export type { SwellPartition };

/**
 * O modelo separa o mar em partições (swell primário, secundário). O primário
 * é só o de maior altura: pode ser um mar curto e fraco de sudeste enquanto o
 * swell longo de sul, que é o que surfista procura, vem como secundário.
 *
 * Escolhe a partição com maior altura × período, que premia o swell longo
 * sem deixar um swell longo minúsculo vencer um grande. Devolve também a
 * outra, para a tela mostrar o mar inteiro.
 */
export function rankSwells(
  primary: SwellPartition,
  secondary: SwellPartition | null,
): { main: SwellPartition; other: SwellPartition | null } {
  if (!secondary || secondary.height <= 0 || secondary.period <= 0) {
    return { main: primary, other: null };
  }
  const power = (p: SwellPartition) => p.height * p.period;
  return power(secondary) > power(primary)
    ? { main: secondary, other: primary }
    : { main: primary, other: secondary };
}

export function dominantSwell(
  primary: SwellPartition,
  secondary: SwellPartition | null,
): SwellPartition {
  return rankSwells(primary, secondary).main;
}
