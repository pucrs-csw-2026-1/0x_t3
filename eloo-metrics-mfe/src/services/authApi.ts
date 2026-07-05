// Reaproveita o storage/sessão do mfe-auth (ADR-0003). NÃO reimplementa login —
// apenas lê o token/perfil que o remote de auth já guardou (mesmas chaves) e
// sinaliza sessão expirada. A autenticação em si é responsabilidade do T1.

const ACCESS_TOKEN_KEY = "mfeAuth.accessToken";
const REFRESH_TOKEN_KEY = "mfeAuth.refreshToken";
const PROFILE_KEY = "mfeAuth.profile";

export type Role = "PARTICIPANT" | "MANAGER" | "ADMIN";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  accessLevel: Role;
}

// Disparado quando uma chamada autenticada volta 401. O host (shell) escuta e
// redireciona para /login — mesmo mecanismo do mfe-auth.
export const SESSION_EXPIRED_EVENT = "mfeAuth:sessionExpired";

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function clearStoredAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function notifySessionExpired(): void {
  clearStoredAuth();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}
