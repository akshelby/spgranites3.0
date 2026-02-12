# SP Granites - E-Commerce Platform

## Overview

SP Granites is a full-stack e-commerce web application for a granite, marble, and stone products business. It includes a customer-facing storefront with product browsing, cart/wishlist, order management, estimation requests, and live chat support, alongside a comprehensive admin dashboard for managing products, orders, users, content, and analytics. The app is built as a React SPA with Supabase as the backend-as-a-service.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React 18 with TypeScript, built with Vite and SWC for fast compilation
- **Routing**: React Router DOM with BrowserRouter for client-side navigation
- **Styling**: Tailwind CSS with CSS variables for theming (warm stone-inspired color palette with gold/amber accents). Uses the shadcn/ui component library built on top of Radix UI primitives
- **State Management**: React Context API for global state (CartContext, WishlistContext, AuthContext, ChatContext). React Query (@tanstack/react-query) for server state and data fetching
- **Animations**: Framer Motion for page transitions and UI animations
- **Forms**: React Hook Form with Zod schema validation
- **Component Library**: shadcn/ui (configured via components.json). Components live in `src/components/ui/`. Path alias `@/` maps to `src/`
- **Testing**: Vitest with jsdom environment, React Testing Library

### Application Structure

- `src/pages/` — Route-level page components (HomePage, ProductsPage, Auth, admin pages, etc.)
- `src/components/` — Reusable components organized by feature:
  - `admin/` — Admin layout, data tables, stats cards, page headers
  - `auth/` — Email auth, phone OTP auth, social auth (Google), password input
  - `cart/` — Mini cart sidebar
  - `chat/` — Real-time chat widget with WhatsApp-style UI (message bubbles, media support, voice recording)
  - `estimation/` — Multi-step estimation form with drawing canvas, voice recorder, image uploader
  - `home/` — Homepage sections (hero carousel, stats, categories, featured products, services, testimonials, CTA)
  - `layout/` — Main layout wrapper (referenced but not shown in full)
  - `visualizer/` — Interactive stone customizer with SVG room scenes (kitchen, dining, vanity), texture previews using CSS gradients, edge profile display, and controls panel
  - `ui/` — shadcn/ui primitives
- `src/contexts/` — Cart (localStorage-persisted) and Wishlist (Supabase-synced) contexts
- `src/hooks/` — Auth hook (Supabase auth state), mobile detection, toast management
- `src/types/database.ts` — TypeScript interfaces for all database entities (Product, Order, Category, etc.)
- `src/integrations/supabase/` — Supabase client configuration

### Backend (Supabase)

- **Authentication**: Supabase Auth with multiple methods:
  - Email/password sign up and sign in
  - Phone OTP (SMS and WhatsApp channels)
  - Google OAuth
- **Authorization**: Role-based access control with a `user_roles` table. Three roles: admin, moderator, user. ProtectedRoute component enforces role hierarchy
- **Database**: Supabase (PostgreSQL) with tables for:
  - `products`, `product_categories` — Product catalog
  - `orders`, `order_items` — Order management
  - `addresses`, `profiles` — User data
  - `wishlists` — User wishlists (synced to Supabase when logged in)
  - `services`, `testimonials`, `customer_reviews` — Content
  - `catalogs` — Downloadable catalog files with download counts
  - `hero_carousel_cards` — Homepage carousel content
  - `user_roles` — RBAC
  - Chat-related tables for real-time customer support conversations
- **Storage**: Supabase Storage for file uploads (estimation images, voice recordings, chat media) in buckets like `estimation-files`
- **Real-time**: Supabase real-time subscriptions used for the chat feature

### Key Features

1. **Product Catalog** — Browsable products with categories, search, grid/list views, wishlist, and cart
2. **Shopping Cart** — LocalStorage-persisted cart with quantity management, address selection, and order placement
3. **Order Management** — Order tracking with status pipeline (pending → processing → shipped → delivered → completed)
4. **Estimation System** — Multi-step form with drawing canvas, voice recording, image upload for custom stone project quotes
5. **Live Chat** — WhatsApp-style chat with reference IDs, media support (images, video, audio), real-time updates, conversation history
6. **Admin Dashboard** — Full CRUD for products, categories, orders, enquiries, estimations, reviews, testimonials, services, catalogs, banners, carousel, locations, users, analytics, and admin chat
7. **PDF Generation** — jspdf and jspdf-autotable for document generation (likely for estimation reports or invoices)
8. **Stone Visualizer** — Interactive car-configurator-style tool at `/visualizer` for customizing kitchen countertops, dining tables, and vanity tops with 12 stone colors (granite/marble/quartz), 6 edge profiles, 4 finishes, and live SVG preview. "Request Estimate" CTA passes configuration to the estimation form via URL query params

### Dev Server Configuration

- Runs on port **8080** with HMR overlay disabled
- Development mode includes lovable-tagger plugin for component tagging

## External Dependencies

### Core Services
- **Supabase** (`@supabase/supabase-js`) — Backend-as-a-service providing PostgreSQL database, authentication, file storage, and real-time subscriptions. This is the sole backend; there is no custom server

### Key NPM Packages
- **React Router DOM** — Client-side routing
- **@tanstack/react-query** — Async state management and caching
- **Framer Motion** — Animation library
- **Radix UI** — Accessible UI primitives (dialog, dropdown, tabs, toast, etc.)
- **React Hook Form + Zod** — Form management and validation
- **date-fns** — Date formatting and manipulation
- **jspdf + jspdf-autotable** — Client-side PDF generation
- **embla-carousel-react** — Carousel/slider component
- **cmdk** — Command menu component
- **input-otp** — OTP input for phone authentication
- **lucide-react** — Icon library
- **class-variance-authority + clsx + tailwind-merge** — Utility-first CSS class management
- **sonner** — Toast notification library (used alongside shadcn toast)