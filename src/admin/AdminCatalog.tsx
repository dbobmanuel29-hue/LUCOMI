import { useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { api, useAsync } from "../lib/api";
import { cn, formatDate, priceLabel } from "../lib/helpers";
import type { Category, Product } from "../lib/types";
import { ImageUpload } from "../components/ImageUpload";
import { AdminPageHead, Cell, RowShell } from "./AdminShell";
import { Button, Field, Input, Micro, Modal, Notice, Select, Textarea } from "../components/ui";

const blank = (category: string): Product => ({
  id: `p${Date.now()}`,
  slug: "",
  name: "",
  category,
  shortDescription: "",
  description: "",
  price: "",
  priceVisibility: "on-request",
  images: [],
  features: [],
  materials: "",
  dimensions: "",
  variations: [],
  featured: false,
  published: true,
  createdAt: new Date().toISOString().slice(0, 10),
  updatedAt: new Date().toISOString().slice(0, 10),
});

/* ------------------------------- products ------------------------------ */
export function AdminProducts() {
  const { data, loading, reload } = useAsync(() => api.products.list());
  const categories = useAsync(() => api.categories.list());
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Product | null>(null);
  const firstCategory = (categories.data ?? [])[0]?.slug ?? "executive-desks";

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    await api.products.save({ ...editing, updatedAt: new Date().toISOString().slice(0, 10) });
    setSaving(false);
    setEditing(null);
    setNotice("Product saved successfully.");
    reload();
  };

  const patch = (p: Partial<Product>) => setEditing((e) => (e ? { ...e, ...p } : e));

  return (
    <>
      <AdminPageHead
        title="Products"
        description="Add, edit and publish catalogue products. Manage product details, publishing and catalogue media."
        action={
          <Button onClick={() => setEditing(blank(firstCategory))}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        }
      />

      {notice && (
        <div className="mb-6">
          <Notice title="Success">
            {notice}
            <button className="ml-2 text-royal" onClick={() => setNotice(null)}>
              dismiss
            </button>
          </Notice>
        </div>
      )}

      <div className="space-y-3">
        {loading && Array.from({ length: 5 }).map((_, i) => <RowShell key={i}><Cell label="Loading">Loading…</Cell></RowShell>)}
        {(data ?? []).map((p) => (
          <RowShell key={p.id}>
            <Cell label="Product" span={4}>
              <span className="flex items-center gap-3">
                {p.images[0] && <img src={p.images[0]} alt="" className="h-11 w-14 rounded object-cover" />}
                <span>
                  <span className="block font-semibold">{p.name}</span>
                  <span className="block text-[12.5px] text-mute">{priceLabel(p)}</span>
                </span>
              </span>
            </Cell>
            <Cell label="Category" span={3}>
              {p.category.replace(/-/g, " ")}
            </Cell>
            <Cell label="Flags" span={2}>
              <span className="flex flex-wrap gap-2">
                <span className={cn("micro", p.published ? "text-royal" : "text-mute")}>
                  {p.published ? "Published" : "Draft"}
                </span>
                {p.featured && <span className="micro text-ink">Featured</span>}
              </span>
            </Cell>
            <Cell label="Updated" span={1}>
              <span className="tnum text-[12.5px] text-mute">{formatDate(p.updatedAt)}</span>
            </Cell>
            <Cell label="Actions" span={2} className="md:text-right">
              <span className="flex flex-wrap gap-1.5 md:justify-end">
                <button
                  onClick={async () => {
                    await api.products.save({ ...p, published: !p.published });
                    reload();
                  }}
                  className="rounded-full border border-line px-3 py-1.5 text-[11.5px] hover:border-ink"
                >
                  {p.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={async () => {
                    await api.products.save({ ...p, featured: !p.featured });
                    reload();
                  }}
                  aria-label={p.featured ? "Remove from featured" : "Mark as featured"}
                  className={cn(
                    "rounded-full border border-line p-2 hover:border-ink",
                    p.featured && "border-royal text-royal",
                  )}
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setEditing(p)}
                  aria-label={`Edit ${p.name}`}
                  className="rounded-full border border-line p-2 hover:border-ink"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setConfirm(p)}
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

      {/* add / edit */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name ? "Edit Product" : "Add Product"} wide>
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product Name" required>
                <Input value={editing.name} onChange={(e) => patch({ name: e.target.value })} placeholder="e.g. Vantage Executive Desk" />
              </Field>
              <Field label="URL Slug">
                <Input
                  value={editing.slug}
                  onChange={(e) => patch({ slug: e.target.value })}
                  placeholder="generated-from-name"
                />
              </Field>
              <Field label="Category" required>
                <Select value={editing.category} onChange={(e) => patch({ category: e.target.value })}>
                  {(categories.data ?? []).map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Price Visibility">
                <Select
                  value={editing.priceVisibility}
                  onChange={(e) => patch({ priceVisibility: e.target.value as Product["priceVisibility"] })}
                >
                  <option value="on-request">Price on Request</option>
                  <option value="contact">Contact for Price</option>
                  <option value="visible">Show Actual Price</option>
                </Select>
              </Field>
              {editing.priceVisibility === "visible" && (
                <Field label="Actual Price" hint="admin controlled">
                  <Input value={editing.price} onChange={(e) => patch({ price: e.target.value })} placeholder="Enter price" />
                </Field>
              )}
            </div>

            <Field label="Short Description" required>
              <Input
                value={editing.shortDescription}
                onChange={(e) => patch({ shortDescription: e.target.value })}
                placeholder="One line shown on the product card"
              />
            </Field>
            <Field label="Full Description">
              <Textarea value={editing.description} onChange={(e) => patch({ description: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Features" hint="one per line">
                <Textarea
                  value={editing.features.join("\n")}
                  onChange={(e) => patch({ features: e.target.value.split("\n").filter(Boolean) })}
                />
              </Field>
              <div className="space-y-4">
                <Field label="Materials">
                  <Textarea value={editing.materials} onChange={(e) => patch({ materials: e.target.value })} />
                </Field>
                <Field label="Dimensions">
                  <Input value={editing.dimensions} onChange={(e) => patch({ dimensions: e.target.value })} />
                </Field>
              </div>
            </div>
            <Field label="Variations" hint="comma separated">
              <Input
                value={editing.variations.join(", ")}
                onChange={(e) => patch({ variations: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
                placeholder="Walnut / White laminate, Left-hand pedestal"
              />
            </Field>

            <ImageUpload value={editing.images} onChange={(urls) => patch({ images: urls })} folder="lucomi/products" label="Product Images" />

            <div className="flex flex-wrap gap-4 rounded-lg bg-plate px-5 py-4">
              <label className="flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) => patch({ published: e.target.checked })}
                  className="h-4 w-4 accent-[#1560E8]"
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) => patch({ featured: e.target.checked })}
                  className="h-4 w-4 accent-[#1560E8]"
                />
                Featured on homepage
              </label>
            </div>

            <div className="flex gap-3">
              <Button onClick={save} size="lg" disabled={saving}>
                {saving ? "Saving…" : "Save Product"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete Product">
        <p className="text-[15px] text-mute">
          Delete <strong className="text-charcoal">{confirm?.name}</strong>? This record will be removed from the
          catalogue. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="ink"
            onClick={async () => {
              if (confirm) await api.products.remove(confirm.id);
              setConfirm(null);
              setNotice("Product deleted.");
              reload();
            }}
          >
            Delete
          </Button>
          <Button variant="outline" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------ categories ----------------------------- */
const blankCategory = (): Category => ({
  id: `c${Date.now()}`,
  name: "",
  slug: "",
  description: "",
  image: "",
  published: true,
  createdAt: new Date().toISOString().slice(0, 10),
});

export function AdminCategories() {
  const { data, loading, reload } = useAsync(() => api.categories.list());
  const products = useAsync(() => api.products.list());
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const count = (slug: string) => (products.data ?? []).filter((p) => p.category === slug).length;

  return (
    <>
      <AdminPageHead
        title="Categories"
        description="Organise the catalogue into product families. Each category can carry its own image and assigned products."
        action={
          <Button onClick={() => setEditing(blankCategory())}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-plate" />)}
        {(data ?? []).map((c) => (
          <article key={c.id} className="rounded-xl border border-line/70 bg-white p-5 plate-shadow">
            <div className="flex items-start gap-4">
              {c.image && <img src={c.image} alt="" className="h-14 w-20 rounded object-cover" />}
              <div className="flex-1">
                <h3 className="display text-[26px] leading-none">{c.name}</h3>
                <Micro className="mt-2">{count(c.slug)} products assigned</Micro>
              </div>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-mute">{c.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={cn("micro", c.published ? "text-royal" : "text-mute")}>
                {c.published ? "Published" : "Hidden"}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setEditing(c)}
                  aria-label={`Edit ${c.name}`}
                  className="rounded-full border border-line p-2 hover:border-ink"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={async () => {
                    await api.categories.remove(c.id);
                    reload();
                  }}
                  aria-label={`Delete ${c.name}`}
                  className="rounded-full border border-line p-2 hover:border-ink"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name ? "Edit Category" : "Add Category"}>
        {editing && (
          <div className="space-y-4">
            <Field label="Category Name" required>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="URL Slug">
              <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <ImageUpload value={editing.image ? [editing.image] : []} onChange={(urls) => setEditing({ ...editing, image: urls[0] ?? "" })} folder="lucomi/categories" max={1} label="Category Image" />
            <div className="flex gap-3">
              <Button
                size="lg"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  await api.categories.save(editing);
                  setSaving(false);
                  setEditing(null);
                  reload();
                }}
              >
                {saving ? "Saving…" : "Save Category"}
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
