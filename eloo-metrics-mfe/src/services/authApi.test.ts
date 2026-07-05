import { describe, it, expect, beforeEach } from "vitest";
import { getStoredAccessToken, getStoredProfile, clearStoredAuth } from "./authApi";

beforeEach(() => localStorage.clear());

describe("authApi (storage/sessão)", () => {
  it("lê o access token do storage", () => {
    expect(getStoredAccessToken()).toBeNull();
    localStorage.setItem("mfeAuth.accessToken", "abc");
    expect(getStoredAccessToken()).toBe("abc");
  });

  it("lê o perfil quando o JSON é válido", () => {
    const profile = {
      id: "1",
      firstName: "Ana",
      lastName: "Silva",
      username: "ana",
      email: "a@x.com",
      accessLevel: "ADMIN",
    };
    localStorage.setItem("mfeAuth.profile", JSON.stringify(profile));
    expect(getStoredProfile()).toEqual(profile);
  });

  it("retorna null quando não há perfil ou o JSON é inválido", () => {
    expect(getStoredProfile()).toBeNull();
    localStorage.setItem("mfeAuth.profile", "{invalido");
    expect(getStoredProfile()).toBeNull();
  });

  it("clearStoredAuth remove token, refresh e perfil", () => {
    localStorage.setItem("mfeAuth.accessToken", "a");
    localStorage.setItem("mfeAuth.refreshToken", "r");
    localStorage.setItem("mfeAuth.profile", "{}");

    clearStoredAuth();

    expect(localStorage.getItem("mfeAuth.accessToken")).toBeNull();
    expect(localStorage.getItem("mfeAuth.refreshToken")).toBeNull();
    expect(localStorage.getItem("mfeAuth.profile")).toBeNull();
  });
});
