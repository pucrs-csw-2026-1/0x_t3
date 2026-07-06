import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { NAV_ROUTES } from "./navTabs";
import logoUrl from "../../assets/logo.png";

// Ícone por rota (o data-model em navTabs.ts fica sem JSX para não quebrar o
// fast-refresh). Rotas sem ícone dedicado caem num chevron neutro.
const ROUTE_ICONS: Record<string, ReactNode> = {
  "/": <DashboardOutlinedIcon />,
  "/catalogo": <EventOutlinedIcon />,
  "/demografia": <GroupsOutlinedIcon />,
};

const itemSx = {
  borderRadius: 2,
  mb: 0.5,
  "&.Mui-selected": {
    bgcolor: "secondary.light",
    color: "#72447f",
    fontWeight: 700,
    "&:hover": { bgcolor: "secondary.light" },
  },
} as const;

export interface SideNavBarProps {
  // Fecha o drawer ao navegar (mobile). No desktop a barra é permanente e não
  // precisa fechar nada.
  onNavigate?: () => void;
}

// Barra lateral do shell standalone. No runtime real como remote, a navegação é
// do eloo-shell (ADR-0005/0010); aqui liga cada item a uma rota real (Dashboard
// e Catálogo), destacando a página ativa. Suporte/Sair seguem decorativos.
export function SideNavBar({ onNavigate }: SideNavBarProps) {
  const { pathname } = useLocation();

  return (
    <Box
      component="aside"
      sx={{
        // Visibilidade (permanente x drawer) é decidida pelo App conforme o
        // breakpoint — aqui a barra só se apresenta.
        display: "flex",
        flexDirection: "column",
        width: 256,
        flexShrink: 0,
        height: "100%",
        px: 1,
        py: 2,
        bgcolor: "#e2f8fb",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ px: 2, py: 1, mb: 1 }}>
        <Box
          component="img"
          src={logoUrl}
          alt="Eloo"
          sx={{ height: 56, width: "auto", maxWidth: "100%", display: "block" }}
        />
      </Box>

      <List component="nav" aria-label="Navegação principal" sx={{ flex: 1 }}>
        {NAV_ROUTES.map((route) => {
          // "/" só casa exato; as demais casam o prefixo (para futuras subrotas).
          const selected = route.path === "/" ? pathname === "/" : pathname.startsWith(route.path);
          return (
            <ListItemButton
              key={route.path}
              component={NavLink}
              to={route.path}
              selected={selected}
              onClick={onNavigate}
              sx={itemSx}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                {ROUTE_ICONS[route.path] ?? <ChevronRightOutlinedIcon />}
              </ListItemIcon>
              <ListItemText
                primary={route.label}
                slotProps={{ primary: { fontWeight: selected ? 700 : 500 } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Button variant="contained" color="primary" sx={{ my: 2, mx: 1 }}>
        Novo Evento
      </Button>

      <Divider />
      <List>
        <ListItemButton sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SupportAgentOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Suporte" />
        </ListItemButton>
        <ListItemButton sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </Box>
  );
}
