# Beta Code System - Database Migration Guide

**Last Updated:** January 2025

---

## Migration Required

The beta code system requires a new `beta_codes` table in the database. This migration must be run before generating or using beta codes.

---

## Migration Steps

### Option 1: Run Migration Command (Recommended)

**Prerequisites:**
- `DATABASE_URL` environment variable must be set
- Database connection must be accessible

**Command:**
```bash
pnpm db:push
```

This will:
1. Generate migration SQL from schema changes
2. Apply migration to database
3. Create `beta_codes` table and `beta_code_status` enum

---

### Option 2: Manual SQL Migration

If you can't run `pnpm db:push`, you can manually run the SQL migration:

**Create the enum:**
```sql
CREATE TYPE "beta_code_status" AS ENUM('active', 'used', 'expired', 'revoked');
```

**Create the table:**
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

---

## Verification

After migration, verify the table exists:

```sql
SELECT * FROM beta_codes LIMIT 1;
```

If the query runs without error, the migration was successful.

---

## Generate Beta Codes

Once the migration is complete, generate codes:

```bash
# Generate 20 single-use codes
pnpm tsx scripts/generate-beta-codes.ts 20

# Generate 5 multi-use codes (each usable 5 times)
pnpm tsx scripts/generate-beta-codes.ts 5 5

# Generate 1 code with notes
pnpm tsx scripts/generate-beta-codes.ts 1 1 "For tester John"
```

---

## Troubleshooting

### Error: "DATABASE_URL is required"
**Solution:** Set `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

### Error: "Table already exists"
**Solution:** The migration may have already run. Check if `beta_codes` table exists.

### Error: "Enum type already exists"
**Solution:** The enum may have been created manually. The migration should still complete.

---

## Next Steps

After migration:
1. ✅ Generate beta codes for Phase 1 testers
2. ✅ Test beta code signup flow
3. ✅ Verify codes activate correctly
4. ✅ Start Phase 1 beta testing

