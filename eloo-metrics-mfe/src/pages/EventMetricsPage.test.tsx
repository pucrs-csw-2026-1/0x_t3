import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/msw/server";
import EventMetricsPage from "./EventMetricsPage";
import * as metricsApi from "../services/metricsApi";
import { SESSION_EXPIRED_EVENT } from "../services/authApi";

const EVENT = "*/api/metrics/events/:eventId";
const CHECKIN = "*/api/metrics/events/:eventId/checkin-rate";

// Integração via MSW (ADR-0011): a página exercita a camada de serviço real
// contra o contrato do T2 (ADR-0009). Handlers base cobrem o caminho feliz;
// cada teste sobrescreve o que precisa para 403/404/erro.
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("mfeAuth.accessToken", "tok-123");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("EventMetricsPage (integração MSW)", () => {
  it("loading → renderiza detalhe, taxas, counters e série histórica", async () => {
    render(<EventMetricsPage eventId="evt_1" onBack={vi.fn()} />);

    // Cabeçalho + counters do evento (nome real exposto pelo T2 desde a US-06).
    expect(
      await screen.findByRole("heading", { name: "AI for Business 2026" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1.250")).toBeInTheDocument();
    expect(screen.getByText("420")).toBeInTheDocument();

    // Taxas (locale pt-BR, uma casa decimal).
    expect(await screen.findByText("68,0%")).toBeInTheDocument();
    expect(await screen.findByText("33,6%")).toBeInTheDocument();

    // Série histórica renderizada (legenda das séries).
    expect(await screen.findByText("Inscrições")).toBeInTheDocument();
  });

  it("403 no evento → ForbiddenState e nenhum fetch secundário é feito", async () => {
    server.use(http.get(EVENT, () => new HttpResponse(null, { status: 403 })));
    const checkinSpy = vi.spyOn(metricsApi, "getCheckinRate");
    const tsSpy = vi.spyOn(metricsApi, "getTimeSeries");

    render(<EventMetricsPage eventId="evt_x" onBack={vi.fn()} />);

    expect(
      await screen.findByText(/você não tem permissão para ver este evento/i),
    ).toBeInTheDocument();
    expect(checkinSpy).not.toHaveBeenCalled();
    expect(tsSpy).not.toHaveBeenCalled();
  });

  it("404 no evento → NotFoundState e nenhum fetch secundário é feito", async () => {
    server.use(http.get(EVENT, () => new HttpResponse(null, { status: 404 })));
    const checkinSpy = vi.spyOn(metricsApi, "getCheckinRate");
    const tsSpy = vi.spyOn(metricsApi, "getTimeSeries");

    render(<EventMetricsPage eventId="evt_zzz" onBack={vi.fn()} />);

    expect(await screen.findByText(/evento não encontrado/i)).toBeInTheDocument();
    expect(checkinSpy).not.toHaveBeenCalled();
    expect(tsSpy).not.toHaveBeenCalled();
  });

  it("falha na taxa de check-in não bloqueia a série histórica", async () => {
    server.use(http.get(CHECKIN, () => new HttpResponse(null, { status: 500 })));

    render(<EventMetricsPage eventId="evt_1" onBack={vi.fn()} />);

    // A série histórica segue renderizando…
    expect(await screen.findByText("Inscrições")).toBeInTheDocument();
    // …e o card de check-in exibe erro com retry, sem derrubar a página.
    expect(await screen.findByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
    // A certificação continua válida.
    expect(screen.getByText("33,6%")).toBeInTheDocument();
  });

  it("troca de granularidade refaz apenas o fetch de timeseries", async () => {
    const tsSpy = vi.spyOn(metricsApi, "getTimeSeries");
    const checkinSpy = vi.spyOn(metricsApi, "getCheckinRate");

    render(<EventMetricsPage eventId="evt_1" onBack={vi.fn()} />);
    await screen.findByText("Inscrições");

    const tsCallsBefore = tsSpy.mock.calls.length;
    const checkinCallsBefore = checkinSpy.mock.calls.length;
    expect(tsCallsBefore).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("combobox", { name: /granularidade/i }));
    await userEvent.click(screen.getByRole("option", { name: "Trimestral" }));

    await waitFor(() => expect(tsSpy.mock.calls.length).toBeGreaterThan(tsCallsBefore));
    expect(checkinSpy.mock.calls.length).toBe(checkinCallsBefore);
  });

  it("401 no evento dispara mfeAuth:sessionExpired", async () => {
    server.use(http.get(EVENT, () => new HttpResponse(null, { status: 401 })));
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    render(<EventMetricsPage eventId="evt_1" onBack={vi.fn()} />);

    await waitFor(() => expect(onExpired).toHaveBeenCalled());
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it("série sem dados (timeseries e series vazios) mostra o estado vazio", async () => {
    server.use(
      http.get("*/api/metrics/timeseries", () => HttpResponse.json([])),
      http.get("*/api/metrics/series", () => HttpResponse.json([])),
    );

    render(<EventMetricsPage eventId="evt_1" onBack={vi.fn()} />);

    expect(await screen.findByText(/sem dados para o período selecionado/i)).toBeInTheDocument();
    // Os cards de taxa seguem válidos — vazio na série não derruba o resto.
    expect(await screen.findByText("68,0%")).toBeInTheDocument();
  });

  it("usa /series como fallback quando /timeseries volta vazio", async () => {
    server.use(
      http.get("*/api/metrics/timeseries", () => HttpResponse.json([])),
      http.get("*/api/metrics/series", () =>
        HttpResponse.json([{ bucket: "2026-06", registered: 1250, checked_in: 850 }]),
      ),
    );

    render(<EventMetricsPage eventId="evt_1" onBack={vi.fn()} />);

    // A série renderiza (legenda), sem cair no estado vazio.
    expect(await screen.findByText("Inscrições")).toBeInTheDocument();
    expect(screen.queryByText(/sem dados para o período selecionado/i)).not.toBeInTheDocument();
  });

  it("erro genérico no evento mostra ErrorAlert com voltar e retry funcional", async () => {
    server.use(http.get(EVENT, () => new HttpResponse(null, { status: 500 }), { once: true }));
    const onBack = vi.fn();

    render(<EventMetricsPage eventId="evt_1" onBack={onBack} />);

    // Erro fatal do evento: alerta com retry + botão de voltar (ADR-0005).
    const retry = await screen.findByRole("button", { name: /tentar novamente/i });
    expect(screen.getByRole("button", { name: /voltar ao catálogo/i })).toBeInTheDocument();

    // Retry (handler base volta a responder 200) recarrega o evento.
    await userEvent.click(retry);
    expect(
      await screen.findByRole("heading", { name: "AI for Business 2026" }),
    ).toBeInTheDocument();
  });
});
