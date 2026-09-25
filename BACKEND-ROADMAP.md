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

## 2. Customer user profiles
**Where:** Firebase Authentication + Firestore `users/{uid}` + Cloudinary for profile images.
**What it does:** Every signed-in customer gets a Firebase Auth identity and a matching profile document. Customers can edit their name and phone number and upload a profile image directly from a phone, tablet or computer. The image is uploaded to Cloudinary; Firestore stores the Cloudinary URL and profile metadata. Email remains tied to Firebase Authentication.
**Frontend:** `/account` is the customer account page. The header profile menu links to it.
**Security:** A signed-in user can read/update only their own `users/{uid}` document. They cannot change their UID, provider, email ownership, admin role or other users' profiles.

## 3. Products
**Where:** Firestore products.
**What it does:** Add, edit, publish/unpublish and delete products; store name, slug, category, descriptions, features, materials, dimensions, variations and price visibility; mark featured products; store Cloudinary image URLs; public catalogue reads only published products.
**Admin:** /admin/products

## 4. Categories
**Where:** Firestore categories.
**What it does:** Create/edit categories, control slug/description/image/published state and connect products to categories.
**Admin:** /admin/categories

## 5. Product & media uploads
**Where:** Cloudinary + Firestore.
**What it does:** Admin uploads images to Cloudinary; Cloudinary returns delivery URLs/metadata; Firestore stores URLs instead of image binaries. Custom-furniture reference images are linked to enquiries.
**Important:** Firebase Storage is intentionally not part of this project.

## 6. Projects / portfolio
**Where:** Firestore projects.
**What it does:** Add/edit/publish/unpublish/delete projects, store location/category/description/gallery and manage gallery images through Cloudinary.
**Admin:** /admin/projects

## 7. Team
**Where:** Firestore team.
**What it does:** Add/edit/remove team members, store biography/focus/profile image and control the featured leadership profile.
**Admin:** /admin/team

## 8. Testimonials / reviews
**Where:** Firestore testimonials.
**What it does:** Visitors submit reviews; new reviews start unpublished/pending; admins approve, edit or remove them. Customer email stays private.
**Admin:** /admin/testimonials

## 9. Enquiries & quote requests
**Where:** Firestore enquiries.
**What it does:** Product enquiries, quote requests, custom-furniture enquiries, contact messages and project enquiries all enter one pipeline. Each gets a Firestore document ID/timestamp. Admin can move status through New → Contacted → In Progress → Completed → Archived.
**Admin:** /admin/enquiries

## 10. Custom furniture workflow
**Where:** /custom → Cloudinary + Firestore enquiries.
**What it does:** Customer submits project requirements and optional reference images; images upload to Cloudinary; enquiry stores the URLs; admin sees the brief and references together.

## 11. Business settings / CMS controls
**Where:** Firestore settings/business.
**What it does:** Manage company name, tagline, logo, phones, email, address, WhatsApp, business hours, social links and reusable company/about content. Header, footer, contact page and WhatsApp CTAs use these settings.
**Admin:** /admin/settings

## 12. WhatsApp sales flow
**Where:** Firestore business settings + frontend helper.
**What it does:** Store the WhatsApp number once, generate product-aware messages and keep floating/mobile WhatsApp CTAs synchronized.

## 13. Dashboard
**Where:** /admin.
**What it does:** Show product/category/project counts, published state, new/active enquiries, recent enquiries and shortcuts to common admin actions.

## 14. Search & catalogue performance
**Where:** Public Products page.
**What it does:** Keep catalogue search/filter primarily client-side after loading the required published catalogue. Avoid unnecessary realtime listeners and refresh after mutations to control Spark reads.

## 15. Security rules
**Public:** Read only published public content and required settings; create controlled enquiry/review documents; no public update/delete.
**Admin:** Authenticated admin UID must exist in admins/{uid}; role checks protect writes and sensitive collections.
**Hardening:** Validate fields and lengths, prevent clients from setting privileged fields, use Firestore timestamps and add App Check later.

## 16. Email / notifications
**Where:** Later phase, preferably a server-side Firebase function or approved email provider.
**What it does:** Notify LUCOMI of new enquiries, optionally confirm receipt to customers and notify admins about important status changes. Secrets stay server-side.

## 17. Initial Firestore structure
admins/{uid}
users/{uid}
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
2. Firebase Auth (email/password + Google).
3. Customer user profiles.
4. Admin UID/role model.
5. Firestore setup.
6. Security rules.
### Phase 2 — Catalogue
7. Categories.
8. Products.
9. Cloudinary image uploads, including customer profile images.
10. Public catalogue connected to Firestore.
11. Product detail pages connected to Firestore.
### Phase 3 — Sales pipeline
12. Enquiries.
13. Quote flow.
14. Custom furniture uploads.
15. WhatsApp integration.
16. Admin enquiry management.
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

## Account security and retention additions — September 2026

- Admin access is controlled by `admins/{uid}` with `role: "admin"`. Client applications cannot create or edit admin records; the project owner provisions the admin document manually in Firebase Console.
- Customer contact actions require Firebase Authentication. Public browsing and social links remain available without an account.
- Password reset requests are limited in the frontend to 2 requests per calendar day per email address. Users are told to check Spam/Junk when a reset message is not visible. A server-enforced 2/day limit would require a privileged backend because Firebase's client password-reset API is not a Firestore-rule-controlled operation.
- Customer profiles record first-signup `createdAt` and a one-year `retentionUntil` timestamp. Admin profiles are excluded.
- Customer history documents carry `userId` so the user's enquiries, quotes and reviews can be scoped to that account.
- True unattended one-year deletion requires a scheduled/server-side mechanism. Firebase currently requires the Blaze plan for Cloud Functions, and Firestore TTL deletes are not included in the no-cost Spark quota. Until that is enabled, the app records the retention deadline and applies retention controls when the account is active; the production plan should enable TTL/server cleanup before making the deletion fully unattended.
