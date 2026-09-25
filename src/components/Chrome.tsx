import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown, Mail, MapPin, Menu, Moon, Phone, Search, Sun, X } from "lucide-react";
import { api, useAsync } from "../lib/api";
import { businessSettings } from "../lib/mock";
import { cn, displayPhone, telHref, waLink } from "../lib/helpers";
import { Logo, LogoLockup, Mark } from "./Logo";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, XIcon } from "./BrandIcons";
import { SiteSearch } from "./SiteSearch";
import { useAuth } from "./AuthFlow";
import { useQuote } from "./QuoteFlow";
import { Button, Micro } from "./ui";

const PRIMARY_NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/custom", label: "Custom Furniture" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];
const SECONDARY_NAV = [
  { to: "/team", label: "Meet the Team" },
  { to: "/reviews", label: "Reviews" },
];
const NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

// The official profile URL can be entered in Business Settings later.
export const TIKTOK_DISCOVERY = "https://www.tiktok.com/search?q=LUCOMI%20ENTERPRISE";

export function SocialLinks({
  settings,
  tone = "dark",
  className,
}: {
  settings: ReturnType<typeof useSettings>;
  tone?: "dark" | "light";
  className?: string;
}) {
  const items: [string, string, (p: { className?: string }) => React.ReactElement][] = [
    [settings.social.facebook, "Facebook", FacebookIcon],
    [settings.social.instagram, "Instagram", InstagramIcon],
    [settings.social.tiktok || TIKTOK_DISCOVERY, settings.social.tiktok ? "TikTok" : "Search for LUCOMI on TikTok", TikTokIcon],
    [settings.social.twitter, "X (Twitter)", XIcon],
  ];
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {items
        .filter(([url]) => url)
        .map(([url, label, Icon]) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`LUCOMI ENTERPRISE on ${label}`}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5",
              tone === "dark"
                ? "border-white/20 text-white/70 hover:border-white hover:bg-white hover:text-ink"
                : "border-line bg-white text-mute hover:border-ink/40 hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
    </div>
  );
}

export function useSettings() {
  const { data } = useAsync(() => api.settings.get());
  return data ?? businessSettings;
}

/* ------------------------------ theme toggle --------------------------- */
export function ThemeToggle({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("lucomi-theme", next ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
  };
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:rotate-12",
        tone === "dark"
          ? "border-white/25 text-white hover:bg-white/10"
          : "border-line bg-white text-ink hover:border-ink/40",
      )}
    >
      {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
}

