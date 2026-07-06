import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./msw/server";

// jsdom não implementa ResizeObserver, mas o MUI X Charts precisa dele.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver =
  globalThis.ResizeObserver ?? (ResizeObserverStub as unknown as typeof ResizeObserver);

// O jsdom desta stack não expõe um Storage funcional (o Node 22 traz um
// `localStorage` experimental que exige `--localstorage-file`), então a camada
// de auth (mfeAuth.*) não teria onde ler/gravar. Um Storage em memória cobre os
// testes de forma determinística. Instalado só quando o storage nativo falha.
function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => (data.has(key) ? data.get(key)! : null),
    key: (index: number) => Array.from(data.keys())[index] ?? null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, String(value)),
  } as Storage;
}

function storageIsUsable(candidate: Storage | undefined): boolean {
  try {
    if (!candidate) return false;
    candidate.setItem("__probe__", "1");
    candidate.removeItem("__probe__");
    return true;
  } catch {
    return false;
  }
}

if (!storageIsUsable(globalThis.localStorage)) {
  const memory = createMemoryStorage();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: memory });
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "localStorage", { configurable: true, value: memory });
  }
}

// MSW: liga o mock de rede para os testes de integração (crescem na US-01).
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
