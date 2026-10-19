import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  upsert: vi.fn(),
  load: vi.fn(),
}));
vi.mock("./firebase", () => ({ verifyFirebaseToken: mocks.verify }));
vi.mock("../db", () => ({ upsertUser: mocks.upsert, getUser: mocks.load }));
import { authenticateRequest, requireAdmin } from "./auth";

describe("Firebase API authentication", () => {
  beforeEach(() => vi.resetAllMocks());
  it("ignores old cookies and unsigned browser identities", async () => {
    expect(
      await authenticateRequest({
        headers: { cookie: "app_session_id=forged" },
        body: { id: "owner" },
      } as any)
    ).toBeNull();
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("rejects invalid or expired tokens without creating users", async () => {
    mocks.verify.mockRejectedValue({ code: "auth/id-token-expired" });
    expect(
      await authenticateRequest({
        headers: { authorization: "Bearer expired" },
      } as any)
    ).toBeNull();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("syncs only verified identity and never trusts metadata role", async () => {
    mocks.verify.mockResolvedValue({
      uid: "verified",
      email: "fictional@example.test",
      email_verified: true,
      role: "admin",
      name: "Fictional",
    });
    mocks.load.mockResolvedValue({ id: "verified", role: "user" });
    const user = await authenticateRequest({
      headers: { authorization: "Bearer valid" },
      body: { id: "owner" },
    } as any);
    expect(user?.role).toBe("user");
    expect(mocks.verify).toHaveBeenCalledWith("valid");
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: "verified", loginMethod: "firebase" })
    );
    expect(mocks.upsert.mock.calls[0][0]).not.toHaveProperty("role");
  });
  it("surfaces unavailable account persistence", async () => {
    mocks.verify.mockResolvedValue({ uid: "verified", email_verified: true });
    mocks.upsert.mockRejectedValue(new Error("database down"));
    await expect(
      authenticateRequest({ headers: { authorization: "Bearer valid" } } as any)
    ).rejects.toThrow("database down");
  });
  it("denies unverified email without writing an account", async () => {
    mocks.verify.mockResolvedValue({
      uid: "unverified",
      email_verified: false,
    });
    expect(
      await authenticateRequest({
        headers: { authorization: "Bearer valid" },
      } as any)
    ).toBeNull();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it.each([
    "auth/id-token-revoked",
    "auth/user-disabled",
    "auth/argument-error",
  ])("denies %s", async code => {
    mocks.verify.mockRejectedValue({ code });
    expect(
      await authenticateRequest({
        headers: { authorization: "Bearer rejected" },
      } as any)
    ).toBeNull();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("surfaces provider failures rather than treating them as anonymous", async () => {
    mocks.verify.mockRejectedValue({ code: "auth/internal-error" });
    await expect(
      authenticateRequest({ headers: { authorization: "Bearer valid" } } as any)
    ).rejects.toThrow("Authentication service unavailable");
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
