import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// Nem ms-metrics (T2) nem ms-auth (T1) enviam headers CORS, então requisições
// diretas do browser seriam bloqueadas. Este app expõe `/api` (métricas) e
// `/auth-api` (auth) na própria origem e o Vite as encaminha server-to-server —
// mesmo padrão do eloo-auth-mfe. Ver ADR-0003.
const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
const proxy = {
  "/api": {
    target: env.METRICS_SERVICE_URL || "http://localhost:8000",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ""),
  },
  "/auth-api": {
    target: env.AUTH_SERVICE_URL || "http://localhost:8080",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/auth-api/, ""),
  },
};

// Remote ("mfeMetrics") de Module Federation consumido pelo eloo-shell
// (ADR-0001/0010). Roda standalone em dev (:5177) e como remote buildado
// via `serve:remote` (:5176). A lista `shared` deve bater com a do shell.
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mfeMetrics",
      filename: "remoteEntry.js",
      exposes: {
        "./DashboardPage": "./src/pages/DashboardPage.tsx",
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "@mui/material",
        "@emotion/react",
        "@emotion/styled",
      ],
    }),
  ],
  build: { target: "esnext", modulePreload: false, cssCodeSplit: false },
  server: { port: 5177, strictPort: true, cors: true, proxy },
  preview: { port: 5176, strictPort: true, cors: true, proxy },
});
