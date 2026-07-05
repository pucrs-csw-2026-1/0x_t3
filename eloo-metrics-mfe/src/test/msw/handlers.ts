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
          registered: 120,
          checked_in: 80,
          certified: 40,
        },
        {
          event_id: "evt_2",
          event_name: "Evento B",
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
];
