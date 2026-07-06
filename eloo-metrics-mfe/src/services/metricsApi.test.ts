import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/msw/server";
import { listEventMetrics, getEngagement, USING_MOCK_DATA } from "./metricsApi";
import { SESSION_EXPIRED_EVENT } from "./authApi";

const PERIOD = { startDate: "2026-01-01", endDate: "2026-12-31" };
const EVENTS = "*/api/metrics/events";
const ENGAGEMENT = "*/api/metrics/engagement";

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("mfeAuth.accessToken", "tok-123");
});

describe("listEventMetrics", () => {
  it("mapeia snake_case → camelCase e a paginação (200)", async () => {
    server.use(
      http.get(EVENTS, () =>
        HttpResponse.json({
          items: [
            {
              event_id: "evt_9",
              event_name: "Congresso",
              status: "ACTIVE",
              start_date: "2026-03-01",
              end_date: "2026-03-03",
              registered: 200,
              checked_in: 150,
              certified: 90,
            },
          ],
          page: 1,
          page_size: 20,
          total: 1,
        }),
      ),
    );

    const page = await listEventMetrics(PERIOD);

    expect(page.total).toBe(1);
    expect(page.items[0]).toEqual({
      eventId: "evt_9",
      eventName: "Congresso",
      status: "active",
      startDate: "2026-03-01",
      endDate: "2026-03-03",
      registered: 200,
      checkedIn: 150,
      certified: 90,
    });
  });

  it("envia Authorization: Bearer com o token do storage", async () => {
    let authHeader: string | null = null;
    server.use(
      http.get(EVENTS, ({ request }) => {
        authHeader = request.headers.get("Authorization");
        return HttpResponse.json({ items: [], page: 1, page_size: 20, total: 0 });
      }),
    );

    await listEventMetrics(PERIOD);

    expect(authHeader).toBe("Bearer tok-123");
  });

  it("401 → limpa a sessão e dispara sessionExpired", async () => {
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 401 })));
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/sessão expirou/i);

    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("mfeAuth.accessToken")).toBeNull();
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it("403 → mensagem de sem permissão", async () => {
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 403 })));
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/permissão/i);
  });

  it("404 → recurso não encontrado", async () => {
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 404 })));
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/não encontrado/i);
  });

  it("422 → filtro inválido", async () => {
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 422 })));
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/filtro inválido/i);
  });

  it("500 → mensagem genérica", async () => {
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 500 })));
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/não foi possível/i);
  });

  it("usa a mensagem `detail` do backend quando presente (500)", async () => {
    server.use(
      http.get(EVENTS, () =>
        HttpResponse.json({ detail: "Falha interna do serviço" }, { status: 500 }),
      ),
    );
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/falha interna do serviço/i);
  });

  it("aplica defaults para campos ausentes no item", async () => {
    server.use(http.get(EVENTS, () => HttpResponse.json({ items: [{ id: "evt_x" }] })));

    const page = await listEventMetrics(PERIOD);

    expect(page.items[0]).toEqual({
      eventId: "evt_x",
      eventName: null,
      status: "unknown",
      startDate: null,
      endDate: null,
      registered: 0,
      checkedIn: 0,
      certified: 0,
    });
    expect(page.total).toBe(1);
    expect(page.page).toBe(1);
  });
});

describe("getEngagement", () => {
  it("mapeia checked_in/registered e usa o rate do backend quando presente", async () => {
    let sentQuery: string | null = null;
    server.use(
      http.get(ENGAGEMENT, ({ request }) => {
        sentQuery = new URL(request.url).search;
        return HttpResponse.json({ registered: 200, checked_in: 136, rate: 0.68 });
      }),
    );

    const result = await getEngagement(PERIOD);

    expect(result).toEqual({ registered: 200, checkedIn: 136, rate: 0.68 });
    // Período sempre enviado (ADR-0009).
    expect(sentQuery).toContain("start_date=2026-01-01");
    expect(sentQuery).toContain("end_date=2026-12-31");
  });

  it("deriva o rate quando o backend não o envia", async () => {
    server.use(http.get(ENGAGEMENT, () => HttpResponse.json({ registered: 200, checked_in: 50 })));

    const result = await getEngagement(PERIOD);

    expect(result.rate).toBeCloseTo(0.25);
  });

  it("valor-limite: registrados = 0 não divide por zero (rate 0)", async () => {
    server.use(http.get(ENGAGEMENT, () => HttpResponse.json({ registered: 0, checked_in: 0 })));

    const result = await getEngagement(PERIOD);

    expect(result).toEqual({ registered: 0, checkedIn: 0, rate: 0 });
  });

  it("propaga o mapeamento de erro da camada (401 → sessão expirada)", async () => {
    server.use(http.get(ENGAGEMENT, () => new HttpResponse(null, { status: 401 })));

    await expect(getEngagement(PERIOD)).rejects.toThrow(/sessão expirou/i);
  });
});

// Nos testes (mode "test" não carrega .env.development) o modo demonstração fica
// desligado, então as chamadas batem no contrato via MSW (ADR-0009/0011).
describe("modo demonstração", () => {
  it("desligado nos testes", () => {
    expect(USING_MOCK_DATA).toBe(false);
  });
});
