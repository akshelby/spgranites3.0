# SP Granites - E-Commerce Platform

## Overview

SP Granites is a full-stack e-commerce web application for a granite, marble, and stone products business. It includes a customer-facing storefront with product browsing, cart/wishlist, order management, estimation requests, and live chat support, alongside a comprehensive admin dashboard for managing products, orders, users, content, and analytics. The app uses a React frontend with an Express + Drizzle ORM backend, backed by Replit's built-in PostgreSQL database.

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
- **API Client**: Custom fetch-based client at `src/lib/api.ts` with token-based auth

### Backend

- **Framework**: Express.js with TypeScript, runs on port 3001 in development
- **ORM**: Drizzle ORM with PostgreSQL (Replit's built-in Neon-backed database)
- **Authentication**: Token-based auth with bcrypt password hashing. Tokens stored in `sessions` table
- **Authorization**: Role-based access control with `user_roles` table (admin, moderator, user)
- **Schema**: Defined in `shared/schema.ts` using Drizzle's pgTable definitions

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
- `src/contexts/` — Cart (localStorage-persisted) and Wishlist (API-synced) contexts
- `src/hooks/` — Auth hook (token-based auth state), mobile detection, toast management
- `src/lib/api.ts` — Frontend API client with token management
- `src/types/database.ts` — TypeScript interfaces for all database entities
- `src/i18n/` — Internationalization config and locale files (en.json, hi.json, kn.json)
- `server/` — Express backend:
  - `server/index.ts` — Server entry point
  - `server/routes.ts` — All API routes (public, protected, admin)
  - `server/db.ts` — Database connection with Drizzle
- `shared/schema.ts` — Drizzle schema definitions for all tables
- `drizzle.config.ts` — Drizzle Kit configuration

### Database Tables

- `users` — User accounts with email/password
- `sessions` — Auth tokens
- `profiles` — Extended user data
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

- Frontend: Vite on port **5000** with HMR and API proxy to backend
- Backend: Express on port **3001**
- Production: Express serves both API and built frontend on port **5000**
- `npm run dev` starts both servers concurrently

## Recent Changes

- **2026-02-14**: Migrated from Supabase to Replit's built-in PostgreSQL with Express + Drizzle ORM backend
  - Replaced Supabase Auth with token-based authentication (email/password)
  - Replaced all Supabase client calls with REST API endpoints via `src/lib/api.ts`
  - Created Express server with comprehensive API routes
  - Created Drizzle schema matching all original Supabase tables
  - Phone OTP auth and Google OAuth marked as "coming soon"
  - Real-time chat replaced with 3-second polling
  - File uploads use data URLs instead of Supabase Storage

## Scripts

- `npm run dev` — Start dev server (frontend + backend)
- `npm run build` — Build for production
- `npm run db:push` — Push schema changes to database
- `npm run db:studio` — Open Drizzle Studio for database management
