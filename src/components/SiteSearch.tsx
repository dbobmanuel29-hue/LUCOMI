import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { api } from "../lib/api";
import { searchProducts } from "../lib/search";
import type { Product } from "../lib/types";
import { Micro, Skeleton } from "./ui";

export function SiteSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(false);
    setQuery("");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    api.products
      .list()
      .then((data) => active && setProducts(data.filter((p) => p.published)))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      active = false;
      window.removeEventListener("keydown", escape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const matches = query.trim() ? searchProducts(products, query).slice(0, 5) : [];
  const searchAll = () => {
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : "/products");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Search LUCOMI furniture">
          <motion.button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 w-full cursor-default bg-ink/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative max-h-[min(85dvh,760px)] overflow-y-auto border-b border-line bg-paper shadow-2xl"
          >
            <div className="shell py-7 sm:py-11">
              <div className="flex items-center justify-between gap-5">
                <Micro className="text-ink">Find your furniture</Micro>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-plate"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form
                role="search"
                className="mt-6 flex items-center gap-3 border-b border-ink/25 pb-4 focus-within:border-royal"
                onSubmit={(event) => {
                  event.preventDefault();
                  searchAll();
                }}
              >
                <Search className="h-6 w-6 shrink-0 text-royal" />
                <input
                  ref={inputRef}
                  type="search"
                  aria-label="Search product name, category or material"
                  placeholder="Try executive desk, chair, walnut..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[clamp(1.25rem,3vw,2rem)] text-charcoal outline-none placeholder:text-mute/60"
                />
                <button
                  type="submit"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-royal"
                  aria-label="See all search results"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              <div className="mt-8 min-h-28" aria-live="polite">
                {loading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full rounded-lg" />)}
                  </div>
                )}
                {!loading && error && <p className="text-sm text-mute">Search could not load. Please try again.</p>}
                {!loading && !error && !query.trim() && (
                  <>
                    <Micro>Popular searches</Micro>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {["Executive desks", "Office chairs", "Workstations", "Conference tables"].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setQuery(term)}
                          className="rounded-full border border-line bg-white px-4 py-2 text-[13px] text-charcoal transition-colors hover:border-royal"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {!loading && !error && query.trim() && (
                  <>
                    <Micro>{matches.length ? "Matching furniture" : "No products found"}</Micro>
                    {matches.length ? (
                      <ul className="mt-3 divide-y divide-line">
                        {matches.map((product) => (
                          <li key={product.id}>
                            <Link
                              to={`/products/${product.slug}`}
                              onClick={onClose}
                              className="group flex items-center gap-4 py-3 transition-colors hover:text-royal"
                            >
                              <img
                                src={product.images[0]}
                                alt=""
                                className="h-15 w-20 rounded-md object-cover"
                                loading="lazy"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-display text-[23px] leading-none text-ink group-hover:text-royal">
                                  {product.name}
                                </span>
                                <span className="micro mt-1.5 block text-mute">{product.category.replace(/-/g, " ")}</span>
                              </span>
                              <ArrowRight className="h-4 w-4 shrink-0 text-royal transition-transform group-hover:translate-x-1" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-mute">Try a different product, category or material.</p>
                    )}
                    <button
                      type="button"
                      onClick={searchAll}
                      className="micro mt-5 inline-flex items-center gap-2 text-royal hover:text-ink"
                    >
                      View the catalogue <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}