# ADR-0010: Contrato de integração do remote mfeMetrics com o eloo-shell

**Status:** Aceito
**Criado em:** 2026-07-05
**Autor:** Grupo 0x

## Contexto

**Já definido:** o [ADR-0001](0001-arquitetura-microfrontend.md) fixou que o
metrics é um remote de Module Federation e o
[ADR-0005](0005-contrato-paginas-remote.md) fixou o contrato **de página** (prop
`theme`, callbacks).

**O que falta:** o contrato do **lado do host** — como o `eloo-shell` registra,
tipa, monta e protege o `mfeMetrics`.

Esse contrato **já existe e está implementado para o auth** (`mfe-auth`, remote
`login`), que serve de **precedente de referência**:

- `eloo-shell/src/shell/remotes.ts` → `login: "http://localhost:5174/assets/remoteEntry.js"`.
- `eloo-shell/src/vite-env.d.ts` → `declare module "login/LoginPage" { ... }` (um por página exposta, com props tipadas).
- `eloo-shell/src/routes.tsx` → páginas do shell que embrulham o remote via `RemoteSlot`, com o subtree `/admin` sob `<RequireManager>`.
- `eloo-shell/src/components/RequireManager.tsx` → gate de papel (ADMIN/MANAGER).
- `eloo-shell/README.md` → o passo-a-passo "Adding a new microfrontend".

O `mfeMetrics` deve espelhar esse mesmo contrato.

## Decisão

### 1. Identidade do remote
- Nome de federação: **`mfeMetrics`**, `filename: "remoteEntry.js"`.
- Servido (build+preview) em **`http://localhost:5176/assets/remoteEntry.js`**
  (portas do ADR-0001).
- Registrado no shell em `remotes.ts`:
  ```ts
  export const remotes: Record<string, string> = {
    login:   "http://localhost:5174/assets/remoteEntry.js",
    metrics: "http://localhost:5176/assets/remoteEntry.js",
  };
  ```
  (a chave curta `metrics` é o prefixo de import: `import("metrics/…")`.)

### 2. Superfície exposta (páginas)
Cada página de dashboard é exposta em `federation({ exposes })` do
`mfeMetrics` e segue o contrato de página (ADR-0005): recebe `theme?` e reporta
ações por callbacks (não navega sozinha). Conjunto **provisório** (finalizado
com as telas do Stitch — ADR-0006):

| Export | Componente | Props (contrato) |
|--------|-----------|------------------|
| `./DashboardPage` | visão geral (counters + gráficos) | `theme?`, `onSelectEvent?(eventId)` |
| `./EventMetricsPage` | detalhe de métricas de um evento | `theme?`, `eventId`, `onBack?()` |

> Nomes/props definitivos são fixados por US conforme as telas são desenhadas;
> qualquer adição atualiza **este ADR** e o `vite-env.d.ts` do shell juntos.

### 3. Tipagem ambiental no shell
Para cada página exposta, o shell adiciona um bloco em `vite-env.d.ts`
(mantendo o arquivo **sem `import`/`export` no topo**, senão os
`declare module` deixam de ser globais):
```ts
declare module "metrics/DashboardPage" {
  import type { Theme } from "@mui/material/styles";
  const DashboardPage: React.ComponentType<{
    theme?: Theme;
    onSelectEvent?: (eventId: string) => void;
  }>;
  export default DashboardPage;
}
```

### 4. Montagem no host
O shell cria uma página em `src/pages/` que faz `lazy(() => import("metrics/DashboardPage"))`,
embrulha em **`RemoteSlot`** (Suspense + error boundary), passa o **tema do
shell** (`src/theme/theme.ts`) e liga os callbacks ao `useNavigate` — idêntico
ao que já é feito para o `login`.

### 5. Roteamento e RBAC (lado do shell)
- As rotas de métricas ficam sob `/metrics` (provisório) e são **protegidas**:
  usuário não autenticado → `/login`.
- **Gate de papel:** as telas de métricas são montadas sob **`RequireManager`**
  (ADMIN/MANAGER), espelhando o RBAC do T2 ([ADR-0009](0009-contrato-api-metrics.md)):
  admin vê tudo, manager vê seu escopo. Participantes não acessam os dashboards
  de gestão nesta fase.
  ```tsx
  <Route element={<RequireManager />}>
    <Route path="/metrics" element={<MetricsDashboardPage />} />
    <Route path="/metrics/eventos/:eventId" element={<EventMetricsPage />} />
  </Route>
  ```
- O gate do shell é **UX-level**; a autorização real continua no T2 (403 por
  escopo). Os dois níveis são intencionais e coerentes.
- **Navegação:** o `Header` do shell ganha uma entrada "Métricas" visível para
  ADMIN/MANAGER.

### 6. Dependências compartilhadas
- `mfeMetrics` declara em `shared` **exatamente** a mesma lista do shell e do
  `mfe-auth`: `react`, `react-dom`, `react-router-dom`, `@mui/material`,
  `@emotion/react`, `@emotion/styled`.
- **`@mui/x-charts` NÃO entra em `shared`** — é usado só pelo metrics, então é
  empacotado no próprio remote (evita impor a dependência ao shell). Se um dia
  outro remote precisar de gráficos, promover a `shared` nos dois lados (novo
  ADR/ajuste).

## Consequências

**Positivas**
- Integração com o shell segue um caminho **já validado** (o auth), com os 6
  passos do `eloo-shell/README.md` → baixo risco.
- Isolamento de falha (`RemoteSlot`) e tema unificado sem bundle duplicado.
- RBAC coerente ponta-a-ponta (gate no shell + escopo no T2).

**Negativas / trade-offs**
- Toda página nova exige tocar **dois repositórios** (expose no metrics +
  `vite-env.d.ts`/rota no shell) de forma sincronizada.
- O shell precisa estar ciente das portas/URL do remote (config por ambiente).

## Pendências a decidir com o usuário

- Caminho base das rotas (`/metrics`?) e nomes/props definitivos das páginas
  expostas (dependem das telas do Stitch).
- Se **participantes** terão alguma visão de métricas (hoje: não; só
  ADMIN/MANAGER via `RequireManager`) ou se haverá um gate próprio.
- URL do remote por ambiente (dev/preview/produção) no `remotes.ts`.

## Alternativas consideradas

- **Montar métricas como página nativa do shell** (sem remote) — descartada:
  fere o ADR-0001 (deploy/versionamento independentes).
- **Gate de acesso dentro do remote** — descartada: contraria o ADR-0005
  (proteção de rota é do host); o remote não conhece o router do shell.
