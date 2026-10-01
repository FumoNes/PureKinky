CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`maintenanceEnabled` boolean NOT NULL DEFAULT false,
	`maintenanceEndsAt` timestamp,
	`maintenanceTitle` varchar(120) NOT NULL DEFAULT 'ACCESS LOCKED',
	`maintenanceMessage` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`)
);
