# US-05 — Integração do remote mfeMetrics no eloo-shell

## História
Como **usuário da plataforma Eloo**, quero **acessar as métricas pelo menu do
shell**, para **usar o dashboard dentro da experiência unificada da Eloo**.

## Contexto
Monta o `mfeMetrics` no host seguindo o precedente do auth já integrado.
Toca o repositório **`eloo-shell`**. ADR: [0010](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0010-contrato-remote-shell.md).

## Critérios de aceite
- [ ] `mfeMetrics` buildado e servido em `:5176`
      (`npm run serve:remote`), gerando `remoteEntry.js`.
- [ ] Shell: `src/shell/remotes.ts` com
      `metrics: "http://localhost:5176/assets/remoteEntry.js"`.
- [ ] Shell: blocos `declare module "metrics/…"` em `src/vite-env.d.ts`
      (arquivo import-free no topo).
- [ ] Shell: página(s) em `src/pages/` embrulhando o remote em `RemoteSlot`,
      passando o tema e ligando callbacks ao `useNavigate`.
- [ ] Shell: rotas de métricas sob **`RequireManager`** (ADMIN/MANAGER) e entrada
      "Métricas" no `Header` para papéis autorizados.
- [ ] `shared` do `mfeMetrics` idêntico ao do shell; `@mui/x-charts` **não**
      compartilhado (ADR-0010).
- [ ] Fluxo fim-a-fim: login (T1) → menu Métricas → dashboard (T2) renderiza no
      shell.

## Definition of Done
- [ ] `tsc`/`eslint`/build verdes nos **dois** repositórios.
- [ ] Contrato de remote (ADR-0005/0010) respeitado; gate de acesso no host.
- [ ] Docs (README do shell e do metrics) atualizadas.
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow) e aprovado.

## Dependências / bloqueadores
- Depende de **US-02** (ao menos o `DashboardPage` exposto). Alterações no
  `eloo-shell` são versionadas no repo do shell.

## Metadados do board
- **ADR:** 0010
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:feature`, `area:dashboard`, `prioridade:alta`
- **Branch:** `feature/us-05-integracao-shell`
