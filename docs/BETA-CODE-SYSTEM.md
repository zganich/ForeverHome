# Beta Code System - Implementation Guide

**Last Updated:** January 2025  
**Status:** ✅ Complete

---

## Overview

The beta code system allows beta testers to sign up with a special invite code that unlocks unlimited analyses and Founding Member status.

## How It Works

### For Beta Testers

1. **During Signup** (Recommended)
   - Navigate to `/login`
   - Click "Sign up"
   - Enter email, password, and **beta code** (optional)
   - Code is validated in real-time as you type
   - After email confirmation and login, beta status is automatically activated

2. **After Signup** (Alternative)
   - Navigate to `/dashboard`
   - Click "Redeem Beta Code" card
   - Enter beta code
   - Code is activated immediately

### Beta Code Format

- Format: `BETA-XXXXX-XXXX`
- Example: `BETA-A3F9K-M2X1`
- Case-insensitive (automatically converted to uppercase)
- Single-use by default (can be configured for multiple uses)

---

## Admin: Generating Beta Codes

### Quick Start

```bash
# Generate 10 single-use codes
pnpm tsx scripts/generate-beta-codes.ts 10

# Generate 5 codes, each usable 5 times
pnpm tsx scripts/generate-beta-codes.ts 5 5

# Generate 1 code with custom notes
pnpm tsx scripts/generate-beta-codes.ts 1 1 "For tester John"
```

### Code Properties

- **Single-use codes** (default): Can only be used once, then marked as "used"
- **Multi-use codes**: Can be used up to `maxUses` times
- **Expiration**: Optional expiration date (not set by default)
- **Status**: `active`, `used`, `expired`, or `revoked`

---

## Database Schema

### `beta_codes` Table

```sql
CREATE TABLE "beta_codes" (
  "id" varchar(64) PRIMARY KEY,
  "code" varchar(64) UNIQUE NOT NULL,
  "createdBy" varchar(64),              -- Admin user ID
  "maxUses" integer DEFAULT 1,          -- How many times code can be used
  "uses" integer DEFAULT 0 NOT NULL,    -- Current usage count
  "status" "beta_code_status" DEFAULT 'active',
  "expiresAt" timestamp,                -- Optional expiration
  "notes" text,                          -- Optional notes
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);
```

### User Beta Status

When a beta code is activated, the user's record is updated:
- `isBetaTester`: `true`
- `betaInviteCode`: The code that was used
- `credits`: 999999` (effectively unlimited)

---

## API Endpoints

### Validate Beta Code (Public)

**Endpoint:** `trpc.credits.validateBetaCode`

**Input:**
```typescript
{
  code: string
}
```

**Output:**
```typescript
{
  valid: boolean
}
```

**Usage:** Validates code format and checks if it's active/available. Used for real-time validation in signup form.

### Redeem Beta Code (Protected)

**Endpoint:** `trpc.credits.redeemBetaCode`

**Input:**
```typescript
{
  code: string
}
```

**Output:**
```typescript
{
  success: boolean
}
```

**Usage:** Activates beta tester status for the authenticated user.

---

## Code Lifecycle

1. **Generated**: Admin creates code via script
2. **Active**: Code is available for use
3. **Validated**: Code is checked during signup/login
4. **Redeemed**: Code is activated for user
5. **Used**: Code usage count incremented
6. **Marked as Used**: If single-use, status changes to "used"

---

## Features

### ✅ Real-Time Validation
- Codes are validated as user types in signup form
- Visual feedback (green checkmark or red error)

### ✅ Automatic Activation
- Codes entered during signup are automatically activated after login
- Uses localStorage to persist code between signup and login

### ✅ Single or Multi-Use
- Default: Single-use codes
- Can generate multi-use codes for groups

### ✅ Usage Tracking
- Tracks how many times each code has been used
- Automatically marks codes as "used" when max uses reached

### ✅ Expiration Support
- Optional expiration dates
- Automatically marks expired codes as "expired"

### ✅ Status Management
- `active`: Available for use
- `used`: Reached max uses
- `expired`: Past expiration date
- `revoked`: Manually revoked by admin

---

## Testing

### Test Code Generation

```bash
# Generate a test code
pnpm tsx scripts/generate-beta-codes.ts 1 1 "Test code"

# Output: BETA-XXXXX-XXXX
```

### Test Signup Flow

1. Generate a test code
2. Navigate to `/login`
3. Click "Sign up"
4. Enter email, password, and test code
5. Verify code shows as valid (green checkmark)
6. Complete signup
7. Confirm email
8. Login
9. Verify beta status activated automatically

### Test Dashboard Redemption

1. Login as existing user
2. Navigate to `/dashboard`
3. Click "Redeem Beta Code"
4. Enter valid code
5. Verify success message
6. Verify unlimited credits

---

## Troubleshooting

### Code Not Validating

- **Check format**: Must start with `BETA-` and match pattern
- **Check database**: Code must exist in `beta_codes` table
- **Check status**: Code must be `active` (not `used`, `expired`, or `revoked`)
- **Check expiration**: Code must not be expired
- **Check usage**: Code must not have reached `maxUses`

### Code Not Activating After Signup

- **Check localStorage**: Code should be stored in `pendingBetaCode`
- **Check login**: User must complete email confirmation and login
- **Check user ID**: User must exist in database (created after first login)
- **Check logs**: Review server logs for errors

### Code Already Used

- Single-use codes can only be used once
- Multi-use codes can be used up to `maxUses` times
- Check `uses` vs `maxUses` in database

---

## Next Steps

1. **Generate Codes**: Use script to generate codes for Phase 1 beta testers
2. **Share Codes**: Distribute codes via email, Slack, or other channels
3. **Track Usage**: Monitor code usage in database
4. **Revoke Codes**: If needed, revoke codes via admin interface (future)

---

## Related Documentation

- [Phase 1 Beta Implementation](BETA-PHASE-1-IMPLEMENTATION.md)
- [Beta Tester Onboarding](BETA-TESTER-ONBOARDING.md)
- [Testing Strategy](TESTING-STRATEGY.md)

