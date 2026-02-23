# SP Granites - E-Commerce Platform

## Overview

SP Granites is a full-stack e-commerce web application for a granite, marble, and stone products business. It includes a customer-facing storefront with product browsing, cart/wishlist, order management, estimation requests, and live chat support, alongside a comprehensive admin dashboard for managing products, orders, users, content, and analytics. The app uses a React frontend with a Node.js/Express server that communicates with Supabase (authentication, database) using the service role key for secure server-side access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React 18 with TypeScript, built with Vite and SWC for fast compilation
- **Routing**: React Router DOM with BrowserRouter for client-side navigation
- **Styling**: Tailwind CSS with CSS variables for theming (CRED-inspired palette: deep forest green primary, rich red accents, clean black/white neutrals). Uses the shadcn/ui component library built on top of Radix UI primitives
- **Internationalization**: i18next + react-i18next for multilingual support (English, Hindi, Kannada). Translation files in `src/i18n/locales/`. Language preference persisted in localStorage
- **State Management**: React Context API for global state (CartContext, WishlistContext, AuthContext). React Query (@tanstack/react-query) for server state and data fetching
- **Animations**: Framer Motion for page transitions and UI animations
- **Forms**: React Hook Form with Zod schema validation
- **Component Library**: shadcn/ui (configured via components.json). Components live in `src/components/ui/`. Path alias `@/` maps to `src/`

### Backend (Express + Supabase)

- **Server**: Node.js/Express server at `server/index.ts` on port 3001
- **Database**: Supabase PostgreSQL (accessed via `@supabase/supabase-js` with service role key)
- **Authentication**: Supabase Auth (server-side) with email/password login
- **Authorization**: Role-based access control via `user_roles` table (admin, moderator, user)
- **Supabase Client**: Server-side admin client at `server/supabase.ts` using `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- **API Pattern**: All frontend requests go through `/api/*` endpoints on the Express server, which then queries Supabase
- **Admin Emails**: `akshelby9999@gmail.com`, `srajith9999@gmail.com` are auto-assigned admin role on signup

### Application Structure

- `server/` — Express server
  - `index.ts` — Server entry point, serves API and static files
  - `routes.ts` — All API route handlers (auth, CRUD, admin, CRM, AI chat)
  - `supabase.ts` — Supabase admin client configuration
- `src/pages/` — Route-level page components (HomePage, ProductsPage, Auth, admin pages, etc.)
- `src/components/` — Reusable components organized by feature:
  - `admin/` — Admin layout, data tables, stats cards, page headers
  - `auth/` — Email auth, phone auth (coming soon), social auth (coming soon), password input
  - `cart/` — Mini cart sidebar
  - `chat/` — Chat widget with WhatsApp-style UI (message bubbles, media support)
  - `estimation/` — Multi-step estimation form with drawing canvas, voice recorder, image uploader
  - `home/` — Homepage sections (hero carousel, stats, categories, featured products, services, testimonials, CTA)
  - `layout/` — Main layout wrapper, navbar, footer, floating action buttons
  - `visualizer/` — Interactive stone customizer with SVG room scenes
  - `ui/` — shadcn/ui primitives
- `src/contexts/` — Cart (localStorage-persisted) and Wishlist (API-synced via server) contexts
- `src/hooks/` — Auth hook (server-based auth state), mobile detection, toast management
- `src/lib/api.ts` — API client helper for making authenticated requests to the server
- `src/types/database.ts` — TypeScript interfaces for all database entities
- `src/i18n/` — Internationalization config and locale files (en.json, hi.json, kn.json)

### Database Tables (Supabase)

- `profiles` — Extended user data (linked to Supabase Auth users)
- `user_roles` — Role-based access control
- `products`, `product_categories` — Product catalog
- `product_reviews` — Product reviews (requires approval)
- `orders`, `order_items` — Order management
- `wishlists` — User wishlists
- `addresses` — Shipping/billing addresses
- `services` — Stone services
- `testimonials` — Admin-curated testimonials
- `customer_reviews` — User-submitted reviews
- `catalogs` — Downloadable catalogs
- `banners` — Homepage banners
- `hero_carousel_cards`, `hero_carousel_settings` — Homepage carousel
- `store_locations` — Store locations
- `enquiries` — Contact form submissions
- `estimation_enquiries` — Estimation requests
- `conversations`, `messages` — Chat system
- `site_visitors` — Analytics
- **Not yet created in Supabase**: `contact_numbers`, `leads`, `crm_notes`, `crm_followups` (routes handle gracefully with empty data)

### Key Features

1. **Product Catalog** — Browsable products with categories, search, grid/list views, wishlist, and cart
2. **Product Reviews** — Customers can rate and review products (reviews require admin approval)
3. **Shopping Cart** — LocalStorage-persisted cart with quantity management, address selection, and order placement
4. **Order Management** — Order tracking with status pipeline (pending -> processing -> shipped -> delivered -> completed)
5. **Invoice PDF Download** — Professional PDF invoices using jsPDF + jspdf-autotable
6. **Estimation System** — Multi-step form with drawing canvas, voice recording, image upload
7. **Live Chat** — WhatsApp-style chat with reference IDs, media support, polling-based updates
8. **Admin Dashboard** — Full CRUD for all entities
9. **About Us Page** — Company story, mission, vision, stats, and values
10. **Stone Visualizer** — Interactive tool for customizing stone selections
11. **AI Assistant** — OpenAI-powered customer support chatbot with streaming responses
12. **CRM System** — Lead management, notes, follow-ups (requires table creation in Supabase)

### Dev Server Configuration

- Frontend: Vite on port **5000** with HMR, proxies `/api` to backend
- Backend: Express on port **3001**
- Production: Backend serves built frontend from `dist/` on port 5000
- `npm run dev` starts Vite dev server

### Environment Variables

- `SUPABASE_URL` — Supabase project URL (server-side, stored in Replit Secrets)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side, stored in Replit Secrets)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (via Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL (via Replit AI Integrations)

## Recent Changes

- **2026-02-23**: Migrated server to use Supabase as database backend
  - Server now uses `@supabase/supabase-js` with service role key instead of Drizzle ORM + Replit PostgreSQL
  - Authentication uses Supabase Auth (server-side) — signup creates Supabase Auth user, signin returns Supabase JWT
  - All CRUD operations use Supabase client (`supabase.from('table').select/insert/update/delete`)
  - Created `server/supabase.ts` for admin client configuration
  - Missing tables (contact_numbers, leads, crm_notes, crm_followups) handled gracefully with empty data
  - Frontend unchanged — still uses server API endpoints via `src/lib/api.ts`
  - Admin emails auto-assigned admin role on signup
- **2026-02-22**: Added comprehensive error handling across the entire application
- **2026-02-19**: Migrated product images from external URLs to local storage
- **2026-02-19**: Added CRM (Customer Relationship Management) system
- **2026-02-18**: Added AI Assistant feature
- **2026-02-16**: Added missing sections and finished incomplete items
- **2026-02-14**: Migrated back to Supabase from Express + Drizzle ORM backend

## Scripts

- `npm run dev` — Start Vite dev server on port 5000
- `npm run build` — Build for production
