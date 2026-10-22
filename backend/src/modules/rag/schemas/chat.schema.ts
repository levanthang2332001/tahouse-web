import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const chatSessions = sqliteTable(
  'chat_sessions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    title: text('title'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    browser: text('browser'),
    os: text('os'),
    device: text('device'),
    origin: text('origin'),
    referer: text('referer'),
    location: text('location'),
    totalMessages: integer('total_messages').default(0).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index('chat_sessions_ip_idx').on(table.ipAddress),
    index('chat_sessions_created_idx').on(table.createdAt),
  ],
);

export const chatMessages = sqliteTable(
  'chat_messages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    sessionId: text('session_id')
      .notNull()
      .references(() => chatSessions.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    content: text('content').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    origin: text('origin'),
    metadata: text('metadata_json', { mode: 'json' }).$type<Record<string, any>>(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index('chat_messages_session_idx').on(table.sessionId),
    index('chat_messages_created_idx').on(table.createdAt),
  ],
);

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;
export type ChatMessageEntity = typeof chatMessages.$inferSelect;
export type NewChatMessageEntity = typeof chatMessages.$inferInsert;
