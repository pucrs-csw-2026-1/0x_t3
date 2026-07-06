import type { EventMetrics } from "../services/metricsApi";

// Ranking de eventos por TAXA DE ADESÃO (check-ins / inscritos) — a medida de
// "engajamento" do dashboard, que compara eventos de tamanhos diferentes de
// forma justa. Lógica pura e testável; os componentes só renderizam o resultado.

export interface RankedEvent {
  eventId: string;
  eventName: string;
  registered: number;
  checkedIn: number;
  rate: number; // 0..1 (check-ins / inscritos)
}

export interface EventRankingResult {
  best: RankedEvent[];
  worst: RankedEvent[];
}

function toRanked(event: EventMetrics): RankedEvent {
  const rate = event.registered > 0 ? event.checkedIn / event.registered : 0;
  return {
    eventId: event.eventId,
    eventName: event.eventName ?? event.eventId,
    registered: event.registered,
    checkedIn: event.checkedIn,
    rate,
  };
}

// Ordena por taxa de adesão e devolve os `limit` melhores (desc) e piores (asc).
// Empates são desempatados por nome, para uma ordem estável. Com poucos eventos
// (≤ limit) as duas listas podem se sobrepor — é a natureza do recorte.
export function rankEventsByAdhesion(events: EventMetrics[], limit = 5): EventRankingResult {
  const ranked = events.map(toRanked);

  const byRateDesc = [...ranked].sort(
    (a, b) => b.rate - a.rate || a.eventName.localeCompare(b.eventName),
  );

  return {
    best: byRateDesc.slice(0, limit),
    worst: [...byRateDesc].reverse().slice(0, limit),
  };
}
