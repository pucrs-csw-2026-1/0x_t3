import { describe, it, expect } from "vitest";
import { rankEventsByAdhesion } from "./ranking";
import type { EventMetrics } from "../services/metricsApi";

function evt(id: string, registered: number, checkedIn: number): EventMetrics {
  return {
    eventId: id,
    eventName: id.toUpperCase(),
    status: "active",
    startDate: null,
    endDate: null,
    registered,
    checkedIn,
    certified: 0,
  };
}

// A: 90/100 = 0.90 | B: 20/100 = 0.20 | C: 75/100 = 0.75 | D: 50/100 = 0.50
const EVENTS = [evt("a", 100, 90), evt("b", 100, 20), evt("c", 100, 75), evt("d", 100, 50)];

describe("rankEventsByAdhesion", () => {
  it("ordena os melhores por taxa de adesão (desc)", () => {
    const { best } = rankEventsByAdhesion(EVENTS, 2);
    expect(best.map((e) => e.eventId)).toEqual(["a", "c"]);
    expect(best[0].rate).toBeCloseTo(0.9);
  });

  it("ordena os piores por taxa de adesão (asc)", () => {
    const { worst } = rankEventsByAdhesion(EVENTS, 2);
    expect(worst.map((e) => e.eventId)).toEqual(["b", "d"]);
  });

  it("respeita o limite", () => {
    const { best, worst } = rankEventsByAdhesion(EVENTS, 1);
    expect(best).toHaveLength(1);
    expect(worst).toHaveLength(1);
    expect(best[0].eventId).toBe("a");
    expect(worst[0].eventId).toBe("b");
  });

  it("valor-limite: inscritos = 0 não divide por zero (rate 0)", () => {
    const { worst } = rankEventsByAdhesion([evt("z", 0, 0), evt("a", 100, 90)], 1);
    expect(worst[0].eventId).toBe("z");
    expect(worst[0].rate).toBe(0);
  });

  it("usa o eventId como nome quando não há nome", () => {
    const { best } = rankEventsByAdhesion(
      [
        {
          eventId: "sem_nome",
          eventName: null,
          status: "active",
          startDate: null,
          endDate: null,
          registered: 10,
          checkedIn: 5,
          certified: 0,
        },
      ],
      1,
    );
    expect(best[0].eventName).toBe("sem_nome");
  });

  it("lista vazia devolve recortes vazios", () => {
    expect(rankEventsByAdhesion([], 5)).toEqual({ best: [], worst: [] });
  });
});
