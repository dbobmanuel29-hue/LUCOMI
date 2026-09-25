import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { cn } from "../lib/helpers";

/* ------------------------------- motion ------------------------------- */
type RevealVariant = "up" | "clip" | "scale" | "left" | "right";

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  variant = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  variant?: RevealVariant;
}) {
  const reduce = useReducedMotion();

  const variants: Record<RevealVariant, { initial: any; whileInView: any }> = {
    up: reduce
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
      : { initial: { opacity: 0, y }, whileInView: { opacity: 1, y: 0 } },
    clip: reduce
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
      : {
          initial: { opacity: 0, clipPath: "inset(14% 14% 14% 14% round 14px)" },
          whileInView: { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 14px)" },
        },
    scale: reduce
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
      : { initial: { opacity: 0, scale: 0.94 }, whileInView: { opacity: 1, scale: 1 } },
    left: reduce
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
      : { initial: { opacity: 0, x: -34 }, whileInView: { opacity: 1, x: 0 } },
    right: reduce
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
      : { initial: { opacity: 0, x: 34 }, whileInView: { opacity: 1, x: 0 } },
  };

  const { initial, whileInView } = variants[variant];

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Infinite ticker — pauses on hover, stops for reduced motion. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={cn("relative overflow-hidden py-4", className)} aria-hidden="true">
      <div className="marquee-track flex w-max items-center gap-8">
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-8 whitespace-nowrap">
            <span className="micro text-mute">{item}</span>
            <span className="text-royal">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Animated disclosure used for FAQ / process details. */
export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="rule">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-6 py-5 text-left"
            >
              <span
                className={cn(
                  "text-[17px] font-semibold tracking-tight transition-colors sm:text-[18px]",
                  isOpen ? "text-royal" : "text-charcoal hover:text-royal",
                )}
              >
                {item.q}
              </span>
              <span
                className={cn(
                  "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line transition-transform duration-300",
                  isOpen && "rotate-45 border-royal",
                )}
                aria-hidden="true"
              >
                <span className="text-royal">+</span>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-6 pr-10 text-[15px] leading-relaxed text-mute">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------- type --------------------------------- */
export function Micro({ children, className }: { children: React.ReactNode; className?: string }) {
  // Only apply the default muted colour when the caller has not set one.
  const hasColor = className?.includes("text-");
  return <p className={cn("micro", !hasColor && "text-mute", className)}>{children}</p>;
}

export function SectionHead({
  index,
  title,
  intro,
  action,
  tone = "ink",
}: {
  index?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "ink" | "light";
}) {
  return (
    <Reveal y={18} className="grid gap-8 md:grid-cols-12 md:items-end">
      <div className="md:col-span-6">
        {index && (
          <Micro className={cn("mb-4", tone === "light" && "text-white/60")}>
            <span className="font-display italic normal-case tracking-normal text-[15px]">{index}</span>
            <span className="mx-2">—</span>
            {index && "LUCOMI ENTERPRISE"}
          </Micro>
        )}
        <h2
          className={cn(
            "display text-[clamp(2.4rem,6vw,4.4rem)]",
            tone === "light" && "text-white",
          )}
        >
          {title}
        </h2>
      </div>
      {(intro || action) && (
        <div className="md:col-span-5 md:col-start-8">
          {intro && (
            <p className={cn("text-[15px] leading-relaxed", tone === "light" ? "text-white/75" : "text-mute")}>
              {intro}
            </p>
          )}
          {action && <div className="mt-6">{action}</div>}
        </div>
      )}
    </Reveal>
  );
}

/* ------------------------------ buttons ------------------------------- */
type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "ink" | "outline" | "ghost" | "light";
  size?: "md" | "lg" | "sm";
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  full?: boolean;
  target?: string;
  rel?: string;
  "aria-label"?: string;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  href,
  onClick,
  type = "button",
  disabled,
  full,
  ...rest
}: ButtonProps) {
  const base =
    "group inline-flex items-center justify-center gap-2.5 rounded-md font-sans font-semibold tracking-[0.035em] uppercase transition-all duration-200 ease-out active:scale-[0.99] disabled:opacity-55 disabled:pointer-events-none";
  const sizes = {
    sm: "text-[11px] px-5 py-2.5",
    md: "text-[11.5px] px-6 py-3.5",
    lg: "text-[12px] px-8 py-4.5",
  };
  const variants = {
    primary: "bg-royal text-white hover:bg-royal-dark hover:shadow-[0_10px_24px_-16px_rgba(23,50,77,0.45)]",
    ink: "bg-ink text-white hover:bg-ink-deep hover:shadow-[0_10px_24px_-16px_rgba(23,50,77,0.45)]",
    outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-white",
    ghost: "text-ink hover:bg-ink/5",
    light: "bg-white text-[#17324D] hover:bg-paper-deep",
  };
  const cls = cn(base, sizes[size], variants[variant], full && "w-full", className);

  // Internal routes go through the router so the SPA never reloads.
  if (href && (href.startsWith("/") || href.startsWith("#"))) {
    return (
      <RouterLink to={href} className={cls} {...rest}>
        {children}
      </RouterLink>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------ states -------------------------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-plate", className)} />;
}

export function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function EmptyState({
  title = "No products found",
  message = "Try another search or category.",
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-line bg-plate px-8 py-16 text-center">
      <svg viewBox="0 0 48 48" className="mx-auto mb-5 h-10 w-10 text-mute/50" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="6" y="14" width="36" height="24" rx="2" />
        <path d="M6 22h36M16 14V8h16v6" />
      </svg>
      <h3 className="display text-3xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-mute">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-royal/20 bg-white px-8 py-12 text-center">
      <h3 className="display text-3xl">Something went wrong</h3>
      <p className="mt-2 text-sm text-mute">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Notice({
  tone = "success",
  title,
  children,
}: {
  tone?: "success" | "info" | "warn";
  title: string;
  children?: React.ReactNode;
}) {
  const tones = {
    success: "border-ink/15 bg-white",
    info: "border-royal/25 bg-royal/5",
    warn: "border-ink/15 bg-plate",
  };
  return (
    <div className={cn("rounded-xl border px-6 py-5", tones[tone])} role="status">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 inline-block h-2 w-2 shrink-0 rounded-full",
            tone === "info" ? "bg-royal" : "bg-ink",
          )}
        />
        <div>
          <p className="micro text-ink">{title}</p>
          {children && <div className="mt-2 text-sm leading-relaxed text-mute">{children}</div>}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- seo --------------------------------- */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const set = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement(selector.startsWith("meta") ? "meta" : "link");
        const key = selector.match(/(name|property)="([^"]+)"/);
        if (key) el.setAttribute(key[1], key[2]);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };
    set('meta[name="description"]', "content", description);
    set('meta[property="og:title"]', "content", title);
    set('meta[property="og:description"]', "content", description);
    set('meta[property="og:type"]', "content", "website");
    set('meta[property="og:url"]', "content", window.location.href.split("?")[0]);
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href.split("?")[0];
  }, [title, description]);
}

