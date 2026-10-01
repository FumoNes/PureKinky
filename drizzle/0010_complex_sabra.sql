CREATE TABLE `productPrices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` varchar(80) NOT NULL,
	`priceCents` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productPrices_id` PRIMARY KEY(`id`),
	CONSTRAINT `productPrices_productId_unique` UNIQUE(`productId`)
);
--> statement-breakpoint
ALTER TABLE `siteSettings` MODIFY COLUMN `maintenanceTitle` varchar(120) NOT NULL DEFAULT 'PRÓXIMO DROP';