import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/msw/server";
import { listEventMetrics } from "./metricsApi";
import { SESSION_EXPIRED_EVENT } from "./authApi";

const PERIOD = { startDate: "2026-01-01", endDate: "2026-12-31" };
const EVENTS = "*/api/metrics/events";

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
      registered: 0,
      checkedIn: 0,
      certified: 0,
    });
    expect(page.total).toBe(1);
    expect(page.page).toBe(1);
  });
});
