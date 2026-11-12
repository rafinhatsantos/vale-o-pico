// Copia o worker do MapLibre para public/, de onde o navegador o carrega.
// Roda antes de `dev` e de `build`, então a cópia acompanha a versão instalada.
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public/maplibre", { recursive: true });
copyFileSync(
  "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
  "public/maplibre/maplibre-gl-worker.mjs",
);
