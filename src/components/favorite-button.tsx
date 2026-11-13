"use client";

import { toggleFavoriteSlug, useFavorites } from "@/hooks/use-favorites";

interface Props {
  slug: string;
  name: string;
  className?: string;
}

/** Coração para favoritar um pico. Fica salvo neste aparelho, sem login. */
export function FavoriteButton({ slug, name, className = "" }: Props) {
  const active = useFavorites().includes(slug);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={
        active
          ? `Remover ${name} dos favoritos`
          : `Adicionar ${name} aos favoritos`
      }
      title={active ? "Remover dos favoritos" : "Favoritar"}
      onClick={() => toggleFavoriteSlug(slug)}
      className={`glass flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
        active ? "text-rose-400" : "text-foam/80 hover:text-foam"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.900 3.600 4.500 7 4.500c2 0 3.600 1.100 5 3 1.400-1.900 3-3 5-3 3.400 0 5.300 3.400 4.200 6.600-1.700 4.800-9.200 9.400-9.200 9.400Z" />
      </svg>
    </button>
  );
}
