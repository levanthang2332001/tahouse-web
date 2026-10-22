CREATE TABLE `store_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`store_name` text DEFAULT 'TA HOUSE' NOT NULL,
	`slogan` text,
	`social_links_json` text,
	`phone_numbers_json` text,
	`emails_json` text,
	`addresses_json` text,
	`opening_hours_json` text,
	`metadata_json` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
