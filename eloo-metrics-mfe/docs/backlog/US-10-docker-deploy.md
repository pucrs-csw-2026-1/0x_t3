# US-10 — Empacotamento Docker + pipeline de deploy do T3

## História

Como **avaliador/integrante do grupo**, quero **subir o T3 com `docker compose up` e ter um pipeline de deploy**, para **não depender de rodar `npm` na mão e ter release reprodutível como nos backends T1/T2**.

## Contexto

Até então o `eloo-metrics-mfe` só roda via npm (`dev`/`serve:remote`). Os backends já sobem via `docker compose` e têm CD. Esta US traz Docker + compose + CD ao T3, seguindo o padrão dos repositórios irmãos.

**ADR relacionado**

- [ADR-0012 — Empacotamento Docker, docker-compose e pipeline de deploy (CD) do T3](../../adr/0012-deploy-docker-compose.md)

## Critérios de aceite

- [ ] `eloo-metrics-mfe/Dockerfile` multi-stage: builda o app e serve o remote com `vite preview` na `:5176` (gera `remoteEntry.js`).
- [ ] `docker-compose.yml` na raiz do `0x_t3` sobe **só** o metrics (`docker compose up` → remote em `:5176`), com os alvos de proxy (`METRICS_SERVICE_URL`/`AUTH_SERVICE_URL`) configuráveis por env.
- [ ] O container alcança os backends do host (T1 `:8080` / T2 `:8000`) via `host.docker.internal`.
- [ ] `.github/workflows/cd.yml`: no push para `main`, roda os gates (lint/typecheck/test ≥80%), builda via `docker compose build` e publica release beta idempotente (sem push pra registry).
- [ ] `.dockerignore` evita copiar `node_modules`/`dist`/dev-login para o contexto de build.

## Definition of Done

- [ ] `docker compose up` sobe o remote e serve `http://localhost:5176/assets/remoteEntry.js`.
- [ ] `docker compose build` verde localmente e no CD.
- [ ] Docs (README do T3) mencionam o caminho Docker além do npm.
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow) e aprovado.

## Dependências / bloqueadores

- Independe das demais US (infra). Para o fluxo ponta-a-ponta, T1/T2 e o shell sobem à parte.

## Metadados do board

- **ADR:** 0012
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels:** `tipo:infra`, `prioridade:media`
- **Issue:** [#28](https://github.com/pucrs-csw-2026-1/0x_t3/issues/28)
- **Branch:** `feature/us-10-docker-deploy`
