import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";

export interface EngagementBarChartProps {
  // Rótulos e séries já normalizados pela camada de serviço — o gráfico NUNCA
  // faz fetch (ADR-0004). Uma barra por evento.
  labels: string[];
  registered: number[];
  checkedIn: number[];
  title?: string;
  description?: string;
  height?: number;
}

// Gráfico de barras de engajamento por evento (referência visual: "Engajamento
// por Evento"). Compara inscritos x check-ins nos eventos do período. Recebe
// dados por props; acessibilidade: título, descrição e aria-label (ADR-0004).
export function EngagementBarChart({
  labels,
  registered,
  checkedIn,
  title = "Engajamento por Evento",
  description = "Comparativo de adesão nos eventos do período.",
  height = 288,
}: EngagementBarChartProps) {
  return (
    <Box component="figure" sx={{ m: 0 }}>
      <Typography variant="h6" component="h3" color="primary" fontWeight={600}>
        {title}
      </Typography>
      <Typography
        component="figcaption"
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5, mb: 1 }}
      >
        {description}
      </Typography>
      {/* Em telas estreitas, muitos eventos não cabem lado a lado: em vez de
          espremer as barras, o gráfico rola na horizontal mantendo uma largura
          mínima legível por barra. */}
      <Box sx={{ overflowX: "auto" }}>
        <Box
          role="img"
          aria-label={`Gráfico de barras: ${title}. Inscritos e check-ins por evento (${labels.length} eventos).`}
          sx={{ minWidth: Math.max(labels.length * 64, 320) }}
        >
          <BarChart
            // Sem animação de entrada: barras/arcos nascem no tamanho final (a animação
            // deixava o gráfico em branco em ambientes com efeitos de movimento reduzidos).
            skipAnimation
            height={height}
            xAxis={[{ scaleType: "band", data: labels, tickLabelStyle: { fontSize: 11 } }]}
            series={[
              { data: registered, label: "Inscritos", color: "#f0b9fd" },
              { data: checkedIn, label: "Check-ins", color: "#7b4d88" },
            ]}
            slotProps={{
              legend: { direction: "row", position: { vertical: "bottom", horizontal: "middle" } },
            }}
            margin={{ bottom: 70 }}
          />
        </Box>
      </Box>
    </Box>
  );
}
