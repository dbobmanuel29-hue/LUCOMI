import { createContext, useContext, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { Button, Field, Input, Modal, Notice } from "./ui";

type AuthMode = "signin" | "signup";
export type AuthUser = { name: string; email: string; phone?: string; photoURL?: string; provider: "email" | "google" };

const AuthContext = createContext<{ open: () => void; user: AuthUser | null; updateUser: (changes: Partial<AuthUser>) => void; signOut: () => void }>({
  open: () => {},
  user: null,
  updateUser: () => {},
  signOut: () => {},
});
export const useAuth = () => useContext(AuthContext);

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M21.6 12.23c0-.7-.06-1.37-.18-2H12v3.79h5.38a4.6 4.6 0 0 1-1.99 3.02v2.5h3.22c1.89-1.74 2.99-4.31 2.99-7.31Z"/>
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.46l-3.22-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.08v2.58A9.99 9.99 0 0 0 12 22Z"/>
      <path fill="#FBBC05" d="M6.41 13.88A6 6 0 0 1 6.1 12c0-.65.11-1.29.31-1.88V7.54H3.08A10 10 0 0 0 2 12c0 1.61.38 3.14 1.08 4.46l3.33-2.58Z"/>
      <path fill="#EA4335" d="M12 5.99c1.47 0 2.79.5 3.83 1.48l2.87-2.87C16.95 2.97 14.7 2 12 2a9.99 9.99 0 0 0-8.92 5.54l3.33 2.58C7.2 7.75 9.4 5.99 12 5.99Z"/>
    </svg>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("lucomi-auth-user");
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const handleAuthenticated = (nextUser: AuthUser) => {
    setUser(nextUser);
    try {
      localStorage.setItem("lucomi-auth-user", JSON.stringify(nextUser));
    } catch {
      /* storage unavailable */
    }
  };

  const updateUser = (changes: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...changes };
      try { localStorage.setItem("lucomi-auth-user", JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  };

  const signOut = () => {
    setUser(null);
    try { localStorage.removeItem("lucomi-auth-user"); } catch { /* storage unavailable */ }
  };

  return (
    <AuthContext.Provider value={{ open: () => setOpen(true), user, updateUser, signOut }}>
      {children}
      <AuthModal open={open} onClose={() => setOpen(false)} onAuthenticated={handleAuthenticated} />
    </AuthContext.Provider>
  );
}

function AuthModal({
  open,
  onClose,
  onAuthenticated,
}: {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const authenticate = (provider: "email" | "google") => {
    onAuthenticated({
      name: provider === "google" ? "Google User" : name.trim() || "LUCOMI User",
      email: provider === "google" ? "Google account" : email.trim(),
      provider,
    });
    setSubmitted(true);
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setSubmitted(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={submitted ? "You're all set" : mode === "signup" ? "Create your LUCOMI account" : "Welcome back"}
    >
      {submitted ? (
        <div className="space-y-5">
          <Notice title="Signed in successfully">
            Your profile is now active. Firebase Authentication will replace this temporary frontend session in the backend phase.
          </Notice>
          <Button full onClick={onClose}>Continue</Button>
        </div>
      ) : (
        <div className="w-full space-y-5">
          <div className="grid grid-cols-2 rounded-lg border border-line bg-plate p-1">
            <button type="button" onClick={() => switchMode("signin")} className={mode === "signin" ? "rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm" : "rounded-md px-3 py-2.5 text-sm font-semibold text-mute"}>
              Sign In
            </button>
            <button type="button" onClick={() => switchMode("signup")} className={mode === "signup" ? "rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm" : "rounded-md px-3 py-2.5 text-sm font-semibold text-mute"}>
              Sign Up
            </button>
          </div>

          <button type="button" onClick={() => authenticate("google")} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-plate">
            <GoogleLogo />
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="micro shrink-0 text-mute">OR</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); authenticate("email"); }} className="space-y-4">
            {mode === "signup" && (
              <Field label="Full Name" required>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                  <Input required value={name} onChange={(e) => setName(e.target.value)} className="pl-10" placeholder="Your name" />
                </div>
              </Field>
            )}

            <Field label="Email Address" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="you@company.com" />
              </div>
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                <Input required minLength={6} type={showPassword ? "text" : "password"} className="pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {mode === "signin" && (
              <button type="button" className="text-left text-xs font-semibold text-royal hover:underline">Forgot password?</button>
            )}

            <Button full type="submit" size="lg">{mode === "signup" ? "Create Account" : "Sign In"}</Button>
          </form>

          <p className="text-center text-xs leading-relaxed text-mute">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => switchMode(mode === "signup" ? "signin" : "signup")} className="font-semibold text-royal hover:underline">
              {mode === "signup" ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      )}
    </Modal>
  );
}
