# ADR-0008: Refatoração dos upstreams (forks) para publicar em SNS → SQS alimentando o Metrics

**Status:** Aceito
**Criado em:** 2026-07-05
**Autor:** Grupo 0x

## Contexto

**Problema:** o dashboard (T3) precisa de dados **reais e atualizados** do
Metrics Service (T2), mas hoje não os recebe.

- **O consumo já existe:** o T2 projetou a ingestão assíncrona (SNS + SQS,
  fan-out por domínio — ADR-0001 v2.0 do T2). O fluxo previsto é:
  > upstream publica *notificação leve* no tópico SNS → Metrics consome via SQS
  > → consulta a API de origem → persiste no DynamoDB.
- **O produtor não existe:** os upstreams (Event Management, Registration) **não
  publicam** eventos de domínio. Sem publicação, o Metrics fica sem dados e o
  dashboard sem alimentação real.
- **Onde mexer:** os upstreams são **forks** do Grupo 0x — e **nenhum tem
  cliente SNS hoje**:

| Fork | Serviço | Stack | Papel na integração |
|------|---------|-------|---------------------|
| `0x-fork-avengers-t2` | Events API (Event Management) | Fastify 5 + Drizzle + PostgreSQL + `jose` | Publica eventos de ciclo de vida de evento/atividade |
| `0x-fork-manifestbolo-t2` | Registration | (a confirmar no fork) | Publica eventos de inscrição/check-in |

Nenhum dos dois hoje tem AWS SDK / cliente SNS.

## Decisão

Refatorar **cada fork** para publicar eventos de domínio em **SNS**, no mesmo
contrato que o Metrics (T2) espera consumir via **SQS**. Esta é uma decisão de
integração **de sistema**, registrada aqui por ser pré-requisito do dashboard;
a **implementação acontece nos repositórios dos forks**, não no
`eloo-metrics-mfe`.

### 1. Publicação de eventos (outbound)
- Adicionar um **cliente SNS** (`@aws-sdk/client-sns`) em cada fork, isolado
  numa camada de infraestrutura (ex.: `src/clients/` no avengers-fork),
  **sem** vazar para as regras de domínio.
- Em cada mutação de estado relevante, publicar uma **notificação leve** (não
  o payload completo) no **tópico SNS do domínio**, contendo pelo menos:
  `eventType`, `entityId`, `occurredAt`, e um ponteiro para a API de origem.
- Eventos por domínio (alinhados ao ADR-0001 do T2):
  - **Event Management** (avengers): `EventCreated`, `EventUpdated`,
    `EventStatusChanged`.
  - **Registration** (manifestbolo): `RegistrationConfirmed`,
    `RegistrationCancelled`, `CheckInPerformed`.
  - *(certificados/outros domínios ficam fora do escopo desta refatoração
    salvo decisão do usuário.)*

### 2. Contrato de mensagem e transporte
- **Formato:** JSON com envelope estável (`eventType`, `version`, `entityId`,
  `occurredAt`, `source`). Mudanças de contrato são versionadas.
- **Fan-out:** um tópico SNS por domínio; o Metrics assina com sua fila **SQS**
  (+ DLQ) — a assinatura/infra do lado consumidor **já existe** no T2
  (`infra/` do `0x_t2`, US-01). Esta refatoração cobre o **lado produtor**.
- **Idempotência/entrega:** o consumidor (T2) tolera reentrega e defasagem de
  segundos; os produtores publicam *at-least-once* e não bloqueiam a resposta
  ao cliente se a publicação falhar (log + retry/outbox, a definir com o
  usuário por fork).

### 3. Fluxo fim-a-fim resultante

```
[avengers-fork]  ──EventCreated──▶ SNS(topic:events) ─┐
[manifestbolo-fork] ─Registration─▶ SNS(topic:regs) ──┼─▶ SQS ─▶ ms-metrics (T2)
                                                       │         └─ consulta API origem
                                                       └────────────  persiste DynamoDB
                                                                         │
                                                          ms-metrics API ▼ (JWT/RBAC)
                                                                   metricsApi.ts (T3)
                                                                         │
                                                                eloo-metrics-mfe (dashboard)
```

