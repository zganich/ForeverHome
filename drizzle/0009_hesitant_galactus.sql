CREATE TABLE `adoption_verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`shelterPartnerId` int,
	`adoptionDate` date,
	`petName` varchar(100),
	`petType` enum('dog','cat','other'),
	`paperworkUrl` varchar(500),
	`status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`verifiedAt` timestamp,
	`verifiedBy` int,
	`rejectionReason` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adoption_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`userId` varchar(64),
	`shelterPartnerId` int,
	`eventData` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignName` varchar(255) NOT NULL,
	`campaignType` enum('announcement','shelter_outreach','newsletter','promotional') NOT NULL,
	`subject` varchar(500),
	`sentCount` int NOT NULL DEFAULT 0,
	`openCount` int NOT NULL DEFAULT 0,
	`clickCount` int NOT NULL DEFAULT 0,
	`conversionCount` int NOT NULL DEFAULT 0,
	`sentAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`email` varchar(255) NOT NULL,
	`userId` varchar(64),
	`shelterPartnerId` int,
	`status` enum('sent','opened','clicked','bounced','unsubscribed') NOT NULL DEFAULT 'sent',
	`sentAt` timestamp DEFAULT (now()),
	`openedAt` timestamp,
	`clickedAt` timestamp,
	CONSTRAINT `email_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shelter_partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`address` text,
	`city` varchar(100),
	`state` varchar(50),
	`zip` varchar(20),
	`website` varchar(255),
	`status` enum('pending','active','inactive') NOT NULL DEFAULT 'pending',
	`partnershipType` enum('organizational','enterprise') NOT NULL DEFAULT 'organizational',
	`revenueSharePercentage` decimal(5,2) NOT NULL DEFAULT '10.00',
	`totalAdopterSignups` int NOT NULL DEFAULT 0,
	`totalRevenueShared` decimal(10,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shelter_partners_id` PRIMARY KEY(`id`),
	CONSTRAINT `shelter_partners_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `adoption_verifications` ADD CONSTRAINT `adoption_verifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `adoption_verifications` ADD CONSTRAINT `adoption_verifications_shelterPartnerId_shelter_partners_id_fk` FOREIGN KEY (`shelterPartnerId`) REFERENCES `shelter_partners`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_shelterPartnerId_shelter_partners_id_fk` FOREIGN KEY (`shelterPartnerId`) REFERENCES `shelter_partners`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_recipients` ADD CONSTRAINT `email_recipients_campaignId_email_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `email_campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_recipients` ADD CONSTRAINT `email_recipients_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_recipients` ADD CONSTRAINT `email_recipients_shelterPartnerId_shelter_partners_id_fk` FOREIGN KEY (`shelterPartnerId`) REFERENCES `shelter_partners`(`id`) ON DELETE set null ON UPDATE no action;