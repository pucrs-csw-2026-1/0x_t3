# US-01 — Esqueleto ambulante: login (T1) → primeira métrica real do T2 na tela

## História

Como **gestor (ADMIN/MANAGER)**, quero **ver pelo menos uma métrica real do
Metrics Service logo após autenticar**, para **confirmar que a plataforma de
métricas está conectada e exibindo dados reais**.

## Contexto

**Fatia vertical mínima (walking skeleton):** o caminho mais fino que atravessa
o sistema inteiro — **autenticar (T1) → buscar um dado real (T2) → mostrar na
tela** — provando a integração ponta-a-ponta antes de investir nas telas ricas.

- **Entrega visível:** uma tela mínima exibe **um número real** vindo do T2
  (ex.: total de eventos no período), não um mock.
- **Constrói a base reutilizável:** ao fazer isso, nasce a camada de serviço
  (`metricsApi.ts`), o proxy e o tratamento de erros que **US-02, US-03 e US-04
  reaproveitam** — mas aqui já com algo demonstrável.

**ADRs relacionados**

- [ADR-0003 — Integração com APIs T1/T2](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0003-integracao-apis-t1-t2.md)
- [ADR-0009 — Contrato da API de métricas](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0009-contrato-api-metrics.md)

## Critérios de aceite

- [ ] **Resultado visível:** autenticado, uma tela mínima (ex.: `DashboardPage`
      provisória) exibe **≥ 1 métrica real do T2** (ex.: contagem de
      `GET /metrics/events` num período), com o número renderizado na página.
- [ ] `vite.config.ts` com proxy `/api` → Metrics (`METRICS_SERVICE_URL`) e
      `/auth-api` → Auth (`AUTH_SERVICE_URL`), server-to-server (ADR-0003).
- [ ] `services/metricsApi.ts` com **uma** função tipada (ex.: `listEventMetrics`):
      base `new URL(import.meta.url).origin + "/api"`, `Authorization: Bearer`,
      DTO tipado e mapeamento snake_case ↔ camelCase.
- [ ] Reuso de auth: lê token de `mfeAuth.*`; **não** reimplementa login.
- [ ] Estados tratados mesmo nesta tela mínima: **loading**, **erro**, **sessão
      expirada** (401 → `mfeAuth:sessionExpired`).
- [ ] Mapa de erros base (ADR-0009): 401/403/404/422/5xx com mensagem clara.
- [ ] Textos em pt-BR; número formatado com locale pt-BR.

## Definition of Done

- [ ] Demonstrável: com T1 (`:8080`) e T2 (`:8000`) no ar, o número real aparece
      na tela após login (com token de admin do seed).
- [ ] `tsc`, `eslint` e `vitest` verdes; testes do `metricsApi` com `fetch`
      mockado cobrindo partição de equivalência, valor-limite e **caminhos de
      erro** (401/403/404/422/5xx).
- [ ] Contrato de remote (ADR-0005) preservado (serviço não acopla navegação).
- [ ] README/docs de serviço atualizados.
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow) e aprovado.

## Dependências / bloqueadores

- Depende da **US-00** (scaffold). Requer T1 (`:8080`) e T2 (`:8000`) rodando
  localmente. **Habilita** US-02/03/04 (que reusam `metricsApi.ts`).

## Metadados do board

- **ADR:** 0003, 0009
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:feature`, `frontend`, `integração`, `area:integracao-t1`, `area:integracao-t2`, `prioridade:alta`
- **Branch:** `feature/us-01-esqueleto-ambulante`
