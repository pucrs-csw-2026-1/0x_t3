---
name: create-issue
description: Redige o corpo de uma User Story / issue do eloo-metrics-mfe no padrão do board GitHub Projects — labels, responsável, critérios de aceite, Definition of Done e ADR vinculado. Produz o texto (e, se o usuário pedir, o comando gh) mas NÃO cria a issue sozinho; a criação no GitHub é decisão do usuário.
---

# /create-issue — redige User Story / issue no padrão do board

Gera o corpo padronizado de uma US/issue conforme
[ADR-0007](../../../adr/0007-processo-vv-e-gestao.md) e o
[CONTRIBUTING.md](../../../../CONTRIBUTING.md). **O agente redige; quem cria a
issue no GitHub é o usuário.**

## Passos

1. **Coletar o essencial** (pergunte se faltar):
   - Número da US (`US 00`, `US 01`, ...) e título curto.
   - Objetivo (como usuário X, quero Y, para Z).
   - Qual API envolve: **T1 (auth)**, **T2 (metrics)** ou ambas.
   - ADR(s) relacionados.
   - Responsável e data de entrega alvo.
   - Dependências/bloqueadores conhecidos.

2. **Gerar o corpo** no template abaixo.

3. **Sugerir labels** (ver lista) e a branch `feature/us-XX-<slug>`.

4. **Não** rodar `gh issue create` por conta própria. Se o usuário pedir,
   ofereça o comando `gh` pronto para ele revisar e executar.

## Template

```markdown
# US-NN — <Título>

## História

Como **<papel>**, quero **<capacidade>** para **<benefício>**.

## Contexto

<1–3 frases. Link para ADR: adr/000X-....md>

## Critérios de aceite

- [ ] <comportamento observável e verificável 1>
- [ ] <comportamento observável e verificável 2>
- [ ] Integra a API <T1/T2> com auth e RBAC respeitados
- [ ] Trata loading, erro, vazio e sessão expirada
- [ ] Textos em pt-BR; números/datas com locale pt-BR

## Definition of Done

- [ ] `tsc`, `eslint` e `vitest` verdes (casos de erro/limite cobertos)
- [ ] Contrato de remote (ADR-0005) respeitado
- [ ] Docs/README atualizados quando aplicável
- [ ] Prompts de IA relevantes registrados em `.ai_log/`
- [ ] Revisado em PR (GitFlow) e aprovado

## Dependências / bloqueadores

- <ex.: depende da US-0X / endpoint do T2 disponível>

## Metadados do board

- **ADR:** adr/000X-....md
- **Responsável:** <nome>
- **Entrega alvo:** <aaaa-mm-dd>
- **Labels sugeridas:** <ver abaixo>
- **Branch:** feature/us-NN-<slug>
```

## Labels sugeridas

`tipo:feature`, `tipo:bug`, `tipo:docs`, `tipo:infra`,
`area:dashboard`, `area:integracao-t1`, `area:integracao-t2`,
`area:charts`, `area:design-stitch`,
`prioridade:alta|media|baixa`, `bloqueado`.

## Comando gh (opcional — para o usuário executar)

```bash
gh issue create \
  --title "US-NN — <Título>" \
  --body-file <arquivo.md> \
  --label "tipo:feature,area:integracao-t2,prioridade:alta"
# depois adicionar ao Project e definir responsável/data no board
```
