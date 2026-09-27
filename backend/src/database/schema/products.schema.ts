import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { brands } from './brands.schema';

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(), // Slug id (e.g. "ta-9800")
    code: text('code').notNull().unique(), // Code (e.g. "TA-9800 PREMIUM")
    name: text('name').notNull(),
    description: text('description'),
    shortDescription: text('short_description'),
    brandId: integer('brand_id')
      .notNull()
      .references(() => brands.id),
    categorySlug: text('category_slug').notNull(),
    subcategorySlug: text('subcategory_slug'),
    price: real('price').notNull(),
    originalPrice: real('original_price'),
    priceRange: text('price_range'),
    imageUrl: text('image_url').notNull(),
    images: text('images_json').notNull().default('[]'), // JSON array of string
    features: text('features_json').default('[]'), // JSON array of string
    specs: text('specs_json').default('{}'), // JSON object Record<string, string>
    technologies: text('technologies_json').default('[]'), // JSON array of string
    warranty: integer('warranty').default(24),
    warrantyText: text('warranty_text'),
    colors: text('colors_json').default('[]'), // JSON array of string
    installationManual: text('installation_manual_json').default('[]'), // JSON array of string
    faq: text('faq_json').default('[]'), // JSON array of { question, answer }
    hasVariants: integer('has_variants', { mode: 'boolean' }).default(false),
    options: text('options_json').default('[]'), // JSON array of options
    variants: text('variants_json').default('[]'), // JSON array of variants
    installationPreview: text('installation_preview_json').default('[]'), // JSON array of string
    status: text('status').notNull().default('ACTIVE'),
    views: integer('views').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex('products_code_idx').on(table.code),
    index('products_brand_idx').on(table.brandId),
    index('products_category_idx').on(table.categorySlug),
    index('products_subcategory_idx').on(table.subcategorySlug),
    index('products_price_idx').on(table.price),
    index('products_status_idx').on(table.status),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
