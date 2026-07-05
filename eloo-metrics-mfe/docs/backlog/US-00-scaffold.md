# US-00 — Scaffold do eloo-metrics-mfe (Vite + React + TS + MUI + Tailwind + Federation)

## História
Como **desenvolvedor do Grupo 0x**, quero **um esqueleto do microfrontend de
métricas rodando standalone e como remote de Module Federation**, para **ter a
base sobre a qual todas as telas e integrações serão construídas**.

## Contexto
Primeira US do T3: cria o projeto do zero seguindo a stack e a arquitetura
fixadas nos ADRs. Não integra API ainda — só o esqueleto executável.
ADRs: [0001](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0001-arquitetura-microfrontend.md),
[0002](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0002-stack-tecnica.md),
[0004](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0004-biblioteca-graficos.md),
[0005](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0005-contrato-paginas-remote.md).

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
- [ ] ESLint configurado; `README.md` inicial (quickstart + arquitetura).
- [ ] *(Integração T1/T2 não se aplica nesta US — só esqueleto.)*

## Definition of Done
- [ ] `tsc`, `eslint` e `vitest` verdes (setup de teste mínimo funcionando).
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
