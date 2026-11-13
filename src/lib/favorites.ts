/**
 * Lógica dos favoritos, sem nada de navegador, para poder testar.
 *
 * Os favoritos ficam no localStorage como { v: 1, slugs: [...] }. O número de
 * versão deixa mudar o formato depois sem invalidar a lista de ninguém.
 */

export const FAVORITES_VERSION = 1;

/** Teto de segurança: ninguém favorita mais que isso, e o link não explode. */
export const MAX_FAVORITES = 200;

const SLUG_PATTERN = /^[a-z0-9-]{1,60}$/;

function clean(slugs: unknown[]): string[] {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (typeof slug === "string" && SLUG_PATTERN.test(slug)) seen.add(slug);
    if (seen.size >= MAX_FAVORITES) break;
  }
  return [...seen];
}

/** Lê o que está salvo. Qualquer coisa estranha vira lista vazia, nunca erro. */
export function parseFavorites(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (
      typeof data === "object" &&
      data !== null &&
      (data as { v?: unknown }).v === FAVORITES_VERSION &&
      Array.isArray((data as { slugs?: unknown }).slugs)
    ) {
      return clean((data as { slugs: unknown[] }).slugs);
    }
  } catch {
    // JSON quebrado: ignora.
  }
  return [];
}

export function serializeFavorites(slugs: string[]): string {
  return JSON.stringify({ v: FAVORITES_VERSION, slugs: clean(slugs) });
}

export function toggleFavorite(slugs: string[], slug: string): string[] {
  return slugs.includes(slug)
    ? slugs.filter((item) => item !== slug)
    : clean([...slugs, slug]);
}
