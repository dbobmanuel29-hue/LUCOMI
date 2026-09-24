import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "../lib/helpers";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoom && e.key === "Escape") return setZoom(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, zoom]);

  if (!images.length) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-line bg-plate">
        <p className="micro text-mute">No images available yet</p>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        key={index}
        initial={{ opacity: 0.4, scale: 1.015 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative overflow-hidden rounded-xl border border-line/70 bg-plate plate-shadow"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(delta) > 45) go(delta < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <img
          src={images[index]}
          alt={`${alt} — view ${index + 1} of ${images.length}`}
          className="aspect-[4/3] w-full object-cover"
        />
        <button
          onClick={() => setZoom(true)}
          aria-label="Zoom image"
          className="absolute right-4 top-4 rounded-full bg-white/90 p-2.5 text-[#0A2A5E] transition-colors hover:bg-white"
        >
          <Expand className="h-4 w-4" />
        </button>
        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2.5 text-[#0A2A5E] transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2.5 text-[#0A2A5E] transition-colors hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <span className="micro absolute bottom-4 left-4 rounded-full bg-ink/80 px-3 py-1.5 text-white tnum">
          {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
      </motion.div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-16 w-20 overflow-hidden rounded-lg border transition-all sm:h-20 sm:w-28",
                i === index ? "border-royal ring-1 ring-royal/40" : "border-line opacity-65 hover:opacity-100",
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/92 p-4"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-label="Zoomed product image"
        >
          <img src={images[index]} alt={`${alt} — enlarged view`} className="max-h-full max-w-full object-contain" />
          <button
            className="micro absolute bottom-8 rounded-full border border-white/30 px-5 py-2.5 text-white"
            onClick={() => setZoom(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
