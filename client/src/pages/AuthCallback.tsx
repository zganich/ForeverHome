import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { applyActionCode, reload } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Outcome = { message: string; destination: string };
export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("Checking your email confirmation…");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const task = useRef<Promise<Outcome> | null>(null);
  const syncUser = trpc.auth.syncUser.useMutation();
  const redeemCode = trpc.credits.redeemBetaCode.useMutation();
  const syncIdentity = syncUser.mutateAsync;
  const redeemPendingCode = redeemCode.mutateAsync;
  useEffect(() => {
    let active = true;
    task.current ??= (async () => {
      const auth = getFirebaseAuth();
      await auth.authStateReady();
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const code = params.get("oobCode");
      // Only the configured Firebase project is used. Ignore query API keys and
      // continueUrl values: an email link must never select a project/redirect.
      if (mode === "resetPassword" && code)
        return {
          message: "Continue to reset your password.",
          destination: `/auth/reset-password?oobCode=${encodeURIComponent(code)}`,
        };
      if (mode && (mode !== "verifyEmail" || !code))
        throw new Error("Invalid confirmation link. Request a new email.");
      if (mode === "verifyEmail") await applyActionCode(auth, code!);
      const user = auth.currentUser;
      if (!user)
        return {
          message:
            mode === "verifyEmail"
              ? "Email confirmed. Sign in to open your account."
              : "Sign in to finish opening your account.",
          destination: "/login",
        };
      await reload(user);
      await user.getIdToken(true);
      if (!user.emailVerified)
        throw new Error(
          "Your email is not verified yet. Sign in to resend the confirmation email."
        );
      await syncIdentity();
      const pendingCode = localStorage.getItem("pendingBetaCode");
      if (pendingCode) {
        try {
          await redeemPendingCode({ code: pendingCode });
          localStorage.removeItem("pendingBetaCode");
        } catch {
          /* Preserve the code for a dashboard retry. */
        }
      }
      return {
        message: "Email confirmed. Your account is ready.",
        destination: "/dashboard",
      };
    })();
    task.current
      .then(result => {
        if (active) {
          setMessage(result.message);
          setOutcome(result);
        }
      })
      .catch(() => {
        if (active) {
          setMessage(
            "This link is invalid or expired, or verification could not complete. Sign in to request a new email."
          );
          setOutcome({ message: "", destination: "/login" });
        }
      });
    return () => {
      active = false;
    };
  }, [syncIdentity, redeemPendingCode]);
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email confirmation</CardTitle>
          <CardDescription role="status">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {outcome && (
            <Button onClick={() => navigate(outcome.destination)}>
              Continue
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
