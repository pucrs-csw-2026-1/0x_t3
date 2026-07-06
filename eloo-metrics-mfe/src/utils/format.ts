// Helpers de formatação localizada (pt-BR) — ADR-0005 exige números, datas e
// percentuais no locale do usuário. Isolados aqui para serem testáveis
// unitariamente (partição de equivalência + valor-limite).

const numberFormatter = new Intl.NumberFormat("pt-BR");

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// Formata inteiros/decimais com separador de milhar pt-BR (1.250). Valores não
// numéricos (undefined/NaN) caem num traço, evitando "NaN" na tela.
export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return numberFormatter.format(value);
}

// Formata uma data como dd/mm/aaaa. Aceita Date ou string ISO (YYYY-MM-DD ou
// completa). Entrada inválida cai num traço em vez de "Invalid Date".
export function formatDate(value: Date | string | null | undefined): string {
  if (value == null) return "—";
  const date = value instanceof Date ? value : parseIsoDate(value);
  if (date == null || Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

// Formata uma razão (0..1) como percentual pt-BR (0.68 → "68%"). `fractionDigits`
// controla as casas decimais (padrão 0). Valores inválidos caem num traço.
export function formatPercent(ratio: number | null | undefined, fractionDigits = 0): string {
  if (ratio == null || Number.isNaN(ratio)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(ratio);
}

// Trata "YYYY-MM-DD" como data local (sem deslocamento de fuso), preservando o
// dia informado. Strings com horário caem no parser nativo do Date.
function parseIsoDate(value: string): Date | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
