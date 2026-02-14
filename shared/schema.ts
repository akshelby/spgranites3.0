import { pgTable, uuid, text, timestamp, boolean, integer, decimal, jsonb, serial, varchar, date, index } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique(),
  password: text("password"),
  phone: text("phone"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  display_name: text("display_name"),
  avatar_url: text("avatar_url"),
  phone: text("phone"),
  address: text("address"),
  full_name: text("full_name"),
  email: text("email"),
  alternate_phone: text("alternate_phone"),
  gender: text("gender"),
  date_of_birth: date("date_of_birth"),
  address_line_1: text("address_line_1"),
  address_line_2: text("address_line_2"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  country: text("country").default("India"),
  company_name: text("company_name"),
  gst_number: text("gst_number"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("user"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productCategories = pgTable("product_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image_url: text("image_url"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  short_description: text("short_description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compare_price: decimal("compare_price", { precision: 10, scale: 2 }),
  stock_quantity: integer("stock_quantity").notNull().default(0),
  images: text("images").array().default(sql`'{}'`),
  specifications: jsonb("specifications").default({}),
  category_id: uuid("category_id").references(() => productCategories.id, { onDelete: "set null" }),
  is_active: boolean("is_active").notNull().default(true),
  is_featured: boolean("is_featured").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productReviews = pgTable("product_reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  product_id: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull(),
  rating: integer("rating").notNull(),
  review_text: text("review_text"),
  is_approved: boolean("is_approved").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull(),
  order_number: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax_amount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  shipping_amount: decimal("shipping_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shipping_address: jsonb("shipping_address"),
  billing_address: jsonb("billing_address"),
  payment_id: text("payment_id"),
  payment_status: text("payment_status").default("pending"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  order_id: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  product_name: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const wishlists = pgTable("wishlists", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull(),
  product_id: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull(),
  label: text("label"),
  full_name: text("full_name").notNull(),
  phone: text("phone").notNull(),
  address_line_1: text("address_line_1").notNull(),
  address_line_2: text("address_line_2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  country: text("country").notNull().default("India"),
  address_type: text("address_type").default("home"),
  is_default: boolean("is_default").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  short_description: text("short_description"),
  description: text("description"),
  image_url: text("image_url"),
  icon: text("icon"),
  display_order: integer("display_order").notNull().default(0),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customer_name: text("customer_name").notNull(),
  company: text("company"),
  designation: text("designation"),
  review_text: text("review_text").notNull(),
  rating: integer("rating").notNull().default(5),
  image_url: text("image_url"),
  is_active: boolean("is_active").notNull().default(true),
  display_order: integer("display_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const customerReviews = pgTable("customer_reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id"),
  customer_name: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  review_text: text("review_text"),
  photos: text("photos").array().default(sql`'{}'`),
  video_url: text("video_url"),
  profile_photo_url: text("profile_photo_url"),
  pincode: text("pincode"),
  area_name: text("area_name"),
  city: text("city"),
  street: text("street"),
  is_approved: boolean("is_approved").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const catalogs = pgTable("catalogs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  file_url: text("file_url").notNull(),
  thumbnail_url: text("thumbnail_url"),
  is_active: boolean("is_active").notNull().default(true),
  download_count: integer("download_count").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const banners = pgTable("banners", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title"),
  subtitle: text("subtitle"),
  image_url: text("image_url").notNull(),
  link_url: text("link_url"),
  button_text: text("button_text"),
  display_order: integer("display_order").notNull().default(0),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const enquiries = pgTable("enquiries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  is_read: boolean("is_read").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const estimationEnquiries = pgTable("estimation_enquiries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  full_name: text("full_name").notNull(),
  mobile_number: text("mobile_number").notNull(),
  email: text("email"),
  project_location: text("project_location"),
  project_types: text("project_types").array().default(sql`'{}'`),
  project_nature: text("project_nature"),
  kitchen_type: text("kitchen_type"),
  stone_type: text("stone_type"),
  finish_type: text("finish_type"),
  thickness: text("thickness"),
  quantity: text("quantity"),
  flooring_required: boolean("flooring_required"),
  budget_range: text("budget_range"),
  completion_urgency: text("completion_urgency"),
  expected_start_date: date("expected_start_date"),
  drawing_data: text("drawing_data"),
  voice_recording_url: text("voice_recording_url"),
  voice_transcription: text("voice_transcription"),
  reference_images: text("reference_images").array().default(sql`'{}'`),
  preferred_color: text("preferred_color"),
  additional_notes: text("additional_notes"),
  status: text("status").notNull().default("new"),
  admin_notes: text("admin_notes"),
  estimated_amount: decimal("estimated_amount", { precision: 10, scale: 2 }),
  user_id: uuid("user_id"),
  project_type_other: text("project_type_other"),
  number_of_counters: integer("number_of_counters"),
  approximate_length: text("approximate_length"),
  approximate_width: text("approximate_width"),
  tile_size_preference: text("tile_size_preference"),
  total_flooring_area: text("total_flooring_area"),
  cutouts_required: text("cutouts_required").array(),
  edge_profile_preference: text("edge_profile_preference"),
  assigned_to: uuid("assigned_to"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const heroCarouselCards = pgTable("hero_carousel_cards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  image_url: text("image_url").notNull(),
  display_order: integer("display_order").notNull().default(0),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const heroCarouselSettings = pgTable("hero_carousel_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  rotation_speed: integer("rotation_speed").notNull().default(3000),
  auto_rotate: boolean("auto_rotate").notNull().default(true),
  scroll_sensitivity: decimal("scroll_sensitivity", { precision: 5, scale: 2 }).notNull().default("0.5"),
  initial_visible_count: integer("initial_visible_count").notNull().default(5),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const storeLocations = pgTable("store_locations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  google_maps_url: text("google_maps_url"),
  phone: text("phone"),
  email: text("email"),
  is_active: boolean("is_active").notNull().default(true),
  display_order: integer("display_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteVisitors = pgTable("site_visitors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  page_url: text("page_url"),
  referrer: text("referrer"),
  country: text("country"),
  city: text("city"),
  visited_at: timestamp("visited_at", { withTimezone: true }).defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ref_id: text("ref_id").unique().notNull(),
  customer_phone: text("customer_phone"),
  customer_name: text("customer_name"),
  status: text("status").notNull().default("open"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  last_message_at: timestamp("last_message_at", { withTimezone: true }).defaultNow(),
  last_message_preview: text("last_message_preview"),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversation_id: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  ref_id: text("ref_id").notNull(),
  sender_type: text("sender_type").notNull(),
  sender_name: text("sender_name"),
  content_text: text("content_text"),
  media_url: text("media_url"),
  media_type: text("media_type"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  is_read: boolean("is_read").notNull().default(false),
});

export const contactNumbers = pgTable("contact_numbers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  label: text("label").notNull(),
  phone_number: text("phone_number").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  display_order: integer("display_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
