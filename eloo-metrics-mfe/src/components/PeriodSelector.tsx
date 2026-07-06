import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { PERIOD_OPTIONS, resolvePeriod, type Period, type PeriodKey } from "../utils/periods";

export interface PeriodSelectorProps {
  value: PeriodKey;
  customPeriod: Period;
  // Emite a mudança para cima com a janela já resolvida. NUNCA faz fetch — quem
  // busca é o DashboardPage (ADR-0005: componentes reportam por callback).
  onChange: (key: PeriodKey, period: Period) => void;
}

// Seletor de período do dashboard. Presets (hoje / 7d / 30d) resolvem a janela
// na hora; "Personalizado" revela dois campos de data. Em qualquer caso emite
// uma janela concreta — a UI nunca chama a API sem período (ADR-0009).
export function PeriodSelector({ value, customPeriod, onChange }: PeriodSelectorProps) {
  const handlePresetChange = (key: PeriodKey) => {
    if (key === "custom") {
      onChange("custom", customPeriod);
    } else {
      onChange(key, resolvePeriod(key));
    }
  };

  const handleCustomChange = (field: keyof Period, isoDate: string) => {
    onChange("custom", { ...customPeriod, [field]: isoDate });
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
      <TextField
        select
        size="small"
        label="Período"
        value={value}
        onChange={(event) => handlePresetChange(event.target.value as PeriodKey)}
        sx={{ minWidth: 180 }}
      >
        {PERIOD_OPTIONS.map((option) => (
          <MenuItem key={option.key} value={option.key}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      {value === "custom" && (
        <>
          <TextField
            type="date"
            size="small"
            label="De"
            value={customPeriod.startDate}
            onChange={(event) => handleCustomChange("startDate", event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="date"
            size="small"
            label="Até"
            value={customPeriod.endDate}
            onChange={(event) => handleCustomChange("endDate", event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </>
      )}
    </Box>
  );
}
