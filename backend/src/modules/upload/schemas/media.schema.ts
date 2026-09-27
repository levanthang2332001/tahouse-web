import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  OTHER = 'other',
}

export const media = sqliteTable(
  'media',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    filename: text('filename').notNull(),
    url: text('url').notNull(),
    key: text('key').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    folder: text('folder').notNull(),
    brand: text('brand'),
    category: text('category'),
    subcategory: text('subcategory'),
    productCode: text('product_code'),
    metadata: text('metadata_json').default('{}'), // { width, height, aspectRatio, duration, format }
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index('media_folder_idx').on(table.folder),
    index('media_brand_idx').on(table.brand),
    index('media_category_idx').on(table.category),
    index('media_product_code_idx').on(table.productCode),
  ],
);

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
