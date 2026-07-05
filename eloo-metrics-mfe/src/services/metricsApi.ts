import { getStoredAccessToken, notifySessionExpired } from "./authApi";

// Único ponto que fala com o Metrics Service (T2) — ADR-0003/0009. As chamadas
// vão para `/api` na própria origem (resolvida via import.meta.url, para manter
// a origem certa mesmo montado no shell) e são proxied server-to-server pelo
// vite.config, contornando CORS. Em runtime real a origem é a do app; em teste
// (file://) a origem é "null", então usamos um host absoluto — o MSW intercepta
// por path de qualquer forma.
const importOrigin = new URL(import.meta.url).origin;
const API_BASE = `${importOrigin && importOrigin !== "null" ? importOrigin : "http://localhost"}/api`;

export interface EventMetrics {
  eventId: string;
  eventName: string | null;
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

function toEventMetrics(raw: Record<string, unknown>): EventMetrics {
  return {
    eventId: String(raw.event_id ?? raw.id ?? ""),
    eventName: (raw.event_name ?? raw.name ?? null) as string | null,
    registered: Number(raw.registered ?? 0),
    checkedIn: Number(raw.checked_in ?? 0),
    certified: Number(raw.certified ?? 0),
  };
}

// GET /metrics/events — counters por evento no período, paginado. O backend
// escopa por RBAC (admin: todos; manager: escopo). Ver ADR-0009.
export async function listEventMetrics(params: ListEventMetricsParams): Promise<EventMetricsPage> {
  const token = getStoredAccessToken();
  const query = new URLSearchParams({
    start_date: params.startDate,
    end_date: params.endDate,
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 20),
  });

  const response = await fetch(`${API_BASE}/metrics/events?${query.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) await handleErrorResponse(response);

  const data = await response.json();
  const items: Record<string, unknown>[] = Array.isArray(data.items) ? data.items : [];
  return {
    items: items.map(toEventMetrics),
    page: Number(data.page ?? params.page ?? 1),
    pageSize: Number(data.page_size ?? params.pageSize ?? 20),
    total: Number(data.total ?? items.length),
  };
}
