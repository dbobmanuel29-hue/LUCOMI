import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { FloatingWhatsApp, MobileCTABar, SiteFooter, SiteHeader } from "./components/Chrome";
import { QuoteProvider } from "./components/QuoteFlow";
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
import { Privacy, Terms } from "./pages/Legal";
import { AdminLayout, AdminLogin, Dashboard } from "./admin/AdminShell";
import { AdminCategories, AdminProducts } from "./admin/AdminCatalog";
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

  return (
    <>
      <SiteHeader />
      <main className="pb-[68px] lg:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
      <MobileCTABar />
    </>
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
  return (
    <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
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
    </BrowserRouter>
  );
}
