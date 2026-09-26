import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Package,
  Settings as SettingsIcon,
  Tags,
  Inbox,
  Menu,
  Users,
  X,
  ArrowLeft,
  RefreshCw,
  Bell,
  Check,
} from "lucide-react";
import { api, useAsync } from "../lib/api";
import type { AdminNotification } from "../lib/types";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useAuth } from "../components/AuthFlow";
import { cn, formatDate } from "../lib/helpers";
import { ThemeToggle } from "../components/Chrome";
import { Logo, Mark } from "../components/Logo";
import { Button, Field, Input, Micro, Notice, Skeleton } from "../components/ui";

export const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/testimonials", label: "Reviews", icon: MessageSquareQuote },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/settings", label: "Business Settings", icon: SettingsIcon },
];

/* -------------------------------- login ------------------------------- */
export function AdminLogin() {
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const signIn = async () => {
    setStatus("saving");
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/admin");
    } catch {
      setError("Admin sign-in failed. Use an authorized LUCOMI admin account.");
    } finally {
      setStatus("idle");
    }
  };

  const googleSignIn = async () => {
    setGoogleBusy(true);
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate("/admin");
    } catch {
      setError("Google sign-in could not be completed.");
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl bg-paper p-8 plate-shadow-lg sm:p-10"
      >
        <Logo />
        <h1 className="display mt-8 text-5xl">Admin Sign In</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-mute">
          Only users listed in the Firebase <strong>admins</strong> collection can access the dashboard.
        </p>

        {user && (
          <div className="mt-6 rounded-xl border border-line bg-plate p-4 text-sm">
            <p className="font-semibold">Signed in as {user.name}</p>
            <p className="mt-1 text-mute">{user.email}</p>
            <Button full className="mt-4" onClick={() => navigate("/admin")}>
              Continue as this account
            </Button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <Button full variant="outline" onClick={() => void googleSignIn()} disabled={googleBusy}>
            {googleBusy ? "Connecting..." : "Continue with Google"}
          </Button>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="micro text-mute">OR EMAIL</span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void signIn();
          }}
        >
          <Field label="Email Address" required>
            <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </Field>
          <Field label="Password" required>
            <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
          {error && <Notice tone="warn" title="Access denied">{error}</Notice>}
          <Button type="submit" full size="lg" disabled={status === "saving"}>
            {status === "saving" ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        <p className="mt-6 text-center text-[13px] text-mute">
          <Link to="/" className="text-royal hover:text-ink">
            ← Back to website
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

/* ------------------------------- layout ------------------------------- */
export function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => api.notifications.subscribe(setNotifications), []);

  const unread = notifications.filter((item) => !item.read);

  const openNotification = async (item: AdminNotification) => {
    try {
      if (!item.read) await api.notifications.markRead(item.id);
    } finally {
      setOpen(false);
      navigate(item.link);
    }
  };

  const markAllRead = async () => {
    if (unread.length === 0) return;
    await api.notifications.markAllRead(unread.map((item) => item.id));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border bg-white px-2.5 text-ink transition-all hover:border-ink/40 sm:px-3",
          unread.length > 0 ? "border-royal/40" : "border-line",
        )}
        aria-label={unread.length ? `${unread.length} unread notifications` : "Notifications"}
        aria-expanded={open}
      >
        <Bell className={cn("h-4 w-4 shrink-0", unread.length > 0 && "text-royal")} />
        <span className="hidden text-[12px] font-semibold sm:inline">Notifications</span>
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-royal px-1 text-[10px] font-bold text-white ring-2 ring-paper">
            {unread.length > 99 ? "99+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />

          <div className="fixed inset-x-3 top-[68px] z-50 overflow-hidden rounded-xl border border-line bg-white plate-shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[min(390px,calc(100vw-2rem))]">
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                <p className="mt-0.5 text-[11.5px] text-mute">
                  {unread.length ? `${unread.length} unread` : "You're all caught up"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {unread.length > 0 && (
                  <button
                    type="button"
                    className="micro text-royal hover:text-ink"
                    onClick={() => void markAllRead()}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-mute transition-colors hover:border-ink hover:text-ink"
                  aria-label="Close notifications"
                  title="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[min(65vh,460px)] overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Bell className="mx-auto h-6 w-6 text-mute" />
                  <p className="mt-3 text-sm font-semibold">No notifications yet</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-mute">
                    New enquiries and customer reviews will appear here.
                  </p>
                </div>
              ) : (
                notifications.slice(0, 30).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void openNotification(item)}
                    className={cn(
                      "flex w-full gap-3 border-b border-line px-4 py-3 text-left transition-colors hover:bg-plate active:bg-plate sm:px-5",
                      !item.read && "bg-royal/[0.045]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        item.type === "review"
                          ? "bg-royal/10 text-royal"
                          : "bg-ink/5 text-ink",
                      )}
                    >
                      {item.read ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-[13px]",
                          !item.read
                            ? "font-semibold text-ink"
                            : "font-medium text-charcoal",
                        )}
                      >
                        {item.title}
                      </span>
                      <span className="mt-1 block break-words text-[12px] leading-relaxed text-mute">
                        {item.message}
                      </span>
                      <span className="mt-1.5 block text-[10.5px] uppercase tracking-[0.08em] text-mute">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </span>

                    {!item.read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-royal" aria-hidden="true" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function AdminLayout() {
  const [openMenu, setOpenMenu] = useState(false);
  const [access, setAccess] = useState<"checking" | "allowed" | "denied">("checking");
  const navigate = useNavigate();
  const { user, authReady } = useAuth();

  useEffect(() => {
    if (!openMenu) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overscrollBehavior: html.style.overscrollBehavior,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      html.style.overscrollBehavior = previous.overscrollBehavior;
      window.scrollTo(0, scrollY);
    };
  }, [openMenu]);

  useEffect(() => {
    let cancelled = false;
    if (!authReady) return;
    if (!user) {
      setAccess("denied");
      navigate("/admin/login", { replace: true });
      return;
    }

    void getDoc(doc(db, "admins", user.uid)).then((snapshot) => {
      if (cancelled) return;
      const allowed = snapshot.exists() && snapshot.data()?.role === "admin";
      setAccess(allowed ? "allowed" : "denied");
      if (!allowed) navigate("/admin/login", { replace: true });
    }).catch(() => {
      if (cancelled) return;
      setAccess("denied");
      navigate("/admin/login", { replace: true });
    });

    return () => {
      cancelled = true;
    };
  }, [user, authReady, navigate]);

  if (access !== "allowed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-5">
        <div className="text-center">
          <Logo />
          <p className="mt-6 text-sm text-mute">Checking admin access…</p>
        </div>
      </main>
    );
  }

  const nav = (
    <nav className="space-y-1">
      {ADMIN_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setOpenMenu(false)}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] transition-all duration-200",
              isActive ? "bg-white/[0.11] text-white shadow-[inset_3px_0_0_#3fa9f5]" : "text-white/60 hover:bg-white/[0.06] hover:text-white",
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(21,96,232,0.08),transparent_32%),#f7f8fa] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden bg-[#07152d] px-6 py-7 lg:block">
        <div className="flex h-full flex-col">
          <Logo />
          <div className="mt-9 flex-1">{nav}</div>
          <div className="space-y-3">
            <Link to="/" className="micro flex items-center gap-2 text-white/55 transition-colors hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to website
            </Link>
            <button onClick={() => { void auth.signOut(); navigate("/"); }} className="micro flex items-center gap-2 text-white/45 transition-colors hover:text-white">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex min-h-[64px] items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:h-[70px] lg:px-10 lg:py-0">
          <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
            <Mark className="h-11 w-auto shrink-0" />
            <div className="leading-none">
              <span className="block truncate font-sans text-[16px] font-bold tracking-[0.02em] text-ink sm:text-[17px]">LUCOMI</span>
              <span className="mt-1 block font-sans text-[7px] font-semibold tracking-[0.28em] text-royal">ENTERPRISE</span>
            </div>
          </div>
          <Micro className="hidden text-ink lg:block">LUCOMI Enterprise — Content Manager</Micro>
          <div className="flex items-center gap-3">
            <Link to="/" className="micro hidden text-mute hover:text-ink sm:block">View website</Link>
            <AdminNotifications />
            <ThemeToggle />
            <button onClick={() => setOpenMenu(true)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white lg:hidden" aria-label="Open admin menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>

      {openMenu && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden overscroll-none bg-ink/95 px-4 py-5 sm:px-6 sm:py-7 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white">
              <Mark className="h-11 w-auto shrink-0 brightness-0 invert" />
              <div className="leading-none">
                <span className="block font-sans text-[17px] font-bold tracking-[0.02em] text-white">LUCOMI</span>
                <span className="mt-1 block font-sans text-[7px] font-semibold tracking-[0.28em] text-white/75">ENTERPRISE</span>
              </div>
            </div>
            <button onClick={() => setOpenMenu(false)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 text-white" aria-label="Close admin menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-8 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1" style={{ WebkitOverflowScrolling: "touch" }}>{nav}</div>
          <div className="mt-6 shrink-0 space-y-4 border-t border-white/10 pt-5">
            <Link to="/" onClick={() => setOpenMenu(false)} className="micro inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to website
            </Link>
            <button onClick={() => { void auth.signOut(); navigate("/"); }} className="micro flex items-center gap-2 text-white/50 transition-colors hover:text-white">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- shared parts ---------------------------- */
export function AdminPageHead({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const refresh = () => window.location.reload();

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-[clamp(2.2rem,4vw,3.2rem)]">{title}</h1>
        <p className="mt-2 max-w-2xl text-[14.5px] text-mute">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={refresh} aria-label={`Refresh ${title}`}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
        {action}
      </div>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-xl border border-line/70 bg-white p-6 plate-shadow">
      <Micro className="text-mute">{label}</Micro>
      <p className="display mt-3 text-[44px] leading-none text-ink tnum">{value}</p>
      <p className="mt-2 text-[12.5px] text-mute">{hint}</p>
    </div>
  );
}

export function RowShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-3 rounded-xl border border-line/70 bg-white p-4 sm:p-5 md:grid-cols-12 md:items-center", className)}>
      {children}
    </div>
  );
}

export function Cell({
  label,
  children,
  span = 3,
  className,
}: {
  label: string;
  children: React.ReactNode;
  span?: number;
  className?: string;
}) {
  const spans: Record<number, string> = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
  };
  return (
    <div className={cn(spans[span], className)}>
      <Micro className="md:hidden">{label}</Micro>
      <div className="mt-1 text-[14px] text-charcoal md:mt-0">{children}</div>
    </div>
  );
}

