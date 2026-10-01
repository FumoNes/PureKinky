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
