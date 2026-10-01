CREATE TABLE `vipForumPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vipForumPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `vipForumPosts_createdAt_idx` ON `vipForumPosts` (`createdAt`);