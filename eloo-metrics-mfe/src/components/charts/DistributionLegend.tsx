import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
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

// Tabela acessível compartilhada pelos gráficos da US-03 (US-06: promovida de
// lista para <table> semântica a pedido do usuário). Complementa o gráfico MUI X
// (visual) com o valor absoluto e o percentual (locale pt-BR) de cada categoria
// — garante leitura por leitor de tela e os dados exatos mesmo se o SVG não
// renderizar. Recebe tudo por props (ADR-0004).
export function DistributionLegend({ items, total }: DistributionLegendProps) {
  const sum = total ?? items.reduce((acc, item) => acc + item.count, 0);
  return (
    <Table size="small" aria-label="Tabela de valores da distribuição">
      <TableHead>
        <TableRow>
          <TableCell sx={{ color: "text.secondary" }}>Categoria</TableCell>
          <TableCell align="right" sx={{ color: "text.secondary" }}>
            Participantes
          </TableCell>
          <TableCell align="right" sx={{ color: "text.secondary" }}>
            %
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={`${item.label}-${index}`} sx={{ "&:last-child td": { border: 0 } }}>
            <TableCell>
              {item.color && (
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: item.color,
                    mr: 1,
                    verticalAlign: "middle",
                  }}
                />
              )}
              {item.label}
            </TableCell>
            <TableCell align="right" sx={{ color: "text.secondary" }}>
              {formatNumber(item.count)}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              {formatPercent(sum > 0 ? item.count / sum : 0, 1)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
