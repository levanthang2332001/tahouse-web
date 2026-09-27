CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'ADMIN' NOT NULL,
	`avatar` text,
	`phone` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text NOT NULL,
	`logo_html` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_idx` ON `brands` (`slug`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brand_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_brand_slug_idx` ON `categories` (`brand_id`,`slug`);--> statement-breakpoint
CREATE TABLE `subcategories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subcategories_cat_slug_idx` ON `subcategories` (`category_id`,`slug`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`short_description` text,
	`brand_id` integer NOT NULL,
	`category_slug` text NOT NULL,
	`subcategory_slug` text,
	`price` real NOT NULL,
	`original_price` real,
	`price_range` text,
	`image_url` text NOT NULL,
	`images_json` text DEFAULT '[]' NOT NULL,
	`features_json` text DEFAULT '[]',
	`specs_json` text DEFAULT '{}',
	`technologies_json` text DEFAULT '[]',
	`warranty` integer DEFAULT 24,
	`warranty_text` text,
	`colors_json` text DEFAULT '[]',
	`installation_manual_json` text DEFAULT '[]',
	`faq_json` text DEFAULT '[]',
	`has_variants` integer DEFAULT false,
	`options_json` text DEFAULT '[]',
	`variants_json` text DEFAULT '[]',
	`installation_preview_json` text DEFAULT '[]',
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_code_unique` ON `products` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_code_idx` ON `products` (`code`);--> statement-breakpoint
CREATE INDEX `products_brand_idx` ON `products` (`brand_id`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_slug`);--> statement-breakpoint
CREATE INDEX `products_subcategory_idx` ON `products` (`subcategory_slug`);--> statement-breakpoint
CREATE INDEX `products_price_idx` ON `products` (`price`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`url` text NOT NULL,
	`key` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`folder` text NOT NULL,
	`brand` text,
	`category` text,
	`subcategory` text,
	`product_code` text,
	`metadata_json` text DEFAULT '{}',
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_folder_idx` ON `media` (`folder`);--> statement-breakpoint
CREATE INDEX `media_brand_idx` ON `media` (`brand`);--> statement-breakpoint
CREATE INDEX `media_category_idx` ON `media` (`category`);--> statement-breakpoint
CREATE INDEX `media_product_code_idx` ON `media` (`product_code`);