import Box from "@mui/material/Box";
import { PeriodSelector } from "./PeriodSelector";
import { SearchInput } from "./SearchInput";
import type { Period, PeriodKey } from "../utils/periods";

export interface CatalogToolbarProps {
  // Período (reaproveita o PeriodSelector da US-02).
  periodKey: PeriodKey;
  customPeriod: Period;
  onPeriodChange: (key: PeriodKey, period: Period) => void;
  // Busca local por nome.
  search: string;
  onSearchChange: (value: string) => void;
}

// Barra de controles do catálogo (US-04): seletor de período + busca local.
// Puramente apresentacional — só emite mudanças para cima; nunca faz fetch nem
// filtra dados aqui (ADR-0005). Quem consulta o T2 e filtra é o EventCatalogPage.
export function CatalogToolbar({
  periodKey,
  customPeriod,
  onPeriodChange,
  search,
  onSearchChange,
}: CatalogToolbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        justifyContent: { xs: "stretch", md: "flex-end" },
      }}
    >
      <PeriodSelector value={periodKey} customPeriod={customPeriod} onChange={onPeriodChange} />
      <SearchInput value={search} onChange={onSearchChange} />
    </Box>
  );
}
