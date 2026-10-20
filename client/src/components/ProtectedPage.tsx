import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useEffect, type ReactNode } from "react";
import { invalidateSession, SESSION_REJECTION_MESSAGE } from "@/lib/session";

export function ProtectedPage({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const auth = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (auth.loading || auth.error || auth.isAuthenticated) return;
    // auth.me may reject a still-cached Firebase identity with 200/null rather
    // than HTTP 401. Clear it too, so a later sign-in starts with fresh caches.
    invalidateSession();
    setLocation("/login?reason=session-unavailable", { replace: true });
  }, [auth.loading, auth.error, auth.isAuthenticated, setLocation]);
  if (auth.loading) return <p role="status">Loading your account…</p>;
  if (auth.error)
    return (
      <div role="alert">
        Your account could not be loaded. Please try again.
        <button onClick={() => void auth.refresh()}>Retry</button>{" "}
        <Link href="/login">Sign in</Link>
      </div>
    );
  if (!auth.isAuthenticated)
    return (
      <div role="alert">
        {SESSION_REJECTION_MESSAGE} <Link href="/login">Sign in</Link>
      </div>
    );
  if (admin && auth.user?.role !== "admin")
    return (
      <div role="alert">
        Access denied. <Link href="/dashboard">Back to Dashboard</Link>
      </div>
    );
  return <>{children}</>;
}
