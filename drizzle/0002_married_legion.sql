CREATE TABLE "billing_receipts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripeSubscriptionId" varchar(255);