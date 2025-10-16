ALTER TABLE `pets` MODIFY COLUMN `photoUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `pets` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `pets` ADD `personality` enum('goofy','wise','sassy','serious','excited','sleepy','dramatic') DEFAULT 'goofy';--> statement-breakpoint
ALTER TABLE `pets` ADD `voiceStyle` varchar(50) DEFAULT 'alloy';--> statement-breakpoint
ALTER TABLE `pets` ADD `behaviorPatterns` text;