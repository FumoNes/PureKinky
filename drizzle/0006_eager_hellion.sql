CREATE TABLE `vipBans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bannedByUserId` int NOT NULL,
	`bannedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vipBans_id` PRIMARY KEY(`id`),
	CONSTRAINT `vipBans_userId_unique` UNIQUE(`userId`)
);
