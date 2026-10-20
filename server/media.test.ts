import { Readable } from "node:stream";
import express from "express";
import { beforeAll, afterAll, beforeEach, expect, it, vi } from "vitest";
import type { Server } from "node:http";
const state = vi.hoisted(() => ({
  read: vi.fn(),
  metadata: vi.fn(),
  file: vi.fn(),
}));
vi.mock("@google-cloud/storage", () => ({
  Storage: class {
    bucket() {
      return { file: state.file };
    }
  },
}));
vi.mock("./_core/auth", () => ({
  requireAuth: (req: any, res: any, next: any) => {
    if (req.headers.authorization !== "Bearer owner")
      return res.status(401).end();
    res.locals.user = { id: "owner" };
    next();
  },
}));
import router from "./routes/media";
import {
  ownedImageDataUrl,
  readOwnedImage,
  publicObjectUrl,
  userUploadPrefix,
} from "./storage";
let server: Server, origin: string;
const bytes = Buffer.from([255, 216, 255, 217]);
beforeAll(async () => {
  const app = express();
  app.use("/api", router);
  server = await new Promise<Server>(resolve => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  origin = `http://127.0.0.1:${(server.address() as any).port}`;
});
afterAll(() => new Promise<void>(resolve => server.close(() => resolve())));
beforeEach(() => {
  vi.clearAllMocks();
  state.file.mockReturnValue({
    getMetadata: state.metadata,
    createReadStream: state.read,
  });
  state.metadata.mockResolvedValue([
    { size: 4, contentType: "image/jpeg", generation: "1" },
  ]);
  state.read.mockImplementation(() => Readable.from([bytes]));
});
it("serves owned bytes privately and uses a generation-pinned read", async () => {
  const r = await fetch(origin + "/api/media/photo.jpg", {
    headers: { Authorization: "Bearer owner" },
  });
  expect(r.status).toBe(200);
  expect(r.headers.get("cache-control")).toBe("private, no-store");
  expect(r.headers.get("content-type")).toContain("image/jpeg");
  expect(Buffer.from(await r.arrayBuffer())).toEqual(bytes);
  expect(state.file).toHaveBeenCalledWith(
    userUploadPrefix("owner") + "photo.jpg",
    { generation: "1" }
  );
});
it("requires authentication before reading storage", async () => {
  expect((await fetch(origin + "/api/media/photo.jpg")).status).toBe(401);
  expect(state.file).not.toHaveBeenCalled();
});
it("rejects another owners locator before touching GCS", async () => {
  await expect(
    readOwnedImage(
      "owner",
      publicObjectUrl(userUploadPrefix("other") + "photo.jpg")
    )
  ).rejects.toThrow("uploaded to your account");
  expect(state.file).not.toHaveBeenCalled();
});
it("never opens an attacker-controlled path or URL", async () => {
  for (const name of ["a%2fb.jpg", "a%5cb.jpg", "bad.mp4"])
    expect(
      (
        await fetch(origin + "/api/media/" + name, {
          headers: { Authorization: "Bearer owner" },
        })
      ).status
    ).toBe(400);
  expect(state.file).not.toHaveBeenCalled();
});
it("does not let a filename select another users prefix", async () => {
  state.metadata.mockRejectedValue(new Error("missing"));
  expect(
    (
      await fetch(origin + "/api/media/others.jpg", {
        headers: { Authorization: "Bearer owner" },
      })
    ).status
  ).toBe(404);
  expect(state.file).toHaveBeenCalledWith(
    userUploadPrefix("owner") + "others.jpg"
  );
});
it("rejects oversized metadata, invalid signatures and inconsistent sizes", async () => {
  const url = publicObjectUrl(userUploadPrefix("owner") + "photo.jpg");
  state.metadata.mockResolvedValue([
    { size: 4194305, contentType: "image/jpeg" },
  ]);
  await expect(readOwnedImage("owner", url)).rejects.toThrow(
    "Photo unavailable"
  );
  expect(state.read).not.toHaveBeenCalled();
  state.metadata.mockResolvedValue([{ size: 4, contentType: "image/jpeg" }]);
  state.read.mockImplementation(() => Readable.from([Buffer.from("oops")]));
  await expect(readOwnedImage("owner", url)).rejects.toThrow();
  state.read.mockImplementation(() => Readable.from([bytes, bytes]));
  await expect(readOwnedImage("owner", url)).rejects.toThrow();
});
it("embeds owned bytes for AI instead of asking the provider to fetch GCS", async () => {
  expect(
    await ownedImageDataUrl(
      "owner",
      publicObjectUrl(userUploadPrefix("owner") + "photo.jpg")
    )
  ).toBe("data:image/jpeg;base64,/9j/2Q==");
});
