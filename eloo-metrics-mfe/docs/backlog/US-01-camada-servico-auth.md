# US-01 — Camada de serviço + autenticação (T1) e proxy de APIs

## História
Como **desenvolvedor do Grupo 0x**, quero **uma camada de serviço tipada que
autentica com o T1 e alcança as APIs via proxy**, para **que as telas consumam
métricas com auth, RBAC e erros tratados de forma consistente**.

## Contexto
Base de integração antes das telas: `metricsApi.ts` + reuso do padrão de auth do
`eloo-auth-mfe` (tokens `mfeAuth.*`, evento `mfeAuth:sessionExpired`) + proxy no
`vite.config.ts`. ADRs: [0003](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0003-integracao-apis-t1-t2.md),
[0009](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0009-contrato-api-metrics.md).

## Critérios de aceite
- [ ] `vite.config.ts` com proxy `/api` → Metrics (`METRICS_SERVICE_URL`) e
      `/auth-api` → Auth (`AUTH_SERVICE_URL`), server-to-server (ADR-0003).
- [ ] `services/metricsApi.ts`: base `new URL(import.meta.url).origin + "/api"`;
      envia `Authorization: Bearer <accessToken>`; DTOs tipados iniciais e
      mapeamento snake_case ↔ camelCase.
- [ ] Reuso de auth: lê token/perfil de `mfeAuth.*`; **não** reimplementa login.
- [ ] Mapa de erros (ADR-0009): 401 → limpa sessão + `sessionExpired`; 403 →
      "sem permissão"; 404 → "não encontrado"; 422 → filtro inválido; 5xx/rede →
      erro + retry.
- [ ] Uma chamada de fumaça a `GET /metrics/events` funciona contra o T2 em
      execução (com token de admin do seed).
- [ ] Integra a **API T1** (auth reutilizada) e prepara o consumo da **T2**.
- [ ] Trata loading, erro, vazio e sessão expirada na camada de serviço.
- [ ] Textos em pt-BR; formatação com locale pt-BR.

## Definition of Done
- [ ] `tsc`, `eslint` e `vitest` verdes; testes com `fetch` mockado cobrindo
      partição de equivalência, valor-limite e **caminhos de erro** (401/403/
      404/422/5xx).
- [ ] Contrato de remote (ADR-0005) preservado (serviço não acopla navegação).
- [ ] Docs de serviço/README atualizadas.
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow) e aprovado.

## Dependências / bloqueadores
- Depende da **US-00** (scaffold). Requer T1 (`:8080`) e T2 (`:8000`) rodando
  localmente para o teste de fumaça.

## Metadados do board
- **ADR:** 0003, 0009
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:feature`, `area:integracao-t1`, `area:integracao-t2`, `prioridade:alta`
- **Branch:** `feature/us-01-camada-servico-auth`
