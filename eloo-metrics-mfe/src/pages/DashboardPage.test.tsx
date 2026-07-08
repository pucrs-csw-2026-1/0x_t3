import { render, screen, waitFor, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import DashboardPage from "./DashboardPage";
import * as metricsApi from "../services/metricsApi";
import * as authApi from "../services/authApi";
import type { EventMetrics, EventMetricsPage } from "../services/metricsApi";

// Mock da camada de serviço (ADR-0011): a página é testada de forma isolada,
// controlando cada estado sem tocar a rede. Garante também que o cache não vaza
// entre trocas de período.
vi.mock("../services/metricsApi");
vi.mock("../services/authApi");

const mockedList = vi.mocked(metricsApi.listEventMetrics);
const mockedEngagement = vi.mocked(metricsApi.getEngagement);
const mockedProfile = vi.mocked(authApi.getStoredProfile);

function page(items: EventMetrics[]): EventMetricsPage {
  return { items, page: 1, pageSize: 200, total: items.length };
}

function evt(partial: Partial<EventMetrics> & Pick<EventMetrics, "eventId">): EventMetrics {
  return {
    eventName: null,
    status: "ativo",
    startDate: null,
    endDate: null,
    registered: 0,
    checkedIn: 0,
    certified: 0,
    ...partial,
    eventType: partial.eventType ?? null,
  };
}

const SAMPLE: EventMetrics[] = [
  evt({ eventId: "evt_1", eventName: "Evento A", registered: 120, checkedIn: 80, certified: 40 }),
  evt({ eventId: "evt_2", eventName: "Evento B", registered: 90, checkedIn: 55, certified: 30 }),
];

beforeEach(() => {
  vi.clearAllMocks();
  mockedProfile.mockReturnValue({
    id: "u1",
    firstName: "Root",
    lastName: "Admin",
    username: "root",
    email: "root@corp.com",
    accessLevel: "ADMIN",
  });
  mockedEngagement.mockResolvedValue({ registered: 210, checkedIn: 135, rate: 0.68 });
});

describe("DashboardPage", () => {
  it("mostra o skeleton de loading antes dos dados chegarem", async () => {
    mockedList.mockResolvedValue(page(SAMPLE));

    render(<DashboardPage />);

    expect(screen.getByText(/carregando métricas/i)).toBeInTheDocument();

    // Deixa o fetch assentar para evitar update fora de act().
    await screen.findByText("210");
  });

  it("estado 'ready': soma os counters e exibe o gráfico de engajamento", async () => {
    mockedList.mockResolvedValue(page(SAMPLE));

    render(<DashboardPage />);

    // Soma: registered 120+90=210, check-ins 80+55=135, certificados 40+30=70.
    expect(await screen.findByText("210")).toBeInTheDocument();
    expect(screen.getByText("135")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();

    // Taxa de engajamento vinda de /metrics/engagement.
    expect(screen.getByText(/68\s?% taxa/)).toBeInTheDocument();

    // Gráfico com título acessível.
    expect(screen.getByRole("heading", { name: /engajamento por evento/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /gráfico de barras/i })).toBeInTheDocument();
  });

  it("título de escopo: admin vê a visão global", async () => {
    mockedList.mockResolvedValue(page(SAMPLE));

    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", { level: 1, name: /administrador global/i }),
    ).toBeInTheDocument();
  });

  it("estado vazio quando a API retorna lista vazia no período", async () => {
    mockedList.mockResolvedValue(page([]));

    render(<DashboardPage />);

    expect(await screen.findByText(/nenhum dado no período/i)).toBeInTheDocument();
  });

  it("estado de erro (fatal) com botão de retry quando os counters falham", async () => {
    mockedList.mockRejectedValue(new Error("Falha ao carregar as métricas."));

    render(<DashboardPage />);

    expect(await screen.findByText(/falha ao carregar as métricas/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("sessão expirada (401): mostra a mensagem da camada e oferece retry (redirect é do host)", async () => {
    // O serviço, num 401, limpa a sessão e dispara mfeAuth:sessionExpired (o host
    // redireciona — ver metricsApi.test); aqui a página só propaga a mensagem
    // traduzida e mantém a tela utilizável, sem redirecionar sozinha (ADR-0005).
    mockedList.mockRejectedValue(new Error("Sua sessão expirou. Entre novamente."));

    render(<DashboardPage />);

    expect(await screen.findByText(/sua sessão expirou/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("falha só do engajamento é não-fatal: mostra banner e mantém os counters", async () => {
    mockedList.mockResolvedValue(page(SAMPLE));
    mockedEngagement.mockRejectedValue(new Error("engajamento fora"));

    render(<DashboardPage />);

    expect(await screen.findByText("210")).toBeInTheDocument();
    expect(screen.getByText(/algumas métricas podem estar desatualizadas/i)).toBeInTheDocument();
  });

  it("período sempre enviado; troca de período refaz o fetch sem vazar dados antigos", async () => {
    mockedList.mockResolvedValueOnce(page(SAMPLE)).mockResolvedValueOnce(
      page([
        evt({
          eventId: "evt_x",
          eventName: "Evento X",
          registered: 999,
          checkedIn: 5,
          certified: 1,
        }),
      ]),
    );

    render(<DashboardPage />);

    expect(await screen.findByText("210")).toBeInTheDocument();

    // Primeira chamada já enviou um período (janela obrigatória — ADR-0009).
    expect(mockedList.mock.calls[0][0].startDate).toBeTruthy();
    expect(mockedList.mock.calls[0][0].endDate).toBeTruthy();

    // Troca para "Hoje".
    await userEvent.click(screen.getByRole("combobox", { name: /período/i }));
    await userEvent.click(screen.getByRole("option", { name: /^hoje$/i }));

    // Refez o fetch com nova janela e trocou os dados (sem cache vazado).
    expect(await screen.findByText("999")).toBeInTheDocument();
    expect(screen.queryByText("210")).not.toBeInTheDocument();

    await waitFor(() => expect(mockedList).toHaveBeenCalledTimes(2));
    expect(mockedList.mock.calls[1][0].startDate).not.toBe(mockedList.mock.calls[0][0].startDate);
  });

  it("ao vivo: polling refaz um fetch silencioso e sobe os counters sem skeleton", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      mockedList.mockResolvedValueOnce(page(SAMPLE)).mockResolvedValue(
        page([
          evt({
            eventId: "evt_1",
            eventName: "Evento A",
            registered: 500,
            checkedIn: 300,
            certified: 100,
          }),
        ]),
      );

      render(<DashboardPage />);
      expect(await screen.findByText("210")).toBeInTheDocument();

      // Avança 5s → o polling "ao vivo" dispara um refresh silencioso.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5100);
      });

      // Counters atualizados, sem voltar ao skeleton de loading.
      expect(await screen.findByText("500")).toBeInTheDocument();
      expect(screen.queryByText(/carregando métricas/i)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("ao vivo desligado: não faz polling adicional", async () => {
    mockedList.mockResolvedValue(page(SAMPLE));

    render(<DashboardPage />);
    expect(await screen.findByText("210")).toBeInTheDocument();

    // Desliga o "Ao vivo".
    await userEvent.click(screen.getByRole("checkbox", { name: /atualização ao vivo/i }));
    expect(mockedList).toHaveBeenCalledTimes(1);
  });

  it("renderiza o ranking de eventos por adesão (melhores e piores)", async () => {
    mockedList.mockResolvedValue(
      page([
        // Melhor adesão: 80/100 = 80%. Pior: 20/100 = 20%.
        evt({
          eventId: "top",
          eventName: "Evento Top",
          registered: 100,
          checkedIn: 80,
          certified: 10,
        }),
        evt({
          eventId: "low",
          eventName: "Evento Fraco",
          registered: 100,
          checkedIn: 20,
          certified: 5,
        }),
      ]),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", { name: /ranking de eventos por adesão/i }),
    ).toBeInTheDocument();

    const melhores = screen.getByRole("region", { name: /melhores eventos por adesão/i });
    expect(within(melhores).getByText("Evento Top")).toBeInTheDocument();
    expect(within(melhores).getByText(/80\s?%/)).toBeInTheDocument();

    const piores = screen.getByRole("region", { name: /piores eventos por adesão/i });
    expect(within(piores).getByText("Evento Fraco")).toBeInTheDocument();
    expect(within(piores).getByText(/20\s?%/)).toBeInTheDocument();
  });
});
