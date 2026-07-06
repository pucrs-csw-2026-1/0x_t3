import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatNumber, formatPercent } from "../../utils/format";

export interface LegendItem {
  label: string;
  count: number;
  color?: string;
}

export interface DistributionLegendProps {
  items: LegendItem[];
  // Total do universo para o percentual; quando omitido, soma dos itens.
  total?: number;
}

// Legenda/tabela acessível compartilhada pelos gráficos da US-03. Complementa o
// gráfico MUI X (visual) com o valor absoluto e o percentual (locale pt-BR) de
// cada categoria — garante rótulos legíveis e leitura por leitor de tela sem
// depender de tick labels renderizados em SVG. Recebe tudo por props (ADR-0004).
export function DistributionLegend({ items, total }: DistributionLegendProps) {
  const sum = total ?? items.reduce((acc, item) => acc + item.count, 0);
  return (
    <Box component="dl" sx={{ m: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.875rem" }}
        >
          {item.color && (
            <Box
              aria-hidden="true"
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: item.color,
                flexShrink: 0,
              }}
            />
          )}
          <Typography component="dt" variant="body2" color="text.primary" sx={{ flex: 1 }}>
            {item.label}
          </Typography>
          <Typography component="dd" variant="body2" color="text.secondary" sx={{ m: 0 }}>
            {formatNumber(item.count)}
            <Box component="span" sx={{ ml: 1, fontWeight: 600, color: "text.primary" }}>
              {formatPercent(sum > 0 ? item.count / sum : 0, 1)}
            </Box>
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
