# US-05 — Detalhe de evento + séries históricas

## História
Como **gestor (ADMIN/MANAGER)**, quero **abrir um evento e ver suas métricas
detalhadas e a evolução no tempo**, para **analisar desempenho e tendências de
um evento específico**.

## Contexto
**Detalhe de um evento** e sua evolução no tempo.

- **Consome do T2:** `/metrics/events/{id}`, `/checkin-rate`,
  `/certification-rate`, `/series`, `/timeseries`.
- **Ponto de atenção:** RBAC de manager — evento fora do escopo retorna `403`
  e precisa de tratamento claro na UI.

**ADRs relacionados**

- [ADR-0009 — Contrato da API de métricas](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0009-contrato-api-metrics.md)
- [ADR-0004 — Biblioteca de gráficos](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0004-biblioteca-graficos.md)
- [ADR-0005 — Contrato de páginas remote](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0005-contrato-paginas-remote.md)

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
- Depende da **US-01** e da **US-04** (catálogo); o detalhe é aberto a partir do catálogo de eventos.

## Metadados do board
- **ADR:** 0004, 0005, 0009
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:feature`, `area:dashboard`, `area:charts`, `area:integracao-t2`, `prioridade:media`
- **Branch:** `feature/us-05-detalhe-evento-series`
