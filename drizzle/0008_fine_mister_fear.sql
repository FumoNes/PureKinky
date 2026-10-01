CREATE TABLE `auth_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auth_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_sessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `shoppingCartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` varchar(80) NOT NULL,
	`size` varchar(16) NOT NULL,
	`playerName` varchar(20) NOT NULL DEFAULT '',
	`playerNumber` varchar(3) NOT NULL DEFAULT '',
	`quantity` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shoppingCartItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `shoppingCartItems_variant_unique` UNIQUE(`userId`,`productId`,`size`,`playerName`,`playerNumber`)
);
--> statement-breakpoint
CREATE TABLE `vipBans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bannedByUserId` int NOT NULL,
	`bannedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vipBans_id` PRIMARY KEY(`id`),
	CONSTRAINT `vipBans_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `vipForumPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vipForumPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vipQuizCompletions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vipQuizCompletions_id` PRIMARY KEY(`id`),
	CONSTRAINT `vipQuizCompletions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `auth_sessions_user_id_idx` ON `auth_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `auth_sessions_expires_at_idx` ON `auth_sessions` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `password_reset_tokens_user_id_idx` ON `password_reset_tokens` (`userId`);--> statement-breakpoint
CREATE INDEX `password_reset_tokens_expires_at_idx` ON `password_reset_tokens` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `vipForumPosts_createdAt_idx` ON `vipForumPosts` (`createdAt`);