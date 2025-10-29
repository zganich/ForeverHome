CREATE TYPE "public"."boolean_enum" AS ENUM('no', 'yes');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."partner_status" AS ENUM('pending', 'active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."personality" AS ENUM('goofy', 'wise', 'sassy', 'serious', 'excited', 'sleepy', 'dramatic');--> statement-breakpoint
CREATE TYPE "public"."recurring" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('medication', 'vet', 'grooming', 'training', 'custom');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."species" AS ENUM('dog', 'cat', 'other');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'past_due');--> statement-breakpoint
CREATE TYPE "public"."user_feedback" AS ENUM('helpful', 'not_helpful');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "adoption_verifications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"shelterId" varchar(64) NOT NULL,
	"petId" varchar(64),
	"adoptionDate" date NOT NULL,
	"verificationCode" varchar(64) NOT NULL,
	"status" "verification_status" DEFAULT 'pending' NOT NULL,
	"documentUrl" varchar(500),
	"notes" text,
	"verifiedAt" timestamp,
	"verifiedBy" varchar(64),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analyses" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"petId" varchar(64) NOT NULL,
	"mediaUrl" text NOT NULL,
	"mediaType" "media_type" NOT NULL,
	"userContext" text,
	"photoDate" timestamp,
	"petAgeAtPhoto" varchar(64),
	"visionData" text,
	"contextData" text,
	"synthesisData" text,
	"recommendations" text,
	"primaryBehavior" varchar(100),
	"confidenceScore" varchar(10),
	"userFeedback" "user_feedback",
	"audioUrl" varchar(500),
	"personalityVoice" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64),
	"eventType" varchar(100) NOT NULL,
	"eventData" text,
	"ipAddress" varchar(45),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"bodyHtml" text NOT NULL,
	"bodyText" text,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"scheduledFor" timestamp,
	"sentAt" timestamp,
	"totalRecipients" integer DEFAULT 0,
	"totalSent" integer DEFAULT 0,
	"totalOpened" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_recipients" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"campaignId" varchar(64) NOT NULL,
	"userId" varchar(64) NOT NULL,
	"email" varchar(320) NOT NULL,
	"sentAt" timestamp,
	"openedAt" timestamp,
	"clickedAt" timestamp,
	"bouncedAt" timestamp,
	"unsubscribedAt" timestamp,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"name" varchar(100) NOT NULL,
	"species" "species" NOT NULL,
	"breed" varchar(100),
	"breedConfidence" varchar(20),
	"breedCandidates" text,
	"age" varchar(50),
	"photoUrl" varchar(500),
	"notes" text,
	"personality" "personality" DEFAULT 'goofy',
	"voiceStyle" varchar(50) DEFAULT 'alloy',
	"behaviorPatterns" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"credits" integer NOT NULL,
	"stripePaymentId" varchar(255),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"petId" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "reminder_type" NOT NULL,
	"dueDate" timestamp NOT NULL,
	"isRecurring" "recurring" DEFAULT 'none' NOT NULL,
	"isCompleted" boolean_enum DEFAULT 'no' NOT NULL,
	"notificationSent" boolean_enum DEFAULT 'no' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"completedAt" timestamp,
	"recurringInterval" integer
);
--> statement-breakpoint
CREATE TABLE "shelter_partners" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"contactEmail" varchar(320) NOT NULL,
	"contactName" varchar(255),
	"phone" varchar(50),
	"address" text,
	"website" varchar(500),
	"status" "partner_status" DEFAULT 'pending' NOT NULL,
	"revenueSharePercent" numeric(5, 2) DEFAULT '20.00',
	"totalReferrals" integer DEFAULT 0,
	"totalRevenue" numeric(10, 2) DEFAULT '0.00',
	"notes" text,
	"apiKey" varchar(64),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"credits" integer DEFAULT 3 NOT NULL,
	"isBetaTester" boolean DEFAULT false NOT NULL,
	"betaInviteCode" varchar(64),
	"createdAt" timestamp DEFAULT now(),
	"lastSignedIn" timestamp DEFAULT now(),
	"lastCreditRefresh" timestamp DEFAULT now(),
	"subscriptionPlan" varchar(64),
	"subscriptionStatus" "subscription_status",
	"subscriptionEndDate" timestamp
);
--> statement-breakpoint
ALTER TABLE "adoption_verifications" ADD CONSTRAINT "adoption_verifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_verifications" ADD CONSTRAINT "adoption_verifications_shelterId_shelter_partners_id_fk" FOREIGN KEY ("shelterId") REFERENCES "public"."shelter_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_verifications" ADD CONSTRAINT "adoption_verifications_petId_pets_id_fk" FOREIGN KEY ("petId") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_recipients" ADD CONSTRAINT "email_recipients_campaignId_email_campaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."email_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_recipients" ADD CONSTRAINT "email_recipients_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;