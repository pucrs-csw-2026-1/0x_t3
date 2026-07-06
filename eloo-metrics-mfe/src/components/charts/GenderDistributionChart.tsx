import Box from "@mui/material/Box";
import { PieChart } from "@mui/x-charts/PieChart";
import type { GenderDistribution } from "../../services/metricsApi";
import { DistributionLegend } from "./DistributionLegend";

export interface GenderDistributionChartProps {
  // Categorias de gênero conforme o backend, já em pt-BR (camada de serviço).
  // O gráfico NUNCA faz fetch (ADR-0004).
  data: GenderDistribution[];
  size?: number;
}

// Paleta alinhada aos tokens do tema (primary/secondary/tertiary/outline).
const SLICE_COLORS = ["#7b4d88", "#981652", "#215470", "#8a7177", "#3d6c8a"];

// Distribuição por gênero (US-03): gráfico de pizza (MUI X PieChart). A legenda
// acessível lista cada categoria com percentual pt-BR (critério de aceite).
export function GenderDistributionChart({ data, size = 200 }: GenderDistributionChartProps) {
  const total = data.reduce((acc, item) => acc + item.count, 0);
  const slices = data.map((item, index) => ({
    id: item.label,
    value: item.count,
    label: item.label,
    color: SLICE_COLORS[index % SLICE_COLORS.length],
  }));

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      <Box
        role="img"
        aria-label={`Gráfico de pizza da distribuição por gênero (${data.length} categorias).`}
      >
        <PieChart
          series={[{ data: slices, innerRadius: size * 0.2, paddingAngle: 1, cornerRadius: 3 }]}
          width={size}
          height={size}
          slotProps={{ legend: { hidden: true } }}
        />
      </Box>
      <Box sx={{ minWidth: 180 }}>
        <DistributionLegend
          total={total}
          items={slices.map((slice) => ({
            label: slice.label,
            count: slice.value,
            color: slice.color,
          }))}
        />
      </Box>
    </Box>
  );
}
