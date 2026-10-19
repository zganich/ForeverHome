ALTER TABLE "adoption_verifications" ALTER COLUMN "userId" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "adoption_verifications" ALTER COLUMN "verifiedBy" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "analytics_events" ALTER COLUMN "userId" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "beta_codes" ALTER COLUMN "createdBy" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "email_recipients" ALTER COLUMN "userId" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "userId" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "pets" ALTER COLUMN "userId" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "userId" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "userId" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE varchar(128);