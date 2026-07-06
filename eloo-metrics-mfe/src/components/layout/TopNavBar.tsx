import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Avatar from "@mui/material/Avatar";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { TABS } from "./navTabs";

export interface TopNavBarProps {
  // Abre o menu lateral em telas pequenas (drawer controlado pelo App).
  onMenuClick?: () => void;
}

// Cabeçalho do shell standalone. Como remote, o topo é do eloo-shell
// (ADR-0005/0010); aqui espelha a referência só na visão standalone/demo.
// Puramente apresentacional.
export function TopNavBar({ onMenuClick }: TopNavBarProps) {
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          maxWidth: 1440,
          mx: "auto",
          height: 80,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <IconButton
            sx={{ display: { md: "none" } }}
            aria-label="Abrir menu"
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Box component="nav" sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
            {TABS.map((tab, index) => (
              <Typography
                key={tab}
                component="a"
                href="#"
                variant="body1"
                sx={{
                  textDecoration: "none",
                  py: 0.5,
                  fontWeight: index === 0 ? 700 : 500,
                  color: index === 0 ? "secondary.main" : "text.secondary",
                  borderBottom: index === 0 ? 2 : 0,
                  borderColor: "secondary.main",
                  "&:hover": { color: "secondary.main" },
                }}
              >
                {tab}
              </Typography>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.5,
              bgcolor: "#e2f8fb",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            <SearchOutlinedIcon fontSize="small" color="disabled" />
            <InputBase placeholder="Buscar..." sx={{ fontSize: 14, width: 160 }} />
          </Box>
          <IconButton aria-label="Notificações">
            <NotificationsNoneOutlinedIcon />
          </IconButton>
          <IconButton aria-label="Ajuda">
            <HelpOutlineOutlinedIcon />
          </IconButton>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.light" }}>AG</Avatar>
        </Box>
      </Box>
    </Box>
  );
}
