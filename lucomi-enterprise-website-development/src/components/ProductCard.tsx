import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";
import { priceLabel, productEnquiryMessage, waLink } from "../lib/helpers";
import type { Product } from "../lib/types";
import { useQuote } from "./QuoteFlow";
import { Button, Micro, Reveal } from "./ui";

export function ProductCard({ product, delay = 0 }: { product: Product; delay?: number }) {
  const { open } = useQuote();

  return (
    <Reveal delay={delay} className="group h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line/70 bg-white plate-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(10,42,94,0.05),0_30px_60px_-32px_rgba(10,42,94,0.45)]">
        <Link to={`/products/${product.slug}`} className="relative block overflow-hidden bg-plate">
          <img
            src={product.images[0]}
            alt={`${product.name} — ${product.shortDescription}`}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0A2A5E]">
            {product.category.replace(/-/g, " ")}
          </span>
        </Link>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <Link to={`/products/${product.slug}`}>
            <h3 className="display text-[26px] leading-tight transition-colors group-hover:text-royal sm:text-[28px]">
              {product.name}
            </h3>
          </Link>
          <p className="mt-2.5 line-clamp-2 text-[14px] leading-relaxed text-mute">{product.shortDescription}</p>

          <div className="mt-5 flex items-center gap-2">
            <span className="h-px w-5 bg-line" />
            <Micro className="text-ink">{priceLabel(product)}</Micro>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 pt-1">
            <Button
              variant="ink"
              size="sm"
              href={waLink(productEnquiryMessage(product.name))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" /> Quote
            </Button>
            <Button variant="outline" size="sm" onClick={() => open(product.name, "Product Enquiry")}>
              Enquire
            </Button>
            <Link
              to={`/products/${product.slug}`}
              className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-royal"
            >
              View Details
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/** Editorial "text plate" used between photo plates in the featured mosaic. */
export function ProductTextPlate({ product, delay = 0 }: { product: Product; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <Link
        to={`/products/${product.slug}`}
        className="flex h-full flex-col justify-between rounded-xl bg-plate p-6 transition-colors duration-300 hover:bg-white sm:p-8"
      >
        <div>
          <Micro>{product.category.replace(/-/g, " ")}</Micro>
          <h3 className="display mt-4 text-[30px] leading-[0.95] sm:text-[34px]">{product.name}</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-mute">{product.shortDescription}</p>
        </div>
        <div className="mt-8">
          <p className="display text-[26px] text-ink">{priceLabel(product)}</p>
          <Micro className="mt-2">{product.variations[0] ?? "Made to order"}</Micro>
        </div>
      </Link>
    </Reveal>
  );
}
