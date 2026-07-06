import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renderiza a variante skeleton quando value === undefined", () => {
    const { container } = render(<MetricCard label="Inscritos" value={undefined} />);

    // Skeleton do MUI aplica a classe MuiSkeleton-root; o rótulo não aparece.
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
    expect(screen.queryByText("Inscritos")).not.toBeInTheDocument();
  });

  it("renderiza rótulo e valor formatado em pt-BR quando há dados", () => {
    render(<MetricCard label="Inscritos" value={1250} />);

    expect(screen.getByText("Inscritos")).toBeInTheDocument();
    expect(screen.getByText("1.250")).toBeInTheDocument();
  });

  it("mostra a nota (ex.: taxa) quando fornecida e sem trend", () => {
    render(<MetricCard label="Check-ins" value={850} note="68% taxa" />);

    expect(screen.getByText("68% taxa")).toBeInTheDocument();
  });

  it("valor zero é renderizado como número, não como skeleton", () => {
    const { container } = render(<MetricCard label="Certificados" value={0} />);

    expect(container.querySelector(".MuiSkeleton-root")).not.toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
