import { useEffect, useRef, useState } from "react";
import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { WhatsAppIcon } from "../components/BrandIcons";
import { api, useAsync } from "../lib/api";
import { cn, displayPhone, formatDate, telHref, waLink } from "../lib/helpers";
import type { Enquiry, EnquiryStatus, Project, TeamMember, Testimonial } from "../lib/types";
import { businessSettings } from "../lib/mock";
import { ImageUpload } from "../components/ImageUpload";
import { AdminPageHead, Cell, RowShell } from "./AdminShell";
import { Button, Field, Input, Micro, Modal, Notice, Select, Textarea } from "../components/ui";

const STATUSES: EnquiryStatus[] = ["New", "Contacted", "In Progress", "Completed", "Archived"];
const PROJECT_CATEGORIES = [
  "Corporate Offices",
  "Executive Offices",
  "Reception Areas",
  "Conference Rooms",
  "Workstations",
  "Government / Institutional Offices",
];

const hasPhone = (v: string) => /\d{6}/.test(v);
const hasMail = (v: string) => /@/.test(v);

/* ------------------------------- projects ------------------------------ */
export function AdminProjects() {
  const { data, loading, reload } = useAsync(() => api.projects.list());
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  const blank: Project = {
    id: `pr${Date.now()}`,
    slug: "",
    name: "",
    category: PROJECT_CATEGORIES[0],
    description: "",
    location: "",
    images: [],
    published: true,
    placeholder: false,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  return (
    <>
      <AdminPageHead
        title="Projects"
        description="Portfolio entries shown on the Projects page. Manage LUCOMI project portfolio entries and publishing."
        action={
          <Button onClick={() => setEditing(blank)}>
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        }
      />
      <div className="space-y-3">
        {loading && Array.from({ length: 3 }).map((_, i) => <RowShell key={i}><Cell label="Loading">Loading…</Cell></RowShell>)}
        {(data ?? []).map((p) => (
          <RowShell key={p.id}>
            <Cell label="Project" span={5}>
              <span className="flex items-center gap-3">
                {p.images[0] && <img src={p.images[0]} alt="" className="h-11 w-16 rounded object-cover" />}
                <span>
                  <span className="block font-semibold">{p.name}</span>
                  <span className="block text-[12.5px] text-mute">{p.location}</span>
                </span>
              </span>
            </Cell>
            <Cell label="Category" span={3}>
              {p.category}
            </Cell>
            <Cell label="Status" span={2}>
              <span className={cn("micro", p.published ? "text-royal" : "text-mute")}>
                {p.published ? "Published" : "Draft"}
              </span>
              {}
            </Cell>
            <Cell label="Actions" span={2} className="md:text-right">
              <span className="flex flex-wrap gap-1.5 md:justify-end">
                <button
                  onClick={async () => {
                    await api.projects.save({ ...p, published: !p.published });
                    reload();
                  }}
                  className="rounded-full border border-line px-3 py-1.5 text-[11.5px] hover:border-ink"
                >
                  {p.published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`} className="rounded-full border border-line p-2 hover:border-ink">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={async () => {
                    await api.projects.remove(p.id);
                    reload();
                  }}
                  aria-label={`Delete ${p.name}`}
                  className="rounded-full border border-line p-2 hover:border-ink"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </Cell>
          </RowShell>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name ? "Edit Project" : "Add Project"} wide>
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project Name" required>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="Category" required>
                <Select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Location">
              <Input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <ImageUpload value={editing.images} onChange={(urls) => setEditing({ ...editing, images: urls })} folder="lucomi/projects" label="Project Gallery" />
            <div className="flex flex-wrap gap-4 rounded-lg bg-plate px-5 py-4">
              <label className="flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                  className="h-4 w-4 accent-[#1560E8]"
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={editing.placeholder}
                  onChange={(e) => setEditing({ ...editing, placeholder: e.target.checked })}
                  className="h-4 w-4 accent-[#1560E8]"
                />
                Mark as sample content
              </label>
            </div>
            <div className="flex gap-3">
              <Button
                size="lg"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  await api.projects.save({ ...editing, slug: editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-") });
                  setSaving(false);
                  setEditing(null);
                  reload();
                }}
              >
                {saving ? "Saving…" : "Save Project"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ----------------------------- testimonials ---------------------------- */
export function AdminTestimonials() {
  const { data, loading, reload } = useAsync(() => api.testimonials.list());
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const blank: Testimonial = {
    id: `t${Date.now()}`,
    customerName: "",
    company: "",
    content: "",
    image: "",
    published: false,
    placeholder: false,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  return (
    <>
      <AdminPageHead
        title="Reviews & Testimonials"
        description="Review new customer feedback before it appears on the website. Sample entries remain clearly labelled and customer email is never shown publicly."
        action={
          <Button onClick={() => setEditing(blank)}>
            <Plus className="h-4 w-4" /> Add Testimonial
          </Button>
        }
      />

      {(data ?? []).some((item) => !item.published && !item.placeholder) && (
        <div className="mb-6">
          <Notice tone="info" title="Feedback awaiting review">
            Check a customer's name, wording and permission before publishing their submission.
          </Notice>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {loading && Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-44 rounded-xl bg-plate" />)}
        {(data ?? []).map((t) => (
          <article key={t.id} className="flex flex-col justify-between rounded-xl border border-line/70 bg-white p-6 plate-shadow">
            <div>
              <div className="flex items-center gap-3">
                {t.image ? (
                  <img src={t.image} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-line" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-plate text-[13px] font-semibold">
                    {t.customerName.slice(0, 1)}
                  </span>
                )}
                <span className={cn("micro", t.placeholder ? "text-ink" : "text-royal")}>
                  {t.placeholder ? "Sample content" : t.published ? "Published feedback" : "Awaiting approval"}
                </span>
              </div>
              <blockquote className="display mt-4 text-[21px] leading-[1.15] text-ink">“{t.content}”</blockquote>
              <p className="mt-4 text-[14px] font-semibold">{t.customerName}</p>
              <Micro className="mt-1">{t.company}</Micro>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="flex gap-2">
                <span className={cn("micro", t.published ? "text-royal" : "text-mute")}>
                  {t.published ? "Published" : "Unpublished"}
                </span>
                {t.placeholder && <span className="micro text-ink">Sample</span>}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={async () => {
                    await api.testimonials.save({ ...t, published: !t.published });
                    reload();
                  }}
                  className="rounded-full border border-line px-3 py-1.5 text-[11.5px] hover:border-ink"
                >
                  {t.published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => setEditing(t)} aria-label="Edit testimonial" className="rounded-full border border-line p-2 hover:border-ink">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={async () => {
                    await api.testimonials.remove(t.id);
                    reload();
                  }}
                  aria-label="Delete testimonial"
                  className="rounded-full border border-line p-2 hover:border-ink"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.customerName ? "Edit Testimonial" : "Add Testimonial"}>
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer Name" required>
                <Input value={editing.customerName} onChange={(e) => setEditing({ ...editing, customerName: e.target.value })} />
              </Field>
              <Field label="Company Name" hint="optional">
                <Input value={editing.company} onChange={(e) => setEditing({ ...editing, company: e.target.value })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer Email" hint="private, never shown publicly">
                <Input type="email" value={editing.customerEmail ?? ""} onChange={(e) => setEditing({ ...editing, customerEmail: e.target.value })} />
              </Field>
              <Field label="Furniture or Project">
                <Input value={editing.product ?? ""} onChange={(e) => setEditing({ ...editing, product: e.target.value })} />
              </Field>
            </div>
            <Field label="Customer Rating">
              <Select value={editing.rating ?? ""} onChange={(e) => setEditing({ ...editing, rating: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">Not provided</option>
                {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} out of 5 stars</option>)}
              </Select>
            </Field>
            <Field label="Testimonial" required>
              <Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
            </Field>
            <ImageUpload value={editing.image ? [editing.image] : []} onChange={(urls) => setEditing({ ...editing, image: urls[0] ?? "" })} folder="lucomi/testimonials" max={1} label="Customer Image (optional)" />
            {!editing.placeholder && (
              <p className="rounded-lg bg-plate px-4 py-3 text-[13px] leading-relaxed text-mute">
                Confirm the customer has permitted publication of their name and review before checking Published.
              </p>
            )}
            <label className="flex items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                className="h-4 w-4 accent-[#1560E8]"
              />
              Published on the website
            </label>
            <label className="flex items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={editing.placeholder}
                onChange={(e) => setEditing({ ...editing, placeholder: e.target.checked })}
                className="h-4 w-4 accent-[#1560E8]"
              />
              Mark as sample content
            </label>
            <div className="flex gap-3">
              <Button
                size="lg"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  await api.testimonials.save(editing);
                  setSaving(false);
                  setEditing(null);
                  reload();
                }}
              >
                {saving ? "Saving…" : "Save Testimonial"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* --------------------------------- team -------------------------------- */
export function AdminTeam() {
  const { data, loading, reload } = useAsync(() => api.team.list());
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);

  const blank: TeamMember = {
    id: `tm${Date.now()}`,
    name: "",
    role: "",
    image: "",
    bio: "",
    focus: [],
    featured: false,
  };

  return (
    <>
      <AdminPageHead
        title="Team"
        description="The people shown on the Meet the Team page. The member marked as featured appears as the leadership profile."
        action={
          <Button onClick={() => setEditing(blank)}>
            <Plus className="h-4 w-4" /> Add Team Member
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 rounded-xl bg-plate" />)}
        {(data ?? []).map((m) => (
          <article key={m.id} className="flex flex-col rounded-xl border border-line/70 bg-white p-5 plate-shadow">
            <div className="flex items-start gap-4">
              {m.image ? (
                <img src={m.image} alt="" className="h-16 w-14 rounded-lg object-cover" />
              ) : (
                <span className="flex h-16 w-14 items-center justify-center rounded-lg bg-plate font-display text-2xl">
                  {m.name.slice(0, 1) || "?"}
                </span>
              )}
              <div className="min-w-0">
                <h3 className="display truncate text-[24px] leading-none">{m.name}</h3>
                <Micro className="mt-1.5">{m.role}</Micro>
                {m.featured && <Micro className="mt-1 text-royal">Featured / Leadership</Micro>}
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-mute">{m.bio}</p>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <span className="micro text-mute tnum">{m.focus.length} focus areas</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setEditing(m)}
                  aria-label={`Edit ${m.name}`}
                  className="rounded-full border border-line p-2 hover:border-ink"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={async () => {
                    await api.team.remove(m.id);
                    reload();
                  }}
                  aria-label={`Delete ${m.name}`}
                  className="rounded-full border border-line p-2 hover:border-ink"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name ? "Edit Team Member" : "Add Team Member"} wide>
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="Role / Title" required>
                <Input value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="e.g. Production Manager" />
              </Field>
            </div>
            <Field label="Short Bio">
              <Textarea value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
            </Field>
            <Field label="Focus Areas" hint="comma separated">
              <Input
                value={editing.focus.join(", ")}
                onChange={(e) => setEditing({ ...editing, focus: e.target.value.split(",").map((f) => f.trim()).filter(Boolean) })}
                placeholder="Client consultation, Project oversight"
              />
            </Field>
            <ImageUpload
              value={editing.image ? [editing.image] : []}
              onChange={(urls) => setEditing({ ...editing, image: urls[0] ?? "" })}
              folder="lucomi/team"
              max={1}
              label="Portrait Photo"
            />
            <label className="flex items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={editing.featured}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                className="h-4 w-4 accent-[#1560E8]"
              />
              Show as the featured leadership profile
            </label>
            <div className="flex gap-3">
              <Button
                size="lg"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  await api.team.save(editing);
                  setSaving(false);
                  setEditing(null);
                  reload();
                }}
              >
                {saving ? "Saving…" : "Save Team Member"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ------------------------------- enquiries ----------------------------- */
export function AdminEnquiries() {
  const { data, loading, reload } = useAsync(() => api.enquiries.list());
  const [filter, setFilter] = useState<"All" | EnquiryStatus>("All");
  const [active, setActive] = useState<Enquiry | null>(null);

  const list = (data ?? []).filter((e) => filter === "All" || e.status === filter);

  return (
    <>
      <AdminPageHead
        title="Enquiries"
        description="Leads from product enquiries, quote requests, custom furniture, the contact form and WhatsApp. Each one becomes a tracked record."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className={cn(
              "rounded-full border px-4 py-2 text-[12.5px] transition-colors",
              filter === s ? "border-ink bg-ink text-white" : "border-line bg-white text-mute hover:border-ink/40",
            )}
          >
            {s}
            <span className="ml-2 tnum text-[11px] opacity-70">
              {s === "All" ? (data ?? []).length : (data ?? []).filter((e) => e.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && Array.from({ length: 4 }).map((_, i) => <RowShell key={i}><Cell label="Loading">Loading…</Cell></RowShell>)}
        {!loading && list.length === 0 && (
          <Notice tone="info" title="No enquiries here yet">
            New enquiries from the website will appear in this list.
          </Notice>
        )}
        {list.map((e) => (
          <RowShell key={e.id}>
            <Cell label="Customer" span={3}>
              <span className="block font-semibold">{e.fullName}</span>
              <span className="block text-[12.5px] text-mute">{e.companyName || "—"}</span>
            </Cell>
            <Cell label="Requirement" span={3}>
              {e.furnitureType}
              <span className="block text-[12.5px] text-mute tnum">Qty: {e.quantity || "—"}</span>
            </Cell>
            <Cell label="Source" span={2}>
              {e.source}
              <span className="block text-[12.5px] text-mute tnum">{formatDate(e.createdAt)}</span>
            </Cell>
            <Cell label="Status" span={2}>
              <select
                value={e.status}
                onChange={async (ev) => {
                  await api.enquiries.setStatus(e.id, ev.target.value as EnquiryStatus);
                  reload();
                }}
                aria-label={`Update status for ${e.fullName}`}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px]"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Cell>
            <Cell label="Actions" span={2} className="md:text-right">
              <span className="flex flex-wrap gap-1.5 md:justify-end">
                <button onClick={() => setActive(e)} className="rounded-full border border-line px-3 py-1.5 text-[11.5px] hover:border-ink">
                  View
                </button>
                {hasPhone(e.phone) && (
                  <>
                    <a href={telHref(e.phone)} aria-label={`Call ${e.fullName}`} className="rounded-full border border-line p-2 hover:border-ink">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={waLink(`Hello ${e.fullName}, thank you for your enquiry to LUCOMI ENTERPRISE about ${e.furnitureType}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${e.fullName}`}
                      className="rounded-full border border-line p-2 hover:border-ink"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5" />
                    </a>
                  </>
                )}
                {hasMail(e.email) && (
                  <a href={`mailto:${e.email}`} aria-label={`Email ${e.fullName}`} className="rounded-full border border-line p-2 hover:border-ink">
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(`Delete the enquiry from ${e.fullName} permanently? This will also remove its admin notification.`)) return;
                    await api.enquiries.remove(e.id);
                    if (active?.id === e.id) setActive(null);
                    reload();
                  }}
                  aria-label={`Delete enquiry from ${e.fullName}`}
                  title="Delete enquiry permanently"
                  className="rounded-full border border-line p-2 text-mute hover:border-royal hover:text-royal"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </Cell>
          </RowShell>
        ))}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title="Enquiry Details" wide>
        {active && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name"><Input value={active.fullName} readOnly /></Field>
              <Field label="Company"><Input value={active.companyName || "—"} readOnly /></Field>
              <Field label="Phone"><Input value={active.phone} readOnly /></Field>
              <Field label="Email"><Input value={active.email} readOnly /></Field>
              <Field label="Product / Service"><Input value={active.furnitureType} readOnly /></Field>
              <Field label="Quantity"><Input value={active.quantity || "—"} readOnly /></Field>
            </div>
            <Field label="Description">
              <Textarea value={active.description} readOnly />
            </Field>
            {active.images.length > 0 && (
              <div>
                <Micro className="text-ink">Reference Images</Micro>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {active.images.map((image, index) => (
                    <a
                      key={image}
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group overflow-hidden rounded-lg border border-line bg-plate"
                      aria-label={`Open reference image ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`Customer reference ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3 rounded-lg bg-plate px-5 py-4 text-[13.5px]">
              <span>Source: {active.source}</span>
              <span>·</span>
              <span>Preferred contact: {active.preferredContact}</span>
              <span>·</span>
              <span className="tnum">Received {formatDate(active.createdAt)}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {hasPhone(active.phone) && (
                <>
                  <Button href={telHref(active.phone)}>
                    <Phone className="h-4 w-4" /> Call
                  </Button>
                  <Button
                    variant="outline"
                    href={waLink(`Hello ${active.fullName}, thank you for your enquiry to LUCOMI ENTERPRISE about ${active.furnitureType}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                  </Button>
                </>
              )}
              {hasMail(active.email) && (
                <Button variant="outline" href={`mailto:${active.email}`}>
                  <Mail className="h-4 w-4" /> Email
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={async () => {
                  await api.enquiries.remove(active.id);
                  setActive(null);
                  reload();
                }}
              >
                Delete
              </Button>
            </div>
            <p className="text-[12.5px] text-mute">
              Contact numbers shown as “pending” are sample records — real enquiry details will be supplied by the
              customer when the form goes live. {hasPhone(active.phone) ? "" : `Phone on file: ${displayPhone(active.phone)}`}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

/* --------------------------- business settings ------------------------- */
export function AdminSettings() {
  const { data, loading, reload } = useAsync(() => api.settings.get());
  const [form, setForm] = useState(data ?? businessSettings);
  const initialized = useRef(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const current = form ?? data ?? businessSettings;

  useEffect(() => {
    if (data && !initialized.current) {
      setForm(data);
      initialized.current = true;
    }
  }, [data]);

  if (loading && !form) {
    return <AdminPageHead title="Business Settings" description="Loading business information…" />;
  }

  const set = (patch: Partial<typeof current>) => {
    setSaved(false);
    setForm({ ...current, ...patch });
  };

  return (
    <>
      <AdminPageHead
        title="Business Settings"
        description="Company identity and contact details used across the website. Nothing here is hard-coded — these values feed the navigation, footer, contact page and WhatsApp links."
      />

      {saved && (
        <div className="mb-6">
          <Notice title="Settings saved">Business information updated successfully.</Notice>
        </div>
      )}

      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await api.settings.save(current);
          setSaving(false);
          setSaved(true);
          reload();
        }}
      >
        <section className="rounded-xl border border-line/70 bg-white p-6 sm:p-8 plate-shadow">
          <Micro className="text-ink">Company</Micro>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Company Name" required>
              <Input value={current.companyName} onChange={(e) => set({ companyName: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <Input value={current.tagline} onChange={(e) => set({ tagline: e.target.value })} />
            </Field>
          </div>
          <div className="mt-5">
            <ImageUpload
              value={current.logoUrl ? [current.logoUrl] : []}
              onChange={(urls) => set({ logoUrl: urls[0] ?? "" })}
              max={1}
              label="Company Logo"
              hint="Replaces the default LUCOMI logo across the site when uploaded"
            />
          </div>
        </section>

        <section className="rounded-xl border border-line/70 bg-white p-6 sm:p-8 plate-shadow">
          <Micro className="text-ink">Contact Information</Micro>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Phone Numbers" hint="one per line">
              <Textarea value={current.phone.join("\n")} onChange={(e) => set({ phone: e.target.value.split("\n").filter(Boolean) })} />
            </Field>
            <div className="space-y-5">
              <Field label="Email Address">
                <Input type="email" value={current.email} onChange={(e) => set({ email: e.target.value })} />
              </Field>
              <Field label="WhatsApp Number" hint="leave empty until supplied">
                <Input value={current.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} placeholder="e.g. 2348000000000" />
              </Field>
            </div>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Address">
              <Textarea value={current.address} onChange={(e) => set({ address: e.target.value })} />
            </Field>
            <Field label="Business Hours">
              <Textarea value={current.businessHours} onChange={(e) => set({ businessHours: e.target.value })} placeholder="e.g. Monday – Friday, 8:00am – 5:00pm" />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-line/70 bg-white p-6 sm:p-8 plate-shadow">
          <Micro className="text-ink">Social Media</Micro>
          <p className="mt-2 text-[13px] leading-relaxed text-mute">
            Enter confirmed profile URLs only. Until TikTok is configured, its icon opens a search for LUCOMI rather
            than an assumed account.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {(["facebook", "instagram", "tiktok", "twitter"] as const).map((key) => (
              <Field key={key} label={key}>
                <Input
                  value={current.social[key] ?? ""}
                  onChange={(e) => set({ social: { ...current.social, [key]: e.target.value } })}
                  placeholder={key === "tiktok" ? "TikTok profile URL" : "Verified profile URL"}
                />
              </Field>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line/70 bg-white p-6 sm:p-8 plate-shadow">
          <Micro className="text-ink">Website Information</Micro>
          <div className="mt-5">
            <Field label="About Introduction">
              <Textarea value={current.aboutIntro} onChange={(e) => set({ aboutIntro: e.target.value })} />
            </Field>
          </div>
        </section>

        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </>
  );
}
