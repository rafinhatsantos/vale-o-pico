import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MAX_FAVORITES,
  parseFavorites,
  serializeFavorites,
  toggleFavorite,
} from "./favorites.ts";

describe("parseFavorites", () => {
  it("lê o que foi salvo", () => {
    const raw = serializeFavorites(["itanhaem", "maresias"]);
    assert.deepEqual(parseFavorites(raw), ["itanhaem", "maresias"]);
  });

  it("devolve lista vazia para valores ausentes ou quebrados", () => {
    assert.deepEqual(parseFavorites(null), []);
    assert.deepEqual(parseFavorites(""), []);
    assert.deepEqual(parseFavorites("{quebrado"), []);
    assert.deepEqual(parseFavorites("[1,2,3]"), []);
    assert.deepEqual(parseFavorites('{"v":1,"slugs":"nao-lista"}'), []);
  });

  it("ignora versão desconhecida em vez de interpretar errado", () => {
    assert.deepEqual(parseFavorites('{"v":99,"slugs":["itanhaem"]}'), []);
  });

  it("descarta itens que não são slugs e repetidos", () => {
    const raw = '{"v":1,"slugs":["itanhaem",42,"<script>","itanhaem","Maresias"]}';
    assert.deepEqual(parseFavorites(raw), ["itanhaem"]);
  });

  it("respeita o teto", () => {
    const many = Array.from({ length: MAX_FAVORITES + 50 }, (_, i) => `pico-${i}`);
    assert.equal(parseFavorites(serializeFavorites(many)).length, MAX_FAVORITES);
  });
});

describe("toggleFavorite", () => {
  it("adiciona e remove", () => {
    const added = toggleFavorite(["a"], "b");
    assert.deepEqual(added, ["a", "b"]);
    assert.deepEqual(toggleFavorite(added, "a"), ["b"]);
  });
});
