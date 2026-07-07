import { describe, it, expect } from "vitest";
import {
  toMonthBucket,
  periodToMonthRange,
  validatePeriod,
  monthBucketsInRange,
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

// Partição de equivalência + valor-limite do enumerador de buckets mensais
// (US-06: o by-type real exige uma chamada por mês do período).
describe("monthBucketsInRange", () => {
  it("valor-limite: mês único (from == to) devolve um bucket", () => {
    expect(monthBucketsInRange("2026-06", "2026-06")).toEqual(["2026-06"]);
  });

  it("enumera o intervalo fechado dentro do mesmo ano", () => {
    expect(monthBucketsInRange("2026-04", "2026-06")).toEqual(["2026-04", "2026-05", "2026-06"]);
  });

  it("valor-limite: virada de ano (dez → jan) preserva a sequência", () => {
    expect(monthBucketsInRange("2025-11", "2026-02")).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
    ]);
  });

  it("intervalo invertido (from > to) devolve lista vazia", () => {
    expect(monthBucketsInRange("2026-06", "2026-01")).toEqual([]);
  });

  it("formato inválido devolve lista vazia", () => {
    expect(monthBucketsInRange("2026-13", "2026-06")).toEqual([]);
    expect(monthBucketsInRange("", "2026-06")).toEqual([]);
    expect(monthBucketsInRange("2026-06", "junho")).toEqual([]);
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
