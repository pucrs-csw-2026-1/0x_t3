import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";
import type { CityDistribution } from "../../services/metricsApi";
import { DistributionLegend } from "./DistributionLegend";

export interface CityDistributionChartProps {
  // Top 10 cidades, já ordenadas por volume decrescente (camada de serviço).
  // O gráfico NUNCA faz fetch (ADR-0004).
  data: CityDistribution[];
  height?: number;
}

const BAR_COLOR = "#215470"; // tertiary

// Distribuição por cidade (US-03): barras verticais das top 10 cidades. Em telas
// estreitas rola na horizontal, mantendo largura mínima legível por barra.
export function CityDistributionChart({ data, height = 300 }: CityDistributionChartProps) {
  const labels = data.map((item) => item.city);
  const counts = data.map((item) => item.count);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ overflowX: "auto" }}>
        <Box
          role="img"
          aria-label={`Gráfico de barras das cidades com mais participantes (top ${labels.length}).`}
          sx={{ minWidth: Math.max(labels.length * 72, 320) }}
        >
          <BarChart
            height={height}
            xAxis={[
              {
                scaleType: "band",
                data: labels,
                tickLabelStyle: { fontSize: 11, angle: -35, textAnchor: "end" },
              },
            ]}
            // Sem rótulo no eixo Y: o MUI X o posiciona colado aos números das
            // marcações (sobreposição). A métrica ("Participantes") já fica clara
            // pela legenda abaixo e pela série.
            series={[{ data: counts, label: "Participantes", color: BAR_COLOR }]}
            margin={{ left: 48, bottom: 80 }}
            slotProps={{ legend: { hidden: true } }}
          />
        </Box>
      </Box>
      <DistributionLegend items={data.map((item) => ({ label: item.city, count: item.count }))} />
    </Box>
  );
}
