import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThemeProvider, type Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { EventHeader } from "../components/EventHeader";
import { EventCounterRow } from "../components/EventCounterRow";
import { CheckinRateCard } from "../components/CheckinRateCard";
import { CertificationRateCard } from "../components/CertificationRateCard";
import { GranularitySelector } from "../components/GranularitySelector";
import { TimeSeriesChart } from "../components/charts/TimeSeriesChart";
import { ForbiddenState } from "../components/ForbiddenState";
import { NotFoundState } from "../components/NotFoundState";
import { ErrorAlert } from "../components/ErrorAlert";
import {
  getEventById,
  getCheckinRate,
  getCertificationRate,
  getTimeSeries,
  getSeries,
  MetricsApiError,
  type EventDetail,
  type Granularity,
  type TimeSeriesPoint,
  type TimeSeriesParams,
} from "../services/metricsApi";
import { getStoredProfile } from "../services/authApi";
import { toIsoDate, type Period } from "../utils/periods";
import { formatDate } from "../utils/format";
import { theme as defaultTheme } from "../theme";

export interface EventMetricsPageProps {
  // Tema passado pelo shell (ADR-0005); cai no tema próprio quando standalone.
  theme?: Theme;
  // Evento a detalhar — contrato de remote (ADR-0005).
  eventId: string;
  // ÚNICA forma de voltar (ADR-0005): a página reporta a intenção e o host
  // decide a rota. Nunca usa useNavigate/router diretamente.
  onBack: () => void;
}

// Situação do fetch principal (events/{id}): 403 e 404 bloqueiam a página
// inteira; os demais fetches nem são disparados nesses casos (US-05).
type EventStatus = "loading" | "ready" | "forbidden" | "notfound" | "error";

interface RateState {
  status: "loading" | "ready" | "error";
  rate: number | null;
  error: string | null;
}

interface TimeSeriesState {
  status: "loading" | "ready" | "empty" | "error";
  data: TimeSeriesPoint[];
  error: string | null;
}

const INITIAL_RATE: RateState = { status: "loading", rate: null, error: null };
const INITIAL_TS: TimeSeriesState = { status: "loading", data: [], error: null };

const DEFAULT_GRANULARITY: Granularity = "month";

// Período padrão: últimos 6 meses (ADR-0009). Deriva uma janela de datas
// (YYYY-MM-DD) do mês corrente para trás, consistente com events/engagement.
function lastSixMonths(now: Date = new Date()): Period {
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return { startDate: toIsoDate(start), endDate: toIsoDate(now) };
}

// Janela do evento formatada em pt-BR para o cabeçalho (mesma semântica do
// EventCard da US-04): intervalo, data única ou "Data a definir".
function formatEventWindow(detail: EventDetail): string {
  const { startDate, endDate } = detail;
  if (!startDate && !endDate) return "Data a definir";
  if (startDate && endDate && startDate !== endDate) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }
  return formatDate(startDate ?? endDate);
}

function errorMessage(err: unknown): string {
  return err instanceof Error
    ? err.message
    : "Não foi possível carregar os dados. Tente novamente.";
}

