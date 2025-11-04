# Supabase Migration - Quick Steps

**Status:** Migration SQL ready - just run in Supabase Dashboard

---

## ✅ What I've Done

1. ✅ Pulled your DATABASE_URL from Vercel
2. ✅ Generated the migration SQL file
3. ✅ Created ready-to-run SQL script

---

## 🚀 Run Migration (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your **InterpWhat** project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the SQL
1. Click **New Query**
2. Copy and paste this SQL:

```sql
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
```

3. Click **Run** (or press `Cmd+Enter` / `Ctrl+Enter`)

### Step 3: Verify
Run this to verify it worked:
```sql
SELECT * FROM beta_codes LIMIT 1;
```

If you see an empty result (no error), the migration was successful! ✅

---

## 📁 Files Created

- `drizzle/manual-supabase-migration.sql` - The SQL to run
- `drizzle/0001_solid_night_thrasher.sql` - Full migration file (for reference)

---

## 🎯 Next Steps After Migration

Once the migration is complete, generate beta codes:

```bash
pnpm tsx scripts/generate-beta-codes.ts 20
```

---

**That's it!** The migration will take 2 seconds in Supabase SQL Editor. 🚀

