import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { SideNavBar } from "./components/layout/SideNavBar";
import { TopNavBar } from "./components/layout/TopNavBar";
import { TABS } from "./components/layout/navTabs";
import DashboardPage from "./pages/DashboardPage";

// Shell usado APENAS quando o app roda standalone (dev/preview próprios). A
// sidebar e o cabeçalho vivem aqui — NÃO dentro do remote exposto: como remote
// de Module Federation (ADR-0005/0010), o layout/nav/tema são do eloo-shell, e o
// DashboardPage é montado sozinho, sem chrome próprio. Aqui eles existem só para
// a visão standalone espelhar a referência visual do Stitch.
export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar permanente a partir de md; em telas menores vira drawer. */}
      <Box sx={{ display: { xs: "none", md: "block" }, height: "100%" }}>
        <SideNavBar />
      </Box>
      {/* No mobile o drawer é um painel único e coeso: as abas do topo (que
          somem no cabeçalho estreito) entram como seção "Navegação" da sidebar. */}
      <Drawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onClick={() => setMobileNavOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <SideNavBar tabs={TABS} />
      </Drawer>

      <Box
        component="main"
        sx={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}
      >
        <TopNavBar onMenuClick={() => setMobileNavOpen(true)} />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}
