import { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, desc, and, ilike, sql, asc } from "drizzle-orm";
import * as schema from "../shared/schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

async function getUserFromToken(token: string | undefined) {
  if (!token) return null;
  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.token, token))
    .limit(1);
  if (!session || new Date(session.expires_at) < new Date()) return null;
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.user_id))
    .limit(1);
  return user || null;
}

async function getUserRole(userId: string): Promise<string | null> {
  const [role] = await db
    .select()
    .from(schema.userRoles)
    .where(eq(schema.userRoles.user_id, userId))
    .limit(1);
  return role?.role || null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if ((req as any).userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function registerRoutes(app: Express) {
  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const user = await getUserFromToken(token);
    (req as any).user = user;
    if (user) {
      (req as any).userRole = await getUserRole(user.id);
    }
    next();
  });

  // ===== AUTH ROUTES =====
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });

      const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      if (existing.length > 0) return res.status(400).json({ error: "Email already registered" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db.insert(schema.users).values({ email, password: hashedPassword }).returning();

      await db.insert(schema.profiles).values({ user_id: user.id, email });
      await db.insert(schema.userRoles).values({ user_id: user.id, role: "user" });

      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.insert(schema.sessions).values({ user_id: user.id, token, expires_at: expiresAt });

      res.json({ user: { id: user.id, email: user.email }, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      if (!user || !user.password) return res.status(400).json({ error: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ error: "Invalid credentials" });

      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.insert(schema.sessions).values({ user_id: user.id, token, expires_at: expiresAt });

      const role = await getUserRole(user.id);
      res.json({ user: { id: user.id, email: user.email }, token, role });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/signout", async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
    }
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.json({ user: null });
    const role = await getUserRole(user.id);
    res.json({ user: { id: user.id, email: user.email }, role });
  });

  // ===== PRODUCTS =====
  app.get("/api/products", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.products).where(eq(schema.products.is_active, true)).orderBy(desc(schema.products.created_at));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:slug", async (req: Request, res: Response) => {
    try {
      const [product] = await db.select().from(schema.products).where(eq(schema.products.slug, req.params.slug)).limit(1);
      if (!product) return res.status(404).json({ error: "Product not found" });
      
      let category = null;
      if (product.category_id) {
        const [cat] = await db.select().from(schema.productCategories).where(eq(schema.productCategories.id, product.category_id)).limit(1);
        category = cat || null;
      }
      
      const reviews = await db.select().from(schema.productReviews).where(and(eq(schema.productReviews.product_id, product.id), eq(schema.productReviews.is_approved, true)));
      res.json({ ...product, category, reviews });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CATEGORIES =====
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.productCategories).where(eq(schema.productCategories.is_active, true));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== SERVICES =====
  app.get("/api/services", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.services).where(eq(schema.services.is_active, true)).orderBy(asc(schema.services.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== TESTIMONIALS =====
  app.get("/api/testimonials", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.testimonials).where(eq(schema.testimonials.is_active, true)).orderBy(asc(schema.testimonials.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CUSTOMER REVIEWS =====
  app.get("/api/customer-reviews", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.customerReviews).where(eq(schema.customerReviews.is_approved, true)).orderBy(desc(schema.customerReviews.created_at));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customer-reviews", async (req: Request, res: Response) => {
    try {
      const [review] = await db.insert(schema.customerReviews).values(req.body).returning();
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== BANNERS =====
  app.get("/api/banners", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.banners).where(eq(schema.banners.is_active, true)).orderBy(asc(schema.banners.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CATALOGS =====
  app.get("/api/catalogs", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.catalogs).where(eq(schema.catalogs.is_active, true));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/catalogs/:id/download", async (req: Request, res: Response) => {
    try {
      await db.update(schema.catalogs).set({ download_count: sql`${schema.catalogs.download_count} + 1` }).where(eq(schema.catalogs.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== HERO CAROUSEL =====
  app.get("/api/hero-carousel/cards", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.heroCarouselCards).where(eq(schema.heroCarouselCards.is_active, true)).orderBy(asc(schema.heroCarouselCards.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/hero-carousel/settings", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.heroCarouselSettings).limit(1);
      res.json(result[0] || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== STORE LOCATIONS =====
  app.get("/api/store-locations", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.storeLocations).where(eq(schema.storeLocations.is_active, true)).orderBy(asc(schema.storeLocations.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CONTACT NUMBERS =====
  app.get("/api/contact-numbers", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.contactNumbers).where(eq(schema.contactNumbers.is_active, true)).orderBy(asc(schema.contactNumbers.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ENQUIRIES =====
  app.post("/api/enquiries", async (req: Request, res: Response) => {
    try {
      const [enquiry] = await db.insert(schema.enquiries).values(req.body).returning();
      res.json(enquiry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ESTIMATION ENQUIRIES =====
  app.post("/api/estimation-enquiries", async (req: Request, res: Response) => {
    try {
      const [enquiry] = await db.insert(schema.estimationEnquiries).values(req.body).returning();
      res.json(enquiry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== SITE VISITORS =====
  app.post("/api/site-visitors", async (req: Request, res: Response) => {
    try {
      await db.insert(schema.siteVisitors).values(req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PROTECTED: PROFILE =====
  app.get("/api/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.user_id, userId)).limit(1);
      res.json(profile || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const [profile] = await db.update(schema.profiles).set({ ...req.body, updated_at: new Date() }).where(eq(schema.profiles.user_id, userId)).returning();
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PROTECTED: ADDRESSES =====
  app.get("/api/addresses", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const result = await db.select().from(schema.addresses).where(eq(schema.addresses.user_id, userId));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/addresses", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const [addr] = await db.insert(schema.addresses).values({ ...req.body, user_id: userId }).returning();
      res.json(addr);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/addresses/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const [addr] = await db.update(schema.addresses).set({ ...req.body, updated_at: new Date() }).where(and(eq(schema.addresses.id, req.params.id), eq(schema.addresses.user_id, userId))).returning();
      res.json(addr);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/addresses/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      await db.delete(schema.addresses).where(and(eq(schema.addresses.id, req.params.id), eq(schema.addresses.user_id, userId)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PROTECTED: WISHLIST =====
  app.get("/api/wishlist", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const result = await db.select().from(schema.wishlists).where(eq(schema.wishlists.user_id, userId));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/wishlist", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const [item] = await db.insert(schema.wishlists).values({ user_id: userId, product_id: req.body.product_id }).returning();
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/wishlist/:productId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      await db.delete(schema.wishlists).where(and(eq(schema.wishlists.user_id, userId), eq(schema.wishlists.product_id, req.params.productId)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PROTECTED: ORDERS =====
  app.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const result = await db.select().from(schema.orders).where(eq(schema.orders.user_id, userId)).orderBy(desc(schema.orders.created_at));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const isAdmin = (req as any).userRole === "admin";
      const conditions = isAdmin
        ? eq(schema.orders.id, req.params.id)
        : and(eq(schema.orders.id, req.params.id), eq(schema.orders.user_id, userId));
      const [order] = await db.select().from(schema.orders).where(conditions).limit(1);
      if (!order) return res.status(404).json({ error: "Order not found" });
      const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.order_id, order.id));
      res.json({ ...order, items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const { items, ...orderData } = req.body;
      const [order] = await db.insert(schema.orders).values({ ...orderData, user_id: userId, order_number: orderNumber }).returning();
      
      if (items && items.length > 0) {
        await db.insert(schema.orderItems).values(
          items.map((item: any) => ({ ...item, order_id: order.id }))
        );
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PROTECTED: PRODUCT REVIEWS =====
  app.post("/api/product-reviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const [review] = await db.insert(schema.productReviews).values({ ...req.body, user_id: userId }).returning();
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CHAT/CONVERSATIONS =====
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { ref_id } = req.query;
      if (ref_id) {
        const [conv] = await db.select().from(schema.conversations).where(eq(schema.conversations.ref_id, ref_id as string)).limit(1);
        return res.json(conv || null);
      }
      const result = await db.select().from(schema.conversations).orderBy(desc(schema.conversations.last_message_at));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const [conv] = await db.insert(schema.conversations).values(req.body).returning();
      res.json(conv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.messages).where(eq(schema.messages.conversation_id, req.params.id)).orderBy(asc(schema.messages.created_at));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      const [msg] = await db.insert(schema.messages).values(req.body).returning();
      if (msg.content_text) {
        await db.update(schema.conversations).set({
          last_message_at: msg.created_at,
          last_message_preview: msg.content_text.substring(0, 100),
          updated_at: new Date(),
        }).where(eq(schema.conversations.id, msg.conversation_id));
      }
      res.json(msg);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ADMIN ROUTES =====
  
  // Admin: All products (including inactive)
  app.get("/api/admin/products", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.products).orderBy(desc(schema.products.created_at));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/products", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [product] = await db.insert(schema.products).values(req.body).returning();
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/products/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [product] = await db.update(schema.products).set({ ...req.body, updated_at: new Date() }).where(eq(schema.products.id, req.params.id)).returning();
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/products/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.products).where(eq(schema.products.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Categories
  app.get("/api/admin/categories", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.productCategories);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/categories", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [cat] = await db.insert(schema.productCategories).values(req.body).returning();
      res.json(cat);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/categories/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [cat] = await db.update(schema.productCategories).set({ ...req.body, updated_at: new Date() }).where(eq(schema.productCategories.id, req.params.id)).returning();
      res.json(cat);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/categories/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.productCategories).where(eq(schema.productCategories.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Orders
  app.get("/api/admin/orders", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.orders).orderBy(desc(schema.orders.created_at));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/orders/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [order] = await db.update(schema.orders).set({ ...req.body, updated_at: new Date() }).where(eq(schema.orders.id, req.params.id)).returning();
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Enquiries
  app.get("/api/admin/enquiries", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.enquiries).orderBy(desc(schema.enquiries.created_at));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/enquiries/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [enq] = await db.update(schema.enquiries).set({ ...req.body, updated_at: new Date() }).where(eq(schema.enquiries.id, req.params.id)).returning();
      res.json(enq);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/enquiries/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.enquiries).where(eq(schema.enquiries.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Estimation Enquiries
  app.get("/api/admin/estimations", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.estimationEnquiries).orderBy(desc(schema.estimationEnquiries.created_at));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/estimations/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [est] = await db.update(schema.estimationEnquiries).set({ ...req.body, updated_at: new Date() }).where(eq(schema.estimationEnquiries.id, req.params.id)).returning();
      res.json(est);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Reviews
  app.get("/api/admin/reviews", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const productReviewsList = await db.select().from(schema.productReviews).orderBy(desc(schema.productReviews.created_at));
      const customerReviewsList = await db.select().from(schema.customerReviews).orderBy(desc(schema.customerReviews.created_at));
      res.json({ productReviews: productReviewsList, customerReviews: customerReviewsList });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/product-reviews/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [review] = await db.update(schema.productReviews).set({ ...req.body, updated_at: new Date() }).where(eq(schema.productReviews.id, req.params.id)).returning();
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/customer-reviews/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [review] = await db.update(schema.customerReviews).set({ ...req.body, updated_at: new Date() }).where(eq(schema.customerReviews.id, req.params.id)).returning();
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/product-reviews/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.productReviews).where(eq(schema.productReviews.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/customer-reviews/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.customerReviews).where(eq(schema.customerReviews.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Testimonials
  app.get("/api/admin/testimonials", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.testimonials).orderBy(asc(schema.testimonials.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/testimonials", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [t] = await db.insert(schema.testimonials).values(req.body).returning();
      res.json(t);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/testimonials/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [t] = await db.update(schema.testimonials).set({ ...req.body, updated_at: new Date() }).where(eq(schema.testimonials.id, req.params.id)).returning();
      res.json(t);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/testimonials/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.testimonials).where(eq(schema.testimonials.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Services
  app.get("/api/admin/services", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.services).orderBy(asc(schema.services.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/services", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [s] = await db.insert(schema.services).values(req.body).returning();
      res.json(s);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/services/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [s] = await db.update(schema.services).set({ ...req.body, updated_at: new Date() }).where(eq(schema.services.id, req.params.id)).returning();
      res.json(s);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/services/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.services).where(eq(schema.services.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Catalogs
  app.get("/api/admin/catalogs", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.catalogs);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/catalogs", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [c] = await db.insert(schema.catalogs).values(req.body).returning();
      res.json(c);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/catalogs/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [c] = await db.update(schema.catalogs).set({ ...req.body, updated_at: new Date() }).where(eq(schema.catalogs.id, req.params.id)).returning();
      res.json(c);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/catalogs/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.catalogs).where(eq(schema.catalogs.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Banners
  app.get("/api/admin/banners", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.banners).orderBy(asc(schema.banners.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/banners", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [b] = await db.insert(schema.banners).values(req.body).returning();
      res.json(b);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/banners/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [b] = await db.update(schema.banners).set({ ...req.body, updated_at: new Date() }).where(eq(schema.banners.id, req.params.id)).returning();
      res.json(b);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/banners/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.banners).where(eq(schema.banners.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Carousel
  app.get("/api/admin/carousel/cards", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.heroCarouselCards).orderBy(asc(schema.heroCarouselCards.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/carousel/cards", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [c] = await db.insert(schema.heroCarouselCards).values(req.body).returning();
      res.json(c);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/carousel/cards/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [c] = await db.update(schema.heroCarouselCards).set({ ...req.body, updated_at: new Date() }).where(eq(schema.heroCarouselCards.id, req.params.id)).returning();
      res.json(c);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/carousel/cards/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.heroCarouselCards).where(eq(schema.heroCarouselCards.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/carousel/settings", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const existing = await db.select().from(schema.heroCarouselSettings).limit(1);
      if (existing.length > 0) {
        const [s] = await db.update(schema.heroCarouselSettings).set({ ...req.body, updated_at: new Date() }).where(eq(schema.heroCarouselSettings.id, existing[0].id)).returning();
        res.json(s);
      } else {
        const [s] = await db.insert(schema.heroCarouselSettings).values(req.body).returning();
        res.json(s);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Locations
  app.get("/api/admin/locations", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.storeLocations).orderBy(asc(schema.storeLocations.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/locations", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [l] = await db.insert(schema.storeLocations).values(req.body).returning();
      res.json(l);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/locations/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [l] = await db.update(schema.storeLocations).set({ ...req.body, updated_at: new Date() }).where(eq(schema.storeLocations.id, req.params.id)).returning();
      res.json(l);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/locations/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.storeLocations).where(eq(schema.storeLocations.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Contact Numbers
  app.get("/api/admin/contact-numbers", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.contactNumbers).orderBy(asc(schema.contactNumbers.display_order));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/contact-numbers", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [cn] = await db.insert(schema.contactNumbers).values(req.body).returning();
      res.json(cn);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/contact-numbers/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [cn] = await db.update(schema.contactNumbers).set({ ...req.body, updated_at: new Date() }).where(eq(schema.contactNumbers.id, req.params.id)).returning();
      res.json(cn);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/contact-numbers/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      await db.delete(schema.contactNumbers).where(eq(schema.contactNumbers.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Users
  app.get("/api/admin/users", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const usersList = await db.select({
        id: schema.users.id,
        email: schema.users.email,
        created_at: schema.users.created_at,
      }).from(schema.users).orderBy(desc(schema.users.created_at));
      
      const rolesData = await db.select().from(schema.userRoles);
      const profilesData = await db.select().from(schema.profiles);
      
      const result = usersList.map(u => ({
        ...u,
        role: rolesData.find(r => r.user_id === u.id)?.role || "user",
        profile: profilesData.find(p => p.user_id === u.id) || null,
      }));
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/users/:id/role", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const existing = await db.select().from(schema.userRoles).where(eq(schema.userRoles.user_id, req.params.id)).limit(1);
      if (existing.length > 0) {
        await db.update(schema.userRoles).set({ role }).where(eq(schema.userRoles.user_id, req.params.id));
      } else {
        await db.insert(schema.userRoles).values({ user_id: req.params.id, role });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Analytics / Dashboard
  app.get("/api/admin/dashboard", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.products);
      const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.orders);
      const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
      const [enquiryCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.enquiries).where(eq(schema.enquiries.is_read, false));
      const [estimationCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.estimationEnquiries).where(eq(schema.estimationEnquiries.status, "new"));
      const recentOrders = await db.select().from(schema.orders).orderBy(desc(schema.orders.created_at)).limit(5);
      const [visitorCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.siteVisitors);

      res.json({
        products: Number(productCount.count),
        orders: Number(orderCount.count),
        users: Number(userCount.count),
        unreadEnquiries: Number(enquiryCount.count),
        newEstimations: Number(estimationCount.count),
        visitors: Number(visitorCount.count),
        recentOrders,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/analytics", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const visitors = await db.select().from(schema.siteVisitors).orderBy(desc(schema.siteVisitors.visited_at)).limit(100);
      res.json({ visitors });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Chat
  app.get("/api/admin/conversations", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(schema.conversations).orderBy(desc(schema.conversations.last_message_at));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/conversations/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const [conv] = await db.update(schema.conversations).set({ ...req.body, updated_at: new Date() }).where(eq(schema.conversations.id, req.params.id)).returning();
      res.json(conv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== AI ASSISTANT =====
  const aiRateLimit = new Map<string, number[]>();
  app.post("/api/ai-chat", async (req: Request, res: Response) => {
    try {
      const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const now = Date.now();
      const windowMs = 60000;
      const maxRequests = 10;
      const timestamps = aiRateLimit.get(String(clientIp)) || [];
      const recent = timestamps.filter(t => now - t < windowMs);
      if (recent.length >= maxRequests) {
        return res.status(429).json({ error: "Too many requests. Please wait a moment." });
      }
      recent.push(now);
      aiRateLimit.set(String(clientIp), recent);

      const { messages: chatMessages } = req.body;
      if (!chatMessages || !Array.isArray(chatMessages)) {
        return res.status(400).json({ error: "messages array is required" });
      }

      if (chatMessages.length > 50) {
        return res.status(400).json({ error: "Too many messages. Please start a new conversation." });
      }

      for (const msg of chatMessages) {
        if (!msg.role || !msg.content || typeof msg.content !== 'string') {
          return res.status(400).json({ error: "Invalid message format" });
        }
        if (msg.content.length > 2000) {
          return res.status(400).json({ error: "Message too long (max 2000 characters)" });
        }
      }

      const systemPrompt = `You are the SP Granites AI Assistant — a friendly and knowledgeable customer support agent for SP Granites, a premium granite, marble, and natural stone products company with 25+ years of experience in India.

Your role:
- Help customers with product inquiries about granite, marble, quartz, and natural stone
- Provide guidance on stone selection for kitchens, bathrooms, flooring, countertops, and exterior use
- Answer questions about pricing (give general ranges, suggest contacting the store for exact quotes)
- Help with order tracking, estimation requests, and store locations
- Provide care and maintenance tips for stone surfaces
- Guide customers to the right pages on the website (Products, Services, Estimation, Contact)

Tone: Warm, professional, and helpful. Keep responses concise but informative. Use simple language.

Key facts about SP Granites:
- Premium stone products: granite, marble, quartz, sandstone, slate
- Services: cutting, polishing, installation, restoration, custom fabrication
- Based in India with physical store locations
- Offers free estimation for projects
- Website has a Stone Visualizer tool to preview stones in rooms

If you don't know something specific (like exact prices or stock availability), suggest the customer contact the store directly or submit an estimation request on the website.`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMessages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
        max_completion_tokens: 8192,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("AI chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Something went wrong" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to get AI response" });
      }
    }
  });
}
