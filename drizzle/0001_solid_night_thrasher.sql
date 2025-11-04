CREATE TYPE "public"."beta_code_status" AS ENUM('active', 'used', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."feedback_category" AS ENUM('bug', 'feature_request', 'ux_improvement', 'performance', 'content', 'other');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "beta_codes" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL,
	"createdBy" varchar(64),
	"maxUses" integer DEFAULT 1,
	"uses" integer DEFAULT 0 NOT NULL,
	"status" "beta_code_status" DEFAULT 'active' NOT NULL,
	"expiresAt" timestamp,
	"notes" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "beta_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"category" "feedback_category" NOT NULL,
	"rating" integer,
	"message" text NOT NULL,
	"pageUrl" varchar(500),
	"userAgent" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "status" "purchase_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;