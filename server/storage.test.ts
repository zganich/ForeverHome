import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  exists: vi.fn(),
  file: vi.fn(),
  bucket: vi.fn(),
}));
vi.mock("@google-cloud/storage", () => ({
  Storage: vi.fn(function () {
    return { bucket: mocks.bucket };
  }),
}));
import {
  assertOwnedImageUrl,
  publicObjectUrl,
  storageGet,
  storagePut,
  userUploadPrefix,
} from "./storage";

describe("public Cloud Storage adapter", () => {
  afterEach(() => vi.clearAllMocks());
  it("writes once with MIME metadata and returns the public URL without changing ACLs", async () => {
    mocks.bucket.mockReturnValue({ file: mocks.file });
    mocks.file.mockReturnValue({ save: mocks.save, exists: mocks.exists });
    mocks.save.mockResolvedValue(undefined);
    const key = `${userUploadPrefix("firebase:uid/with-punctuation")}image.jpg`;
    expect(await storagePut(key, Buffer.from("fixture"), "image/jpeg")).toEqual(
      { key, url: publicObjectUrl(key) }
    );
    expect(mocks.save).toHaveBeenCalledWith(
      Buffer.from("fixture"),
      expect.objectContaining({
        preconditionOpts: { ifGenerationMatch: 0 },
        metadata: expect.objectContaining({ contentType: "image/jpeg" }),
      })
    );
    expect(mocks.bucket).toHaveBeenCalledWith("foreverhome-test-media");
  });
  it("does not return a URL for a missing object or expose provider errors", async () => {
    mocks.bucket.mockReturnValue({ file: mocks.file });
    mocks.file.mockReturnValue({ exists: mocks.exists, save: mocks.save });
    mocks.exists.mockResolvedValue([false]);
    await expect(storageGet("missing.jpg")).rejects.toThrow(
      "Cloud Storage object unavailable"
    );
    mocks.save.mockRejectedValue(new Error("provider internals"));
    await expect(storagePut("image.jpg", "fixture")).rejects.toThrow(
      "Cloud Storage upload failed"
    );
  });
  it("accepts only the caller's canonical image namespace", () => {
    const owned = publicObjectUrl(`${userUploadPrefix("owner")}image.jpg`);
    expect(assertOwnedImageUrl("owner", owned)).toBe(owned);
    for (const candidate of [
      owned + "?alt=media",
      owned + "#fragment",
      owned.replace("image.jpg", "../other.jpg"),
      owned.replace("image.jpg", "%2e%2e.jpg"),
      owned.replace("image.jpg", "video.mp4"),
      publicObjectUrl(`${userUploadPrefix("other-user")}image.jpg`),
      "https://external.invalid/image.jpg",
      owned.replace(
        "storage.googleapis.com/",
        "storage.googleapis.com.attacker.invalid/"
      ),
    ]) {
      expect(() => assertOwnedImageUrl("owner", candidate)).toThrow(
        "uploaded to your account"
      );
    }
  });
  it("rejects ambiguous object keys", () => {
    for (const key of ["", "../object", "a/../object", "a//object"])
      expect(() => publicObjectUrl(key)).toThrow("Invalid storage key");
  });
});
