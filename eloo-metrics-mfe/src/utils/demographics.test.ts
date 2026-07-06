import { describe, it, expect } from "vitest";
import {
  toMonthBucket,
  periodToMonthRange,
  validatePeriod,
  toAgeRange,
  genderLabel,
  profileLabel,
  typeLabel,
  AGE_RANGES,
} from "./demographics";

describe("toMonthBucket / periodToMonthRange", () => {
  it("recorta o mês (YYYY-MM) de uma data ISO", () => {
    expect(toMonthBucket("2026-07-15")).toBe("2026-07");
    expect(toMonthBucket("")).toBe("");
    expect(toMonthBucket(null)).toBe("");
  });

  it("deriva a janela mensal a partir do período de datas", () => {
    expect(periodToMonthRange({ startDate: "2026-06-01", endDate: "2026-07-31" })).toEqual({
      from: "2026-06",
      to: "2026-07",
    });
  });
});

describe("validatePeriod (bloqueia fetch inválido — evita 422)", () => {
  it("aceita um intervalo válido (from <= to)", () => {
    expect(validatePeriod({ startDate: "2026-06-01", endDate: "2026-07-31" })).toBeNull();
    // mesmo mês nas duas pontas é válido (valor-limite)
    expect(validatePeriod({ startDate: "2026-07-01", endDate: "2026-07-31" })).toBeNull();
  });

  it("rejeita intervalo invertido (from > to)", () => {
    expect(validatePeriod({ startDate: "2026-08-01", endDate: "2026-07-31" })).toMatch(
      /não pode ser posterior/i,
    );
  });

  it("rejeita datas ausentes ou formato inválido", () => {
    expect(validatePeriod({ startDate: "", endDate: "2026-07-01" })).toMatch(/mês inicial/i);
    expect(validatePeriod({ startDate: "2026-13-01", endDate: "2026-14-01" })).toMatch(
      /formato AAAA-MM/i,
    );
  });
});

describe("toAgeRange (faixas canônicas)", () => {
  it("mantém as faixas numéricas conhecidas", () => {
    expect(toAgeRange("18-24")).toBe("18-24");
    expect(toAgeRange("65+")).toBe("65+");
  });

  it("colapsa desconhecidos/ inválidos em 'Desconhecido'", () => {
    expect(toAgeRange("unknown")).toBe("Desconhecido");
    expect(toAgeRange(null)).toBe("Desconhecido");
    expect(toAgeRange("99-120")).toBe("Desconhecido");
  });

  it("expõe as 8 faixas na ordem esperada", () => {
    expect(AGE_RANGES).toEqual([
      "0-17",
      "18-24",
      "25-34",
      "35-44",
      "45-54",
      "55-64",
      "65+",
      "Desconhecido",
    ]);
  });
});

describe("rótulos pt-BR das categorias", () => {
  it("traduz gênero, perfil e tipo; 'unknown' vira 'Desconhecido'", () => {
    expect(genderLabel("female")).toBe("Feminino");
    expect(genderLabel("male")).toBe("Masculino");
    expect(genderLabel("unknown")).toBe("Desconhecido");
    expect(profileLabel("student")).toBe("Estudante");
    expect(typeLabel("workshop")).toBe("Workshop");
  });

  it("faz fallback em Title Case para valores fora do mapa", () => {
    expect(typeLabel("meetup regional")).toBe("Meetup Regional");
  });
});
