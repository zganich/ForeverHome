CREATE TABLE `analyses` (
	`id` varchar(64) NOT NULL,
	`petId` varchar(64) NOT NULL,
	`mediaUrl` text NOT NULL,
	`mediaType` enum('image','video') NOT NULL,
	`userContext` text,
	`visionData` text,
	`contextData` text,
	`synthesisData` text,
	`recommendations` text,
	`primaryBehavior` varchar(100),
	`confidenceScore` varchar(10),
	`userFeedback` enum('helpful','not_helpful'),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pets` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`species` enum('dog','cat','other') NOT NULL,
	`breed` varchar(100),
	`age` varchar(50),
	`photoUrl` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `pets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_petId_pets_id_fk` FOREIGN KEY (`petId`) REFERENCES `pets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pets` ADD CONSTRAINT `pets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;