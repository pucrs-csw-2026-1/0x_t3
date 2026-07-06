import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/msw/server";
import DemographicsPage from "./DemographicsPage";
import * as metricsApi from "../services/metricsApi";
import { SESSION_EXPIRED_EVENT } from "../services/authApi";

// Integração via MSW (ADR-0011): a página exercita a camada de serviço real
// contra o contrato do T2 (ADR-0009). Handlers base cobrem o caminho feliz;
// cada teste sobrescreve o que precisa para vazio/erro.
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("mfeAuth.accessToken", "tok-123");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DemographicsPage (integração MSW)", () => {
  it("loading → renderiza dados de cada distribuição", async () => {
    render(<DemographicsPage />);

    // Rótulos aparecem no eixo do gráfico (SVG) e na legenda acessível → >= 1.
    // Faixa etária (8 faixas garantidas pela normalização do serviço).
    expect((await screen.findAllByText("18-24")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Desconhecido").length).toBeGreaterThan(0);
    // Gênero (legenda da pizza), cidade, perfil e tipo.
    expect(screen.getByText("Feminino")).toBeInTheDocument();
    expect(screen.getAllByText("São Paulo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Profissional").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Workshop").length).toBeGreaterThan(0);
  });

  it("falha em um endpoint não bloqueia os outros painéis", async () => {
    server.use(http.get("*/api/metrics/by-city", () => new HttpResponse(null, { status: 500 })));

    render(<DemographicsPage />);

    // Os demais painéis renderizam normalmente…
    expect(await screen.findByText("Feminino")).toBeInTheDocument();
    expect(screen.getAllByText("Workshop").length).toBeGreaterThan(0);
    // …e o painel de cidades exibe erro com retry, sem derrubar a tela.
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.queryByText("São Paulo")).not.toBeInTheDocument();
  });

  it("categoria sem dados (200 com contagem zero) mostra o estado vazio", async () => {
    // Resposta válida, porém sem participantes → o painel do tipo deve cair no
    // EmptyState com a mensagem específica da categoria, sem afetar os demais.
    server.use(
      http.get("*/api/metrics/by-type", () =>
        HttpResponse.json([{ event_type: "workshop", count: 0 }]),
      ),
    );

    render(<DemographicsPage />);

    expect(await screen.findByText(/sem dados para esta categoria/i)).toBeInTheDocument();
    // Os demais painéis seguem renderizando normalmente.
    expect(screen.getByText("Feminino")).toBeInTheDocument();
    expect(screen.getAllByText("São Paulo").length).toBeGreaterThan(0);
  });

  it("401 em um endpoint dispara mfeAuth:sessionExpired", async () => {
    server.use(http.get("*/api/metrics/by-age", () => new HttpResponse(null, { status: 401 })));
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    render(<DemographicsPage />);

    await waitFor(() => expect(onExpired).toHaveBeenCalled());
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it("403 exibe mensagem de permissão no painel", async () => {
    server.use(http.get("*/api/metrics/by-gender", () => new HttpResponse(null, { status: 403 })));

    render(<DemographicsPage />);

    expect(await screen.findByText(/não tem permissão/i)).toBeInTheDocument();
    // Outros painéis seguem funcionando.
    expect(screen.getAllByText("Workshop").length).toBeGreaterThan(0);
  });

  it("intervalo inválido (from > to) exibe erro inline e não dispara fetch", async () => {
    const ageSpy = vi.spyOn(metricsApi, "getByAge");

    render(<DemographicsPage />);
    await screen.findAllByText("18-24");
    const callsAfterInitialLoad = ageSpy.mock.calls.length;
    expect(callsAfterInitialLoad).toBeGreaterThan(0);

    // Ativa o período personalizado e inverte o intervalo (De depois de Até).
    await userEvent.click(screen.getByRole("combobox", { name: /período/i }));
    await userEvent.click(screen.getByRole("option", { name: /personalizado/i }));
    fireEvent.change(screen.getByLabelText("De"), { target: { value: "2026-12-01" } });
    fireEvent.change(screen.getByLabelText("Até"), { target: { value: "2026-01-01" } });

    // Erro inline no toolbar (não alert global) e nenhum novo fetch disparado.
    expect(await screen.findByRole("alert")).toHaveTextContent(/não pode ser posterior/i);
    expect(ageSpy.mock.calls.length).toBe(callsAfterInitialLoad);
  });
});
