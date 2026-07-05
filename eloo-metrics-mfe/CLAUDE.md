# CLAUDE.md — Diretrizes para o agente neste repositório

Este arquivo define o comportamento esperado do agente (Claude Code) ao
trabalhar no **microfrontend de métricas** (T3) da plataforma Eloo
(Grupo 0x — PUCRS 2026/1). Estas regras têm precedência sobre comportamentos
padrão do agente.

---

## 1. Autonomia: decisão é sempre do usuário

- O agente **NUNCA** decide arquitetura, escopo, dependências, mudanças
  estruturais, padrões de código, escolha de bibliotecas, contratos de API,
  modelagem de telas ou estratégia de testes. Toda decisão é do usuário.
- Diante de qualquer ambiguidade, alternativa viável ou ponto não coberto por
  ADR/CONTRIBUTING/CLAUDE.md, o agente **pergunta antes de agir**
  (`AskUserQuestion` quando apropriado).
- O agente **não** propõe refatorações, abstrações ou "cleanups" não
  solicitados. Faz o que foi pedido, no escopo pedido.
- O agente **não** executa ações destrutivas ou de alto impacto (push,
  force-push, rebase em branch compartilhada, delete de branch, deploy,
  criação de PR/issue, alteração de CI) sem confirmação explícita para aquela
  ação específica. Aprovação de uma ação não se estende a outras.

## 2. Contexto do projeto

`eloo-metrics-mfe` é a interface de **métricas/analytics** de eventos da Eloo.
É um **microfrontend remote** montado pelo `eloo-shell` via Module Federation.

| Camada | Projeto | Papel |
|--------|---------|-------|
| **T1** | `0x_t1` (`ms-auth`, :8080) | Autenticação OAuth2 + JWT, perfil, RBAC |
| **T2** | `0x_t2` (`ms-metrics`) | API de métricas (read-mostly), JWKS + RBAC |
| **T3** | `eloo-metrics-mfe` | **Este projeto** — dashboards, remote do shell |
| host | `eloo-shell` (:5173) | Monta os remotes, dono do layout/tema |
| upstream | `0x-fork-avengers-t2` | Events API (fork) — passa a publicar em SNS |
| upstream | `0x-fork-manifestbolo-t2` | Registration (fork) — passa a publicar em SNS |

**Versionamento:** a referência de git é o **repositório raiz `0x_t3`**
(GitHub: `pucrs-csw-2026-1/0x_t3`), que versiona a pasta `eloo-metrics-mfe/`.
Este não é um repositório aninhado. O trabalho do agente neste projeto se
concentra na pasta `eloo-metrics-mfe/`; a refatoração dos upstreams
([ADR-0008](adr/0008-refatoracao-upstreams-sns-sqs.md)) é versionada nos
**repositórios dos forks**, não aqui.

**Fluxo de dados do dashboard:** os forks publicam eventos de domínio em
**SNS → SQS**, o Metrics (T2) consome e persiste, e o T3 lê a API do Metrics via
`metricsApi.ts`. Fechar a publicação nos forks (ADR-0008) é pré-requisito para o
dashboard exibir dados reais.

## 3. Stack técnica (fixada pelos ADRs)

Definida em [adr/0002-stack-tecnica.md](adr/0002-stack-tecnica.md) e **não**
renegociável pelo agente:

- **Vite 5** + **React 18** + **TypeScript 5**.
- **MUI 6** (`@mui/material`, `@mui/icons-material`) + **Emotion** — componentes
  e tema (Material Design).
- **TailwindCSS 3** — apenas layout utilitário (tokens espelham o `DESIGN.md`).
- **react-router-dom 6**; **@originjs/vite-plugin-federation** (modo remote).
- **@mui/x-charts** — gráficos ([adr/0004](adr/0004-biblioteca-graficos.md)).

Mudar stack, biblioteca ou padrão arquitetural exige **novo ADR aprovado pelo
usuário** antes de qualquer linha de código. Dependências `shared` da federação
mudam **nos dois lados** (este remote e o shell).

ADRs de referência:
- [0001](adr/0001-arquitetura-microfrontend.md) — Module Federation (remote `mfeMetrics`).
- [0002](adr/0002-stack-tecnica.md) — Stack Vite/React/TS/MUI/Tailwind.
- [0003](adr/0003-integracao-apis-t1-t2.md) — Integração APIs T1 (auth) + T2 (metrics).
- [0004](adr/0004-biblioteca-graficos.md) — MUI X Charts.
- [0005](adr/0005-contrato-paginas-remote.md) — Contrato de remote + i18n pt-BR.
- [0006](adr/0006-fluxo-design-stitch.md) — Fluxo de design Stitch → MUI.
- [0007](adr/0007-processo-vv-e-gestao.md) — V&V, commits, gestão de tarefas.
- [0008](adr/0008-refatoracao-upstreams-sns-sqs.md) — Refatoração dos forks (SNS→SQS) que alimenta o dashboard.
- [0009](adr/0009-contrato-api-metrics.md) — Contrato da API de métricas (T2→T3): endpoints, DTOs, RBAC, erros.
- [0010](adr/0010-contrato-remote-shell.md) — Contrato de integração do remote mfeMetrics com o eloo-shell.

