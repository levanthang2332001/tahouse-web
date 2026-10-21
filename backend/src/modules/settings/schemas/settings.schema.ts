import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export interface ISocialLinks {
  zalo?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
  tiktok?: string;
}

export interface IStorePhoneNumber {
  id?: string;
  number: string;
  label: string;
  isHotline?: boolean;
}

export interface IStoreEmail {
  id?: string;
  email: string;
  label: string;
  isPrimary?: boolean;
}

export interface IStoreAddress {
  id?: string;
  branchName: string;
  address: string;
  mapUrl?: string;
  isMain?: boolean;
}

export interface IOpeningHours {
  text: string;
  weekdays?: string;
  weekend?: string;
  note?: string;
}

export const storeSettings = sqliteTable('store_settings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => 'default'),
  storeName: text('store_name').notNull().default('TA HOUSE'),
  slogan: text('slogan'),
  socialLinks: text('social_links_json', {
    mode: 'json',
  }).$type<ISocialLinks>(),
  phoneNumbers: text('phone_numbers_json', { mode: 'json' }).$type<
    IStorePhoneNumber[]
  >(),
  emails: text('emails_json', { mode: 'json' }).$type<IStoreEmail[]>(),
  addresses: text('addresses_json', { mode: 'json' }).$type<IStoreAddress[]>(),
  openingHours: text('opening_hours_json', {
    mode: 'json',
  }).$type<IOpeningHours>(),
  metadata: text('metadata_json', { mode: 'json' }).$type<
    Record<string, any>
  >(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type NewStoreSettings = typeof storeSettings.$inferInsert;
