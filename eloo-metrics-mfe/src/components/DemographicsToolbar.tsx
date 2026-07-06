import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { PeriodSelector } from "./PeriodSelector";
import { EventSelector, type EventOption } from "./EventSelector";
import type { Period, PeriodKey } from "../utils/periods";

export interface DemographicsToolbarProps {
  // Período (reaproveita o PeriodSelector da US-02). A janela mensal (YYYY-MM)
  // é derivada das datas na camada de serviço.
  periodKey: PeriodKey;
  customPeriod: Period;
  onPeriodChange: (key: PeriodKey, period: Period) => void;
  // Filtro opcional de evento.
  eventId: string | undefined;
  eventOptions: EventOption[];
  onEventChange: (eventId: string | undefined) => void;
  // Mensagem de validação inline (from > to / formato inválido). Bloqueia o
  // fetch a montante; aqui é só a apresentação do erro (não é alert global).
  validationError?: string | null;
}

// Barra de controles das distribuições (US-03): seletor de evento + período.
// Puramente apresentacional — só emite mudanças para cima; nunca faz fetch nem
// valida a montante (ADR-0005). A validação de intervalo é feita na
// DemographicsPage; este componente apenas exibe a mensagem inline.
export function DemographicsToolbar({
  periodKey,
  customPeriod,
  onPeriodChange,
  eventId,
  eventOptions,
  onEventChange,
  validationError = null,
}: DemographicsToolbarProps) {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: { md: "flex-end" } }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          justifyContent: { xs: "stretch", md: "flex-end" },
        }}
      >
        <EventSelector value={eventId} options={eventOptions} onChange={onEventChange} />
        <PeriodSelector value={periodKey} customPeriod={customPeriod} onChange={onPeriodChange} />
      </Box>
      {validationError && (
        <Box
          role="alert"
          sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "error.main", mt: 0.5 }}
        >
          <ErrorOutlineIcon fontSize="small" aria-hidden="true" />
          <Typography variant="body2" color="error">
            {validationError}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
