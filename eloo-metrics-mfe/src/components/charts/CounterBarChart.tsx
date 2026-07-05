import { BarChart } from "@mui/x-charts/BarChart";

export interface CounterBarChartProps {
  labels: string[];
  registered: number[];
  checkedIn: number[];
}

// Gráfico de barras reutilizável (ADR-0004, MUI X Charts). NÃO faz fetch —
// recebe dados já normalizados pela camada de serviço. No scaffold (US-00) é
// alimentado com dados de exemplo; a integração real chega na US-01+.
export function CounterBarChart({ labels, registered, checkedIn }: CounterBarChartProps) {
  return (
    <BarChart
      height={280}
      xAxis={[{ scaleType: "band", data: labels }]}
      series={[
        { data: registered, label: "Inscritos" },
        { data: checkedIn, label: "Check-ins" },
      ]}
    />
  );
}