### 4. Banco de dados dos forks — Postgres provisionado via RDS na Ministack
- Consolidar a infra de dev: em vez de cada fork subir seu próprio container
  `postgres:16-alpine`, o Postgres é **provisionado na Ministack compartilhada**
  (a mesma instância `:4566` que já serve DynamoDB/SNS/SQS) via **RDS**, por
  **Terraform** — no mesmo padrão com que o T2 provisiona seus recursos AWS.
- Um novo módulo Terraform `rds/` (`aws_db_instance`) cria **uma instância/
  database por serviço** (ex.: `events`, `registration`) — **database-per-service
  preservado**, agora sob a Ministack.
- Cada fork conecta via `DATABASE_URL` apontando para o endpoint da instância
  RDS emulada; **Drizzle continua dono do schema/migrations** de cada serviço
  (a Ministack provê o Postgres; a modelagem física é do fork).
- O `docker-compose.yml` do fork deixa de subir o container Postgres próprio e
  passa a depender de um **init-container Terraform** que provisiona o RDS na
  Ministack (espelhando os init-containers `terraform`/`seed` do compose do T2)
  → um único fluxo de subida para AWS + Postgres.
- **Pré-requisito — CONFIRMADO:** a build de Ministack em uso **suporta RDS com
  Postgres** (verificado na documentação da Ministack, 2026-07-05). O RDS sobe
  um Postgres real acessível por wire-protocol, ao qual o fork conecta via
  `DATABASE_URL`. *Fallback* histórico (container `postgres:16-alpine` dedicado)
  fica registrado apenas como plano B caso a infra mude.

### 5. Escopo de versionamento
- A refatoração dos forks é versionada **nos repositórios dos forks**
  (`0x-fork-avengers-t2`, `0x-fork-manifestbolo-t2`), cada um com seu próprio
  GitFlow/PR.
- O `eloo-metrics-mfe` (na raiz `0x_t3`) **não** contém esse código — apenas
  consome o resultado via `metricsApi.ts` ([ADR-0003](0003-integracao-apis-t1-t2.md)).
- Este ADR fica no T3 por documentar a decisão de integração que habilita o
  dashboard; pode ser espelhado/linkado nos forks.

## Consequências

**Positivas**
- Fecha a integração assíncrona projetada no T2 → o dashboard passa a exibir
  **dados reais e atualizados** (impacta diretamente Funcionalidade 40% e
  Integração 25% da rubrica).
- Desacoplamento: upstreams só publicam notificações; não conhecem o Metrics.
- Reaproveita a infra SQS/DynamoDB já provisionada no T2.
- **Infra de dev consolidada:** uma única Ministack + um `terraform apply`
  provisiona os serviços AWS (SNS/SQS/DynamoDB) **e** o Postgres (RDS) dos
  upstreams — um comando sobe tudo.

**Negativas / trade-offs**
- Introduz dependência de AWS (SNS) e complexidade operacional nos forks
  (credenciais, Ministack em dev).
- Adiciona um módulo Terraform `rds/` e acopla o dado relacional do fork à
  infra compartilhada (Ministack). Suporte a RDS já confirmado; ainda assim,
  concentra Postgres + AWS numa única instância de dev (ponto único de falha
  local).
- Requer **coordenação de contrato** entre 3 repositórios (2 produtores + T2).
  Mudança de envelope exige alinhamento com o consumidor.
- Tratamento de falha de publicação (outbox/retry) adiciona trabalho por fork.

## Alternativas consideradas

- **Polling do Metrics nas APIs de origem** — descartada: acopla o Metrics aos
  upstreams, gera carga e defasagem, e contraria o ADR-0001 v2 do T2.
- **Publicar payload completo no SNS** (em vez de notificação leve) —
  descartada: o T2 já decidiu por notificação + consulta à origem; manter o
  contrato existente.
- **Agregar no front (T3) direto das APIs dos upstreams** — descartada: o T3
  consome apenas o Metrics (ADR-0003); agregação é responsabilidade do T2.

## Pendências a decidir com o usuário

- Definir nomes/engine-version/portas das instâncias RDS por serviço
  (`events`, `registration`). *(Suporte a RDS/Postgres na Ministack já
  confirmado — 2026-07-05.)*
- Estratégia de confiabilidade por fork (outbox transacional vs. publish
  best-effort com retry).
- Nomes/ARNs definitivos dos tópicos e mapeamento exato evento→tópico.
- Se `CheckInPerformed`/certificados entram nesta iteração ou em US futura.
