import {
  pgTable,
  text,
  timestamp,
  numeric,
  doublePrecision,
  integer,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categories = pgTable('categories', {
  id: text('id').primaryKey(), // e.g. 'groceries', 'pharmacy', 'home', 'beauty'
  name: text('name').notNull(),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
});

export const merchants = pgTable('merchants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  initial: text('initial').notNull().default('M'),
  logoBg: text('logo_bg').notNull().default('#075E50'),
  logoColor: text('logo_color').notNull().default('#FFFFFF'),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  categoryId: text('category_id').references(() => categories.id),
  website: text('website'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const storeLocations = pgTable('store_locations', {
  id: text('id').primaryKey(),
  merchantId: text('merchant_id')
    .notNull()
    .references(() => merchants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull().default('ON'),
  postalCode: text('postal_code'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  phone: text('phone'),
  logoUrl: text('logo_url'),
});

export const flyers = pgTable('flyers', {
  id: text('id').primaryKey(),
  merchantId: text('merchant_id')
    .notNull()
    .references(() => merchants.id, { onDelete: 'cascade' }),
  storeLocationId: text('store_location_id').references(() => storeLocations.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  badgeText: text('badge_text').default('NEW'),
  badgeVariant: text('badge_variant').default('lime'), // 'lime', 'dark', 'red'
  validFrom: timestamp('valid_from', { withTimezone: true }),
  validTo: timestamp('valid_to', { withTimezone: true }),
  flyerImageUrl: text('flyer_image_url').notNull(),
  aspectRatio: doublePrecision('aspect_ratio').default(1.414).notNull(),
  status: text('status').default('published').notNull(), // 'draft', 'published', 'archived'
  pageCount: integer('page_count').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const flyerPages = pgTable('flyer_pages', {
  id: text('id').primaryKey(),
  flyerId: text('flyer_id')
    .notNull()
    .references(() => flyers.id, { onDelete: 'cascade' }),
  pageNumber: integer('page_number').default(1).notNull(),
  imageUrl: text('image_url').notNull(),
  aspectRatio: doublePrecision('aspect_ratio').default(1.414).notNull(),
  width: integer('width'),
  height: integer('height'),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  merchantId: text('merchant_id').references(() => merchants.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  brand: text('brand').notNull().default(''),
  description: text('description').notNull().default(''),
  regularPrice: numeric('regular_price', { precision: 10, scale: 2 }).notNull(),
  offerPrice: numeric('offer_price', { precision: 10, scale: 2 }).notNull(),
  unit: text('unit').default('each'),
  category: text('category').notNull().default('General'),
  sku: text('sku'),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const hotspots = pgTable('hotspots', {
  id: text('id').primaryKey(),
  flyerId: text('flyer_id')
    .notNull()
    .references(() => flyers.id, { onDelete: 'cascade' }),
  flyerPageId: text('flyer_page_id').references(() => flyerPages.id, { onDelete: 'set null' }),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  /** Normalized 0–1 coordinates relative to flyer width and height */
  x: doublePrecision('x').notNull(),
  y: doublePrecision('y').notNull(),
  width: doublePrecision('width').notNull(),
  height: doublePrecision('height').notNull(),
  titleOverride: text('title_override'),
  priceOverride: numeric('price_override', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const deals = pgTable('deals', {
  id: text('id').primaryKey(),
  merchantId: text('merchant_id').references(() => merchants.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  flyerId: text('flyer_id').references(() => flyers.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  details: text('details'),
  priceText: text('price_text').notNull(),
  discountPercent: integer('discount_percent'),
  badgeText: text('badge_text'),
  imageUrl: text('image_url').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'), // 'admin' | 'user'
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const storeLocationsRelations = relations(storeLocations, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [storeLocations.merchantId],
    references: [merchants.id],
  }),
  flyers: many(flyers),
}));

export const merchantsRelations = relations(merchants, ({ many, one }) => ({
  locations: many(storeLocations),
  flyers: many(flyers),
  products: many(products),
  deals: many(deals),
  category: one(categories, {
    fields: [merchants.categoryId],
    references: [categories.id],
  }),
}));

export const flyersRelations = relations(flyers, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [flyers.merchantId],
    references: [merchants.id],
  }),
  storeLocation: one(storeLocations, {
    fields: [flyers.storeLocationId],
    references: [storeLocations.id],
  }),
  pages: many(flyerPages),
  hotspots: many(hotspots),
}));

export const flyerPagesRelations = relations(flyerPages, ({ one, many }) => ({
  flyer: one(flyers, {
    fields: [flyerPages.flyerId],
    references: [flyers.id],
  }),
  hotspots: many(hotspots),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [products.merchantId],
    references: [merchants.id],
  }),
  hotspots: many(hotspots),
  deals: many(deals),
}));

export const hotspotsRelations = relations(hotspots, ({ one }) => ({
  flyer: one(flyers, {
    fields: [hotspots.flyerId],
    references: [flyers.id],
  }),
  page: one(flyerPages, {
    fields: [hotspots.flyerPageId],
    references: [flyerPages.id],
  }),
  product: one(products, {
    fields: [hotspots.productId],
    references: [products.id],
  }),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  merchant: one(merchants, {
    fields: [deals.merchantId],
    references: [merchants.id],
  }),
  product: one(products, {
    fields: [deals.productId],
    references: [products.id],
  }),
  flyer: one(flyers, {
    fields: [deals.flyerId],
    references: [flyers.id],
  }),
}));
