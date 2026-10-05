import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Auth Callback Page
 * 
 * Handles Supabase email confirmation and password reset callbacks.
 * Supabase automatically processes tokens from URL hash fragments.
 */
export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  
  const utils = trpc.useUtils();
  const syncUser = trpc.auth.syncSupabaseUser.useMutation();
  const redeemCode = trpc.credits.redeemBetaCode.useMutation({
    onSuccess: () => {
      utils.credits.getBalance.invalidate();
      toast.success('🎉 Beta code activated! You now have unlimited credits!');
    },
    onError: (error) => {
      console.error('Failed to activate beta code:', error);
      // Don't show error to user - they can still use the app
    },
  });

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Supabase automatically handles tokens in URL hash when detectSessionInUrl is true
        // Wait for session to be established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          // No session - might be password reset or invalid token
          // Check if this is a password reset flow
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const type = hashParams.get('type');
          
          if (type === 'recovery') {
            // Password reset - redirect to reset password page
            setLocation('/auth/reset-password');
            return;
          }
          
          // Invalid or expired token
          setStatus('error');
          setMessage('Invalid or expired confirmation link. Please try signing up again.');
          setTimeout(() => {
            setLocation('/login');
          }, 3000);
          return;
        }

        // A confirmed Supabase session must also establish a usable app account.
        await syncUser.mutateAsync();
        const pendingCode = localStorage.getItem('pendingBetaCode');
        if (pendingCode) {
          try {
            await redeemCode.mutateAsync({ code: pendingCode });
            localStorage.removeItem('pendingBetaCode');
          } catch {
            // Preserve the code so the adopter can retry from the dashboard.
          }
        }
        setStatus('success');
        setMessage('Email confirmed! Redirecting to dashboard...');
        setTimeout(() => setLocation('/dashboard'), 1500);
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication. Please try again.');
        setTimeout(() => {
          setLocation('/login');
        }, 3000);
      }
    }

    handleAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Sparkles className="w-12 h-12 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirming Your Account'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Please wait while we confirm your email address...
              </p>
            </div>
          )}
          {status === 'error' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
              <button
                onClick={() => setLocation('/login')}
                className="text-sm text-primary hover:underline"
              >
                Go to Login
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

