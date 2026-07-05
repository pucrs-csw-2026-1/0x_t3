# US-04 — Detalhe de evento + séries históricas

## História
Como **gestor (ADMIN/MANAGER)**, quero **abrir um evento e ver suas métricas
detalhadas e a evolução no tempo**, para **analisar desempenho e tendências de
um evento específico**.

## Contexto
`EventMetricsPage` (por `eventId`) consumindo `/metrics/events/{id}`,
`/checkin-rate`, `/certification-rate`, `/series` e `/timeseries`. Aqui o RBAC
de manager (evento fora do escopo → `403`) precisa ser tratado com clareza.
ADRs: [0009](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0009-contrato-api-metrics.md),
[0004](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0004-biblioteca-graficos.md),
[0005](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0005-contrato-paginas-remote.md).

## Critérios de aceite
- [ ] `EventMetricsPage` recebe `eventId` (prop) e `onBack` (callback) — contrato
      de remote (ADR-0005).
- [ ] Exibe métricas do evento, taxa de check-in e de certificação.
- [ ] Série histórica (`/timeseries`/`/series`) com granularidade selecionável,
      em gráfico de linha MUI X.
- [ ] Integra a **API T2**; **403** (evento fora do escopo do manager) vira
      mensagem "você não tem permissão para ver este evento" — não erro cru.
- [ ] **404** (evento inexistente) → estado "evento não encontrado".
- [ ] Trata loading, erro, vazio e sessão expirada; pt-BR + locale pt-BR.

## Definition of Done
- [ ] `tsc`, `eslint` e `vitest` verdes; caminhos 403/404 e limite cobertos.
- [ ] Contrato de remote (ADR-0005) respeitado.
- [ ] Acessibilidade básica do gráfico de série.
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow) e aprovado.

## Dependências / bloqueadores
- Depende da **US-01**; navegação a partir da **US-02** (`onSelectEvent`).

## Metadados do board
- **ADR:** 0004, 0005, 0009
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:feature`, `area:dashboard`, `area:charts`, `area:integracao-t2`, `prioridade:media`
- **Branch:** `feature/us-04-detalhe-evento-series`
