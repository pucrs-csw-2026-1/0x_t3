import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";
import type { TypeDistribution } from "../../services/metricsApi";
import { DistributionLegend } from "./DistributionLegend";

export interface TypeDistributionChartProps {
  // Tipos de evento conforme o backend, já em pt-BR (camada de serviço).
  // O gráfico NUNCA faz fetch (ADR-0004).
  data: TypeDistribution[];
  height?: number;
}

const BAR_COLOR = "#3d6c8a"; // tertiary-container

// Distribuição por tipo de evento (US-03): barras verticais, uma por tipo.
export function TypeDistributionChart({ data, height = 260 }: TypeDistributionChartProps) {
  const labels = data.map((item) => item.label);
  const counts = data.map((item) => item.count);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ overflowX: "auto" }}>
        <Box
          role="img"
          aria-label={`Gráfico de barras da distribuição por tipo de evento (${labels.length} tipos).`}
          sx={{ minWidth: Math.max(labels.length * 72, 320) }}
        >
          <BarChart
            height={height}
            xAxis={[{ scaleType: "band", data: labels, tickLabelStyle: { fontSize: 11 } }]}
            // Sem rótulo no eixo Y: o MUI X o posiciona colado aos números das
            // marcações (sobreposição). A métrica ("Participantes") já fica clara
            // pela legenda abaixo e pela série.
            series={[{ data: counts, label: "Participantes", color: BAR_COLOR }]}
            margin={{ left: 48, bottom: 50 }}
            slotProps={{ legend: { hidden: true } }}
          />
        </Box>
      </Box>
      <DistributionLegend items={data.map((item) => ({ label: item.label, count: item.count }))} />
    </Box>
  );
}