export function useToggle(label: string) {
  const [notice, setNotice] = useState<string | null>(null);
  return { notice, setNotice, label };
}

export function SavingNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <Notice title="Saved">{children}</Notice>
    </div>
  );
}

/* ------------------------------ dashboard ------------------------------ */
export function Dashboard() {
  const products = useAsync(() => api.products.list());
  const enquiries = useAsync(() => api.enquiries.list());
  const reviews = useAsync(() => api.testimonials.list());

  const all = products.data ?? [];
  const allEnq = enquiries.data ?? [];
  const allReviews = reviews.data ?? [];
  const pendingReviews = allReviews.filter((review) => !review.published && !review.placeholder);
  const loading = products.loading || enquiries.loading || reviews.loading;

  return (
    <>
      <AdminPageHead
        title="Overview"
        description="Catalogue, enquiry and customer feedback activity across the LUCOMI website."
        action={<Button href="/admin/products">Manage Products</Button>}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : (
          <>
            <Stat label="Total Products" value={all.length} hint="All catalogue entries" />
            <Stat label="Published" value={all.filter((p) => p.published).length} hint="Visible on the website" />
            <Stat label="Featured" value={all.filter((p) => p.featured).length} hint="On the homepage" />
            <Stat label="Total Enquiries" value={allEnq.length} hint="All sources" />
            <Stat label="New Enquiries" value={allEnq.filter((e) => e.status === "New").length} hint="Awaiting contact" />
            <Stat label="Pending Reviews" value={pendingReviews.length} hint="Awaiting approval" />
            {pendingReviews.length > 0 && (
        <section className="mt-10 rounded-xl border border-royal/20 bg-white p-6 plate-shadow sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Micro className="text-royal">Action required</Micro>
              <h2 className="display mt-2 text-3xl">{pendingReviews.length} review{pendingReviews.length === 1 ? "" : "s"} awaiting approval</h2>
              <p className="mt-2 text-[14px] text-mute">Review customer feedback before it appears publicly on the website.</p>
            </div>
            <Button href="/admin/testimonials">Review feedback</Button>
          </div>
        </section>
      )}

    </>
        )}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display text-3xl">Recent Products</h2>
            <Link to="/admin/products" className="micro text-royal hover:text-ink">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            {[...all]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 5)
              .map((p) => (
                <RowShell key={p.id}>
                  <Cell label="Product" span={5}>
                    <span className="font-semibold">{p.name}</span>
                  </Cell>
                  <Cell label="Category" span={4}>
                    {p.category.replace(/-/g, " ")}
                  </Cell>
                  <Cell label="Status" span={3}>
                    <span className={cn("micro", p.published ? "text-royal" : "text-mute")}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </Cell>
                </RowShell>
              ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display text-3xl">Recent Enquiries</h2>
            <Link to="/admin/enquiries" className="micro text-royal hover:text-ink">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            {allEnq.slice(0, 5).map((e) => (
              <RowShell key={e.id}>
                <Cell label="Customer" span={5}>
                  <span className="font-semibold">{e.fullName}</span>
                  <span className="block text-[12.5px] text-mute">{e.source}</span>
                </Cell>
                <Cell label="Requirement" span={4}>
                  {e.furnitureType}
                </Cell>
                <Cell label="Date" span={3}>
                  <span className="tnum text-[13px]">{formatDate(e.createdAt)}</span>
                  <span className="micro block text-royal">{e.status}</span>
                </Cell>
              </RowShell>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export { Field, Input, Skeleton };
