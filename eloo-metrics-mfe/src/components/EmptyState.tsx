import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export interface EmptyStateProps {
  title?: string;
  description?: string;
}

// Estado vazio: a API respondeu, mas não há dados no período (ADR-0009: a UI
// sempre envia janela, então "vazio" é um resultado legítimo, não um erro).
export function EmptyState({
  title = "Nenhum dado no período",
  description = "Não encontramos eventos para o período selecionado. Ajuste o filtro e tente novamente.",
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1,
        py: 8,
        px: 2,
        color: "text.secondary",
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.6 }} aria-hidden="true" />
      <Typography variant="h6" component="p" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: 420 }}>
        {description}
      </Typography>
    </Box>
  );
}
