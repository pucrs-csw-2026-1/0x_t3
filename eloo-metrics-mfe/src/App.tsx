import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";

// Router usado APENAS quando o app roda standalone (dev/preview próprios).
// Montado no shell, cada página é consumida como remote de Module Federation
// (ver ADR-0010) — o roteamento e a proteção de rota ficam no host.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
