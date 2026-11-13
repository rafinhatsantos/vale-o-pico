/** Uma partição de swell do modelo de ondas. */
export interface SwellPartition {
  height: number;
  period: number;
  direction: number;
}

/**
 * O modelo separa o mar em partições (swell primário, secundário). O primário
 * é só o de maior altura: pode ser um mar curto e fraco de sudeste enquanto o
 * swell longo de sul, que é o que surfista procura, vem como secundário.
 *
 * Escolhe a partição com maior altura × período, que premia o swell longo
 * sem deixar um swell longo minúsculo vencer um grande.
 */
export function dominantSwell(
  primary: SwellPartition,
  secondary: SwellPartition | null,
): SwellPartition {
  if (!secondary || secondary.height <= 0 || secondary.period <= 0) {
    return primary;
  }
  const power = (p: SwellPartition) => p.height * p.period;
  return power(secondary) > power(primary) ? secondary : primary;
}
