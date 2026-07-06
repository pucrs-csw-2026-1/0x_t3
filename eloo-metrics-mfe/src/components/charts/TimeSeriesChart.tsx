import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { LineChart } from "@mui/x-charts/LineChart";
import type { Granularity, TimeSeriesPoint } from "../../services/metricsApi";
import { ErrorAlert } from "../ErrorAlert";
import { EmptyState } from "../EmptyState";
import { formatNumber } from "../../utils/format";

export interface TimeSeriesChartProps {
  // Dados já normalizados pela EventMetricsPage — o gráfico NUNCA faz fetch
  // (ADR-0004).
  data: TimeSeriesPoint[];
  granularity: Granularity;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  onRetry?: () => void;
  height?: number;
}

const REGISTERED_COLOR = "#7b4d88"; // secondary
const CHECKED_IN_COLOR = "#981652"; // primary

const monthShortFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });

// Formata o rótulo do eixo X em pt-BR conforme a granularidade selecionada:
// "jan. 2026" (mensal), "T1 2026" (trimestral), "2026" (anual). Data inválida
// cai no bucket cru (tolerância a shape inesperado do backend).
function formatBucketLabel(point: TimeSeriesPoint, granularity: Granularity): string {
  const { date, bucket } = point;
  if (Number.isNaN(date.getTime())) return bucket;
  const year = date.getFullYear();
  if (granularity === "year") return String(year);
  if (granularity === "quarter") return `T${Math.floor(date.getMonth() / 3) + 1} ${year}`;
  return `${monthShortFormatter.format(date)} ${year}`;
}

// Legenda visível e acessível (não depende dos <text> do SVG): nome da série,
// cor e total do período.
function SeriesLegend({ registered, checkedIn }: { registered: number; checkedIn: number }) {
  const items = [
    { label: "Inscrições", color: REGISTERED_COLOR, total: registered },
    { label: "Check-ins", color: CHECKED_IN_COLOR, total: checkedIn },
  ];
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 3,
        borderTop: 1,
        borderColor: "divider",
        pt: 2,
      }}
    >
      {items.map((item) => (
        <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            aria-hidden="true"
            sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: item.color }}
          />
          <Typography component="dt" variant="body2" color="text.secondary">
            {item.label}
          </Typography>
          <Typography
            component="dd"
            variant="body2"
            color="text.primary"
            sx={{ m: 0, fontWeight: 600 }}
          >
            {formatNumber(item.total)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// Gráfico de linha da série histórica (US-05, referência visual: TimeSeriesChart):
// inscrições x check-ins ao longo do período, em MUI X LineChart (ADR-0004).
// Centraliza os estados por painel (loading → skeleton, erro → ErrorAlert com
// retry, vazio → EmptyState). Acessibilidade: título visível, aria-label
// descritivo e legenda com totais. Recebe tudo por props — nunca faz fetch.
export function TimeSeriesChart({
  data,
  granularity,
  loading = false,
  error = null,
  empty = false,
  onRetry,
  height = 300,
}: TimeSeriesChartProps) {
  const labels = data.map((point) => formatBucketLabel(point, granularity));
  const registered = data.map((point) => point.registered);
  const checkedIn = data.map((point) => point.checkedIn);
  const totalRegistered = registered.reduce((acc, value) => acc + value, 0);
  const totalCheckedIn = checkedIn.reduce((acc, value) => acc + value, 0);

  return (
    <Box
      component="section"
      aria-labelledby="timeseries-title"
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box>
        <Typography
          id="timeseries-title"
          variant="h6"
          component="h2"
          color="primary"
          fontWeight={600}
        >
          Série Histórica: Inscrições vs Check-ins
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Evolução ao longo do período do evento.
        </Typography>
      </Box>

      {loading ? (
        <Skeleton variant="rounded" width="100%" height={height} aria-busy="true" />
      ) : error ? (
        <ErrorAlert message={error} onRetry={onRetry ?? (() => {})} />
      ) : empty || data.length === 0 ? (
        <EmptyState
          title="Sem dados no período"
          description="Sem dados para o período selecionado."
        />
      ) : (
        <>
          <Box
            role="img"
            aria-label={`Gráfico de linha da série histórica de inscrições e check-ins (${data.length} períodos, granularidade ${granularity}).`}
            sx={{ overflowX: "auto" }}
          >
            <Box sx={{ minWidth: Math.max(labels.length * 72, 320) }}>
              <LineChart
                height={height}
                xAxis={[
                  {
                    scaleType: "point",
                    data: labels,
                    tickLabelStyle: { fontSize: 11 },
                  },
                ]}
                series={[
                  {
                    data: registered,
                    label: "Inscrições",
                    color: REGISTERED_COLOR,
                    curve: "monotoneX",
                  },
                  {
                    data: checkedIn,
                    label: "Check-ins",
                    color: CHECKED_IN_COLOR,
                    curve: "monotoneX",
                  },
                ]}
                slotProps={{ legend: { hidden: true } }}
                margin={{ left: 56, right: 16, top: 16, bottom: 32 }}
              />
            </Box>
          </Box>
          <SeriesLegend registered={totalRegistered} checkedIn={totalCheckedIn} />
        </>
      )}
    </Box>
  );
}
