CREATE TABLE `vipQuizCompletions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vipQuizCompletions_id` PRIMARY KEY(`id`),
	CONSTRAINT `vipQuizCompletions_userId_unique` UNIQUE(`userId`)
);