// US-05 — Detalhe de evento + séries históricas. Exposta como remote (ADR-0005):
// recebe eventId + onBack e não gerencia sessão/rota. Orquestra o fetch
// principal (events/{id}) e, só quando ele resolve, os fetches independentes de
// taxa de check-in, certificação e série histórica — a falha de um não derruba
// os outros. 403/404 no evento bloqueiam a página inteira (Forbidden/NotFound) e
// impedem os demais fetches. Os componentes recebem dados por props; nenhum faz
// fetch (ADR-0004).
export default function EventMetricsPage({ theme, eventId, onBack }: EventMetricsPageProps) {
  const [profile] = useState(() => getStoredProfile());
  const scopeLabel = profile?.accessLevel === "MANAGER" ? "Seu escopo" : undefined;

  const period = useMemo(() => lastSixMonths(), []);
  const [granularity, setGranularity] = useState<Granularity>(DEFAULT_GRANULARITY);

  const [eventStatus, setEventStatus] = useState<EventStatus>("loading");
  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

  const [checkin, setCheckin] = useState<RateState>(INITIAL_RATE);
  const [certification, setCertification] = useState<RateState>(INITIAL_RATE);
  const [timeseries, setTimeseries] = useState<TimeSeriesState>(INITIAL_TS);

  // Geração da última busca de série: descarta respostas obsoletas quando a
  // granularidade é trocada em sequência rápida (a resposta antiga não pode
  // sobrescrever a nova). Mesmo cuidado do useDistribution da US-03.
  const timeseriesReqId = useRef(0);

  // Fetch principal. 403/404 viram estados dedicados (não erro genérico) lendo o
  // status do MetricsApiError tipado. Um 401 já é sinalizado pela camada
  // (mfeAuth:sessionExpired) e tratado pelo host (ADR-0005).
  const loadEvent = useCallback(async () => {
    setEventStatus("loading");
    setEventError(null);
    try {
      const result = await getEventById(eventId);
      setDetail(result);
      setEventStatus("ready");
    } catch (err) {
      if (err instanceof MetricsApiError && err.status === 403) {
        setEventStatus("forbidden");
      } else if (err instanceof MetricsApiError && err.status === 404) {
        setEventStatus("notfound");
      } else {
        setEventError(errorMessage(err));
        setEventStatus("error");
      }
    }
  }, [eventId]);

  const loadCheckin = useCallback(async () => {
    setCheckin(INITIAL_RATE);
    try {
      const result = await getCheckinRate(eventId);
      setCheckin({ status: "ready", rate: result.rate, error: null });
    } catch (err) {
      setCheckin({ status: "error", rate: null, error: errorMessage(err) });
    }
  }, [eventId]);

  const loadCertification = useCallback(async () => {
    setCertification(INITIAL_RATE);
    try {
      const result = await getCertificationRate(eventId);
      setCertification({ status: "ready", rate: result.rate, error: null });
    } catch (err) {
      setCertification({ status: "error", rate: null, error: errorMessage(err) });
    }
  }, [eventId]);

  // Série histórica: timeseries é a fonte primária; se voltar vazia, /series
  // entra como fallback (ADR-0009). Erro do primário vira estado de erro no
  // painel — não derruba os cards.
  const loadTimeseries = useCallback(async () => {
    const reqId = ++timeseriesReqId.current;
    const isStale = () => reqId !== timeseriesReqId.current;
    setTimeseries(INITIAL_TS);
    const params: TimeSeriesParams = {
      eventId,
      granularity,
      startDate: period.startDate,
      endDate: period.endDate,
    };
    try {
      const points = await getTimeSeries(params);
      if (isStale()) return;
      if (points.length > 0) {
        setTimeseries({ status: "ready", data: points, error: null });
        return;
      }
      const fallback = await getSeries(params).catch(() => [] as TimeSeriesPoint[]);
      if (isStale()) return;
      setTimeseries(
        fallback.length > 0
          ? { status: "ready", data: fallback, error: null }
          : { status: "empty", data: [], error: null },
      );
    } catch (err) {
      if (isStale()) return;
      setTimeseries({ status: "error", data: [], error: errorMessage(err) });
    }
  }, [eventId, granularity, period]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  // Só dispara os fetches secundários quando o evento resolveu com sucesso —
  // 403/404 bloqueiam a página e não fazem chamadas extras (US-05).
  useEffect(() => {
    if (eventStatus !== "ready") return;
    void loadCheckin();
    void loadCertification();
  }, [eventStatus, loadCheckin, loadCertification]);

  // Timeseries reage à granularidade: trocar o preset refaz APENAS este fetch
  // (as taxas não dependem de `granularity`).
  useEffect(() => {
    if (eventStatus !== "ready") return;
    void loadTimeseries();
  }, [eventStatus, loadTimeseries]);

  return (
    <ThemeProvider theme={theme ?? defaultTheme}>
      <Box
        component="section"
        sx={{ bgcolor: "background.default", minHeight: "100%", p: { xs: 2, lg: 4 } }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {eventStatus === "forbidden" && <ForbiddenState onBack={onBack} />}
          {eventStatus === "notfound" && <NotFoundState onBack={onBack} />}

          {eventStatus === "error" && (
            <>
              <Button
                onClick={onBack}
                startIcon={<ArrowBackOutlinedIcon />}
                sx={{ alignSelf: "flex-start", color: "text.secondary", px: 1 }}
              >
                Voltar ao catálogo
              </Button>
              <ErrorAlert
                message={eventError ?? "Falha ao carregar o evento."}
                onRetry={loadEvent}
              />
            </>
          )}

          {eventStatus === "loading" && <EventMetricsSkeleton />}

          {eventStatus === "ready" && detail && (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "space-between",
                  alignItems: { md: "flex-end" },
                  gap: 2,
                }}
              >
                <EventHeader
                  name={detail.eventName}
                  period={formatEventWindow(detail)}
                  status={detail.status}
                  onBack={onBack}
                  scopeLabel={scopeLabel}
                />
              </Box>

              <EventCounterRow
                registered={detail.registered}
                checkedIn={detail.checkedIn}
                certified={detail.certified}
              />

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                }}
              >
                <CheckinRateCard
                  rate={checkin.rate}
                  loading={checkin.status === "loading"}
                  error={checkin.status === "error" ? checkin.error : null}
                  onRetry={loadCheckin}
                />
                <CertificationRateCard
                  rate={certification.rate}
                  loading={certification.status === "loading"}
                  error={certification.status === "error" ? certification.error : null}
                  onRetry={loadCertification}
                />
              </Box>

              <Box
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  p: { xs: 2, md: 3 },
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <GranularitySelector value={granularity} onChange={setGranularity} />
                </Box>
                <TimeSeriesChart
                  data={timeseries.data}
                  granularity={granularity}
                  loading={timeseries.status === "loading"}
                  error={timeseries.status === "error" ? timeseries.error : null}
                  empty={timeseries.status === "empty"}
                  onRetry={loadTimeseries}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

// Esqueleto do carregamento inicial: cabeçalho, cards de counter, taxas e o
// gráfico caem em skeleton enquanto o evento carrega.
function EventMetricsSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }} aria-busy="true">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="text" width={160} />
        <Skeleton variant="text" width="40%" height={44} />
        <Skeleton variant="text" width="30%" />
      </Box>
      <EventCounterRow registered={0} checkedIn={0} certified={0} loading />
      <Box
        sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" } }}
      >
        <CheckinRateCard rate={null} loading />
        <CertificationRateCard rate={null} loading />
      </Box>
      <Skeleton variant="rounded" width="100%" height={340} />
    </Box>
  );
}
