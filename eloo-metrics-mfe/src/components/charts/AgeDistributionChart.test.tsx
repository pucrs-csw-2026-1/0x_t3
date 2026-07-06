import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AgeDistributionChart } from "./AgeDistributionChart";
import { AGE_RANGES } from "../../utils/demographics";
import type { AgeDistribution } from "../../services/metricsApi";

// Dados como saem da camada de serviço: sempre as 8 faixas canônicas.
const DATA: AgeDistribution[] = AGE_RANGES.map((range, index) => ({
  range,
  label: range,
  count: (index + 1) * 10, // 10,20,…,80  → total 360
}));

describe("AgeDistributionChart", () => {
  it("renderiza as 8 faixas etárias (incluindo 'Desconhecido')", () => {
    render(<AgeDistributionChart data={DATA} />);
    for (const range of AGE_RANGES) {
      // Aparece pelo menos na legenda acessível (dt).
      expect(screen.getAllByText(range).length).toBeGreaterThan(0);
    }
  });

  it("exibe valor absoluto e percentual (locale pt-BR) por faixa", () => {
    render(<AgeDistributionChart data={DATA} />);
    // 10/360 = 2,8% ; 80/360 = 22,2%
    expect(screen.getByText("2,8%")).toBeInTheDocument();
    expect(screen.getByText("22,2%")).toBeInTheDocument();
  });

  it("é acessível: expõe role img com aria-label descritivo", () => {
    render(<AgeDistributionChart data={DATA} />);
    expect(screen.getByRole("img", { name: /distribuição por faixa etária/i })).toBeInTheDocument();
  });
});
