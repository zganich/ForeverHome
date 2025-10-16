ALTER TABLE `analyses` DROP FOREIGN KEY `analyses_petId_pets_id_fk`;
--> statement-breakpoint
ALTER TABLE `analyses` ADD `photoDate` timestamp;--> statement-breakpoint
ALTER TABLE `analyses` ADD `petAgeAtPhoto` varchar(64);