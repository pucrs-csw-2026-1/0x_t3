# Handoff — integração do metrics (US-06 validação real → US-07 shell)

> Documento de passagem de sessão. A integração foi dividida em duas US, nesta ordem:
>
> 1. **US-06 — Validação da integração real (front ↔ T2):** exercitar TODAS as telas contra o T2 real (o dev roda em mock hoje) e corrigir divergências. Critérios em [`backlog/US-06-validacao-integracao-real.md`](backlog/US-06-validacao-integracao-real.md).
> 2. **US-07 — Integração no shell:** montar o metrics como remote no `eloo-shell` (Module Federation), conforme o [ADR-0010](../adr/0010-contrato-remote-shell.md) — passo a passo abaixo.

## 1. Estado atual (o que já está pronto)

- **Frontend do metrics (US-00 a US-05) — CONCLUÍDO e mesclado em `dev`+`main`:** scaffold + CI, esqueleto ambulante, dashboard (visão geral adaptável por papel), catálogo de eventos, distribuições demográficas, detalhe de evento + séries.
- **O metrics já roda standalone** (`:5177`) com **modo mock** (`.env.development` tem `VITE_USE_MOCKS=true`) e com **T2 real** (`VITE_USE_MOCKS=false`). Validado rodando real (mostrou 50 eventos do seed).
- **O `vite.config.ts` do metrics já EXPÕE as 4 páginas** (federation `exposes`), prontas para o shell consumir:
  - `./DashboardPage`, `./EventCatalogPage`, `./DemographicsPage`, `./EventMetricsPage`.
- **O `eloo-shell` AINDA NÃO tem o metrics registrado** — `src/shell/remotes.ts` só tem `login`. O git do shell está em "functional shell" (landing + auth funcionando). **Essa é a lacuna que a US-06 preenche.**
- Board #14 "0x Metrics MFE T3": US-00..US-05 = Done; pendentes: **US-06 (validação real), US-07 (shell), US-08 (refatoração forks), US-09 (docs).**

## 2. US-06 (validação real) primeiro, depois US-07 (shell)

**US-06 — validar a integração real:** antes de plugar no shell, rodar com `VITE_USE_MOCKS=false` + T1/T2 no ar, abrir cada tela (dashboard, catálogo, distribuições, detalhe) e corrigir no `metricsApi.ts` as divergências entre o mock e o contrato real do T2 (ADR-0009). Só a US-01 foi validada real até aqui. Critérios: [`backlog/US-06-validacao-integracao-real.md`](backlog/US-06-validacao-integracao-real.md).

**US-07 — integrar no shell (passo a passo, ADR-0010):** toca principalmente o repositório **`eloo-shell`** (repo próprio). O metrics já está pronto do lado dele.

1. **Servir o metrics como remote:** no `eloo-metrics-mfe`, `npm run serve:remote` → build + preview em **`:5176`** (gera `remoteEntry.js`). O dev server (`:5177`) NÃO gera `remoteEntry.js`; o shell consome o build.
2. **Registrar o remote no shell** — `eloo-shell/src/shell/remotes.ts`:
   ```ts
   export const remotes: Record<string, string> = {
     login:   "http://localhost:5174/assets/remoteEntry.js",
     metrics: "http://localhost:5176/assets/remoteEntry.js",
   };
   ```
3. **Tipos ambientais** — `eloo-shell/src/vite-env.d.ts`: adicionar um bloco `declare module "metrics/<Página>"` por página exposta (mantendo o arquivo sem `import`/`export` no topo). Props conforme o contrato (ADR-0005): `theme?`, callbacks (`onSelectEvent`, `onBack`), `eventId` no detalhe.
4. **Montar no host** — criar página(s) em `eloo-shell/src/pages/` que fazem `lazy(() => import("metrics/DashboardPage"))`, embrulham em `RemoteSlot` (Suspense + error boundary), passam o **tema do shell** e ligam callbacks ao `useNavigate`. Espelhar como o `login` já é montado.
5. **Rotas + RBAC** — `eloo-shell/src/routes.tsx`: rotas de métricas sob `<RequireManager>` (ADMIN/MANAGER):
   ```tsx
   <Route element={<RequireManager />}>
     <Route path="/metrics" element={<MetricsDashboardPage />} />
     <Route path="/metrics/eventos" element={<EventCatalogPage />} />
     <Route path="/metrics/eventos/:eventId" element={<EventMetricsPage />} />
     <Route path="/metrics/distribuicoes" element={<DemographicsPage />} />
   </Route>
   ```
