import { http, HttpResponse } from "msw";

// Handlers base do MSW (ADR-0011). São placeholders — os testes de integração
// reais do `metricsApi` (US-01) adicionam/ajustam handlers para o contrato do
// Metrics Service T2 (ADR-0009).
export const handlers = [
  http.get("*/api/metrics/events", () =>
    HttpResponse.json({ items: [], page: 1, page_size: 20, total: 0 }),
  ),
];
