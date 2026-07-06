import { RateCard } from "./RateCard";

export interface CertificationRateCardProps {
  // Razão 0..1 de certificação (certified / registered). `null` enquanto carrega.
  rate: number | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// Taxa de certificação do evento (US-05). Mesmo padrão visual do
// CheckinRateCard, via RateCard — só muda título, cor e legenda.
export function CertificationRateCard({
  rate,
  loading,
  error,
  onRetry,
}: CertificationRateCardProps) {
  return (
    <RateCard
      title="Taxa de Conclusão (Certificação)"
      rate={rate}
      loading={loading}
      error={error}
      onRetry={onRetry}
      color="primary"
      caption="Certificados sobre inscritos totais"
    />
  );
}
