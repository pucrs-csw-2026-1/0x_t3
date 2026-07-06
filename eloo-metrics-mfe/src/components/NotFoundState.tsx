import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import { StatePanel } from "./StatePanel";

export interface NotFoundStateProps {
  // Volta ao catálogo (ADR-0005): a página nunca navega sozinha.
  onBack: () => void;
}

// Estado dedicado ao 404 do evento (evento inexistente/removido). Bloqueia a
// página inteira em vez de exibir um erro genérico (US-05).
export function NotFoundState({ onBack }: NotFoundStateProps) {
  return (
    <StatePanel
      icon={<EventBusyOutlinedIcon sx={{ fontSize: 32 }} />}
      title="Evento não encontrado"
      description="O evento solicitado não existe ou foi removido."
      actionLabel="Voltar ao catálogo"
      onAction={onBack}
    />
  );
}
