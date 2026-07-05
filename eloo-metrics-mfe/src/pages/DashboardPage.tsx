import { useCallback, useEffect, useState } from "react";
import { ThemeProvider, type Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { CounterBarChart } from "../components/charts/CounterBarChart";
import { listEventMetrics, type EventMetricsPage } from "../services/metricsApi";
import { theme as defaultTheme } from "../theme";

export interface DashboardPageProps {
  // Tema passado pelo shell (ADR-0005); cai no tema próprio quando standalone.
  theme?: Theme;
}

type Status = "loading" | "error" | "empty" | "ready";

// Período padrão do esqueleto ambulante. O seletor de período chega na US-02;
// aqui a janela é fixa só para provar a integração ponta-a-ponta.
const DEFAULT_PERIOD = { startDate: "2026-01-01", endDate: "2026-12-31" };

const nf = new Intl.NumberFormat("pt-BR");

// US-01 (esqueleto ambulante): busca UMA métrica real do T2 (counters por
// evento) e exibe, tratando loading / erro / vazio / sessão expirada. A visão
// completa (filtros, engajamento, adaptável por papel) chega na US-02.
export default function DashboardPage({ theme }: DashboardPageProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<EventMetricsPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const page = await listEventMetrics(DEFAULT_PERIOD);
      setData(page);
      setStatus(page.items.length === 0 ? "empty" : "ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar as métricas.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ThemeProvider theme={theme ?? defaultTheme}>
      <Box className="min-h-screen bg-neutral" sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Métricas Eloo
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Visão geral dos eventos.
        </Typography>

        {status === "loading" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 3 }}>
            <CircularProgress size={22} />
            <Typography color="text.secondary">Carregando métricas…</Typography>
          </Box>
        )}

        {status === "error" && (
          <Alert
            severity="error"
            sx={{ mt: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => void load()}>
                Tentar novamente
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {status === "empty" && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Nenhum evento no período selecionado.
          </Alert>
        )}

        {status === "ready" && data && (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Eventos no período
                </Typography>
                <Typography variant="h3" component="p" fontWeight={700}>
                  {nf.format(data.total)}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Inscrições e check-ins por evento
                </Typography>
                <CounterBarChart
                  labels={data.items.map((i) => i.eventName ?? i.eventId)}
                  registered={data.items.map((i) => i.registered)}
                  checkedIn={data.items.map((i) => i.checkedIn)}
                />
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
