/** Firestore-backed data access layer for LUCOMI. */
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
  AdminNotification,
} from "./types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const wait = <T,>(value: T): Promise<T> => Promise.resolve(value);

let adminCacheUid: string | null = null;
let adminCacheValue = false;
let adminCacheExpiresAt = 0;

async function isCurrentAdmin() {
  const user = auth.currentUser;
  if (!user) {
    adminCacheUid = null;
    adminCacheValue = false;
    adminCacheExpiresAt = 0;
    return false;
  }

  const now = Date.now();
  if (adminCacheUid === user.uid && now < adminCacheExpiresAt) {
    return adminCacheValue;
  }

  const snapshot = await getDoc(doc(db, "admins", user.uid));
  const value = snapshot.exists() && snapshot.data()?.role === "admin";
  adminCacheUid = user.uid;
  adminCacheValue = value;
  adminCacheExpiresAt = now + 30_000;
  return value;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function productFromDoc(id: string, data: Record<string, unknown>): Product {
  const createdAt = asString(data.createdAt, new Date().toISOString().slice(0, 10));
  return {
    id,
    slug: asString(data.slug),
    name: asString(data.name),
    category: asString(data.category),
    shortDescription: asString(data.shortDescription),
    description: asString(data.description),
    price: asString(data.price),
    priceVisibility:
      data.priceVisibility === "visible" || data.priceVisibility === "contact"
        ? data.priceVisibility
        : "on-request",
    images: asStringArray(data.images),
    features: asStringArray(data.features),
    materials: asString(data.materials),
    dimensions: asString(data.dimensions),
    variations: asStringArray(data.variations),
    featured: data.featured === true,
    published: data.published === true,
    createdAt,
    updatedAt: asString(data.updatedAt, createdAt),
  };
}

function categoryFromDoc(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: asString(data.name),
    slug: asString(data.slug),
    description: asString(data.description),
    image: asString(data.image),
    published: data.published === true,
    createdAt: asString(data.createdAt, new Date().toISOString().slice(0, 10)),
  };
}

function projectFromDoc(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    slug: asString(data.slug),
    name: asString(data.name),
    category: asString(data.category),
    description: asString(data.description),
    location: asString(data.location),
    images: asStringArray(data.images),
    published: data.published === true,
    placeholder: data.placeholder === true,
    createdAt: asString(data.createdAt, new Date().toISOString().slice(0, 10)),
  };
}

function testimonialFromDoc(id: string, data: Record<string, unknown>): Testimonial {
  const rating = typeof data.rating === "number" ? data.rating : undefined;
  return {
    id,
    userId: typeof data.userId === "string" ? data.userId : undefined,
    customerName: asString(data.customerName),
    company: asString(data.company),
    content: asString(data.content),
    image: asString(data.image),
    rating,
    product: typeof data.product === "string" ? data.product : undefined,
    customerEmail: typeof data.customerEmail === "string" ? data.customerEmail : undefined,
    published: data.published === true,
    placeholder: data.placeholder === true,
    createdAt: asString(data.createdAt, new Date().toISOString().slice(0, 10)),
  };
}

function teamFromDoc(id: string, data: Record<string, unknown>): TeamMember {
  return {
    id,
    name: asString(data.name),
    role: asString(data.role),
    image: asString(data.image),
    bio: asString(data.bio),
    focus: asStringArray(data.focus),
    featured: data.featured === true,
  };
}

function notificationFromDoc(id: string, data: Record<string, unknown>): AdminNotification {
  return {
    id,
    type: data.type === "review" ? "review" : "enquiry",
    title: asString(data.title),
    message: asString(data.message),
    link: asString(data.link),
    sourceId: asString(data.sourceId),
    actorUid: asString(data.actorUid),
    read: data.read === true,
    createdAt: asString(data.createdAt),
  };
}

function enquiryFromDoc(id: string, data: Record<string, unknown>): Enquiry {
  return {
    id,
    userId: typeof data.userId === "string" ? data.userId : undefined,
    fullName: asString(data.fullName),
    companyName: asString(data.companyName),
    phone: asString(data.phone),
    email: asString(data.email),
    furnitureType: asString(data.furnitureType),
    quantity: asString(data.quantity),
    description: asString(data.description),
    images: asStringArray(data.images),
    preferredContact:
      data.preferredContact === "Email" || data.preferredContact === "WhatsApp"
        ? data.preferredContact
        : "Phone",
    source:
      data.source === "Product Enquiry" ||
      data.source === "Quote Request" ||
      data.source === "Custom Furniture" ||
      data.source === "WhatsApp Enquiry" ||
      data.source === "Project Enquiry"
        ? data.source
        : "Contact Form",
    status:
      data.status === "Contacted" ||
      data.status === "In Progress" ||
      data.status === "Completed" ||
      data.status === "Archived"
        ? data.status
        : "New",
    createdAt: asString(data.createdAt, new Date().toISOString().slice(0, 10)),
  };
}

