import type { RequestHandler } from "express";
import {
  apiSecurityHeaders,
  browserCsp,
  hostingSecurityHeaders,
} from "../../shared/securityHeaders";

export const apiHeaders: RequestHandler = (_req, res, next) => {
  res.set(apiSecurityHeaders);
  next();
};
export function browserHeaders(development = false): RequestHandler {
  return (_req, res, next) => {
    res.set(hostingSecurityHeaders);
    if (development) {
      // Vite injects an inline refresh preamble and uses loopback WebSockets.
      // The production/Hosting policy never permits inline scripts or eval.
      res.setHeader(
        "Content-Security-Policy",
        browserCsp
          .replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
          .replace(
            "connect-src 'self'",
            "connect-src 'self' ws://localhost:* ws://127.0.0.1:*"
          )
      );
    }
    next();
  };
}
