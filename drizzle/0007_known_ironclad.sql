CREATE TABLE `reminders` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`petId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('medication','vet','grooming','training','custom') NOT NULL,
	`dueDate` timestamp NOT NULL,
	`isRecurring` enum('none','daily','weekly','monthly','yearly') NOT NULL DEFAULT 'none',
	`isCompleted` enum('no','yes') NOT NULL DEFAULT 'no',
	`notificationSent` enum('no','yes') NOT NULL DEFAULT 'no',
	`createdAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
