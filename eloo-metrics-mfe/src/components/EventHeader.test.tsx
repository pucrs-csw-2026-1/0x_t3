import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { EventHeader } from "./EventHeader";

describe("EventHeader", () => {
  it("renderiza nome, situação e a janela do evento", () => {
    render(
      <EventHeader
        name="AI for Business 2026"
        period="15/01/2026 – 30/06/2026"
        status="ativo"
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "AI for Business 2026" })).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("15/01/2026 – 30/06/2026")).toBeInTheDocument();
  });

  it("chama onBack ao clicar em voltar", async () => {
    const onBack = vi.fn();
    render(<EventHeader name="Evento" period="—" status="concluido" onBack={onBack} />);

    await userEvent.click(screen.getByRole("button", { name: /voltar ao catálogo/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("exibe o indicador de escopo quando informado (manager)", () => {
    render(
      <EventHeader
        name="Evento"
        period="—"
        status="ativo"
        onBack={vi.fn()}
        scopeLabel="Seu escopo"
      />,
    );

    expect(screen.getByText("Seu escopo")).toBeInTheDocument();
  });

  it("evento sem nome cai num rótulo neutro", () => {
    render(<EventHeader name={null} period="—" status="planejado" onBack={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Evento sem nome" })).toBeInTheDocument();
    expect(screen.getByText("Planejado")).toBeInTheDocument();
  });

  it("evento cancelado exibe o chip Cancelado", () => {
    render(<EventHeader name="Evento" period="—" status="cancelado" onBack={vi.fn()} />);
    expect(screen.getByText("Cancelado")).toBeInTheDocument();
  });
});
