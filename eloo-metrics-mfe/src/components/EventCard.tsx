import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip, { type ChipProps } from "@mui/material/Chip";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import type { ReactNode } from "react";
import { formatDate, formatNumber, formatPercent } from "../utils/format";
import type { EventStatus } from "../services/metricsApi";

export interface EventCounters {
  registered: number;
  checkedIn: number;
  certified: number;
}

export interface EventPeriod {
  startDate: string | null;
  endDate: string | null;
}

export interface EventCardProps {
  eventId: string;
  name: string | null;
  period: EventPeriod;
  status: EventStatus;
  counters: EventCounters;
  // Única forma de navegar: reporta a seleção para o host (ADR-0005). O card
  // nunca navega sozinho.
  onSelectEvent: (eventId: string) => void;
}

interface StatusMeta {
  label: string;
  color: ChipProps["color"];
}

// Situação → rótulo pt-BR + cor do chip (referência visual: Ativo/Encerrado/
// Rascunho). "unknown" cai num rótulo neutro em vez de sumir.
const STATUS_META: Record<EventStatus, StatusMeta> = {
  active: { label: "Ativo", color: "success" },
  ended: { label: "Encerrado", color: "default" },
  draft: { label: "Rascunho", color: "warning" },
  unknown: { label: "Indefinido", color: "default" },
};

// Barra lateral colorida do card por situação (espelha o mockup).
const STATUS_BAR: Record<EventStatus, string> = {
  active: "#22c55e",
  ended: "#9ca3af",
  draft: "#eab308",
  unknown: "#9ca3af",
};

function formatEventPeriod(period: EventPeriod): string {
  const { startDate, endDate } = period;
  if (!startDate && !endDate) return "Data a definir";
  if (startDate && endDate && startDate !== endDate) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }
  return formatDate(startDate ?? endDate);
}

// Counter resumido do card: ícone + valor + (proporção sobre inscritos). A
// proporção cai num traço quando não há inscritos (evita divisão por zero).
function Counter({
  icon,
  value,
  unit,
  ratio,
}: {
  icon: ReactNode;
  value: number;
  unit: string;
  ratio?: number | null;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
      {icon}
      <Typography variant="body2" component="span">
        <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
          {formatNumber(value)}
        </Box>{" "}
        {unit}
        {ratio != null && ` (${formatPercent(ratio)})`}
      </Typography>
    </Box>
  );
}

// Card de um evento no catálogo (US-04). Recebe tudo por props — não faz fetch.
// O card inteiro é clicável (CardActionArea) e reporta a seleção via
// onSelectEvent; a navegação é do host (ADR-0005).
export function EventCard({
  eventId,
  name,
  period,
  status,
  counters,
  onSelectEvent,
}: EventCardProps) {
  const meta = STATUS_META[status];
  const label = name ?? "Evento sem nome";
  const registered = counters.registered;
  const checkInRatio = registered > 0 ? counters.checkedIn / registered : null;
  const certRatio = registered > 0 ? counters.certified / registered : null;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 120ms, box-shadow 120ms",
        "&:hover": { borderColor: "primary.main", boxShadow: 3 },
      }}
    >
      {/* Faixa lateral que sinaliza a situação do evento. */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: STATUS_BAR[status],
        }}
      />
      <CardActionArea
        onClick={() => onSelectEvent(eventId)}
        aria-label={`Ver métricas de ${label}`}
        sx={{ height: "100%", p: 2, pl: 2.5 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
              <Chip size="small" label={meta.label} color={meta.color} />
              <Typography variant="body2" color="text.secondary">
                {formatEventPeriod(period)}
              </Typography>
            </Box>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1.5 }}>
              {label}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Counter
                icon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
                value={counters.registered}
                unit="inscritos"
              />
              <Counter
                icon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />}
                value={counters.checkedIn}
                unit="check-ins"
                ratio={checkInRatio}
              />
              <Counter
                icon={<VerifiedOutlinedIcon sx={{ fontSize: 18 }} />}
                value={counters.certified}
                unit="certificados"
                ratio={certRatio}
              />
            </Box>
          </Box>
          <Box
            aria-hidden="true"
            sx={{
              flexShrink: 0,
              alignSelf: { xs: "flex-end", sm: "center" },
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              bgcolor: "action.hover",
            }}
          >
            <ArrowForwardOutlinedIcon />
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