## 4. Arquitetura e contrato de páginas

- Estrutura de pastas prevista:
  ```
  src/
    pages/            uma tela por arquivo, cada uma exposta como remote
    components/       UI compartilhada
    components/charts/ gráficos MUI X reutilizáveis (não fazem fetch)
    services/         authApi.ts (reuso T1) + metricsApi.ts (único acesso a T2)
    theme.ts          tema MUI próprio (usado standalone)
    App.tsx           router standalone (só quando roda sozinho)
  ```
- **Toda chamada de rede** passa pela camada `services/` — componentes nunca
  fazem `fetch` direto.
- Cada página exposta segue o **contrato de remote** (ADR-0005): recebe
  `theme?: Theme`, reporta ações por **callbacks** (não navega sozinha), e não
  gerencia sessão internamente.
- Proteção de rota e roteamento são do **host** (shell), não do remote.
- Verificado pelo subagent **`architecture-guard`** (ver seção 7).

## 5. Integração com APIs (T1 + T2)

- Auth (**T1**) é **reutilizada**, não reimplementada: tokens no storage
  `mfeAuth.*`, evento `mfeAuth:sessionExpired` para expiração.
- Métricas (**T2**) só via `services/metricsApi.ts`, com
  `Authorization: Bearer <token>` e RBAC respeitado.
- Requisições vão para `/api` (métricas) e `/auth-api` (auth) na **própria
  origem** (`new URL(import.meta.url).origin`), proxied server-to-server no
  `vite.config.ts` (contorno de CORS — ver ADR-0003).
- **Sempre** tratar loading, erro, vazio e sessão expirada. Textos em pt-BR;
  números/datas com locale `pt-BR`.

## 6. Testes e V&V

- **Vitest** + **React Testing Library**.
- Técnicas de caixa-preta para lógica de formatação/estado: partição de
  equivalência, valor-limite, transição de estado; e **testes de caminhos de
  erro**. Camada de serviço testada com `fetch` mockado/fake.
- Gates antes de PR: `tsc -b`, `eslint`, testes verdes. O agente **não**
  desliga/reduz gates para "passar" — corrige o código ou o teste.
- Robustez (loading/erro/vazio/sessão) e a **Definition of Done** (ADR-0007)
  são verificadas pelo subagent **`vv-check`**.

## 7. Agentes e skills do projeto

**Subagents** (`.claude/agents/`, delegáveis, read-only por padrão):
- **`architecture-guard`** — verifica contrato de remote, camada de serviço,
  fronteiras de pastas e `shared`. Reporta violações; não corrige sozinho.
- **`vv-check`** — verifica robustez (loading/erro/vazio/sessão), i18n,
  acessibilidade básica e a DoD contra o diff.

**Skills** (`.claude/skills/<nome>/SKILL.md`, invocáveis por `/<nome>`):
- **`/commit`** — cria commit em Conventional Commits a partir do que está
  staged, confirmando a mensagem. Nunca `Co-Authored-By: Claude`, nunca
  `--no-verify`, nunca commita em `main`/`dev`, nunca amenda.
- **`/create-issue`** — redige o corpo de uma User Story/issue no padrão do
  board (labels, responsável, critérios de aceite, DoD, ADR vinculado). **Não**
  cria a issue no GitHub — isso é do usuário.

O agente **não** cria novos agentes/skills sem aprovação explícita do usuário.

## 8. Git e gestão de tarefas

- **GitFlow:** `main` ← `dev` ← `feature/us-XX-<slug>` (ver
  [CONTRIBUTING.md](../CONTRIBUTING.md)). Nunca commitar direto em `main`/`dev`.
- **Conventional Commits**, sem `Co-Authored-By: Claude`.
- Cada trabalho é uma **User Story** (`US 00`, `US 01`, ...) registrada como
  **issue** no **GitHub Projects** (To Do / In Progress / Done), com labels,
  responsável, data, critérios de aceite, DoD e ADR vinculado.
- O agente **não** abre PRs nem cria issues por conta própria — apenas auxilia
  a redigir quando solicitado.

## 9. Uso Crítico de IA

- Prompts e iterações relevantes com IA são registrados em `.ai_log/`
  (ver [.ai_log/README.md](.ai_log/README.md)), evidenciando **revisão
  crítica**: o que foi aceito, o que foi ajustado e por quê.

## 10. Resumo operacional (checklist do agente)

Antes de qualquer ação não-trivial, verificar:

- [ ] A decisão foi tomada pelo usuário (não pelo agente)?
- [ ] A ação está coberta pelos ADRs vigentes e pelo CONTRIBUTING.md?
- [ ] A User Story existe como issue e está priorizada no board?
- [ ] O código respeita o contrato de remote (ADR-0005) e a camada de serviço?
- [ ] Integração com T1/T2 trata auth, RBAC, loading, erro e sessão expirada?
- [ ] Textos em pt-BR; números/datas com locale pt-BR?
- [ ] `tsc`, lint e testes passam, com casos de erro/limite cobertos?
- [ ] O commit segue Conventional Commits, sem `Co-Authored-By: Claude`?
- [ ] A ação **não** é destrutiva ou foi explicitamente autorizada?

Em dúvida em qualquer item: **perguntar ao usuário**.
