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
  // Sanitiza contra dados inconsistentes do T2: valores não-finitos viram 0 e a
  // taxa é clampada em [0,1]. Sem isso, check-ins > inscritos exibiria "120%" de
  // adesão e um NaN poluiria o sort (`b.rate - a.rate` → NaN → ordem instável).
  const registered = Number.isFinite(event.registered) ? event.registered : 0;
  const checkedIn = Number.isFinite(event.checkedIn) ? event.checkedIn : 0;
  const rate = registered > 0 ? Math.min(1, Math.max(0, checkedIn / registered)) : 0;
  return {
    eventId: event.eventId,
    eventName: event.eventName ?? event.eventId,
    registered,
    checkedIn,
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
