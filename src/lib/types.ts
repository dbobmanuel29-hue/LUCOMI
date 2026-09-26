/**
 * Backend-ready data models.
 * These mirror the intended Firestore documents (Firebase Spark plan).
 * Mock data implements exactly these shapes so services can be swapped for
 * Firestore reads later without touching the components.
 */

export type PriceVisibility = "visible" | "on-request" | "contact";
export type EnquiryStatus = "New" | "Contacted" | "In Progress" | "Completed" | "Archived";
export type EnquirySource =
  | "Product Enquiry"
  | "Quote Request"
  | "Custom Furniture"
  | "Contact Form"
  | "WhatsApp Enquiry"
  | "Project Enquiry";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  published: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string; // Category.slug
  shortDescription: string;
  description: string;
  /** Never fabricated — empty string means the price is not published. */
  price: string;
  priceVisibility: PriceVisibility;
  images: string[];
  features: string[];
  materials: string;
  dimensions: string;
  variations: string[];
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  location: string;
  images: string[];
  published: boolean;
  /** Sample content until real projects are entered by the admin. */
  placeholder: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  /** Firebase Auth UID of the signed-in customer who submitted the review. */
  userId?: string;
  customerName: string;
  company: string;
  content: string;
  image: string;
  rating?: number;
  product?: string;
  customerEmail?: string;
  published: boolean;
  placeholder: boolean;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  /** Firebase Auth UID of the signed-in customer who submitted the enquiry. */
  userId?: string;
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
  furnitureType: string;
  quantity: string;
  description: string;
  preferredContact: "Phone" | "Email" | "WhatsApp";
  source: EnquirySource;
  status: EnquiryStatus;
  createdAt: string;
}

export interface BusinessSettings {
  companyName: string;
  tagline: string;
  logoUrl: string;
  phone: string[];
  email: string;
  address: string;
  /** Empty string until the real WhatsApp line is supplied. Never invented. */
  whatsapp: string;
  businessHours: string;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    twitter: string;
  };
  aboutIntro: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  focus: string[];
  featured: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  provider: "email" | "google";
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
}


export type NotificationType = "enquiry" | "review";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  sourceId: string;
  actorUid: string;
  read: boolean;
  createdAt: string;
}
