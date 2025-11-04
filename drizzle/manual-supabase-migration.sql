-- Manual Migration for Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Create the beta_code_status enum
CREATE TYPE "beta_code_status" AS ENUM('active', 'used', 'expired', 'revoked');

-- Create the beta_codes table
CREATE TABLE "beta_codes" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL UNIQUE,
	"createdBy" varchar(64),
	"maxUses" integer DEFAULT 1,
	"uses" integer DEFAULT 0 NOT NULL,
	"status" "beta_code_status" DEFAULT 'active' NOT NULL,
	"expiresAt" timestamp,
	"notes" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);

-- Verify the table was created
SELECT * FROM beta_codes LIMIT 1;

