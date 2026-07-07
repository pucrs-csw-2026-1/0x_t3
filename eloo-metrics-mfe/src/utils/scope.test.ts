import { describe, it, expect } from "vitest";
import { resolveScope } from "./scope";
import type { UserProfile } from "../services/authApi";

function profile(overrides: Partial<UserProfile>): UserProfile {
  return {
    id: "u1",
    firstName: "Ana",
    lastName: "Silva",
    username: "ana.silva",
    email: "ana@corp.com",
    accessLevel: "MANAGER",
    ...overrides,
  };
}

describe("resolveScope", () => {
  it("admin: título de visão global", () => {
    const scope = resolveScope(profile({ accessLevel: "ADMIN" }));
    expect(scope.title).toMatch(/administrador global/i);
  });

  it("manager: título com o nome do escopo (nome do gestor)", () => {
    const scope = resolveScope(profile({ accessLevel: "MANAGER" }));
    expect(scope.title).toMatch(/escopo de ana silva/i);
  });

  it("manager sem nome: cai no username", () => {
    const scope = resolveScope(
      profile({ accessLevel: "MANAGER", firstName: "", lastName: "", username: "gestor42" }),
    );
    expect(scope.title).toMatch(/gestor42/);
  });

  it("perfil ausente: título neutro", () => {
    const scope = resolveScope(null);
    expect(scope.title).toBe("Dashboard");
  });

  it("manager sem nome e sem username: fallback sem espaço solto", () => {
    const scope = resolveScope(
      profile({ accessLevel: "MANAGER", firstName: "", lastName: "", username: "" }),
    );
    expect(scope.title).toMatch(/sua gestão/i);
    expect(scope.title.endsWith("de ")).toBe(false);
  });
});