6. **Navegação** — adicionar entrada "Métricas" no `Header`/menu do shell para ADMIN/MANAGER.
7. **Shared deps** — a lista `shared` do metrics já bate com a do shell (`react`, `react-dom`, `react-router-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`). **`@mui/x-charts` NÃO é shared** (fica no bundle do metrics). Qualquer nova dep shared muda nos dois lados.
8. **Sessão/token** — no shell, tudo é a **mesma origem** (`:5173`), então o token que o remote de auth grava (`mfeAuth.accessToken`) é lido pelo remote de metrics automaticamente. O `DashboardPage` usa `getStoredProfile()` para escopo (admin global / manager escopo). Não precisa de gambiarra de token como no standalone.

## 3. Como rodar tudo (portas)

| Serviço | Comando (na pasta) | Porta |
| --- | --- | --- |
| **metrics standalone (mock)** | `eloo-metrics-mfe` → `npm run dev` | `:5177` |
| **metrics como remote** (p/ shell) | `eloo-metrics-mfe` → `npm run serve:remote` | `:5176` |
| **auth como remote** (p/ shell) | `eloo-auth-mfe` → `npm run serve:remote` | `:5174` |
| **shell** | `eloo-shell` → `npm run dev` | `:5173` |
| **auth standalone** (só visual) | `eloo-auth-mfe` → `npm run dev` | `:5175` |

Para testar a US-06 integrada: subir **auth remote (:5174)** + **metrics remote (:5176)** + **shell (:5173)**, logar no shell e navegar até Métricas.

### Ver o metrics com dados REAIS (T2)
1. Em `eloo-metrics-mfe/.env.development`, trocar para `VITE_USE_MOCKS=false`.
2. Subir T1 (`0x_t1`) e T2 (`0x_t2`) — ver gotchas abaixo.
3. Logar (token no storage) e **desativar o uBlock para localhost**.

## 4. Gotchas (aprendidos na marra)

- **Terraform do T2 falha com "timeout while waiting for plugin to start":** é **cache de provider antigo**. `rm -rf 0x_t2/infra/terraform/.terraform 0x_t2/infra/terraform/.terraform.lock.hcl` e re-rodar. O timeout é intermitente — se voltar, tentar de novo.
- **Não deixe o `docker compose up seed`/`up backend` re-disparar o terraform** (ele derruba o backend ao falhar). Depois que as tabelas existem: seed com `docker compose run --rm --no-deps seed`; backend com `docker compose up -d --no-deps backend`.
- **uBlock Origin / ad blockers bloqueiam `/api/metrics/...`** (a palavra "metrics" é tratada como analytics) → **NetworkError**. Desativar para localhost. (O tratamento de erro do app lida bem: mostra "Tentar novamente".)
- **Standalone: cada MFE tem localStorage por origem.** Logar no auth `:5175` NÃO autentica o metrics `:5177`. Só o **shell** unifica a sessão (mesma origem). Para ver o metrics real standalone, injetar o token na origem do `:5177` (ou usar `public/dev-login.html`, atalho de dev — não commitar).
- **Seed sem participantes:** o pool de usuários do Auth pode estar vazio → counters (inscritos/check-ins) vêm 0, mas os eventos são reais. Rodar o seed-users do Auth (US-17 do T1) para números não-zerados.

## 5. Credenciais (seed local)

- **Admin:** `admin@local.dev` / `Admin@123` (escopo total).
- **Manager:** `manager@local.dev` / `Manager@123` (escopo de 10 eventos: evt_0000..evt_0009).

## 6. Processo (não esquecer)

- **GitFlow:** `main ← dev ← feature/*`. `main` e `dev` **protegidas** (5 checks de CI verdes + PR obrigatórios). Trabalhar em `feature/us-06-integracao-shell` a partir de `dev`.
- **CI** (`.github/workflows/ci.yml`): lint → format → typecheck → vitest (cobertura ≥80%) → e2e (Playwright, mock) → build. **A US-06 mexe no `eloo-shell`, que é outro repo** — verificar/ajustar o CI de lá se necessário.
- **sync-dev:** workflow mantém `dev` alinhada com `main` pós-release, via secret **`SYNC_TOKEN`** (PAT clássico; o fine-grained travou por precisar de aprovação da org).
- **Commits:** usar a skill **`/commit`** — Conventional Commits com **corpo descritivo** + `Refs #NN`, separar concerns, commitar `.ai_log` da sessão, **nunca** `Co-Authored-By: Claude`.
- **Markdown:** Prettier com `proseWrap: "never"` — **não quebrar prosa no meio da frase** (linha contínua).

## 7. Referências

- [ADR-0010](../adr/0010-contrato-remote-shell.md) — contrato de integração metrics ↔ shell (a base desta US).
- [ADR-0005](../adr/0005-contrato-paginas-remote.md) — contrato de página remote (`theme?`, callbacks).
- [ADR-0009](../adr/0009-contrato-api-metrics.md) — contrato da API de métricas (T2 → T3), RBAC.
- [ADR-0001](../adr/0001-arquitetura-microfrontend.md) — Module Federation.
- `eloo-shell/README.md` — passo-a-passo "Adding a new microfrontend" (o precedente do `login`).
