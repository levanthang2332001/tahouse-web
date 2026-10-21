CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`ip_address` text,
	`user_agent` text,
	`browser` text,
	`os` text,
	`device` text,
	`origin` text,
	`referer` text,
	`location` text,
	`total_messages` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chat_sessions_ip_idx` ON `chat_sessions` (`ip_address`);--> statement-breakpoint
CREATE INDEX `chat_sessions_created_idx` ON `chat_sessions` (`created_at`);--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`origin` text,
	`metadata_json` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chat_messages_session_idx` ON `chat_messages` (`session_id`);--> statement-breakpoint
CREATE INDEX `chat_messages_created_idx` ON `chat_messages` (`created_at`);
