ALTER TABLE `users` ADD `subscriptionPlan` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','canceled','past_due');--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEndDate` timestamp;