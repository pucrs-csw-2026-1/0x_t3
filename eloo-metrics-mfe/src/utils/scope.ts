import type { UserProfile } from "../services/authApi";

// US-02: uma ÚNICA página para admin e manager. A filtragem por escopo é do
// backend (RBAC — ADR-0009); o frontend só muda o título/indicador de escopo.
// Admin = visão global; manager = escopo dele (identificado pelo próprio nome,
// já que o perfil não carrega um "nome de escopo" dedicado).

export interface ScopeIndicator {
  title: string;
  subtitle: string;
}

export function resolveScope(profile: UserProfile | null): ScopeIndicator {
  if (profile?.accessLevel === "ADMIN") {
    return {
      title: "Dashboard — Administrador Global",
      subtitle: "Acompanhe as métricas de engajamento e certificação de todos os eventos.",
    };
  }

  if (profile?.accessLevel === "MANAGER") {
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    // Fallback final: sem nome e sem username o título não pode terminar em
    // "Escopo de " (com espaço solto).
    const label = name || profile.username?.trim() || "sua gestão";
    return {
      title: `Dashboard — Escopo de ${label}`,
      subtitle: "Acompanhe as métricas dos eventos sob sua gestão.",
    };
  }

  return {
    title: "Dashboard",
    subtitle: "Acompanhe as métricas de engajamento e certificação em tempo real.",
  };
}
