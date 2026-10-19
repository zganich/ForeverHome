import { Router } from "express";
import multer from "multer";
import { storagePut, userUploadPrefix } from "./storage";
import { nanoid } from "nanoid";
import { requireAuth } from "./_core/auth";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // Preserve the existing product limit on Cloud Run.
  },
  fileFilter: (_req, file, cb) => {
    cb(
      null,
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.mimetype
      )
    );
  },
});

router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({
          error: "Upload a JPEG, PNG, WebP, or GIF image (maximum 4 MB).",
        });
    }

    // Generate unique filename
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    };
    const ext = extensions[req.file.mimetype];
    const bytes = req.file.buffer;
    const valid =
      req.file.mimetype === "image/jpeg"
        ? bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
        : req.file.mimetype === "image/png"
          ? bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : req.file.mimetype === "image/gif"
            ? ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString())
            : req.file.mimetype === "image/webp" &&
              bytes.subarray(0, 4).toString() === "RIFF" &&
              bytes.subarray(8, 12).toString() === "WEBP";
    if (!ext || !valid)
      return res
        .status(400)
        .json({ error: "Photo content does not match its image type" });
    const filename = `${nanoid()}.${ext}`;
    const key = `${userUploadPrefix(res.locals.user.id)}${filename}`;

    // Upload to the configured GCS media bucket
    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

    res.json({ url, key });
  } catch (error) {
    console.error("Photo upload failed");
    res.status(500).json({ error: "Upload failed" });
  }
});

router.use(
  (
    error: Error,
    _req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction
  ) => {
    if (error instanceof multer.MulterError) {
      res.status(413).json({ error: "Upload must be smaller than 4 MB." });
      return;
    }
    next(error);
  }
);

export default router;
