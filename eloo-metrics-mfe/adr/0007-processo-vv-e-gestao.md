# ADR-0007: Processo de V&V, commits e gestão de tarefas

**Status:** Aceito
**Criado em:** 2026-07-05
**Autor:** Grupo 0x

## Contexto

**Rubrica:** o projeto é avaliado por uma rubrica com pesos explícitos:

| Critério | Peso |
|----------|------|
| Funcionalidade | 40% |
| Integração com APIs (T1/T2) | 25% |
| Documentação (código + **board de gestão**) | 20% |
| Apresentação | 10% |
| Uso Crítico de IA | 5% |

**Objetivo:** este ADR fixa o **processo** que faz o projeto atingir os níveis
"Bom/Excelente" da rubrica, e vira a referência dos agentes de verificação e das
skills.

## Decisão

### 1. Gestão de tarefas — GitHub Projects (Documentação, 20%)
- Board no **GitHub Projects** com colunas **To Do / In Progress / Done**.
- Cada trabalho é uma **User Story** numerada (`US 00`, `US 01`, ...) registrada
  como **issue** com: **labels**, **responsável**, **data de entrega**,
  **critérios de aceite** e **Definition of Done**.
- Issues vinculam o **ADR** que motivou a decisão e registram **bloqueadores**
  e **dependências**.
- Histórico de iterações e mudanças de escopo fica visível no board (evidência
  de planejamento iterativo — nível "Excelente" da rubrica).
- A skill [`/create-issue`](../.claude/skills/create-issue/SKILL.md) gera o
  corpo padronizado; **quem cria a issue no GitHub é o usuário**, o agente só
  redige.

### 2. Git e commits (base de Funcionalidade e Documentação)
- **GitFlow:** `main` ← `dev` ← `feature/us-XX-<slug>` (ver
  [CONTRIBUTING.md](../CONTRIBUTING.md)).
- **Conventional Commits:** `feat`, `fix`, `docs`, `style`, `refactor`,
  `test`, `chore`, `perf`. Mensagem `<tipo>(escopo?): <descrição>`.
- **Nunca** `Co-Authored-By: Claude` (commits são do Grupo 0x); **nunca**
  `--no-verify`; **nunca** commit direto em `main`/`dev`; **não** amendar.
- A skill [`/commit`](../.claude/skills/commit/SKILL.md) padroniza a mensagem.

### 3. Verificação & Validação (Funcionalidade 40% + Integração 25%)
- **Verificação de arquitetura:** o subagent
  [`architecture-guard`](../.claude/agents/architecture-guard.md) checa o
  contrato de remote (ADR-0005), a camada de serviço (ADR-0003), fronteiras de
  pastas e dependências `shared`.
- **Verificação de qualidade/robustez:** o subagent
  [`vv-check`](../.claude/agents/vv-check.md) checa tratamento de
  loading/erro/vazio/sessão-expirada, acessibilidade básica, i18n pt-BR e
  cobertura de testes contra a **Definition of Done**.
- **Testes:** Vitest + React Testing Library; técnicas de teste de caixa-preta
  (partição de equivalência, valor-limite, transição de estado) para lógica de
  formatação/estado, e testes de caminhos de erro. Camada de serviço testada
  com `fetch` mockado/fake.
- **Gates:** `tsc -b` (type-check), `eslint`, testes verdes antes de PR. O
  agente não desliga/reduz gates para "passar".

### 4. Definition of Done (DoD) de cada US
Uma US só entra em **Done** quando:
- [ ] Requisito da US implementado e demonstrável no fluxo real.
- [ ] Integra a API correta (T1 e/ou T2) com auth e RBAC respeitados.
- [ ] Trata loading, erro, vazio e sessão expirada.
- [ ] Textos em pt-BR; números/datas formatados com locale pt-BR.
- [ ] `tsc`, lint e testes passam; casos de erro/limite cobertos.
- [ ] Contrato de remote (ADR-0005) respeitado.
- [ ] Docs atualizadas (README/uso) quando aplicável.
- [ ] Prompts de IA relevantes registrados (ver item 5).

### 5. Uso Crítico de IA (5%)
- Prompts e iterações relevantes com IA são registrados em `.ai_log/`
  (JSON por data/autor), espelhando a convenção do repositório raiz.
- O log evidencia **revisão crítica**: o que foi aceito, o que foi ajustado e
  por quê — não apenas o output aceito cegamente.

## Consequências

**Positivas**
- Cada critério da rubrica tem um mecanismo concreto (board, DoD, agentes,
  logs) → tende aos níveis "Bom/Excelente".
- Rastreabilidade decisão↔tarefa↔commit↔ADR.

**Negativas / trade-offs**
- Processo mais cerimonioso; exige constância no board e nos logs de IA. É
  intencional — a rubrica pontua justamente essa disciplina.

## Alternativas consideradas

- **Board em Trello/Asana** — permitido pela rubrica, mas **GitHub Projects**
  mantém issues, board, PRs e ADRs no mesmo lugar (rastreabilidade).
- **Sem DoD formal** — descartada: a rubrica premia edge cases e consistência,
  que a DoD torna verificáveis.
