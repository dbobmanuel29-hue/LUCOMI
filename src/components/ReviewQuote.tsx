import { Star } from "lucide-react";
import type { Testimonial } from "../lib/types";
import { cn } from "../lib/helpers";
import { Micro } from "./ui";

export function ReviewQuote({ review, featured = false }: { review: Testimonial; featured?: boolean }) {
  return (
    <figure className={cn("flex h-full flex-col justify-between border-t border-line pt-7", featured && "lg:pr-12")}>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Micro className="text-royal">{review.product || "Customer feedback"}</Micro>
          {typeof review.rating === "number" && (
            <div className="flex items-center gap-1 text-royal" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={cn("h-3.5 w-3.5", index < review.rating! && "fill-current")} />
              ))}
            </div>
          )}
        </div>
        <blockquote
          className={cn(
            "display mt-7 leading-[1.12] text-ink",
            featured ? "text-[clamp(1.7rem,3.6vw,3.1rem)]" : "text-[24px] sm:text-[30px]",
          )}
        >
          “{review.content}”
        </blockquote>
      </div>
      <figcaption className="mt-9 flex items-center gap-4">
        {review.image ? (
          <img
            src={review.image}
            alt={`${review.customerName}`}
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-line"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink font-display text-2xl text-white"
          >
            {review.customerName.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="text-[13px] font-semibold text-charcoal">{review.customerName}</p>
          <p className="text-[12px] text-mute">{review.company || "Customer"}</p>
        </div>
      </figcaption>
    </figure>
  );
}
