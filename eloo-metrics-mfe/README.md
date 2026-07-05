# Eloo Metrics MFE (T3)

Microfrontend de **métricas/analytics** de eventos da plataforma **Eloo**.
É um **remote** de [Module Federation](https://github.com/originjs/vite-plugin-federation)
montado pelo [eloo-shell](../eloo-shell); também roda standalone em dev.
Consome o **Metrics Service (T2)** e reutiliza a autenticação do **Auth Service
(T1)**.

> Trabalho 3 (T3) — Construção de Software, PUCRS 2026/1 · Grupo 0x.

## Stack

Vite 5 · React 18 · TypeScript 5 · MUI 6 + **MUI X Charts** · TailwindCSS 3 ·
react-router-dom 6 · Module Federation. Ver
[ADR-0002](adr/0002-stack-tecnica.md).

## Começando

```bash
npm install
cp .env.example .env      # aponta para Metrics (T2) e Auth (T1)
npm run dev               # standalone em http://localhost:5177
```

Para servir como **remote** para o shell consumir (o dev server sozinho não gera
`remoteEntry.js`):

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

- **Integração** ([ADR-0003](adr/0003-integracao-apis-t1-t2.md)): requisições vão
  para `/api` (Metrics) e `/auth-api` (Auth) na própria origem e são _proxied_
  server-to-server pelo `vite.config.ts` (contorno de CORS).
- **Contrato de remote** ([ADR-0005](adr/0005-contrato-paginas-remote.md)): cada
  página recebe `theme?` e reporta ações por callbacks; não navega sozinha.
- **Testes** ([ADR-0011](adr/0011-estrategia-de-testes.md)): unit (Vitest+RTL),
  integração (MSW) e E2E (Playwright; mock no CI, real local).

## Documentação

- [Índice de ADRs](adr/README.md) · [CLAUDE.md](CLAUDE.md) ·
  [CONTRIBUTING](../CONTRIBUTING.md)
- Backlog de User Stories: [docs/backlog/](docs/backlog/)

## Estado

**US-00 (scaffold)** — esqueleto executável (standalone + remote), sem
integração de API. A primeira integração real (login → métrica do T2) chega na
US-01.
