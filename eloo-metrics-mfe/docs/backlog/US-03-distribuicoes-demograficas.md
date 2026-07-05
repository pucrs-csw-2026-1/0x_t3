# US-03 — Distribuições demográficas

## História

Como **gestor (ADMIN/MANAGER)**, quero **ver a distribuição dos participantes
por faixa etária, gênero, cidade, perfil e tipo de evento**, para **entender o
público dos eventos**.

## Contexto

**Distribuições demográficas** dos participantes.

- **Consome do T2:** `/metrics/by-age`, `/by-gender`, `/by-city`,
  `/by-profile`, `/by-type`.
- **Filtros:** `event_id` e período (`from`/`to`, buckets `YYYY-MM`).

**ADRs relacionados**

- [ADR-0004 — Biblioteca de gráficos](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0004-biblioteca-graficos.md)
- [ADR-0009 — Contrato da API de métricas](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0009-contrato-api-metrics.md)

## Critérios de aceite

- [ ] Painéis de distribuição por **faixa etária, gênero, cidade, perfil e tipo**
      usando gráficos MUI X (pizza/barras conforme o dado).
- [ ] Filtros opcionais `event_id` e período (`from`/`to` em `YYYY-MM`), com
      validação (evita `422` de intervalo inválido).
- [ ] Faixas etárias conforme o backend (0-17, 18-24, ..., 65+, "desconhecido").
- [ ] Integra a **API T2** com auth e RBAC respeitados.
- [ ] Trata loading, erro, **vazio** (categoria sem dados) e sessão expirada.
- [ ] Textos e categorias em pt-BR; percentuais com locale pt-BR.

## Definition of Done

- [ ] `tsc`, `eslint` e `vitest` verdes; casos de erro/limite cobertos.
- [ ] Contrato de remote (ADR-0005) respeitado; gráficos sem fetch próprio.
- [ ] Acessibilidade básica (legenda/alt/rótulos).
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow) e aprovado.

## Dependências / bloqueadores

- Depende da **US-01**; compartilha componentes de gráfico com a **US-02**.

## Metadados do board

- **ADR:** 0004, 0009
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:feature`, `area:dashboard`, `area:charts`, `area:integracao-t2`, `prioridade:media`
- **Branch:** `feature/us-03-distribuicoes-demograficas`
