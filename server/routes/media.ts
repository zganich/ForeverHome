import { Router } from "express";
import { requireAuth } from "../_core/auth";
import { publicObjectUrl, readOwnedImage, userUploadPrefix } from "../storage";

const router = Router();
router.get("/media/:filename", requireAuth, async (req, res) => {
  if (!/^[A-Za-z0-9_-]+\.(?:jpg|png|gif|webp)$/.test(req.params.filename)) {
    res.status(400).json({ error: "Invalid image name" });
    return;
  }
  try {
    // Never accept a caller-supplied UID, URL or prefix.
    const locator = publicObjectUrl(
      `${userUploadPrefix(res.locals.user.id)}${req.params.filename}`
    );
    const image = await readOwnedImage(res.locals.user.id, locator);
    res.set({
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.type(image.contentType).send(image.bytes);
  } catch {
    res.status(404).json({ error: "Photo unavailable" });
  }
});
export default router;
