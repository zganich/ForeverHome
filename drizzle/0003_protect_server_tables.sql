-- The browser uses tRPC, not the Supabase Data API. Database access must
-- use an owner/BYPASSRLS server role; no browser role receives a policy here.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "pets" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "analyses" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "reminders" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "purchases" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "beta_codes" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "billing_receipts" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "shelter_partners" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "adoption_verifications" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "email_campaigns" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "email_recipients" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "analytics_events" ENABLE ROW LEVEL SECURITY;
