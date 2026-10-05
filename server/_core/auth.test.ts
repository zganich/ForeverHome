import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  upsert: vi.fn(),
  load: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { getUser: mocks.getUser } }),
}));
vi.mock("../db", () => ({ upsertUser: mocks.upsert, getUser: mocks.load }));
vi.mock("./env", () => ({
  ENV: {
    supabaseUrl: "https://fictional.supabase.co",
    supabaseAnonKey: "test-public-key",
  },
}));
import { authenticateRequest, requireAdmin } from "./auth";

describe("Supabase API authentication", () => {
  beforeEach(() => vi.resetAllMocks());
  it("ignores old cookies and unsigned browser identities", async () => {
    expect(
      await authenticateRequest({
        headers: { cookie: "app_session_id=forged" },
        body: { id: "owner" },
      } as any)
    ).toBeNull();
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("rejects invalid or expired tokens without creating users", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: { status: 401 },
    });
    expect(
      await authenticateRequest({
        headers: { authorization: "Bearer expired" },
      } as any)
    ).toBeNull();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("syncs only verified identity and never trusts metadata role", async () => {
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "verified",
          email: "fictional@example.test",
          user_metadata: { role: "admin", name: "Fictional" },
        },
      },
      error: null,
    });
    mocks.load.mockResolvedValue({ id: "verified", role: "user" });
    const user = await authenticateRequest({
      headers: { authorization: "Bearer valid" },
      body: { id: "owner" },
    } as any);
    expect(user?.role).toBe("user");
    expect(mocks.getUser).toHaveBeenCalledWith("valid");
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: "verified", loginMethod: "supabase" })
    );
    expect(mocks.upsert.mock.calls[0][0]).not.toHaveProperty("role");
  });
  it("surfaces unavailable account persistence", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "verified" } },
      error: null,
    });
    mocks.upsert.mockRejectedValue(new Error("database down"));
    await expect(
      authenticateRequest({ headers: { authorization: "Bearer valid" } } as any)
    ).rejects.toThrow("database down");
  });
  it("blocks anonymous REST admin access", async () => {
    const res = { locals: {}, status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();
    requireAdmin({ headers: {} } as any, res as any, next);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
