import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/helpers";

/**
 * LUCOMI ENTERPRISE identity artwork.
 * The supplied logo file is loaded first (public/images/lucomi-logo.png). If it
 * is not present the vector reconstruction below is drawn — same proportions,
 * same blue facets, no effects, no distortion. Drop the supplied file in at
 * public/images/lucomi-logo.png and it takes over automatically.
 */

const Mark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 240 190" className={className} role="img" aria-label="LUCOMI ENTERPRISE">
    <defs>
      <linearGradient id="lucomiBlue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3FA9F5" />
        <stop offset="55%" stopColor="#1560E8" />
        <stop offset="100%" stopColor="#0A2A5E" />
      </linearGradient>
      <linearGradient id="lucomiDeep" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1560E8" />
        <stop offset="100%" stopColor="#0A2A5E" />
      </linearGradient>
    </defs>

    {/* tall L panel with diagonal base */}
    <path d="M14 14h52v128l52 34H14z" fill="url(#lucomiDeep)" />
    <path d="M66 14h30v128l-30 20z" fill="url(#lucomiBlue)" opacity="0.85" />
    <path d="M14 14h52L14 92z" fill="#0A2A5E" opacity="0.55" />

    {/* desk top */}
    <path d="M96 66h132v13H96z" fill="url(#lucomiBlue)" />
    <path d="M228 66l-6 13h6z" fill="#0A2A5E" opacity="0.5" />
    {/* desk leg */}
    <path d="M212 79h13v56h-13z" fill="url(#lucomiDeep)" />
    {/* drawer pedestal */}
    <path d="M162 86h58v62h-58z" fill="url(#lucomiBlue)" />
    <path d="M176 100h30v4h-30zM176 114h30v4h-30zM176 128h30v4h-30z" fill="#EAF3FF" />

    {/* chair */}
    <path d="M92 34c0-5 4-9 9-9h22c5 0 9 4 9 9v47h-40z" fill="url(#lucomiDeep)" />
    <path d="M88 82h54c4 0 7 3 7 7s-3 7-7 7H88c-4 0-7-3-7-7s3-7 7-7z" fill="url(#lucomiBlue)" />
    <path d="M145 88c8 0 12 5 12 11v6h-8v-6c0-3-2-4-4-4z" fill="url(#lucomiDeep)" />
    <path d="M110 96h8v22h-8z" fill="#0A2A5E" />
    <path d="M84 124l34-8 2 7-34 8z" fill="#0A2A5E" />
    <path d="M116 118l30 14-3 6-30-14z" fill="#0A2A5E" />
    <circle cx="82" cy="132" r="6" fill="#0A2A5E" />
    <circle cx="148" cy="130" r="6" fill="#0A2A5E" />
  </svg>
);

const Wordmark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 420 118" className={className} role="img" aria-label="LUCOMI ENTERPRISE">
    <text
      x="210"
      y="56"
      textAnchor="middle"
      fontFamily="Archivo, Helvetica, Arial, sans-serif"
      fontWeight="700"
      fontSize="58"
      letterSpacing="2"
      fill="#0A2A5E"
    >
      LUCOMI
    </text>
    <path d="M40 82h96" stroke="#1560E8" strokeWidth="3" />
    <path d="M284 82h96" stroke="#1560E8" strokeWidth="3" />
    <text
      x="210"
      y="90"
      textAnchor="middle"
      fontFamily="Archivo, Helvetica, Arial, sans-serif"
      fontWeight="600"
      fontSize="24"
      letterSpacing="9"
      fill="#0A2A5E"
    >
      ENTERPRISE
    </text>
  </svg>
);

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <Link to={href} className={cn("flex items-center gap-3", className)} aria-label="LUCOMI ENTERPRISE — home">
      {failed ? (
        <Mark className="h-10 w-auto" />
      ) : (
        <img
          src="images/lucomi-logo.png"
          alt="LUCOMI ENTERPRISE — quality office furniture, better workspaces"
          className="h-11 w-auto"
          onError={() => setFailed(true)}
        />
      )}
      <span className="hidden sm:block leading-none">
        <span className="block font-sans text-[19px] font-bold tracking-[0.02em] text-ink">LUCOMI</span>
          <span className="block font-sans text-[8.5px] font-semibold tracking-[0.34em] text-royal">ENTERPRISE</span>
        </span>
    </Link>
  );
}

export function LogoLockup({ className, tone = "light" }: { className?: string; tone?: "light" | "ink" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("w-[220px] max-w-full", className)}>
      {failed ? (
        <div className={cn(tone === "ink" && "brightness-0 invert")}>
          <Mark className="h-24 w-auto" />
          <Wordmark className="-mt-2 w-[220px]" />
          <p className="micro mt-2 text-center text-mute">Quality Office Furniture • Better Workspaces</p>
        </div>
      ) : (
        <img
          src="images/lucomi-logo.png"
          alt="LUCOMI ENTERPRISE — Quality Office Furniture, Better Workspaces"
          className="w-full"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export { Mark, Wordmark };
