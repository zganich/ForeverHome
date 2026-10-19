// Compatibility export for older callers; authentication uses verified Firebase ID tokens.
import { authenticateRequest } from "./auth";
export const sdk = { authenticateRequest };
