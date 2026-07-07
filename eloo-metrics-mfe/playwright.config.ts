import { defineConfig, devices } from "@playwright/test";

// E2E (ADR-0011) em dois alvos:
// - mock (padrão/CI): sobe o dev server em modo demonstração (VITE_USE_MOCKS do
//   .env.development) e roda os specs mock (smoke). Specs *.real.spec.ts são
//   ignorados.
// - real (`test:e2e:real`, E2E_TARGET=real): exige T1 (:8080) e T2 (:8000) no
//   ar; sobe o dev server com VITE_USE_MOCKS=false numa porta própria (:5178,
//   para nunca reaproveitar um dev server em modo mock) e roda só os specs
//   *.real.spec.ts — a validação da US-06 contra o backend real.
const isReal = process.env.E2E_TARGET === "real";
const port = isReal ? 5178 : 5177;

export default defineConfig({
  testDir: "./e2e",
  testMatch: isReal ? /.*\.real\.spec\.ts/ : /^(?!.*\.real\.spec\.ts).*\.spec\.ts$/,
  fullyParallel: true,
  // Contra o backend real, muitos workers em paralelo disputam o T2 (endpoints
  // de agregação são pesados) e geram flakes de timeout — limitamos a 2.
  workers: isReal ? 2 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: isReal
      ? `cross-env VITE_USE_MOCKS=false vite --port ${port} --strictPort`
      : "npm run dev",
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI && !isReal,
    timeout: 120_000,
  },
});
