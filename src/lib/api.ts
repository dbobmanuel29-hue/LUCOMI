/**
 * Data access layer. Today it resolves from in-memory mock data; tomorrow the
 * bodies are replaced with Firestore (Spark plan) reads/writes without any
 * component changes. Media uploads are stubbed for Cloudinary — no Firebase
 * Storage is used anywhere in this frontend.
 */
import { useEffect, useRef, useState } from "react";
import * as mock from "./mock";
import type {
  BusinessSettings,
  Category,
  Enquiry,
  Product,
  Project,
  TeamMember,
  Testimonial,
} from "./types";

const LATENCY = 70;
const wait = <T,>(value: T, ms = LATENCY): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

let productStore: Product[] = [...mock.products];
let categoryStore: Category[] = [...mock.categories];
let projectStore: Project[] = [...mock.projects];
let testimonialStore: Testimonial[] = [...mock.testimonials];
let enquiryStore: Enquiry[] = [...mock.enquiries];
let teamStore: TeamMember[] = [...mock.team];
let settingsStore: BusinessSettings = { ...mock.businessSettings };

import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore";
import { auth, db } from "./firebase";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function productFromDoc(id: string, data: Record<string, unknown>): Product {
  return {
    id, slug: asString(data.slug), name: asString(data.name), category: asString(data.category),
    shortDescription: asString(data.shortDescription), description: asString(data.description),
    price: asString(data.price),
    priceVisibility: data.priceVisibility === "visible" || data.priceVisibility === "contact" ? data.priceVisibility : "on-request",
    images: asStringArray(data.images), features: asStringArray(data.features),
    materials: asString(data.materials), dimensions: asString(data.dimensions),
    variations: asStringArray(data.variations), featured: data.featured === true, published: data.published === true,
    createdAt: asString(data.createdAt, new Date().toISOString().slice(0, 10)),
    updatedAt: asString(data.updatedAt, asString(data.createdAt, new Date().toISOString().slice(0, 10))),
  };
}

function categoryFromDoc(id: string, data: Record<string, unknown>): Category {
  return { id, name: asString(data.name), slug: asString(data.slug), description: asString(data.description), image: asString(data.image), published: data.published === true, createdAt: asString(data.createdAt, new Date().toISOString().slice(0, 10)) };
}

async function isCurrentAdmin() {
  const user = auth.currentUser;
  if (!user) return false;
  const snapshot = await getDoc(doc(db, "admins", user.uid));
  return snapshot.exists() && snapshot.data()?.role === "admin";
}
export async function seedCatalogue() {
  const [productsSnapshot, categoriesSnapshot] = await Promise.all([
    getDocs(collection(db, "products")),
    getDocs(collection(db, "categories")),
  ]);

  if (!productsSnapshot.empty || !categoriesSnapshot.empty) {
    throw new Error("The Firebase catalogue already contains data. No seed was performed.");
  }

  const batch = writeBatch(db);
  mock.categories.forEach((category) => {
    batch.set(doc(db, "categories", category.id), category);
  });
  mock.products.forEach((product) => {
    batch.set(doc(db, "products", product.id), product);
  });
  await batch.commit();

  return {
    categories: mock.categories.length,
    products: mock.products.length,
  };
}

