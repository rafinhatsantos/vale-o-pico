import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Testes de ponta a ponta: sobem o site já compilado (`npm run build` antes)
 * e navegam como uma pessoa, no desktop e num celular.
 *
 * Sem o Chromium do Playwright instalado, use um navegador que já existe:
 *   PW_CHANNEL=msedge npm run test:e2e   (ou chrome)
 */
const channel = process.env.PW_CHANNEL;

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel } },
    { name: "celular", use: { ...devices["Pixel 5"], channel } },
  ],
});
