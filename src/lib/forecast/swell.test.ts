import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { dominantSwell } from "./swell.ts";

describe("dominantSwell", () => {
  it("prefere o swell longo secundário a um primário curto (Itanhaém, 18/11)", () => {
    const primary = { height: 0.94, period: 5.2, direction: 125 };
    const secondary = { height: 0.56, period: 12.2, direction: 171 };
    assert.deepEqual(dominantSwell(primary, secondary), secondary);
  });

  it("mantém o primário quando ele é maior e mais longo", () => {
    const primary = { height: 1.5, period: 12, direction: 160 };
    const secondary = { height: 0.6, period: 14, direction: 130 };
    assert.deepEqual(dominantSwell(primary, secondary), primary);
  });

  it("não deixa um swell longo minúsculo vencer", () => {
    const primary = { height: 1.2, period: 8, direction: 150 };
    const secondary = { height: 0.1, period: 16, direction: 170 };
    assert.deepEqual(dominantSwell(primary, secondary), primary);
  });

  it("usa o primário quando não há secundário", () => {
    const primary = { height: 1, period: 9, direction: 140 };
    assert.deepEqual(dominantSwell(primary, null), primary);
  });
});
