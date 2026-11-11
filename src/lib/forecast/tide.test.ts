import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { classifyTides } from "./tide.ts";

describe("classifyTides", () => {
  // Maré semidiurna idealizada: ciclo de 12 h, preamar na hora 3, baixa-mar na hora 9.
  const levels = Array.from({ length: 48 }, (_, hour) =>
    Math.sin((2 * Math.PI * hour) / 12),
  );
  const states = classifyTides(levels);

  it("marca cheia perto da preamar e seca perto da baixa-mar", () => {
    assert.equal(states[15], "cheia");
    assert.equal(states[21], "seca");
  });

  it("marca enchente subindo e vazante descendo", () => {
    assert.equal(states[12], "enchente");
    assert.equal(states[18], "vazante");
  });

  it("devolve null sem dado ou sem amplitude", () => {
    assert.deepEqual(classifyTides([null, null]), [null, null]);
    assert.deepEqual(classifyTides([0.3, 0.3, 0.3]), [null, null, null]);
  });
});
