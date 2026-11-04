CREATE TABLE `revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`revision` integer NOT NULL,
	`data` text NOT NULL,
	`actor` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shipping_jobs` (
	`order_id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `revision` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `receipt_hash` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `request_hash` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `search_text` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `revision` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `revision` integer DEFAULT 1 NOT NULL;