CREATE TABLE `metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`event` text NOT NULL,
	`product` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notification_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`event` text NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `limits_expires_idx` ON `limits` (`expires`);--> statement-breakpoint
CREATE INDEX `orders_status_created_idx` ON `orders` (`status`,`created`,`id`);--> statement-breakpoint
CREATE INDEX `orders_created_idx` ON `orders` (`created`,`id`);
