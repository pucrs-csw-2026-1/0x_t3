import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("usa a mensagem padrão (sem dados no período) quando sem props", () => {
    render(<EmptyState />);

    expect(screen.getByText(/nenhum dado no período/i)).toBeInTheDocument();
    expect(screen.getByText(/ajuste o filtro/i)).toBeInTheDocument();
  });

  it("mensagem de escopo: manager sem eventos atribuídos", () => {
    render(
      <EmptyState
        title="Nenhum evento sob sua gestão"
        description="Você ainda não tem eventos atribuídos ao seu escopo."
      />,
    );

    expect(screen.getByText(/nenhum evento sob sua gestão/i)).toBeInTheDocument();
    expect(screen.getByText(/eventos atribuídos ao seu escopo/i)).toBeInTheDocument();
  });

  it("mensagem de período: nenhum evento no período selecionado", () => {
    render(
      <EmptyState
        title="Nenhum evento no período"
        description="Não encontramos eventos para o período selecionado."
      />,
    );

    expect(screen.getByText(/nenhum evento no período/i)).toBeInTheDocument();
    expect(screen.getByText(/para o período selecionado/i)).toBeInTheDocument();
  });
});
