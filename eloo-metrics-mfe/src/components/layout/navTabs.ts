// Rotas de navegação do shell standalone. Cada entrada aponta para uma página
// exposta como remote (ADR-0005): Dashboard (US-02), Catálogo de Eventos
// (US-04) e Distribuições Demográficas (US-03). Em módulo próprio para que o
// TopNavBar, a SideNavBar e o menu mobile (drawer) compartilhem a MESMA lista
// sem quebrar o fast-refresh (arquivos de componente só exportam componentes).
// No runtime real como remote, quem navega é o eloo-shell; aqui as rotas
// existem só para a visão standalone/demo.
export interface NavRoute {
  label: string;
  path: string;
}

export const NAV_ROUTES: NavRoute[] = [
  { label: "Dashboard", path: "/" },
  { label: "Catálogo de Eventos", path: "/catalogo" },
  { label: "Distribuições Demográficas", path: "/demografia" },
];
