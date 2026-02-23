import { Express, Request, Response, NextFunction } from "express";
import { supabase } from "./supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const ADMIN_EMAILS = ['akshelby9999@gmail.com', 'srajith9999@gmail.com'];

async function getUserFromToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
  if (error || !data) return null;
  return data.role;
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
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const user = await getUserFromToken(token);
      (req as any).user = user;
      if (user) {
        (req as any).userRole = await getUserRole(user.id);
      }
      next();
    } catch (error) {
      console.error('[Auth Middleware] Error:', error);
      (req as any).user = null;
      (req as any).userRole = null;
      next();
    }
  });

  // ===== AUTH ROUTES =====
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });

      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createError) {
        if (createError.message?.includes('already') || createError.message?.includes('duplicate')) {
          return res.status(400).json({ error: "Email already registered" });
        }
        throw createError;
      }

      const userId = createData.user.id;
      const assignedRole = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user';

      await supabase.from('profiles').insert({ user_id: userId, email, display_name: email.split('@')[0] });
      await supabase.from('user_roles').insert({ user_id: userId, role: assignedRole });

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      res.json({ user: { id: userId, email }, token: signInData.session.access_token, role: assignedRole });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return res.status(400).json({ error: "Invalid credentials" });

      const role = await getUserRole(data.user.id);
      res.json({ user: { id: data.user.id, email: data.user.email }, token: data.session.access_token, role });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/signout", async (_req: Request, res: Response) => {
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) return res.json({ user: null });
      const role = await getUserRole(user.id);
      res.json({ user: { id: user.id, email: user.email }, role });
    } catch (error: any) {
      console.error('[Auth Check Error]:', error.message);
      res.json({ user: null });
    }
  });

  // ===== PRODUCTS =====
  app.get("/api/products", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:slug", async (req: Request, res: Response) => {
    try {
      const { data: product, error } = await supabase.from('products').select('*').eq('slug', req.params.slug).maybeSingle();
      if (error) throw error;
      if (!product) return res.status(404).json({ error: "Product not found" });

      let category = null;
      if (product.category_id) {
        const { data: cat } = await supabase.from('product_categories').select('*').eq('id', product.category_id).maybeSingle();
        category = cat || null;
      }

      const { data: reviews } = await supabase.from('product_reviews').select('*').eq('product_id', product.id).eq('is_approved', true);
      res.json({ ...product, category, reviews: reviews || [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CATEGORIES =====
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('product_categories').select('*').eq('is_active', true);
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== SERVICES =====
  app.get("/api/services", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('services').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== TESTIMONIALS =====
  app.get("/api/testimonials", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('testimonials').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CUSTOMER REVIEWS =====
  app.get("/api/customer-reviews", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('customer_reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customer-reviews", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('customer_reviews').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== BANNERS =====
  app.get("/api/banners", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CATALOGS =====
  app.get("/api/catalogs", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('catalogs').select('*').eq('is_active', true);
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/catalogs/:id/download", async (req: Request, res: Response) => {
    try {
      const { data: catalog, error: fetchError } = await supabase.from('catalogs').select('download_count').eq('id', req.params.id).single();
      if (fetchError) throw fetchError;
      const { error: updateError } = await supabase.from('catalogs').update({ download_count: (catalog.download_count || 0) + 1 }).eq('id', req.params.id);
      if (updateError) throw updateError;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== HERO CAROUSEL =====
  app.get("/api/hero-carousel/cards", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('hero_carousel_cards').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/hero-carousel/settings", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('hero_carousel_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      res.json(data || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== STORE LOCATIONS =====
  app.get("/api/store-locations", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('store_locations').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CONTACT NUMBERS =====
  app.get("/api/contact-numbers", async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('contact_numbers').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ENQUIRIES =====
  app.post("/api/enquiries", async (req: Request, res: Response) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address" });
      }
      const { data, error } = await supabase.from('enquiries').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('[Enquiry Error]:', error.message);
      res.status(500).json({ error: "Failed to submit enquiry. Please try again." });
    }
  });

  // ===== ESTIMATION ENQUIRIES =====
  app.post("/api/estimation-enquiries", async (req: Request, res: Response) => {
    try {
      const { name, phone } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone number are required" });
      }
      const { data, error } = await supabase.from('estimation_enquiries').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('[Estimation Enquiry Error]:', error.message);
      res.status(500).json({ error: "Failed to submit estimation request. Please try again." });
    }
  });

  // ===== SITE VISITORS =====
  app.post("/api/site-visitors", async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('site_visitors').insert(req.body);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PROTECTED: PROFILE =====
  app.get("/api/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      res.json(data || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase.from('profiles').update({ ...req.body, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PROTECTED: ADDRESSES =====
  app.get("/api/addresses", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId);
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/addresses", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase.from('addresses').insert({ ...req.body, user_id: userId }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/addresses/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase.from('addresses').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).eq('user_id', userId).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/addresses/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase.from('addresses').delete().eq('id', req.params.id).eq('user_id', userId);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PROTECTED: WISHLIST =====
  app.get("/api/wishlist", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase.from('wishlists').select('*').eq('user_id', userId);
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/wishlist", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase.from('wishlists').insert({ user_id: userId, product_id: req.body.product_id }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/wishlist/:productId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { error } = await supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', req.params.productId);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PROTECTED: ORDERS =====
  app.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const isAdmin = (req as any).userRole === "admin";
      let query = supabase.from('orders').select('*').eq('id', req.params.id);
      if (!isAdmin) {
        query = query.eq('user_id', userId);
      }
      const { data: order, error } = await query.maybeSingle();
      if (error) throw error;
      if (!order) return res.status(404).json({ error: "Order not found" });
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
      res.json({ ...order, items: items || [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const { items, ...orderData } = req.body;
      const { data: order, error } = await supabase.from('orders').insert({ ...orderData, user_id: userId, order_number: orderNumber }).select().single();
      if (error) throw error;

      if (items && items.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(
          items.map((item: any) => ({ ...item, order_id: order.id }))
        );
        if (itemsError) throw itemsError;
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
      const { data, error } = await supabase.from('product_reviews').insert({ ...req.body, user_id: userId }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CHAT/CONVERSATIONS =====
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { ref_id } = req.query;
      if (ref_id) {
        const { data: conv, error } = await supabase.from('conversations').select('*').eq('ref_id', ref_id as string).maybeSingle();
        if (error) throw error;
        return res.json(conv || null);
      }
      const { data, error } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('conversations').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', req.params.id).order('created_at', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      const { data: msg, error } = await supabase.from('messages').insert(req.body).select().single();
      if (error) throw error;
      if (msg.content_text) {
        await supabase.from('conversations').update({
          last_message_at: msg.created_at,
          last_message_preview: msg.content_text.substring(0, 100),
          updated_at: new Date().toISOString(),
        }).eq('id', msg.conversation_id);
      }
      res.json(msg);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/conversations/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('conversations').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ADMIN ROUTES =====

  // Admin: All products (including inactive)
  app.get("/api/admin/products", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/products", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('products').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/products/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('products').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/products/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Categories
  app.get("/api/admin/categories", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('product_categories').select('*');
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/categories", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('product_categories').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/categories/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('product_categories').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/categories/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('product_categories').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Orders
  app.get("/api/admin/orders", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/orders/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('orders').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Enquiries
  app.get("/api/admin/enquiries", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/enquiries/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('enquiries').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/enquiries/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('enquiries').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Estimation Enquiries
  app.get("/api/admin/estimations", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('estimation_enquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/estimations/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('estimation_enquiries').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Reviews
  app.get("/api/admin/reviews", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data: productReviewsList, error: prError } = await supabase.from('product_reviews').select('*').order('created_at', { ascending: false });
      if (prError) throw prError;
      const { data: customerReviewsList, error: crError } = await supabase.from('customer_reviews').select('*').order('created_at', { ascending: false });
      if (crError) throw crError;
      res.json({ productReviews: productReviewsList, customerReviews: customerReviewsList });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/product-reviews/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('product_reviews').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/customer-reviews/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('customer_reviews').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/product-reviews/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('product_reviews').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/customer-reviews/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('customer_reviews').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Testimonials
  app.get("/api/admin/testimonials", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('testimonials').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/testimonials", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('testimonials').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/testimonials/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('testimonials').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/testimonials/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Services
  app.get("/api/admin/services", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('services').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/services", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('services').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/services/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('services').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/services/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Catalogs
  app.get("/api/admin/catalogs", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('catalogs').select('*');
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/catalogs", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('catalogs').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/catalogs/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('catalogs').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/catalogs/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('catalogs').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Banners
  app.get("/api/admin/banners", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('banners').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/banners", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('banners').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/banners/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('banners').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/banners/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('banners').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Carousel
  app.get("/api/admin/carousel/cards", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('hero_carousel_cards').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/carousel/cards", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('hero_carousel_cards').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/carousel/cards/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('hero_carousel_cards').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/carousel/cards/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('hero_carousel_cards').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/carousel/settings", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data: existing } = await supabase.from('hero_carousel_settings').select('*').limit(1).maybeSingle();
      if (existing) {
        const { data, error } = await supabase.from('hero_carousel_settings').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single();
        if (error) throw error;
        res.json(data);
      } else {
        const { data, error } = await supabase.from('hero_carousel_settings').insert(req.body).select().single();
        if (error) throw error;
        res.json(data);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Locations
  app.get("/api/admin/locations", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('store_locations').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/locations", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('store_locations').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/locations/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('store_locations').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/locations/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('store_locations').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Contact Numbers
  app.get("/api/admin/contact-numbers", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('contact_numbers').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/contact-numbers", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('contact_numbers').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/contact-numbers/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('contact_numbers').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/contact-numbers/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('contact_numbers').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Users
  app.get("/api/admin/users", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const { data: rolesData } = await supabase.from('user_roles').select('*');
      const { data: profilesData } = await supabase.from('profiles').select('*');

      const result = authData.users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        role: (rolesData || []).find((r: any) => r.user_id === u.id)?.role || "user",
        profile: (profilesData || []).find((p: any) => p.user_id === u.id) || null,
      }));

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/users/:id/role", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const { data: existing } = await supabase.from('user_roles').select('*').eq('user_id', req.params.id).maybeSingle();
      if (existing) {
        await supabase.from('user_roles').update({ role }).eq('user_id', req.params.id);
      } else {
        await supabase.from('user_roles').insert({ user_id: req.params.id, role });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Analytics / Dashboard
  app.get("/api/admin/dashboard", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: enquiryCount } = await supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('is_read', false);
      const { count: estimationCount } = await supabase.from('estimation_enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new');
      const { data: recentOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
      const { count: visitorCount } = await supabase.from('site_visitors').select('*', { count: 'exact', head: true });

      res.json({
        products: productCount || 0,
        orders: orderCount || 0,
        users: userCount || 0,
        unreadEnquiries: enquiryCount || 0,
        newEstimations: estimationCount || 0,
        visitors: visitorCount || 0,
        recentOrders: recentOrders || [],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/analytics", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data: visitors, error } = await supabase.from('site_visitors').select('*').order('visited_at', { ascending: false }).limit(100);
      if (error) throw error;
      res.json({ visitors });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Chat
  app.get("/api/admin/conversations", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CRM: Leads =====
  app.get("/api/admin/leads", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/leads", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('leads').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/leads/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('leads').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/leads/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('leads').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CRM: Notes =====
  app.get("/api/admin/crm-notes", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { lead_id, user_id } = req.query;
      let query = supabase.from('crm_notes').select('*');
      if (lead_id) {
        query = query.eq('lead_id', lead_id as string);
      } else if (user_id) {
        query = query.eq('user_id', user_id as string);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/crm-notes", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('crm_notes').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/crm-notes/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('crm_notes').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CRM: Followups =====
  app.get("/api/admin/crm-followups", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { lead_id, user_id } = req.query;
      let query = supabase.from('crm_followups').select('*');
      if (lead_id) {
        query = query.eq('lead_id', lead_id as string);
      } else if (user_id) {
        query = query.eq('user_id', user_id as string);
      }
      const { data, error } = await query.order('due_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/crm-followups", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('crm_followups').insert(req.body).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/crm-followups/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('crm_followups').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/crm-followups/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.from('crm_followups').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CRM: Dashboard =====
  app.get("/api/admin/crm/overview", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      const { data: allLeads, error: leadsError } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (leadsError) throw leadsError;
      const { data: upcomingFollowups, error: followupsError } = await supabase.from('crm_followups').select('*').eq('status', 'pending').order('due_at', { ascending: true }).limit(10);
      if (followupsError) throw followupsError;
      res.json({ leads: allLeads, upcomingFollowups });
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
