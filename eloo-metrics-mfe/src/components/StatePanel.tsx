import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export interface StatePanelProps {
  // Ícone central (ex.: cadeado, evento removido). Recebe o role decorativo.
  icon: ReactNode;
  title: string;
  description: string;
  // Ação primária opcional (ex.: "Voltar ao catálogo"). Sem ela, o painel é só
  // informativo.
  actionLabel?: string;
  onAction?: () => void;
  // Cor de fundo do círculo do ícone (semântica: erro em 403, neutro em 404).
  tone?: "error" | "neutral";
}

// Painel de estado que ocupa a área principal (referência visual: ForbiddenState
// / NotFoundState do mockup). Base compartilhada por NotFoundState e
// ForbiddenState — centraliza o layout (ícone em círculo, título, subtítulo e
// ação) para não duplicar a marcação entre os dois estados.
export function StatePanel({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = "neutral",
}: StatePanelProps) {
  return (
    <Box
      role="status"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1.5,
        py: 10,
        px: 2,
        minHeight: 320,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: tone === "error" ? "error.light" : "action.hover",
          color: tone === "error" ? "error.main" : "text.secondary",
        }}
      >
        {icon}
      </Box>
      <Typography variant="h5" component="h2" color="text.primary" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 380 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
