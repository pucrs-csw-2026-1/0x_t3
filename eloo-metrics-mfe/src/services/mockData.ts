import type {
  EventMetrics,
  EventMetricsPage,
  EngagementResponse,
  AgeDistribution,
  GenderDistribution,
  CityDistribution,
  ProfileDistribution,
  TypeDistribution,
} from "./metricsApi";

// Dados mockados para desenvolvimento/demonstração (VITE_USE_MOCKS=true). NÃO são
// usados em testes (o vitest roda em mode "test", que não carrega
// .env.development) nem em produção — lá valem os dados reais do T2 (ADR-0009).
// Dez eventos com taxas de adesão variadas, para o ranking Top 5 melhores/piores
// ter recortes distintos.

export const MOCK_EVENTS: EventMetrics[] = [
  {
    eventId: "evt_cloud",
    eventName: "Cloud Bootcamp",
    status: "active",
    startDate: "2026-08-10",
    endDate: "2026-08-12",
    registered: 140,
    checkedIn: 130,
    certified: 88,
  },
  {
    eventId: "evt_hack",
    eventName: "Hackathon 0x",
    status: "draft",
    startDate: null,
    endDate: null,
    registered: 170,
    checkedIn: 150,
    certified: 60,
  },
  {
    eventId: "evt_ux",
    eventName: "UX Masterclass",
    status: "active",
    startDate: "2026-09-15",
    endDate: "2026-09-15",
    registered: 220,
    checkedIn: 190,
    certified: 95,
  },
  {
    eventId: "evt_ai",
    eventName: "AI Workshop",
    status: "active",
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    registered: 350,
    checkedIn: 300,
    certified: 130,
  },
  {
    eventId: "evt_lead",
    eventName: "Leadership Summit",
    status: "ended",
    startDate: "2026-07-01",
    endDate: "2026-07-03",
    registered: 300,
    checkedIn: 210,
    certified: 110,
  },
  {
    eventId: "evt_tech",
    eventName: "Tech Talk",
    status: "ended",
    startDate: "2026-06-18",
    endDate: "2026-06-18",
    registered: 250,
    checkedIn: 160,
    certified: 80,
  },
  {
    eventId: "evt_prod",
    eventName: "Product Talk",
    status: "ended",
    startDate: "2026-06-05",
    endDate: "2026-06-05",
    registered: 200,
    checkedIn: 96,
    certified: 40,
  },
  {
    eventId: "evt_data",
    eventName: "Data Summit",
    status: "active",
    startDate: "2026-07-25",
    endDate: "2026-07-26",
    registered: 280,
    checkedIn: 126,
    certified: 70,
  },
  {
    eventId: "evt_net",
    eventName: "Networking",
    status: "ended",
    startDate: "2026-05-30",
    endDate: "2026-05-30",
    registered: 180,
    checkedIn: 72,
    certified: 30,
  },
  {
    eventId: "evt_sprint",
    eventName: "Design Sprint",
    status: "draft",
    startDate: null,
    endDate: null,
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

// US-03 — Distribuições demográficas (modo demonstração). Já em camelCase e com
// rótulos pt-BR, como saem da camada de serviço (getByAge/Gender/City/...).

// Faixa etária: sempre as 8 canônicas, com "Desconhecido" incluído.
export const MOCK_BY_AGE: AgeDistribution[] = [
  { range: "0-17", label: "0-17", count: 12 },
  { range: "18-24", label: "18-24", count: 250 },
  { range: "25-34", label: "25-34", count: 450 },
  { range: "35-44", label: "35-44", count: 200 },
  { range: "45-54", label: "45-54", count: 80 },
  { range: "55-64", label: "55-64", count: 30 },
  { range: "65+", label: "65+", count: 10 },
  { range: "Desconhecido", label: "Desconhecido", count: 18 },
];

export const MOCK_BY_GENDER: GenderDistribution[] = [
  { gender: "Feminino", label: "Feminino", count: 540 },
  { gender: "Masculino", label: "Masculino", count: 430 },
  { gender: "Outro", label: "Outro", count: 55 },
  { gender: "Desconhecido", label: "Desconhecido", count: 25 },
];

export const MOCK_BY_CITY: CityDistribution[] = [
  { city: "São Paulo", count: 450 },
  { city: "Rio de Janeiro", count: 310 },
  { city: "Belo Horizonte", count: 240 },
  { city: "Curitiba", count: 180 },
  { city: "Porto Alegre", count: 150 },
  { city: "Salvador", count: 120 },
  { city: "Recife", count: 95 },
  { city: "Brasília", count: 70 },
  { city: "Fortaleza", count: 60 },
  { city: "Manaus", count: 45 },
];

export const MOCK_BY_PROFILE: ProfileDistribution[] = [
  { profile: "Profissional", label: "Profissional", count: 420 },
  { profile: "Especialista/Técnico", label: "Especialista/Técnico", count: 280 },
  { profile: "Estudante", label: "Estudante", count: 180 },
  { profile: "Executivo/C-Level", label: "Executivo/C-Level", count: 120 },
];

export const MOCK_BY_TYPE: TypeDistribution[] = [
  { type: "Workshop", label: "Workshop", count: 320 },
  { type: "Palestra", label: "Palestra", count: 260 },
  { type: "Curso", label: "Curso", count: 190 },
  { type: "Conferência", label: "Conferência", count: 140 },
  { type: "Hackathon", label: "Hackathon", count: 90 },
];
