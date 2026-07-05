# US-07 — Documentação: README, diagrama arquitetural e board

## História
Como **avaliador/novo integrante**, quero **documentação completa e um board
organizado**, para **entender a arquitetura, rodar o projeto e acompanhar o
progresso**.

## Contexto
Atende diretamente o critério **Documentação (20%)** da rubrica (nível
Excelente: diagrama, fluxos, troubleshooting, board com histórico e ADRs
vinculados). ADR: [0007](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0007-processo-vv-e-gestao.md).

## Critérios de aceite
- [ ] `README.md` completo: visão geral, quickstart (dev/serve:remote), variáveis
      de ambiente, arquitetura, links para ADRs/CONTRIBUTING/CLAUDE.
- [ ] **Diagrama arquitetural** (forks → SNS/SQS → T2 → metricsApi → mfeMetrics →
      shell) em `docs/` (drawio/SVG).
- [ ] Fluxos de uso documentados (login → métricas; admin vs manager).
- [ ] Seção de **troubleshooting/FAQ** (CORS/proxy, remote não carrega, sessão
      expirada, Ministack/RDS).
- [ ] Board no **GitHub Projects** com To Do/In Progress/Done, labels,
      responsável, datas, ADRs vinculados e histórico de iterações.

## Definition of Done
- [ ] Documentação revisada e consistente com o código entregue.
- [ ] Board reflete o estado real das US (histórico visível).
- [ ] Prompts de IA relevantes registrados em `.ai_log/`.
- [ ] Revisado em PR (GitFlow) e aprovado.

## Dependências / bloqueadores
- Consolida o que foi entregue nas US anteriores; melhor fechar perto do fim.

## Metadados do board
- **ADR:** 0007
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:docs`, `prioridade:media`
- **Branch:** `feature/us-07-docs-diagrama-board`
