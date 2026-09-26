import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { api, useAsync } from "../lib/api";
import { IMG } from "../lib/mock";
import { priceLabel } from "../lib/helpers";
import type { Product } from "../lib/types";
import { ProductTextPlate } from "../components/ProductCard";
import { ReviewQuote } from "../components/ReviewQuote";
import { useQuote, WhatsAppLink } from "../components/QuoteFlow";
import { Button, ErrorState, Marquee, Micro, Reveal, SectionHead, Skeleton, usePageMeta } from "../components/ui";

const HIGHLIGHTS = [
  ["Quality Craftsmanship", "Furniture created with attention to detail."],
  ["Modern Design", "Contemporary solutions for today's workplaces."],
  ["Durable Materials", "Designed for everyday professional use."],
  ["Custom Solutions", "Furniture tailored to individual spaces and requirements."],
  ["Professional Installation", "Support from production through installation where applicable."],
];

const WHY = [
  ["Quality", "Furniture made with attention to detail."],
  ["Durability", "Built for everyday professional use."],
  ["Modern Design", "Contemporary furniture designed for today's workplaces."],
  ["Customization", "Furniture solutions tailored to your requirements."],
  ["Comfort", "Ergonomic designs that support productive work environments."],
  ["Professional Service", "From consultation to production and delivery."],
];

const PROCESS = [
  ["01", "Consultation", "Understanding the client's needs."],
  ["02", "Design", "Developing the furniture concept."],
  ["03", "Material Selection", "Selecting suitable quality materials."],
  ["04", "Manufacturing", "Precision production and craftsmanship."],
  ["05", "Finishing", "Professional finishing and quality inspection."],
  ["06", "Delivery & Installation", "Getting the finished furniture into the customer's workspace."],
];

