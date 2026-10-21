import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";

// Requests contain IDs/URLs and text (analysis context <=5000 characters),
// never inline photo bytes. Leave room for Unicode and bounded tRPC batching.
export const JSON_BODY_LIMIT = 64 * 1024;
export const jsonBody = express.json({
  limit: JSON_BODY_LIMIT,
  strict: true,
  inflate: false,
});
export const formBody = express.urlencoded({
  limit: 8 * 1024,
  extended: false,
  parameterLimit: 20,
  inflate: false,
});
export const boundedJson: RequestHandler = (req, res, next) => {
  let fields = 0,
    nodes = 0;
  const valid = (value: unknown, depth: number): boolean => {
    if (++nodes > 512 || depth > 8) return false;
    if (typeof value === "string") return value.length <= 16384;
    if (Array.isArray(value))
      return value.length <= 20 && value.every(v => valid(v, depth + 1));
    if (value && typeof value === "object") {
      const entries = Object.entries(value);
      fields += entries.length;
      return fields <= 128 && entries.every(([, v]) => valid(v, depth + 1));
    }
    return true;
  };
  if (!valid(req.body, 0)) {
    res
      .status(413)
      .json({
        error: "Request exceeds the supported field, nesting or item limits.",
      });
    return;
  }
  next();
};
export const parserError: ErrorRequestHandler = (error, _req, res, next) => {
  const type = (error as { type?: string }).type;
  if (type === "entity.too.large" || type === "parameters.too.many") {
    res.status(413).json({ error: "Request body is too large." });
    return;
  }
  if (type === "encoding.unsupported") {
    res
      .status(415)
      .json({ error: "Compressed request bodies are unsupported." });
    return;
  }
  if (type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON body." });
    return;
  }
  next(error);
};
