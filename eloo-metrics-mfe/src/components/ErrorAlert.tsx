import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

export interface ErrorAlertProps {
  message: string;
  // Opcional: sem handler, o botão "Tentar novamente" NÃO é renderizado (um botão
  // que não faz nada é um erro "tratado" só na aparência).
  onRetry?: () => void;
  retryLabel?: string;
}

// Feedback de erro com ação de retentar (referência visual: Error Alert).
// A mensagem já vem traduzida em pt-BR pela camada de serviço (ADR-0009).
export function ErrorAlert({ message, onRetry, retryLabel = "Tentar novamente" }: ErrorAlertProps) {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  );
}
