# ADR-0009: Contrato da API de métricas (T2 → T3)

**Status:** Aceito
**Criado em:** 2026-07-05
**Autor:** Grupo 0x

## Contexto

**Ponto de partida:** o [ADR-0003](0003-integracao-apis-t1-t2.md) definiu a
**abordagem** de integração (camada de serviço, proxy anti-CORS, auth,
tratamento de estados).

- **O que falta:** fixar o **contrato concreto** que o dashboard (T3) consome do
  Metrics Service (T2) — endpoints, parâmetros, semântica de RBAC, formato de
  resposta e mapeamento de erros.
- **Objetivo:** registrar esse contrato como a interface estável entre T2 e T3,
  para que `metricsApi.ts` e as telas sejam construídos sobre algo explícito e
  versionado.

> **Fonte de verdade** viva do contrato: o **OpenAPI/Swagger** gerado pelo
> FastAPI do T2 (`/docs`, `/openapi.json`). Este ADR fixa as **decisões** de
> como o T3 consome esse contrato; divergências de campo consultam o OpenAPI.

## Contrato observado (T2)

**Base:** todos os endpoints de leitura ficam sob o prefixo **`/metrics`**.
No T3 são alcançados via proxy como **`/api/metrics/...`** (ADR-0003).
**Auth:** `Authorization: Bearer <accessToken>` (JWT do T1, validado por JWKS).

### Endpoints de leitura consumidos pelo dashboard

| Método | Caminho | Parâmetros principais | Uso no dashboard |
|--------|---------|-----------------------|------------------|
| GET | `/metrics/events` | `start_date`, `end_date` (obrigatórios), `status`, `event_type`, `page` (≥1), `page_size` (1–200) | Lista de counters por evento (registered/checked_in/certified), paginada |
| GET | `/metrics/events/{event_id}` | — | Métricas de um evento |
| GET | `/metrics/events/{event_id}/checkin-rate` | — | Taxa de check-in do evento |
| GET | `/metrics/events/{event_id}/certification-rate` | — | Taxa de certificação do evento |
| GET | `/metrics/engagement` | janela (`start_date`+`end_date`) **ou** `event_id`; `type` opcional | Engajamento (checked_in/registered) |
| GET | `/metrics/hours` | filtros de janela/evento | Horas de participação |
| GET | `/metrics/hours/distribution` | idem | Distribuição de horas |
| GET | `/metrics/by-age` | `event_id`, `from`, `to` (buckets `YYYY-MM`) | Distribuição por faixa etária |
| GET | `/metrics/by-gender` | idem | Distribuição por gênero |
| GET | `/metrics/by-city` | idem | Distribuição por cidade |
| GET | `/metrics/by-profile` | idem | Distribuição por perfil de participante |
| GET | `/metrics/by-type` | filtros | Distribuição por tipo de evento |
| GET | `/metrics/participants/distribution` | filtros | Distribuição de participantes |
| GET | `/metrics/buckets/{bucket}` | `bucket` = `YYYY-MM`, `event_type` | Métricas de um mês |
| GET | `/metrics/series` | `granularity` (`month`…), `start_date`, `end_date` | Série agregada |
| GET | `/metrics/timeseries` | janela + granularidade | Série histórica |

> Endpoints `admin_*` (cache, counters, DLQ, reconcile, scope) são
> **operacionais/administrativos** do T2 e **não** fazem parte do contrato do
> dashboard nesta fase (fora de escopo salvo decisão do usuário).

### Semântica de RBAC (herdada do T2)

- O papel vem do JWT. **Admin** enxerga todos os eventos (`managed_events = "*"`).
- **Manager** só enxerga eventos do seu **escopo** (`managed_events` = lista). O
  backend aplica `enforce_scope_or_raise`: evento fora do escopo → **403**.
- O T3 **não** reimplementa a checagem de escopo — confia no backend e trata o
  `403` na UI.

## Decisão

1. **Espelhar o contrato numa camada tipada** (`src/services/metricsApi.ts`):
   uma função por família de endpoint, com **DTOs TypeScript** por resposta
   (`EventMetrics`, `EventMetricsList`, `EngagementResponse`,
   `DemographicDistribution`, `HoursDistribution`, `SeriesResponse`, ...).
2. **Mapeamento snake_case ↔ camelCase** na camada de serviço; as telas só veem
   camelCase. Campos desconhecidos são ignorados (tolerância a evolução aditiva
   do backend).
3. **Janelas obrigatórias respeitadas na UI:** `events` e `engagement` exigem
   período (ou `event_id`). A UI **sempre** envia um período (seletor de datas
   com default), evitando resposta vazia por falta de janela.
4. **Paginação:** `events` usa `page`/`page_size` (máx. 200). O
   `metricsApi.ts` expõe paginação explícita; a UI não assume "tudo numa
   página".
5. **Mapeamento de erros → UI** (complementa ADR-0003):

   | HTTP | Significado | Tratamento no T3 |
   |------|-------------|------------------|
   | 401 | sem token / token inválido | limpa sessão + `mfeAuth:sessionExpired` → host redireciona a `/login` |
   | 403 | endpoint de admin como manager, ou evento fora do escopo | mensagem "você não tem permissão para ver estas métricas" |
   | 404 | evento inexistente | estado "evento não encontrado" |
   | 422 | parâmetro inválido (bucket fora de `YYYY-MM`, intervalo de datas invertido) | erro de validação de filtro, sem quebrar a tela |
   | 5xx / rede | falha do serviço | `Alert` + "tentar novamente" |

6. **Versionamento do contrato:** o contrato é **de propriedade do T2**.
   Mudanças breaking são coordenadas entre T2 e T3; o T3 fixa os campos que
   consome e não depende de campos não documentados. O OpenAPI do T2 é a
   referência para conferência de campos.

## Consequências

**Positivas**
- Contrato explícito → `metricsApi.ts` e telas construídos sobre base estável;
  atende ao critério de Integração (25%) com tratamento de auth/RBAC/erros.
- DTOs tipados pegam divergências em tempo de compilação (`tsc`).
- Mapeamento de erros consistente cobre os casos que o T2 já testa (401/403/
  404/422 — ver coleção Bruno do T2).

**Negativas / trade-offs**
- Acopla o T3 ao formato de resposta do T2; mudança breaking do backend exige
  ajuste coordenado (mitigado por: ignorar campos desconhecidos + pinar só o
  consumido).
- O contrato aqui é um retrato datado; o OpenAPI do T2 permanece a fonte viva.

## Alternativas consideradas

- **Não documentar o contrato (ler direto do Swagger sempre)** — descartada:
  perde-se a decisão de como o T3 trata RBAC, janelas obrigatórias e erros, que
  é justamente o que impacta a rubrica.
- **Gerar cliente TS a partir do `openapi.json`** — possível evolução futura
  (ADR próprio); nesta fase, camada tipada manual dá controle sobre o mapeamento
  camelCase e o tratamento de erros.
