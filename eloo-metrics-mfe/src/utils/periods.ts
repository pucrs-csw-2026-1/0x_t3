// Seletor de período do dashboard. ADR-0009 exige que a UI SEMPRE envie uma
// janela (start_date/end_date) — nunca omitida. A resolução preset → janela
// vive aqui (pura, testável); os componentes só emitem/consomem `Period`.

export type PeriodKey = "today" | "last7" | "last30" | "custom";

export interface Period {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface PeriodOption {
  key: PeriodKey;
  label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { key: "today", label: "Hoje" },
  { key: "last7", label: "Últimos 7 dias" },
  { key: "last30", label: "Últimos 30 dias" },
  { key: "custom", label: "Personalizado" },
];

// Padrão do dashboard (referência visual e ADR-0009): "Últimos 30 dias".
export const DEFAULT_PERIOD_KEY: PeriodKey = "last30";

// Serializa uma data no formato local YYYY-MM-DD (sem UTC), preservando o dia.
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Converte um preset numa janela concreta terminando em `now`. Para "custom" a
// janela é escolhida pelo usuário no PeriodSelector; aqui devolve o mesmo
// intervalo de "last30" como ponto de partida.
export function resolvePeriod(key: PeriodKey, now: Date = new Date()): Period {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (key) {
    case "today":
      break;
    case "last7":
      start.setDate(start.getDate() - 6);
      break;
    case "last30":
    case "custom":
      start.setDate(start.getDate() - 29);
      break;
  }
  return { startDate: toIsoDate(start), endDate: toIsoDate(now) };
}
