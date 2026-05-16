# Dream's Latkans & Laces — Wholesale E-commerce

## Original problem statement
Build a complete, professional, image-rich, mobile-responsive multi-page e-commerce website for "Dream's Latkans & Laces" / "Dreams Wholesaler Latkans Lace" in Bhuleshwar, Mumbai. Wholesale ONLY. Products: fancy latkans, laces, borders, kalire, tassels, patches, buttons, stone work, resham work. Primary phone 90043 56576, alt 98209 18646. Pan-India + worldwide shipping. Pages: Home / Products / About / Contact + (added) Admin Dashboard.

## Architecture
- Frontend: React 19 (CRA + craco), react-router-dom v7, react-helmet-async (SEO), lucide-react, custom CSS design system
- Backend: FastAPI + MongoDB (motor); public + admin (JWT) API; Resend for email; bcrypt password hashing
- Image generation: Gemini Nano Banana via emergentintegrations + EMERGENT_LLM_KEY; 25 images shipped under /app/frontend/public/images/

## User personas
1. Saree / lehenga manufacturer sourcing bulk latkans & laces
2. Boutique / fashion wholesaler seeking new designs
3. Festive / mandap decorator placing seasonal bulk orders
4. International exporter wholesaling Indian decoratives abroad
5. (Internal) Business owner of Dream's Latkans & Laces tracking and exporting leads

## Core requirements (static)
- Multi-page site (Home/Products/About/Contact) with sticky navbar, gold announcement bar, dark footer
- Wholesale-only positioning, WhatsApp-driven enquiries (no cart/checkout)
- All WhatsApp deep links: https://wa.me/919004356576
- All photography AI-generated, real product imagery
- Mobile responsive, generous whitespace, Cormorant Garamond + Jost + IM Fell English fonts
- Admin dashboard with stats, status management, CSV export
- Login rate-limit (brute-force protection)
- Auto-forward new enquiries to business email (Resend)
- SEO: sitemap, robots, OG/Twitter cards, per-page meta tags

## What's been implemented

### 2026-05-16 (Iteration 1 — MVP)
- Public site (Home/Products/About/Contact), hero slideshow, marquee, count-up stats, category & product grids, "Why Choose Us", how-to-order, customer-type chips, Final CTA, footer
- Floating WhatsApp + announcement bar
- Contact form with validation → POST /api/enquiry (persists to MongoDB)
- 25 AI-generated images

### 2026-05-16 (Iteration 2 — Admin + SEO)
- Admin auth (bcrypt + JWT), seeded admin user (admin@dreamslatkans.com / Dreams@2026)
- /admin/login + /admin (stats, filter, search, status dropdown, delete, sign-out)
- POST /api/enquiry returns 201, status="new" default, backfill for legacy rows
- SEO: sitemap.xml, robots.txt (disallows /admin), per-page Helmet meta, OG image

### 2026-05-16 (Iteration 3 — Hardening + Lead Ops)
- Login rate-limit (5 fails per ip:email = 15-min lockout, returns 429 with Retry-After)
- Resend email notifications on new enquiry — fire-and-forget, never blocks POST, graceful no-op when RESEND_API_KEY empty
- CSV export: GET /api/admin/enquiries.csv + dashboard "Export CSV" button (Blob + auth-aware fetch)
- New env vars: RESEND_API_KEY, SENDER_EMAIL, LEAD_NOTIFY_EMAIL, LOGIN_MAX_ATTEMPTS, LOGIN_LOCKOUT_MINUTES

## Testing status
- Iteration 1: 100% (24 backend + 12 frontend flows)
- Iteration 2: 100% (24 backend + 12 frontend flows)
- Iteration 3: 100% (33 backend = 9 new + 24 regression, 6 frontend flows)

## Backlog (P0 / P1 / P2)
- P1: Pagination on admin enquiries list (currently 1000 max)
- P1: Replace native confirm() with shadcn AlertDialog on delete
- P2: Per-product SEO landing pages (deferred to Phase 2 per user)
- P2: WhatsApp Business API auto-reply (deferred — user opted out of Twilio)
- P2: i18n Hindi toggle
- P2: Trust the rightmost X-Forwarded-For hop for production rate-limit identifier
- P2: Verify Resend custom domain (currently using onboarding@resend.dev sandbox sender)

## Next tasks
- Provide RESEND_API_KEY to activate email forwarding (currently logs only — see /app/memory/test_credentials.md for the env vars to populate)
- Verify business domain on Resend so emails come from a branded sender
