import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Servidor MSW para os testes (Node/Vitest). Ver src/test/setup.ts.
export const server = setupServer(...handlers);
