import { createTheme } from "@mui/material/styles";

// Tema MUI próprio, usado quando o app roda standalone. Montado como remote, as
// páginas recebem o tema do shell via prop `theme` (ADR-0005). Tokens alinhados
// ao DESIGN.md da Eloo.
export const theme = createTheme({
  palette: {
    primary: { main: "#981652", light: "#b8336a", contrastText: "#ffffff" },
    secondary: { main: "#7b4d88", light: "#f0b9fd", contrastText: "#ffffff" },
    background: { default: "#ebfdff", paper: "#ffffff" },
    text: { primary: "#0a1e21", secondary: "#574147" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'Public Sans', sans-serif",
    button: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
  },
});
