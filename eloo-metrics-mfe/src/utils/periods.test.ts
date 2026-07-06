import { describe, it, expect } from "vitest";
import { resolvePeriod, toIsoDate, DEFAULT_PERIOD_KEY } from "./periods";

const NOW = new Date(2026, 6, 5); // 05/07/2026 (mês 0-based)

describe("resolvePeriod", () => {
  it("today: janela de um único dia", () => {
    expect(resolvePeriod("today", NOW)).toEqual({
      startDate: "2026-07-05",
      endDate: "2026-07-05",
    });
  });

  it("last7: 7 dias incluindo hoje", () => {
    expect(resolvePeriod("last7", NOW)).toEqual({
      startDate: "2026-06-29",
      endDate: "2026-07-05",
    });
  });

  it("last30: 30 dias incluindo hoje", () => {
    expect(resolvePeriod("last30", NOW)).toEqual({
      startDate: "2026-06-06",
      endDate: "2026-07-05",
    });
  });

  it("o padrão do dashboard é últimos 30 dias", () => {
    expect(DEFAULT_PERIOD_KEY).toBe("last30");
  });
});

describe("toIsoDate", () => {
  it("serializa local sem UTC, com zero à esquerda", () => {
    expect(toIsoDate(new Date(2026, 0, 9))).toBe("2026-01-09");
  });
});
