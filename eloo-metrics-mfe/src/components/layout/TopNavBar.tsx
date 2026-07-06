import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Avatar from "@mui/material/Avatar";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuIcon from "@mui/icons-material/Menu";

export interface TopNavBarProps {
  // Abre o menu lateral em telas pequenas (drawer controlado pelo App).
  onMenuClick?: () => void;
}

// Cabeçalho do shell standalone. Como remote, o topo é do eloo-shell
// (ADR-0005/0010); aqui espelha a referência só na visão standalone/demo.
// A navegação (Dashboard / Catálogo) vive só na SideNavBar — fonte única —,
// então o topo fica com o botão de menu (mobile), busca e ações utilitárias.
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
        <IconButton sx={{ display: { md: "none" } }} aria-label="Abrir menu" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: "auto" }}>
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
