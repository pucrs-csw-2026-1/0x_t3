import { RateCard } from "./RateCard";

export interface CheckinRateCardProps {
  // Razão 0..1 de check-in (checked_in / registered). `null` enquanto carrega.
  rate: number | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// Taxa de check-in do evento (US-05). Fino invólucro sobre RateCard para fixar
// título, cor e legenda — o padrão visual é compartilhado com a certificação.
export function CheckinRateCard({ rate, loading, error, onRetry }: CheckinRateCardProps) {
  return (
    <RateCard
      title="Taxa de Check-in"
      rate={rate}
      loading={loading}
      error={error}
      onRetry={onRetry}
      color="secondary"
      caption="Check-ins sobre inscritos totais"
    />
  );
}
