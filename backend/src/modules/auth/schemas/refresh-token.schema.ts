import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { users } from './user.schema';

export const refreshTokens = sqliteTable(
  'refresh_tokens',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    hashedToken: text('hashed_token').notNull().unique(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    isRevoked: integer('is_revoked', { mode: 'boolean' })
      .notNull()
      .default(false),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex('refresh_tokens_hashed_idx').on(table.hashedToken),
    index('refresh_tokens_user_revoked_idx').on(table.userId, table.isRevoked),
  ],
);

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
