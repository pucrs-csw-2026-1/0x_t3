import { getStoredAccessToken, notifySessionExpired } from "./authApi";
import {
  MOCK_ENGAGEMENT,
  MOCK_EVENTS_PAGE,
  MOCK_BY_AGE,
  MOCK_BY_GENDER,
  MOCK_BY_CITY,
  MOCK_BY_PROFILE,
  MOCK_BY_TYPE,
} from "./mockData";
import {
  AGE_RANGES,
  toAgeRange,
  genderLabel,
  profileLabel,
  typeLabel,
} from "../utils/demographics";

// Modo demonstração: quando VITE_USE_MOCKS=true (só em .env.development), a
// camada devolve dados mockados sem tocar a rede — útil para rodar o dashboard
// standalone sem o T2 no ar. Nunca ligado em teste (mode "test") nem em produção.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// Pequeno atraso para o modo mock exercitar os estados de loading (skeleton).
const MOCK_LATENCY_MS = 400;
function withMockLatency<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));
}

// Único ponto que fala com o Metrics Service (T2) — ADR-0003/0009. As chamadas
// vão para `/api` na própria origem (resolvida via import.meta.url, para manter
// a origem certa mesmo montado no shell) e são proxied server-to-server pelo
// vite.config, contornando CORS. Em runtime real a origem é a do app; em teste
// (file://) a origem é "null", então usamos um host absoluto — o MSW intercepta
// por path de qualquer forma.
const importOrigin = new URL(import.meta.url).origin;
const API_BASE = `${importOrigin && importOrigin !== "null" ? importOrigin : "http://localhost"}/api`;

// Situação do evento no catálogo (US-04). O backend pode enviar rótulos em
// inglês ou português; normalizamos para um conjunto fechado e caímos em
// "unknown" quando o valor não é reconhecido (tolerância à evolução do T2).
export type EventStatus = "active" | "ended" | "draft" | "unknown";

export interface EventMetrics {
  eventId: string;
  eventName: string | null;
  // Situação e janela do evento (US-04, catálogo). A janela do evento é distinta
  // do período consultado; pode vir nula (ex.: rascunho sem datas definidas).
  status: EventStatus;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  registered: number;
  checkedIn: number;
  certified: number;
}

export interface EventMetricsPage {
  items: EventMetrics[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ListEventMetricsParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  page?: number;
  pageSize?: number;
}

export interface EngagementParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

// Engajamento agregado no período (checked_in/registered) — ADR-0009. O `rate`
// é a taxa de adesão (0..1); quando o backend não envia, é derivado.
export interface EngagementResponse {
  registered: number;
  checkedIn: number;
  rate: number;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
  } catch {
    // sem corpo JSON
  }
  return "Não foi possível carregar as métricas. Tente novamente.";
}

// Mapa de erros → mensagem em pt-BR (ADR-0009). Um 401 também limpa a sessão e
// dispara o evento sessionExpired (o host redireciona para o login).
async function handleErrorResponse(response: Response): Promise<never> {
  if (response.status === 401) {
    notifySessionExpired();
    throw new Error("Sua sessão expirou. Entre novamente.");
  }
  if (response.status === 403) {
    throw new Error("Você não tem permissão para ver estas métricas.");
  }
  if (response.status === 404) {
    throw new Error("Recurso não encontrado.");
  }
  if (response.status === 422) {
    throw new Error("Filtro inválido. Verifique o período informado.");
  }
  throw new Error(await readErrorMessage(response));
}

