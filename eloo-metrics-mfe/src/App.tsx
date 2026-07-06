import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { SideNavBar } from "./components/layout/SideNavBar";
import { TopNavBar } from "./components/layout/TopNavBar";
import DashboardPage from "./pages/DashboardPage";
import EventCatalogPage from "./pages/EventCatalogPage";

// Standalone: aqui o App faz o papel do host (shell). É o host quem navega
// (ADR-0005) — o EventCatalogPage só reporta a seleção via onSelectEvent; a
// primitiva de navegação (useNavigate) vive no host, nunca dentro do remote.
function CatalogRoute() {
  const navigate = useNavigate();
  return <EventCatalogPage onSelectEvent={(eventId) => navigate(`/eventos/${eventId}`)} />;
}

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
      {/* No mobile a mesma barra vira drawer; navegar fecha o painel. A sidebar
          já carrega a navegação real (Dashboard / Catálogo), então não há abas
          extras a injetar. */}
      <Drawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <SideNavBar onNavigate={() => setMobileNavOpen(false)} />
      </Drawer>

      <Box
        component="main"
        sx={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}
      >
        <TopNavBar onMenuClick={() => setMobileNavOpen(true)} />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/catalogo" element={<CatalogRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}
