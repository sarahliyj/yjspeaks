CREATE TABLE `article_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`article_id` text NOT NULL,
	`editor_user_id` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text DEFAULT '' NOT NULL,
	`body_document` text NOT NULL,
	`body_text` text NOT NULL,
	`reason` text DEFAULT 'autosave' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`editor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_article_revisions_article_created` ON `article_revisions` (`article_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`publication_id` text NOT NULL,
	`author_user_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text DEFAULT '无标题' NOT NULL,
	`subtitle` text DEFAULT '' NOT NULL,
	`body_document` text DEFAULT '{}' NOT NULL,
	`body_text` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`send_email` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`publication_id`) REFERENCES `publications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_articles_publication_slug` ON `articles` (`publication_id`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_articles_publication_status_published` ON `articles` (`publication_id`,`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_articles_author_status` ON `articles` (`author_user_id`,`status`);--> statement-breakpoint
CREATE TABLE `consent_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`document_type` text NOT NULL,
	`document_version` text NOT NULL,
	`locale` text DEFAULT 'zh-CN' NOT NULL,
	`accepted_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_consent_records_user_document` ON `consent_records` (`user_id`,`document_type`);--> statement-breakpoint
CREATE TABLE `inbox_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`article_id` text NOT NULL,
	`delivered_at` integer NOT NULL,
	`read_at` integer,
	`archived_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_inbox_items_user_article` ON `inbox_items` (`user_id`,`article_id`);--> statement-breakpoint
CREATE INDEX `idx_inbox_items_user_delivered` ON `inbox_items` (`user_id`,`delivered_at`);--> statement-breakpoint
CREATE TABLE `outbox_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`aggregate_type` text NOT NULL,
	`aggregate_id` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`available_at` integer NOT NULL,
	`processed_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_outbox_events_status_available` ON `outbox_events` (`status`,`available_at`);--> statement-breakpoint
CREATE TABLE `publications` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`name` text NOT NULL,
	`handle` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_publications_handle` ON `publications` (`handle`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_publications_owner_user_id` ON `publications` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `idx_publications_status` ON `publications` (`status`);--> statement-breakpoint
CREATE TABLE `reading_progress` (
	`user_id` text NOT NULL,
	`article_id` text NOT NULL,
	`percent` integer DEFAULT 0 NOT NULL,
	`position` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_reading_progress_user_article` ON `reading_progress` (`user_id`,`article_id`);--> statement-breakpoint
CREATE TABLE `saved_articles` (
	`user_id` text NOT NULL,
	`article_id` text NOT NULL,
	`saved_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_saved_articles_user_article` ON `saved_articles` (`user_id`,`article_id`);--> statement-breakpoint
CREATE INDEX `idx_saved_articles_user_saved` ON `saved_articles` (`user_id`,`saved_at`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`subscriber_user_id` text NOT NULL,
	`publication_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`email_delivery` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`subscriber_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`publication_id`) REFERENCES `publications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_subscriptions_user_publication` ON `subscriptions` (`subscriber_user_id`,`publication_id`);--> statement-breakpoint
CREATE INDEX `idx_subscriptions_publication_status` ON `subscriptions` (`publication_id`,`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`external_auth_subject` text,
	`email_normalized` text NOT NULL,
	`email_verified_at` integer,
	`display_name` text NOT NULL,
	`account_status` text DEFAULT 'active' NOT NULL,
	`identity_status` text DEFAULT 'unverified' NOT NULL,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email_normalized` ON `users` (`email_normalized`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_external_auth_subject` ON `users` (`external_auth_subject`);--> statement-breakpoint
CREATE INDEX `idx_users_account_status` ON `users` (`account_status`);