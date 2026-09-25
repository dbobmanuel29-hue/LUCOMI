import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Send } from "lucide-react";
import { api, useAsync } from "../lib/api";
import { priceLabel, productEnquiryMessage } from "../lib/helpers";
import { Gallery } from "../components/Gallery";
import { ProductCard } from "../components/ProductCard";
import { useQuote, WhatsAppLink } from "../components/QuoteFlow";
import { Button, EmptyState, ErrorState, Micro, Reveal, SectionHead, Skeleton } from "../components/ui";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const product = useAsync(() => api.products.bySlug(slug), [slug]);
  const related = useAsync(() => api.products.related(slug, 3), [slug]);
  const { open } = useQuote();
  const [tab, setTab] = useState<"features" | "materials" | "dimensions">("features");

  const p = product.data;

  useEffect(() => {
    if (!p) return;
    document.title = `${p.name} — ${p.category.replace(/-/g, " ")} | LUCOMI ENTERPRISE`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", p.shortDescription);
  }, [p]);

  if (product.loading) {
    return (
      <section className="shell grid gap-10 pt-[120px] lg:grid-cols-12">
        <Skeleton className="aspect-[4/3] rounded-xl lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </section>
    );
  }

  if (product.error) {
    return (
      <section className="shell pt-[140px] pb-24">
        <ErrorState message={product.error} onRetry={product.reload} />
      </section>
    );
  }

  if (!p) {
    return (
      <section className="shell pt-[140px] pb-24">
        <EmptyState
          title="Product not found"
          message="This product may have been unpublished. Browse the full catalogue instead."
          action={
            <Button variant="outline" href="/products">
              Back to Products
            </Button>
          }
        />
      </section>
    );
  }

  const message = productEnquiryMessage(p.name);

  return (
    <>
      <article className="shell pt-[110px] sm:pt-[130px]">
        <Link to="/products" className="micro inline-flex items-center gap-2 text-mute hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> All Furniture
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Gallery images={p.images} alt={p.name} />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[110px]">
              <Micro className="text-royal">{p.category.replace(/-/g, " ")}</Micro>
              <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4rem)]">{p.name}</h1>
              <p className="mt-5 text-[16px] leading-relaxed text-mute">{p.shortDescription}</p>

              <div className="mt-7 flex flex-wrap items-center gap-3 border-y border-line py-5">
                <span className="display text-[30px] text-ink">{priceLabel(p)}</span>
                <span className="text-[12.5px] text-mute">
                  {p.priceVisibility === "visible" ? "Published price" : "Quoted for your requirements"}
                </span>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => open(p.name, "Quote Request")}>
                  Request a Quote
                </Button>
                <WhatsAppLink message={message} className="min-h-12 rounded-xl px-5">
                  WhatsApp Us
                </WhatsAppLink>
              </div>

              <div className="mt-8 rounded-xl border border-line/70 bg-white p-6">
                <div className="flex flex-wrap gap-2">
                  {(["features", "materials", "dimensions"] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={`micro rounded-full px-4 py-2 transition-colors ${
                        tab === key ? "bg-ink text-white" : "text-mute hover:text-ink"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <div className="mt-5 text-[14.5px] leading-relaxed text-charcoal">
                  {tab === "features" && (
                    <ul className="space-y-2.5">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-3">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {tab === "materials" && <p>{p.materials}</p>}
                  {tab === "dimensions" && <p className="tnum">{p.dimensions}</p>}
                </div>
              </div>

              {p.variations.length > 0 && (
                <div className="mt-6">
                  <Micro className="text-ink">Options & Variations</Micro>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.variations.map((v) => (
                      <span key={v} className="rounded-full border border-line bg-plate px-4 py-2 text-[12.5px] text-charcoal">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Reveal className="mt-16 grid gap-10 border-t border-line pt-12 lg:grid-cols-12">
          <h2 className="display text-[clamp(2rem,4.5vw,3.2rem)] lg:col-span-4">About this product</h2>
          <div className="lg:col-span-7 lg:col-start-6">
            <p className="text-[16px] leading-relaxed text-mute">{p.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="ink" onClick={() => open(p.name, "Product Enquiry")}>
                <Send className="h-4 w-4" /> Send a Product Enquiry
              </Button>
              <WhatsAppLink message={message} className="min-h-12 rounded-xl px-5">
                Chat on WhatsApp
              </WhatsAppLink>
            </div>
          </div>
        </Reveal>
      </article>

      <section className="shell py-20 sm:py-24">
        <SectionHead
          index="Related"
          title={<>You May Also Like</>}
          intro="Other furniture from the LUCOMI catalogue that is often specified alongside this piece."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-xl" />)}
          {(related.data ?? []).map((item, i) => (
            <ProductCard key={item.id} product={item} delay={i * 0.05} />
          ))}
        </div>
      </section>
    </>
  );
}
