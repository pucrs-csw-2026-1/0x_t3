import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { describe, it, expect, vi } from "vitest";
import { SideNavBar } from "./SideNavBar";
import { TopNavBar } from "./TopNavBar";
import { theme } from "../../theme";

// Chrome do shell standalone: presentacional. Smoke test garante que renderiza e
// espelha os rótulos da referência (pt-BR).
describe("chrome do shell standalone", () => {
  it("SideNavBar renderiza os itens de navegação", () => {
    render(
      <ThemeProvider theme={theme}>
        <SideNavBar />
      </ThemeProvider>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Participantes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /novo evento/i })).toBeInTheDocument();
    // Logo da Eloo no topo da sidebar.
    expect(screen.getByRole("img", { name: /eloo/i })).toBeInTheDocument();
  });

  it("SideNavBar com tabs (mobile) inclui as abas do topo no mesmo painel", () => {
    render(
      <ThemeProvider theme={theme}>
        <SideNavBar tabs={["Visão Geral", "Relatórios"]} />
      </ThemeProvider>,
    );

    // Seção "Navegação" com as abas + a navegação lateral, tudo junto.
    expect(screen.getByText("Navegação")).toBeInTheDocument();
    expect(screen.getByText("Visão Geral")).toBeInTheDocument();
    expect(screen.getByText("Relatórios")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("TopNavBar renderiza as abas e a busca", () => {
    render(
      <ThemeProvider theme={theme}>
        <TopNavBar />
      </ThemeProvider>,
    );

    expect(screen.getByText("Visão Geral")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });

  it("o botão de menu (mobile) dispara onMenuClick", async () => {
    const onMenuClick = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <TopNavBar onMenuClick={onMenuClick} />
      </ThemeProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: /abrir menu/i }));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });
});
