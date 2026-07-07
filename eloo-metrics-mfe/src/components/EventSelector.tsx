import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

export interface EventOption {
  id: string;
  name: string;
}

export interface EventSelectorProps {
  // undefined = "Todos os eventos" (dados globais). Emite a seleção para cima;
  // nunca faz fetch (ADR-0005) — quem consulta é a DemographicsPage.
  value: string | undefined;
  options: EventOption[];
  onChange: (eventId: string | undefined) => void;
  disabled?: boolean;
  // false = sem a opção "Todos os eventos" (US-06: manager analisa POR evento,
  // não a visão agregada). O chamador garante um value definido.
  allowAll?: boolean;
}

const ALL = "__all__";

// Filtro de evento da US-03 (event_id). "Todos os eventos" mapeia para
// undefined (o backend devolve a visão global escopada por RBAC — ADR-0009).
export function EventSelector({
  value,
  options,
  onChange,
  disabled = false,
  allowAll = true,
}: EventSelectorProps) {
  return (
    <TextField
      select
      size="small"
      label="Evento"
      value={value ?? ALL}
      disabled={disabled}
      onChange={(event) => {
        const next = event.target.value;
        onChange(next === ALL ? undefined : next);
      }}
      sx={{ minWidth: 200 }}
    >
      {allowAll && <MenuItem value={ALL}>Todos os eventos</MenuItem>}
      {!allowAll && value === undefined && (
        <MenuItem value={ALL} disabled>
          Selecione um evento…
        </MenuItem>
      )}
      {options.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
