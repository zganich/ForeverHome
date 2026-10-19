import type { RequestHandler } from "express";

export function allowedOrigins() {
  return new Set(
    [
      process.env.APP_URL,
      ...(process.env.CORS_ALLOWED_ORIGINS ?? "").split(","),
    ]
      .filter((value): value is string => Boolean(value?.trim()))
      .map(value => {
        const origin = value.trim();
        const parsed = new URL(origin);
        if (
          parsed.origin !== origin ||
          (parsed.protocol !== "https:" &&
            !(
              parsed.protocol === "http:" &&
              process.env.NODE_ENV !== "production" &&
              ["localhost", "127.0.0.1"].includes(parsed.hostname)
            ))
        )
          throw new Error(
            "CORS origins must be exact HTTPS origins (local HTTP only in development)"
          );
        return origin;
      })
  );
}

export function apiCors(origins = allowedOrigins()): RequestHandler {
  return (req, res, next) => {
    const origin = req.headers.origin;
    res.vary("Origin");
    if (origin) {
      if (!origins.has(origin)) {
        res.status(403).json({ error: "Origin is not allowed" });
        return;
      }
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type"
      );
      res.setHeader("Access-Control-Max-Age", "600");
    }
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  };
}
