"use client";

import { useSyncExternalStore } from "react";

import { LEVELS, type Level } from "@/lib/types";

const STORAGE_KEY = "surf-view:nivel";
const CHANGE_EVENT = "surf-view:nivel";
const DEFAULT_LEVEL: Level = "intermediario";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readLevel(): Level {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (LEVELS.includes(stored as Level)) return stored as Level;
  } catch {
    // Navegação privada ou armazenamento bloqueado: fica no padrão.
  }
  return DEFAULT_LEVEL;
}

export function setLevel(level: Level) {
  try {
    window.localStorage.setItem(STORAGE_KEY, level);
  } catch {
    // Sem armazenamento, a escolha vale só enquanto não der para ler de volta.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Nível do surfista, salvo no navegador (sem login). */
export function useLevel(): Level {
  return useSyncExternalStore(subscribe, readLevel, () => DEFAULT_LEVEL);
}
