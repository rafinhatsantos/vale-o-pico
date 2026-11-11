"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(timer);
}

/** Agora, em segundos (epoch), arredondado para o minuto. */
function readNow(): number {
  return Math.floor(Date.now() / 60_000) * 60;
}

/**
 * A página vem do cache do servidor, então o "agora" de verdade só existe no
 * navegador. No servidor usamos o instante em que a previsão foi gerada.
 */
export function useNow(serverNow: number): number {
  return useSyncExternalStore(subscribe, readNow, () => serverNow);
}

/** Índice do horário em curso em uma lista ordenada por tempo. */
export function currentIndex(hours: { time: number }[], now: number): number {
  let index = 0;
  for (let i = 0; i < hours.length; i++) {
    if (hours[i].time <= now) index = i;
    else break;
  }
  return index;
}
