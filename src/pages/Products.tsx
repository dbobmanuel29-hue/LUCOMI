import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api, useAsync } from "../lib/api";
import { cn } from "../lib/helpers";
import { searchProducts } from "../lib/search";
import { ProductCard } from "../components/ProductCard";
import { Accordion, Button, EmptyState, ErrorState, Micro, ProductSkeleton, Reveal, Select, usePageMeta } from "../components/ui";

type Sort = "name" | "newest" | "category";

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState<Sort>("name");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = params.get("category") ?? "";
  const query = params.get("q") ?? "";
  const products = useAsync(() => api.products.list());
  const categories = useAsync(() => api.categories.list());

  usePageMeta(
    "Office Furniture Catalogue — LUCOMI ENTERPRISE",
    "Browse LUCOMI office furniture: executive desks, office desks, reception desks, conference tables, office chairs, workstations, filing cabinets, office storage and custom furniture.",
  );

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params);
    // Choosing a category starts a fresh browse, rather than filtering an old search.
    next.delete("q");
    if (slug) next.set("category", slug);
    else next.delete("category");
    setParams(next, { replace: true });
  };

  const setQuery = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value);
    else next.delete("q");
    // A new search is across the entire catalogue, not a hidden category.
    next.delete("category");
    setFeaturedOnly(false);
    setParams(next, { replace: true });
  };

  const reset = () => {
    setFeaturedOnly(false);
    setParams(new URLSearchParams(), { replace: true });
  };

  const filtered = useMemo(() => {
    const all = (products.data ?? []).filter((p) => p.published);
    const list = searchProducts(all, query).filter((p) => {
      const matchesCategory = !category || p.category === category;
      const matchesFeatured = !featuredOnly || p.featured;
      return matchesCategory && matchesFeatured;
    });
    return [...list].sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "category") return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });
  }, [products.data, query, category, featuredOnly, sort]);

  const activeCategoryName =
    (categories.data ?? []).find((c) => c.slug === category)?.name ?? "All Furniture";

  return (
    <>
      <section className="shell pt-[120px] sm:pt-[150px]">
        <Micro className="text-ink">Product Catalogue</Micro>
        <h1 className="display mt-5 text-[clamp(2.8rem,9vw,6.4rem)]">
          Furniture for Every
          <span className="block pl-[5vw] italic">Working Space.</span>
        </h1>
        <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
          <p className="text-[16px] leading-relaxed text-mute md:col-span-5">
            Browse the LUCOMI range — executive desks, workstations, conference tables, seating, reception furniture and
            storage. Every piece is manufactured to order and quoted for your requirements.
          </p>
          <p className="micro text-mute md:col-span-3 md:col-start-10 md:text-right" aria-live="polite">
            {products.loading ? "Loading catalogue…" : `${filtered.length} of ${(products.data ?? []).length} products`}
          </p>
        </div>
      </section>

      <div className="sticky top-[72px] z-40 mt-12 border-y border-line bg-paper/95 backdrop-blur-md">
      <section className="shell py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  document.getElementById("catalog-results")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              placeholder="Search desks, chairs, workstations…"
              className="w-full rounded-full border border-line bg-white py-3.5 pl-11 pr-11 text-[15px] placeholder:text-mute/60 focus:border-royal focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-mute hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink lg:hidden"
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <label className="sr-only" htmlFor="sort-products">
              Sort products
            </label>
            <Select
              id="sort-products"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="py-3.5 text-[13px]"
            >
              <option value="name">Sort: Name A–Z</option>
              <option value="newest">Sort: Newest</option>
              <option value="category">Sort: Category</option>
            </Select>
          </div>
        </div>

        <div
          className={cn(
            "no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0",
            filtersOpen ? "flex" : "hidden",
          )}
        >
          <button
            onClick={() => setCategory("")}
            className={cn(
              "rounded-full border px-4 py-2 text-[12.5px] transition-colors",
              !category ? "border-ink bg-ink text-white" : "border-line bg-white text-mute hover:border-ink/40",
            )}
          >
            All Furniture
          </button>
          {(categories.data ?? []).map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={cn(
                "rounded-full border px-4 py-2 text-[12.5px] transition-colors",
                category === c.slug ? "border-ink bg-ink text-white" : "border-line bg-white text-mute hover:border-ink/40",
              )}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={() => setFeaturedOnly((v) => !v)}
            aria-pressed={featuredOnly}
            className={cn(
              "rounded-full border px-4 py-2 text-[12.5px] transition-colors",
              featuredOnly ? "border-royal bg-royal text-white" : "border-line bg-white text-mute hover:border-ink/40",
            )}
          >
            Featured
          </button>
        </div>
      </section>
      </div>

      <section id="catalog-results" className="shell scroll-mt-[215px] py-12 sm:py-16">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="display text-[34px] sm:text-[44px]">
            {query.trim() ? `Results for “${query.trim()}”` : activeCategoryName}
          </h2>
          {(category || featuredOnly || query) && (
            <button onClick={reset} className="micro text-royal hover:text-ink">
              Reset filters
            </button>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.loading && Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
          {products.error && <ErrorState message={products.error} onRetry={products.reload} />}
          {!products.loading &&
            !products.error &&
            filtered.length === 0 &&
            ((products.data ?? []).length === 0 ? (
              <EmptyState
                title="No products available yet"
                message="The catalogue is being prepared. Contact LUCOMI directly and we will help you find what you need."
              />
            ) : (
              <EmptyState
                title="No products found"
                message="Try another search or category."
                action={
                  <Button variant="outline" size="sm" onClick={reset}>
                    Clear filters
                  </Button>
                }
              />
            ))}
          {!products.loading &&
            !products.error &&
            filtered.map((product, i) => <ProductCard key={product.id} product={product} delay={(i % 3) * 0.05} />)}
        </div>
      </section>

      {/* -------------------------- browse by category ------------------------- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="shell">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-6">
              <Micro className="text-ink">Browse by Category</Micro>
              <h2 className="display mt-4 text-[clamp(2.4rem,6vw,4.4rem)]">The Full Range</h2>
            </div>
            <p className="text-[15px] leading-relaxed text-mute md:col-span-5 md:col-start-8">
              Ten product families covering private offices, open-plan floors and front-of-house. Select a category to
              filter the catalogue above.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(categories.data ?? []).map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 0.06} variant="scale">
                <button
                  onClick={() => {
                    setCategory(c.slug);
                    document.getElementById("catalog-results")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group block w-full overflow-hidden rounded-xl border border-line/70 bg-paper text-left transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="relative block overflow-hidden bg-plate">
                    <img
                      src={c.image}
                      alt={`${c.name} — LUCOMI ENTERPRISE office furniture`}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/15" />
                  </span>
                  <span className="block p-6">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="display text-[27px] leading-none">{c.name}</span>
                      <span className="micro text-royal">{String(i + 1).padStart(2, "0")}</span>
                    </span>
                    <span className="mt-3 block text-[14px] leading-relaxed text-mute">{c.description}</span>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- by workspace ---------------------------- */}
      <section className="shell py-20 sm:py-28">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <Micro className="text-ink">Shop by Workspace</Micro>
            <h2 className="display mt-4 text-[clamp(2.4rem,6vw,4.4rem)]">
              Furniture by
              <span className="block italic">Where It Sits.</span>
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed text-mute md:col-span-5 md:col-start-8">
            Not sure what you need? Start from the room — most clients outfit their space in one of these four ways.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            ["Executive Offices", "Executive desk, matching credenza, visitor seating and secure storage in coordinated finishes."],
            ["Reception & Front of House", "Reception counter with transaction top, waiting lounge seating and display storage."],
            ["Meeting & Conference Rooms", "Boardroom table with integrated power and data, executive seating and wall storage."],
            ["Open-Plan Floors", "Bench workstations, acoustic screens, task chairs, pedestal and shared storage runs."],
          ].map(([title, text], i) => (
            <Reveal key={title} delay={i * 0.06} variant={i % 2 ? "right" : "left"}>
              <article className="group flex h-full flex-col justify-between rounded-xl bg-plate p-7 transition-colors duration-300 hover:bg-white sm:p-9">
                <div>
                  <span className="display text-[22px] italic text-royal tnum">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="display mt-4 text-[clamp(1.9rem,3vw,2.6rem)] leading-none">{title}</h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-mute">{text}</p>
                </div>
                <span className="micro mt-7 inline-flex items-center gap-2 text-royal">
                  Explore these products <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------- pricing ------------------------------ */}
      <section className="bg-white">
        <div className="shell grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Micro className="text-ink">Pricing</Micro>
            <h2 className="display mt-5 text-[clamp(2.4rem,6vw,4.2rem)]">
              Price on
              <span className="block italic">Request.</span>
            </h2>
            <p className="mt-6 text-[15.5px] leading-relaxed text-mute">
              Office furniture pricing depends on size, material, finish and quantity, so LUCOMI quotes each requirement
              rather than publishing fixed prices. When a product has no published price you will see{" "}
              <strong className="text-charcoal">Price on Request</strong> or{" "}
              <strong className="text-charcoal">Contact for Price</strong> — never a placeholder figure.
            </p>
            <Button className="mt-7" size="lg" onClick={() => open("", "Quote Request")}>
              Request a Quote
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {[
              ["Tell us the requirements", "Product, quantity, sizes, preferred finish and delivery location."],
              ["We prepare a quotation", "Costs are worked from materials, production time and delivery."],
              ["Confirm and approve", "You approve the quotation before anything goes into production."],
              ["Manufactured for you", "Your order is made, finished, inspected and scheduled for delivery."],
            ].map(([title, text], i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="h-full rounded-xl border border-line/70 bg-paper p-6">
                  <span className="display text-[20px] italic text-royal tnum">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="display mt-3 text-[26px] leading-none">{title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-mute">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- faq --------------------------------- */}
      <section className="shell py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Micro className="text-ink">Buying Furniture</Micro>
            <h2 className="display mt-5 text-[clamp(2.2rem,5vw,3.6rem)]">
              Before You
              <span className="block italic">Order.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-mute">
              Questions we are usually asked before a quotation is prepared.
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion
              items={[
                {
                  q: "Are prices shown on the website?",
                  a: "Only where an administrator has published one. Most products display Price on Request or Contact for Price because each order is quoted against its own specification, quantity and finish.",
                },
                {
                  q: "Can I order a different size or finish?",
                  a: "Yes. Almost every product can be produced in alternate sizes, veneers or laminates. Use the Request a Quote button on the product page and tell us the size and finish you need.",
                },
                {
                  q: "What is the minimum order quantity?",
                  a: "There is no minimum — a single desk can be ordered on the same terms as a full floor. Project pricing is available for larger quantities.",
                },
                {
                  q: "How do I know which chair or desk suits my team?",
                  a: "Send us the space type, number of positions and how the team works. We will suggest a configuration and include it in your quotation.",
                },
                {
                  q: "Can you match existing office furniture?",
                  a: "Where possible, yes. Share a photo or the finish description and we will advise on the closest veneer or laminate match during quotation.",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* -------------------------------- cta --------------------------------- */}
      <section className="bg-ink">
        <div className="shell flex flex-col items-start gap-8 py-20 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="display text-[clamp(2.4rem,6vw,4.4rem)] text-white">
            Need a quotation
            <br />
            <span className="italic">for your office?</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="light" size="lg" onClick={() => open("", "Quote Request")}>
              Request a Quote
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/35 text-white hover:bg-white hover:text-ink"
              href="/custom"
            >
              Start a Custom Project
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
