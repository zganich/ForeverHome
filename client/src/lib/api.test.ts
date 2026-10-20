import { afterEach, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({
  configured: true,
  ready: vi.fn(),
  token: vi.fn(),
  verified: true,
}));
vi.mock("./firebase", () => ({
  get authConfigured() {
    return auth.configured;
  },
  getFirebaseAuth: () => ({
    authStateReady: auth.ready,
    currentUser: {
      get emailVerified() {
        return auth.verified;
      },
      getIdToken: auth.token,
    },
  }),
}));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.clearAllMocks();
  auth.verified = true;
  auth.configured = true;
});
it("waits for restored identity and sends the current bearer to the configured API without cookies", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
  const fetcher = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetcher);
  auth.ready.mockResolvedValue(undefined);
  auth.token.mockResolvedValue("fresh-token");
  const { authFetch } = await import("./api");
  await authFetch("/api/upload", { method: "POST", credentials: "include" });
  expect(auth.ready).toHaveBeenCalled();
  expect(fetcher).toHaveBeenCalledWith(
    "https://api.example.test/api/upload",
    expect.objectContaining({ credentials: "omit" })
  );
  expect(fetcher.mock.calls[0][1].headers.get("Authorization")).toBe(
    "Bearer fresh-token"
  );
});
it("never authorizes an unverified account or silently fetches after token refresh fails", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const { authHeaders, authFetch } = await import("./api");
  auth.verified = false;
  expect(await authHeaders()).toEqual({});
  expect(auth.token).not.toHaveBeenCalled();
  auth.verified = true;
  auth.token.mockRejectedValue(new Error("token refresh failed"));
  await expect(authFetch("/api/upload")).rejects.toThrow(
    "token refresh failed"
  );
  expect(fetcher).not.toHaveBeenCalled();
});
it("rejects external URLs and API path traversal before fetch", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
  const { apiUrl } = await import("./api");
  for (const path of [
    "https://attacker.invalid/api/upload",
    "//attacker.invalid/api/upload",
    "/api/../../private",
    "/api/%2e%2e/private",
    "/api/\\evil",
    "/api/%2fprivate",
  ])
    expect(() => apiUrl(path)).toThrow();
});

it("invalidates a rejected session on 401, but preserves it on 403 and service outages", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
  const dispatch = vi.fn();
  vi.stubGlobal("window", { dispatchEvent: dispatch });
  auth.ready.mockResolvedValue(undefined);
  auth.token.mockResolvedValue("fixture-token");
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const { authFetch } = await import("./api");
  for (const status of [403, 503]) {
    fetcher.mockResolvedValue({ status });
    await authFetch("/api/example");
  }
  expect(dispatch).not.toHaveBeenCalled();
  fetcher.mockResolvedValue({ status: 401 });
  await authFetch("/api/example");
  expect(dispatch).toHaveBeenCalledTimes(1);
});
it("handles a disabled identity during token refresh without sending a request", async () => {
  const dispatch = vi.fn();
  vi.stubGlobal("window", { dispatchEvent: dispatch });
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  auth.token.mockRejectedValue({ code: "auth/user-disabled" });
  const { authFetch } = await import("./api");
  await expect(authFetch("/api/example")).rejects.toMatchObject({
    code: "auth/user-disabled",
  });
  expect(dispatch).toHaveBeenCalledTimes(1);
  expect(fetcher).not.toHaveBeenCalled();
});
