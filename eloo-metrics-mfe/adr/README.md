# Architecture Decision Records — eloo-metrics-mfe

Registro das decisões arquiteturais do **microfrontend de métricas** (T3) da
plataforma Eloo. Cada ADR documenta uma decisão, seu contexto, alternativas
consideradas e consequências. Decisões só mudam via **novo ADR aprovado pelo
usuário** — nunca por iniciativa do agente.

> Formato inspirado em [MADR](https://adr.github.io/madr/) e alinhado ao padrão
> dos repositórios irmãos ([`0x_t2/adr`](../../0x_t2/adr)).

## Índice

| ADR | Título | Status |
|-----|--------|--------|
| [0001](0001-arquitetura-microfrontend.md) | Arquitetura de microfrontend via Module Federation | Aceito |
| [0002](0002-stack-tecnica.md) | Stack técnica (Vite + React + TS + MUI + Tailwind) | Aceito |
| [0003](0003-integracao-apis-t1-t2.md) | Integração com APIs T1 (auth) e T2 (metrics) | Aceito |
| [0004](0004-biblioteca-graficos.md) | Biblioteca de gráficos: MUI X Charts | Aceito |
| [0005](0005-contrato-paginas-remote.md) | Contrato de páginas remote e i18n pt-BR | Aceito |
| [0006](0006-fluxo-design-stitch.md) | Fluxo de design Stitch → Material/MUI → código | Aceito |
| [0007](0007-processo-vv-e-gestao.md) | Processo de V&V, commits e gestão de tarefas | Aceito |
| [0008](0008-refatoracao-upstreams-sns-sqs.md) | Refatoração dos forks (avengers/manifestbolo) para publicar em SNS → SQS alimentando o Metrics | Aceito |
| [0009](0009-contrato-api-metrics.md) | Contrato da API de métricas (T2 → T3): endpoints, DTOs, RBAC, erros | Aceito |
| [0010](0010-contrato-remote-shell.md) | Contrato de integração do remote mfeMetrics com o eloo-shell | Aceito |

## Status possíveis

- **Proposto** — em discussão, ainda não vigente.
- **Aceito** — decisão vigente.
- **Superseado** — substituído por outro ADR (com link).
- **Depreciado** — não mais aplicável.

## Como adicionar um ADR

1. Copie a estrutura de um ADR existente (Status, Contexto, Decisão,
   Consequências, Alternativas consideradas).
2. Numere sequencialmente (`NNNN-slug-curto.md`).
3. Registre a decisão **com o usuário** — o agente não decide arquitetura.
4. Adicione a linha correspondente no índice acima.
