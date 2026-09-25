import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { WhatsAppIcon } from "./BrandIcons";
import { api } from "../lib/api";
import { cn, quoteMessage, waLink } from "../lib/helpers";
import type { Enquiry, EnquirySource } from "../lib/types";
import { Button, Field, Input, Modal, Notice, RadioRow, Select, Textarea } from "./ui";
import { useAuth } from "./AuthFlow";

type QuoteContextValue = {
  open: (subject?: string, source?: EnquirySource) => void;
};

const QuoteContext = createContext<QuoteContextValue>({ open: () => {} });
export const useQuote = () => useContext(QuoteContext);

const emptyForm = {
  fullName: "",
  companyName: "",
  phone: "",
  email: "",
  furnitureType: "",
  quantity: "",
  description: "",
  preferredContact: "Phone" as Enquiry["preferredContact"],
};

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const { user, open: openAuth } = useAuth();
  const [state, setState] = useState<{
    open: boolean;
    subject: string;
    source: EnquirySource;
  }>({ open: false, subject: "", source: "Quote Request" });

  const open = useCallback((subject = "", source: EnquirySource = "Quote Request") => {
    if (!user) {
      openAuth();
      return;
    }
    setState({ open: true, subject, source });
  }, [user, openAuth]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <QuoteContext.Provider value={value}>
      {children}
      <QuoteModal
        open={state.open}
        subject={state.subject}
        source={state.source}
        onClose={() => setState((s) => ({ ...s, open: false }))}
      />
    </QuoteContext.Provider>
  );
}

function QuoteModal({
  open,
  subject,
  source,
  onClose,
}: {
  open: boolean;
  subject: string;
  source: EnquirySource;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const set = (k: keyof typeof emptyForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    const enquiry: Enquiry = {
      id: `e${Date.now()}`,
      ...form,
      userId: user?.uid,
      furnitureType: form.furnitureType || subject || "General Enquiry",
      source,
      status: "New",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    try {
      await api.enquiries.create(enquiry);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const message = quoteMessage(form.furnitureType || subject || "office furniture");

  return (
    <Modal
      open={open}
      onClose={() => {
        if (status !== "saving") {
          onClose();
          setTimeout(() => {
            setStatus("idle");
            setForm(emptyForm);
          }, 250);
        }
      }}
      title={status === "success" ? "Request Received" : "Request a Quote"}
    >
      {!user ? (
        <Notice title="Sign in required">
          Please sign in or create a LUCOMI account before sending a quotation or enquiry. You can browse the website without an account, but contact requests require a signed-in account.
        </Notice>
      ) : status === "success" ? (
        <div className="space-y-5">
          <Notice title="Thank you">
            Your request has been received. A LUCOMI representative will contact you shortly.
          </Notice>
          <dl className="rule grid grid-cols-1 gap-y-2 pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="micro text-mute">Name</dt>
              <dd>{form.fullName || "—"}</dd>
            </div>
            <div>
              <dt className="micro text-mute">Furniture</dt>
              <dd>{form.furnitureType || subject || "General Enquiry"}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={waLink(message)}>
              <WhatsAppIcon className="h-4 w-4" /> Continue on WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  setStatus("idle");
                  setForm(emptyForm);
                }, 250);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-mute">
            Tell us what you need and we will prepare a quotation. Fields marked{" "}
            <span className="text-royal">*</span> are required.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" required>
              <Input required value={form.fullName} onChange={(e) => set("fullName")(e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Company Name">
              <Input value={form.companyName} onChange={(e) => set("companyName")(e.target.value)} placeholder="Business or organisation" />
            </Field>
            <Field label="Phone Number" required>
              <Input required type="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="Phone number" />
            </Field>
            <Field label="Email Address" required>
              <Input required type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="you@company.com" />
            </Field>
            <Field label="Furniture / Service" required>
              <Input
                required
                value={form.furnitureType || subject}
                onChange={(e) => set("furnitureType")(e.target.value)}
                placeholder="e.g. Executive desk"
              />
            </Field>
            <Field label="Quantity">
              <Input value={form.quantity} onChange={(e) => set("quantity")(e.target.value)} placeholder="e.g. 12 units" />
            </Field>
          </div>
          <Field label="Project Description">
            <Textarea
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="Space type, sizes, finishes, delivery location or any special requirements."
            />
          </Field>
          <Field label="Preferred Contact Method">
            <RadioRow
              name="preferredContact"
              options={["Phone", "Email", "WhatsApp"]}
              value={form.preferredContact}
              onChange={(v) => set("preferredContact")(v)}
            />
          </Field>
          {status === "error" && (
            <Notice tone="warn" title="Something went wrong">
              Your request could not be sent. Please try again, or reach us on WhatsApp.
            </Notice>
          )}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button type="submit" disabled={status === "saving"} size="lg">
              {status === "saving" ? "Sending…" : "Send Request"}
            </Button>
            <Button variant="outline" size="lg" href={waLink(message)}>
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp Us
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* -------------------- shared WhatsApp / contact bits ------------------- */
export function WhatsAppLink({
  message,
  children,
  className,
}: {
  message: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { user, open: openAuth } = useAuth();
  return (
    <button
      type="button"
      onClick={() => {
        if (!user) {
          openAuth();
          return;
        }
        window.open(waLink(message), "_blank", "noopener,noreferrer");
      }}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-royal px-5 py-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-royal-dark",
        className,
      )}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {children ?? "WhatsApp Us"}
    </button>
  );
}

export { Select };
