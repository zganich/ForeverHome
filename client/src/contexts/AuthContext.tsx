import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { authConfigured, getFirebaseAuth } from "@/lib/firebase";
import { SESSION_INVALID } from "@/lib/session";

type Result = { error: Error | null };
type State = { user: User | null; emailVerified: boolean; loading: boolean };
interface AuthContextValue extends State {
  pendingVerification: boolean;
  signUp(email: string, password: string): Promise<Result>;
  signIn(email: string, password: string): Promise<Result>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<Result>;
  resendVerification(): Promise<Result>;
  refreshUser(): Promise<void>;
}
const Context = createContext<AuthContextValue | undefined>(undefined);
const asResult = async (action: () => Promise<unknown>): Promise<Result> => {
  try {
    await action();
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error
          : new Error("Authentication failed. Please try again."),
    };
  }
};
const actionSettings = () => ({
  url: `${window.location.origin}/auth/callback`,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<State>({
    user: null,
    emailVerified: false,
    loading: true,
  });
  const priorIdentity = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const invalid = () => {
      if (authConfigured)
        void firebaseSignOut(getFirebaseAuth()).catch(() => {});
      setState({ user: null, emailVerified: false, loading: false });
      priorIdentity.current = null;
      queryClient.clear();
    };
    window.addEventListener(SESSION_INVALID, invalid);
    return () => window.removeEventListener(SESSION_INVALID, invalid);
  }, [queryClient]);
  useEffect(() => {
    if (!authConfigured) {
      setState({ user: null, emailVerified: false, loading: false });
      return;
    }
    return onIdTokenChanged(
      getFirebaseAuth(),
      user => {
        const identity = user?.uid ?? null;
        if (
          priorIdentity.current !== undefined &&
          identity !== priorIdentity.current
        ) {
          queryClient.clear();
        }
        priorIdentity.current = identity;
        // Snapshot emailVerified as Firebase mutates its User object in place.
        setState({
          user,
          emailVerified: user?.emailVerified ?? false,
          loading: false,
        });
      },
      () => {
        queryClient.clear();
        priorIdentity.current = null;
        setState({ user: null, emailVerified: false, loading: false });
      }
    );
  }, [queryClient]);

  const value: AuthContextValue = {
    ...state,
    user: state.emailVerified ? state.user : null,
    pendingVerification: Boolean(state.user && !state.emailVerified),
    signUp: (email, password) =>
      asResult(async () => {
        const { user } = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password
        );
        await sendEmailVerification(user, actionSettings());
      }),
    signIn: (email, password) =>
      asResult(async () => {
        const { user } = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password
        );
        if (!user.emailVerified)
          throw new Error(
            "Verify your email before opening your account. You can resend the verification email below."
          );
      }),
    signOut: async () => {
      if (authConfigured) await firebaseSignOut(getFirebaseAuth());
      setState({ user: null, emailVerified: false, loading: false });
      queryClient.clear();
    },
    resetPassword: email =>
      asResult(() =>
        sendPasswordResetEmail(getFirebaseAuth(), email, actionSettings())
      ),
    resendVerification: () =>
      asResult(async () => {
        const user = getFirebaseAuth().currentUser;
        if (!user)
          throw new Error("Sign in first to resend the verification email.");
        await sendEmailVerification(user, actionSettings());
      }),
    refreshUser: async () => {
      const user = getFirebaseAuth().currentUser;
      if (user) {
        await reload(user);
        await user.getIdToken(true);
      }
      setState({
        user,
        emailVerified: user?.emailVerified ?? false,
        loading: false,
      });
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useFirebaseAuth() {
  const context = useContext(Context);
  if (!context)
    throw new Error("useFirebaseAuth must be used within AuthProvider");
  return context;
}
