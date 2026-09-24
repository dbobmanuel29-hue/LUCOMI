import { businessSettings } from "./mock";
import type { BusinessSettings, Product } from "./types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Never fabricate a price. Products without a published price read "Price on Request". */
export function priceLabel(product: Pick<Product, "price" | "priceVisibility">) {
  if (product.priceVisibility === "on-request") return "Price on Request";
  if (product.priceVisibility === "contact") return "Contact for Price";
  return product.price || "Price on Request";
}

/** Display the factory phone numbers exactly as supplied. */
export function displayPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) {
    return `+234 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return raw;
}

export function telHref(raw: string) {
  return `tel:+${raw.replace(/\D/g, "")}`;
}

/**
 * WhatsApp deep link. The recipient number is loaded from Business Settings
 * (Firestore) and is deliberately NOT invented: until it is configured the
 * link opens WhatsApp with the message ready to send to a chosen chat.
 */
export function waLink(message: string, settings: BusinessSettings = businessSettings) {
  const text = encodeURIComponent(message);
  const number = (settings.whatsapp || "").replace(/\D/g, "");
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function productEnquiryMessage(productName: string) {
  return `Hello LUCOMI ENTERPRISE, I am interested in ${productName}. I would like more information and a quotation.`;
}

export function quoteMessage(subject: string) {
  return `Hello LUCOMI ENTERPRISE, I would like to request a quotation for: ${subject}.`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
