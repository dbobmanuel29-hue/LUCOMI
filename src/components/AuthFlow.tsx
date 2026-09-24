import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { Button, Field, Input, Modal, Notice } from "./ui";

type AuthMode = "signin" | "signup";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AuthContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </AuthContext.Provider>
  );
}

import { createContext, useContext } from "react";

const AuthContext = createContext<{ open: () => void }>({ open: () => {} });
export const useAuth = () => useContext(AuthContext);

function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setSubmitted(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={submitted ? "You're all set" : mode === "signup" ? "Create your LUCOMI account" : "Welcome back"}>
      {submitted ? (
        <div className="space-y-5">
          <Notice title="Authentication UI ready">
            Your account form is ready for the Firebase Authentication connection in the backend phase.
          </Notice>
          <Button full onClick={onClose}>Continue</Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 rounded-lg border border-line bg-plate p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={mode === "signin" ? "rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm" : "rounded-md px-3 py-2.5 text-sm font-semibold text-mute"}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={mode === "signup" ? "rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm" : "rounded-md px-3 py-2.5 text-sm font-semibold text-mute"}
            >
              Sign Up
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-plate"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full text-[15px] font-bold">G</span>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="micro text-mute">OR</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            {mode === "signup" && (
              <Field label="Full Name" required>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                  <Input required className="pl-10" placeholder="Your name" />
                </div>
              </Field>
            )}

            <Field label="Email Address" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                <Input required type="email" className="pl-10" placeholder="you@company.com" />
              </div>
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                <Input required minLength={6} type={showPassword ? "text" : "password"} className="pl-10 pr-10" placeholder="••••••••" />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {mode === "signin" && (
              <button type="button" className="text-left text-xs font-semibold text-royal hover:underline">
                Forgot password?
              </button>
            )}

            <Button full type="submit" size="lg">
              {mode === "signup" ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-xs leading-relaxed text-mute">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}
              className="font-semibold text-royal hover:underline"
            >
              {mode === "signup" ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      )}
    </Modal>
  );
}