/* ------------------------------- forms -------------------------------- */
export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const id = React.useId();
  return (
    <label className={cn("block", className)} htmlFor={id}>
      <span className="micro text-ink">
        {label}
        {required && <span className="text-royal"> *</span>}
      </span>
      {hint && <span className="ml-2 text-[11px] normal-case tracking-normal text-mute">{hint}</span>}
      <div className="mt-2">{React.cloneElement(children as React.ReactElement<{ id?: string }>, { id })}</div>
    </label>
  );
}

const controlCls =
  "w-full rounded-lg border border-line bg-white px-4 py-3 text-[15px] text-charcoal placeholder:text-mute/60 transition-colors focus:border-royal focus:outline-none";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return <input ref={ref} {...props} className={cn(controlCls, props.className)} />;
  },
);

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(controlCls, "appearance-none pr-10", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(controlCls, "min-h-[120px] resize-y", props.className)} />;
}

export function RadioRow({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className={cn(
            "cursor-pointer rounded-full border px-4 py-2 text-[13px] transition-colors",
            value === opt ? "border-ink bg-ink text-white" : "border-line bg-white text-mute hover:border-ink/40",
          )}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="sr-only"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

/* ------------------------------- modal -------------------------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const first = ref.current?.querySelector<HTMLElement>("input, select, textarea, button");
    first?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-ink/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
      <button className="fixed inset-0 cursor-default" aria-label="Close dialog" onClick={onClose} tabIndex={-1} />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
        className={cn(
          "relative my-auto w-full rounded-t-2xl bg-paper p-6 plate-shadow-lg sm:rounded-2xl sm:p-9",
          wide ? "sm:max-w-3xl" : "sm:max-w-xl",
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-6">
          <h3 className="display text-3xl sm:text-4xl">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-line bg-white p-2 text-mute transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
