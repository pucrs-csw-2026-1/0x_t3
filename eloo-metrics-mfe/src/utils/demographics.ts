// US-03 — Helpers puros das distribuições demográficas. Isolam a derivação de
// buckets mensais (ADR-0009: `from`/`to` em YYYY-MM), a validação de intervalo
// (evita 422 de intervalo invertido) e os mapas de rótulos pt-BR das categorias.
// Puros e testáveis unitariamente (partição de equivalência + valor-limite).

import type { Period } from "./periods";

// Buckets mensais que a API de distribuições consome (ADR-0009). Derivados do
// Period (YYYY-MM-DD) do PeriodSelector reaproveitado da US-02: a UI mostra
// datas, a camada envia o mês (YYYY-MM).
export interface MonthRange {
  from: string; // YYYY-MM
  to: string; // YYYY-MM
}

// Recorta o mês (YYYY-MM) de uma data ISO (YYYY-MM-DD). Entrada vazia/curta
// devolve string vazia — quem valida é `validatePeriod`.
export function toMonthBucket(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  return isoDate.slice(0, 7);
}

// Deriva a janela mensal (from/to) a partir do período de datas selecionado.
export function periodToMonthRange(period: Period): MonthRange {
  return { from: toMonthBucket(period.startDate), to: toMonthBucket(period.endDate) };
}

const MONTH_BUCKET = /^\d{4}-(0[1-9]|1[0-2])$/;

// Teto de buckets mensais que o by-type agrega numa única troca de período
// (US-06): cada bucket vira UMA chamada à API, então um intervalo longo precisa
// ser barrado antes do fetch para não disparar centenas de requisições.
export const MAX_MONTH_SPAN = 24;

// Nº de meses (inclusivo) entre dois buckets YYYY-MM válidos.
function monthSpan(from: string, to: string): number {
  const [fromYear, fromMonth] = from.split("-").map(Number);
  const [toYear, toMonth] = to.split("-").map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
}

// Valida a janela ANTES de qualquer fetch (ADR-0009): mês inicial e final
// presentes, no formato YYYY-MM, não invertidos e dentro do teto de MAX_MONTH_SPAN
// meses. Retorna a mensagem de erro em pt-BR (inline no toolbar) ou null quando
// válida. Comparação de string funciona para YYYY-MM (lexicográfica == cronológica).
export function validatePeriod(period: Period): string | null {
  const { from, to } = periodToMonthRange(period);
  if (!from || !to) return "Informe o mês inicial e o final do período.";
  if (!MONTH_BUCKET.test(from) || !MONTH_BUCKET.test(to)) {
    return "Período inválido. Use meses no formato AAAA-MM.";
  }
  if (from > to) return "O mês inicial não pode ser posterior ao mês final.";
  if (monthSpan(from, to) > MAX_MONTH_SPAN) {
    return `O período não pode exceder ${MAX_MONTH_SPAN} meses.`;
  }
  return null;
}

// Enumera os buckets mensais (YYYY-MM) do intervalo fechado [from, to] — usado
// pelo by-type real, que só aceita um bucket por chamada (US-06). Intervalo
// inválido/invertido devolve lista vazia (quem valida antes é validatePeriod).
// NÃO trunca: o getByType usa o tamanho real para barrar períodos > 24 meses
// (BY_TYPE_MAX_MONTHS); truncar aqui esconderia meses silenciosamente.
export function monthBucketsInRange(from: string, to: string): string[] {
  if (!MONTH_BUCKET.test(from) || !MONTH_BUCKET.test(to) || from > to) return [];
  const buckets: string[] = [];
  let [year, month] = from.split("-").map(Number);
  const [endYear, endMonth] = to.split("-").map(Number);
  while (year < endYear || (year === endYear && month <= endMonth)) {
    buckets.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return buckets;
}

// Faixas etárias canônicas do backend (ADR-0009 / critério de aceite da US-03),
// na ordem de exibição. A UI sempre mostra as 8 faixas, mesmo zeradas.
export const AGE_RANGES = [
  "0-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
  "Desconhecido",
] as const;

export type AgeRange = (typeof AGE_RANGES)[number];

const NUMERIC_AGE_RANGES = new Set<string>(AGE_RANGES.filter((r) => r !== "Desconhecido"));

function normalizeKey(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

// Normaliza o rótulo de faixa vindo do backend para o conjunto canônico. Valores
// não reconhecidos (incluindo "unknown"/null) caem em "Desconhecido".
export function toAgeRange(raw: unknown): AgeRange {
  const value = String(raw ?? "").trim();
  if (NUMERIC_AGE_RANGES.has(value)) return value as AgeRange;
  return "Desconhecido";
}

// Chaves reais do T2 (US-06): F | M | OUTRO | NAO_INFORMADO (normalizadas para
// minúsculas antes do lookup); sinônimos EN mantidos por tolerância.
const GENDER_LABELS: Record<string, string> = {
  female: "Feminino",
  f: "Feminino",
  feminino: "Feminino",
  male: "Masculino",
  m: "Masculino",
  masculino: "Masculino",
  other: "Outro",
  "non-binary": "Outro",
  nonbinary: "Outro",
  outro: "Outro",
  nao_informado: "Desconhecido",
  não_informado: "Desconhecido",
};

const PROFILE_LABELS: Record<string, string> = {
  student: "Estudante",
  estudante: "Estudante",
  professional: "Profissional",
  profissional: "Profissional",
  specialist: "Especialista",
  especialista: "Especialista",
  technical: "Especialista/Técnico",
  executive: "Executivo",
  executivo: "Executivo",
  "c-level": "Executivo/C-Level",
  teacher: "Professor",
  professor: "Professor",
};

const TYPE_LABELS: Record<string, string> = {
  workshop: "Workshop",
  lecture: "Palestra",
  palestra: "Palestra",
  talk: "Palestra",
  course: "Curso",
  curso: "Curso",
  conference: "Conferência",
  conferencia: "Conferência",
  hackathon: "Hackathon",
  bootcamp: "Bootcamp",
  webinar: "Webinar",
  meetup: "Meetup",
};

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Traduz uma categoria (gênero/perfil/tipo) para pt-BR usando o mapa da dimensão.
// "unknown"/vazio → "Desconhecido"; valores fora do mapa caem num Title Case do
// próprio rótulo (tolerância à evolução aditiva do backend — ADR-0009).
function labelFrom(map: Record<string, string>, raw: unknown): string {
  const key = normalizeKey(raw);
  if (key === "" || key === "unknown" || key === "desconhecido" || key === "n/a") {
    return "Desconhecido";
  }
  return map[key] ?? titleCase(String(raw).trim());
}

export const genderLabel = (raw: unknown): string => labelFrom(GENDER_LABELS, raw);
export const profileLabel = (raw: unknown): string => labelFrom(PROFILE_LABELS, raw);
export const typeLabel = (raw: unknown): string => labelFrom(TYPE_LABELS, raw);
