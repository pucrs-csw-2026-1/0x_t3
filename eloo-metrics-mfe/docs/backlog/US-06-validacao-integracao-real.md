# US-06 — Validação da integração real (front ↔ Metrics T2)

## História

Como **gestor (ADMIN/MANAGER)**, quero que **todas as telas de métricas exibam dados reais do T2** (não mock), para **confiar nas métricas em produção**.

## Contexto

**O código da integração já existe — falta validá-lo contra o T2 real.**

- **O mock é um toggle, não o único caminho:** `metricsApi.ts` chama o T2 real quando `VITE_USE_MOCKS=false`; o mock (`VITE_USE_MOCKS=true`, padrão do `.env.development`) é só um _dev-aid_.
- **Só a US-01 foi validada real:** `listEventMetrics` foi exercitada contra o T2 (50 eventos do seed). Os endpoints das US-02..05 (`getEngagement`, `by-age/gender/city/profile/type`, detalhe, rates, timeseries) têm o caminho real **em código, mas nunca foram exercitados contra o T2** — só contra mocks (MSW). Risco de **divergência** (nomes de campo, formato de DTO, RBAC, erros) que o mock esconde.
- **Deve vir antes da integração no shell** (US-07): validar o back antes de plugar no host.

**ADRs relacionados**

- [ADR-0009 — Contrato da API de métricas](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0009-contrato-api-metrics.md)
- [ADR-0003 — Integração com APIs T1/T2](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0003-integracao-apis-t1-t2.md)

## Critérios de aceite

- [ ] Com `VITE_USE_MOCKS=false` + T1 (`:8080`) e T2 (`:8000`) no ar, **todas** as telas (dashboard, catálogo, distribuições, detalhe de evento) carregam **dados reais** sem erro.
- [ ] Divergências entre o mock e o **contrato real do T2** (ADR-0009) corrigidas no mapeamento da camada de serviço (campos, tipos, paginação, erros).
- [ ] **RBAC real** validado: admin vê a visão global; manager vê só o escopo; evento fora do escopo (`403`) tratado com mensagem clara.
- [ ] Estados de **erro / vazio / sessão expirada** validados contra respostas reais do T2 (não só mock).
- [ ] `npm run test:e2e:real` (Playwright contra T1+T2 reais) passa nos fluxos principais.
- [ ] Padrão de deploy/shell usa o **backend real** (`VITE_USE_MOCKS` fica como _dev-aid_ explícito, não o default de produção).

## Definition of Done

- [ ] `tsc`, `eslint`, `vitest` (cobertura ≥80%) verdes; ajustes de mapeamento cobertos por teste de integração (MSW) atualizado ao contrato real.
- [ ] `test:e2e:real` documentado no README (como subir T1+T2 e rodar).
- [ ] Divergências encontradas viram correções na camada de serviço (não gambiarra na tela).
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow) e aprovado.

## Dependências / bloqueadores

- Depende das telas **US-01..US-05** (já entregues) e do **T2 no ar** (ver gotchas do handoff: fix do cache do terraform, seed, backend `--no-deps`). Idealmente com o seed de participantes do Auth para counters não-zerados.
- **Habilita a US-07** (integração no shell) — validar o back antes de plugar no host.

## Metadados do board

- **ADR:** 0009, 0003
- **Responsável:** Grupo 0x
- **Entrega alvo:** _a definir com o time_
- **Labels sugeridas:** `tipo:feature`, `frontend`, `integração`, `area:integracao-t2`, `prioridade:alta`
- **Branch:** `feature/us-06-validacao-integracao-real`
