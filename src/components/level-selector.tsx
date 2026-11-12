"use client";

import { setLevel, useLevel } from "@/hooks/use-level";
import { LEVEL_LABELS, LEVELS } from "@/lib/types";

export function LevelSelector() {
  const level = useLevel();
  const index = LEVELS.indexOf(level);

  return (
    <div
      role="radiogroup"
      aria-label="Seu nível no surfe"
      className="relative grid grid-cols-3 rounded-full bg-white/5 p-1 ring-1 ring-white/10"
    >
      {/* Pílula que desliza até o nível escolhido. */}
      <span
        className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-gradient-to-r from-aqua to-cyan-300 shadow-[0_0_24px_-4px] shadow-aqua/60 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(${index * 100}%)` }}
        aria-hidden="true"
      />
      {LEVELS.map((option) => {
        const selected = option === level;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setLevel(option)}
            className={`relative z-10 rounded-full px-2 py-1.5 text-sm font-semibold transition-colors duration-300 ${
              selected ? "text-abyss" : "text-mist hover:text-foam"
            }`}
          >
            {LEVEL_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
