import { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "../components/BrandIcons";
import { api } from "../lib/api";
import { displayPhone, telHref, waLink } from "../lib/helpers";
import { SocialLinks, useSettings } from "../components/Chrome";
import { useQuote } from "../components/QuoteFlow";
import { Button, Field, Input, Micro, Notice, RadioRow, Select, Textarea, usePageMeta } from "../components/ui";
import { useAuth } from "../components/AuthFlow";

const FURNITURE = [
  "Executive Desks",
  "Office Desks",
  "Reception Desks",
  "Conference Tables",
  "Office Chairs",
  "Workstations",
  "Filing Cabinets",
  "Office Storage",
  "Reception Furniture",
  "Custom Office Furniture",
  "Complete Workspace Project",
];

export default function Contact() {
  usePageMeta(
    "Contact LUCOMI ENTERPRISE — Request a Quotation",
    "Contact LUCOMI ENTERPRISE for office furniture quotations. Factory: #17 Ikezam Street, Ozuoba, Port Harcourt, Rivers State, Nigeria.",
  );
  const settings = useSettings();
  const { open } = useQuote();
  const { user, open: openAuth } = useAuth();
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    email: "",
    furnitureType: FURNITURE[0],
    quantity: "",
    description: "",
    preferredContact: "Phone",
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    try {
      await api.enquiries.create({
        id: `e${Date.now()}`,
        fullName: form.fullName,
        companyName: form.companyName,
        phone: form.phone,
        email: form.email,
        furnitureType: form.furnitureType,
        quantity: form.quantity,
        description: form.description,
        preferredContact: form.preferredContact as "Phone" | "Email" | "WhatsApp",
        source: "Contact Form",
        status: "New",
        createdAt: new Date().toISOString().slice(0, 10),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const message = `Hello LUCOMI ENTERPRISE, I would like to enquire about ${form.furnitureType}.`;

  return (
    <>
      <section className="shell pt-[120px] sm:pt-[150px]">
        <Micro className="text-ink">Contact</Micro>
        <h1 className="display mt-5 text-[clamp(3rem,10vw,7rem)]">
          Let's Talk About
          <span className="block pl-[6vw] italic">Your Furniture.</span>
        </h1>
        <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-mute">
          Tell us what you need — a single desk, a full office or a complete workspace project. Send your requirements
          and a LUCOMI representative will get back to you.
        </p>
      </section>

      <section className="shell grid gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16">
        {/* form */}
        <div className="lg:col-span-7">
          {!user ? (
            <div className="rounded-xl border border-line/70 bg-white p-8 sm:p-10 plate-shadow">
              <Micro className="text-royal">Account required</Micro>
              <h2 className="display mt-4 text-[clamp(2.2rem,5vw,3.4rem)]">Sign in to contact LUCOMI.</h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-mute">
                You can browse the full website and follow LUCOMI on social media without an account. To send a request,
                request a quotation, or start a direct conversation, you must be signed in.
              </p>
              <Button className="mt-8" size="lg" onClick={openAuth}>Sign In / Create Account</Button>
            </div>
          ) : status === "success" ? (
            <div className="rounded-xl border border-line/70 bg-white p-8 sm:p-10 plate-shadow">
              <Micro className="text-royal">Enquiry sent</Micro>
              <h2 className="display mt-4 text-[clamp(2.2rem,5vw,3.4rem)]">Request Received</h2>
              <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-mute">
                Thank you. Your request has been received. A LUCOMI representative will contact you shortly.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={waLink(message)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="h-4 w-4" /> Continue on WhatsApp
                </Button>
                <Button variant="outline" href="/products">
                  Browse Furniture
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="space-y-5 rounded-xl border border-line/70 bg-white p-6 sm:p-9 plate-shadow"
            >
              <Micro className="text-ink">Send a request</Micro>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" required>
                  <Input required value={form.fullName} onChange={set("fullName")} placeholder="Your name" />
                </Field>
                <Field label="Company Name">
                  <Input value={form.companyName} onChange={set("companyName")} placeholder="Business or organisation" />
                </Field>
                <Field label="Phone Number" required>
                  <Input required type="tel" value={form.phone} onChange={set("phone")} placeholder="Phone number" />
                </Field>
                <Field label="Email Address" required>
                  <Input required type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" />
                </Field>
                <Field label="Furniture Type" required>
                  <Select value={form.furnitureType} onChange={set("furnitureType")}>
                    {FURNITURE.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Quantity">
                  <Input value={form.quantity} onChange={set("quantity")} placeholder="e.g. 10 units" />
                </Field>
              </div>
              <Field label="Project Description" required>
                <Textarea
                  required
                  value={form.description}
                  onChange={set("description")}
                  placeholder="What do you need, where is it going and when do you need it?"
                />
              </Field>
              <Field label="Preferred Contact Method">
                <RadioRow
                  name="contact-method"
                  options={["Phone", "Email", "WhatsApp"]}
                  value={form.preferredContact}
                  onChange={(v) => setForm((f) => ({ ...f, preferredContact: v }))}
                />
              </Field>
              {status === "error" && (
                <Notice tone="warn" title="Something went wrong">
                  Your request could not be sent. Please try again, or reach us on WhatsApp.
                </Notice>
              )}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" size="lg" disabled={status === "saving"}>
                  {status === "saving" ? "Sending…" : "Send Request"}
                </Button>
                <Button variant="outline" size="lg" type="button" onClick={() => open("", "Contact Form")}>
                  Quick Quote Form
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* details */}
        <aside className="lg:col-span-5">
          {!user ? (
            <div className="rounded-xl bg-plate p-7 sm:p-8">
              <Micro className="text-ink">Direct contact is protected</Micro>
              <h2 className="display mt-4 text-3xl">Create an account to reach us.</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-mute">
                Sign in first to reveal LUCOMI's phone, email and WhatsApp contact options. Social profiles remain available
                below so you can follow our work.
              </p>
              <Button className="mt-6" onClick={openAuth}>Get Started</Button>
              <div className="mt-8 border-t border-line pt-6">
                <Micro className="text-ink">Follow LUCOMI</Micro>
                <SocialLinks settings={settings} tone="light" className="mt-3" />
              </div>
            </div>
          ) : (
            <>
          <div className="rounded-xl bg-plate p-7 sm:p-8">
            <Micro className="text-ink">LUCOMI Enterprise</Micro>
            <ul className="mt-6 space-y-6">
              <li className="flex gap-4">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                <div>
                  <Micro>Factory Address</Micro>
                  <p className="mt-1 text-[15px] leading-relaxed">{settings.address}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                <div>
                  <Micro>Phone</Micro>
                  <ul className="mt-1 space-y-1 text-[15px]">
                    {settings.phone.map((p) => (
                      <li key={p}>
                        <a href={telHref(p)} className="tnum hover:text-royal">
                          {displayPhone(p)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                <div>
                  <Micro>Email</Micro>
                  <a href={`mailto:${settings.email}`} className="mt-1 block break-all text-[15px] hover:text-royal">
                    {settings.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                <div>
                  <Micro>WhatsApp</Micro>
                  <p className="mt-1 text-[15px]">
                    {settings.whatsapp ? (
                      <a href={waLink("Hello LUCOMI ENTERPRISE, I would like to make an enquiry.")} className="tnum hover:text-royal">
                        {displayPhone(settings.whatsapp)}
                      </a>
                    ) : (
                      <span className="text-mute">
                        Dedicated WhatsApp line pending — use{" "}
                        <a href={waLink("Hello LUCOMI ENTERPRISE, I would like to make an enquiry.")} className="text-royal underline">
                          WhatsApp
                        </a>{" "}
                        or call the numbers above.
                      </span>
                    )}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                <div>
                  <Micro>Business Hours</Micro>
                  <p className="mt-1 text-[15px]">
                    {settings.businessHours || <span className="text-mute">Business hours to be confirmed</span>}
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-8 border-t border-line pt-6">
              <Micro className="text-ink">Social Media</Micro>
              <SocialLinks settings={settings} tone="light" className="mt-3" />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-line/70 bg-white p-7">
            <Micro className="text-ink">Talk to LUCOMI now</Micro>
            <p className="mt-2 text-[14.5px] leading-relaxed text-mute">
              The fastest way to discuss a requirement is WhatsApp. Send the details and we will respond with options and
              a quotation.
            </p>
            <Button
              className="mt-4"
              href={waLink("Hello LUCOMI ENTERPRISE, I would like to make an enquiry.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp Us
            </Button>
          </div>
            </>
          )}
        </aside>
      </section>
    </>
  );
}
