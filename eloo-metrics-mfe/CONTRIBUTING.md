# Contribuindo — eloo-metrics-mfe

Guia de fluxo de trabalho do microfrontend de métricas (T3) da Eloo. Alinhado
aos [ADRs](adr/README.md), ao [CLAUDE.md](CLAUDE.md) e à rubrica de avaliação.

## GitFlow

```
main            produção — só recebe merge de dev via PR revisado
 └── dev        integração — só recebe merge de feature/* via PR
      └── feature/us-XX-<slug>   trabalho de cada User Story
```

- **Nunca** commitar direto em `main` ou `dev`.
- Branch de trabalho: `feature/us-XX-<slug-curto>` a partir de `dev` atualizada.
- `hotfix/<slug>` para correções urgentes a partir de `main`.
- Todo merge para `dev`/`main` é via **Pull Request** com revisão e CI verde.

## Conventional Commits

Formato: `<tipo>(escopo opcional): <descrição no imperativo>`

| Tipo | Uso |
|------|-----|
| `feat` | nova funcionalidade |
| `fix` | correção de bug |
| `docs` | documentação |
| `style` | formatação, sem mudança de comportamento |
| `refactor` | refatoração sem mudar comportamento |
| `test` | testes |
| `perf` | performance |
| `chore` | build, config, dependências |

Exemplos: `feat(dashboard): adiciona gráfico de série histórica de check-ins`,
`fix(metricsApi): trata 401 disparando sessionExpired`.

**Regras invioláveis:**
- **Nunca** incluir `Co-Authored-By: Claude` (ou variação). Commits são do
  Grupo 0x.
- **Nunca** usar `--no-verify` nem burlar hooks/CI.
- **Não** amendar commits já existentes — criar novo commit.

## User Stories e board

- Cada US vira uma **issue** no **GitHub Projects** (colunas To Do / In
  Progress / Done), com labels, responsável, data de entrega, critérios de
  aceite, Definition of Done e o **ADR vinculado** (ver
  [ADR-0007](adr/0007-processo-vv-e-gestao.md)).
- Numeração: `US 00`, `US 01`, ... na ordem acordada com o usuário.
- A skill [`/create-issue`](.claude/skills/create-issue/SKILL.md) redige o
  corpo padronizado; a criação no GitHub é feita **pelo usuário**.

## Gates antes do PR

- `npm run build` (`tsc -b` + build) sem erros de tipo.
- `npm run lint` limpo.
- Testes (`vitest`) verdes, com casos de erro/limite cobertos.
- Robustez verificada: loading, erro, vazio, sessão expirada.

## Definition of Done

Ver o checklist completo em
[ADR-0007 §4](adr/0007-processo-vv-e-gestao.md#4-definition-of-done-dod-de-cada-us).
