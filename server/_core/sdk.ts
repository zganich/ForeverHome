// Compatibility export for older callers; authentication now uses Supabase.
import { authenticateRequest } from "./auth";
export const sdk = { authenticateRequest };
