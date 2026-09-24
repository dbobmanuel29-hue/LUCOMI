import { useState } from "react";
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
} from "lucide-react";
import { api, useAsync } from "../lib/api";
import { cn, formatDate } from "../lib/helpers";
import { ThemeToggle } from "../components/Chrome";
import { Logo } from "../components/Logo";
import { Button, Field, Input, Micro, Notice, Skeleton } from "../components/ui";

export const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
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
  const navigate = useNavigate();

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
          Frontend preview — Firebase Authentication connects here later. Any details will open the dashboard.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStatus("saving");
            setTimeout(() => navigate("/admin"), 500);
          }}
        >
          <Field label="Email Address" required>
            <Input required type="email" defaultValue="admin@lucomienterprise.com" autoComplete="username" />
          </Field>
          <Field label="Password" required>
            <Input required type="password" defaultValue="••••••••" autoComplete="current-password" />
          </Field>
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
export function AdminLayout() {
  const [openMenu, setOpenMenu] = useState(false);

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
              "flex items-center gap-3 rounded-lg px-4 py-3 text-[14px] transition-colors",
              isActive ? "bg-white/12 text-white" : "text-white/60 hover:bg-white/6 hover:text-white",
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
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden bg-ink px-5 py-7 lg:block">
        <div className="flex h-full flex-col">
          <Logo />
          <div className="mt-9 flex-1">{nav}</div>
          <Link to="/" className="micro flex items-center gap-2 text-white/45 hover:text-white">
            <LogOut className="h-3.5 w-3.5" /> Back to website
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex h-[70px] items-center justify-between gap-4 border-b border-line bg-paper/95 px-5 backdrop-blur-md lg:px-10">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Micro className="hidden text-ink lg:block">LUCOMI Enterprise — Content Manager</Micro>
          <div className="flex items-center gap-3">
            <Link to="/" className="micro hidden text-mute hover:text-ink sm:block">
              View website
            </Link>
            <ThemeToggle />
            <button
              onClick={() => setOpenMenu(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>

      {openMenu && (
        <div className="fixed inset-0 z-50 bg-ink/95 px-5 py-7 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              onClick={() => setOpenMenu(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 text-white"
              aria-label="Close admin menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-8">{nav}</div>
          <Link to="/" className="micro mt-8 inline-flex items-center gap-2 text-white/50">
            <LogOut className="h-3.5 w-3.5" /> Back to website
          </Link>
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
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-[clamp(2.2rem,4vw,3.2rem)]">{title}</h1>
        <p className="mt-2 max-w-2xl text-[14.5px] text-mute">{description}</p>
      </div>
      {action}
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

  const all = products.data ?? [];
  const allEnq = enquiries.data ?? [];
  const loading = products.loading || enquiries.loading;

  return (
    <>
      <AdminPageHead
        title="Overview"
        description="Catalogue and enquiry activity. Figures below are mock values used for interface development and will be replaced by live Firestore data."
        action={<Button href="/admin/products">Manage Products</Button>}
      />

      <Notice tone="info" title="Frontend preview">
        Mock data only — no analytics are being measured and no backend is connected yet.
      </Notice>

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
