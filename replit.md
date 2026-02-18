# SP Granites - E-Commerce Platform

## Overview

SP Granites is a full-stack e-commerce web application for a granite, marble, and stone products business. It includes a customer-facing storefront with product browsing, cart/wishlist, order management, estimation requests, and live chat support, alongside a comprehensive admin dashboard for managing products, orders, users, content, and analytics. The app uses a React frontend with Supabase as the backend (authentication, database, storage).

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

### Backend (Supabase)

- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with email/password login
- **Authorization**: Role-based access control via `user_roles` table (admin, moderator, user)
- **Client**: Supabase JS client at `src/integrations/supabase/client.ts`
- **Types**: Auto-generated Supabase types at `src/integrations/supabase/types.ts`
- **Note**: Some tables use `as any` casts for tables not yet in generated types (e.g., contact_numbers)

### Application Structure

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
- `src/contexts/` — Cart (localStorage-persisted) and Wishlist (API-synced via Supabase) contexts
- `src/hooks/` — Auth hook (Supabase auth state), mobile detection, toast management
- `src/integrations/supabase/` — Supabase client configuration and types
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
- `contact_numbers` — Contact phone numbers
- `enquiries` — Contact form submissions
- `estimation_enquiries` — Estimation requests
- `conversations`, `messages` — Chat system
- `site_visitors` — Analytics

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

### Dev Server Configuration

- Frontend: Vite on port **5000** with HMR
- No backend server needed (all data via Supabase client)
- `npm run dev` starts Vite dev server

### Environment Variables

- `VITE_SUPABASE_URL` — Supabase project URL (public, with hardcoded fallback in client.ts)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/publishable key (public, with hardcoded fallback in client.ts)

## Recent Changes

- **2026-02-18**: Added AI Assistant feature
  - Integrated OpenAI (via Replit AI Integrations) for customer support AI chatbot
  - Added `/api/ai-chat` endpoint with streaming SSE responses, rate limiting, input validation
  - Created AIChatPanel component with suggested prompts, streaming text display
  - Floating action button now toggles AI chat panel (replaces old chat widget)
  - AI assistant is trained on SP Granites context (products, services, stone care tips)
  - Uses gpt-5-nano model for fast, cost-effective responses
  - Vite proxy configured to forward `/api` requests to backend on port 3001
- **2026-02-16**: Added missing sections and finished incomplete items
  - Added CTA (Call to Action) section to homepage
  - Created Privacy Policy page (`/privacy`) and Terms of Service page (`/terms`)
  - Added "About Us" link to navbar navigation
  - Made floating action button functional (opens chat widget)
  - Soft UI styling: softer shadows, rounded corners, improved typography, section spacing
- **2026-02-14**: Migrated back to Supabase from Express + Drizzle ORM backend
  - Restored Supabase Auth for authentication (email/password)
  - Replaced all Express API calls with direct Supabase client queries
  - Removed Express server dependency
  - Added smart fallbacks in client.ts to handle env var misconfiguration
  - Phone OTP auth and Google OAuth marked as "coming soon"
  - Chat system uses 3-second polling for updates
  - Auth redirects via query params (?redirect=/chat, ?mode=signup)

## Scripts

- `npm run dev` — Start Vite dev server on port 5000
- `npm run build` — Build for production
