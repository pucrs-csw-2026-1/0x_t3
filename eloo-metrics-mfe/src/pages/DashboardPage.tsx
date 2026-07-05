import { ThemeProvider, type Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CounterBarChart } from "../components/charts/CounterBarChart";
import { theme as defaultTheme } from "../theme";

export interface DashboardPageProps {
  // Tema passado pelo shell (ADR-0005); cai no tema próprio quando standalone.
  theme?: Theme;
}

// Placeholder da US-00: prova que o app roda e renderiza no padrão (MUI + tema
// + gráfico MUI X), em pt-BR. SEM integração de API — os dados são estáticos de
// exemplo. A integração real (login → métrica do T2) chega na US-01.
export default function DashboardPage({ theme }: DashboardPageProps) {
  const exemplo = {
    labels: ["Evento A", "Evento B", "Evento C"],
    registered: [120, 90, 60],
    checkedIn: [80, 55, 40],
  };

  return (
    <ThemeProvider theme={theme ?? defaultTheme}>
      <Box className="min-h-screen bg-neutral" sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Métricas Eloo
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Dashboard de métricas de eventos — dados de exemplo (a integração com o backend chega na
          US-01).
        </Typography>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Inscrições e check-ins por evento
            </Typography>
            <CounterBarChart {...exemplo} />
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
