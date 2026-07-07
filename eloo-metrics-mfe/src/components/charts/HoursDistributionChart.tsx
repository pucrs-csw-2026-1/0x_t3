import Box from "@mui/material/Box";
import { PieChart } from "@mui/x-charts/PieChart";
import type { HoursBandDistribution } from "../../services/metricsApi";
import { DistributionLegend } from "./DistributionLegend";

export interface HoursDistributionChartProps {
  // Faixas de horas já normalizadas pela camada de serviço (4 faixas canônicas
  // do T2, zeradas quando ausentes). O gráfico NUNCA faz fetch (ADR-0004).
  data: HoursBandDistribution[];
  size?: number;
}

// Paleta alinhada aos tokens do tema (mesma família do gráfico de gênero).
const SLICE_COLORS = ["#215470", "#7b4d88", "#981652", "#3d6c8a", "#8a7177"];

// Distribuição de horas de participação (US-06): rosca (MUI X PieChart) com os
// participantes por faixa de horas de engajamento, espelhando o layout do
// gráfico de gênero. A tabela ao lado lista cada faixa com valor + percentual
// pt-BR (acessibilidade).
export function HoursDistributionChart({ data, size = 200 }: HoursDistributionChartProps) {
  const total = data.reduce((acc, item) => acc + item.count, 0);
  const slices = data.map((item, index) => ({
    id: item.band,
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
        aria-label={`Gráfico de rosca das horas de participação (${data.length} faixas).`}
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
