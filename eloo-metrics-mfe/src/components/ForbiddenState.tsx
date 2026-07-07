import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { StatePanel } from "./StatePanel";

export interface ForbiddenStateProps {
  // Volta ao catálogo (ADR-0005): a página nunca navega sozinha.
  onBack: () => void;
}

// Estado dedicado ao 403 do evento (fora do escopo do manager — RBAC do T2,
// ADR-0009). Mensagem humanizada, nunca o erro cru; bloqueia a página inteira.
export function ForbiddenState({ onBack }: ForbiddenStateProps) {
  return (
    <StatePanel
      tone="error"
      icon={<LockOutlinedIcon sx={{ fontSize: 32 }} />}
      title="Acesso negado"
      description="Você não tem permissão para ver este evento."
      actionLabel="Voltar ao catálogo"
      onAction={onBack}
    />
  );
}
