const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

// SÉCURITÉ: le access token n'est JAMAIS persisté dans localStorage/sessionStorage.
// Ces storages sont lisibles par n'importe quel script JS de la page : une seule faille
// XSS (une lib tierce compromise, une dépendance piégée, etc.) suffirait alors à voler
// durablement le token de session de tous les utilisateurs. On le garde uniquement en
// mémoire (variable de module, effacée à chaque rechargement de page) ; AuthContext
// restaure la session au chargement via le cookie httpOnly de refresh (voir /auth/refresh),
// qui lui n'est jamais accessible en JavaScript.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json();
        setAccessToken(data.accessToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefreshRetry?: boolean;
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (!options.skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // nécessaire pour le cookie httpOnly du refresh token
  });

  if (res.status === 401 && !options.skipAuth && !options.skipRefreshRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, skipRefreshRetry: true });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(body.error ?? `Erreur API (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: ApiOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
