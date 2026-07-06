import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import logoUrl from "../../assets/logo.png";

interface NavItem {
  label: string;
  icon: ReactNode;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: <DashboardOutlinedIcon />, active: true },
  { label: "Participantes", icon: <GroupsOutlinedIcon /> },
  { label: "Certificações", icon: <VerifiedOutlinedIcon /> },
  { label: "Engajamento", icon: <AnalyticsOutlinedIcon /> },
  { label: "Administração", icon: <AdminPanelSettingsOutlinedIcon /> },
];

// Ícones das abas do topo, para o menu mobile ficar coeso com a navegação lateral.
const TAB_ICONS: Record<string, ReactNode> = {
  "Visão Geral": <GridViewOutlinedIcon />,
  Relatórios: <AssessmentOutlinedIcon />,
  Eventos: <EventOutlinedIcon />,
  Configurações: <SettingsOutlinedIcon />,
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
  // Abas do topo, injetadas só no menu mobile (drawer) — no desktop elas ficam no
  // TopNavBar. Quando presentes, aparecem como uma seção "Navegação" no topo,
  // dentro do mesmo painel (visual coeso).
  tabs?: string[];
}

// Barra lateral do shell standalone. No runtime real como remote, a navegação é
// do eloo-shell (ADR-0005/0010); aqui existe só para a visão standalone/demo
// espelhar a referência visual. Puramente apresentacional.
export function SideNavBar({ tabs }: SideNavBarProps) {
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

      {tabs && tabs.length > 0 && (
        <>
          <List
            component="nav"
            aria-label="Navegação principal"
            subheader={
              <ListSubheader
                disableSticky
                sx={{ bgcolor: "transparent", color: "text.secondary", lineHeight: "32px" }}
              >
                Navegação
              </ListSubheader>
            }
          >
            {tabs.map((tab) => (
              <ListItemButton key={tab} sx={itemSx}>
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                  {TAB_ICONS[tab] ?? <ChevronRightOutlinedIcon />}
                </ListItemIcon>
                <ListItemText primary={tab} slotProps={{ primary: { fontWeight: 500 } }} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ mx: 2, my: 1 }} />
        </>
      )}

      <List
        component="nav"
        aria-label="Seções do painel"
        sx={{ flex: 1 }}
        subheader={
          tabs && tabs.length > 0 ? (
            <ListSubheader
              disableSticky
              sx={{ bgcolor: "transparent", color: "text.secondary", lineHeight: "32px" }}
            >
              Painel
            </ListSubheader>
          ) : undefined
        }
      >
        {NAV_ITEMS.map((item) => (
          <ListItemButton key={item.label} selected={item.active} sx={itemSx}>
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { fontWeight: item.active ? 700 : 500 } }}
            />
          </ListItemButton>
        ))}
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
