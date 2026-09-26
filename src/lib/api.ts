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
  orderBy,
  limit,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const wait = <T,>(value: T): Promise<T> => Promise.resolve(value);

let adminCacheUid: string | null = null;
let adminCacheValue = false;
let adminCacheExpiresAt = 0;

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
      const snapshot = await getDocs(query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(30)));
      return wait(
        snapshot.docs
          .map((item) => notificationFromDoc(item.id, item.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    },

    subscribe: (listener: (items: AdminNotification[]) => void) => {
      // The caller already gates this listener with the resolved admin role.
      // Firestore Rules remain the authoritative security boundary.
      return onSnapshot(
        query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(30)),
        (snapshot) => {
        const items = snapshot.docs
          .map((item) => notificationFromDoc(item.id, item.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          listener(items);
        },
        () => {
        // Non-admin/expired sessions are denied by Firestore Rules; keep the
        // public site quiet rather than surfacing an authorization error.
        listener([]);
      });
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
      // Query only published products, then filter featured in memory.
      // This avoids a composite index dependency and is tiny on the Spark catalogue.
      const snapshot = await getDocs(
        query(collection(db, "products"), where("published", "==", true)),
      );
      const items = snapshot.docs.map((item) => productFromDoc(item.id, item.data()));
      return wait(items.filter((p) => p.featured));
    },

    bySlug: async (slug: string) => {
      // Read published products once and match the slug locally. This also avoids
      // the composite-index issue from querying slug + published together.
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

  testimonials: {
    list: async () => {
      const admin = await isCurrentAdmin();
      if (admin) await ensureAdminSeeded("testimonials", mock.testimonials);
      const snapshot = admin
        ? await getDocs(collection(db, "testimonials"))
        : await getDocs(query(collection(db, "testimonials"), where("published", "==", true)));
      return wait(snapshot.docs.map((item) => testimonialFromDoc(item.id, item.data())));
    },

    save: async (testimonial: Testimonial) => {
      const id = testimonial.id || `t-${Date.now()}`;
      const ref = doc(db, "testimonials", id);
      const existing = await getDoc(ref);
      const value = { ...testimonial, id };
      await setDoc(ref, value, { merge: true });
      if (!existing.exists() && !value.placeholder && value.published === false && value.userId) {
        try {
          await createAdminNotification({
            type: "review",
            title: "New review awaiting approval",
            message: `${value.customerName} submitted a customer review.`,
            link: "/admin/testimonials",
            sourceId: id,
            actorUid: value.userId,
            read: false,
            createdAt: new Date().toISOString(),
          });
        } catch (notificationError) {
          console.error("LUCOMI notification could not be created:", notificationError);
        }
      }
      notifyDataChanged();
      return value;
    },

    remove: async (id: string) => {
      await deleteDoc(doc(db, "testimonials", id));
      notifyDataChanged();
      return true;
    },
  },

  enquiries: {
    list: async () => {
      const admin = await isCurrentAdmin();
      if (admin) {
        const snapshot = await getDocs(collection(db, "enquiries"));
        return wait(snapshot.docs.map((item) => enquiryFromDoc(item.id, item.data())));
      }

      const user = auth.currentUser;
      if (!user) return [];
      const snapshot = await getDocs(
        query(collection(db, "enquiries"), where("userId", "==", user.uid)),
      );
      return wait(snapshot.docs.map((item) => enquiryFromDoc(item.id, item.data())));
    },

    create: async (enquiry: Enquiry) => {
      const user = auth.currentUser;
      if (!user) throw new Error("Please sign in before sending an enquiry.");
      const id = enquiry.id || `e-${Date.now()}`;
      const value = {
        ...enquiry,
        id,
        userId: enquiry.userId || user.uid,
        createdAt: enquiry.createdAt || new Date().toISOString().slice(0, 10),
      };
      await setDoc(doc(db, "enquiries", id), value);
      // Every customer enquiry creates an admin notification, including custom project requests.
      try {
        await createAdminNotification({
          type: "enquiry",
          title: value.source === "Custom Furniture" ? "New custom project request" : "New enquiry received",
          message:
            value.source === "Custom Furniture"
              ? `${value.fullName} submitted a custom furniture project request for ${value.furnitureType}.`
              : `${value.fullName} sent a ${value.source.toLowerCase()} for ${value.furnitureType}.`,
          link: "/admin/enquiries",
          sourceId: id,
          actorUid: user.uid,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } catch (notificationError) {
        console.error("LUCOMI notification could not be created:", notificationError);
      }
      notifyDataChanged();
      return value;
    },

    setStatus: async (id: string, status: Enquiry["status"]) => {
      await setDoc(doc(db, "enquiries", id), { status }, { merge: true });
      return true;
    },

    remove: async (id: string) => {
      await deleteDoc(doc(db, "enquiries", id));
      try {
        const notificationSnapshot = await getDocs(
          query(collection(db, "notifications"), where("sourceId", "==", id)),
        );
        if (!notificationSnapshot.empty) {
          const batch = writeBatch(db);
          notificationSnapshot.docs.forEach((item) => batch.delete(item.ref));
          await batch.commit();
        }
      } catch (notificationError) {
        console.warn("LUCOMI enquiry notification cleanup failed:", notificationError);
      }
      notifyDataChanged();
      return true;
    },
  },

  team: {
    list: async () => {
      const admin = await isCurrentAdmin();
      if (admin) await ensureAdminSeeded("team", mock.team);
      const snapshot = await getDocs(collection(db, "team"));
      return wait(snapshot.docs.map((item) => teamFromDoc(item.id, item.data())));
    },

    save: async (member: TeamMember) => {
      const id = member.id || `tm-${Date.now()}`;
      const value = { ...member, id };
      if (member.featured) {
        const snapshot = await getDocs(collection(db, "team"));
        const batch = writeBatch(db);
        snapshot.docs.forEach((item) => {
          if (item.id !== id && item.data().featured === true) {
            batch.set(item.ref, { featured: false }, { merge: true });
          }
        });
        batch.set(doc(db, "team", id), value, { merge: true });
        await batch.commit();
      } else {
        await setDoc(doc(db, "team", id), value, { merge: true });
      }
      notifyDataChanged();
      return value;
    },

    remove: async (id: string) => {
      await deleteDoc(doc(db, "team", id));
      notifyDataChanged();
      return true;
    },
  },

  settings: {
    get: async () => {
      const snapshot = await getDoc(doc(db, "settings", "business"));
      if (!snapshot.exists()) return wait({ ...mock.businessSettings });
      const data = snapshot.data();
      return wait({
        companyName: asString(data.companyName, mock.businessSettings.companyName),
        tagline: asString(data.tagline, mock.businessSettings.tagline),
        logoUrl: asString(data.logoUrl, mock.businessSettings.logoUrl),
        phone: asStringArray(data.phone),
        email: asString(data.email, mock.businessSettings.email),
        address: asString(data.address, mock.businessSettings.address),
        whatsapp: asString(data.whatsapp),
        businessHours: asString(data.businessHours, mock.businessSettings.businessHours),
        social: {
          facebook: asString((data.social as Record<string, unknown> | undefined)?.facebook),
          instagram: asString((data.social as Record<string, unknown> | undefined)?.instagram),
          tiktok: asString((data.social as Record<string, unknown> | undefined)?.tiktok),
          twitter: asString((data.social as Record<string, unknown> | undefined)?.twitter),
        },
        aboutIntro: asString(data.aboutIntro, mock.businessSettings.aboutIntro),
      } satisfies BusinessSettings);
    },

    save: async (settings: BusinessSettings) => {
      await setDoc(doc(db, "settings", "business"), settings, { merge: true });
      notifyDataChanged();
      return settings;
    },
  },
};

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/** Shared loading / error / empty handling for every dynamic component. */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let alive = true;
    const load = () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      fnRef.current()
        .then((data) => alive && setState({ data, loading: false, error: null }))
        .catch((error) => {
          console.error("LUCOMI data request failed:", error);
          alive &&
            setState({
              data: null,
              loading: false,
              error: "Something went wrong. Please try again.",
            });
        });
    };

    load();
    const unsubscribe = subscribeToDataChanges(load);

    return () => {
      alive = false;
      unsubscribe();
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
      new Error(
        "Cloudinary is not configured yet. Add the Cloudinary cloud name and unsigned upload preset in Vercel.",
      ),
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
      reject(
        new Error(
          xhr.response?.error?.message || "Cloudinary rejected the image upload.",
        ),
      );
    };

    xhr.onerror = () =>
      reject(new Error("Could not reach Cloudinary. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("Image upload was cancelled."));
    xhr.send(formData);
  });
}