// Único ponto de rede da camada: injeta o Bearer do storage compartilhado
// (mfeAuth.*) e centraliza o mapeamento de erros → pt-BR (ADR-0009).
async function authedGet(path: string, query: URLSearchParams): Promise<unknown> {
  const token = getStoredAccessToken();
  const response = await fetch(`${API_BASE}${path}?${query.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) await handleErrorResponse(response);
  return response.json();
}

// Normaliza o rótulo de situação do backend (case-insensitive, PT/EN) para o
// conjunto fechado de EventStatus. Valor ausente/desconhecido → "unknown".
function toEventStatus(raw: unknown): EventStatus {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (["active", "ativo", "ongoing", "published", "open"].includes(value)) return "active";
  if (["ended", "encerrado", "finished", "closed", "completed", "past"].includes(value))
    return "ended";
  if (["draft", "rascunho", "pending"].includes(value)) return "draft";
  return "unknown";
}

function toIsoDateOrNull(raw: unknown): string | null {
  if (raw == null) return null;
  const value = String(raw).trim();
  return value === "" ? null : value;
}

function toEventMetrics(raw: Record<string, unknown>): EventMetrics {
  return {
    eventId: String(raw.event_id ?? raw.id ?? ""),
    eventName: (raw.event_name ?? raw.name ?? null) as string | null,
    status: toEventStatus(raw.status),
    startDate: toIsoDateOrNull(raw.start_date ?? raw.starts_at),
    endDate: toIsoDateOrNull(raw.end_date ?? raw.ends_at),
    registered: Number(raw.registered ?? 0),
    checkedIn: Number(raw.checked_in ?? 0),
    certified: Number(raw.certified ?? 0),
  };
}

// GET /metrics/events — counters por evento no período, paginado. O backend
// escopa por RBAC (admin: todos; manager: escopo). Ver ADR-0009.
export async function listEventMetrics(params: ListEventMetricsParams): Promise<EventMetricsPage> {
  if (USE_MOCKS) return withMockLatency(MOCK_EVENTS_PAGE);

  const query = new URLSearchParams({
    start_date: params.startDate,
    end_date: params.endDate,
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 20),
  });

  const data = (await authedGet("/metrics/events", query)) as Record<string, unknown>;
  const items: Record<string, unknown>[] = Array.isArray(data.items) ? data.items : [];
  return {
    items: items.map(toEventMetrics),
    page: Number(data.page ?? params.page ?? 1),
    pageSize: Number(data.page_size ?? params.pageSize ?? 20),
    total: Number(data.total ?? items.length),
  };
}

function toEngagement(raw: Record<string, unknown>): EngagementResponse {
  const registered = Number(raw.registered ?? 0);
  const checkedIn = Number(raw.checked_in ?? 0);
  const rawRate = raw.rate ?? raw.engagement_rate;
  const rate = rawRate != null ? Number(rawRate) : registered > 0 ? checkedIn / registered : 0;
  return { registered, checkedIn, rate };
}

// GET /metrics/engagement — engajamento agregado no período. O período é sempre
// enviado (ADR-0009). O backend escopa por RBAC (admin: global; manager:
// escopo). Alimenta o indicador de taxa global do dashboard.
export async function getEngagement(params: EngagementParams): Promise<EngagementResponse> {
  if (USE_MOCKS) return withMockLatency(MOCK_ENGAGEMENT);

  const query = new URLSearchParams({
    start_date: params.startDate,
    end_date: params.endDate,
  });

  const data = (await authedGet("/metrics/engagement", query)) as Record<string, unknown>;
  return toEngagement(data);
}

// ---------------------------------------------------------------------------
// US-03 — Distribuições demográficas
// GET /metrics/by-age | by-gender | by-city | by-profile | by-type (ADR-0009).
// Todos aceitam `event_id` (opcional) e a janela mensal `from`/`to` (YYYY-MM).
// Cada método devolve um array de buckets já em camelCase e com rótulos pt-BR;
// a normalização (faixas canônicas, tradução, ordenação, top-N) vive aqui —
// os gráficos só recebem dados por props (ADR-0004).
// ---------------------------------------------------------------------------

export interface DistributionParams {
  from: string; // YYYY-MM
  to: string; // YYYY-MM
  eventId?: string;
}

// Todos os DTOs de distribuição compartilham `count` (valor absoluto no período),
// o que permite somatórios/percentuais genéricos na UI.
export interface AgeDistribution {
  range: string; // faixa canônica (0-17…65+, "Desconhecido")
  label: string; // rótulo exibível (== range, em pt-BR)
  count: number;
}

export interface GenderDistribution {
  gender: string; // chave normalizada do backend
  label: string; // rótulo pt-BR (Feminino/Masculino/Outro/Desconhecido)
  count: number;
}

export interface CityDistribution {
  city: string;
  count: number;
}

export interface ProfileDistribution {
  profile: string;
  label: string;
  count: number;
}

export interface TypeDistribution {
  type: string;
  label: string;
  count: number;
}

// Top de cidades exibido pela US-03 (critério de aceite: "top 10 cidades").
const CITY_TOP_N = 10;

// O contrato exato do corpo destes endpoints ainda não está fixado no OpenAPI do
// T2 (ADR-0009 lista os caminhos, não o shape). Toleramos array puro ou envelope
// (`items`/`buckets`/`data`), ignorando o resto (evolução aditiva).
function asBuckets(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  const envelope = data as Record<string, unknown> | null;
  const list = envelope?.items ?? envelope?.buckets ?? envelope?.data;
  return Array.isArray(list) ? (list as Record<string, unknown>[]) : [];
}

// Contagem do bucket, tolerando os nomes de campo mais prováveis do backend.
function bucketCount(raw: Record<string, unknown>): number {
  return Number(raw.count ?? raw.total ?? raw.value ?? 0) || 0;
}

function distributionQuery(params: DistributionParams): URLSearchParams {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  if (params.eventId) query.set("event_id", params.eventId);
  return query;
}

// Agrega contagens por rótulo preservando a ordem de primeira aparição.
function aggregateByLabel(
  buckets: Record<string, unknown>[],
  keyOf: (raw: Record<string, unknown>) => string,
  labelOf: (raw: Record<string, unknown>) => string,
): { key: string; label: string; count: number }[] {
  const order: string[] = [];
  const byKey = new Map<string, { key: string; label: string; count: number }>();
  for (const raw of buckets) {
    const key = keyOf(raw);
    const existing = byKey.get(key);
    if (existing) {
      existing.count += bucketCount(raw);
    } else {
      byKey.set(key, { key, label: labelOf(raw), count: bucketCount(raw) });
      order.push(key);
    }
  }
  return order.map((key) => byKey.get(key)!);
}

// Normaliza para as 8 faixas canônicas, na ordem fixa e SEMPRE completas (faixa
// sem dado vira 0). Faixas fora do conjunto colapsam em "Desconhecido".
function normalizeAge(buckets: Record<string, unknown>[]): AgeDistribution[] {
  const counts = new Map<string, number>();
  for (const raw of buckets) {
    const range = toAgeRange(raw.age_range ?? raw.range ?? raw.bucket ?? raw.key);
    counts.set(range, (counts.get(range) ?? 0) + bucketCount(raw));
  }
  return AGE_RANGES.map((range) => ({ range, label: range, count: counts.get(range) ?? 0 }));
}

export async function getByAge(params: DistributionParams): Promise<AgeDistribution[]> {
  if (USE_MOCKS) return withMockLatency(MOCK_BY_AGE);
  const data = await authedGet("/metrics/by-age", distributionQuery(params));
  return normalizeAge(asBuckets(data));
}

export async function getByGender(params: DistributionParams): Promise<GenderDistribution[]> {
  if (USE_MOCKS) return withMockLatency(MOCK_BY_GENDER);
  const data = await authedGet("/metrics/by-gender", distributionQuery(params));
  return aggregateByLabel(
    asBuckets(data),
    (raw) => genderLabel(raw.gender ?? raw.key),
    (raw) => genderLabel(raw.gender ?? raw.key),
  ).map(({ label, count }) => ({ gender: label, label, count }));
}

export async function getByCity(params: DistributionParams): Promise<CityDistribution[]> {
  if (USE_MOCKS) return withMockLatency(MOCK_BY_CITY);
  const data = await authedGet("/metrics/by-city", distributionQuery(params));
  return asBuckets(data)
    .map((raw) => ({ city: String(raw.city ?? raw.key ?? "—"), count: bucketCount(raw) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, CITY_TOP_N);
}

export async function getByProfile(params: DistributionParams): Promise<ProfileDistribution[]> {
  if (USE_MOCKS) return withMockLatency(MOCK_BY_PROFILE);
  const data = await authedGet("/metrics/by-profile", distributionQuery(params));
  return aggregateByLabel(
    asBuckets(data),
    (raw) => profileLabel(raw.profile ?? raw.key),
    (raw) => profileLabel(raw.profile ?? raw.key),
  ).map(({ label, count }) => ({ profile: label, label, count }));
}

export async function getByType(params: DistributionParams): Promise<TypeDistribution[]> {
  if (USE_MOCKS) return withMockLatency(MOCK_BY_TYPE);
  const data = await authedGet("/metrics/by-type", distributionQuery(params));
  return aggregateByLabel(
    asBuckets(data),
    (raw) => typeLabel(raw.event_type ?? raw.type ?? raw.key),
    (raw) => typeLabel(raw.event_type ?? raw.type ?? raw.key),
  ).map(({ label, count }) => ({ type: label, label, count }));
}

// Sinaliza à UI que estamos em modo demonstração (ex.: exibir a tendência mock
// "+12%" que ainda não tem origem real no T2).
export const USING_MOCK_DATA = USE_MOCKS;
