import { createContext, useContext, useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { Button, Field, Input, Modal, Notice } from "./ui";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import {
  GoogleAuthProvider,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";

type AuthMode = "signin" | "signup";

export type AuthUser = {
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  provider: "email" | "google";
  uid: string;
};

type AuthContextValue = {
  open: () => void;
  user: AuthUser | null;
  isAdmin: boolean;
  authReady: boolean;
  updateUser: (changes: Partial<AuthUser>) => Promise<void>;
  signOut: () => Promise<void>;
  openSignIn: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  open: () => {},
  user: null,
  isAdmin: false,
  authReady: false,
  updateUser: async () => {},
  signOut: async () => {},
  openSignIn: () => {},
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

function mapFirebaseUser(firebaseUser: FirebaseUser): AuthUser {
  const provider = firebaseUser.providerData.some(
    (item) => item.providerId === "google.com"
  ) ? "google" : "email";

  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "LUCOMI User",
    email: firebaseUser.email || "",
    phone: firebaseUser.phoneNumber || "",
    photoURL: firebaseUser.photoURL || "",
    provider,
  };
}

function friendlyAuthError(error: unknown) {
  const code = (error as { code?: string })?.code || "";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account already exists with this email. Try signing in instead.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Your password is too weak. Use at least 6 characters.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Please allow pop-ups and try again.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase yet.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
  };
  return messages[code] || "Authentication could not be completed. Please try again.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const ensureUserProfile = async (firebaseUser: FirebaseUser) => {
    const ref = doc(db, "users", firebaseUser.uid);
    const snapshot = await getDoc(ref);
    const creationDate = firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime)
      : new Date();
    const createdAt = Timestamp.fromDate(creationDate);
    const retentionUntil = Timestamp.fromMillis(creationDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    const adminSnapshot = await getDoc(doc(db, "admins", firebaseUser.uid));
    const isAdmin = adminSnapshot.exists() && adminSnapshot.data()?.role === "admin";

    if (!snapshot.exists()) {
      await setDoc(ref, {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "LUCOMI User",
        email: firebaseUser.email || "",
        phone: firebaseUser.phoneNumber || "",
        photoURL: firebaseUser.photoURL || "",
        provider: firebaseUser.providerData.some((item) => item.providerId === "google.com") ? "google" : "email",
        createdAt,
        retentionUntil: isAdmin ? null : retentionUntil,
        lastLoginAt: firebaseUser.metadata.lastSignInTime
          ? Timestamp.fromDate(new Date(firebaseUser.metadata.lastSignInTime))
          : serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const patch: Record<string, unknown> = {
        lastLoginAt: firebaseUser.metadata.lastSignInTime
          ? Timestamp.fromDate(new Date(firebaseUser.metadata.lastSignInTime))
          : serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (!snapshot.data()?.createdAt) {
        patch.createdAt = createdAt;
        patch.retentionUntil = isAdmin ? null : retentionUntil;
      }

      await setDoc(ref, patch, { merge: true });
    }
  };

  useEffect(() => {
    let heartbeat: number | undefined;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthReady(true);
      setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
      setIsAdmin(false);

      if (firebaseUser) {
        void ensureUserProfile(firebaseUser).catch(() => {
          // Profile persistence errors should not block authentication.
        });

        heartbeat = window.setInterval(() => {
          void setDoc(doc(db, "users", firebaseUser.uid), {
            lastSeenAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true }).catch(() => {});
        }, 60_000);

        void getDoc(doc(db, "admins", firebaseUser.uid))
          .then((snapshot) => {
            setIsAdmin(snapshot.exists() && snapshot.data()?.role === "admin");
          })
          .catch(() => {
            setIsAdmin(false);
          });
      }
    });
    return () => {
      unsubscribe();
      if (heartbeat) window.clearInterval(heartbeat);
    };
  }, []);

  const updateUser = async (changes: Partial<AuthUser>) => {
    if (!auth.currentUser) throw new Error("You must be signed in to update your profile.");

    const current = auth.currentUser;
    const nextName = changes.name?.trim() || current.displayName || current.email?.split("@")[0] || "LUCOMI User";
    const nextPhone = changes.phone?.trim() || "";

    if (changes.name !== undefined && changes.name.trim() && changes.name.trim() !== current.displayName) {
      await updateProfile(current, { displayName: changes.name.trim() });
    }

    // Keep profile data in Firestore. Profile images will move to Cloudinary
    // in the media phase; do not store large device Data URLs in Firestore.
    await setDoc(doc(db, "users", current.uid), {
      uid: current.uid,
      name: nextName,
      email: current.email || "",
      phone: nextPhone,
      photoURL: changes.photoURL && !changes.photoURL.startsWith("data:") ? changes.photoURL : (current.photoURL || ""),
      provider: current.providerData.some((item) => item.providerId === "google.com") ? "google" : "email",
      updatedAt: serverTimestamp(),
    }, { merge: true });

    setUser((existing) => existing ? {
      ...existing,
      ...changes,
      name: nextName,
      phone: nextPhone || undefined,
      photoURL: changes.photoURL && !changes.photoURL.startsWith("data:") ? changes.photoURL : existing.photoURL,
    } : existing);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ open: () => setOpen(true), openSignIn: () => { setOpen(true); }, user, isAdmin, authReady, updateUser, signOut }}>
      {children}
      <AuthModal open={open} onClose={() => setOpen(false)} onAuthenticated={setUser} />
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setSubmitted(false);
    setError("");
    setForgot(false);
    setResetMessage("");
    setResetError("");
  };

  const sendReset = async () => {
    const normalized = resetEmail.trim().toLowerCase();
    if (!normalized) {
      setResetError("Enter your email address first.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const storageKey = `lucomi-password-reset-limit:${normalized}`;
    let record: { date: string; count: number } = { date: today, count: 0 };
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { date?: string; count?: number };
        if (parsed.date === today) record = { date: today, count: Number(parsed.count) || 0 };
      }
    } catch {
      // Continue without local storage.
    }

    if (record.count >= 2) {
      setResetError("You have used both password-reset requests for today. You can request another reset tomorrow.");
      return;
    }

    setResetBusy(true);
    setResetError("");
    setResetMessage("");
    try {
      await import("firebase/auth").then(({ sendPasswordResetEmail }) =>
        sendPasswordResetEmail(auth, normalized)
      );
      record = { date: today, count: record.count + 1 };
      try {
        localStorage.setItem(storageKey, JSON.stringify(record));
      } catch {
        // Storage may be unavailable; Firebase still handled the request.
      }
      setResetMessage("If an account exists for that email, a password-reset link has been sent. Please check your normal inbox and your Spam/Junk folder.");
    } catch (resetErr) {
      const code = (resetErr as { code?: string })?.code || "";
      setResetError(
        code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : "We could not send the reset email right now. Please try again later."
      );
    } finally {
      setResetBusy(false);
    }
  };

  const authenticate = async (provider: "email" | "google") => {
    setBusy(true);
    setError("");

    try {
      let firebaseUser: FirebaseUser;

      if (provider === "google") {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        firebaseUser = result.user;
      } else if (mode === "signup") {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) {
          await updateProfile(result.user, { displayName: name.trim() });
        }
        firebaseUser = result.user;
      } else {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        firebaseUser = result.user;
      }

      onAuthenticated(mapFirebaseUser(firebaseUser));
      setSubmitted(true);
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={submitted ? "You're all set" : mode === "signup" ? "Create your LUCOMI account" : "Welcome back"}
    >
      {forgot ? (
        <div className="space-y-5">
          <div>
            <p className="text-sm leading-relaxed text-mute">
              Enter the email linked to your LUCOMI account. You can request a password reset up to <strong>2 times per day</strong>.
            </p>
          </div>
          <Field label="Email Address" required>
            <Input
              required
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </Field>
          {resetMessage && <Notice title="Check your email">{resetMessage}</Notice>}
          {resetError && <Notice tone="warn" title="Reset request not sent">{resetError}</Notice>}
          <p className="rounded-lg bg-plate p-3 text-xs leading-relaxed text-mute">
            If you do not see the password-reset email in your normal inbox, please check your <strong>Spam or Junk</strong> folder. Email providers sometimes place automated security emails there.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button full onClick={() => { setForgot(false); setResetError(""); setResetMessage(""); }}>
              Back to Sign In
            </Button>
            <Button full disabled={resetBusy || !!resetMessage} onClick={() => void sendReset()}>
              {resetBusy ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </div>
      ) : submitted ? (
        <div className="space-y-5">
          <Notice title="Signed in successfully">
            Your LUCOMI account is now active.
          </Notice>
          <Button full onClick={onClose}>Continue</Button>
        </div>
      ) : (
        <div className="w-full space-y-5">
          <div className="grid grid-cols-2 rounded-lg border border-line bg-plate p-1">
            <button type="button" onClick={() => switchMode("signin")} className={mode === "signin" ? "rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm" : "rounded-md px-3 py-2.5 text-sm font-semibold text-mute"}>Sign In</button>
            <button type="button" onClick={() => switchMode("signup")} className={mode === "signup" ? "rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-sm" : "rounded-md px-3 py-2.5 text-sm font-semibold text-mute"}>Sign Up</button>
          </div>

          <button type="button" onClick={() => void authenticate("google")} disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-plate disabled:cursor-not-allowed disabled:opacity-60">
            <GoogleLogo />
            <span>{busy ? "Please wait..." : "Continue with Google"}</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="micro shrink-0 text-mute">OR</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); void authenticate("email"); }} className="space-y-4">
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
                <Input required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} className="pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {error && <Notice title="Sign-in issue">{error}</Notice>}

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  setForgot(true);
                  setResetEmail(email);
                  setResetError("");
                  setResetMessage("");
                }}
                className="text-left text-xs font-semibold text-royal hover:underline"
              >
                Forgot password?
              </button>
            )}

            <Button full type="submit" size="lg" disabled={busy}>
              {busy ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
            </Button>
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
