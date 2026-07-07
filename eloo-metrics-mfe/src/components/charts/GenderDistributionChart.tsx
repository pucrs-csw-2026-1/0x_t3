import Box from "@mui/material/Box";
import { PieChart } from "@mui/x-charts/PieChart";
import type { GenderDistribution } from "../../services/metricsApi";
import { DistributionLegend } from "./DistributionLegend";
import { EmptyState } from "../EmptyState";

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

  // Guarda de vazio (defesa própria, além do `empty` do DistributionPanel): sem
  // dados ou com total zero a rosca renderiza arcos NaN. Ver TimeSeriesChart.
  if (data.length === 0 || total === 0) {
    return (
      <EmptyState
        title="Sem dados de gênero"
        description="Não há distribuição por gênero para o período selecionado."
      />
    );
  }

  const slices = data.map((item, index) => ({
    id: `${item.label}-${index}`,
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
          // Sem animação de entrada: barras/arcos nascem no tamanho final (a animação
          // deixava o gráfico em branco em ambientes com efeitos de movimento reduzidos).
          skipAnimation
          series={[
            {
              data: slices,
              innerRadius: size * 0.25,
              outerRadius: size * 0.45,
              paddingAngle: 1,
              cornerRadius: 3,
            },
          ]}
          width={size}
          height={size}
          // O default reserva 100px à direita para a legenda interna (escondida
          // aqui — a tabela ao lado faz esse papel), o que espremia a rosca.
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
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
