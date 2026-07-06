import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/msw/server";
import EventCatalogPage from "./EventCatalogPage";
import { SESSION_EXPIRED_EVENT } from "../services/authApi";

// Integração com MSW contra o contrato do T2 (ADR-0009/0011) — sem mock manual
// de fetch. Cada teste sobrescreve o handler para exercitar um estado.
const EVENTS = "*/api/metrics/events";

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("mfeAuth.accessToken", "tok-123");
});

function setProfile(accessLevel: "ADMIN" | "MANAGER") {
  localStorage.setItem(
    "mfeAuth.profile",
    JSON.stringify({
      id: "u1",
      firstName: "Maria",
      lastName: "Gestora",
      username: "maria",
      email: "maria@corp.com",
      accessLevel,
    }),
  );
}

describe("EventCatalogPage (integração MSW)", () => {
  it("loading → renderiza os eventos retornados", async () => {
    render(<EventCatalogPage onSelectEvent={vi.fn()} />);

    // Estado de loading antes dos dados (skeletons têm região aria-busy).
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();

    // Dados do handler base (Evento A / Evento B).
    expect(await screen.findByRole("heading", { name: "Evento A" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Evento B" })).toBeInTheDocument();
    // Total refletido na paginação.
    expect(screen.getByText(/Mostrando 1–2 de 2 eventos/)).toBeInTheDocument();
  });

  it("período sempre enviado na carga inicial (start_date/end_date)", async () => {
    let query: URLSearchParams | null = null;
    server.use(
      http.get(EVENTS, ({ request }) => {
        query = new URL(request.url).searchParams;
        return HttpResponse.json({ items: [], page: 1, page_size: 10, total: 0 });
      }),
    );

    render(<EventCatalogPage onSelectEvent={vi.fn()} />);

    await screen.findByText(/nenhum evento no período/i);
    expect(query!.get("start_date")).toBeTruthy();
    expect(query!.get("end_date")).toBeTruthy();
    // page_size inicial = 10 (US-04).
    expect(query!.get("page_size")).toBe("10");
    expect(query!.get("page")).toBe("1");
  });

  it("erro na API → ErrorAlert com retry funcional", async () => {
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 500 })));

    render(<EventCatalogPage onSelectEvent={vi.fn()} />);

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument();

    // Retry volta a funcionar: religa o handler de sucesso e reclica.
    server.use(
      http.get(EVENTS, () =>
        HttpResponse.json({
          items: [
            {
              event_id: "evt_ok",
              event_name: "Evento Recuperado",
              status: "active",
              registered: 5,
              checked_in: 3,
              certified: 1,
            },
          ],
          page: 1,
          page_size: 10,
          total: 1,
        }),
      ),
    );

    await userEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(await screen.findByRole("heading", { name: "Evento Recuperado" })).toBeInTheDocument();
  });

  it("resposta vazia (admin) → EmptyState de período", async () => {
    setProfile("ADMIN");
    server.use(
      http.get(EVENTS, () => HttpResponse.json({ items: [], page: 1, page_size: 10, total: 0 })),
    );

    render(<EventCatalogPage onSelectEvent={vi.fn()} />);

    expect(await screen.findByText(/nenhum evento no período/i)).toBeInTheDocument();
  });

  it("resposta vazia (manager) → EmptyState de escopo", async () => {
    setProfile("MANAGER");
    server.use(
      http.get(EVENTS, () => HttpResponse.json({ items: [], page: 1, page_size: 10, total: 0 })),
    );

    render(<EventCatalogPage onSelectEvent={vi.fn()} />);

    expect(await screen.findByText(/nenhum evento sob sua gestão/i)).toBeInTheDocument();
  });

  it("troca de página → novo fetch com page correto; troca de período reseta para página 1", async () => {
    const calls: { page: string | null; start: string | null }[] = [];
    server.use(
      http.get(EVENTS, ({ request }) => {
        const url = new URL(request.url);
        calls.push({
          page: url.searchParams.get("page"),
          start: url.searchParams.get("start_date"),
        });
        const page = Number(url.searchParams.get("page") ?? 1);
        return HttpResponse.json({
          items: [
            {
              event_id: `evt_p${page}`,
              event_name: `Evento pág ${page}`,
              status: "active",
              registered: 10,
              checked_in: 5,
              certified: 1,
            },
          ],
          page,
          page_size: 10,
          total: 25,
        });
      }),
    );

    render(<EventCatalogPage onSelectEvent={vi.fn()} />);

    expect(await screen.findByRole("heading", { name: "Evento pág 1" })).toBeInTheDocument();
    const firstStart = calls[0].start;

    // Próxima página → fetch com page=2 (paginação server-side).
    await userEvent.click(screen.getByRole("button", { name: /próxima página/i }));
    expect(await screen.findByRole("heading", { name: "Evento pág 2" })).toBeInTheDocument();
    expect(calls[calls.length - 1].page).toBe("2");

    // Troca de período volta para a página 1 e refaz o fetch com nova janela.
    await userEvent.click(screen.getByRole("combobox", { name: /período/i }));
    await userEvent.click(screen.getByRole("option", { name: /^hoje$/i }));

    await waitFor(() => expect(calls[calls.length - 1].page).toBe("1"));
    expect(calls[calls.length - 1].start).not.toBe(firstStart);
  });

  it("401 → dispara o mecanismo de redirect do host (sessionExpired), sem tratar localmente", async () => {
    server.use(http.get(EVENTS, () => new HttpResponse(null, { status: 401 })));
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    render(<EventCatalogPage onSelectEvent={vi.fn()} />);

    // A camada de serviço sinaliza a expiração (o host redireciona) e a página
    // apenas propaga a mensagem, sem redirecionar sozinha (ADR-0005).
    expect(await screen.findByText(/sua sessão expirou/i)).toBeInTheDocument();
    expect(onExpired).toHaveBeenCalledTimes(1);

    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it("clicar num EventCard → chama onSelectEvent com o eventId correto", async () => {
    const onSelectEvent = vi.fn();
    render(<EventCatalogPage onSelectEvent={onSelectEvent} />);

    const card = await screen.findByRole("button", { name: /ver métricas de evento a/i });
    await userEvent.click(card);

    expect(onSelectEvent).toHaveBeenCalledWith("evt_1");
  });

  it("busca local filtra por nome no resultado atual (sem novo fetch)", async () => {
    let requestCount = 0;
    server.use(
      http.get(EVENTS, () => {
        requestCount += 1;
        return HttpResponse.json({
          items: [
            {
              event_id: "evt_a",
              event_name: "Cloud Bootcamp",
              status: "active",
              registered: 10,
              checked_in: 5,
              certified: 1,
            },
            {
              event_id: "evt_b",
              event_name: "UX Masterclass",
              status: "active",
              registered: 20,
              checked_in: 8,
              certified: 2,
            },
          ],
          page: 1,
          page_size: 10,
          total: 2,
        });
      }),
    );

    render(<EventCatalogPage onSelectEvent={vi.fn()} />);

    await screen.findByRole("heading", { name: "Cloud Bootcamp" });
    const requestsAfterLoad = requestCount;

    await userEvent.type(screen.getByRole("searchbox", { name: /buscar eventos/i }), "cloud");

    expect(screen.getByRole("heading", { name: "Cloud Bootcamp" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "UX Masterclass" })).not.toBeInTheDocument();
    // Busca é local: nenhum fetch adicional foi disparado.
    expect(requestCount).toBe(requestsAfterLoad);
  });
});
