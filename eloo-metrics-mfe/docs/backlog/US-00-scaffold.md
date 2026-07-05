# US-00 — Scaffold do eloo-metrics-mfe (Vite + React + TS + MUI + Tailwind + Federation)

## Tarefa (habilitação técnica)
> **Não é uma história de usuário** — é o setup inicial que **habilita** as US
> seguintes (essas sim entregam valor ao usuário). Registrada como *enabler*
> explícito, sem fingir persona de usuário.

Preparar o esqueleto do `eloo-metrics-mfe`: app executável **standalone** e como
**remote** de Module Federation, com a stack e a arquitetura já fixadas pelos
ADRs, pronto para receber as telas das próximas US.

## Contexto
**Primeira US do T3** — cria o projeto do zero, ainda sem integração de API.

- **O que entrega:** o esqueleto executável do MFE (standalone + remote), base
  para todas as telas seguintes.
- **Já decidido pelos ADRs:** stack e arquitetura são seguidas, não redecididas.

**ADRs relacionados**

- [ADR-0001 — Arquitetura de microfrontend](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0001-arquitetura-microfrontend.md)
- [ADR-0002 — Stack técnica](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0002-stack-tecnica.md)
- [ADR-0004 — Biblioteca de gráficos](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0004-biblioteca-graficos.md)
- [ADR-0005 — Contrato de páginas remote](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0005-contrato-paginas-remote.md)

## Critérios de aceite
- [ ] `package.json` com as deps do ADR-0002: React 18, MUI 6 + icons, Emotion,
      Tailwind 3, react-router-dom 6, Vite 5, `@originjs/vite-plugin-federation`,
      `@mui/x-charts`.
- [ ] `vite.config.ts` em **modo remote**: `federation({ name: "mfeMetrics",
      filename: "remoteEntry.js", exposes: {...}, shared: [...] })` com a lista
      `shared` idêntica ao shell; proxy `/api` (metrics) e `/auth-api` (auth)
      via `loadEnv` (ADR-0003).
- [ ] Portas: `dev` em **5177**, `serve:remote` (build+preview) em **5176**.
- [ ] `tailwind.config.js` + `postcss.config.js` + `src/theme.ts` com os tokens
      do `DESIGN.md` (primary `#981652`/`#b8336a`, Public Sans + Space Grotesk,
      raios sm/md); `src/index.css` com as diretivas do Tailwind.
- [ ] Estrutura `src/`: `pages/`, `components/`, `components/charts/`,
      `services/`, `theme.ts`, `App.tsx` (router standalone), `main.tsx`.
- [ ] Uma página placeholder (`DashboardPage`) exposta como remote, seguindo o
      contrato do ADR-0005 (`theme?` + fallback ao tema próprio), renderizando
      um "olá" em **pt-BR** com um componente MUI e um gráfico MUI X de exemplo.
- [ ] `npm run dev` sobe standalone em `http://localhost:5177`.
- [ ] `npm run build` (`tsc -b` + build) sem erros; `npm run serve:remote` gera
      `remoteEntry.js` servido em `:5176`.
- [ ] **ESLint** (`lint`) e **Prettier** (`format:check`) configurados.
- [ ] **CI (GitHub Actions):** `.github/workflows/ci.yml` na raiz do repo
      (`working-directory: eloo-metrics-mfe`) rodando ESLint → `tsc` → Prettier
      `--check` → Vitest (gate de cobertura ≥80%), **verde** no PR — espelha o
      `ci.yml` do 0x_t2.
- [ ] `README.md` inicial (quickstart + arquitetura).
- [ ] *(Integração T1/T2 não se aplica nesta US — só esqueleto.)*

## Definition of Done
- [ ] `tsc`, `eslint`, `prettier --check` e `vitest` verdes (setup mínimo).
- [ ] **CI (Actions) verde** no PR.
- [ ] Contrato de remote (ADR-0005) respeitado pela página placeholder.
- [ ] `README.md` do projeto criado/atualizado.
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow, a partir de `dev`) e aprovado.

## Dependências / bloqueadores
- Nenhuma (primeira US). Habilita US-01+ (serviço/auth) e US-05 (integração no
  shell).

## Metadados do board
- **ADR:** 0001, 0002, 0004, 0005
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:infra`, `area:dashboard`, `prioridade:alta`
- **Branch:** `feature/us-00-scaffold`
