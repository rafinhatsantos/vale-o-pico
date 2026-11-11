"use client";

import { setLevel, useLevel } from "@/hooks/use-level";
import { LEVEL_LABELS, LEVELS } from "@/lib/types";

export function LevelSelector() {
  const level = useLevel();

  return (
    <div
      role="radiogroup"
      aria-label="Seu nível no surfe"
      className="grid grid-cols-3 gap-1 rounded-xl bg-slate-200/70 p-1"
    >
      {LEVELS.map((option) => {
        const selected = option === level;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setLevel(option)}
            className={`rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
              selected
                ? "bg-white text-sky-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {LEVEL_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
