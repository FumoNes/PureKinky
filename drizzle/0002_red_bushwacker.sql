CREATE TABLE `vipAccessGrants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vipAccessGrants_id` PRIMARY KEY(`id`),
	CONSTRAINT `vipAccessGrants_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `newsletterSubscribers` ADD `isSubscribed` boolean DEFAULT true NOT NULL;