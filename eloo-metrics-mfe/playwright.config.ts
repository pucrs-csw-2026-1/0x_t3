import { defineConfig, devices } from "@playwright/test";

// E2E (ADR-0011). No CI o app roda com dados de exemplo/mock (a US-00 não
// integra API). `test:e2e:real` (E2E_TARGET=real) fica para validar contra
// T1 + T2 reais localmente.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5177",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5177",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
