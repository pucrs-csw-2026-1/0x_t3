import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import type { Granularity } from "../services/metricsApi";

export interface GranularitySelectorProps {
  value: Granularity;
  // Emite a nova granularidade para cima; NUNCA faz fetch — quem refaz a chamada
  // de /timeseries é a EventMetricsPage (ADR-0005: componentes reportam por
  // callback).
  onChange: (value: Granularity) => void;
}

interface GranularityOption {
  value: Granularity;
  label: string;
}

// Rótulos pt-BR do seletor (ADR-0005) mapeados às chaves enviadas ao backend.
const OPTIONS: GranularityOption[] = [
  { value: "month", label: "Mensal" },
  { value: "quarter", label: "Trimestral" },
  { value: "year", label: "Anual" },
];

// Seletor de granularidade da série histórica (US-05). Presets Mensal /
// Trimestral / Anual; ao trocar, a página refaz apenas o fetch de timeseries.
export function GranularitySelector({ value, onChange }: GranularitySelectorProps) {
  return (
    <TextField
      select
      size="small"
      label="Granularidade"
      value={value}
      onChange={(event) => onChange(event.target.value as Granularity)}
      sx={{ minWidth: 160 }}
    >
      {OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
