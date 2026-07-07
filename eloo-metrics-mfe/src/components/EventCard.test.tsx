import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { EventCard, type EventCardProps } from "./EventCard";

function renderCard(overrides: Partial<EventCardProps> = {}) {
  const props: EventCardProps = {
    eventId: "evt_1",
    name: "AI for Business 2026",
    period: { startDate: "2026-08-10", endDate: "2026-08-12" },
    status: "ativo",
    counters: { registered: 1250, checkedIn: 850, certified: 420 },
    onSelectEvent: vi.fn(),
    ...overrides,
  };
  render(<EventCard {...props} />);
  return props;
}

describe("EventCard", () => {
  it("renderiza nome, situação e período", () => {
    renderCard();

    expect(screen.getByRole("heading", { name: "AI for Business 2026" })).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("10/08/2026 – 12/08/2026")).toBeInTheDocument();
  });

  it("renderiza os counters em pt-BR com as proporções sobre inscritos", () => {
    renderCard();

    // 1.250 inscritos; check-ins 850/1250 = 68%; certificados 420/1250 = 34%.
    expect(screen.getByText("1.250")).toBeInTheDocument();
    expect(screen.getByText("850")).toBeInTheDocument();
    expect(screen.getByText(/68\s?%/)).toBeInTheDocument();
    expect(screen.getByText("420")).toBeInTheDocument();
    expect(screen.getByText(/34\s?%/)).toBeInTheDocument();
  });

  it("chama onSelectEvent com o eventId ao clicar no card", async () => {
    const { onSelectEvent } = renderCard({ eventId: "evt_42" });

    await userEvent.click(screen.getByRole("button", { name: /ver métricas de/i }));

    expect(onSelectEvent).toHaveBeenCalledTimes(1);
    expect(onSelectEvent).toHaveBeenCalledWith("evt_42");
  });

  it("evento sem inscritos: não divide por zero, omite as proporções", () => {
    renderCard({
      name: "Hackathon 0x",
      status: "planejado",
      period: { startDate: null, endDate: null },
      counters: { registered: 0, checkedIn: 0, certified: 0 },
    });

    expect(screen.getByText("Planejado")).toBeInTheDocument();
    expect(screen.getByText("Data a definir")).toBeInTheDocument();
    // Sem inscritos não há proporção; nenhum "(...%)" é renderizado.
    expect(screen.queryByText(/\(\d/)).not.toBeInTheDocument();
  });

  it("evento sem nome cai num rótulo neutro", () => {
    renderCard({ name: null });
    expect(screen.getByRole("heading", { name: "Evento sem nome" })).toBeInTheDocument();
  });

  it("situação encerrada é rotulada em pt-BR", () => {
    renderCard({ status: "concluido" });
    expect(screen.getByText("Concluído")).toBeInTheDocument();
  });

  it("situação cancelada é rotulada em pt-BR", () => {
    renderCard({ status: "cancelado" });
    expect(screen.getByText("Cancelado")).toBeInTheDocument();
  });
});
