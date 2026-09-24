import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { api, useAsync } from "../lib/api";
import { IMG } from "../lib/mock";
import { cn } from "../lib/helpers";
import type { Project } from "../lib/types";
import { Gallery } from "../components/Gallery";
import { useQuote } from "../components/QuoteFlow";
import { Accordion, Button, EmptyState, ErrorState, Marquee, Micro, Modal, Reveal, Skeleton, usePageMeta } from "../components/ui";

const CATEGORIES = [
  "All",
  "Corporate Offices",
  "Executive Offices",
  "Reception Areas",
  "Conference Rooms",
  "Workstations",
  "Government / Institutional Offices",
];

export default function Projects() {
  usePageMeta(
    "Projects & Portfolio — LUCOMI ENTERPRISE Workspace Furniture",
    "Corporate offices, executive offices, reception areas, conference rooms, workstations and institutional offices furnished by LUCOMI ENTERPRISE.",
  );
  const { data, loading, error, reload } = useAsync(() => api.projects.list());
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<Project | null>(null);
  const { open } = useQuote();

  const projects = useMemo(
    () =>
      (data ?? [])
        .filter((p) => p.published)
        .filter((p) => filter === "All" || p.category === filter),
    [data, filter],
  );

  return (
    <>
      <section className="shell pt-[120px] sm:pt-[150px]">
        <Micro className="text-ink">Projects & Portfolio</Micro>
        <h1 className="display mt-5 text-[clamp(3rem,10vw,7rem)]">
          Workspaces
          <span className="block pl-[6vw] italic">We've Built.</span>
        </h1>
        <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
          <p className="text-[16px] leading-relaxed text-mute md:col-span-6">
            Furniture packages for corporate offices, executive suites, reception areas, conference rooms, open-plan
            workstations and institutional offices. Every project follows the same route — survey, specification,
            production, delivery and installation.
          </p>
          <div className="md:col-span-5 md:col-start-8 md:flex md:justify-end">
            <Button onClick={() => open("", "Project Enquiry")}>Discuss Your Project</Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={cn(
                "rounded-full border px-4 py-2 text-[12.5px] transition-colors",
                filter === c ? "border-ink bg-ink text-white" : "border-line bg-white text-mute hover:border-ink/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="shell py-12 sm:py-16">
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
            ))}
          </div>
        )}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && projects.length === 0 && (
          <EmptyState title="No projects in this category" message="Try another category, or contact LUCOMI to discuss your project." />
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={(i % 3) * 0.06} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line/70 bg-white plate-shadow transition-all duration-300 hover:-translate-y-1">
                <button onClick={() => setActive(project)} className="relative block overflow-hidden bg-plate text-left">
                  <img
                    src={project.images[0]}
                    alt={`${project.name} — ${project.category} project by LUCOMI ENTERPRISE`}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <span className="micro absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[#0A2A5E]">
                    {project.category}
                  </span>
                  {project.placeholder && (
                    <span className="micro absolute right-4 top-4 rounded-full bg-ink/85 px-3 py-1.5 text-white">
                      Sample
                    </span>
                  )}
                </button>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="display text-[28px] leading-tight">{project.name}</h2>
                  <Micro className="mt-2">{project.location}</Micro>
                  <p className="mt-3 text-[14px] leading-relaxed text-mute">{project.description}</p>
                  <button
                    onClick={() => setActive(project)}
                    className="mt-5 inline-flex items-center gap-1.5 self-start text-[11.5px] font-semibold uppercase tracking-[0.08em] text-royal hover:text-ink"
                  >
                    View Gallery <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Marquee
        className="border-y border-line bg-white"
        items={[
          "Corporate Offices",
          "Executive Offices",
          "Reception Areas",
          "Conference Rooms",
          "Workstations",
          "Government / Institutional Offices",
        ]}
      />

      {/* ------------------------------- how we deliver ------------------------- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="shell">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-6">
              <Micro className="text-ink">Project Delivery</Micro>
              <h2 className="display mt-4 text-[clamp(2.4rem,6vw,4.4rem)]">
                How a Project
                <span className="block italic">Runs.</span>
              </h2>
            </div>
            <p className="text-[15px] leading-relaxed text-mute md:col-span-5 md:col-start-8">
              Whether it is one executive suite or a full corporate floor, the project follows the same route — with a
              quotation approved before anything enters production.
            </p>
          </div>

          <div className="mt-12 grid gap-x-14 md:grid-cols-2">
            {[
              ["Requirement Survey", "Space, headcount, storage needs and working style are established with you."],
              ["Layout & Specification", "Furniture is laid out, specified and priced against the agreed scope."],
              ["Quotation & Approval", "You receive a written quotation covering materials, quantities and schedule."],
              ["Production", "Panels, frames and upholstery are manufactured to the approved specification."],
              ["Quality Check", "Each piece is inspected and finished before it is packed for dispatch."],
              ["Delivery & Installation", "Goods are delivered to site, installed and handed over ready to use."],
            ].map(([title, text], i) => (
              <Reveal key={title} delay={(i % 2) * 0.06}>
                <div className="rule grid grid-cols-[auto_1fr] gap-x-6 py-7">
                  <span className="display text-[24px] italic text-royal tnum">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="display text-[29px] leading-none">{title}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-mute">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------- gallery ------------------------------ */}
      <section className="shell py-20 sm:py-28">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <Micro className="text-ink">Inside the Spaces</Micro>
            <h2 className="display mt-4 text-[clamp(2.4rem,6vw,4.4rem)]">
              Workspaces,
              <span className="block italic">Up Close.</span>
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed text-mute md:col-span-5 md:col-start-8">
            A closer look at the environments LUCOMI furniture is built for — meeting rooms, open-plan floors,
            front-of-house and private offices.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [IMG.conference, "Conference room table with executive seating"],
            [IMG.workstations, "Open-plan bench workstations with acoustic screens"],
            [IMG.reception, "Reception counter and waiting area seating"],
            [IMG.storage, "Storage cabinets and filing units"],
            [IMG.hero, "Executive office with walnut desk and ergonomic chair"],
            [IMG.chair, "Ergonomic mesh-back task chair"],
            [IMG.custom, "Veneer and laminate samples on the design bench"],
            [IMG.workshop, "Furniture manufacture and finishing in the workshop"],
          ].map(([src, alt], i) => (
            <Reveal key={src} delay={(i % 4) * 0.05} variant={i % 3 === 0 ? "clip" : "scale"}>
              <figure className="group overflow-hidden rounded-xl bg-plate">
                <img
                  src={src}
                  alt={`${alt} — LUCOMI ENTERPRISE`}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------- sectors ------------------------------ */}
      <section className="bg-white py-20 sm:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Micro className="text-ink">Sectors</Micro>
            <h2 className="display mt-5 text-[clamp(2.4rem,6vw,4.2rem)]">
              Who We
              <span className="block italic">Furnish.</span>
            </h2>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute">
              LUCOMI manufactures for organisations of every size — from a single professional's office to multi-floor
              corporate and institutional fit-outs, with the same workshop standards applied at every scale.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => open("", "Project Enquiry")}>Request a Quote</Button>
              <Button variant="outline" href="/products">
                Browse Furniture
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="grid gap-px overflow-hidden rounded-xl border border-line/70 bg-line sm:grid-cols-2">
              {[
                ["Corporate Offices", "Head offices, branch offices and shared workspaces."],
                ["Executive Offices", "Private offices with matching desk, credenza and seating."],
                ["Reception Areas", "Counters and waiting furniture for front-of-house."],
                ["Conference Rooms", "Boardroom tables, presentation units and seating."],
                ["Open-Plan Workstations", "Bench runs, screens and storage for larger teams."],
                ["Government / Institutional", "Durable administrative furniture for public institutions."],
              ].map(([title, text], i) => (
                <Reveal key={title} delay={i * 0.05} variant="scale">
                  <article className="h-full bg-paper p-6">
                    <span className="micro text-royal">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="display mt-3 text-[26px] leading-none">{title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-mute">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------- faq --------------------------------- */}
      <section className="shell py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Micro className="text-ink">Projects FAQ</Micro>
            <h2 className="display mt-5 text-[clamp(2.2rem,5vw,3.6rem)]">
              Planning a
              <span className="block italic">Fit-Out?</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-mute">
              Tell us the scope and we will come back with a layout, specification and quotation.
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion
              items={[
                {
                  q: "Do you work from an existing office layout?",
                  a: "Yes. Send your floor plan or room dimensions with your enquiry and LUCOMI will propose a furniture layout that fits it.",
                },
                {
                  q: "Can furniture be supplied in phases?",
                  a: "Yes — projects can be manufactured and delivered in stages so other site work can continue around the installation.",
                },
                {
                  q: "Do you furnish outside Port Harcourt?",
                  a: "Delivery arrangements are confirmed per project. Include your delivery location in the enquiry so it can be costed into the quotation.",
                },
                {
                  q: "Can I see furniture like this before ordering?",
                  a: "Yes — contact us to arrange a visit to the factory in Port Harcourt, or request photos and material samples of comparable completed work with your quotation.",
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-ink">
        <div className="shell flex flex-col items-start gap-8 py-20 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="display text-[clamp(2.4rem,6vw,4.4rem)] text-white">
            Have a project
            <br />
            <span className="italic">like this?</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="light" size="lg" onClick={() => open("", "Project Enquiry")}>
              Request a Quote
            </Button>
            <Button size="lg" variant="outline" className="border-white/35 text-white hover:bg-white hover:text-ink" href="/contact">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name ?? ""} wide>
        {active && (
          <div className="space-y-6">
            {active.placeholder && (
              <p className="micro rounded-lg border border-dashed border-line bg-plate px-4 py-3 text-ink">
                Sample project record — replace with a completed LUCOMI project
              </p>
            )}
            <Gallery images={active.images} alt={active.name} />
            <div>
              <Micro className="text-royal">{active.category}</Micro>
              <p className="mt-3 text-[15px] leading-relaxed text-mute">{active.description}</p>
              <p className="mt-3 text-[14px] text-charcoal">{active.location}</p>
            </div>
            <Button onClick={() => { setActive(null); open(active.name, "Project Enquiry"); }}>
              Enquire About a Similar Project
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
