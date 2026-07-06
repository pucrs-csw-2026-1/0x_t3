/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Modo demonstração: quando "true", a camada de serviço devolve dados mockados
  // sem tocar a rede (ver src/services/mockData.ts). Ligado só em .env.development.
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
