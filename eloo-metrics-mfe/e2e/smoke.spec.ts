import { test, expect } from "@playwright/test";

// Smoke E2E (ADR-0011): garante que o app sobe e renderiza o dashboard.
// Fluxos reais (login → métrica) chegam a partir da US-01.
test("a aplicação carrega e mostra o dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /métricas eloo/i })).toBeVisible();
});
