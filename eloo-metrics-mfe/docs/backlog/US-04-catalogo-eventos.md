# US-04 — Catálogo de eventos

## História
Como **gestor (ADMIN/MANAGER)**, quero **navegar por uma lista dos eventos**
(admin: todos; manager: apenas os do meu escopo), para **encontrar um evento e
abrir suas métricas detalhadas**.

## Contexto
**Porta de entrada** para o detalhe de métricas de um evento (US-05).

- **Consome do T2:** `GET /metrics/events` (paginado, com período). O backend
  **escopa por RBAC**: admin vê todos os eventos, manager vê só os seus
  (ADR-0009) — mesma chamada, dados diferentes por token.
- **Navegação:** selecionar um evento reporta `onSelectEvent(eventId)`; o host
  abre o detalhe (US-05).

**ADRs relacionados**

- [ADR-0009 — Contrato da API de métricas](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0009-contrato-api-metrics.md)
- [ADR-0005 — Contrato de páginas remote](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0005-contrato-paginas-remote.md)

## Critérios de aceite
- [ ] `EventCatalogPage` (exposta como remote, contrato ADR-0005): lista de
      eventos com nome, período/status e counters resumidos.
- [ ] **Paginação** (`page`/`page_size`) e filtro de período; escopo por papel
      via RBAC do T2 (admin: todos / manager: escopo).
- [ ] Selecionar um evento dispara `onSelectEvent(eventId)` (callback; o host
      navega para o detalhe — US-05).
- [ ] Integra a **API T2** com `Authorization: Bearer`.
- [ ] Trata loading, erro, **vazio** (sem eventos no período/escopo) e sessão
      expirada.
- [ ] Textos em pt-BR; datas/números com locale pt-BR.

## Definition of Done
- [ ] `tsc`, `eslint`, Vitest (unit + integração MSW) verdes; caminhos de erro
      cobertos.
- [ ] Contrato de remote (ADR-0005) respeitado.
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow) e aprovado.

## Dependências / bloqueadores
- Depende da **US-01** (camada de serviço). **Habilita** a US-05 (detalhe do
  evento).

## Metadados do board
- **ADR:** 0009, 0005
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:feature`, `frontend`, `integração`, `area:dashboard`, `area:integracao-t2`, `prioridade:alta`
- **Branch:** `feature/us-04-catalogo-eventos`
