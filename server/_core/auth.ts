import { createClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import type { Request, RequestHandler } from "express";
import * as db from "../db";
import { ENV } from "./env";

let client: ReturnType<typeof createClient> | undefined;

export async function authenticateRequest(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ") || !header.slice(7).trim()) return null;
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Supabase authentication is not configured.",
    });
  }
  client ??= createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  // Verify with the configured project's Auth server. Never trust a browser ID,
  // locally decoded JWT, user metadata role, or a legacy Manus cookie.
  const { data, error } = await client.auth.getUser(header.slice(7));
  if (error || !data.user) {
    if (error?.status && error.status >= 500) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Authentication service unavailable.",
      });
    }
    return null;
  }
  const identity = data.user;
  await db.upsertUser({
    id: identity.id,
    email: identity.email ?? null,
    name:
      identity.user_metadata?.name ?? identity.user_metadata?.full_name ?? null,
    loginMethod: "supabase",
    lastSignedIn: new Date(),
  });
  const user = await db.getUser(identity.id);
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
