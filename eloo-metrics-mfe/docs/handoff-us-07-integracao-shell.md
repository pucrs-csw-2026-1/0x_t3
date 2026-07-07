# Handoff — US-07: integração do remote mfeMetrics no eloo-shell

> Documento de passagem de sessão (pós-US-06). A validação da integração real (US-06, issue #24) está **concluída e mesclada**; o próximo trabalho é a **US-07** (issue #6): montar o metrics como remote no `eloo-shell` via Module Federation, conforme o [ADR-0010](../adr/0010-contrato-remote-shell.md).

## 1. Estado atual (o que está pronto)

- **US-00..US-06 = Done.** A US-06 validou TODAS as telas contra o T2 real e alinhou a camada de serviço ao contrato real (PR [0x_t3#25](https://github.com/pucrs-csw-2026-1/0x_t3/pull/25), mesclado na `dev`).
- **O T2 evoluiu junto** (PRs [0x_t2#85](https://github.com/pucrs-csw-2026-1/0x_t2/pull/85) e [#86](https://github.com/pucrs-csw-2026-1/0x_t2/pull/86), ambos na `main`): os endpoints de eventos agora expõem **`event_name`, `start_date`, `end_date` e `status` reais**, a listagem conta **certificados reais** (era 0 hardcoded) e o **seed é determinístico** (semente 42 + âncoras fixas → dataset idêntico entre execuções) com dados verossímeis no estilo do mock (Cloud Bootcamp, Tech Talk, Hackathon 0x…), público variável, ~25% dos eventos sem certificado e status variados (ativo/concluido/planejado/cancelado).
- **Suíte E2E real** (`npm run test:e2e:real`, 11 testes): exercita dashboard, catálogo, detalhe, distribuições, RBAC admin/manager, 403/404, sessão expirada e vazio contra T1+T2 reais. Documentada no README (seção "E2E real").
- **Decisões de produto tomadas na US-06** (valem para o shell):
  - **Manager NÃO tem dashboard**: entra pelo catálogo, a rota do dashboard o redireciona para lá e o item some do menu (ele cuida de eventos individuais). Admin mantém o dashboard global.
  - **Demografia do manager é POR evento**: sem a opção "Todos os eventos"; o 1º evento do escopo é auto-selecionado (`allowAll` no `EventSelector`).
  - **Série histórica é por TIPO de evento** (o T2 não tem série por evento — subtítulo do gráfico explicita o escopo agregado).
  - **`by-type` agrega N buckets mensais** na camada de serviço (o T2 só aceita `bucket` único; máx. 24 meses) e ignora o filtro de evento (painel avisa).
  - Painel de **Horas de Participação** (`/metrics/hours/distribution`) na tela de distribuições, com rosca + tabela.

## 2. O que a US-07 precisa fazer (passo a passo, ADR-0010)

Toca principalmente o repositório **`eloo-shell`** (repo próprio). O metrics já está pronto do lado dele (as 4 páginas seguem expostas no `vite.config.ts`: `./DashboardPage`, `./EventCatalogPage`, `./DemographicsPage`, `./EventMetricsPage`).

1. **Servir o metrics como remote:** `eloo-metrics-mfe` → `npm run serve:remote` → build + preview em **`:5176`** (gera `remoteEntry.js`). O dev server (`:5177`) NÃO gera `remoteEntry.js`.
2. **Registrar o remote no shell** — `eloo-shell/src/shell/remotes.ts`: `metrics: "http://localhost:5176/assets/remoteEntry.js"` (o `login` já aponta para `:5174`).
3. **Tipos ambientais** — `eloo-shell/src/vite-env.d.ts`: um bloco `declare module "metrics/<Página>"` por página exposta. Props conforme ADR-0005: `theme?`, callbacks (`onSelectEvent`, `onBack`), `eventId` no detalhe.
4. **Montar no host** — páginas em `eloo-shell/src/pages/` com `lazy(() => import("metrics/DashboardPage"))`, embrulhadas em `RemoteSlot`, passando o tema do shell e ligando callbacks ao `useNavigate`. Espelhar como o `login` é montado.
5. **Rotas + RBAC por papel** — `eloo-shell/src/routes.tsx`, sob `<RequireManager>` (ADMIN/MANAGER), **reproduzindo o roteamento por papel do standalone** (`HomeRoute`/`DashboardRoute` em `src/App.tsx` + filtro na `SideNavBar` são a referência):
   - Admin: entrada de Métricas → `/metrics` (dashboard); demais rotas normais.
   - Manager: entrada de Métricas → `/metrics/eventos` (catálogo); a rota do dashboard **redireciona** o manager para o catálogo; o link de dashboard não aparece no menu dele.
   - Rotas: `/metrics` (dashboard, só admin), `/metrics/eventos` (catálogo), `/metrics/eventos/:eventId` (detalhe), `/metrics/distribuicoes` (demografia).
6. **Navegação** — entrada "Métricas" no `Header`/menu do shell para ADMIN/MANAGER (apontando para o destino por papel do item 5).
7. **Shared deps** — a lista `shared` do metrics bate com a do shell (`react`, `react-dom`, `react-router-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`). **`@mui/x-charts` NÃO é shared.** Nova dep shared muda nos dois lados.
8. **Sessão/token** — no shell tudo é a mesma origem (`:5173`): o token gravado pelo remote de auth (`mfeAuth.accessToken`/`mfeAuth.profile`) é lido pelo metrics automaticamente (`getStoredProfile()` decide papel/escopo). Sem gambiarra de token.
9. **Proxy do shell** — conferir se o `vite.config` do shell proxia `/api` → T2 (`:8000`) e `/auth-api` → T1 (`:8080`) como o metrics standalone faz (ADR-0003); sem isso as chamadas do remote falham dentro do host.

## 3. Como rodar tudo (portas e seeds)

| Serviço                        | Comando (na pasta)                           | Porta   |
| ------------------------------ | -------------------------------------------- | ------- |
| metrics standalone (mock)      | `eloo-metrics-mfe` → `npm run dev`           | `:5177` |
| metrics como remote (p/ shell) | `eloo-metrics-mfe` → `npm run serve:remote`  | `:5176` |
| auth como remote (p/ shell)    | `eloo-auth-mfe` → `npm run serve:remote`     | `:5174` |
| shell                          | `eloo-shell` → `npm run dev`                 | `:5173` |
| E2E real do metrics            | `eloo-metrics-mfe` → `npm run test:e2e:real` | `:5178` |

**Backends (uma vez por ambiente):**

```bash
# 1. T1 (Auth) + pool de participantes (necessário para counters não-zerados)
cd 0x_t1 && docker compose up -d
docker compose --profile seed run --rm seed-users

# 2. T2 (Metrics) + seed de eventos (50 eventos determinísticos; escopo do manager = evt_0000..evt_0009)
cd ../0x_t2 && docker compose up -d
# re-seed (LIMPA as 3 tabelas antes — comportamento novo do METRICS_SEED_FORCE):
docker compose run --rm --no-deps -e METRICS_SEED_FORCE=1 seed
# o cache Redis tem TTL de 30s; para ver dados novos NA HORA:
docker compose exec redis redis-cli flushall
```

- **Credenciais:** `admin@local.dev`/`Admin@123` (global) e `manager@local.dev`/`Manager@123` (escopo evt_0000..evt_0009).
- **Login rápido no standalone:** `eloo-metrics-mfe/public/dev-login.html` (untracked de propósito — credenciais hardcoded, dev-only, NÃO commitar). Se não existir, recriar: POST `/auth-api/auth/login` + GET `/auth-api/users/me` → gravar `mfeAuth.accessToken`/`mfeAuth.profile` no localStorage.

## 4. Gotchas (aprendidos na marra — sessões US-01 e US-06)

- **Vite órfão no Windows:** matar o processo do `npm run dev`/`serve:remote` NÃO mata a árvore — o vite continua escutando na porta e o Playwright/`reuseExistingServer` reutiliza um servidor com **código/modo velho** (falhas fantasma). Conferir com `netstat -ano | findstr :5177` e matar o PID antes de rodar suítes.
- **E2E real usa 2 workers** (config): mais que isso derruba o T2 nos endpoints de agregação (hours/distribution é o mais pesado) e gera flake de timeout. Asserções de contagem usam timeout de 30s pelo mesmo motivo (cache frio).
- **Terraform do T2** falhando com "timeout while waiting for plugin to start" = cache de provider: `rm -rf 0x_t2/infra/terraform/.terraform*` e re-rodar. Não deixar `docker compose up seed/backend` re-disparar o terraform — usar `--no-deps`.
- **uBlock/ad blockers bloqueiam `/api/metrics/...`** → NetworkError no browser. Desativar para localhost.
- **Standalone tem localStorage por origem:** logar no auth `:5175` não autentica o metrics `:5177` — só o shell (mesma origem) unifica a sessão.
- **Gráficos MUI X usam `skipAnimation`** em todo o projeto: a animação de entrada deixava barras/arcos invisíveis com "efeitos de movimento" desativados no SO. Não remover.
- **`PieChart` reserva 100px à direita para a legenda interna** mesmo escondida — zerar `margin` e fixar raios (ver `GenderDistributionChart`/`HoursDistributionChart`).

## 5. Pendências e follow-ups (fora da US-07, não esquecer)

- **Board:** mover a US-06 (#24) para Done, priorizar a US-07 (#6).
- **T2 (candidatas a issue):** o router da LISTAGEM aplica default `ativo` quando `status` falta (mascaramento silencioso — o detalhe devolve null honesto); granularidade mínima das séries é **mensal** (evento de um fim de semana vira 1 ponto — falta diário/semanal); não existe **série por evento** (a tela aproxima por tipo).
- **US-08 (forks → SNS):** em produção, nome/status/datas dos eventos passarão a fluir fork → SNS → T2; o seed simulado deixa de ser a fonte. O mapeamento do T3 já está pronto para isso.
- **`eloo-metrics-mfe/public/dev-login.html`**: manter fora do git.

## 6. Processo (não esquecer)

- **GitFlow:** `main ← dev ← feature/us-07-integracao-shell` (a US-07 mexe no `eloo-shell`, que é **outro repo** — conferir o CI de lá). `main`/`dev` protegidas (PR + checks verdes).
- **Commits:** skill **`/commit`** — Conventional Commits com corpo + `Refs #NN`, `.ai_log` da sessão em commit próprio, nunca `Co-Authored-By: Claude`.
- **Markdown:** Prettier com `proseWrap: "never"` — não quebrar prosa no meio da frase.
- **Gates antes de PR:** `tsc -b`, `eslint`, `prettier --check`, Vitest (cobertura ≥80%), Playwright mock; e `test:e2e:real` local quando a mudança toca integração.

## 7. Referências

- [ADR-0010](../adr/0010-contrato-remote-shell.md) — contrato de integração metrics ↔ shell (a base desta US).
- [ADR-0005](../adr/0005-contrato-paginas-remote.md) — contrato de página remote (`theme?`, callbacks).
- [ADR-0009](../adr/0009-contrato-api-metrics.md) — contrato da API de métricas (T2 → T3), RBAC. O contrato REAL conferido no código do T2 está refletido em `src/services/metricsApi.ts` e nos handlers MSW.
- [ADR-0001](../adr/0001-arquitetura-microfrontend.md) — Module Federation.
- `eloo-shell/README.md` — passo-a-passo "Adding a new microfrontend" (o precedente do `login`).
