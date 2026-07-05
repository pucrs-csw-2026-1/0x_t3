# US-02 — Tela Dashboard: visão geral (counters + gráficos)

## História
Como **gestor (ADMIN/MANAGER)**, quero **um painel com os counters e o
engajamento dos eventos**, para **acompanhar inscrições, check-ins e
certificações num relance**.

## Contexto
**Primeira tela de dados** — a visão geral do dashboard.

- **Consome do T2:** `/metrics/events` e `/metrics/engagement`.
- **Mostra:** cards de counter (registered/checked_in/certified) + gráficos
  MUI X.

**ADRs relacionados**

- [ADR-0004 — Biblioteca de gráficos](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0004-biblioteca-graficos.md)
- [ADR-0009 — Contrato da API de métricas](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0009-contrato-api-metrics.md)
- [ADR-0005 — Contrato de páginas remote](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0005-contrato-paginas-remote.md)

## Critérios de aceite
- [ ] `DashboardPage` (exposta como remote, contrato ADR-0005) com seletor de
      **período** (a UI sempre envia janela — ADR-0009).
- [ ] Cards de counter (registered/checked_in/certified) a partir de
      `/metrics/events` (paginado) e engajamento de `/metrics/engagement`.
- [ ] Gráficos com **MUI X Charts** (ex.: barras por evento, sparkline no card),
      alimentados por dados já normalizados pelo serviço (não fazem fetch).
- [ ] Integra a **API T2** com `Authorization: Bearer`; RBAC respeitado (admin vê
      tudo; manager vê seu escopo).
- [ ] Trata **loading** (skeleton), **erro** (Alert + retry), **vazio** (sem
      dados no período) e **sessão expirada** (401 → redireciona no host).
- [ ] Textos em pt-BR; números/percentuais/datas com locale pt-BR.

## Definition of Done
- [ ] `tsc`, `eslint` e `vitest` verdes; lógica de formatação/estado testada
      (equivalência, valor-limite) e caminhos de erro cobertos.
- [ ] Contrato de remote (ADR-0005) respeitado.
- [ ] Acessibilidade básica dos gráficos (título/legenda/alt).
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow) e aprovado.

## Dependências / bloqueadores
- Depende da **US-01** (camada de serviço/auth). Telas do Stitch (ADR-0006)
  como referência visual.

## Metadados do board
- **ADR:** 0004, 0005, 0009
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:feature`, `area:dashboard`, `area:charts`, `area:integracao-t2`, `prioridade:alta`
- **Branch:** `feature/us-02-dashboard-visao-geral`
