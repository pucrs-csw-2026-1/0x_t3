import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

export interface SearchInputProps {
  value: string;
  // Emite o novo termo para cima; NUNCA faz fetch — a busca do catálogo é local,
  // filtrando por nome o resultado já carregado (US-04). Quem orquestra é a página.
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

// Campo de busca local do catálogo (referência visual: Catalog Toolbar). Filtra
// por nome no resultado atual — não dispara nova consulta ao T2.
export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar eventos...",
  label = "Buscar eventos",
}: SearchInputProps) {
  return (
    <TextField
      size="small"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      slotProps={{
        htmlInput: { "aria-label": label },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon fontSize="small" color="disabled" />
            </InputAdornment>
          ),
        },
      }}
      sx={{ minWidth: { xs: "100%", sm: 240 } }}
    />
  );
}
