# Database Migration Guide

**Last Updated:** January 2025  
**Purpose:** Run database migrations to create the `beta_codes` table

---

## 🎯 Quick Start

### Production (Vercel + Supabase)

**Option 1: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables (includes DATABASE_URL)
vercel env pull .env.local

# Run migration locally with production DATABASE_URL
pnpm db:push
```

**Option 2: Vercel Dashboard + Local Terminal**
1. Go to [vercel.com](https://vercel.com) → Your Project
2. Go to **Settings** → **Environment Variables**
3. Copy `DATABASE_URL` value
4. In local terminal, set environment variable:
   ```bash
   export DATABASE_URL="postgresql://user:password@host:port/database"
   pnpm db:push
   ```

**Option 3: Supabase Dashboard (If using Supabase Postgres)**
1. Go to [supabase.com](https://supabase.com) → Your Project
2. Go to **SQL Editor**
3. Run the manual SQL migration (see below)

---

## 🔧 Local Development

### Prerequisites
1. **PostgreSQL Database** - Must be running and accessible
2. **DATABASE_URL** - Connection string must be set

### Step 1: Set DATABASE_URL

**Option A: From Vercel (Get Production DATABASE_URL)**
```bash
# Pull all environment variables from Vercel
vercel env pull .env.local

# DATABASE_URL will be in .env.local
# Then run migration
pnpm db:push
```

**Option B: From Supabase (If using Supabase Postgres)**
1. Supabase Dashboard → Your Project → **Settings** → **Database**
2. Find **Connection string** → **URI**
3. Copy the connection string
4. Set in terminal or `.env` file:
   ```bash
   export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

**Option C: Environment Variable (.env file)**
Create or update `.env` in project root:
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### Step 2: Run Migration

```bash
# From project root
pnpm db:push
```

This command:
1. ✅ Generates migration SQL from schema changes
2. ✅ Applies migration to database
3. ✅ Creates `beta_codes` table and `beta_code_status` enum

### Step 3: Verify Migration

**Using psql:**
```bash
psql $DATABASE_URL -c "SELECT * FROM beta_codes LIMIT 1;"
```

**Or check table exists:**
```bash
psql $DATABASE_URL -c "\dt beta_codes"
```

**Expected output:** Table should exist with no errors

---

## 📋 Manual SQL Migration (Alternative)

If `pnpm db:push` fails, you can run the SQL manually:

### Step 1: Connect to Database
```bash
psql $DATABASE_URL
```

### Step 2: Create Enum
```sql
CREATE TYPE "beta_code_status" AS ENUM('active', 'used', 'expired', 'revoked');
```

### Step 3: Create Table
```sql
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

### Step 4: Verify
```sql
SELECT * FROM beta_codes LIMIT 1;
```

---

## 🚨 Troubleshooting

### Error: "DATABASE_URL is required"

**Solution:** Set the environment variable:
```bash
# Check if it's set
echo $DATABASE_URL

# Set it (Linux/Mac)
export DATABASE_URL="postgresql://user:password@host:port/database"

# Or add to .env file
echo "DATABASE_URL=postgresql://user:password@host:port/database" >> .env
```

### Error: "Connection refused" or "Cannot connect"

**Solutions:**
1. **Check database is running:**
   - **Vercel Postgres:** Check Vercel dashboard → Storage → Postgres
   - **Supabase Postgres:** Check Supabase dashboard → Database status
   - **Local PostgreSQL:** `pg_isready`

2. **Verify connection string format:**
   ```
   postgresql://username:password@host:port/database
   ```
   - For Supabase: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`
   - Make sure password is URL-encoded if it contains special characters

3. **Check firewall/network:**
   - Vercel Postgres: Allows connections from anywhere
   - Supabase Postgres: Check connection pooling settings in Supabase dashboard
   - Local databases may need `localhost` or `127.0.0.1`

### Error: "Table already exists"

**Solution:** Migration may have already run. Verify:
```sql
SELECT * FROM beta_codes LIMIT 1;
```

If query works, migration is complete. If you need to reset:
```sql
DROP TABLE IF EXISTS beta_codes;
DROP TYPE IF EXISTS "beta_code_status";
```
Then run migration again.

### Error: "Enum type already exists"

**Solution:** The enum exists but table doesn't. Create table manually:
```sql
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

### Error: "Permission denied"

**Solution:** Database user needs CREATE TABLE permissions:
```sql
-- Grant permissions (run as superuser)
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
```

Or use a database user with admin privileges.

---

## ✅ Post-Migration Steps

After successful migration:

### 1. Generate Beta Codes
```bash
# Generate 20 single-use codes
pnpm tsx scripts/generate-beta-codes.ts 20

# Generate 5 multi-use codes (each usable 5 times)
pnpm tsx scripts/generate-beta-codes.ts 5 admin 5

# Generate with expiration (30 days)
pnpm tsx scripts/generate-beta-codes.ts 10 admin 1 30
```

### 2. Test Beta Code Flow
1. Sign up with a beta code
2. Verify code activates correctly
3. Check user has unlimited credits
4. Verify "Founding Member" status

### 3. Verify Database
```sql
-- Check beta codes exist
SELECT code, status, uses, maxUses FROM beta_codes;

-- Check users with beta status
SELECT id, email, isBetaTester, credits FROM users WHERE "isBetaTester" = true;
```

---

## 📊 Migration Status Checklist

- [ ] `DATABASE_URL` environment variable set
- [ ] Database connection verified
- [ ] Migration command executed (`pnpm db:push`)
- [ ] `beta_codes` table exists
- [ ] `beta_code_status` enum exists
- [ ] Test query runs successfully
- [ ] Beta codes generated
- [ ] Beta code signup flow tested

---

## 🔗 Related Documentation

- [Beta Code System](BETA-CODE-SYSTEM.md) - How beta codes work
- [Beta Code Migration](BETA-CODE-MIGRATION.md) - Migration details
- [Launch Readiness](LAUNCH-READINESS.md) - Complete launch checklist
- [Vercel Deployment](VERCEL-DEPLOYMENT.md) - Vercel-specific setup

---

## 💡 Quick Reference

**Migration Command:**
```bash
pnpm db:push
```

**Verification:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM beta_codes;"
```

**Generate Codes:**
```bash
pnpm tsx scripts/generate-beta-codes.ts 20
```

---

**Need Help?** Check the troubleshooting section above or review the Railway/Vercel deployment documentation.

