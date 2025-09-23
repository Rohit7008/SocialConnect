export function saveTokens(access: string, refresh?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access");
}

export function getAuthHeader(): HeadersInit {
  const token = getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` } as HeadersInit;
  }
  return {} as HeadersInit;
}

export async function refreshAccessToken() {
  const refresh =
    typeof window !== "undefined" ? localStorage.getItem("refresh") : null;
  if (!refresh) return null;
  const res = await fetch("/api/auth/token/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const { access } = await res.json();
  saveTokens(access);
  return access;
}
