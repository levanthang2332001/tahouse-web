CREATE TABLE `refresh_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`hashed_token` text NOT NULL,
	`user_agent` text,
	`ip_address` text,
	`is_revoked` integer DEFAULT false NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_tokens_hashed_token_unique` ON `refresh_tokens` (`hashed_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_tokens_hashed_idx` ON `refresh_tokens` (`hashed_token`);--> statement-breakpoint
CREATE INDEX `refresh_tokens_user_revoked_idx` ON `refresh_tokens` (`user_id`,`is_revoked`);