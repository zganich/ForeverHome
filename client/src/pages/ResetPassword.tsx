import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { APP_TITLE, APP_LOGO } from "@/const";
import { Lock, CheckCircle2, XCircle } from "lucide-react";

/**
 * Reset Password Page
 *
 * Handles password reset flow from a Firebase email action link.
 * User must have clicked the reset link from their email.
 */
export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");

  const actionCode = new URLSearchParams(window.location.search).get("oobCode");
  useEffect(() => {
    let active = true;
    async function checkCode() {
      try {
        if (!actionCode) throw new Error("No reset code");
        await verifyPasswordResetCode(getFirebaseAuth(), actionCode);
        if (active) setHasSession(true);
      } catch {
        if (active)
          setError(
            "Invalid or expired reset link. Please request a new password reset."
          );
      }
    }
    void checkCode();
    return () => {
      active = false;
    };
  }, [actionCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (!actionCode) throw new Error("No valid password reset code.");
      await confirmPasswordReset(getFirebaseAuth(), actionCode, password);

      toast.success("Password updated successfully!");

      // Redirect to login after short delay
      setLocation("/login");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to update password. Please try again.");
      setLoading(false);
    }
  };

  if (!hasSession && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription className="text-base mt-2">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Please request a new password reset link.
              </p>
              <Button onClick={() => setLocation("/login")} className="w-full">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Lock className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl">Validating Reset Link</CardTitle>
            <CardDescription className="text-base mt-2">
              Please wait while we verify your reset link...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {APP_LOGO && (
            <img src={APP_LOGO} alt={APP_TITLE} className="h-16 mx-auto mb-4" />
          )}
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => setLocation("/login")}
              className="text-primary hover:underline"
              disabled={loading}
            >
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
