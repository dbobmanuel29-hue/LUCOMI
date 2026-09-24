import { Link } from "react-router-dom";
import { ArrowRight, Ruler, ShieldCheck, Sprout, Truck } from "lucide-react";
import { WhatsAppIcon } from "../components/BrandIcons";
import { IMG, team } from "../lib/mock";
import { waLink } from "../lib/helpers";
import { useSettings } from "../components/Chrome";
import { useQuote } from "../components/QuoteFlow";
import { Accordion, Button, Marquee, Micro, Reveal, SectionHead, usePageMeta } from "../components/ui";

const PILLARS = [
  ["Quality Craftsmanship", "Furniture created with attention to detail, from the cut of the panel to the final finish."],
  ["Modern Design", "Contemporary solutions for today's workplaces and the way teams actually work."],
  ["Durable Materials", "Veneers, laminates, steel and commercial-grade fabrics selected for everyday professional use."],
  ["Custom Solutions", "Furniture tailored to individual spaces, dimensions and requirements."],
  ["Professional Installation", "Support from production through to delivery and installation where applicable."],
];

const SERVICES = [
  ["Design & Concept Development", "Layouts, furniture layouts, material boards and shop drawings developed from your space and brief."],
  ["Manufacturing", "Panels cut, edged, veneered and assembled in our factory workshop to agreed specifications."],
  ["Custom & Special Furniture", "Made-to-measure pieces for unusual plans, reception counters, boardrooms and fitted storage."],
  ["Project Supply", "Furniture packages for whole floors, branches and institutional buildings, supplied in phases if needed."],
  ["Delivery & Installation", "Finished furniture delivered to site and installed, with the space left clean and ready to occupy."],
];

const MATERIALS = [
  ["Wood Veneer", "Natural walnut and oak surfaces over engineered cores for executive and front-of-house furniture."],
  ["High-Pressure Laminate", "Hard-wearing, easy to clean and available in a wide range of neutral and wood-effect finishes."],
  ["Powder-Coated Steel", "Frames, legs, pedestals and filing bodies finished for long service in busy offices."],
  ["Commercial Upholstery", "Fabrics and leatherette specified for high-traffic seating in reception and boardrooms."],
  ["Acoustic Fabric Screens", "Panel and desk screens that soften noise across open-plan floors without blocking light."],
  ["Solid Timber Edges", "Chamfered and straight edges on desk tops and counters where a solid detail matters."],
];

const AUDIENCE = [
  ["Individual Professionals", "A single desk, chair or storage unit for a private or home office."],
  ["Small Businesses", "Complete first-office setups, fitted out within a practical budget."],
  ["Corporate Companies", "Standardised furniture schedules across departments, floors and branches."],
  ["Institutions & Government", "Durable administrative furniture built for heavy daily use and records keeping."],
  ["Designers & Contractors", "Manufactured furniture produced to a designer's drawings and finish schedule."],
];

const PRINCIPLES = [
  ["Listen first", "Every order starts with the space, the people using it and how the furniture has to perform."],
  ["Build it properly", "Correct materials, correct fixings and construction that survives daily professional use."],
  ["Say what we know", "Clear information about materials, lead times and pricing — no unsupported claims."],
  ["Finish the job", "Delivery and installation are part of the work, not an afterthought."],
];

const FAQ = [
  {
    q: "Where is LUCOMI ENTERPRISE based?",
    a: "Our factory is at #17 Ikezam Street, Ozuoba, Port Harcourt, Rivers State, Nigeria. Enquiries can be sent by phone, email or WhatsApp using the details on the contact page.",
  },
  {
    q: "What kind of furniture does LUCOMI manufacture?",
    a: "Executive desks, office desks, reception desks, conference tables, office chairs, workstations, filing cabinets, office storage, reception furniture — and custom furniture made to a client's own dimensions and finishes.",
  },
  {
    q: "Do you handle complete office fit-outs?",
    a: "Yes. LUCOMI can furnish a single room or a complete workplace, coordinating desks, seating, storage and front-of-house pieces so finishes match across the space.",
  },
  {
    q: "How is pricing determined?",
    a: "Pricing depends on materials, dimensions, quantity and finishes, so most products are quoted rather than listed. Use the Request a Quote form or send a WhatsApp message with your requirements and quantities.",
  },
  {
    q: "Do you deliver and install?",
    a: "Delivery and installation support is available for completed orders. The exact arrangement is confirmed with you when your quotation is prepared.",
  },
];