export const api = {
  products: {
    list: async () => {
      const admin = await isCurrentAdmin();
      const snapshot = admin ? await getDocs(collection(db, "products")) : await getDocs(query(collection(db, "products"), where("published", "==", true)));
      if (snapshot.empty) return admin ? wait([...mock.products]) : wait(mock.products.filter((p) => p.published));
      return wait(snapshot.docs.map((item) => productFromDoc(item.id, item.data())));
    },
    featured: async () => {
      const snapshot = await getDocs(query(collection(db, "products"), where("published", "==", true), where("featured", "==", true)));
      return wait(snapshot.empty ? mock.products.filter((p) => p.published && p.featured) : snapshot.docs.map((item) => productFromDoc(item.id, item.data())));
    },
    bySlug: async (slug: string) => {
      const snapshot = await getDocs(query(collection(db, "products"), where("slug", "==", slug), where("published", "==", true)));
      return wait(snapshot.empty ? mock.products.find((p) => p.slug === slug && p.published) ?? null : productFromDoc(snapshot.docs[0].id, snapshot.docs[0].data()));
    },
    related: async (slug: string, limit = 3) => {
      const all = await api.products.list();
      const current = all.find((p) => p.slug === slug);
      if (!current) return [];
      return [...all.filter((p) => p.category === current.category && p.slug !== slug), ...all.filter((p) => p.category !== current.category && p.slug !== slug)].slice(0, limit);
    },
    save: async (product: Product) => {
      const id = product.id || `p-${Date.now()}`;
      const value = { ...product, id, updatedAt: new Date().toISOString().slice(0, 10) };
      await setDoc(doc(db, "products", id), value, { merge: true });
      return value;
    },
    remove: async (id: string) => { await deleteDoc(doc(db, "products", id)); return true; },
  },
  categories: {
    list: async () => {
      const admin = await isCurrentAdmin();
      const snapshot = admin ? await getDocs(collection(db, "categories")) : await getDocs(query(collection(db, "categories"), where("published", "==", true)));
      if (snapshot.empty) return admin ? wait([...mock.categories]) : wait(mock.categories.filter((c) => c.published));
      return wait(snapshot.docs.map((item) => categoryFromDoc(item.id, item.data())));
    },
    save: async (category: Category) => {
      const id = category.id || `c-${Date.now()}`;
      const value = { ...category, id };
      await setDoc(doc(db, "categories", id), value, { merge: true });
      return value;
    },
    remove: async (id: string) => { await deleteDoc(doc(db, "categories", id)); return true; },
  },
  projects: { list: () => wait([...projectStore]), save: (project: Project) => { const idx = projectStore.findIndex((p) => p.id === project.id); if (idx >= 0) projectStore[idx] = project; else projectStore = [project, ...projectStore]; return wait(project, 450); }, remove: (id: string) => { projectStore = projectStore.filter((p) => p.id !== id); return wait(true, 300); } },
  testimonials: { list: () => wait([...testimonialStore]), save: (testimonial: Testimonial) => { const idx = testimonialStore.findIndex((t) => t.id === testimonial.id); if (idx >= 0) testimonialStore[idx] = testimonial; else testimonialStore = [testimonial, ...testimonialStore]; return wait(testimonial, 450); }, remove: (id: string) => { testimonialStore = testimonialStore.filter((t) => t.id !== id); return wait(true, 300); } },
  enquiries: { list: () => wait([...enquiryStore]), create: (enquiry: Enquiry) => { enquiryStore = [enquiry, ...enquiryStore]; return wait(enquiry, 700); }, setStatus: (id: string, status: Enquiry["status"]) => { enquiryStore = enquiryStore.map((e) => (e.id === id ? { ...e, status } : e)); return wait(true, 250); }, remove: (id: string) => { enquiryStore = enquiryStore.filter((e) => e.id !== id); return wait(true, 300); } },
  team: { list: () => wait([...teamStore]), save: (member: TeamMember) => { const idx = teamStore.findIndex((m) => m.id === member.id); if (member.featured) teamStore = teamStore.map((m) => ({ ...m, featured: false })); if (idx >= 0) teamStore[idx] = member; else teamStore = [...teamStore, member]; return wait(member, 450); }, remove: (id: string) => { teamStore = teamStore.filter((m) => m.id !== id); return wait(true, 300); } },
  settings: { get: () => wait({ ...settingsStore }), save: (settings: BusinessSettings) => { settingsStore = { ...settings }; Object.assign(mock.businessSettings, settings); return wait(settingsStore, 600); } },
};
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/** Shared loading / error / empty handling for every dynamic component. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef
      .current()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch(() =>
        alive && setState({ data: null, loading: false, error: "Something went wrong. Please try again." }),
      );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}


export function uploadToCloudinary(
  file: File,
  folder = "lucomi",
  onProgress?: (progress: number) => void,
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

  if (!cloudName || !uploadPreset) {
    return Promise.reject(
      new Error("Cloudinary is not configured yet. Add the Cloudinary cloud name and unsigned upload preset in Vercel."),
    );
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response?.secure_url) {
        resolve(xhr.response.secure_url as string);
        return;
      }
      reject(new Error(xhr.response?.error?.message || "Cloudinary rejected the image upload."));
    };

    xhr.onerror = () => reject(new Error("Could not reach Cloudinary. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("Image upload was cancelled."));
    xhr.send(formData);
  });
}
