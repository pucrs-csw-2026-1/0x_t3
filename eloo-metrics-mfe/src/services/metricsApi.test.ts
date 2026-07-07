import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/msw/server";
import {
  listEventMetrics,
  getEngagement,
  getEventById,
  getCheckinRate,
  getCertificationRate,
  getTimeSeries,
  getSeries,
  getByAge,
  getByGender,
  getByProfile,
  getByType,
  getHoursDistribution,
  MetricsApiError,
  USING_MOCK_DATA,
} from "./metricsApi";
import { SESSION_EXPIRED_EVENT } from "./authApi";

const PERIOD = { startDate: "2026-01-01", endDate: "2026-12-31" };
const EVENTS = "*/api/metrics/events";
const ENGAGEMENT = "*/api/metrics/engagement";

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("mfeAuth.accessToken", "tok-123");
});

describe("listEventMetrics", () => {
  it("mapeia o item real do T2 (nome/janela da #META, event_type e status pt-BR)", async () => {
    server.use(
      http.get(EVENTS, () =>
        HttpResponse.json({
          items: [
            {
              event_id: "evt_9",
              event_name: "Congresso",
              start_date: "2026-03-01",
              end_date: "2026-03-03",
              event_type: "palestra",
              status: "ativo",
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
      eventType: "palestra",
      status: "ativo",
      startDate: "2026-03-01",
      endDate: "2026-03-03",
      registered: 200,
      checkedIn: 150,
      certified: 90,
    });
  });

  it("normaliza os quatro status reais do T2 e cai em unknown fora do enum", async () => {
    server.use(
      http.get(EVENTS, () =>
        HttpResponse.json({
          items: ["planejado", "ativo", "concluido", "cancelado", "arquivado"].map(
            (status, idx) => ({ event_id: `evt_${idx}`, status }),
          ),
        }),
      ),
    );

    const page = await listEventMetrics(PERIOD);

    expect(page.items.map((item) => item.status)).toEqual([
      "planejado",
      "ativo",
      "concluido",
      "cancelado",
      "unknown",
    ]);
  });

  it("tolera item sem nome/janela (evento sem meta completa → nulos)", async () => {
    server.use(
      http.get(EVENTS, () =>
        HttpResponse.json({
          items: [
            {
              event_id: "evt_9",
              event_type: "palestra",
              status: "ativo",
              registered: 200,
              checked_in: 150,
              certified: 90,
            },
          ],
        }),
      ),
    );

    const page = await listEventMetrics(PERIOD);

    expect(page.items[0]).toMatchObject({
      eventName: null,
      startDate: null,
      endDate: null,
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

  it("500 → mensagem pt-BR de servidor instável", async () => {
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 500 })));
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/inst[áa]vel/i);
  });

  it("NÃO vaza o texto cru do backend no 500 (ADR-0009)", async () => {
    server.use(
      http.get(EVENTS, () =>
        HttpResponse.json({ detail: "Internal error: connection refused" }, { status: 500 }),
      ),
    );
    // O usuário vê a mensagem pt-BR, nunca o detail técnico do backend.
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/inst[áa]vel/i);
    await expect(listEventMetrics(PERIOD)).rejects.not.toThrow(/connection refused/i);
  });

  it("aplica defaults para campos ausentes no item", async () => {
    server.use(http.get(EVENTS, () => HttpResponse.json({ items: [{ id: "evt_x" }] })));

    const page = await listEventMetrics(PERIOD);

    expect(page.items[0]).toEqual({
      eventId: "evt_x",
      eventName: null,
      eventType: null,
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
  it("agrega os items por evento do contrato real e deriva a taxa ponderada", async () => {
    let sentQuery: string | null = null;
    server.use(
      http.get(ENGAGEMENT, ({ request }) => {
        sentQuery = new URL(request.url).search;
        return HttpResponse.json({
          items: [
            { event_id: "evt_1", registered: 150, checked_in: 120, ratio: 0.8 },
            { event_id: "evt_2", registered: 50, checked_in: 16, ratio: 0.32 },
          ],
        });
      }),
    );

    const result = await getEngagement(PERIOD);

    // Taxa ponderada pelas somas (136/200), não média simples dos ratios (0.56).
    expect(result).toEqual({ registered: 200, checkedIn: 136, rate: 0.68 });
    // Período sempre enviado (ADR-0009).
    expect(sentQuery).toContain("start_date=2026-01-01");
    expect(sentQuery).toContain("end_date=2026-12-31");
  });

  it("valor-limite: items vazios → tudo zerado sem divisão por zero", async () => {
    server.use(http.get(ENGAGEMENT, () => HttpResponse.json({ items: [] })));

    const result = await getEngagement(PERIOD);

    expect(result).toEqual({ registered: 0, checkedIn: 0, rate: 0 });
  });

  it("tolera o shape plano {registered, checked_in} (sem envelope items)", async () => {
    server.use(http.get(ENGAGEMENT, () => HttpResponse.json({ registered: 200, checked_in: 50 })));

    const result = await getEngagement(PERIOD);

    expect(result.rate).toBeCloseTo(0.25);
  });

  it("propaga o mapeamento de erro da camada (401 → sessão expirada)", async () => {
    server.use(http.get(ENGAGEMENT, () => new HttpResponse(null, { status: 401 })));

    await expect(getEngagement(PERIOD)).rejects.toThrow(/sessão expirou/i);
  });
});

// US-05 — detalhe de evento + séries históricas (ADR-0009).
describe("getEventById", () => {
  const EVENT = "*/api/metrics/events/:eventId";

  it("mapeia o detalhe real (nome/janela, event_type, status pt-BR)", async () => {
    server.use(
      http.get(EVENT, ({ params }) =>
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
    );

    const detail = await getEventById("evt_9");

    expect(detail).toEqual({
      eventId: "evt_9",
      eventName: "AI for Business 2026",
      eventType: "conferencia",
      status: "ativo",
      startDate: "2026-01-15",
      endDate: "2026-06-30",
      registered: 1250,
      checkedIn: 850,
      certified: 420,
    });
  });

  it("403 → MetricsApiError com status 403 (fora do escopo do manager)", async () => {
    server.use(http.get(EVENT, () => new HttpResponse(null, { status: 403 })));

    await expect(getEventById("evt_x")).rejects.toBeInstanceOf(MetricsApiError);
    await expect(getEventById("evt_x")).rejects.toMatchObject({ status: 403 });
  });

  it("404 → MetricsApiError com status 404 (evento inexistente)", async () => {
    server.use(http.get(EVENT, () => new HttpResponse(null, { status: 404 })));

    await expect(getEventById("evt_zzz")).rejects.toMatchObject({ status: 404 });
  });
});

describe("taxas do evento", () => {
  const CHECKIN = "*/api/metrics/events/:eventId/checkin-rate";
  const CERT = "*/api/metrics/events/:eventId/certification-rate";

  it("deriva o numerador do shape real (rate + registered, sem checked_in)", async () => {
    server.use(
      http.get(CHECKIN, () =>
        HttpResponse.json({
          event_id: "evt_1",
          rate: 0.68,
          registered: 1250,
          generated_at: "2026-07-06T12:00:00Z",
        }),
      ),
    );

    const result = await getCheckinRate("evt_1");

    expect(result).toEqual({ rate: 0.68, numerator: 850, denominator: 1250 });
  });

  it("valor-limite: rate null (registered = 0 no contrato real) vira 0", async () => {
    server.use(
      http.get(CHECKIN, () => HttpResponse.json({ event_id: "evt_1", rate: null, registered: 0 })),
    );

    const result = await getCheckinRate("evt_1");

    expect(result).toEqual({ rate: 0, numerator: 0, denominator: 0 });
  });

  it("tolera o shape antigo com numerador explícito (certificação)", async () => {
    server.use(http.get(CERT, () => HttpResponse.json({ certified: 40, registered: 200 })));

    const result = await getCertificationRate("evt_1");

    expect(result).toEqual({ rate: 0.2, numerator: 40, denominator: 200 });
  });
});

describe("getTimeSeries", () => {
  const TIMESERIES = "*/api/metrics/timeseries";

  it("lê o envelope real {points} e envia type + from/to mensais + granularidade", async () => {
    let sentQuery: URLSearchParams | null = null;
    server.use(
      http.get(TIMESERIES, ({ request }) => {
        sentQuery = new URL(request.url).searchParams;
        return HttpResponse.json({
          granularity: "month",
          points: [{ bucket: "2026-06", registered: 1250, checked_in: 850 }],
        });
      }),
    );

    const points = await getTimeSeries({
      eventType: "palestra",
      granularity: "month",
      startDate: "2026-01-01",
      endDate: "2026-06-30",
    });

    expect(points).toHaveLength(1);
    expect(points[0]).toMatchObject({ bucket: "2026-06", registered: 1250, checkedIn: 850 });
    expect(points[0].date.getFullYear()).toBe(2026);
    // Contrato real: alias `type`, janela em buckets YYYY-MM, sem event_id.
    expect(sentQuery!.get("type")).toBe("palestra");
    expect(sentQuery!.get("from")).toBe("2026-01");
    expect(sentQuery!.get("to")).toBe("2026-06");
    expect(sentQuery!.get("granularity")).toBe("month");
    expect(sentQuery!.get("event_id")).toBeNull();
  });

  it("sem eventType não envia filtro de tipo (série global)", async () => {
    let sentQuery: URLSearchParams | null = null;
    server.use(
      http.get(TIMESERIES, ({ request }) => {
        sentQuery = new URL(request.url).searchParams;
        return HttpResponse.json({ granularity: "month", points: [] });
      }),
    );

    await getTimeSeries({ granularity: "month", startDate: "2026-01-01", endDate: "2026-06-30" });

    expect(sentQuery!.get("type")).toBeNull();
  });

  it("getSeries usa start_date/end_date e event_type (sem alias)", async () => {
    let sentQuery: URLSearchParams | null = null;
    server.use(
      http.get("*/api/metrics/series", ({ request }) => {
        sentQuery = new URL(request.url).searchParams;
        return HttpResponse.json({
          granularity: "month",
          points: [{ bucket: "2026-05", registered: 10, checked_in: 5 }],
        });
      }),
    );

    const points = await getSeries({
      eventType: "palestra",
      granularity: "month",
      startDate: "2026-01-01",
      endDate: "2026-06-30",
    });

    expect(points).toHaveLength(1);
    expect(points[0].checkedIn).toBe(5);
    expect(sentQuery!.get("event_type")).toBe("palestra");
    expect(sentQuery!.get("start_date")).toBe("2026-01-01");
    expect(sentQuery!.get("end_date")).toBe("2026-06-30");
  });
});

// US-03/US-06 — distribuições no contrato real (mapas e by-type por bucket).
describe("distribuições (contrato real)", () => {
  it("getByAge lê o mapa `distribution` e completa as 8 faixas canônicas", async () => {
    server.use(
      http.get("*/api/metrics/by-age", () =>
        HttpResponse.json({
          dimension: "age",
          distribution: { "18-24": 40, "25-34": 75, desconhecido: 5 },
        }),
      ),
    );

    const result = await getByAge({ from: "2026-01", to: "2026-06" });

    expect(result).toHaveLength(8);
    expect(result.find((r) => r.range === "18-24")?.count).toBe(40);
    expect(result.find((r) => r.range === "Desconhecido")?.count).toBe(5);
    expect(result.find((r) => r.range === "65+")?.count).toBe(0);
  });

  it("getByGender traduz as chaves reais F/M/OUTRO/NAO_INFORMADO", async () => {
    server.use(
      http.get("*/api/metrics/by-gender", () =>
        HttpResponse.json({
          dimension: "gender",
          distribution: { F: 90, M: 70, OUTRO: 10, NAO_INFORMADO: 5 },
        }),
      ),
    );

    const result = await getByGender({ from: "2026-01", to: "2026-06" });

    expect(result).toEqual([
      { gender: "Feminino", label: "Feminino", count: 90 },
      { gender: "Masculino", label: "Masculino", count: 70 },
      { gender: "Outro", label: "Outro", count: 10 },
      { gender: "Desconhecido", label: "Desconhecido", count: 5 },
    ]);
  });

  it("getByProfile lê o envelope `by_profile`", async () => {
    server.use(
      http.get("*/api/metrics/by-profile", () =>
        HttpResponse.json({ by_profile: { estudante: 60, professor: 100, externo: 17 } }),
      ),
    );

    const result = await getByProfile({ from: "2026-01", to: "2026-06" });

    expect(result).toEqual([
      { profile: "Estudante", label: "Estudante", count: 60 },
      { profile: "Professor", label: "Professor", count: 100 },
      { profile: "Externo", label: "Externo", count: 17 },
    ]);
  });

  it("getByType chama um bucket por mês do período e soma registered por tipo", async () => {
    const bucketsChamados: string[] = [];
    server.use(
      http.get("*/api/metrics/by-type", ({ request }) => {
        const bucket = new URL(request.url).searchParams.get("bucket")!;
        bucketsChamados.push(bucket);
        return HttpResponse.json({
          bucket,
          entries: [{ event_type: "workshop", registered: 10, checked_in: 5, certified: 2 }],
        });
      }),
    );

    const result = await getByType({ from: "2026-04", to: "2026-06" });

    expect(bucketsChamados.sort()).toEqual(["2026-04", "2026-05", "2026-06"]);
    expect(result).toEqual([{ type: "Workshop", label: "Workshop", count: 30 }]);
  });

  it("getByType rejeita período acima do limite de meses como filtro inválido", async () => {
    await expect(getByType({ from: "2020-01", to: "2026-06" })).rejects.toMatchObject({
      status: 422,
    });
  });

  it("getHoursDistribution lê o envelope `bands` e completa as 4 faixas fixas", async () => {
    let sentQuery: URLSearchParams | null = null;
    server.use(
      http.get("*/api/metrics/hours/distribution", ({ request }) => {
        sentQuery = new URL(request.url).searchParams;
        return HttpResponse.json({
          bands: { "1-4h": 340, "8h+": 75 },
          total_participants: 415,
        });
      }),
    );

    const result = await getHoursDistribution({ from: "2026-01", to: "2026-06", eventId: "evt_1" });

    expect(result).toEqual([
      { band: "0-1h", label: "0-1h", count: 0 },
      { band: "1-4h", label: "1-4h", count: 340 },
      { band: "4-8h", label: "4-8h", count: 0 },
      { band: "8h+", label: "8h+", count: 75 },
    ]);
    expect(sentQuery!.get("from")).toBe("2026-01");
    expect(sentQuery!.get("to")).toBe("2026-06");
    expect(sentQuery!.get("event_id")).toBe("evt_1");
  });

  it("getHoursDistribution preserva faixas novas do backend ao final (evolução aditiva)", async () => {
    server.use(
      http.get("*/api/metrics/hours/distribution", () =>
        HttpResponse.json({ bands: { "0-1h": 10, "24h+": 3 } }),
      ),
    );

    const result = await getHoursDistribution({ from: "2026-01", to: "2026-06" });

    expect(result).toHaveLength(5);
    expect(result[4]).toEqual({ band: "24h+", label: "24h+", count: 3 });
  });
});

// Auditoria de cobertura de erros (nenhum erro pode passar sem tratamento).
describe("robustez de erros e edge cases", () => {
  it("falha de rede vira MetricsApiError pt-BR (status 0), não TypeError cru", async () => {
    server.use(http.get(EVENTS, () => HttpResponse.error()));
    await expect(listEventMetrics(PERIOD)).rejects.toBeInstanceOf(MetricsApiError);
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/sem conex/i);
  });

  it("2xx com corpo não-JSON vira 'Resposta inválida', não SyntaxError", async () => {
    server.use(
      http.get(
        EVENTS,
        () =>
          new HttpResponse("<html>erro</html>", {
            status: 200,
            headers: { "Content-Type": "text/html" },
          }),
      ),
    );
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/resposta inválida/i);
  });

  it("campos numéricos não-numéricos viram 0 (nunca NaN)", async () => {
    server.use(
      http.get(EVENTS, () =>
        HttpResponse.json({
          items: [{ event_id: "e", registered: "N/A", checked_in: null, certified: {} }],
        }),
      ),
    );
    const page = await listEventMetrics(PERIOD);
    expect(page.items[0].registered).toBe(0);
    expect(page.items[0].checkedIn).toBe(0);
    expect(page.items[0].certified).toBe(0);
  });

  it("taxa inconsistente do backend (>1) é clampada em 1", async () => {
    server.use(
      http.get("*/api/metrics/events/:id/checkin-rate", () =>
        HttpResponse.json({ rate: 1.5, registered: 100 }),
      ),
    );
    const r = await getCheckinRate("evt_1");
    expect(r.rate).toBe(1);
  });

  it("bucket de mês inválido (2026-13) não faz rollover — data inválida", async () => {
    server.use(
      http.get("*/api/metrics/timeseries", () =>
        HttpResponse.json({ points: [{ bucket: "2026-13", registered: 5, checked_in: 2 }] }),
      ),
    );
    const points = await getTimeSeries({
      granularity: "month",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });
    expect(points[0].bucket).toBe("2026-13");
    expect(Number.isNaN(points[0].date.getTime())).toBe(true);
  });

  it("getByType agrega os buckets que chegaram mesmo com um bucket falhando", async () => {
    let call = 0;
    server.use(
      http.get("*/api/metrics/by-type", () => {
        call += 1;
        if (call === 1) return new HttpResponse(null, { status: 500 });
        return HttpResponse.json({ entries: [{ event_type: "palestra", registered: 10 }] });
      }),
    );
    const result = await getByType({ from: "2026-01", to: "2026-02" });
    expect(result.some((t) => t.label === "Palestra" && t.count === 10)).toBe(true);
  });

  it("getByType só falha quando TODOS os buckets falham", async () => {
    server.use(http.get("*/api/metrics/by-type", () => new HttpResponse(null, { status: 500 })));
    await expect(getByType({ from: "2026-01", to: "2026-02" })).rejects.toBeInstanceOf(
      MetricsApiError,
    );
  });

  it("401 sem token não dispara sessionExpired (no-op/dedupe)", async () => {
    localStorage.removeItem("mfeAuth.accessToken");
    const spy = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, spy);
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 401 })));
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/sessão expirou/i);
    expect(spy).not.toHaveBeenCalled();
    window.removeEventListener(SESSION_EXPIRED_EVENT, spy);
  });

  it("401 com token dispara sessionExpired exatamente uma vez", async () => {
    const spy = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, spy);
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 401 })));
    await expect(listEventMetrics(PERIOD)).rejects.toThrow(/sessão expirou/i);
    expect(spy).toHaveBeenCalledTimes(1);
    window.removeEventListener(SESSION_EXPIRED_EVENT, spy);
  });
});

// Nos testes (mode "test" não carrega .env.development) o modo demonstração fica
// desligado, então as chamadas batem no contrato via MSW (ADR-0009/0011).
describe("modo demonstração", () => {
  it("desligado nos testes", () => {
    expect(USING_MOCK_DATA).toBe(false);
  });
});
