import type { ReactNode } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { MetricCardSkeleton } from "./MetricCardSkeleton";
import { formatNumber } from "../utils/format";

export interface MetricTrend {
  label: string; // ex.: "+12%"
  positive?: boolean; // colore verde (alta) ou vermelho (baixa)
}

export interface MetricCardProps {
  label: string;
  // Counter já formatado é responsabilidade do card; recebe o número cru. Quando
  // `undefined`, o card renderiza sua variante skeleton (dados ainda chegando).
  value: number | undefined;
  trend?: MetricTrend;
  // Nota discreta à direita (ex.: "68% taxa"), sem semântica de alta/baixa.
  note?: string;
  // Série para a sparkline (mini-tendência) — ADR-0004, MUI X Charts.
  sparklineData?: number[];
  // Cor CSS da sparkline. Padrão: secondary do tema Eloo.
  sparklineColor?: string;
  icon?: ReactNode;
  // Legenda inferior (ex.: "Vs. período anterior").
  caption?: string;
}

// Card de counter reutilizável (referência visual: Metric Card). Não faz fetch —
// recebe o valor já normalizado pelo serviço. Sem valor → skeleton.
export function MetricCard({
  label,
  value,
  trend,
  note,
  sparklineData,
  sparklineColor = "#7b4d88",
  icon,
  caption,
}: MetricCardProps) {
  if (value === undefined) return <MetricCardSkeleton />;

  const hasSparkline = sparklineData != null && sparklineData.length > 1;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: "0.05em", fontWeight: 600 }}
          >
            {label}
          </Typography>
          {trend && (
            <Chip
              size="small"
              label={trend.label}
              color={trend.positive === false ? "error" : "success"}
              variant="outlined"
              sx={{ height: 20, fontSize: "0.75rem" }}
            />
          )}
          {!trend && note && (
            <Typography variant="caption" color="text.secondary">
              {note}
            </Typography>
          )}
          {!trend && !note && icon}
        </Box>

        <Box
          sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mt: 1 }}
        >
          <Typography variant="h4" component="p" color="primary" fontWeight={700}>
            {formatNumber(value)}
          </Typography>
          {hasSparkline && (
            <Box
              sx={{ width: 96, height: 40 }}
              role="img"
              aria-label={`Minigráfico de tendência de ${label.toLowerCase()} por evento`}
            >
              <SparkLineChart
                data={sparklineData}
                height={40}
                curve="natural"
                area={false}
                colors={[sparklineColor]}
              />
            </Box>
          )}
        </Box>

        {caption && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
