import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * O HTML chega antes do JavaScript. Um clique nesse intervalo pode ser
 * reproduzido depois pelo React e desfazer o próximo clique, então os testes
 * esperam o elemento estar hidratado antes de interagir.
 */
async function hydrated(locator: Locator) {
  await expect(locator).toBeVisible();
  const handle = await locator.elementHandle();
  await handle!.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        const ready = () =>
          Object.keys(element).some((key) => key.startsWith("__react"));
        if (ready()) return resolve();
        const timer = setInterval(() => {
          if (ready()) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      }),
  );
}

/** A previsão vem de um serviço externo; sem ela as páginas de pico mostram um aviso. */
async function skipIfNoForecast(page: Page) {
  const failed = await page
    .getByText("Não foi possível carregar a previsão")
    .isVisible();
  test.skip(failed, "A fonte de previsão estava fora do ar neste build.");
}

const heartOnCard = (page: Page) =>
  page.locator('li:has(a[href^="/praia/"]) button[aria-pressed]').first();

test.describe("home", () => {
  test("lista os picos e o cabeçalho leva ao Sobre", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Todos os picos" }),
    ).toBeVisible();
    await expect(page.getByText(/\d+ picos do litoral brasileiro/)).toBeVisible();

    await page.getByRole("navigation", { name: "Páginas do site" })
      .getByRole("link", { name: "Sobre" })
      .click();
    await expect(page).toHaveURL(/\/sobre$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Sobre o projeto" }),
    ).toBeVisible();
  });

  test("favoritar um pico, filtrar e manter depois de recarregar", async ({
    page,
  }) => {
    await page.goto("/");
    const heart = heartOnCard(page);
    await hydrated(heart);
    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "true");

    const filter = page.getByRole("button", { name: /Meus picos \(1\)/ });
    await expect(filter).toBeVisible();
    await filter.click();
    await expect(
      page.locator('li:has(a[href^="/praia/"]) button[aria-pressed="true"]'),
    ).toHaveCount(1);
    await expect(page.getByText("Salvos neste aparelho.")).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("button", { name: /Meus picos \(1\)/ }),
    ).toBeVisible();
  });

  test("mapa: só no celular há botão de tela cheia", async ({ page }, info) => {
    await page.goto("/");
    const open = page.getByRole("button", {
      name: "Abrir mapa em tela cheia",
    });
    if (info.project.name !== "celular") {
      await expect(open).toBeHidden();
      return;
    }
    await hydrated(open);
    await open.click();
    const close = page.getByRole("button", {
      name: "Fechar mapa em tela cheia",
    });
    await expect(close).toBeVisible();
    await close.click();
    await expect(open).toBeVisible();
  });
});

test.describe("página do pico", () => {
  test("coração, 7 dias e Visão completa sem rolagem horizontal", async ({
    page,
  }) => {
    await page.goto("/praia/itanhaem");
    await expect(
      page.getByRole("heading", { level: 1, name: "Itanhaém" }),
    ).toBeVisible();
    await skipIfNoForecast(page);

    const noSideScroll = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      );
    expect(await noSideScroll()).toBe(true);

    const days = page.getByRole("tablist", { name: "Dias da previsão" });
    await expect(days).toBeVisible();
    expect(
      await days.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);

    const heart = page.getByRole("button", {
      name: /aos favoritos|dos favoritos/,
    });
    await hydrated(heart);
    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "true");

    const full = page.getByRole("button", { name: "Visão completa" });
    await hydrated(full);
    await full.click();

    const overlay = page.locator(".fixed.inset-0").last();
    await expect(
      overlay.getByRole("heading", { name: "Gráficos da semana" }),
    ).toBeAttached();
    const charts = overlay.locator('svg[aria-label$="ao longo da semana"]');
    await expect(charts).toHaveCount(4);

    expect(
      await overlay.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    const viewport = page.viewportSize()!.width;
    for (const chart of await charts.all()) {
      const box = await chart.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(viewport);
    }
  });
});

test.describe("SEO e instalação", () => {
  test("404 devolve o status certo e a página própria", async ({ page }) => {
    const response = await page.goto("/nao-existe");
    expect(response!.status()).toBe(404);
    await expect(page.getByText("Essa onda não quebrou aqui")).toBeVisible();
  });

  test("robots, sitemap e manifesto", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/sobre");
    expect(sitemap.match(/\/praia\//g)!.length).toBeGreaterThanOrEqual(100);

    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.display).toBe("standalone");
    for (const icon of manifest.icons) {
      expect((await request.get(icon.src)).ok()).toBe(true);
    }
  });

  test("páginas trazem imagem de compartilhamento", async ({ page }) => {
    await page.goto("/praia/maresias");
    const og = page.locator('meta[property="og:image"]');
    await expect(og).toHaveAttribute("content", /opengraph-image/);
  });
});
