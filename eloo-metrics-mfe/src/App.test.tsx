import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import App from "./App";

// Página inicial por papel (US-06): manager aterrissa no catálogo (cuida de
// eventos individuais); admin vai ao dashboard. Integração via MSW — os
// handlers base respondem os fetches disparados pela página de destino.

function setProfile(accessLevel: "ADMIN" | "MANAGER") {
  localStorage.setItem(
    "mfeAuth.profile",
    JSON.stringify({
      id: "u1",
      firstName: "Gestora",
      lastName: "Local",
      username: "gestora",
      email: "gestora@local.dev",
      accessLevel,
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("mfeAuth.accessToken", "tok-123");
});

describe("App (roteamento standalone por papel)", () => {
  it("manager entra pelo catálogo, não pelo dashboard", async () => {
    setProfile("MANAGER");
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: /catálogo de eventos/i }),
    ).toBeInTheDocument();
  });

  it("admin entra pelo dashboard (visão global)", async () => {
    setProfile("ADMIN");
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: /administrador global/i }),
    ).toBeInTheDocument();
  });

  it("manager não acessa o dashboard nem pela rota direta (volta ao catálogo)", async () => {
    setProfile("MANAGER");
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: /catálogo de eventos/i }),
    ).toBeInTheDocument();
  });

  it("manager não vê o item Dashboard na navegação", async () => {
    setProfile("MANAGER");
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    await screen.findByRole("heading", { level: 1, name: /catálogo de eventos/i });
    expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /distribuições demográficas/i })).toBeInTheDocument();
  });
});
