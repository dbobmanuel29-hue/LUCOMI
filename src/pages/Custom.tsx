import { useState } from "react";
import { api } from "../lib/api";
import { IMG } from "../lib/mock";
import { quoteMessage } from "../lib/helpers";
import { ImageUpload } from "../components/ImageUpload";
import { useQuote, WhatsAppLink } from "../components/QuoteFlow";
import { Accordion, Button, Field, Input, Marquee, Micro, Notice, RadioRow, Reveal, Select, Textarea, usePageMeta } from "../components/ui";

const SPACE_TYPES = [
  "Executive Office",
  "General Office",
  "Conference Room",
  "Reception Area",
  "Open-Plan Workspace",
  "Government / Institutional Office",
  "Home Office",
  "Other",
];

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
  "Complete Workspace Fit-Out",
];

const STEPS = [
  ["01", "Tell us about the space"],
  ["02", "We prepare a proposal"],
  ["03", "Production and installation"],
];

export default function Custom() {
  usePageMeta(
    "Custom Office Furniture — LUCOMI ENTERPRISE",
    "Have a space in mind? LUCOMI creates custom office furniture tailored to your space, style and business needs — from executive offices to complete workplace setups.",
  );
  const { open } = useQuote();
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    email: "",
    spaceType: SPACE_TYPES[0],
    furniture: FURNITURE[0],
    quantity: "",
    description: "",
    dimensions: "",
    delivery: "",
    extra: "",
    preferredContact: "Phone",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
        furnitureType: form.furniture,
        quantity: form.quantity,
        description: `${form.description}\nSpace type: ${form.spaceType}\nDimensions: ${form.dimensions}\nDelivery: ${form.delivery}\nAdditional: ${form.extra}\nReference images: ${images.length}`,
        preferredContact: form.preferredContact as "Phone" | "Email" | "WhatsApp",
        source: "Custom Furniture",
        status: "New",
        createdAt: new Date().toISOString().slice(0, 10),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const message = quoteMessage(`${form.furniture} — custom furniture project`);

  return (
    <>
      <section className="shell pt-[120px] sm:pt-[150px]">
        <Micro className="text-ink">Custom Furniture</Micro>
        <h1 className="display mt-5 text-[clamp(3rem,10vw,7rem)]">
          Have a Space
          <span className="block pl-[6vw] italic">in Mind?</span>
        </h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <p className="text-[17px] leading-relaxed text-mute lg:col-span-6">
            From executive offices to complete workplace setups, LUCOMI can create furniture solutions tailored to your
            space, style and business needs.
          </p>
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal className="grain overflow-hidden rounded-xl">
              <img
                src={IMG.custom}
                alt="Veneer and laminate samples with technical drawings prepared for a custom LUCOMI furniture project"
                className="aspect-[4/3] w-full object-cover"
              />
            </Reveal>
          </div>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-3">
          {STEPS.map(([n, title]) => (
            <li key={n} className="rule pt-5">
              <span className="display text-[22px] italic text-royal tnum">{n}</span>
              <p className="mt-2 text-[15.5px] font-semibold text-ink">{title}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="display text-[clamp(2.2rem,5vw,3.4rem)]">Start a Custom Project</h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-mute">
              Give us the outline — the space, the furniture, roughly how many pieces. A LUCOMI representative will come
              back to you with questions, options and a quotation.
            </p>
            <div className="mt-8 rounded-xl bg-plate p-6">
              <Micro className="text-ink">Prefer to talk?</Micro>
              <p className="mt-2 text-[14.5px] leading-relaxed text-mute">
                Send the details straight to our WhatsApp line and continue the conversation there.
              </p>
              <WhatsAppLink message={message} className="mt-4">
                WhatsApp Us
              </WhatsAppLink>
            </div>
          </div>

          <div className="lg:col-span-8">
            {status === "success" ? (
              <div className="rounded-xl border border-line/70 bg-white p-8 sm:p-10 plate-shadow">
                <Micro className="text-royal">Step complete</Micro>
                <h3 className="display mt-4 text-[clamp(2.2rem,5vw,3.4rem)]">Request Received</h3>
                <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-mute">
                  Thank you. Your request has been received. A LUCOMI representative will contact you shortly.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <WhatsAppLink message={message}>
                    Continue on WhatsApp
                  </WhatsAppLink>
                  <Button variant="outline" href="/products">
                    Browse Furniture
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5 rounded-xl border border-line/70 bg-white p-6 sm:p-9 plate-shadow">
                <Micro className="text-ink">Project brief</Micro>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full Name" required>
                    <Input required value={form.fullName} onChange={set("fullName")} placeholder="Your name" />
                  </Field>
                  <Field label="Company Name">
                    <Input value={form.companyName} onChange={set("companyName")} placeholder="Business or organisation" />
                  </Field>
                  <Field label="Phone" required>
                    <Input required type="tel" value={form.phone} onChange={set("phone")} placeholder="Phone number" />
                  </Field>
                  <Field label="Email" required>
                    <Input required type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" />
                  </Field>
                  <Field label="Space Type" required>
                    <Select required value={form.spaceType} onChange={set("spaceType")}>
                      {SPACE_TYPES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Furniture Required" required>
                    <Select required value={form.furniture} onChange={set("furniture")}>
                      {FURNITURE.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Quantity">
                    <Input value={form.quantity} onChange={set("quantity")} placeholder="e.g. 12 units" />
                  </Field>
                  <Field label="Preferred Contact Method">
                    <RadioRow
                      name="custom-contact"
                      options={["Phone", "Email", "WhatsApp"]}
                      value={form.preferredContact}
                      onChange={(v) => setForm((f) => ({ ...f, preferredContact: v }))}
                    />
                  </Field>
                </div>

                <Field label="Project Description" required>
                  <Textarea
                    required
                    value={form.description}
                    onChange={set("description")}
                    placeholder="Describe the space, how it is used and the furniture you have in mind."
                  />
                </Field>

                <ImageUpload value={images} onChange={setImages} label="Reference Images (optional)" />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Dimensions" hint="optional">
                    <Input value={form.dimensions} onChange={set("dimensions")} placeholder="Room or furniture sizes" />
                  </Field>
                  <Field label="Delivery / Location" hint="optional">
                    <Input value={form.delivery} onChange={set("delivery")} placeholder="Delivery address or city" />
                  </Field>
                </div>

                <Field label="Additional Requirements" hint="optional">
                  <Textarea value={form.extra} onChange={set("extra")} placeholder="Finishes, colours, budget range, timeline…" />
                </Field>

                {status === "error" && (
                  <Notice tone="warn" title="Something went wrong">
                    Your request could not be sent. Please try again or reach us on WhatsApp.
                  </Notice>
                )}

                <Button type="submit" size="lg" disabled={status === "saving"}>
                  {status === "saving" ? "Sending…" : "Start a Custom Project"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Marquee
        className="border-y border-line bg-white"
        items={[
          "Made to Measure",
          "Your Dimensions",
          "Your Finishes",
          "Shop Drawings",
          "Material Samples",
          "Delivery & Installation",
        ]}
      />

      {/* --------------------------- what we can make --------------------------- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="shell">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-6">
              <Micro className="text-ink">Scope</Micro>
              <h2 className="display mt-4 text-[clamp(2.4rem,6vw,4.4rem)]">
                What We Can
                <span className="block italic">Make for You.</span>
              </h2>
            </div>
            <p className="text-[15px] leading-relaxed text-mute md:col-span-5 md:col-start-8">
              Custom work is not limited to the catalogue. If it sits in an office and can be drawn, LUCOMI can usually
              manufacture it.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line/70 bg-line sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Executive Suites", "Desks, credenzas and storage designed together for a private office."],
              ["Reception Counters", "Curved or straight front-of-house counters with transaction tops."],
              ["Boardroom Tables", "Long-format tables with cable routes and flush power modules."],
              ["Fitted Storage Walls", "Floor-to-ceiling shelving and cabinets built to a plan."],
              ["Bench Runs", "Open-plan workstation runs cut to the floor plate and column spacing."],
              ["Reception & Waiting Units", "Waiting-area seating, coffee tables and display units built around the entrance."],
              ["Training Room Furniture", "Training desks, collaborative tables and storage configured for flexible rooms."],
              ["Media & Presentation Units", "Presentation consoles, printer stations and AV furniture designed around equipment."],
              ["Unusual Pieces", "Special-purpose furniture made from drawings, dimensions and site requirements."],
            ].map(([title, text], i) => (
              <Reveal key={title} delay={(i % 3) * 0.05} variant="scale">
                <article className="h-full bg-white p-7">
                  <span className="display text-[18px] italic text-royal tnum">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="display mt-3 text-[28px] leading-none">{title}</h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-mute">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- process -------------------------------- */}
      <section className="shell py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Micro className="text-ink">How It Works</Micro>
            <h2 className="display mt-5 text-[clamp(2.4rem,6vw,4.2rem)]">
              The Custom
              <span className="block italic">Process.</span>
            </h2>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute">
              Six stages take a custom job from a description on a form to installed furniture in your workspace. You
              approve the design and the quotation before anything is cut.
            </p>
            <div className="mt-8 overflow-hidden rounded-xl">
              <img
                src={IMG.custom}
                alt="Veneer samples, laminate chips and technical drawings prepared for a custom furniture project"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>

          <ol className="lg:col-span-6 lg:col-start-7" role="list">
            {[
              ["Brief", "You send the space type, furniture required, quantities and any reference images."],
              ["Measure", "Dimensions are confirmed — from drawings, a site visit or your own measurements."],
              ["Design", "Layouts, proportions and details are developed and agreed with you."],
              ["Samples", "Veneer, laminate and upholstery samples are proposed for approval."],
              ["Manufacture", "Production, edge finishing, assembly and finishing are carried out in-house."],
              ["Install", "Furniture is delivered, installed and checked before handover."],
            ].map(([title, text], i) => (
              <Reveal key={title} delay={i * 0.05}>
                <li className="rule grid grid-cols-[auto_1fr] gap-x-6 py-6">
                  <span className="display text-[24px] italic text-royal tnum">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="display text-[28px] leading-none">{title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-mute">{text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------- materials & faq ---------------------------- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Micro className="text-ink">Before You Enquire</Micro>
            <h2 className="display mt-5 text-[clamp(2.2rem,5vw,3.6rem)]">
              Have These
              <span className="block italic">Handy.</span>
            </h2>
            <ul className="mt-7 space-y-4">
              {[
                "Room or floor dimensions (even approximate)",
                "Number of pieces and who will use them",
                "Preferred finish — wood, white, colour",
                "Delivery location and any timing pressure",
                "Photos, drawings or reference images you like",
              ].map((item, i) => (
                <li key={item} className="block">
                  <Reveal delay={i * 0.05} className="flex items-start gap-3 border-t border-line pt-4 text-[15px] text-charcoal">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-royal" />
                    {item}
                  </Reveal>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => open("", "Custom Furniture")}>Start a Custom Project</Button>
              <WhatsAppLink message="Hello LUCOMI ENTERPRISE, I would like to discuss a custom furniture project.">
                WhatsApp Us
              </WhatsAppLink>
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Micro className="text-ink">Custom Furniture FAQ</Micro>
            <div className="mt-5">
              <Accordion
                items={[
                  {
                    q: "How long does a custom order take?",
                    a: "Lead time depends on size, materials and quantity. Your quotation will state an agreed production and delivery schedule so you can plan the fit-out around it.",
                  },
                  {
                    q: "Can you work from an architect's or designer's drawings?",
                    a: "Yes. Send the drawings or a sketch with your enquiry and LUCOMI will develop shop drawings for approval before manufacture.",
                  },
                  {
                    q: "Will I see the finishes before production?",
                    a: "Material and finish samples can be proposed with your quotation so you can approve exactly what is made.",
                  },
                  {
                    q: "Do you handle multi-room or phased projects?",
                    a: "Yes — complete workplace packages can be produced and delivered in phases so other trades can keep working on site.",
                  },
                  {
                    q: "Is there a minimum size for custom work?",
                    a: "No. A single made-to-measure cabinet and a full floor of furniture are quoted on exactly the same basis.",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------- cta ---------------------------------- */}
      <section className="bg-ink">
        <div className="shell flex flex-col items-start gap-8 py-20 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="display text-[clamp(2.4rem,6vw,4.4rem)] text-white">
            Let's design it
            <br />
            <span className="italic">together.</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="light" size="lg" onClick={() => open("", "Custom Furniture")}>
              Start a Custom Project
            </Button>
            <Button variant="outline" size="lg" className="border-white/35 text-white hover:bg-white hover:text-ink" href="/contact">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
