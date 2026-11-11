import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  angleDiff,
  directionFit,
  effectiveSize,
  periodFactor,
  score,
  scoreLabel,
  sizeFactor,
  tideFactor,
  windFactor,
} from "./score.ts";
import type { Conditions } from "./types.ts";

// Pico virado para o sul, terral de norte, sem sombra.
const spot = {
  swellWindow: { from: 120, to: 200 },
  exposure: 1,
  offshoreWind: 0,
  tide: "indiferente" as const,
};

// Dia clássico para intermediário: 1,5 m, 14 s, de sul, terral fraco.
const classic: Conditions = {
  swellHeight: 1.5,
  swellPeriod: 14,
  swellDirection: 170,
  windSpeed: 8,
  windDirection: 0,
  tide: null,
};

describe("angleDiff", () => {
  it("dá a menor diferença, passando pelo norte", () => {
    assert.equal(angleDiff(350, 10), 20);
    assert.equal(angleDiff(0, 180), 180);
    assert.equal(angleDiff(90, 90), 0);
  });
});

describe("directionFit", () => {
  it("vale 1 dentro da janela", () => {
    assert.equal(directionFit(120, spot.swellWindow), 1);
    assert.equal(directionFit(170, spot.swellWindow), 1);
    assert.equal(directionFit(200, spot.swellWindow), 1);
  });

  it("cai linearmente fora da janela e zera a 45 graus", () => {
    assert.ok(Math.abs(directionFit(97.5, spot.swellWindow) - 0.5) < 1e-9);
    assert.equal(directionFit(75, spot.swellWindow), 0);
    assert.equal(directionFit(0, spot.swellWindow), 0);
  });

  it("aceita janela que cruza o norte", () => {
    const window = { from: 330, to: 30 };
    assert.equal(directionFit(0, window), 1);
    assert.equal(directionFit(350, window), 1);
    assert.equal(directionFit(180, window), 0);
  });
});

describe("effectiveSize", () => {
  it("multiplica altura, exposição e encaixe", () => {
    const size = effectiveSize(
      { swellHeight: 2, swellDirection: 170 },
      { swellWindow: spot.swellWindow, exposure: 0.5 },
    );
    assert.equal(size, 1);
  });

  it("zera quando o swell vem de fora da janela", () => {
    const size = effectiveSize({ swellHeight: 3, swellDirection: 20 }, spot);
    assert.equal(size, 0);
  });
});

describe("sizeFactor", () => {
  it("o mesmo mar dá fatores diferentes por nível", () => {
    assert.equal(sizeFactor(0.7, "iniciante"), 1);
    assert.ok(sizeFactor(0.7, "intermediario") < 1);
    assert.ok(sizeFactor(0.7, "avancado") < sizeFactor(0.7, "intermediario"));
  });

  it("mar grande zera para iniciante e serve para avançado", () => {
    assert.equal(sizeFactor(2.5, "iniciante"), 0);
    assert.equal(sizeFactor(2.5, "avancado"), 1);
  });

  it("zera quando está flat", () => {
    assert.equal(sizeFactor(0.1, "iniciante"), 0);
    assert.equal(sizeFactor(0, "avancado"), 0);
  });
});

describe("periodFactor", () => {
  it("cresce com o período", () => {
    const values = [5, 7, 9, 12, 15, 18].map(periodFactor);
    for (let i = 1; i < values.length; i++) {
      assert.ok(values[i] >= values[i - 1]);
    }
  });

  it("respeita as faixas do plano", () => {
    assert.ok(periodFactor(6) < 0.45);
    assert.ok(periodFactor(9) >= 0.6 && periodFactor(9) <= 0.7);
    assert.ok(periodFactor(12) >= 0.85);
    assert.equal(periodFactor(17), 1);
  });
});

describe("windFactor", () => {
  it("sem vento vale 1 em qualquer direção", () => {
    assert.equal(windFactor(3, 180, 0), 1);
  });

  it("terral fraco vale 1", () => {
    assert.equal(windFactor(15, 0, 0), 1);
    assert.equal(windFactor(15, 30, 0), 1);
  });

  it("lateral fica perto de 0,6", () => {
    assert.ok(Math.abs(windFactor(12, 90, 0) - 0.6) < 1e-9);
  });

  it("maral fraco vale 0,5 e maral forte 0,2", () => {
    assert.ok(Math.abs(windFactor(12, 180, 0) - 0.5) < 1e-9);
    assert.ok(Math.abs(windFactor(30, 180, 0) - 0.2) < 1e-9);
  });

  it("terral forte demais perde pontos", () => {
    assert.ok(windFactor(45, 0, 0) < 1);
    assert.ok(windFactor(45, 0, 0) > windFactor(45, 180, 0));
  });
});

describe("tideFactor", () => {
  it("vale 1 na maré preferida, sem preferência ou sem dado", () => {
    assert.equal(tideFactor("cheia", "cheia"), 1);
    assert.equal(tideFactor("seca", "indiferente"), 1);
    assert.equal(tideFactor(null, "cheia"), 1);
  });

  it("pesa pouco fora da preferida", () => {
    const factor = tideFactor("seca", "cheia");
    assert.ok(factor < 1 && factor >= 0.7);
  });
});

describe("score", () => {
  it("dia clássico passa de 7,5 para intermediário", () => {
    assert.ok(score(classic, spot, "intermediario") >= 7.5);
  });

  it("maral forte derruba um swell perfeito", () => {
    const blown = { ...classic, windSpeed: 35, windDirection: 180 };
    assert.ok(score(blown, spot, "intermediario") <= 2);
  });

  it("swell de fora da janela dá nota zero", () => {
    const wrong = { ...classic, swellDirection: 30 };
    assert.equal(score(wrong, spot, "intermediario"), 0);
  });

  it("exposição baixa reduz a nota", () => {
    const sheltered = { ...spot, exposure: 0.4 };
    assert.ok(
      score(classic, sheltered, "intermediario") <
        score(classic, spot, "intermediario"),
    );
  });

  it("mar grande é melhor para avançado do que para iniciante", () => {
    const big = { ...classic, swellHeight: 2.5 };
    assert.equal(score(big, spot, "iniciante"), 0);
    assert.ok(score(big, spot, "avancado") >= 7.5);
  });

  it("fica sempre entre 0 e 10, com uma casa decimal", () => {
    for (const height of [0, 0.5, 1, 2, 4, 8]) {
      for (const period of [4, 9, 13, 20]) {
        for (const wind of [0, 15, 40]) {
          const value = score(
            {
              ...classic,
              swellHeight: height,
              swellPeriod: period,
              windSpeed: wind,
            },
            spot,
            "avancado",
          );
          assert.ok(value >= 0 && value <= 10);
          assert.equal(value, Math.round(value * 10) / 10);
        }
      }
    }
  });
});

describe("scoreLabel", () => {
  it("cobre a escala inteira", () => {
    assert.equal(scoreLabel(0), "flat");
    assert.equal(scoreLabel(2), "fraco");
    assert.equal(scoreLabel(4.5), "surfável");
    assert.equal(scoreLabel(6.5), "bom");
    assert.equal(scoreLabel(9), "clássico");
  });
});
