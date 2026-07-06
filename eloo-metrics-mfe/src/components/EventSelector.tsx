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
}

const ALL = "__all__";

// Filtro opcional de evento da US-03 (event_id). "Todos os eventos" mapeia para
// undefined (o backend devolve a visão global escopada por RBAC — ADR-0009).
export function EventSelector({ value, options, onChange, disabled = false }: EventSelectorProps) {
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
      <MenuItem value={ALL}>Todos os eventos</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