/* ------------------------------- header ------------------------------- */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { open } = useQuote();
  const { open: openAuth, user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const moreRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!moreRef.current?.contains(target)) setMoreOpen(false);
      if (!profileRef.current?.contains(target)) setProfileOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  const openSearch = () => {
    setMenuOpen(false);
    setMoreOpen(false);
    setSearchOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;

    // Lock the document itself while the mobile/tablet drawer is open.
    // Using position: fixed as well as overflow:hidden prevents iOS/Android
    // browsers from rubber-banding the page underneath the drawer.
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overscrollBehavior: html.style.overscrollBehavior,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      html.style.overscrollBehavior = previous.overscrollBehavior;
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] border-b border-line/80 bg-paper shadow-[0_1px_0_rgba(10,42,94,0.06),0_10px_30px_-24px_rgba(10,42,94,0.22)]",
        )}
      >
        <div className="shell flex h-[68px] items-center justify-between gap-3 sm:h-[72px] sm:gap-4 xl:h-[76px] xl:gap-6">
          <Logo />
          <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary">
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative py-2 text-[13px] font-medium transition-colors",
                    isActive ? "text-ink" : "text-mute hover:text-ink",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 h-px w-full bg-royal"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((value) => !value)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                className={cn(
                  "flex items-center gap-1 py-2 text-[13px] font-medium transition-colors",
                  SECONDARY_NAV.some((item) => item.to === location.pathname) ? "text-ink" : "text-mute hover:text-ink",
                )}
              >
                More <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", moreOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-4 w-52 rounded-lg border border-line bg-paper p-1.5 plate-shadow-lg"
                  >
                    {SECONDARY_NAV.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMoreOpen(false)}
                        className="block rounded-md px-4 py-3 text-[13px] text-charcoal transition-colors hover:bg-plate hover:text-royal"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <div ref={profileRef} className="relative hidden xl:block">
                <button type="button" onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 shadow-sm">
                  {user.photoURL ? <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-royal text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>}
                  <span className="max-w-28 truncate text-sm font-semibold text-ink">{user.name}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5", profileOpen && "rotate-180")} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-line bg-paper p-4 plate-shadow-lg">
                    <p className="truncate font-semibold text-ink">{user.name}</p>
                    <p className="mt-1 truncate text-xs text-mute">{user.email}</p>
                    <Link to="/account" onClick={() => setProfileOpen(false)} className="mt-3 block rounded-lg bg-royal px-3 py-2 text-center text-sm font-semibold text-white hover:opacity-90">Manage Account</Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)} className="mt-2 block rounded-lg border border-royal/30 bg-royal/5 px-3 py-2 text-center text-sm font-semibold text-royal hover:bg-royal/10">
                        Admin Dashboard
                      </Link>
                    )}
                    <button type="button" onClick={() => { signOut(); setProfileOpen(false); }} className="mt-4 w-full rounded-lg border border-line px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-plate">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={openAuth} className="hidden xl:inline-flex" size="sm">Get Started</Button>
            )}
            <button
              type="button"
              onClick={openSearch}
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-royal hover:text-royal xl:flex"
              aria-label="Search furniture"
              title="Search furniture"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink xl:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* scroll progress bar */}
        <div className="h-[2px] w-full bg-line/50" aria-hidden="true">
          <motion.div style={{ scaleX: progress }} className="h-full w-full origin-left bg-royal" />
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] flex h-dvh flex-col overscroll-none overflow-hidden bg-ink text-white xl:hidden"
          >
            <div className="shell flex h-[68px] shrink-0 items-center justify-between gap-3 sm:h-[72px] sm:gap-4">
              <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="LUCOMI ENTERPRISE — home">
                <Mark className="h-9 w-auto brightness-0 invert" />
                <span className="leading-none">
                  <span className="block font-sans text-[18px] font-bold tracking-[0.02em] text-white">LUCOMI</span>
                  <span className="mt-1 block font-sans text-[8px] font-semibold tracking-[0.34em] text-white/70">
                    ENTERPRISE
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={openSearch}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white"
                  aria-label="Search furniture"
                  title="Search furniture"
                >
                  <Search className="h-4 w-4" />
                </button>
                <ThemeToggle tone="dark" />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <nav
              className="shell no-scrollbar mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain overscroll-y-contain pb-2 [touch-action:pan-y]"
              aria-label="Mobile"
            >
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.35 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-baseline justify-between border-t border-white/15 py-4 text-[26px] leading-none sm:text-[30px]",
                        isActive ? "text-white" : "text-white/65",
                      )
                    }
                  >
                    <span className="display">{item.label}</span>
                    <span className="micro text-white/40">0{i + 1}</span>
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <div className="shell mt-4 shrink-0 space-y-2 pb-6">
              {user ? (
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? <img src={user.photoURL} alt="" className="h-11 w-11 rounded-full object-cover" /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-royal">{user.name.charAt(0).toUpperCase()}</span>}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{user.name}</p>
                      <p className="truncate text-xs text-white/55">{user.email}</p>
                    </div>
                  </div>
                  <div className={cn("mt-3 grid gap-2", isAdmin ? "grid-cols-2" : "grid-cols-2")}>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="col-span-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-center text-xs font-bold text-white hover:bg-white/15"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/account"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl bg-white px-3 py-2.5 text-center text-xs font-bold text-ink hover:bg-white/90"
                    >
                      Manage Account
                    </Link>
                    <button
                      type="button"
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="rounded-xl border border-white/20 px-3 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Button full size="lg" variant="light" onClick={() => { setMenuOpen(false); openAuth(); }}>Get Started</Button>
              )}
              <Button
                full
                size="lg"
                onClick={() => {
                  if (!user) {
                    openAuth();
                    return;
                  }
                  window.open(waLink("Hello LUCOMI ENTERPRISE, I would like to make an enquiry."), "_blank", "noopener,noreferrer");
                }}
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp Us
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SiteSearch open={searchOpen} onClose={closeSearch} />
    </>
  );
}

