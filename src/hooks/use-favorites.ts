"use client";

import { useSyncExternalStore } from "react";

import {
  parseFavorites,
  serializeFavorites,
  toggleFavorite,
} from "@/lib/favorites";

const STORAGE_KEY = "vale-o-pico:favoritos";
const CHANGE_EVENT = "vale-o-pico:favoritos";
const EMPTY: string[] = [];

/** Usado quando o navegador não deixa gravar (aba anônima antiga, bloqueio). */
let memory: string[] | null = null;

let cachedRaw: string | null | undefined;
let cachedValue: string[] = EMPTY;

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** O useSyncExternalStore exige o mesmo array enquanto nada mudou. */
function getSnapshot(): string[] {
  if (memory) return memory;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cachedValue;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = raw === null ? EMPTY : parseFavorites(raw);
  }
  return cachedValue;
}

function write(slugs: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeFavorites(slugs));
    memory = null;
  } catch {
    // Sem armazenamento: vale enquanto a página estiver aberta.
    memory = slugs;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function toggleFavoriteSlug(slug: string) {
  // Lê de novo antes de gravar, para não apagar o que outra aba acabou de salvar.
  write(toggleFavorite(getSnapshot(), slug));
}

/** Favoritos do surfista, salvos no navegador (sem login). */
export function useFavorites(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
