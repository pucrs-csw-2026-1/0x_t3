import { http, HttpResponse } from "msw";

// Handlers base do MSW (ADR-0011). Simulam o contrato do Metrics Service T2
// (ADR-0009). Testes específicos sobrescrevem via `server.use(...)` para cobrir
// vazio e caminhos de erro (401/403/404/422/5xx).
export const handlers = [
  http.get("*/api/metrics/events", () =>
    HttpResponse.json({
      items: [
        {
          event_id: "evt_1",
          event_name: "Evento A",
          status: "active",
          start_date: "2026-07-10",
          end_date: "2026-07-12",
          registered: 120,
          checked_in: 80,
          certified: 40,
        },
        {
          event_id: "evt_2",
          event_name: "Evento B",
          status: "ended",
          start_date: "2026-06-01",
          end_date: "2026-06-02",
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

  // US-03 — distribuições demográficas (ADR-0009). Shape snake_case do T2; testes
  // específicos sobrescrevem via server.use(...) para vazio e caminhos de erro.
  http.get("*/api/metrics/by-age", () =>
    HttpResponse.json([
      { age_range: "18-24", count: 40 },
      { age_range: "25-34", count: 75 },
      { age_range: "35-44", count: 30 },
      { age_range: "unknown", count: 5 },
    ]),
  ),
  http.get("*/api/metrics/by-gender", () =>
    HttpResponse.json([
      { gender: "female", count: 90 },
      { gender: "male", count: 70 },
      { gender: "other", count: 10 },
    ]),
  ),
  http.get("*/api/metrics/by-city", () =>
    HttpResponse.json([
      { city: "São Paulo", count: 120 },
      { city: "Rio de Janeiro", count: 80 },
      { city: "Curitiba", count: 45 },
    ]),
  ),
  http.get("*/api/metrics/by-profile", () =>
    HttpResponse.json([
      { profile: "professional", count: 100 },
      { profile: "student", count: 60 },
    ]),
  ),
  http.get("*/api/metrics/by-type", () =>
    HttpResponse.json([
      { event_type: "workshop", count: 70 },
      { event_type: "lecture", count: 50 },
    ]),
  ),
];
