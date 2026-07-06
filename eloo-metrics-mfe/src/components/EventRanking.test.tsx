import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EventRanking } from "./EventRanking";
import type { RankedEvent } from "../utils/ranking";

const BEST: RankedEvent[] = [
  { eventId: "a", eventName: "Cloud Bootcamp", registered: 140, checkedIn: 130, rate: 0.9286 },
];
const WORST: RankedEvent[] = [
  { eventId: "z", eventName: "Design Sprint", registered: 160, checkedIn: 40, rate: 0.25 },
];

describe("EventRanking", () => {
  it("renderiza as colunas de melhores e piores com taxa em pt-BR", () => {
    render(<EventRanking best={BEST} worst={WORST} />);

    const melhores = screen.getByRole("region", { name: /melhores eventos por adesão/i });
    expect(within(melhores).getByText("Cloud Bootcamp")).toBeInTheDocument();
    expect(within(melhores).getByText(/93\s?%/)).toBeInTheDocument();

    const piores = screen.getByRole("region", { name: /piores eventos por adesão/i });
    expect(within(piores).getByText("Design Sprint")).toBeInTheDocument();
    expect(within(piores).getByText(/25\s?%/)).toBeInTheDocument();
  });

  it("mostra detalhe de check-ins/inscritos", () => {
    render(<EventRanking best={BEST} worst={[]} />);
    expect(screen.getByText(/130 de 140 inscritos/i)).toBeInTheDocument();
  });

  it("trata coluna vazia", () => {
    render(<EventRanking best={[]} worst={WORST} />);
    expect(screen.getByText(/sem eventos no período/i)).toBeInTheDocument();
  });
});
