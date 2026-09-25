import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth, signOut as secondarySignOut } from "firebase/auth";
import { getApps, initializeApp } from "firebase/app";
import { Clock3, Mail, Search, ShieldCheck, Trash2, UserPlus, UsersRound, Wifi } from "lucide-react";
import { AdminPageHead } from "./AdminShell";
import { Button, Field, Input, Micro, Modal, Notice, Select } from "../components/ui";
import { auth, db } from "../lib/firebase";
import { firebaseConfig } from "../lib/firebase";
import { cn, formatDate } from "../lib/helpers";

type ManagedUser = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  provider: string;
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
  lastSeenAt?: Timestamp;
  isAdmin: boolean;
};

const ONLINE_WINDOW = 2 * 60 * 1000;

function asTimestamp(value: unknown) {
  return value && typeof value === "object" && "toDate" in value
    ? value as Timestamp
    : undefined;
}

function isOnline(user: ManagedUser) {
  return !!user.lastSeenAt && Date.now() - user.lastSeenAt.toDate().getTime() < ONLINE_WINDOW;
}

const secondaryApp = getApps().find((app) => app.name === "LUCOMI_ADMIN_USER_CREATOR")
  ?? initializeApp(firebaseConfig, "LUCOMI_ADMIN_USER_CREATOR");
const secondaryAuth = getAuth(secondaryApp);

