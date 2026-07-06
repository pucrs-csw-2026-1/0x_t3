import { test, expect } from "@playwright/test";

// Smoke E2E (ADR-0011): garante que o app sobe e renderiza o dashboard. No
// dev/CI o modo demo (VITE_USE_MOCKS) alimenta a tela com dados mock, sem T2.
test("a aplicação carrega e mostra o dashboard", async ({ page }) => {
  await page.goto("/");

  // Cabeçalho da visão geral (indicador de escopo). Sem autenticação, o título
  // cai em "Dashboard" (US-02 substituiu o "Métricas Eloo" do esqueleto US-01).
  await expect(page.getByRole("heading", { level: 1, name: /dashboard/i })).toBeVisible();

  // Com dados (modo demo), o gráfico de engajamento por evento é renderizado.
  await expect(page.getByRole("heading", { name: /engajamento por evento/i })).toBeVisible();
});
