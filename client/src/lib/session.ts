export const SESSION_INVALID = "foreverhome:session-invalid";
export const SESSION_REJECTION_MESSAGE =
  "Your session is unavailable. Please sign in again.";
export function invalidateSession() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(SESSION_INVALID));
}
export function rejectInvalidIdentity(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (
    [
      "auth/user-disabled",
      "auth/user-token-expired",
      "auth/id-token-expired",
      "auth/invalid-user-token",
    ].includes(code ?? "")
  )
    invalidateSession();
}
