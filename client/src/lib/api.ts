import { supabase, authConfigured } from "./supabase";

export async function authHeaders(): Promise<Record<string, string>> {
  if (!authConfigured) return {};
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(await authHeaders()))
    headers.set(key, value);
  return fetch(input, { ...init, headers });
}
