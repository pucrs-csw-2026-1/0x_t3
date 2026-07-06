import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

export interface ErrorAlertProps {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}

// Feedback de erro com ação de retentar (referência visual: Error Alert).
// A mensagem já vem traduzida em pt-BR pela camada de serviço (ADR-0009).
export function ErrorAlert({ message, onRetry, retryLabel = "Tentar novamente" }: ErrorAlertProps) {
  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          {retryLabel}
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
