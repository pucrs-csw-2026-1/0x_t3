import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Config separada do vite.config.ts de propósito: o plugin de Module Federation
// não deve rodar sob o Vitest. Aqui só o essencial para testar componentes e a
// camada de serviço (unit + integração com MSW — ADR-0011).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
        "src/App.tsx",
        "src/vite-env.d.ts",
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
