import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DistributionPanel } from "./DistributionPanel";

describe("DistributionPanel", () => {
  it("loading: mostra o skeleton (aria-busy) e não o conteúdo", () => {
    render(
      <DistributionPanel title="Faixa Etária" loading>
        <div>conteúdo</div>
      </DistributionPanel>,
    );
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByText("conteúdo")).not.toBeInTheDocument();
  });

  it("erro: mostra ErrorAlert com retry e dispara onRetry", async () => {
    const onRetry = vi.fn();
    render(
      <DistributionPanel title="Gênero" error="Falha ao carregar" onRetry={onRetry}>
        <div>conteúdo</div>
      </DistributionPanel>,
    );
    expect(screen.getByText(/falha ao carregar/i)).toBeInTheDocument();
    expect(screen.queryByText("conteúdo")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("vazio: mostra a mensagem específica da categoria", () => {
    render(
      <DistributionPanel title="Tipo de Evento" empty>
        <div>conteúdo</div>
      </DistributionPanel>,
    );
    expect(screen.getByText(/sem dados para esta categoria/i)).toBeInTheDocument();
    expect(screen.queryByText("conteúdo")).not.toBeInTheDocument();
  });

  it("pronto: renderiza o conteúdo com título acessível (section rotulada)", () => {
    render(
      <DistributionPanel title="Cidades" description="Top 10">
        <div>gráfico</div>
      </DistributionPanel>,
    );
    expect(screen.getByRole("region", { name: /cidades/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /cidades/i })).toBeInTheDocument();
    expect(screen.getByText("gráfico")).toBeInTheDocument();
  });
});
