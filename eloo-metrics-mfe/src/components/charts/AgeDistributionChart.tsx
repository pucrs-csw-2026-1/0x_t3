import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";
import type { AgeDistribution } from "../../services/metricsApi";
import { DistributionLegend } from "./DistributionLegend";

export interface AgeDistributionChartProps {
  // Dados já normalizados pela camada de serviço (8 faixas canônicas, ordenadas
  // e completas). O gráfico NUNCA faz fetch (ADR-0004).
  data: AgeDistribution[];
  height?: number;
}

const BAR_COLOR = "#981652"; // primary

// Distribuição por faixa etária (US-03): barras horizontais, uma por faixa. Além
// do gráfico MUI X (visual), a legenda expõe valor absoluto + percentual pt-BR
// de cada faixa. Acessibilidade: role="img" com aria-label descritivo.
export function AgeDistributionChart({ data, height = 260 }: AgeDistributionChartProps) {
  const labels = data.map((item) => item.label);
  const counts = data.map((item) => item.count);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        role="img"
        aria-label={`Gráfico de barras da distribuição por faixa etária (${labels.length} faixas).`}
      >
        <BarChart
          layout="horizontal"
          height={height}
          yAxis={[{ scaleType: "band", data: labels, tickLabelStyle: { fontSize: 11 } }]}
          xAxis={[{ label: "Participantes" }]}
          series={[{ data: counts, label: "Participantes", color: BAR_COLOR }]}
          margin={{ left: 72 }}
          slotProps={{ legend: { hidden: true } }}
        />
      </Box>
      <DistributionLegend items={data.map((item) => ({ label: item.label, count: item.count }))} />
    </Box>
  );
}
