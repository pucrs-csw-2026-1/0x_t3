import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GenderDistributionChart } from "./GenderDistributionChart";
import type { GenderDistribution } from "../../services/metricsApi";

const DATA: GenderDistribution[] = [
  { gender: "Feminino", label: "Feminino", count: 52 },
  { gender: "Masculino", label: "Masculino", count: 41 },
  { gender: "Outro", label: "Outro", count: 7 },
];

describe("GenderDistributionChart", () => {
  it("renderiza a legenda com as categorias de gênero", () => {
    render(<GenderDistributionChart data={DATA} />);
    expect(screen.getByText("Feminino")).toBeInTheDocument();
    expect(screen.getByText("Masculino")).toBeInTheDocument();
    expect(screen.getByText("Outro")).toBeInTheDocument();
  });

  it("mostra os percentuais no locale pt-BR (total 100)", () => {
    render(<GenderDistributionChart data={DATA} />);
    expect(screen.getByText("52,0%")).toBeInTheDocument();
    expect(screen.getByText("41,0%")).toBeInTheDocument();
    expect(screen.getByText("7,0%")).toBeInTheDocument();
  });

  it("é acessível: role img com aria-label de gráfico de pizza", () => {
    render(<GenderDistributionChart data={DATA} />);
    expect(
      screen.getByRole("img", { name: /pizza da distribuição por gênero/i }),
    ).toBeInTheDocument();
  });

  it("dados vazios: mostra estado vazio, não uma rosca quebrada", () => {
    render(<GenderDistributionChart data={[]} />);
    expect(screen.getByText(/sem dados de gênero/i)).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /pizza/i })).not.toBeInTheDocument();
  });

  it("total zero (todas as categorias em 0): estado vazio em vez de arcos NaN", () => {
    render(
      <GenderDistributionChart
        data={[
          { gender: "Feminino", label: "Feminino", count: 0 },
          { gender: "Masculino", label: "Masculino", count: 0 },
        ]}
      />,
    );
    expect(screen.getByText(/sem dados de gênero/i)).toBeInTheDocument();
  });
});
