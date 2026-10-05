import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { requireAuth } from "./_core/auth";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // Fits Vercel's serverless request limit.
  },
  fileFilter: (_req, file, cb) => {
    cb(null, ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype));
  },
});

router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Upload a JPEG, PNG, WebP, or GIF image (maximum 4 MB)." });
    }

    // Generate unique filename
    const ext = req.file.originalname.split(".").pop();
    const filename = `${nanoid()}.${ext}`;
    const key = `uploads/${res.locals.user.id}/${filename}`;

    // Upload to S3
    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

    res.json({ url, key });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.use((error: Error, _req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
  if (error instanceof multer.MulterError) {
    res.status(413).json({ error: "Upload must be smaller than 4 MB." });
    return;
  }
  next(error);
});

export default router;
