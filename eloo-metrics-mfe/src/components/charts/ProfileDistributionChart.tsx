import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";
import type { ProfileDistribution } from "../../services/metricsApi";
import { DistributionLegend } from "./DistributionLegend";
import { EmptyState } from "../EmptyState";

export interface ProfileDistributionChartProps {
  // Perfis de participante conforme o backend, já em pt-BR (camada de serviço).
  // O gráfico NUNCA faz fetch (ADR-0004).
  data: ProfileDistribution[];
  height?: number;
}

const BAR_COLOR = "#7b4d88"; // secondary

// Distribuição por perfil do participante (US-03): barras horizontais. O gráfico
// MUI X dá o visual; a legenda dá valor absoluto + percentual pt-BR por perfil.
export function ProfileDistributionChart({ data, height = 240 }: ProfileDistributionChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="Sem dados de perfil"
        description="Não há distribuição por perfil para o período selecionado."
      />
    );
  }

  const labels = data.map((item) => item.label);
  const counts = data.map((item) => item.count);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        role="img"
        aria-label={`Gráfico de barras da distribuição por perfil do participante (${labels.length} perfis).`}
      >
        <BarChart
          // Sem animação de entrada: barras/arcos nascem no tamanho final (a animação
          // deixava o gráfico em branco em ambientes com efeitos de movimento reduzidos).
          skipAnimation
          layout="horizontal"
          height={height}
          yAxis={[{ scaleType: "band", data: labels, tickLabelStyle: { fontSize: 11 } }]}
          xAxis={[{ label: "Participantes" }]}
          series={[{ data: counts, label: "Participantes", color: BAR_COLOR }]}
          margin={{ left: 120 }}
          slotProps={{ legend: { hidden: true } }}
        />
      </Box>
      <DistributionLegend items={data.map((item) => ({ label: item.label, count: item.count }))} />
    </Box>
  );
}
