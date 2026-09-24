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

const LATENCY = 420;
const wait = <T,>(value: T, ms = LATENCY): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

let productStore: Product[] = [...mock.products];
let categoryStore: Category[] = [...mock.categories];
let projectStore: Project[] = [...mock.projects];
let testimonialStore: Testimonial[] = [...mock.testimonials];
let enquiryStore: Enquiry[] = [...mock.enquiries];
let teamStore: TeamMember[] = [...mock.team];
let settingsStore: BusinessSettings = { ...mock.businessSettings };

export const api = {
  products: {
    list: () => wait([...productStore]),
    featured: () => wait(productStore.filter((p) => p.published && p.featured)),
    bySlug: (slug: string) => wait(productStore.find((p) => p.slug === slug) ?? null),
    related: (slug: string, limit = 3) => {
      const current = productStore.find((p) => p.slug === slug);
      if (!current) return Promise.resolve([] as Product[]);
      const same = productStore.filter((p) => p.category === current.category && p.slug !== slug);
      const rest = productStore.filter((p) => p.category !== current.category && p.slug !== slug);
      return wait([...same, ...rest].slice(0, limit));
    },
    save: (product: Product) => {
      const idx = productStore.findIndex((p) => p.id === product.id);
      if (idx >= 0) productStore[idx] = product;
      else productStore = [product, ...productStore];
      return wait(product, 550);
    },
    remove: (id: string) => {
      productStore = productStore.filter((p) => p.id !== id);
      return wait(true, 350);
    },
  },
  categories: {
    list: () => wait([...categoryStore]),
    save: (category: Category) => {
      const idx = categoryStore.findIndex((c) => c.id === category.id);
      if (idx >= 0) categoryStore[idx] = category;
      else categoryStore = [category, ...categoryStore];
      return wait(category, 450);
    },
    remove: (id: string) => {
      categoryStore = categoryStore.filter((c) => c.id !== id);
      return wait(true, 300);
    },
  },
  projects: {
    list: () => wait([...projectStore]),
    save: (project: Project) => {
      const idx = projectStore.findIndex((p) => p.id === project.id);
      if (idx >= 0) projectStore[idx] = project;
      else projectStore = [project, ...projectStore];
      return wait(project, 450);
    },
    remove: (id: string) => {
      projectStore = projectStore.filter((p) => p.id !== id);
      return wait(true, 300);
    },
  },
  testimonials: {
    list: () => wait([...testimonialStore]),
    save: (testimonial: Testimonial) => {
      const idx = testimonialStore.findIndex((t) => t.id === testimonial.id);
      if (idx >= 0) testimonialStore[idx] = testimonial;
      else testimonialStore = [testimonial, ...testimonialStore];
      return wait(testimonial, 450);
    },
    remove: (id: string) => {
      testimonialStore = testimonialStore.filter((t) => t.id !== id);
      return wait(true, 300);
    },
  },
  enquiries: {
    list: () => wait([...enquiryStore]),
    create: (enquiry: Enquiry) => {
      enquiryStore = [enquiry, ...enquiryStore];
      return wait(enquiry, 700);
    },
    setStatus: (id: string, status: Enquiry["status"]) => {
      enquiryStore = enquiryStore.map((e) => (e.id === id ? { ...e, status } : e));
      return wait(true, 250);
    },
    remove: (id: string) => {
      enquiryStore = enquiryStore.filter((e) => e.id !== id);
      return wait(true, 300);
    },
  },
  team: {
    list: () => wait([...teamStore]),
    save: (member: TeamMember) => {
      const idx = teamStore.findIndex((m) => m.id === member.id);
      // Only one member can be featured as the leadership profile.
      if (member.featured) teamStore = teamStore.map((m) => ({ ...m, featured: false }));
      if (idx >= 0) teamStore[idx] = member;
      else teamStore = [...teamStore, member];
      return wait(member, 450);
    },
    remove: (id: string) => {
      teamStore = teamStore.filter((m) => m.id !== id);
      return wait(true, 300);
    },
  },
  settings: {
    get: () => wait({ ...settingsStore }),
    save: (settings: BusinessSettings) => {
      settingsStore = { ...settings };
      Object.assign(mock.businessSettings, settings);
      return wait(settingsStore, 600);
    },
  },
  /** Cloudinary unsigned upload is wired in later — the UI already drives it. */
  uploadImage: (fileName: string) => wait({ url: `images/${fileName}`, progress: 100 }, 1100),
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
