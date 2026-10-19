import { useState } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/contexts/AuthContext";
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
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, setLocation] = useLocation();
  const {
    signIn,
    signUp,
    resetPassword,
    resendVerification,
    pendingVerification,
  } = useFirebaseAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [betaCode, setBetaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Validate beta code in real-time
  const validateCodeMutation = trpc.credits.validateBetaCode.useMutation();
  const [codeValidation, setCodeValidation] = useState<{
    valid?: boolean;
    error?: boolean;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Store beta code in localStorage if provided
        if (betaCode.trim()) {
          localStorage.setItem(
            "pendingBetaCode",
            betaCode.trim().toUpperCase()
          );
        }

        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
          // Clear beta code on error
          localStorage.removeItem("pendingBetaCode");
        } else {
          toast.success("Check your email to confirm your account!");
          setIsSignUp(false);
          // Beta code will be activated when user confirms email and logs in
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          // Beta code will be activated after user loads dashboard
          // The Dashboard component will check for pending code

          toast.success("Welcome back!");
          setLocation("/dashboard");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      localStorage.removeItem("pendingBetaCode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {APP_LOGO && (
            <img src={APP_LOGO} alt={APP_TITLE} className="h-16 mx-auto mb-4" />
          )}
          <CardTitle className="text-2xl">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Sign up to start understanding your pet"
              : "Sign in to your InterpWhat account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingVerification && (
            <div className="mb-4 space-y-2" role="status">
              <p>Verify your email before opening your account.</p>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  const { error } = await resendVerification();
                  setLoading(false);
                  if (error) toast.error(error.message);
                  else
                    toast.success("Verification email sent. Check your inbox.");
                }}
              >
                Resend verification email
              </Button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary hover:underline"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required={!showForgotPassword}
                disabled={loading || showForgotPassword}
                minLength={6}
              />
            </div>
            {showForgotPassword && !resetEmailSent && (
              <div className="space-y-2 p-4 bg-muted rounded-md">
                <Label htmlFor="resetEmail">Email Address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        toast.error("Please enter your email address");
                        return;
                      }
                      setLoading(true);
                      const { error } = await resetPassword(email);
                      if (error) {
                        toast.error(error.message);
                        setLoading(false);
                      } else {
                        setResetEmailSent(true);
                        toast.success(
                          "Password reset email sent! Check your inbox."
                        );
                        setLoading(false);
                      }
                    }}
                    disabled={loading || !email}
                    className="flex-1"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {resetEmailSent && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ Password reset email sent! Check your inbox and click the
                  link to reset your password.
                </p>
              </div>
            )}
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="betaCode">
                  Beta Code{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="betaCode"
                  type="text"
                  placeholder="BETA-XXXXX-XXXX"
                  value={betaCode}
                  onChange={e => {
                    const value = e.target.value.toUpperCase().trim();
                    setBetaCode(value);
                    setCodeValidation({});
                    // Validate in real-time if code looks valid
                    if (value.length > 5 && value.startsWith("BETA-")) {
                      validateCodeMutation.mutate(
                        { code: value },
                        {
                          onSuccess: data => {
                            setCodeValidation({ valid: data.valid });
                          },
                          onError: () => {
                            setCodeValidation({ error: true });
                          },
                        }
                      );
                    }
                  }}
                  disabled={loading}
                  className={
                    codeValidation.error
                      ? "border-red-500"
                      : codeValidation.valid
                        ? "border-green-500"
                        : ""
                  }
                />
                {codeValidation.error && (
                  <p className="text-xs text-red-500">Invalid beta code</p>
                )}
                {codeValidation.valid && (
                  <p className="text-xs text-green-500">✓ Valid beta code</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Have a beta invite code? Enter it here to unlock unlimited
                  analyses.
                </p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
