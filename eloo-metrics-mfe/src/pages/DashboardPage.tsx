import { useCallback, useEffect, useState } from "react";
import { ThemeProvider, type Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { PeriodSelector } from "../components/PeriodSelector";
import { MetricCard, type MetricTrend } from "../components/MetricCard";
import { MetricCardSkeleton } from "../components/MetricCardSkeleton";
import { EngagementBarChart } from "../components/charts/EngagementBarChart";
import { EventRanking } from "../components/EventRanking";
import { ErrorAlert } from "../components/ErrorAlert";
import { EmptyState } from "../components/EmptyState";
import {
  listEventMetrics,
  getEngagement,
  USING_MOCK_DATA,
  type EventMetricsPage,
  type EngagementResponse,
} from "../services/metricsApi";
import { getStoredProfile } from "../services/authApi";
import { resolveScope } from "../utils/scope";
import { rankEventsByAdhesion } from "../utils/ranking";
import { formatPercent } from "../utils/format";
import { DEFAULT_PERIOD_KEY, resolvePeriod, type Period, type PeriodKey } from "../utils/periods";
import { theme as defaultTheme } from "../theme";

export interface DashboardPageProps {
  // Tema passado pelo shell (ADR-0005); cai no tema próprio quando standalone.
  theme?: Theme;
}

type Status = "loading" | "error" | "empty" | "ready";

// Uma página só busca até 200 eventos para agregar os counters do período
// (ADR-0009: page_size máx. 200). A visão geral não pagina na tela.
const PAGE_SIZE = 200;

// Tendência "+12%" do card de inscritos: só existe no modo demonstração — o T2
// ainda não expõe comparativo entre janelas (ADR-0009). Fora do mock, omitida.
const REGISTERED_TREND: MetricTrend | undefined = USING_MOCK_DATA
  ? { label: "+12%", positive: true }
  : undefined;

interface Counters {
  registered: number;
  checkedIn: number;
  certified: number;
}

function sumCounters(page: EventMetricsPage): Counters {
  return page.items.reduce<Counters>(
    (acc, item) => ({
      registered: acc.registered + item.registered,
      checkedIn: acc.checkedIn + item.checkedIn,
      certified: acc.certified + item.certified,
    }),
    { registered: 0, checkedIn: 0, certified: 0 },
  );
}

// US-02 — Visão geral do dashboard. Uma única página adaptável por papel: admin
// vê a visão global, manager vê seu escopo (o backend escopa via RBAC — só muda
// o título). Orquestra o fetch (counters + engajamento), o seletor de período e
// os estados de loading / erro / vazio. Gráficos e cards recebem dados por props
// — nenhum deles faz fetch (ADR-0004/0005).
export default function DashboardPage({ theme }: DashboardPageProps) {
  const [profile] = useState(() => getStoredProfile());
  const scope = resolveScope(profile);

  const [periodKey, setPeriodKey] = useState<PeriodKey>(DEFAULT_PERIOD_KEY);
  const [customPeriod, setCustomPeriod] = useState<Period>(() => resolvePeriod(DEFAULT_PERIOD_KEY));
  const [period, setPeriod] = useState<Period>(() => resolvePeriod(DEFAULT_PERIOD_KEY));

  const [status, setStatus] = useState<Status>("loading");
  const [eventsData, setEventsData] = useState<EventMetricsPage | null>(null);
  const [engagement, setEngagement] = useState<EngagementResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [engagementError, setEngagementError] = useState<string | null>(null);

  // O período é SEMPRE enviado (ADR-0009). counters e engajamento são buscados em
  // paralelo; a falha do engajamento é não-fatal (banner de aviso), a dos
  // counters é fatal (estado de erro com retry). Um 401 é sinalizado pela camada
  // de serviço (mfeAuth:sessionExpired) e tratado pelo host — a página não
  // redireciona sozinha (ADR-0005).
  const load = useCallback(async (window: Period) => {
    setStatus("loading");
    setError(null);
    setEngagementError(null);

    const [eventsResult, engagementResult] = await Promise.allSettled([
      listEventMetrics({ ...window, page: 1, pageSize: PAGE_SIZE }),
      getEngagement(window),
    ]);

    if (eventsResult.status === "rejected") {
      const reason = eventsResult.reason;
      setError(reason instanceof Error ? reason.message : "Falha ao carregar as métricas.");
      setStatus("error");
      return;
    }

    const page = eventsResult.value;
    setEventsData(page);

    if (engagementResult.status === "fulfilled") {
      setEngagement(engagementResult.value);
    } else {
      setEngagement(null);
      setEngagementError(
        "Não foi possível carregar o engajamento em tempo real. Algumas métricas podem estar desatualizadas.",
      );
    }

    setStatus(page.items.length === 0 ? "empty" : "ready");
  }, []);

  useEffect(() => {
    void load(period);
  }, [load, period]);

  const handlePeriodChange = (key: PeriodKey, next: Period) => {
    setPeriodKey(key);
    if (key === "custom") setCustomPeriod(next);
    setPeriod(next);
  };

  return (
    <ThemeProvider theme={theme ?? defaultTheme}>
      <Box
        component="section"
        sx={{ bgcolor: "background.default", minHeight: "100%", p: { xs: 2, lg: 4 } }}
      >
        <Box sx={{ maxWidth: 1440, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Cabeçalho dinâmico + seletor de período */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: 2,
              alignItems: { md: "center" },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                color="primary"
                fontWeight={700}
                sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}
              >
                {scope.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                {scope.subtitle}
              </Typography>
            </Box>
            <PeriodSelector
              value={periodKey}
              customPeriod={customPeriod}
              onChange={handlePeriodChange}
            />
          </Box>

          {/* Banner não-fatal: engajamento indisponível, counters ainda válidos */}
          {engagementError && status !== "error" && (
            <ErrorAlert message={engagementError} onRetry={() => void load(period)} />
          )}

          {/* Estado de erro (fatal) */}
          {status === "error" && error && (
            <ErrorAlert message={error} onRetry={() => void load(period)} />
          )}

          {/* Loading: skeletons nos cards + placeholder do gráfico */}
          {status === "loading" && <DashboardSkeleton />}

          {/* Vazio: API respondeu sem eventos no período */}
          {status === "empty" && <EmptyState />}

          {/* Dados carregados */}
          {status === "ready" && eventsData && (
            <DashboardContent page={eventsData} engagement={engagement} />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function DashboardSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }} aria-busy="true">
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
        }}
      >
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </Box>
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            Carregando métricas…
          </Typography>
          <Skeleton variant="rounded" width="100%" height={288} />
        </CardContent>
      </Card>
    </Box>
  );
}

function DashboardContent({
  page,
  engagement,
}: {
  page: EventMetricsPage;
  engagement: EngagementResponse | null;
}) {
  const counters = sumCounters(page);
  const labels = page.items.map((item) => item.eventName ?? item.eventId);
  const registeredSeries = page.items.map((item) => item.registered);
  const checkedInSeries = page.items.map((item) => item.checkedIn);
  const certifiedSeries = page.items.map((item) => item.certified);
  const ranking = rankEventsByAdhesion(page.items, 5);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Cards de counter */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
        }}
      >
        <MetricCard
          label="Inscritos"
          value={counters.registered}
          trend={REGISTERED_TREND}
          sparklineData={registeredSeries}
          sparklineColor="#7b4d88"
          caption="Total de inscrições no período"
        />
        <MetricCard
          label="Check-ins"
          value={counters.checkedIn}
          note={engagement ? `${formatPercent(engagement.rate)} taxa` : undefined}
          sparklineData={checkedInSeries}
          sparklineColor="#22c55e"
          caption="Presenças confirmadas"
        />
        <MetricCard
          label="Certificados"
          value={counters.certified}
          icon={<VerifiedOutlinedIcon fontSize="small" color="disabled" />}
          sparklineData={certifiedSeries}
          sparklineColor="#a855f7"
          caption="Emitidos com sucesso"
        />
      </Box>

      {/* Gráfico de engajamento por evento */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <EngagementBarChart
            labels={labels}
            registered={registeredSeries}
            checkedIn={checkedInSeries}
          />
        </CardContent>
      </Card>

      {/* Ranking de eventos por adesão (Top 5 melhores e piores) */}
      <EventRanking best={ranking.best} worst={ranking.worst} />
    </Box>
  );
}
