# 🚀 Run Migration Now - Copy & Paste Ready

## Quick Steps (2 minutes)

1. **Go to:** https://supabase.com/dashboard/project/ujcfnygugdargmtlbarq/sql/new

2. **Copy this entire SQL block:**

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

3. **Click "Run"** (or press Cmd+Enter)

4. **Done!** ✅

---

## Verify It Worked

After running, verify with:
```sql
SELECT * FROM beta_codes LIMIT 1;
```

If you see an empty result (no errors), migration succeeded! 🎉

---

**Note:** The direct connection from CLI isn't working due to network/firewall settings, but the Supabase dashboard SQL editor works perfectly and is the recommended method.

