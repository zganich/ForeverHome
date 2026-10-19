import { getFirebaseAuth, authConfigured } from "./firebase";

const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
if (base) {
  const url = new URL(base);
  if (
    url.origin !== base ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        import.meta.env.DEV &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      ))
  )
    throw new Error(
      "VITE_API_BASE_URL must be an HTTPS origin (or local HTTP in development)"
    );
}
export function apiUrl(path: string) {
  if (!path.startsWith("/api/") || path.includes("\\") || /%2f|%5c/i.test(path))
    throw new Error("Expected an application API path");
  const parsed = new URL(path, base || "https://local.invalid");
  if (!parsed.pathname.startsWith("/api/"))
    throw new Error("Expected an application API path");
  return `${base}${path}`;
}

export async function authHeaders(): Promise<Record<string, string>> {
  if (!authConfigured) return {};
  const auth = getFirebaseAuth();
  await auth.authStateReady();
  const user = auth.currentUser;
  return user?.emailVerified
    ? { Authorization: `Bearer ${await user.getIdToken()}` }
    : {};
}

export async function authFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(await authHeaders()))
    headers.set(key, value);
  return fetch(apiUrl(input), { ...init, credentials: "omit", headers });
}
