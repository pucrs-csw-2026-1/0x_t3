---
name: commit
description: Cria um commit no padrão Conventional Commits a partir do que está staged neste repositório (eloo-metrics-mfe), confirmando a mensagem com o usuário antes de commitar. Nunca inclui Co-Authored-By, nunca usa --no-verify, nunca commita em main/dev, nunca amenda.
---

# /commit — commit padronizado (Conventional Commits)

Cria um commit seguindo o [CONTRIBUTING.md](../../../CONTRIBUTING.md) e o
[ADR-0007](../../../adr/0007-processo-vv-e-gestao.md).

## Passos

1. **Verificar contexto**
   - `git branch --show-current` — se for `main` ou `dev`, **pare** e avise o
     usuário: trabalho deve estar em `feature/us-XX-<slug>`. Não commite.
   - `git status` e `git diff --staged` — se **nada** estiver staged, mostre os
     arquivos modificados e pergunte o que incluir (não faça `git add -A`
     silenciosamente).

2. **Analisar o que está staged** e propor **um** commit coeso. Se o staged
   misturar mudanças não relacionadas, sugira separar em commits distintos.

3. **Montar a mensagem** no formato:
   ```
   <tipo>(escopo opcional): <descrição no imperativo, em pt-BR>
   ```
   - Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `perf`, `chore`.
   - Escopo sugerido: `dashboard`, `metricsApi`, `authApi`, `charts`, `theme`,
     `federation`, `adr`, `backlog`, `ai-log`, `docs`...
   - **Corpo obrigatório para commits não-triviais:** liste em bullets *o que*
     mudou e o *porquê* — o subject sozinho não basta. Subject curto sem corpo
     só para mudanças triviais de uma linha.
   - **Referencie as US/issues** com `Refs #NN` ao final quando o commit se
     relaciona a uma US do board.
   - **Separe mudanças não relacionadas** em commits distintos (ex.: `docs(...)`
     do código/docs e `chore(ai-log): ...` do log — nunca no mesmo commit).

4. **Confirmar com o usuário** a mensagem final **antes** de commitar.

5. **Commitar** com `git commit -m "..."` (sem flags de bypass).

## Regras invioláveis

- **NUNCA** adicionar `Co-Authored-By: Claude` nem qualquer coautoria de IA.
- **NUNCA** `--no-verify`, `--no-gpg-sign` ou burlar hooks/CI.
- **NUNCA** commitar em `main`/`dev`.
- **NÃO** amendar (`--amend`) commits existentes — criar novo commit.
- **NÃO** dar `git push` sem autorização explícita do usuário para aquela ação.

## Sempre incluir quando aplicável

- **Log de IA:** commite o `.ai_log/` da sessão (evidência de uso crítico de IA,
  ADR-0007) em commit próprio `chore(ai-log): ...`, separado de código/docs.
- **Remoção de legado:** apague no mesmo commit os arquivos/pastas que a mudança
  torna obsoletos; não deixe código morto para trás.

## Exemplos

Trivial (só subject):
- `fix(metricsApi): trata 403 do RBAC com mensagem de sem permissão`
- `docs(adr): registra ADR-0004 sobre MUI X Charts`

Não-trivial (com corpo + `Refs`) — **padrão preferido**:

    docs(backlog): revisa US do board após revisão de escopo

    - US-01 vira esqueleto ambulante (login → 1 métrica real na tela)
    - Contexto das US em bullet points; links de ADR com título descritivo

    Refs #1 #2 #3
