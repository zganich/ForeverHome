import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import type { ReactNode } from "react";

export function ProtectedPage({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const auth = useAuth();
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
        Your session is unavailable. Please sign in again.{" "}
        <Link href="/login">Sign in</Link>
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
