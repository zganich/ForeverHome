import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  initialize: vi.fn(),
  apps: vi.fn(),
}));
vi.mock("firebase-admin/app", () => ({
  applicationDefault: () => "adc-fixture",
  getApps: mocks.apps,
  initializeApp: mocks.initialize,
}));
vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({ verifyIdToken: mocks.verify }),
}));
import { verifyFirebaseToken } from "./firebase";
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});
it("pins verification to the configured project with revocation checking and ADC", async () => {
  mocks.apps.mockReturnValue([]);
  mocks.initialize.mockReturnValue({ name: "foreverhome-api" });
  mocks.verify.mockResolvedValue({ uid: "verified-user" });
  await expect(verifyFirebaseToken("fixture-token")).resolves.toEqual({
    uid: "verified-user",
  });
  expect(mocks.initialize).toHaveBeenCalledWith(
    { credential: "adc-fixture", projectId: "foreverhome-test" },
    "foreverhome-api"
  );
  expect(mocks.verify).toHaveBeenCalledWith("fixture-token", true);
});
it("refuses emulator tokens in production before calling the verifier", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("FIREBASE_AUTH_EMULATOR_HOST", "localhost:9099");
  await expect(verifyFirebaseToken("unsigned-emulator-token")).rejects.toThrow(
    "forbidden in production"
  );
  expect(mocks.verify).not.toHaveBeenCalled();
});
