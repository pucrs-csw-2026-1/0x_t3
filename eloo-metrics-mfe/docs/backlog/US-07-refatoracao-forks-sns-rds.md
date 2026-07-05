# US-07 — Refatoração dos forks: publisher SNS + Postgres via RDS

## História

Como **gestor (ADMIN/MANAGER)**, quero **que o dashboard reflita os dados reais e
atualizados dos eventos (inscrições, check-ins, certificações)**, para **confiar
nas métricas em vez de depender de dados simulados**.

> **Como (implementação):** refatorar os forks para publicar eventos de domínio
> em **SNS → SQS** e usar **Postgres via RDS** na Ministack — detalhado nos
> critérios abaixo e no ADR-0008.

## Contexto

**Fecha a integração assíncrona** projetada no T2 (lado produtor), para o
dashboard receber dados reais.

- **Toca os repositórios:** `0x-fork-avengers-t2` (Events) e
  `0x-fork-manifestbolo-t2` (Registration).
- **Versionamento:** nos forks, **não** no metrics-mfe.

**ADR relacionado**

- [ADR-0008 — Refatoração dos forks (SNS→SQS)](https://github.com/pucrs-csw-2026-1/0x_t3/blob/main/eloo-metrics-mfe/adr/0008-refatoracao-upstreams-sns-sqs.md)

## Critérios de aceite

- [ ] Cliente SNS (`@aws-sdk/client-sns`) em cada fork, isolado da camada de
      domínio, publicando **notificações leves** por domínio (`EventCreated`,
      `EventUpdated`, `EventStatusChanged`; `RegistrationConfirmed`,
      `RegistrationCancelled`, `CheckInPerformed`).
- [ ] Envelope de mensagem estável (`eventType`, `version`, `entityId`,
      `occurredAt`, `source`) publicado no tópico SNS do domínio.
- [ ] Módulo Terraform `rds/` provisiona Postgres na Ministack (:4566), uma
      instância/database por serviço; fork conecta via `DATABASE_URL`.
- [ ] `docker-compose.yml` do fork usa init-container Terraform (RDS + tópicos)
      no lugar do container Postgres próprio — um `docker compose up` sobe tudo.
- [ ] Fim-a-fim: mutação no fork → SNS → SQS → Metrics persiste → aparece no
      dashboard (substitui o `publisher` simulado do T2).
- [ ] Falha de publicação não quebra a resposta ao cliente (log + retry).

## Definition of Done

- [ ] Testes dos forks verdes; publicação coberta (sucesso e falha).
- [ ] Migrations Drizzle aplicam no Postgres do RDS.
- [ ] Docs de infra dos forks atualizadas.
- [ ] Prompts de IA relevantes registrados em `.ai_log/` do fork.
- [ ] Revisado em PR (GitFlow) nos repositórios dos forks.

## Dependências / bloqueadores

- Suporte a RDS na Ministack **confirmado**. Coordenação de contrato de evento
  com o consumidor T2. Independe do frontend (pode correr em paralelo).

## Metadados do board

- **ADR:** 0008
- **Responsável:** Grupo 0x
- **Entrega alvo:** 2026-07-07
- **Labels sugeridas:** `tipo:infra`, `area:integracao-t2`, `prioridade:alta`
- **Branch (nos forks):** `feature/us-07-publisher-sns-rds`
