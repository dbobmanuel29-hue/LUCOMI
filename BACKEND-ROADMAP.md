# LUCOMI ENTERPRISE — Backend Roadmap

## Backend stack
- Firebase Authentication — admin login and session management.
- Cloud Firestore — products, categories, projects, team, testimonials, enquiries, admins and business settings.
- Cloudinary — product, project, team, testimonial and custom-reference images. Firebase Storage will not be used.
- WhatsApp — sales/enquiry handoff using the WhatsApp number stored in Firestore settings.
- Firebase Security Rules — public/admin access control.
- Firebase App Check — optional hardening after the core backend is stable.

## 1. Authentication & admin access
**Where:** Firebase Authentication + admins/{uid} in Firestore.
**What it does:** Admin sign-in, Firebase sessions, UID-based authorization, logout and unauthorized-access handling. No admin password is stored in Firestore.
**Roles:** admin = full management; editor = content-management access with sensitive settings/security actions restricted.

## 2. Products
**Where:** Firestore products.
**What it does:** Add, edit, publish/unpublish and delete products; store name, slug, category, descriptions, features, materials, dimensions, variations and price visibility; mark featured products; store Cloudinary image URLs; public catalogue reads only published products.
**Admin:** /admin/products

## 3. Categories
**Where:** Firestore categories.
**What it does:** Create/edit categories, control slug/description/image/published state and connect products to categories.
**Admin:** /admin/categories

## 4. Product & media uploads
**Where:** Cloudinary + Firestore.
**What it does:** Admin uploads images to Cloudinary; Cloudinary returns delivery URLs/metadata; Firestore stores URLs instead of image binaries. Custom-furniture reference images are linked to enquiries.
**Important:** Firebase Storage is intentionally not part of this project.

## 5. Projects / portfolio
**Where:** Firestore projects.
**What it does:** Add/edit/publish/unpublish/delete projects, store location/category/description/gallery and manage gallery images through Cloudinary.
**Admin:** /admin/projects

## 6. Team
**Where:** Firestore team.
**What it does:** Add/edit/remove team members, store biography/focus/profile image and control the featured leadership profile.
**Admin:** /admin/team

## 7. Testimonials / reviews
**Where:** Firestore testimonials.
**What it does:** Visitors submit reviews; new reviews start unpublished/pending; admins approve, edit or remove them. Customer email stays private.
**Admin:** /admin/testimonials

## 8. Enquiries & quote requests
**Where:** Firestore enquiries.
**What it does:** Product enquiries, quote requests, custom-furniture enquiries, contact messages and project enquiries all enter one pipeline. Each gets a Firestore document ID/timestamp. Admin can move status through New → Contacted → In Progress → Completed → Archived.
**Admin:** /admin/enquiries

## 9. Custom furniture workflow
**Where:** /custom → Cloudinary + Firestore enquiries.
**What it does:** Customer submits project requirements and optional reference images; images upload to Cloudinary; enquiry stores the URLs; admin sees the brief and references together.

## 10. Business settings / CMS controls
**Where:** Firestore settings/business.
**What it does:** Manage company name, tagline, logo, phones, email, address, WhatsApp, business hours, social links and reusable company/about content. Header, footer, contact page and WhatsApp CTAs use these settings.
**Admin:** /admin/settings

## 11. WhatsApp sales flow
**Where:** Firestore business settings + frontend helper.
**What it does:** Store the WhatsApp number once, generate product-aware messages and keep floating/mobile WhatsApp CTAs synchronized.

## 12. Dashboard
**Where:** /admin.
**What it does:** Show product/category/project counts, published state, new/active enquiries, recent enquiries and shortcuts to common admin actions.

## 13. Search & catalogue performance
**Where:** Public Products page.
**What it does:** Keep catalogue search/filter primarily client-side after loading the required published catalogue. Avoid unnecessary realtime listeners and refresh after mutations to control Spark reads.

## 14. Security rules
**Public:** Read only published public content and required settings; create controlled enquiry/review documents; no public update/delete.
**Admin:** Authenticated admin UID must exist in admins/{uid}; role checks protect writes and sensitive collections.
**Hardening:** Validate fields and lengths, prevent clients from setting privileged fields, use Firestore timestamps and add App Check later.

## 15. Email / notifications
**Where:** Later phase, preferably a server-side Firebase function or approved email provider.
**What it does:** Notify LUCOMI of new enquiries, optionally confirm receipt to customers and notify admins about important status changes. Secrets stay server-side.

## 16. Initial Firestore structure
admins/{uid}
categories/{categoryId}
products/{productId}
projects/{projectId}
team/{memberId}
testimonials/{testimonialId}
enquiries/{enquiryId}
settings/business

## Implementation order
### Phase 1 — Foundation
1. Firebase project connection.
2. Firebase Auth.
3. Admin UID/role model.
4. Firestore setup.
5. Security rules.
### Phase 2 — Catalogue
6. Categories.
7. Products.
8. Cloudinary image uploads.
9. Public catalogue connected to Firestore.
10. Product detail pages connected to Firestore.
### Phase 3 — Sales pipeline
11. Enquiries.
12. Quote flow.
13. Custom furniture uploads.
14. WhatsApp integration.
15. Admin enquiry management.
### Phase 4 — Content management
16. Projects.
17. Team.
18. Testimonials/review moderation.
19. Business settings.
### Phase 5 — Hardening
20. Validation and abuse protection.
21. App Check.
22. Admin permission review.
23. Spark read/write optimization.
24. Production testing and deployment.

## What stays frontend-only
- Animations and page transitions.
- Dark/light mode.
- Navigation and mobile menu.
- Static legal pages.
- FAQ/process sections.
- Visual layout and responsive behavior.
- Client-side catalogue search/filter once the product dataset is loaded.

## Production note
The Terms & Conditions and Privacy Policy pages are included in the frontend now. Their final legal wording — especially liability, cancellation/refund, warranty and data-retention language — should be reviewed against LUCOMI's actual business practices and applicable Nigerian requirements before final production use.