import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DashboardPage from "./DashboardPage";

describe("DashboardPage", () => {
  it("renderiza o título e a seção de métricas em pt-BR", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { level: 1, name: /métricas eloo/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /inscrições e check-ins/i }),
    ).toBeInTheDocument();
  });
});
