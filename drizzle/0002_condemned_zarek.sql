CREATE TABLE `purchases` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`stripePaymentId` varchar(255),
	`amount` int NOT NULL,
	`credits` int NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `credits` int DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isBetaTester` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `betaInviteCode` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `lastCreditRefresh` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;