// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const products = sqliteTable('products', { id: text('id').primaryKey(), data: text('data').notNull(), updated: text('updated').notNull() });
export const orders = sqliteTable('orders', { id: text('id').primaryKey(), requestKey: text('request_key').notNull().unique(), data: text('data').notNull(), status: text('status').notNull(), created: text('created').notNull() });
export const settings = sqliteTable('settings', { id: text('id').primaryKey(), data: text('data').notNull() });
export const limits = sqliteTable('limits', { id: text('id').primaryKey(), count: integer('count').notNull(), expires: integer('expires').notNull() });
export const audit = sqliteTable('audit', { id: text('id').primaryKey(), actor: text('actor').notNull(), action: text('action').notNull(), created: text('created').notNull() });
