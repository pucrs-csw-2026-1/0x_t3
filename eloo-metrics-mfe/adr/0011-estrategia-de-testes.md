# ADR-0011: Estratégia de testes (unit, integração, E2E)

**Status:** Aceito **Criado em:** 2026-07-05 **Autor:** Grupo 0x

## Contexto

**Necessidade:** a rubrica premia **Funcionalidade (40%)** e **Integração T1/T2 (25%)** — robustez, cobertura de fluxos e de erros. Precisamos de uma estratégia de testes clara, com o que cobrir em cada nível e como o CI valida.

- **Restrição do E2E:** exercitar o front contra os backends reais (T1 + T2 + Ministack) no CI é possível, mas **lento e frágil**. Mockar é rápido e determinístico, ao custo de não pegar divergências reais do backend.

## Decisão

Pirâmide de testes em **três níveis**, todos rodando no CI (E2E com backend mockado), e um caminho separado de E2E contra backend real para validação local.

### 1. Unit — Vitest + React Testing Library

- Componentes, hooks e **lógica de formatação/estado**.
- Técnicas de caixa-preta (ADR-0007): partição de equivalência, valor-limite, transição de estado, cobertura de decisão.
- **Gate de cobertura ≥ 80%** (alinhado ao `0x_t2`).

### 2. Integração — Vitest + MSW (Mock Service Worker)

- `services/metricsApi.ts` e a camada de serviço contra o **contrato do T1/T2** ([ADR-0009](0009-contrato-api-metrics.md)): mapeamento snake_case ↔ camelCase, DTOs e **caminhos de erro** (401/403/404/422/5xx).
- **MSW** intercepta a rede e simula as respostas do backend — sem servidor real.

### 3. E2E — Playwright

- **Fluxos reais no browser**: login (T1) → dashboard → métrica (a partir da US-01).
- **No CI:** backend **mockado** (MSW ou `page.route` do Playwright) — rápido e determinístico.
- **Local / sob demanda:** script `test:e2e:real` roda contra **T1 + T2 reais** (docker-compose/Ministack) para validar o front-back de verdade.

### CI (GitHub Actions)

Jobs encadeados: **lint → format → typecheck → unit+integração (Vitest, cobertura ≥80%) → e2e (Playwright, mock)**. O E2E contra **backend real fica fora do PR gate** (execução local/nightly/manual), evitando CI lento e instável.

### Ferramentas

- **Vitest** + **@testing-library/react** + **jsdom** (unit/integração).
- **MSW** (mock de rede) para integração e para o E2E no CI.
- **Playwright** (`@playwright/test`) para E2E.

## Consequências

**Positivas**

- Cobertura em três níveis atende Funcionalidade e Integração da rubrica.
- CI **rápido e determinístico** (sem subir backends), com E2E ainda assim presente.
- Front-back real permanece **validável localmente** (`test:e2e:real`).

**Negativas / trade-offs**

- MSW no CI **não pega divergências reais** do backend — mitigado pelo E2E real local e pelos testes de contrato (ADR-0009).
- Exige manter os **mocks em sincronia** com o contrato do T2.

## Alternativas consideradas

- **Cypress** para E2E — descartado: Playwright é mais rápido e estável em CI (auto-wait, multi-browser embutido).
- **Backends reais no CI como gate padrão** — descartado: lento/frágil; vira job sob demanda.
- **Só testes unitários** — insuficiente para o critério de Integração (25%).
