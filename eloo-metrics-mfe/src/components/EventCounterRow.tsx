import Box from "@mui/material/Box";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { MetricCard } from "./MetricCard";
import { formatPercent } from "../utils/format";

export interface EventCounterRowProps {
  registered: number;
  checkedIn: number;
  certified: number;
  // Enquanto os counters não chegaram, os cards renderizam sua variante skeleton
  // (MetricCard sem `value`).
  loading?: boolean;
}

// Linha de cards de counter do evento (referência visual: EventCounterRow):
// inscritos, check-ins e certificados. Reaproveita o MetricCard da US-02 — em
// loading, os cards caem no skeleton; nas notas laterais mostram a proporção
// sobre os inscritos (pt-BR), sem divisão por zero.
export function EventCounterRow({
  registered,
  checkedIn,
  certified,
  loading = false,
}: EventCounterRowProps) {
  const checkInRatio = registered > 0 ? checkedIn / registered : null;
  const certRatio = registered > 0 ? certified / registered : null;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
      }}
    >
      <MetricCard
        label="Inscritos Totais"
        value={loading ? undefined : registered}
        icon={<PeopleAltOutlinedIcon fontSize="small" color="disabled" />}
        caption="Total de inscrições no evento"
      />
      <MetricCard
        label="Check-ins"
        value={loading ? undefined : checkedIn}
        note={checkInRatio != null ? `${formatPercent(checkInRatio, 1)} do total` : undefined}
        icon={<TaskAltOutlinedIcon fontSize="small" color="disabled" />}
        caption="Presenças confirmadas"
      />
      <MetricCard
        label="Certificados Emitidos"
        value={loading ? undefined : certified}
        note={certRatio != null ? `${formatPercent(certRatio, 1)} do total` : undefined}
        icon={<VerifiedOutlinedIcon fontSize="small" color="disabled" />}
        caption="Emitidos com sucesso"
      />
    </Box>
  );
}
