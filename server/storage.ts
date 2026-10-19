import { Storage } from "@google-cloud/storage";
import { createHash } from "node:crypto";
import { ENV } from "./_core/env";

let storage: Storage | undefined;
function bucket() {
  if (
    !ENV.storageBucket ||
    !/^[a-z0-9][a-z0-9._-]+[a-z0-9]$/.test(ENV.storageBucket)
  )
    throw new Error("Cloud Storage bucket is not configured");
  storage ??= new Storage(); // Application Default Credentials; no downloaded key.
  return storage.bucket(ENV.storageBucket);
}
function normalizeKey(key: string) {
  const normalized = key.replace(/^\/+/, "");
  if (
    !normalized ||
    normalized.split("/").some(part => !part || part === "." || part === "..")
  )
    throw new Error("Invalid storage key");
  return normalized;
}
export function publicObjectUrl(key: string) {
  const encoded = normalizeKey(key)
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `https://storage.googleapis.com/${ENV.storageBucket}/${encoded}`;
}
export function userUploadPrefix(userId: string) {
  // Stable opaque folder supports all Firebase UIDs, including punctuation.
  return `uploads/${createHash("sha256").update(userId).digest("hex")}/`;
}
export function assertOwnedImageUrl(userId: string, value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Use a photo uploaded to your account");
  }
  const prefix = `https://storage.googleapis.com/${ENV.storageBucket}/${userUploadPrefix(userId)}`;
  if (
    !ENV.storageBucket ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    !value.startsWith(prefix) ||
    !/^[A-Za-z0-9_-]+\.(?:jpg|png|gif|webp)$/.test(value.slice(prefix.length))
  )
    throw new Error("Use a photo uploaded to your account");
  return value;
}
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
) {
  const key = normalizeKey(relKey);
  try {
    await bucket()
      .file(key)
      .save(Buffer.from(data), {
        resumable: false,
        preconditionOpts: { ifGenerationMatch: 0 },
        metadata: { contentType, cacheControl: "public, max-age=3600" },
      });
    // Public read is an explicitly approved bucket policy, not an object ACL.
    return { key, url: publicObjectUrl(key) };
  } catch {
    throw new Error("Cloud Storage upload failed");
  }
}
export async function storageGet(relKey: string, _expiresIn = 300) {
  const key = normalizeKey(relKey);
  try {
    const [exists] = await bucket().file(key).exists();
    if (!exists) throw new Error("Missing object");
    return { key, url: publicObjectUrl(key) };
  } catch {
    throw new Error("Cloud Storage object unavailable");
  }
}
