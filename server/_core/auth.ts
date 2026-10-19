import { TRPCError } from "@trpc/server";
import type { Request, RequestHandler } from "express";
import * as db from "../db";
import { verifyFirebaseToken } from "./firebase";

const invalidIdentityCodes = new Set([
  "auth/argument-error",
  "auth/invalid-id-token",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/user-disabled",
  "auth/user-not-found",
]);

export async function authenticateRequest(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ") || !header.slice(7).trim()) return null;
  let identity;
  try {
    identity = await verifyFirebaseToken(header.slice(7).trim());
  } catch (error) {
    if (invalidIdentityCodes.has((error as { code?: string }).code ?? ""))
      return null;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Authentication service unavailable.",
    });
  }
  if (!identity.uid || !identity.email_verified) return null;
  await db.upsertUser({
    id: identity.uid,
    email: identity.email ?? null,
    name: typeof identity.name === "string" ? identity.name : null,
    loginMethod: "firebase",
    lastSignedIn: new Date(),
  });
  const user = await db.getUser(identity.uid);
  if (!user)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to load your account.",
    });
  return user;
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.locals.user = user;
    next();
  } catch {
    res.status(503).json({ error: "Authentication or database unavailable" });
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  requireAuth(req, res, () => {
    if (res.locals.user?.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
};