export function AdminUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline" | "never">("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const [userSnap, adminSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "admins")),
      ]);
      const adminIds = new Set(adminSnap.docs.map((item) => item.id));
      const rows = userSnap.docs.map((item) => {
        const d = item.data();
        return {
          uid: item.id,
          name: d.name || "Unnamed user",
          email: d.email || "—",
          phone: d.phone || "",
          provider: d.provider || "email",
          createdAt: asTimestamp(d.createdAt),
          lastLoginAt: asTimestamp(d.lastLoginAt),
          lastSeenAt: asTimestamp(d.lastSeenAt),
          isAdmin: adminIds.has(item.id),
        };
      });
      rows.sort((a, b) => (b.lastLoginAt?.toMillis() ?? b.createdAt?.toMillis() ?? 0) - (a.lastLoginAt?.toMillis() ?? a.createdAt?.toMillis() ?? 0));
      setUsers(rows);
    } catch (e) {
      setError("Users could not be loaded. Check the Firestore rules and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.phone.toLowerCase().includes(q);
      const online = isOnline(user);
      const matchesFilter =
        filter === "all" ||
        (filter === "online" && online) ||
        (filter === "offline" && !online && !!user.lastLoginAt) ||
        (filter === "never" && !user.lastLoginAt);
      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  const onlineCount = users.filter(isOnline).length;
  const neverCount = users.filter((u) => !u.lastLoginAt).length;

  const createUser = async () => {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) return;
    setSaving(true);
    setError("");
    try {
      const credential = await createUserWithEmailAndPassword(secondaryAuth, form.email.trim(), form.password);
      const created = credential.user;
      const now = Timestamp.now();
      const retentionUntil = Timestamp.fromMillis(now.toMillis() + 365 * 24 * 60 * 60 * 1000);

      await setDoc(doc(db, "users", created.uid), {
        uid: created.uid,
        name: form.name.trim(),
        email: created.email || form.email.trim(),
        phone: form.phone.trim(),
        photoURL: "",
        provider: "email",
        createdAt: now,
        retentionUntil,
        lastLoginAt: null,
        lastSeenAt: null,
        updatedAt: serverTimestamp(),
      });

      await secondarySignOut(secondaryAuth);
      setForm({ name: "", email: "", phone: "", password: "" });
      setOpenCreate(false);
      setNotice("User account created successfully.");
      await loadUsers();
    } catch (e) {
      setError((e as { code?: string })?.code === "auth/email-already-in-use"
        ? "That email already has a Firebase account."
        : "The user could not be created. Check the email and password and try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProfile = async (user: ManagedUser) => {
    if (user.isAdmin) {
      setError("Admin accounts cannot be deleted from the customer user manager.");
      return;
    }
    if (!window.confirm(`Permanently delete ${user.name}'s Firebase Authentication account, profile and stored customer history? This cannot be undone.`)) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Your admin session has expired. Please sign in again.");
        return;
      }

      const idToken = await currentUser.getIdToken(true);
      const response = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ uid: user.uid }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "The customer account could not be deleted.");
      }

      setNotice(`Deleted ${user.name}'s Firebase Authentication account and ${result.deletedRecords ?? "associated"} stored records.`);
      await loadUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : "The customer account could not be deleted.");
    }
  };

  return (
    <>
      <AdminPageHead
        title="Users"
        description="Monitor LUCOMI customer accounts, recent activity and account history. Online means the account reported activity within the last two minutes."
        action={
          <Button onClick={() => setOpenCreate(true)}>
            <UserPlus className="h-4 w-4" /> Add User
          </Button>
        }
      />

      {notice && <Notice title="Done">{notice}</Notice>}
      {error && <div className="mt-4"><Notice tone="warn" title="Users">{error}</Notice></div>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Users", users.length, "Registered profiles", UsersRound],
          ["Online Now", onlineCount, "Active in the last 2 minutes", Wifi],
          ["Offline", Math.max(0, users.length - onlineCount - neverCount), "Have logged in before", Clock3],
          ["Never Logged In", neverCount, "Created but no sign-in recorded", ShieldCheck],
        ].map(([label, value, hint, Icon]) => (
          <div key={String(label)} className="group relative overflow-hidden rounded-2xl border border-line/70 bg-white p-5 plate-shadow transition-transform hover:-translate-y-0.5">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-royal/5" />
            <Icon className="h-5 w-5 text-royal" />
            <Micro className="mt-5 text-mute">{String(label)}</Micro>
            <div className="mt-2 display text-4xl">{String(value)}</div>
            <p className="mt-1 text-xs text-mute">{String(hint)}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-line/70 bg-white plate-shadow">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Micro className="text-royal">Customer directory</Micro>
            <h2 className="display mt-1 text-2xl">All accounts</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="pl-9 sm:w-64" />
            </div>
            <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="all">All users</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="never">Never logged in</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-mute">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <UsersRound className="mx-auto h-8 w-8 text-mute" />
            <p className="mt-3 font-semibold">No users match this view.</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {filtered.map((user) => {
              const online = isOnline(user);
              return (
                <div key={user.uid} className="grid gap-4 p-5 md:grid-cols-[1.6fr_1.5fr_1fr_auto] md:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-sm font-semibold text-white">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-ink">{user.name}</p>
                        {user.isAdmin && <span className="micro rounded-full bg-ink px-2 py-1 text-white">Admin</span>}
                      </div>
                      <p className="truncate text-xs text-mute">{user.uid}</p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <a href={`mailto:${user.email}`} className="flex items-center gap-2 truncate text-sm hover:text-royal">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-mute" /> {user.email}
                    </a>
                    <p className="mt-1 text-xs text-mute">{user.phone || "No phone number"}</p>
                  </div>

                  <div>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                      online ? "bg-emerald-50 text-emerald-700" : "bg-plate text-mute"
                    )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", online ? "bg-emerald-500" : "bg-mute/40")} />
                      {online ? "Online" : user.lastLoginAt ? "Offline" : "Never logged in"}
                    </span>
                    <p className="mt-1 text-xs text-mute">
                      {user.lastLoginAt ? `Last login ${formatDate(user.lastLoginAt.toDate().toISOString())}` : "No login recorded"}
                    </p>
                  </div>

                  <div className="flex items-center justify-start gap-2 md:justify-end">
                    <span className="micro rounded-full border border-line px-2.5 py-1 text-mute">{user.provider}</span>
                    {!user.isAdmin && (
                      <button onClick={() => void deleteProfile(user)} className="rounded-full border border-line p-2 text-mute transition-colors hover:border-red-200 hover:text-red-600" aria-label={`Delete ${user.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-5 rounded-xl border border-line/70 bg-plate p-4 text-xs leading-relaxed text-mute">
        <strong className="text-ink">Account management note:</strong> This dashboard manages the Firestore customer profile and activity record directly. Full deletion of a Firebase Authentication account requires the Firebase Admin SDK on a trusted server; the client SDK intentionally cannot delete another user's account. 
      </div>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Add customer account">
        <div className="space-y-4">
          <Notice tone="info" title="Email/password account">
            This creates a real Firebase Authentication account and a matching LUCOMI customer profile. Give the customer their temporary password securely.
          </Notice>
          <Field label="Full Name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email Address" required>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone Number">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Temporary Password" hint="Minimum 6 characters" required>
            <Input type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <div className="flex gap-3 pt-2">
            <Button size="lg" onClick={() => void createUser()} disabled={saving || !form.name.trim() || !form.email.trim() || form.password.length < 6}>
              {saving ? "Creating…" : "Create User"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => setOpenCreate(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