async function createAdminNotification(input: Omit<AdminNotification, "id">) {
  const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await setDoc(doc(db, "notifications", id), { ...input, id });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Seed the existing editorial/sample content once when an admin first opens
 * that section. A permanent marker prevents deleted content from coming back.
 */
async function ensureAdminSeeded<T extends { id: string }>(
  collectionName: string,
  seedItems: T[],
) {
  if (!(await isCurrentAdmin()) || seedItems.length === 0) return;

  const markerRef = doc(db, "settings", `bootstrap-${collectionName}`);
  const marker = await getDoc(markerRef);
  if (marker.exists()) return;

  const snapshot = await getDocs(collection(db, collectionName));
  if (!snapshot.empty) {
    await setDoc(markerRef, { initializedAt: new Date().toISOString() });
    return;
  }

  const batch = writeBatch(db);
  seedItems.forEach((item) => {
    batch.set(doc(db, collectionName, item.id), item);
  });
  batch.set(markerRef, { initializedAt: new Date().toISOString() });
  await batch.commit();
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
  mock.categories.forEach((category) => batch.set(doc(db, "categories", category.id), category));
  mock.products.forEach((product) => batch.set(doc(db, "products", product.id), product));
  await batch.commit();

  return { categories: mock.categories.length, products: mock.products.length };
}

const DATA_CHANGED_EVENT = "lucomi:data-changed";

function notifyDataChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
}

function subscribeToDataChanges(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(DATA_CHANGED_EVENT, listener);
  return () => window.removeEventListener(DATA_CHANGED_EVENT, listener);
}

export const api = {
  notifications: {
    list: async () => {
      if (!(await isCurrentAdmin())) return [];
      const snapshot = await getDocs(collection(db, "notifications"));
      return wait(
        snapshot.docs
          .map((item) => notificationFromDoc(item.id, item.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    },

    subscribe: (listener: (items: AdminNotification[]) => void) => {
      let active = true;
      let unsubscribe = () => {};
      void isCurrentAdmin().then((admin) => {
        if (!active || !admin) return;
        unsubscribe = onSnapshot(collection(db, "notifications"), (snapshot) => {
          const items = snapshot.docs
            .map((item) => notificationFromDoc(item.id, item.data()))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          listener(items);
        });
      });
      return () => {
        active = false;
        unsubscribe();
      };
    },

    markRead: async (id: string) => {
      if (!(await isCurrentAdmin())) return;
      await setDoc(doc(db, "notifications", id), { read: true }, { merge: true });
    },

    markAllRead: async (ids: string[]) => {
      if (!(await isCurrentAdmin()) || ids.length === 0) return;
      const batch = writeBatch(db);
      ids.forEach((id) => batch.set(doc(db, "notifications", id), { read: true }, { merge: true }));
      await batch.commit();
    },
  },

  products: {
    list: async () => {
      const admin = await isCurrentAdmin();
      const snapshot = admin
        ? await getDocs(collection(db, "products"))
        : await getDocs(query(collection(db, "products"), where("published", "==", true)));

      return wait(snapshot.docs.map((item) => productFromDoc(item.id, item.data())));
    },

    featured: async () => {
      const snapshot = await getDocs(
        query(collection(db, "products"), where("published", "==", true)),
      );
      const items = snapshot.docs.map((item) => productFromDoc(item.id, item.data()));
      return wait(items.filter((p) => p.featured));
    },

    bySlug: async (slug: string) => {
      const snapshot = await getDocs(
        query(collection(db, "products"), where("published", "==", true)),
      );
      const items = snapshot.docs.map((item) => productFromDoc(item.id, item.data()));
      return wait(items.find((p) => p.slug === slug) ?? null);
    },

    related: async (slug: string, limit = 3) => {
      const all = await api.products.list();
      const current = all.find((p) => p.slug === slug);
      if (!current) return [];
      return [
        ...all.filter((p) => p.category === current.category && p.slug !== slug),
        ...all.filter((p) => p.category !== current.category && p.slug !== slug),
      ].slice(0, limit);
    },

    save: async (product: Product) => {
      const id = product.id || `p-${Date.now()}`;
      const slug = slugify(product.slug || product.name) || id;
      const value = {
        ...product,
        id,
        slug,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      await setDoc(doc(db, "products", id), value, { merge: true });
      notifyDataChanged();
      return value;
    },

    remove: async (id: string) => {
      await deleteDoc(doc(db, "products", id));
      notifyDataChanged();
      return true;
    },
  },

  categories: {
    list: async () => {
      const admin = await isCurrentAdmin();
      const snapshot = admin
        ? await getDocs(collection(db, "categories"))
        : await getDocs(query(collection(db, "categories"), where("published", "==", true)));
      return wait(snapshot.docs.map((item) => categoryFromDoc(item.id, item.data())));
    },

    save: async (category: Category) => {
      const id = category.id || `c-${Date.now()}`;
      const value = {
        ...category,
        id,
        slug: slugify(category.slug || category.name) || id,
      };
      await setDoc(doc(db, "categories", id), value, { merge: true });
      notifyDataChanged();
      return value;
    },

    remove: async (id: string) => {
      await deleteDoc(doc(db, "categories", id));
      notifyDataChanged();
      return true;
    },
  },

  projects: {
    list: async () => {
      const admin = await isCurrentAdmin();
      if (admin) await ensureAdminSeeded("projects", mock.projects);
      const snapshot = admin
        ? await getDocs(collection(db, "projects"))
        : await getDocs(query(collection(db, "projects"), where("published", "==", true)));
      return wait(snapshot.docs.map((item) => projectFromDoc(item.id, item.data())));
    },

    save: async (project: Project) => {
      const id = project.id || `pr-${Date.now()}`;
      const value = {
        ...project,
        id,
        slug: slugify(project.slug || project.name) || id,
        createdAt: project.createdAt || new Date().toISOString().slice(0, 10),
      };
      await setDoc(doc(db, "projects", id), value, { merge: true });
      notifyDataChanged();
      return value;
    },

    remove: async (id: string) => {
      await deleteDoc(doc(db, "projects", id));
      notifyDataChanged();
      return true;
    },
  },