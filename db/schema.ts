// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const products = sqliteTable('products', { id: text('id').primaryKey(), data: text('data').notNull(), updated: text('updated').notNull(), revision:integer('revision').notNull().default(1) });
export const orders = sqliteTable('orders', { id: text('id').primaryKey(), requestKey: text('request_key').notNull().unique(), data: text('data').notNull(), status: text('status').notNull(), created: text('created').notNull(),revision:integer('revision').notNull().default(1),receiptHash:text('receipt_hash'),requestHash:text('request_hash'),searchText:text('search_text').notNull().default('') });
export const settings = sqliteTable('settings', { id: text('id').primaryKey(), data: text('data').notNull(),revision:integer('revision').notNull().default(1) });
export const limits = sqliteTable('limits', { id: text('id').primaryKey(), count: integer('count').notNull(), expires: integer('expires').notNull() });
export const audit = sqliteTable('audit', { id: text('id').primaryKey(), actor: text('actor').notNull(), action: text('action').notNull(), created: text('created').notNull() });
export const revisions=sqliteTable('revisions',{id:text('id').primaryKey(),entity:text('entity').notNull(),entityId:text('entity_id').notNull(),revision:integer('revision').notNull(),data:text('data').notNull(),actor:text('actor').notNull(),created:text('created').notNull()});
export const shippingJobs=sqliteTable('shipping_jobs',{orderId:text('order_id').primaryKey(),state:text('state').notNull(),data:text('data').notNull(),updated:text('updated').notNull()});
export const webhookEvents=sqliteTable('webhook_events',{id:text('id').primaryKey(),created:text('created').notNull()});
