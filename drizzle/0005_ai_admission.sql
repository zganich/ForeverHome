CREATE TABLE "ai_requests" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"kind" text NOT NULL,
	"input_digest" varchar(64) NOT NULL,
	"status" text NOT NULL,
	"lease_token" varchar(64) NOT NULL,
	"lease_expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"cache_expires_at" timestamp with time zone,
	"result" jsonb,
	CONSTRAINT "ai_request_kind" CHECK ("ai_requests"."kind" in ('analysis', 'quality', 'breed')),
	CONSTRAINT "ai_request_status" CHECK ("ai_requests"."status" in ('running', 'completed', 'failed'))
);
--> statement-breakpoint
ALTER TABLE "ai_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_usage_daily" (
	"scope" text NOT NULL,
	"subject_id" text NOT NULL,
	"usage_day" date NOT NULL,
	"provider_attempts" integer DEFAULT 0 NOT NULL,
	"helpers" integer DEFAULT 0 NOT NULL,
	"analyses" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ai_usage_daily_scope_subject_id_usage_day_pk" PRIMARY KEY("scope","subject_id","usage_day"),
	CONSTRAINT "ai_usage_scope" CHECK ("ai_usage_daily"."scope" in ('project', 'user')),
	CONSTRAINT "ai_usage_nonnegative" CHECK ("ai_usage_daily"."provider_attempts" >= 0 and "ai_usage_daily"."helpers" >= 0 and "ai_usage_daily"."analyses" >= 0)
);
--> statement-breakpoint
ALTER TABLE "ai_usage_daily" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_requests_active_user" ON "ai_requests" USING btree ("user_id","status","lease_expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_quality_dedup" ON "ai_requests" USING btree ("user_id","input_digest") WHERE "ai_requests"."kind" = 'quality';