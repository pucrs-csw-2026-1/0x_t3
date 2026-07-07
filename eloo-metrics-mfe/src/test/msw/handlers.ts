import { http, HttpResponse } from "msw";

// Handlers base do MSW (ADR-0011). Espelham o CONTRATO REAL do Metrics Service
// T2 (ADR-0009), conferido contra o código do backend na US-06: shapes
// snake_case, envelopes reais (items/points/distribution/by_profile/entries) e
// o enum de status pt-BR. Testes específicos sobrescrevem via `server.use(...)`
// para cobrir vazio e caminhos de erro (401/403/404/422/5xx).
export const handlers = [
  // GET /metrics/events — itens com event_name/start_date/end_date (title e
  // janela da row #META, expostos pelo T2 na US-06) + event_type/status/counters.
  http.get("*/api/metrics/events", () =>
    HttpResponse.json({
      items: [
        {
          event_id: "evt_1",
          event_name: "Evento A",
          start_date: "2026-07-10",
          end_date: "2026-07-12",
          event_type: "palestra",
          status: "ativo",
          registered: 120,
          checked_in: 80,
          certified: 40,
        },
        {
          event_id: "evt_2",
          event_name: "Evento B",
          start_date: "2026-06-01",
          end_date: "2026-06-02",
          event_type: "workshop",
          status: "concluido",
          registered: 90,
          checked_in: 55,
          certified: 30,
        },
      ],
      page: 1,
      page_size: 20,
      total: 2,
    }),
  ),

  // GET /metrics/engagement — envelope {items: [...]}, um item POR EVENTO, com
  // a razão no campo `ratio` (não `rate`).
  http.get("*/api/metrics/engagement", () =>
    HttpResponse.json({
      items: [
        { event_id: "evt_1", registered: 120, checked_in: 80, ratio: 0.6667 },
        { event_id: "evt_2", registered: 90, checked_in: 55, ratio: 0.6111 },
      ],
    }),
  ),

  // US-03 — distribuições demográficas: envelope com MAPA chave→contagem
  // (`distribution`), não array. Chaves reais: faixas etárias canônicas,
  // gênero F|M|OUTRO|NAO_INFORMADO e "desconhecido" para os sem dado.
  http.get("*/api/metrics/by-age", () =>
    HttpResponse.json({
      dimension: "age",
      distribution: { "18-24": 40, "25-34": 75, "35-44": 30, desconhecido: 5 },
    }),
  ),
  http.get("*/api/metrics/by-gender", () =>
    HttpResponse.json({
      dimension: "gender",
      distribution: { F: 90, M: 70, OUTRO: 10, NAO_INFORMADO: 5 },
    }),
  ),
  http.get("*/api/metrics/by-city", () =>
    HttpResponse.json({
      dimension: "city",
      distribution: { "São Paulo": 120, "Rio de Janeiro": 80, Curitiba: 45 },
    }),
  ),
  // by-profile usa o envelope próprio `by_profile` (perfil → contagem).
  http.get("*/api/metrics/by-profile", () =>
    HttpResponse.json({ by_profile: { estudante: 60, professor: 100, externo: 17 } }),
  ),
  // hours/distribution: envelope `bands` com as 4 faixas fixas do T2 (US-15).
  http.get("*/api/metrics/hours/distribution", () =>
    HttpResponse.json({
      bands: { "0-1h": 120, "1-4h": 340, "4-8h": 210, "8h+": 75 },
      total_participants: 745,
      generated_at: "2026-07-06T12:00:00Z",
    }),
  ),
  // by-type: exige `bucket` (YYYY-MM) e devolve entries por tipo com counters —
  // a camada soma `registered` de todos os buckets do período.
  http.get("*/api/metrics/by-type", ({ request }) => {
    const bucket = new URL(request.url).searchParams.get("bucket");
    if (!bucket) return new HttpResponse(null, { status: 422 });
    return HttpResponse.json({
      bucket,
      entries: [
        { event_type: "workshop", registered: 70, checked_in: 40, certified: 20 },
        { event_type: "palestra", registered: 50, checked_in: 30, certified: 10 },
      ],
    });
  }),

  // US-05 — detalhe de evento + séries históricas. As rotas de taxa são mais
  // específicas que `/events/:eventId`, então ficam antes na ordem do MSW. As
  // taxas reais NÃO trazem numerador (só event_id/rate/registered/generated_at)
  // e `rate` vem null quando registered == 0.
  http.get("*/api/metrics/events/:eventId/checkin-rate", ({ params }) =>
    HttpResponse.json({
      event_id: params.eventId,
      rate: 0.68,
      registered: 1250,
      generated_at: "2026-07-06T12:00:00Z",
    }),
  ),
  http.get("*/api/metrics/events/:eventId/certification-rate", ({ params }) =>
    HttpResponse.json({
      event_id: params.eventId,
      rate: 0.336,
      registered: 1250,
      generated_at: "2026-07-06T12:00:00Z",
    }),
  ),
  http.get("*/api/metrics/events/:eventId", ({ params }) =>
    HttpResponse.json({
      event_id: params.eventId,
      event_name: "AI for Business 2026",
      start_date: "2026-01-15",
      end_date: "2026-06-30",
      event_type: "conferencia",
      status: "ativo",
      registered: 1250,
      checked_in: 850,
      certified: 420,
      generated_at: "2026-07-06T12:00:00Z",
    }),
  ),
  // Séries: envelope {granularity, points: [...]} — pontos {bucket, registered,
  // checked_in}.
  http.get("*/api/metrics/timeseries", () =>
    HttpResponse.json({
      granularity: "month",
      points: [
        { bucket: "2026-05", registered: 1080, checked_in: 720 },
        { bucket: "2026-06", registered: 1250, checked_in: 850 },
      ],
    }),
  ),
  http.get("*/api/metrics/series", () =>
    HttpResponse.json({
      granularity: "month",
      points: [
        { bucket: "2026-05", registered: 1080, checked_in: 720 },
        { bucket: "2026-06", registered: 1250, checked_in: 850 },
      ],
    }),
  ),
];
