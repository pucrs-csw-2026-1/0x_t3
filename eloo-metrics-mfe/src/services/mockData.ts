import type { EventMetrics, EventMetricsPage, EngagementResponse } from "./metricsApi";

// Dados mockados para desenvolvimento/demonstração (VITE_USE_MOCKS=true). NÃO são
// usados em testes (o vitest roda em mode "test", que não carrega
// .env.development) nem em produção — lá valem os dados reais do T2 (ADR-0009).
// Dez eventos com taxas de adesão variadas, para o ranking Top 5 melhores/piores
// ter recortes distintos.

export const MOCK_EVENTS: EventMetrics[] = [
  {
    eventId: "evt_cloud",
    eventName: "Cloud Bootcamp",
    registered: 140,
    checkedIn: 130,
    certified: 88,
  },
  { eventId: "evt_hack", eventName: "Hackathon", registered: 170, checkedIn: 150, certified: 60 },
  {
    eventId: "evt_ux",
    eventName: "UX Masterclass",
    registered: 220,
    checkedIn: 190,
    certified: 95,
  },
  { eventId: "evt_ai", eventName: "AI Workshop", registered: 350, checkedIn: 300, certified: 130 },
  { eventId: "evt_lead", eventName: "Leadership", registered: 300, checkedIn: 210, certified: 110 },
  { eventId: "evt_tech", eventName: "Tech Talk", registered: 250, checkedIn: 160, certified: 80 },
  { eventId: "evt_prod", eventName: "Product Talk", registered: 200, checkedIn: 96, certified: 40 },
  { eventId: "evt_data", eventName: "Data Summit", registered: 280, checkedIn: 126, certified: 70 },
  { eventId: "evt_net", eventName: "Networking", registered: 180, checkedIn: 72, certified: 30 },
  {
    eventId: "evt_sprint",
    eventName: "Design Sprint",
    registered: 160,
    checkedIn: 40,
    certified: 15,
  },
];

export const MOCK_EVENTS_PAGE: EventMetricsPage = {
  items: MOCK_EVENTS,
  page: 1,
  pageSize: 200,
  total: MOCK_EVENTS.length,
};

export const MOCK_ENGAGEMENT: EngagementResponse = {
  registered: 2250,
  checkedIn: 1474,
  rate: 0.65,
};

// Tendência do card de inscritos (referência: "+12% vs. período anterior").
// Mock: o T2 ainda não expõe comparativo entre janelas.
export const MOCK_REGISTERED_TREND = { label: "+12%", positive: true } as const;
