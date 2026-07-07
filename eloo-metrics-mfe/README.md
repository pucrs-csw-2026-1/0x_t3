# Eloo Metrics MFE (T3)

Microfrontend de **métricas/analytics** de eventos da plataforma **Eloo**. É um **remote** de [Module Federation](https://github.com/originjs/vite-plugin-federation) montado pelo [eloo-shell](../eloo-shell); também roda standalone em dev. Consome o **Metrics Service (T2)** e reutiliza a autenticação do **Auth Service (T1)**.

> Trabalho 3 (T3) — Construção de Software, PUCRS 2026/1 · Grupo 0x.

## Stack

Vite 5 · React 18 · TypeScript 5 · MUI 6 + **MUI X Charts** · TailwindCSS 3 · react-router-dom 6 · Module Federation. Ver [ADR-0002](adr/0002-stack-tecnica.md).

## Começando

```bash
npm install
cp .env.example .env      # aponta para Metrics (T2) e Auth (T1)
npm run dev               # standalone em http://localhost:5177
```

Para servir como **remote** para o shell consumir (o dev server sozinho não gera `remoteEntry.js`):

```bash
npm run serve:remote      # vite build && vite preview --port 5176
```

## Scripts

| Script                          | O que faz                                  |
| ------------------------------- | ------------------------------------------ |
| `npm run dev`                   | dev server standalone (:5177)              |
| `npm run build`                 | `tsc -b` + build de produção               |
| `npm run serve:remote`          | build + preview como remote (:5176)        |
| `npm run lint` / `format:check` | ESLint / Prettier                          |
| `npm run test` / `test:cov`     | Vitest (unit + integração) / com cobertura |
| `npm run test:e2e`              | Playwright (E2E, mock)                     |
| `npm run test:e2e:real`         | Playwright contra T1/T2 reais (local)      |

### E2E real (`test:e2e:real`)

Valida **todas as telas contra o backend real** (US-06): dashboard, catálogo, distribuições e detalhe, com RBAC (admin/manager), 403/404, sessão expirada e estado vazio. Roda só os specs `e2e/*.real.spec.ts`, subindo o dev server em `:5178` com `VITE_USE_MOCKS=false` (nunca reaproveita um dev server em modo mock).

Pré-requisitos (uma vez por ambiente):

```bash
# 1. T1 (Auth) no ar + pool de participantes (necessário para counters não-zerados)
cd 0x_t1 && docker compose up -d
docker compose --profile seed run --rm seed-users

# 2. T2 (Metrics) no ar + seed de eventos (50 eventos; escopo do manager = evt_0000..evt_0009)
cd ../0x_t2 && docker compose up -d
# se o T1 foi seedado DEPOIS do T2 subir, re-seede com participantes:
docker compose run --rm --no-deps -e METRICS_SEED_FORCE=1 seed

# 3. Rodar a suíte real
cd ../eloo-metrics-mfe && npm run test:e2e:real
```

Credenciais do seed: `admin@local.dev`/`Admin@123` (visão global) e `manager@local.dev`/`Manager@123` (escopo de 10 eventos). Gotchas conhecidos (terraform, ad blockers) estão no [handoff](docs/handoff-us-06-integracao-shell.md).

## Arquitetura

```
src/
  pages/            uma tela por arquivo, exposta como remote (contrato ADR-0005)
  components/charts/ gráficos MUI X reutilizáveis (recebem dados por props)
  services/         authApi.ts (reuso T1) + metricsApi.ts (T2) — a partir da US-01
  test/             setup do Vitest + handlers MSW (integração)
  theme.ts          tema MUI próprio (standalone); App.tsx  router standalone
e2e/                testes Playwright
```

- **Integração** ([ADR-0003](adr/0003-integracao-apis-t1-t2.md)): requisições vão para `/api` (Metrics) e `/auth-api` (Auth) na própria origem e são _proxied_ server-to-server pelo `vite.config.ts` (contorno de CORS).
- **Contrato de remote** ([ADR-0005](adr/0005-contrato-paginas-remote.md)): cada página recebe `theme?` e reporta ações por callbacks; não navega sozinha.
- **Testes** ([ADR-0011](adr/0011-estrategia-de-testes.md)): unit (Vitest+RTL), integração (MSW) e E2E (Playwright; mock no CI, real local).

## Documentação

- [Índice de ADRs](adr/README.md) · [CLAUDE.md](CLAUDE.md) · [CONTRIBUTING](../CONTRIBUTING.md)
- Backlog de User Stories: [docs/backlog/](docs/backlog/)

## Estado

**US-00..US-05 entregues** (scaffold, esqueleto ambulante, dashboard, catálogo, distribuições, detalhe + séries). **US-06** — integração real validada contra T1+T2: camada de serviço alinhada ao contrato real do T2 (ADR-0009) e suíte `test:e2e:real` cobrindo os fluxos principais. O modo mock (`VITE_USE_MOCKS=true`) é um _dev-aid_ explícito do `.env.development`, nunca o default de produção. Próximo: US-07 (integração no shell).
