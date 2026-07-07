import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { formatNumber } from "../utils/format";

// Opções de itens por página (US-04). A UI nunca carrega tudo de uma vez —
// cada troca dispara um novo fetch server-side (ADR-0009).
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

// Controles de paginação server-side (US-04). Mostra o intervalo "X–Y de Z" e
// navega por página; a página apenas reporta a intenção — o fetch é da página.
export function PaginationControls({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  // Normaliza entradas fora de faixa (o pai pode reduzir `total` sem resetar a
  // página, ou persistir um pageSize legado): pageSize inválido → menor opção
  // (evita totalPages Infinity), e page é clampada em [1, totalPages] para o
  // rótulo "X–Y de Z" e os botões nunca ficarem inconsistentes.
  const safePageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize)
    ? pageSize
    : PAGE_SIZE_OPTIONS[0];
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const to = Math.min(safePage * safePageSize, total);
  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        pt: 2,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Mostrando {formatNumber(from)}–{formatNumber(to)} de {formatNumber(total)} eventos
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          select
          size="small"
          label="Por página"
          value={safePageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          sx={{ minWidth: 120 }}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            aria-label="Página anterior"
            disabled={!canPrev}
            onClick={() => onPageChange(safePage - 1)}
          >
            <ChevronLeftOutlinedIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {formatNumber(safePage)} / {formatNumber(totalPages)}
          </Typography>
          <IconButton
            size="small"
            aria-label="Próxima página"
            disabled={!canNext}
            onClick={() => onPageChange(safePage + 1)}
          >
            <ChevronRightOutlinedIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
