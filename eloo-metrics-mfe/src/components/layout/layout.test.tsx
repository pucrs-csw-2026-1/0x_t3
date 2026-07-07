import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { describe, it, expect, vi } from "vitest";
import { SideNavBar } from "./SideNavBar";
import { TopNavBar } from "./TopNavBar";
import { theme } from "../../theme";

// Chrome do shell standalone: liga a navegação real (Dashboard / Catálogo) às
// rotas. Precisa de um Router porque agora usa NavLink/useLocation.
function renderWithRouter(ui: ReactNode, initialPath = "/") {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </ThemeProvider>,
  );
}

describe("chrome do shell standalone", () => {
  it("SideNavBar liga os itens às rotas de Dashboard e Catálogo", () => {
    renderWithRouter(<SideNavBar />);

    const dashboard = screen.getByRole("link", { name: /dashboard/i });
    const catalogo = screen.getByRole("link", { name: /catálogo de eventos/i });
    expect(dashboard).toHaveAttribute("href", "/dashboard");
    expect(catalogo).toHaveAttribute("href", "/catalogo");
    expect(screen.getByRole("button", { name: /novo evento/i })).toBeInTheDocument();
    // Logo da Eloo no topo da sidebar.
    expect(screen.getByRole("img", { name: /eloo/i })).toBeInTheDocument();
  });

  it("SideNavBar marca a rota ativa (aria-current) conforme a URL", () => {
    renderWithRouter(<SideNavBar />, "/catalogo");

    expect(screen.getByRole("link", { name: /catálogo de eventos/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("navegar pela SideNavBar dispara onNavigate (fecha o drawer no mobile)", async () => {
    const onNavigate = vi.fn();
    renderWithRouter(<SideNavBar onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole("link", { name: /catálogo de eventos/i }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("TopNavBar não duplica a navegação (fonte única é a SideNavBar) e mantém a busca", () => {
    renderWithRouter(<TopNavBar />);

    // A navegação vive só na SideNavBar; o topo não repete Dashboard/Catálogo.
    expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /catálogo de eventos/i })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });

  it("o botão de menu (mobile) dispara onMenuClick", async () => {
    const onMenuClick = vi.fn();
    renderWithRouter(<TopNavBar onMenuClick={onMenuClick} />);

    await userEvent.click(screen.getByRole("button", { name: /abrir menu/i }));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("avatar do topo mostra as iniciais do usuário logado (não o AG estático)", () => {
    localStorage.setItem(
      "mfeAuth.profile",
      JSON.stringify({
        id: "u1",
        firstName: "Maria",
        lastName: "Silva",
        username: "maria",
        email: "maria@local.dev",
        accessLevel: "ADMIN",
      }),
    );

    renderWithRouter(<TopNavBar />);

    expect(screen.getByLabelText(/usuário logado/i)).toHaveTextContent("MS");
    localStorage.clear();
  });

  it("avatar sem sessão cai num placeholder neutro", () => {
    localStorage.clear();
    renderWithRouter(<TopNavBar />);

    expect(screen.getByLabelText(/usuário logado/i)).toHaveTextContent("?");
  });
});
