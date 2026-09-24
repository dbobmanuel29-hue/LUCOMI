import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { FloatingWhatsApp, MobileCTABar, SiteFooter, SiteHeader } from "./components/Chrome";
import { QuoteProvider } from "./components/QuoteFlow";
import { AuthProvider } from "./components/AuthFlow";
import { Button, Micro } from "./components/ui";
import Home from "./pages/Home";

const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Custom = lazy(() => import("./pages/Custom"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const Team = lazy(() => import("./pages/Team"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Account = lazy(() => import("./pages/Account"));
const Terms = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Privacy })));

const AdminLogin = lazy(() => import("./admin/AdminShell").then((m) => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import("./admin/AdminShell").then((m) => ({ default: m.AdminLayout })));
const Dashboard = lazy(() => import("./admin/AdminShell").then((m) => ({ default: m.Dashboard })));
const AdminProducts = lazy(() => import("./admin/AdminCatalog").then((m) => ({ default: m.AdminProducts })));
const AdminCategories = lazy(() => import("./admin/AdminCatalog").then((m) => ({ default: m.AdminCategories })));
const AdminProjects = lazy(() => import("./admin/AdminContent").then((m) => ({ default: m.AdminProjects })));
const AdminTeam = lazy(() => import("./admin/AdminContent").then((m) => ({ default: m.AdminTeam })));
const AdminTestimonials = lazy(() => import("./admin/AdminContent").then((m) => ({ default: m.AdminTestimonials })));
const AdminEnquiries = lazy(() => import("./admin/AdminContent").then((m) => ({ default: m.AdminEnquiries })));
const AdminSettings = lazy(() => import("./admin/AdminContent").then((m) => ({ default: m.AdminSettings })));

function RouteFallback() {
  return (
    <div className="shell flex min-h-[42vh] items-center justify-center py-24" role="status" aria-label="Loading page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-royal/20 border-t-royal" />
    </div>
  );
}

function PublicLayout() {
  const location = useLocation();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      <SiteHeader />
      <main className="pb-[68px] lg:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Suspense fallback={<RouteFallback />}><Outlet /></Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
      <MobileCTABar />
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
    const frame = window.requestAnimationFrame(() => {
      setReady(true);
      window.requestAnimationFrame(() => document.getElementById("initial-loader")?.remove());
    });
    return () => window.cancelAnimationFrame(frame);
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
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/admin/login" element={<Suspense fallback={<RouteFallback />}><AdminLogin /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<RouteFallback />}><AdminLayout /></Suspense>}>
            <Route index element={<Suspense fallback={<RouteFallback />}><Dashboard /></Suspense>} />
            <Route path="products" element={<Suspense fallback={<RouteFallback />}><AdminProducts /></Suspense>} />
            <Route path="categories" element={<Suspense fallback={<RouteFallback />}><AdminCategories /></Suspense>} />
            <Route path="projects" element={<Suspense fallback={<RouteFallback />}><AdminProjects /></Suspense>} />
            <Route path="team" element={<Suspense fallback={<RouteFallback />}><AdminTeam /></Suspense>} />
            <Route path="testimonials" element={<Suspense fallback={<RouteFallback />}><AdminTestimonials /></Suspense>} />
            <Route path="enquiries" element={<Suspense fallback={<RouteFallback />}><AdminEnquiries /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<RouteFallback />}><AdminSettings /></Suspense>} />
          </Route>
        </Routes>
        </QuoteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
