import { test, expect, type Page } from "@playwright/test";

// E2E REAL (US-06, ADR-0011): exercita TODAS as telas contra T1 (:8080) e T2
// (:8000) de verdade — sem mock, sem MSW. Pré-requisitos (ver README):
//   1. T1 no ar com o seed de usuários (admin/manager + pool de participantes).
//   2. T2 no ar com o seed de eventos (50 eventos, escopo do manager =
//      evt_0000..evt_0009).
// Roda com `npm run test:e2e:real` (E2E_TARGET=real), que sobe o dev server em
// :5178 com VITE_USE_MOCKS=false. Login real via /auth-api (proxy do Vite) e
// sessão injetada no storage compartilhado mfeAuth.* (ADR-0003).

const ADMIN = { username: "admin@local.dev", password: "Admin@123" };
const MANAGER = { username: "manager@local.dev", password: "Manager@123" };

// Login real no T1 e injeção da sessão (token + perfil) antes do app carregar —
// o mesmo estado que o remote de auth deixaria no storage.
async function loginAs(page: Page, creds: { username: string; password: string }) {
  const loginRes = await page.request.post("/auth-api/auth/login", {
    form: { username: creds.username, password: creds.password },
  });
  expect(loginRes.ok(), `login de ${creds.username} deve responder 200`).toBeTruthy();
  const tokens = await loginRes.json();

  const meRes = await page.request.get("/auth-api/users/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  expect(meRes.ok(), "GET /users/me deve responder 200").toBeTruthy();
  const me = await meRes.json();
  const profile = JSON.stringify({
    id: me.id,
    firstName: me.first_name,
    lastName: me.last_name,
    username: me.username,
    email: me.email,
    accessLevel: me.access_level,
  });

  await page.addInitScript(
    ([token, rawProfile]) => {
      localStorage.setItem("mfeAuth.accessToken", token);
      localStorage.setItem("mfeAuth.profile", rawProfile);
    },
    [tokens.access_token as string, profile],
  );
}

// O seed espalha os 50 eventos por 2026 inteiro; a janela padrão da UI é
// "Últimos 30 dias". Para contar o catálogo completo, o teste seleciona um
// período personalizado de ano cheio — exercitando o filtro real de datas.
async function selectFullYearPeriod(page: Page) {
  await page.getByRole("combobox", { name: /período/i }).click();
  await page.getByRole("option", { name: /personalizado/i }).click();
  await page.getByLabel("De").fill("2026-01-01");
  await page.getByLabel("Até").fill("2026-12-31");
}

test.describe("admin — visão global", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN);
  });

  test("dashboard carrega counters e gráfico com dados reais", async ({ page }) => {
    // "/" decide por papel (US-06): admin aterrissa no dashboard global.
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /administrador global/i }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Counters do seed (não zerados) e gráfico de engajamento renderizado.
    await expect(page.getByRole("heading", { name: /engajamento por evento/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Inscritos", { exact: true }).first()).toBeVisible();
    // Nome real vindo do T2 (title da row #META, exposto na US-06).
    await expect(
      page
        .getByText(
          /(Summit|Bootcamp|Workshop|Talks?|Expo|Masterclass|Fair|Networking|Hackathon|Sprint|Trends|Days|Campus|AI for Business)/,
        )
        .first(),
    ).toBeVisible();
  });

  test("catálogo lista os 50 eventos reais com nome, período e situação", async ({ page }) => {
    await page.goto("/catalogo");

    await expect(
      page
        .getByRole("heading", {
          name: /(Summit|Bootcamp|Workshop|Talks?|Expo|Masterclass|Fair|Networking|Hackathon|Sprint|Trends|Days|Campus|AI for Business)/,
        })
        .first(),
    ).toBeVisible({
      timeout: 15_000,
    });
    // Ano cheio → catálogo completo do seed (o RBAC de admin vê os 50).
    await selectFullYearPeriod(page);
    await expect(page.getByText(/de 50 eventos/i)).toBeVisible({ timeout: 30_000 });
    // Situação real do enum do T2 (chip pt-BR).
    await expect(page.getByText(/^(Ativo|Concluído|Planejado|Cancelado)$/).first()).toBeVisible();
  });

  test("detalhe do evento: counters, taxas e série histórica reais", async ({ page }) => {
    await page.goto("/eventos/evt_0003");

    await expect(
      page.getByRole("heading", {
        name: /(Summit|Bootcamp|Workshop|Talks?|Expo|Masterclass|Fair|Networking|Hackathon|Sprint|Trends|Days|Campus|AI for Business)/,
      }),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Taxa de Check-in")).toBeVisible();
    await expect(page.getByText(/taxa de conclusão/i)).toBeVisible();
    // A série real é agregada por TIPO de evento (o T2 não tem série por
    // evento — decisão da US-06, refletida no subtítulo do gráfico).
    await expect(page.getByText(/inscrições vs check-ins/i)).toBeVisible();
    await expect(page.getByText(/eventos do tipo/i)).toBeVisible({ timeout: 15_000 });
  });

  test("distribuições demográficas carregam as 5 dimensões reais", async ({ page }) => {
    await page.goto("/demografia");

    // Painéis ficam em skeleton (sem título) até o fetch real resolver.
    await expect(page.getByText("Faixa Etária")).toBeVisible({ timeout: 20_000 });
    // Dados reais do pool de participantes (buckets do by-age do T2).
    await expect(page.getByText("18-24").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Gênero")).toBeVisible();
    await expect(page.getByText("Cidades (Top 10)")).toBeVisible();
    await expect(page.getByText("Perfil do Participante")).toBeVisible();
    await expect(page.getByText("Tipo de Evento")).toBeVisible();
    // Horas de participação (US-06): faixas reais do /metrics/hours/distribution
    // (endpoint agrega por participante — o mais lento da tela; timeout maior).
    await expect(page.getByText("Horas de Participação")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("1-4h")).toBeVisible({ timeout: 30_000 });
  });

  test("evento inexistente cai no estado de não encontrado (404 real)", async ({ page }) => {
    await page.goto("/eventos/evt_9999");

    await expect(page.getByText(/evento não encontrado/i)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("manager — escopo restrito (RBAC real)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, MANAGER);
  });

  test("manager aterrissa no catálogo e o RBAC lista só os 10 eventos do escopo", async ({
    page,
  }) => {
    // "/" decide por papel (US-06): manager cuida de eventos individuais e
    // entra pelo catálogo, não pelo dashboard.
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /catálogo de eventos/i }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/catalogo$/);

    await expect(
      page
        .getByRole("heading", {
          name: /(Summit|Bootcamp|Workshop|Talks?|Expo|Masterclass|Fair|Networking|Hackathon|Sprint|Trends|Days|Campus|AI for Business)/,
        })
        .first(),
    ).toBeVisible({
      timeout: 15_000,
    });
    // Ano cheio → mesmo assim o RBAC limita ao escopo do manager (10 eventos).
    await selectFullYearPeriod(page);
    await expect(page.getByText(/de 10 eventos/i)).toBeVisible({ timeout: 30_000 });

    // Manager NÃO tem dashboard (US-06): rota direta volta ao catálogo e o
    // item não aparece na navegação.
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { level: 1, name: /catálogo de eventos/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /dashboard/i })).toHaveCount(0);
  });

  test("distribuições do manager são POR evento (auto-seleciona o 1º do escopo)", async ({
    page,
  }) => {
    await page.goto("/demografia");

    // O seletor não oferece "Todos os eventos" e um evento do escopo já vem
    // selecionado; os painéis carregam os dados desse evento.
    await expect(page.getByText("Faixa Etária")).toBeVisible({ timeout: 30_000 });
    const seletor = page.getByRole("combobox", { name: /evento/i });
    await expect(seletor).not.toHaveText(/todos os eventos/i);
    await seletor.click();
    await expect(page.getByRole("option", { name: /todos os eventos/i })).toHaveCount(0);
  });

  test("evento fora do escopo cai no estado de sem permissão (403 real)", async ({ page }) => {
    await page.goto("/eventos/evt_0020");

    await expect(page.getByText(/não tem permissão/i)).toBeVisible({ timeout: 15_000 });
  });

  test("evento dentro do escopo carrega normalmente", async ({ page }) => {
    await page.goto("/eventos/evt_0003");

    await expect(
      page.getByRole("heading", {
        name: /(Summit|Bootcamp|Workshop|Talks?|Expo|Masterclass|Fair|Networking|Hackathon|Sprint|Trends|Days|Campus|AI for Business)/,
      }),
    ).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("estados de borda contra o backend real", () => {
  test("token inválido → 401 real vira sessão expirada", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("mfeAuth.accessToken", "token-invalido");
      localStorage.setItem(
        "mfeAuth.profile",
        JSON.stringify({
          id: "x",
          firstName: "Admin",
          lastName: "Local",
          username: "admin",
          email: "admin@local.dev",
          accessLevel: "ADMIN",
        }),
      );
    });

    await page.goto("/");

    await expect(page.getByText(/sessão expirou/i)).toBeVisible({ timeout: 15_000 });
  });

  test("período sem eventos → estado vazio real (200 sem itens)", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/catalogo");
    await expect(page.getByText(/de \d+ eventos/i)).toBeVisible({ timeout: 15_000 });

    // Período personalizado num intervalo sem seed (2030) → resposta real vazia.
    await page.getByRole("combobox", { name: /período/i }).click();
    await page.getByRole("option", { name: /personalizado/i }).click();
    await page.getByLabel("De").fill("2030-01-01");
    await page.getByLabel("Até").fill("2030-06-30");

    await expect(page.getByText(/nenhum evento no período/i)).toBeVisible({ timeout: 15_000 });
  });
});