export default function About() {
  usePageMeta(
    "About LUCOMI ENTERPRISE — Office Furniture Design & Manufacture",
    "LUCOMI ENTERPRISE designs and manufactures functional, durable and stylish office furniture for professional environments, from a single piece to complete workplace fit-outs in Port Harcourt, Nigeria.",
  );
  const { open } = useQuote();
  const settings = useSettings();

  return (
    <>
      {/* ------------------------------- hero ------------------------------ */}
      <section className="shell pt-[120px] sm:pt-[150px]">
        <Micro className="text-ink">About the Company</Micro>
        <h1 className="display mt-5 text-[clamp(3rem,10vw,7rem)]">
          Furniture Built
          <span className="block pl-[6vw] italic">for Business.</span>
        </h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <Reveal variant="left" className="text-[17px] leading-relaxed text-mute lg:col-span-6">
            <p>
              LUCOMI ENTERPRISE designs and manufactures professional office furniture for businesses, organizations and
              modern workplaces. We specialize in functional, durable and stylish furniture for professional
              environments — from a single piece for one office to complete furniture packages for whole workplaces.
            </p>
          </Reveal>
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal variant="right" className="rounded-xl border border-line/70 bg-white p-7 plate-shadow">
              <Micro className="text-ink">What we do</Micro>
              <ul className="mt-4 space-y-2.5 text-[15px] text-charcoal">
                <li>Design and development of office furniture concepts</li>
                <li>Manufacture of desks, tables, seating and storage</li>
                <li>Custom furniture built to client dimensions</li>
                <li>Delivery and installation where applicable</li>
              </ul>
            </Reveal>
          </div>
        </div>

        <Reveal variant="clip" className="relative mt-14 overflow-hidden rounded-xl">
          <img
            src={IMG.hero}
            alt="Executive office fitted with LUCOMI office furniture — executive desk, ergonomic chair and credenza"
            className="h-[58vw] max-h-[640px] min-h-[300px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/35 to-ink/10" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-12 lg:p-16">
            <Micro className="text-white/65">The LUCOMI Standard</Micro>
            <p className="display mt-4 max-w-4xl text-[clamp(2rem,6.4vw,5.4rem)] leading-[0.95] text-white">
              Quality Office Furniture,
              <br />
              <span className="italic">Better Workspaces.</span>
            </p>
            <div className="mt-6 hidden flex-wrap gap-x-8 gap-y-2 sm:flex">
              {["Designed in-house", "Manufactured to order", "Delivered & installed"].map((word) => (
                <span key={word} className="micro flex items-center gap-2 text-white/75">
                  <span className="h-1.5 w-1.5 rounded-full bg-royal" />
                  {word}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------- company narrative ------------------------ */}
      <section className="bg-white py-20 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Micro className="text-ink">The Company</Micro>
            <h2 className="display mt-5 text-[clamp(2.4rem,6vw,4.2rem)]">
              A Furniture
              <br />
              <span className="italic">Manufacturer.</span>
            </h2>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute">
              LUCOMI ENTERPRISE is a design and manufacturing business. We do not simply resell furniture — pieces are
              developed, cut, edged, veneered, assembled, finished and inspected in our own workshop before they are
              delivered to the client's floor.
            </p>
            <p className="mt-4 text-[15.5px] leading-relaxed text-mute">
              That means specifications can be controlled: the same board, the same edge, the same hardware and the same
              finish standard across a single desk or across forty positions.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                [Sprout, "Designed for the space", "Furniture planned around your floor, your team and your storage needs."],
                [ShieldCheck, "Built for daily use", "Materials and construction chosen for professional, everyday service."],
                [Ruler, "Made to measurement", "Standard sizes or made-to-measure pieces built from your dimensions."],
                [Truck, "Delivered and installed", "Production, delivery and installation handled as one job."],
              ].map(([Icon, title, text], i) => {
                const IconCmp = Icon as typeof Sprout;
                return (
                  <li key={title as string} className="block">
                    <Reveal delay={i * 0.06} className="flex gap-4 border-t border-line pt-4">
                      <IconCmp className="mt-1 h-4 w-4 shrink-0 text-royal" />
                      <div>
                        <p className="text-[15px] font-semibold text-ink">{title as string}</p>
                        <p className="mt-1 text-[14px] leading-relaxed text-mute">{text as string}</p>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal variant="clip" className="grain overflow-hidden rounded-xl">
              <img
                src={IMG.workshop}
                alt="Furniture craftsmanship at the LUCOMI workshop — veneer panels, clamps and finishing work"
                className="aspect-[4/3] w-full object-cover"
              />
            </Reveal>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Reveal variant="up">
                <div className="h-full rounded-xl bg-plate p-6">
                  <Micro className="text-ink">Factory</Micro>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-charcoal">{settings.address}</p>
                </div>
              </Reveal>
              <Reveal variant="up" delay={0.08}>
                <div className="h-full rounded-xl bg-plate p-6">
                  <Micro className="text-ink">Enquiries</Micro>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-charcoal">
                    {settings.email}
                    <br />
                    {settings.phone.join(" / ")}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ pillars ---------------------------- */}
      <section className="shell py-20 sm:py-28">
        <SectionHead
          index="Our Approach"
          title={<>Built Around the Way You Work</>}
          intro="Five commitments that shape every piece of furniture leaving the workshop."
        />
        <div className="mt-12 grid gap-x-14 md:grid-cols-2">
          {PILLARS.map(([title, text], i) => (
            <Reveal key={title} delay={(i % 2) * 0.06}>
              <div className="rule grid grid-cols-[auto_1fr] gap-x-6 py-7">
                <span className="display text-[24px] italic text-royal tnum">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="display text-[30px] leading-none">{title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-mute">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Marquee
        className="border-y border-line bg-white"
        items={[
          "Executive Desks",
          "Office Chairs",
          "Workstations",
          "Conference Tables",
          "Reception Desks",
          "Filing Cabinets",
          "Office Storage",
          "Custom Furniture",
        ]}
      />

      {/* ------------------------------ services --------------------------- */}
      <section className="shell py-20 sm:py-28">
        <SectionHead
          index="What We Do"
          title={
            <>
              From an Idea to
              <br />
              <span className="italic">a Finished Office.</span>
            </>
          }
          intro="Five stages of work sit behind every LUCOMI order, whether it is one desk or a full floor."
        />
        <div className="mt-12 space-y-0">
          {SERVICES.map(([title, text], i) => (
            <Reveal key={title} delay={i * 0.05}>
              <div className="rule group grid gap-3 py-7 transition-colors md:grid-cols-12 md:gap-8">
                <span className="display text-[26px] italic text-royal tnum md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display text-[30px] leading-none md:col-span-4">{title}</h3>
                <p className="text-[15px] leading-relaxed text-mute md:col-span-6 md:col-start-6">{text}</p>
                <ArrowRight className="hidden h-5 w-5 self-center text-line transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-royal md:col-span-1 md:block" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------ materials -------------------------- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="shell">
          <SectionHead
            index="Materials"
            title={
              <>
                Specified for
                <br />
                <span className="italic">Everyday Use.</span>
              </>
            }
            intro="Material choices are agreed before production begins. Samples can be supplied with your quotation."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MATERIALS.map(([title, text], i) => (
              <Reveal key={title} delay={(i % 3) * 0.06}>
                <article className="group h-full rounded-xl border border-line/70 bg-paper p-7 transition-transform duration-300 hover:-translate-y-1">
                  <span className="block h-10 w-16 rounded-md bg-gradient-to-br from-royal to-ink transition-transform duration-300 group-hover:scale-x-125" />
                  <h3 className="display mt-6 text-[27px]">{title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-mute">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- capabilities ------------------------ */}
      <section className="shell py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Micro className="text-ink">Capabilities</Micro>
            <h2 className="display mt-5 text-[clamp(2.4rem,6vw,4.2rem)]">
              One Piece or a
              <br />
              <span className="italic">Whole Floor.</span>
            </h2>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute">
              LUCOMI works with individual professionals, small businesses, corporate companies and institutions. The
              same workshop, the same materials and the same finish standards apply whatever the size of the order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => open("", "Quote Request")}>Request a Quote</Button>
              <Button
                variant="outline"
                href={waLink("Hello LUCOMI ENTERPRISE, I would like to discuss a furniture requirement.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="h-4 w-4" /> Talk to LUCOMI
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:col-span-6 lg:col-start-7">
            {AUDIENCE.map(([title, text], i) => (
              <Reveal key={title} delay={i * 0.05}>
                <article className="rounded-xl bg-plate p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="display text-[17px] italic text-royal tnum">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="display text-[28px] leading-none">{title}</h3>
                  </div>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-mute">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- principles -------------------------- */}
      <section className="bg-ink">
        <div className="shell py-20 sm:py-28">
          <SectionHead
            tone="light"
            index="How We Work"
            title={
              <span className="text-white">
                Principles of
                <br />
                <span className="italic">the Workshop.</span>
              </span>
            }
            intro="The standards we hold ourselves to on every order, large or small."
          />
          <div className="mt-12 grid gap-x-14 md:grid-cols-2">
            {PRINCIPLES.map(([title, text], i) => (
              <Reveal key={title} delay={(i % 2) * 0.06}>
                <div className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-white/15 py-7">
                  <span className="display text-[24px] italic text-white/50 tnum">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="display text-[30px] leading-none text-white">{title}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-white/70">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ team teaser ------------------------- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Micro className="text-ink">The People</Micro>
            <h2 className="display mt-5 text-[clamp(2.4rem,6vw,4.2rem)]">
              Meet the
              <br />
              <span className="italic">LUCOMI Team.</span>
            </h2>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute">
              From the drawing board to the workshop floor and the final installation, a small hands-on team owns
              every stage of your furniture.
            </p>
            <Button href="/team" className="mt-7">
              Meet the Team <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="flex flex-wrap items-center gap-5">
              {team.map((member, i) => (
                <Reveal
                  key={member.id}
                  delay={i * 0.06}
                  variant="scale"
                  className={i > 0 ? "-ml-6 sm:-ml-8" : ""}
                >
                  <Link
                    to="/team"
                    className="group block"
                    title={`${member.name} — ${member.role}`}
                    aria-label={`${member.name} — ${member.role}`}
                  >
                    <img
                      src={member.image}
                      alt=""
                      loading="lazy"
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-white transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24"
                    />
                  </Link>
                </Reveal>
              ))}
              <li className="ml-2">
                <Link
                  to="/team"
                  className="micro inline-flex items-center gap-2 rounded-full border border-line bg-paper px-5 py-3 text-royal transition-colors hover:border-royal"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------- faq ------------------------------ */}
      <section className="shell py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Micro className="text-ink">Company FAQ</Micro>
            <h2 className="display mt-5 text-[clamp(2.2rem,5vw,3.6rem)]">
              Common
              <br />
              <span className="italic">Questions.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-mute">
              Anything else can be asked directly — we answer by phone, email or WhatsApp.
            </p>
            <Link to="/contact" className="micro mt-5 inline-flex items-center gap-2 text-royal hover:text-ink">
              Go to contact page <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion items={FAQ} />
          </div>
        </div>
      </section>

      {/* ------------------------------- cta ------------------------------- */}
      <section className="bg-ink">
        <div className="shell flex flex-col items-start gap-8 py-20 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="display text-[clamp(2.4rem,6vw,4.4rem)] text-white">
            Tell us about
            <br />
            <span className="italic">your space.</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="light" size="lg" href="/custom">
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
