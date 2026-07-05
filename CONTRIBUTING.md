# Contribuindo — 0x_t3 (eloo-metrics-mfe)

Guia de fluxo de trabalho do **microfrontend de métricas (T3)** da Eloo.
Alinhado aos [ADRs](eloo-metrics-mfe/adr/README.md), ao
[CLAUDE.md](eloo-metrics-mfe/CLAUDE.md) e à rubrica de avaliação.

> O código do projeto vive em [`eloo-metrics-mfe/`](eloo-metrics-mfe/). As demais
> pastas do repositório (forks e serviços) são referência/integração.

## GitFlow

Estrutura de branches: `main` ← `dev` ← `feature/*`.

```
main
└── dev
    └── feature/us-XX-<slug>
```

- **`main`** — produção; recebe merge de `dev` via Pull Request revisado.
- **`dev`** — integração; recebe merge de `feature/*` via Pull Request.
- **`feature/us-XX-<slug>`** — trabalho de cada User Story, criada a partir de
  `dev` atualizada.
- **`hotfix/<slug>`** — correção urgente, a partir de `main`.

Regras:

- **Nunca** commitar direto em `main` ou `dev`.
- Todo merge para `dev`/`main` é via **Pull Request** com revisão e CI verde.

## Conventional Commits

Formato: `<tipo>(escopo opcional): <descrição no imperativo>`

| Tipo       | Uso                                        |
| ---------- | ------------------------------------------ |
| `feat`     | nova funcionalidade                        |
| `fix`      | correção de bug                            |
| `docs`     | documentação                               |
| `style`    | formatação, sem mudança de comportamento   |
| `refactor` | refatoração sem mudar comportamento        |
| `test`     | testes                                     |
| `perf`     | performance                                |
| `chore`    | build, config, dependências                |

Exemplos:

- `feat(dashboard): adiciona gráfico de série histórica de check-ins`
- `fix(metricsApi): trata 401 disparando sessionExpired`

**Regras invioláveis:**

- **Nunca** incluir `Co-Authored-By: Claude` (ou variação). Commits são do
  Grupo 0x.
- **Nunca** usar `--no-verify` nem burlar hooks/CI.
- **Não** amendar commits já existentes — criar novo commit.
- Commits não-triviais levam **corpo descritivo** (bullets do que mudou e por
  quê) e `Refs #NN` para a US do board. Ver a skill
  [`/commit`](eloo-metrics-mfe/.claude/skills/commit/SKILL.md).

## User Stories e board

- Cada US vira uma **issue** no **GitHub Projects**
  (colunas **Backlog → Ready → In progress → In review → Done**), com labels,
  responsável, data de entrega, critérios de aceite, Definition of Done e o
  **ADR vinculado** (ver
  [ADR-0007](eloo-metrics-mfe/adr/0007-processo-vv-e-gestao.md)).
- Numeração: `US 00`, `US 01`, … na ordem acordada com o usuário.
- A skill [`/create-issue`](eloo-metrics-mfe/.claude/skills/create-issue/SKILL.md)
  redige o corpo padronizado; a criação no GitHub é feita **pelo usuário**.

## Gates antes do PR

Rodados localmente e no **CI (GitHub Actions)** — o PR só entra em `dev` com
tudo verde:

- `npm run build` (`tsc -b` + build) sem erros de tipo.
- `npm run lint` limpo (ESLint).
- `npm run format:check` limpo (Prettier).
- Testes (`vitest`) verdes, com casos de erro/limite cobertos.
- Robustez verificada: loading, erro, vazio, sessão expirada.

## Definition of Done

Ver o checklist completo em
[ADR-0007 §4](eloo-metrics-mfe/adr/0007-processo-vv-e-gestao.md#4-definition-of-done-dod-de-cada-us).
