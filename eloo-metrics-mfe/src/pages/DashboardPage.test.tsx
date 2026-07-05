import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/msw/server";
import DashboardPage from "./DashboardPage";

const EVENTS = "*/api/metrics/events";

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("mfeAuth.accessToken", "tok-123");
});

describe("DashboardPage", () => {
  it("renderiza o título e, após carregar, os dados do T2 (handler default)", async () => {
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { level: 1, name: /métricas eloo/i })).toBeInTheDocument();

    // O handler default do MSW retorna 2 eventos → estado "ready".
    expect(await screen.findByText(/eventos no período/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /inscrições e check-ins/i }),
    ).toBeInTheDocument();
  });

  it("mostra o estado vazio quando não há eventos", async () => {
    server.use(
      http.get(EVENTS, () => HttpResponse.json({ items: [], page: 1, page_size: 20, total: 0 })),
    );

    render(<DashboardPage />);

    expect(await screen.findByText(/nenhum evento no período/i)).toBeInTheDocument();
  });

  it("mostra erro e 'tentar novamente' quando a API falha", async () => {
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 500 })));

    render(<DashboardPage />);

    expect(await screen.findByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("usa o eventId como rótulo quando o evento não tem nome", async () => {
    server.use(
      http.get(EVENTS, () =>
        HttpResponse.json({
          items: [{ event_id: "evt_sem_nome", registered: 10, checked_in: 5, certified: 1 }],
          page: 1,
          page_size: 20,
          total: 1,
        }),
      ),
    );

    render(<DashboardPage />);

    expect(await screen.findByText(/eventos no período/i)).toBeInTheDocument();
  });
});
