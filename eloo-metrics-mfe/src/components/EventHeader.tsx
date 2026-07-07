import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip, { type ChipProps } from "@mui/material/Chip";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import type { EventStatus } from "../services/metricsApi";

export interface EventHeaderProps {
  name: string | null;
  // Janela do evento já formatada em pt-BR (ex.: "15/01/2026 – 30/06/2026").
  period: string;
  status: EventStatus;
  // Volta ao catálogo (ADR-0005): o cabeçalho reporta por callback, nunca navega.
  onBack: () => void;
  // Indicador de escopo do manager (ex.: "Seu escopo"). Ausente para admin.
  scopeLabel?: string;
}

interface StatusMeta {
  label: string;
  color: ChipProps["color"];
}

// Situação → rótulo pt-BR + cor do chip (mesma semântica do EventCard da US-04,
// chaves do enum real do T2 — US-06). "unknown" cai num rótulo neutro.
const STATUS_META: Record<EventStatus, StatusMeta> = {
  ativo: { label: "Ativo", color: "success" },
  concluido: { label: "Concluído", color: "default" },
  planejado: { label: "Planejado", color: "warning" },
  cancelado: { label: "Cancelado", color: "error" },
  unknown: { label: "Indefinido", color: "default" },
};

// Cabeçalho do detalhe do evento (referência visual: EventHeader do mockup):
// link de voltar, título, badge de situação, janela do evento e — para manager —
// indicador de escopo. Recebe tudo por props; a navegação de volta é do host.
export function EventHeader({ name, period, status, onBack, scopeLabel }: EventHeaderProps) {
  const meta = STATUS_META[status];
  const label = name ?? "Evento sem nome";

  return (
    <Box component="header" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Button
        onClick={onBack}
        startIcon={<ArrowBackOutlinedIcon />}
        sx={{ alignSelf: "flex-start", color: "text.secondary", px: 1 }}
      >
        Voltar ao catálogo
      </Button>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          color="text.primary"
          fontWeight={700}
          sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
        >
          {label}
        </Typography>
        <Chip size="small" label={meta.label} color={meta.color} />
        {scopeLabel && (
          <Chip size="small" variant="outlined" color="secondary" label={scopeLabel} />
        )}
      </Box>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
      >
        <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} aria-hidden="true" />
        {period}
      </Typography>
    </Box>
  );
}