/* ------------------------------- footer ------------------------------- */
export function SiteFooter() {
  const settings = useSettings();
  const { open } = useQuote();
  const { user, open: openAuth } = useAuth();

  return (
    <footer className="bg-ink-deep text-white/75">
      <div className="shell grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <LogoLockup className="w-[210px] brightness-0 invert" />
          <p className="micro mt-5 text-white/50">{settings.tagline}</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            Professional office furniture designed and manufactured for businesses, organisations and modern
            workplaces.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="light"
              size="sm"
              onClick={() => open("", "Quote Request")}
            >
              Request a Quote
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!user) {
                  openAuth();
                  return;
                }
                window.open(waLink("Hello LUCOMI ENTERPRISE, I would like to make an enquiry."), "_blank", "noopener,noreferrer");
              }}
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </Button>
          </div>
        </div>

        <div className="md:col-span-2">
          <Micro className="text-white/45">Quick Links</Micro>
          <ul className="mt-5 space-y-2.5 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <Micro className="text-white/45">Product Categories</Micro>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[
              ["Executive Desks", "executive-desks"],
              ["Office Chairs", "office-chairs"],
              ["Workstations", "workstations"],
              ["Conference Tables", "conference-tables"],
              ["Reception Furniture", "reception-furniture"],
              ["Office Storage", "office-storage"],
            ].map(([label, slug]) => (
              <li key={slug}>
                <Link to={`/products?category=${slug}`} className="transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <Micro className="text-white/45">Contact</Micro>
          {user ? (
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                <span className="leading-relaxed">{settings.address}</span>
              </li>
              {settings.phone.map((p) => (
                <li key={p} className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                  <a href={telHref(p)} className="tnum transition-colors hover:text-white">{displayPhone(p)}</a>
                </li>
              ))}
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                <a href={`mailto:${settings.email}`} className="break-all transition-colors hover:text-white">{settings.email}</a>
              </li>
            </ul>
          ) : (
            <button type="button" onClick={openAuth} className="mt-5 text-left text-sm leading-relaxed text-white/60 hover:text-white">
              Sign in to view LUCOMI's contact details →
            </button>
          )}
          <div className="mt-6">
            <Micro className="text-white/45">Find us online</Micro>
            <SocialLinks settings={settings} className="mt-3" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 pb-24 pt-6 text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between lg:pb-6">
          <p>© {new Date().getFullYear()} LUCOMI ENTERPRISE. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/terms" className="transition-colors hover:text-white">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <p className="micro text-white/35">Port Harcourt, Nigeria</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------- floating whatsapp ------------------------- */
export function FloatingWhatsApp() {
  const { user, open: openAuth } = useAuth();
  return (
    <button
      type="button"
      onClick={() => {
        if (!user) {
          openAuth();
          return;
        }
        window.open(waLink("Hello LUCOMI ENTERPRISE, I would like to make an enquiry."), "_blank", "noopener,noreferrer");
      }}
      aria-label="Chat with LUCOMI ENTERPRISE on WhatsApp"
      className="group fixed bottom-8 right-8 z-[55] hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,0.8)] transition-transform duration-200 hover:scale-105 lg:flex"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="pointer-events-none absolute right-[60px] hidden whitespace-nowrap rounded-full bg-ink px-4 py-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:block">
        Chat with us
      </span>
    </button>
  );
}

/* --------------------------- mobile sticky CTA ------------------------- */
export function MobileCTABar() {
  const { open } = useQuote();
  const { user, open: openAuth } = useAuth();
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-[60] grid grid-cols-2 gap-px border-t border-line bg-line lg:hidden">
      <button
        onClick={() => open("", "Quote Request")}
        className="bg-ink py-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white"
      >
        Request Quote
      </button>
      <button
        type="button"
        onClick={() => {
          if (!user) {
            openAuth();
            return;
          }
          window.open(waLink("Hello LUCOMI ENTERPRISE, I would like to make an enquiry."), "_blank", "noopener,noreferrer");
        }}
        className="flex items-center justify-center gap-2 bg-royal py-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white"
      >
        <WhatsAppIcon className="h-4 w-4" /> WhatsApp
      </button>
    </div>
  );
}