/* ------------------------------- hero --------------------------------- */
function Hero() {
  const reduce = useReducedMotion();
  const { open } = useQuote();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, -70]);
  const rise = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, delay, ease: [0.22, 0.61, 0.36, 1] as const },
  });

  return (
    <section className="relative overflow-hidden pt-[104px] sm:pt-[120px]">
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id="heroWave" clipPathUnits="objectBoundingBox">
            <path d="M0,0.09 C0.11,0.015 0.24,0.075 0.37,0.04 C0.5,0.005 0.63,0.085 0.77,0.05 C0.88,0.022 0.95,0.06 1,0.035 L1,0.925 C0.88,0.995 0.75,0.93 0.61,0.965 C0.47,1 0.34,0.93 0.2,0.965 C0.11,0.985 0.05,0.945 0,0.96 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="shell grid items-end gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <motion.div {...rise(0)} className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Micro className="text-ink">Office Furniture Manufacture</Micro>
            <span className="h-px w-8 bg-line" />
            <Micro>Port Harcourt · Rivers State · Nigeria</Micro>
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="display mt-6 text-[clamp(3rem,9vw,6.6rem)] text-ink"
          >
            <span className="block">Crafting Better</span>
            <span className="block pl-[7vw] italic sm:pl-[9vw]">Workspaces.</span>
          </motion.h1>

          <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
            <motion.p {...rise(0.16)} className="text-[16px] leading-relaxed text-mute md:col-span-7">
              Quality office furniture designed, manufactured and built for the way you work.
            </motion.p>
            <motion.div {...rise(0.24)} className="flex flex-wrap gap-3 md:col-span-5">
              <Button href="/products" size="lg" variant="ink">
                Explore Our Furniture
              </Button>
              <Button size="lg" variant="outline" href="/contact">
                Talk to LUCOMI
              </Button>
            </motion.div>
          </div>
        </div>

        {/* portrait */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[380px] pb-8 lg:col-span-5 lg:max-w-none lg:pb-0"
        >
          <div className="absolute -bottom-2 -right-3 left-6 top-8 rounded-t-[200px] rounded-b-3xl bg-ink" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-t-[200px] rounded-b-3xl border border-line">
            <img
              src={IMG.heroDirector}
              alt="LUCOMI ENTERPRISE — professional office furniture, designed and manufactured in Nigeria"
              className="aspect-[4/5] w-full object-cover object-top"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/55 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-[2] flex justify-end p-5 sm:p-6">
              <span className="micro max-w-[78%] text-right text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:max-w-[70%]">
                Designed & Manufactured in Nigeria
              </span>
            </div>
          </div>

          {/* rotating seal */}
          <div className="absolute -left-5 top-2 hidden h-28 w-28 sm:block lg:-left-10">
            <svg viewBox="0 0 120 120" className="h-full w-full animate-[spin_20s_linear_infinite]">
              <defs>
                <path id="heroSeal" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
              </defs>
              <circle cx="60" cy="60" r="58" fill="#1560E8" />
              <circle cx="60" cy="60" r="58" fill="none" stroke="#fff" strokeOpacity="0.25" />
              <text fill="#fff" fontSize="8.6" fontWeight="700" letterSpacing="2.6" fontFamily="Archivo, sans-serif">
                <textPath href="#heroSeal">QUALITY OFFICE FURNITURE • BETTER WORKSPACES • </textPath>
              </text>
            </svg>
            <BadgeCheck className="absolute inset-0 m-auto h-7 w-7 text-white" />
          </div>

          {/* floating card */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute -bottom-4 left-1 w-52 rounded-2xl bg-white p-4 plate-shadow-lg sm:-left-8"
          >
            <Micro className="text-ink">Visit the Factory</Micro>
            <p className="mt-1.5 text-[12.5px] leading-snug text-mute">
              #17 Ikezam Street, Ozuoba, Port Harcourt
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative mt-14 sm:mt-20"
      >
        <div className="shell relative">
          <button
            onClick={() => open("", "Quote Request")}
            className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_-16px_rgba(21,96,232,1)] transition-transform duration-200 hover:scale-[1.03]"
          >
            Start a Project
          </button>
          <div className="grain relative overflow-hidden" style={{ clipPath: "url(#heroWave)" }}>
            <motion.img
              style={reduce ? undefined : { y: heroY, scale: 1.12 }}
              src={IMG.hero}
              alt="Modern executive office with a walnut desk, ergonomic chair and storage credenza"
              className="h-[52vw] max-h-[560px] min-h-[260px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.7 }}
              className="absolute inset-x-0 bottom-[9%] max-w-2xl px-7 text-white sm:bottom-[12%] sm:px-12"
            >
              <p className="micro text-white/80">The LUCOMI approach</p>
              <p className="display mt-3 text-[clamp(2.1rem,5vw,4.6rem)] leading-[0.95] text-white">
                Where work takes shape.
              </p>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/85 sm:text-[15px]">
                Thoughtful furniture for the rooms where ideas, decisions and everyday work happen.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="shell mt-10 sm:mt-14">
        <ul className="rule grid grid-cols-2 gap-y-4 pt-5 md:grid-cols-4">
          {["Design & Manufacture", "Custom Built to Order", "Delivery & Installation", "Quotations on Request"].map(
            (item) => (
              <li key={item} className="micro text-mute">
                <span className="mr-2 text-royal">—</span>
                {item}
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------ featured ------------------------------ */
const PATTERN = ["photo", "photo", "photo", "photo", "photo", "photo"] as const;

const FEATURED_FALLBACKS: Record<string, string> = {
  "executive-desks": IMG.executiveDesk,
  workstations: IMG.workstations,
  "conference-tables": IMG.conference,
  "reception-desks": IMG.reception,
  "office-chairs": IMG.chair,
  storage: IMG.storage,
};

function featuredImage(product: Product) {
  return product.images?.[0] || FEATURED_FALLBACKS[product.category] || IMG.hero;
}

function MosaicPhoto({ product, delay }: { product: Product; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <Link
        to={`/products/${product.slug}`}
        className="group relative block h-full overflow-hidden rounded-xl bg-plate"
      >
        <img
          src={featuredImage(product)}
          alt={`${product.name} by LUCOMI ENTERPRISE`}
          loading="lazy"
          className="h-full min-h-[240px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <Micro className="text-white/70">{product.category.replace(/-/g, " ")}</Micro>
          <h3 className="display mt-2 text-[28px] leading-none text-white">{product.name}</h3>
          <p className="micro mt-3 text-white/75">{priceLabel(product)}</p>
        </div>
      </Link>
    </Reveal>
  );
}

function Featured() {
  const { data, loading, error, reload } = useAsync(() => api.products.featured());
  const items = (data ?? []).slice(0, 6);

  return (
    <section id="featured" className="shell scroll-mt-24 py-20 sm:py-28">
      <SectionHead
        index="Selected Works"
        title={
          <>
            Designed for
            <br />
            Modern Workspaces
          </>
        }
        intro="A selection from the LUCOMI catalogue — executive desks, workstations, conference tables and front-of-house furniture, all manufactured to order."
        action={
          <Button variant="outline" href="/products">
            View All Furniture <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
          ))}
        {error && <ErrorState message={error} onRetry={reload} />}
        {items.map((product, i) =>
          PATTERN[i % PATTERN.length] === "text" ? (
            <ProductTextPlate key={product.id} product={product} delay={i * 0.05} />
          ) : (
            <MosaicPhoto key={product.id} product={product} delay={i * 0.05} />
          ),
        )}
      </div>
    </section>
  );
}

/* ------------------------ browse by workspace ------------------------- */
function WorkspaceGuide() {
  const { data, loading, error, reload } = useAsync(() => api.categories.list());
  const priority = ["executive-desks", "workstations", "conference-tables", "reception-desks"];
  const featuredCategories = (data ?? [])
    .filter((category) => category.published && priority.includes(category.slug))
    .sort((a, b) => priority.indexOf(a.slug) - priority.indexOf(b.slug));

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="shell">
        <SectionHead
          index="Explore by Space"
          title={<>A Place for Every Kind of Work.</>}
          intro="Start with the room you are furnishing, then find the right pieces for the people who will use it."
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal variant="clip" className="relative overflow-hidden rounded-xl lg:col-span-7">
            <img
              src={IMG.conference}
              alt="Conference room furnished with a long walnut table and blue upholstered office chairs"
              loading="lazy"
              className="h-full min-h-[380px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <p className="display absolute bottom-7 left-7 max-w-sm text-[clamp(1.9rem,3.5vw,3rem)] leading-none text-white sm:bottom-10 sm:left-10">
              Spaces made to bring people together.
            </p>
          </Reveal>
          <div className="flex flex-col justify-center lg:col-span-5">
            <Micro className="mb-3 text-royal">Furniture by room</Micro>
            {loading && [0, 1, 2, 3].map((item) => <Skeleton key={item} className="my-2 h-20 w-full" />)}
            {error && <ErrorState message={error} onRetry={reload} />}
            {featuredCategories.map((category, index) => (
              <Reveal key={category.id} delay={index * 0.05}>
                <Link
                  to={`/products?category=${category.slug}`}
                  className="group flex items-center justify-between gap-5 border-t border-line py-5"
                >
                  <span className="flex min-w-0 items-baseline gap-4">
                    <span className="display text-[18px] italic text-royal">0{index + 1}</span>
                    <span className="display text-[clamp(1.7rem,2.7vw,2.2rem)] leading-none text-ink transition-colors group-hover:text-royal">
                      {category.name}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-royal transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
            <Link to="/products" className="micro mt-7 inline-flex items-center gap-2 self-start text-royal hover:text-ink">
              Explore the full catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- about -------------------------------- */
function AboutSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal variant="clip" className="lg:col-span-6">
          <div className="grain relative overflow-hidden rounded-xl">
            <img
              src={IMG.workshop}
              alt="Craftsmanship at the LUCOMI workshop — veneer panels, hand tools and finishing work"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-6">
          <Reveal>
            <Micro className="text-ink">About LUCOMI Enterprise</Micro>
            <h2 className="display mt-5 text-[clamp(2.6rem,6.5vw,4.8rem)]">
              Furniture Built
              <br />
              <span className="italic">for Business.</span>
            </h2>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-mute">
              LUCOMI ENTERPRISE specializes in designing and manufacturing functional, durable and stylish office
              furniture for professional environments — for individual professionals, growing businesses, corporate
              companies, institutions and complete workspace projects.
            </p>
          </Reveal>

          <ul className="mt-10">
            {HIGHLIGHTS.map(([title, text], i) => (
              <li key={title}>
                <Reveal delay={i * 0.06} className="rule grid grid-cols-[auto_1fr] gap-x-5 py-5">
                  <span className="display text-[18px] italic text-royal tnum">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-tight text-ink" style={{ fontFamily: "var(--font-sans)" }}>
                      {title}
                    </h3>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-mute">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal>
            <Button variant="outline" href="/about" className="mt-8">
              More About LUCOMI <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- why --------------------------------- */
function Why() {
  return (
    <section className="shell py-20 sm:py-28">
      <SectionHead
        index="Why LUCOMI"
        title={
          <>
            Why Businesses
            <br />
            Choose LUCOMI
          </>
        }
        intro="Furniture is a working investment. Everything we make is specified for everyday professional use and for the space it is going into."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WHY.map(([title, text], i) => (
          <Reveal key={title} delay={i * 0.05}>
            <article className="group h-full rounded-xl border border-line/70 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-ink/25 plate-shadow">
              <div className="flex items-baseline gap-3">
                <span className="display text-[17px] italic text-royal tnum">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-px flex-1 bg-line transition-colors group-hover:bg-royal/40" />
              </div>
              <h3 className="display mt-5 text-[30px]">{title}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-mute">{text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ process ------------------------------- */
function Process() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="shell">
        <SectionHead
          index="Manufacturing"
          title={
            <>
              From Concept
              <br />
              to <span className="italic">Workspace.</span>
            </>
          }
          intro="Every LUCOMI piece follows the same disciplined route — from the first conversation about your space through to installation on site."
          action={
            <Button variant="outline" href="/custom">
              Start a Custom Project
            </Button>
          }
        />
        <div className="mt-12 grid gap-x-16 md:grid-cols-2">
          {PROCESS.map(([n, title, text], i) => (
            <Reveal key={n} delay={(i % 2) * 0.06}>
              <div className="rule grid grid-cols-[auto_1fr] gap-x-6 py-7">
                <span className="display text-[26px] italic text-royal tnum">{n}</span>
                <div>
                  <h3 className="display text-[30px] leading-none">{title}</h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-mute">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- material story ----------------------------- */
function MaterialStory() {
  const materials = [
    ["01", "Veneer & texture", "Natural-looking surfaces and considered details that give an office its character."],
    ["02", "Everyday durability", "Laminate, steel and hardware selected to handle the working week."],
    ["03", "Finishes that fit", "Choose the tones and materials that work with your space."],
  ];

  return (
    <section className="shell py-20 sm:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Micro className="text-ink">Materials / Finishes</Micro>
          <h2 className="display mt-5 text-[clamp(2.6rem,5.5vw,4.5rem)]">
            The details you
            <br />
            <span className="italic">live with.</span>
          </h2>
          <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-mute">
            The surface you touch, the drawer that closes quietly, the finish that still looks good after a long day.
            These are the details a good workspace is built from.
          </p>
          <div className="mt-9">
            {materials.map(([number, title, description], index) => (
              <Reveal key={number} delay={index * 0.06}>
                <div className="flex gap-5 border-t border-line py-5">
                  <span className="display text-[19px] italic text-royal">{number}</span>
                  <div>
                    <h3 className="display text-[27px]">{title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-mute">{description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Button variant="outline" href="/custom" className="mt-7">
            Plan a custom piece <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <Reveal variant="clip" className="lg:col-span-6 lg:col-start-7">
          <img
            src={IMG.custom}
            alt="Material swatches, furniture drawings and finish samples arranged on a design table"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-xl object-cover"
          />
          <p className="micro mt-4 text-mute">Considered in the details / Made for your space</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------- custom band ----------------------------- */
function CustomBand() {
  return (
    <section className="shell py-20 sm:py-28">
      <div className="grid overflow-hidden rounded-xl bg-plate lg:grid-cols-2">
        <div className="grain relative min-h-[280px]">
          <img
            src={IMG.custom}
            alt="Veneer and laminate samples with technical drawings for a custom LUCOMI furniture project"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="p-8 sm:p-12 lg:p-14">
          <Micro className="text-ink">Custom Furniture</Micro>
          <h2 className="display mt-5 text-[clamp(2.4rem,5.5vw,4rem)]">Have a Space in Mind?</h2>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-mute">
            From executive offices to complete workplace setups, LUCOMI can create furniture solutions tailored to your
            space, style and business needs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/custom" size="lg">
              Start a Custom Project
            </Button>
            <WhatsAppLink message="Hello LUCOMI ENTERPRISE, I have a custom furniture project I would like to discuss." className="min-h-12 rounded-xl px-5">
              Talk to LUCOMI
            </WhatsAppLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ projects ------------------------------ */
function ProjectPreview() {
  const { data, loading } = useAsync(() => api.projects.list());
  const items = (data ?? []).filter((p) => p.published).slice(0, 3);

  return (
    <section className="shell pb-20 sm:pb-28">
      <SectionHead
        index="Projects"
        title={<>Workspace Projects</>}
        intro="Furniture packages delivered for offices, institutions and complete floors — from executive suites to open-plan workstations."
        action={
          <Button variant="outline" href="/projects">
            View Projects <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />)}
            {items.map((project, i) => (
          <Reveal key={project.id} delay={i * 0.07} variant={i === 1 ? "up" : "clip"}>
            <article className="group relative overflow-hidden rounded-xl bg-ink">
              <img
                src={project.images[0]}
                alt={`${project.name} — ${project.category} furnished by LUCOMI ENTERPRISE`}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <Micro className="text-white/65">{project.category}</Micro>
                <h3 className="display mt-2 text-[30px] leading-none text-white">{project.name}</h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-white/70">{project.location}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------- testimonials ---------------------------- */
function Testimonials() {
  const { data, loading, error, reload } = useAsync(() => api.testimonials.list());
  const items = (data ?? []).filter((item) => item.published).slice(0, 4);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="shell">
        <SectionHead
          index="Reviews"
          title={<>The experience, in their words.</>}
          intro="Feedback from businesses and organisations LUCOMI ENTERPRISE has furnished across Nigeria."
          action={<Button variant="outline" href="/reviews">Explore reviews <ArrowRight className="h-4 w-4" /></Button>}
        />
        {loading && <div className="mt-10 grid gap-8 md:grid-cols-2">{[0, 1].map((item) => <Skeleton key={item} className="h-56 rounded-lg" />)}</div>}
        {error && <div className="mt-10"><ErrorState message={error} onRetry={reload} /></div>}
        {!loading && !error && items.length === 0 && (
          <p className="mt-10 border-t border-line py-10 text-[15px] text-mute">No published reviews yet. Have a LUCOMI workspace? Share your experience.</p>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="mt-12 grid gap-x-16 gap-y-10 lg:grid-cols-2">
            {items.map((review, index) => (
              <Reveal key={review.id} delay={(index % 2) * 0.08}>
                <ReviewQuote review={review} featured={index === 0} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ sales CTA ----------------------------- */
function SalesCTA() {
  const { open } = useQuote();
  return (
    <section className="bg-ink">
      <div className="shell py-24 sm:py-32">
        <Reveal>
          <Micro className="text-white/50">Ready when you are</Micro>
          <h2 className="display mt-6 text-[clamp(3rem,10vw,7.5rem)] text-white">
            Let's Build
            <br />
            <span className="block pl-[8vw] italic">Your Workspace.</span>
          </h2>
          <p className="mt-8 max-w-lg text-[16px] leading-relaxed text-white/70">
            Tell us what you need and let LUCOMI create furniture that works for your business.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" variant="light" onClick={() => open("", "Quote Request")}>
              Request a Quote
            </Button>
            <WhatsAppLink message="Hello LUCOMI ENTERPRISE, I would like to discuss a furniture project." className="min-h-12 rounded-xl px-5">
              Contact Us
            </WhatsAppLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta(
    "LUCOMI ENTERPRISE — Quality Office Furniture, Better Workspaces",
    "LUCOMI ENTERPRISE designs and manufactures professional office furniture: executive desks, workstations, conference tables, reception desks, office chairs and storage, plus custom workspace projects in Port Harcourt, Nigeria.",
  );
  return (
    <>
      <Hero />
      <Marquee
        className="border-b border-line"
        items={[
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
        ]}
      />
      <Featured />
      <WorkspaceGuide />
      <AboutSection />
      <Why />
      <Process />
      <MaterialStory />
      <CustomBand />
      <ProjectPreview />
      <Testimonials />
      <SalesCTA />
    </>
  );
}
