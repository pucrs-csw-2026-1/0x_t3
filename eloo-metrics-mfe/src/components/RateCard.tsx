import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import { ErrorAlert } from "./ErrorAlert";
import { formatPercent } from "../utils/format";

export interface RateCardProps {
  title: string;
  // Razão 0..1 (a UI formata com formatPercent). `null` quando ainda não há dado.
  rate: number | null;
  // Legenda inferior (ex.: "Meta: 75%", "Baseado nos inscritos totais").
  caption?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  // Cor do medidor (barra) — diferencia check-in de certificação.
  color?: "primary" | "secondary";
}

// Card de taxa com medidor visual simples (referência visual: cards de Taxa de
// Check-in / Conclusão). Percentual em destaque + barra de progresso. Base
// compartilhada por CheckinRateCard e CertificationRateCard — não faz fetch,
// recebe a razão por props e centraliza loading/erro/retry por card (US-05).
export function RateCard({
  title,
  rate,
  caption,
  loading = false,
  error = null,
  onRetry,
  color = "primary",
}: RateCardProps) {
  // Razão clampada em [0,1] usada TANTO no percentual em destaque QUANTO na barra,
  // para que não divirjam (ex.: rate 1,5 mostraria "150%" com a barra em 100%).
  const clampedRate = rate != null && Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 1) : null;
  const percent = (clampedRate ?? 0) * 100;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}>
        <Typography
          variant="overline"
          component="h3"
          color="text.secondary"
          sx={{ letterSpacing: "0.05em", fontWeight: 600 }}
        >
          {title}
        </Typography>

        {loading ? (
          <>
            <Skeleton variant="text" width="40%" height={48} />
            <Skeleton variant="rounded" width="100%" height={8} />
          </>
        ) : error ? (
          <ErrorAlert message={error} onRetry={onRetry} />
        ) : (
          <>
            <Typography variant="h4" component="p" color={`${color}.main`} fontWeight={700}>
              {formatPercent(clampedRate, 1)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={percent}
              color={color}
              aria-label={`${title}: ${formatPercent(clampedRate, 1)}`}
              sx={{ height: 8, borderRadius: 4 }}
            />
            {caption && (
              <Typography variant="body2" color="text.secondary">
                {caption}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
