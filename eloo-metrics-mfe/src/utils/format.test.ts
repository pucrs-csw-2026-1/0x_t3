import { describe, it, expect } from "vitest";
import { formatNumber, formatDate, formatPercent } from "./format";

// Técnicas de caixa-preta (ADR-0011): partição de equivalência + valor-limite.

describe("formatNumber", () => {
  it("aplica separador de milhar pt-BR", () => {
    expect(formatNumber(1250)).toBe("1.250");
    expect(formatNumber(1000000)).toBe("1.000.000");
  });

  it("valor-limite: zero e negativos", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(-42)).toBe("-42");
  });

  it("entrada inválida vira traço", () => {
    expect(formatNumber(undefined)).toBe("—");
    expect(formatNumber(null)).toBe("—");
    expect(formatNumber(Number.NaN)).toBe("—");
  });
});

describe("formatDate", () => {
  it("formata ISO YYYY-MM-DD como dd/mm/aaaa (sem deslocamento de fuso)", () => {
    expect(formatDate("2024-05-24")).toBe("24/05/2024");
  });

  it("valor-limite: primeiro dia do ano", () => {
    expect(formatDate("2026-01-01")).toBe("01/01/2026");
  });

  it("aceita objeto Date", () => {
    expect(formatDate(new Date(2026, 6, 5))).toBe("05/07/2026");
  });

  it("entrada inválida vira traço", () => {
    expect(formatDate("não-é-data")).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate(null)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("formata razão 0..1 como percentual pt-BR", () => {
    expect(formatPercent(0.68)).toMatch(/68\s?%/);
    expect(formatPercent(1)).toMatch(/100\s?%/);
  });

  it("valor-limite: zero", () => {
    expect(formatPercent(0)).toMatch(/0\s?%/);
  });

  it("respeita casas decimais", () => {
    expect(formatPercent(0.1234, 1)).toMatch(/12,3\s?%/);
  });

  it("entrada inválida vira traço", () => {
    expect(formatPercent(undefined)).toBe("—");
    expect(formatPercent(Number.NaN)).toBe("—");
  });
});
