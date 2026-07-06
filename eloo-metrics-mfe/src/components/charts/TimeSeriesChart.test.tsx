import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TimeSeriesChart } from "./TimeSeriesChart";
import type { TimeSeriesPoint } from "../../services/metricsApi";

const DATA: TimeSeriesPoint[] = [
  { bucket: "2026-05", date: new Date(2026, 4, 1), registered: 1080, checkedIn: 720 },
  { bucket: "2026-06", date: new Date(2026, 5, 1), registered: 1250, checkedIn: 850 },
];

describe("TimeSeriesChart", () => {
  it("renderiza o gráfico com título e legenda das séries", () => {
    render(<TimeSeriesChart data={DATA} granularity="month" />);

    expect(screen.getByRole("heading", { name: /série histórica/i })).toBeInTheDocument();
    expect(screen.getByText("Inscrições")).toBeInTheDocument();
    expect(screen.getByText("Check-ins")).toBeInTheDocument();
  });

  it("é acessível: role img com aria-label de gráfico de linha", () => {
    render(<TimeSeriesChart data={DATA} granularity="month" />);
    expect(
      screen.getByRole("img", { name: /gráfico de linha da série histórica/i }),
    ).toBeInTheDocument();
  });

  it("renderiza o estado vazio quando não há dados", () => {
    render(<TimeSeriesChart data={[]} granularity="month" empty />);
    expect(screen.getByText(/sem dados para o período selecionado/i)).toBeInTheDocument();
  });

  it("renderiza erro com retry", () => {
    render(
      <TimeSeriesChart
        data={[]}
        granularity="month"
        error="Falha ao carregar a série."
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText("Falha ao carregar a série.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
