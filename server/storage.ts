import { Storage } from "@google-cloud/storage";
import { createHash } from "node:crypto";
import { ENV } from "./_core/env";
import { TRPCError } from "@trpc/server";

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

// Stored URLs are locators, never publicly readable delivery URLs.
export async function readOwnedImage(userId: string, locator: string) {
  assertOwnedImageUrl(userId, locator);
  const key = locator.slice(
    `https://storage.googleapis.com/${ENV.storageBucket}/`.length
  );
  try {
    const object = bucket().file(key);
    const [metadata] = await object.getMetadata();
    const size = Number(metadata.size);
    const type = metadata.contentType ?? "";
    if (
      !Number.isFinite(size) ||
      size <= 0 ||
      size > 4 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type)
    )
      throw new Error("Unsupported image");
    // Pin the generation inspected above; bound memory even if metadata is wrong.
    const chunks: Buffer[] = [];
    let length = 0;
    const stream = bucket()
      .file(key, { generation: metadata.generation })
      .createReadStream();
    try {
      for await (const chunk of stream) {
        length += chunk.length;
        if (length > 4 * 1024 * 1024) throw new Error("Image too large");
        chunks.push(Buffer.from(chunk));
      }
    } finally {
      stream.destroy();
    }
    const bytes = Buffer.concat(chunks);
    const valid =
      type === "image/jpeg"
        ? bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
        : type === "image/png"
          ? bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : type === "image/gif"
            ? ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString())
            : bytes.subarray(0, 4).toString() === "RIFF" &&
              bytes.subarray(8, 12).toString() === "WEBP";
    if (!valid || length !== size) throw new Error("Invalid image");
    return { bytes, contentType: type };
  } catch {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Photo unavailable. Please upload it again.",
    });
  }
}

export async function ownedImageDataUrl(userId: string, locator: string) {
  const { bytes, contentType } = await readOwnedImage(userId, locator);
  return `data:${contentType};base64,${bytes.toString("base64")}`;
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
        metadata: { contentType, cacheControl: "private, no-store" },
      });
    // Retain the existing DB locator contract; delivery requires the media API.
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
