import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { FloatingWhatsApp, MobileCTABar, SiteFooter, SiteHeader } from "./components/Chrome";
import CookieConsent from "./components/CookieConsent";
import { QuoteProvider } from "./components/QuoteFlow";
import { AuthProvider } from "./components/AuthFlow";
import { Button, Micro } from "./components/ui";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Custom from "./pages/Custom";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Team from "./pages/Team";
import Reviews from "./pages/Reviews";
import Account from "./pages/Account";
import { Privacy, Terms } from "./pages/Legal";
import { Cookies } from "./pages/Cookies";
import { AdminLayout, AdminLogin, Dashboard } from "./admin/AdminShell";
import { AdminCategories, AdminProducts } from "./admin/AdminCatalog";
import { AdminUsers } from "./admin/AdminUsers";
import { AdminEnquiries, AdminProjects, AdminSettings, AdminTeam, AdminTestimonials } from "./admin/AdminContent";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function PublicLayout() {
  const location = useLocation();
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.16, ease: "easeOut" }}
    >
      <SiteHeader />
      <main className="pb-[68px] lg:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
      <MobileCTABar />
      <CookieConsent />
    </motion.div>
  );
}

function NotFound() {
  return (
    <section className="shell flex min-h-[70vh] flex-col justify-center py-32">
      <Micro className="text-royal">404</Micro>
      <h1 className="display mt-5 text-[clamp(3rem,9vw,6rem)]">
        Page Not
        <span className="block pl-[6vw] italic">Found.</span>
      </h1>
      <p className="mt-6 max-w-md text-[16px] text-mute">
        The page you are looking for is not available. Browse the furniture catalogue or contact LUCOMI directly.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/products">Explore Our Furniture</Button>
        <Button variant="outline" href="/contact">
          Contact Us
        </Button>
      </div>
    </section>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Reset any document-level scroll lock left behind by a previous mobile menu state.
    // This is intentionally defensive for browsers that restore a page from cache.
    // Always restore a normal document scrolling context on app startup.
    // This protects against browser cache restores carrying over a previous modal/menu lock.
    document.body.style.overflow = "visible";
    document.body.style.overflowY = "auto";
    document.body.style.position = "static";
    document.body.style.top = "auto";
    document.body.style.width = "auto";
    document.documentElement.style.overflowY = "auto";
    document.documentElement.style.overscrollBehavior = "auto";

    const revealApp = () => {
      setReady(true);
      document.getElementById("initial-loader")?.remove();
    };

    // Keep the branded loader brief, but never allow it to trap the page.
    const timer = window.setTimeout(revealApp, 180);
    const safetyTimer = window.setTimeout(revealApp, 1200);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(safetyTimer);
    };
  }, []);

  if (!ready) return null;

  return (
    <BrowserRouter>
      <AuthProvider>
        <QuoteProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/custom" element={<Custom />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </QuoteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
