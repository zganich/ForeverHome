# Fixing www.interpwhat.com SSL Certificate Issue

**Issue:** SSL certificate error for `www.interpwhat.com`  
**Status:** Fixed in code (redirect), Railway configuration needed for full fix

---

## 🔍 Problem

- ✅ `interpwhat.com` (without www) - **Working perfectly**
- ❌ `www.interpwhat.com` - **SSL certificate error**
- **Error:** `SSL: no alternative certificate subject name matches target host name 'www.interpwhat.com'`

**Root Cause:** Railway's SSL certificate only covers `interpwhat.com`, not `www.interpwhat.com`.

---

## ✅ Solutions Applied

### Solution 1: Application-Level Redirect (Implemented)

**Status:** ✅ **Code fix applied**

Added redirect middleware in `server/_core/index.ts` that automatically redirects:
- `www.interpwhat.com` → `interpwhat.com`

**How it works:**
- Users visiting `www.interpwhat.com` are automatically redirected to `interpwhat.com`
- This avoids the SSL certificate error
- Preserves SEO (301 permanent redirect)

**After deployment:**
- Deploy the updated code to Railway
- `www.interpwhat.com` will redirect to `interpwhat.com`
- No SSL errors for users

### Solution 2: Railway Configuration (Recommended for Long-Term)

**For proper SSL certificate coverage, configure in Railway:**

1. **Go to Railway Dashboard**
   - https://railway.app
   - Select InterpWhat project
   - Click on your service

2. **Add www Domain**
   - Go to **Settings** → **Domains**
   - If `www.interpwhat.com` is not listed:
     - Click **+ Add Domain** or **Custom Domain**
     - Enter: `www.interpwhat.com`
   
3. **Verify Domain**
   - Railway will show DNS verification instructions
   - Ensure CNAME record exists in your DNS:
     ```
     Type: CNAME
     Name: www
     Value: qqd6k908.up.railway.app (verify in Railway dashboard)
     ```
   
4. **Wait for SSL**
   - Once verified, Railway auto-provisions SSL
   - Takes 2-5 minutes after verification

5. **Result**
   - Both `www.interpwhat.com` and `interpwhat.com` will have valid SSL
   - No redirects needed (both work independently)
   - Better SEO (can choose preferred domain)

---

## 📊 Current Status

| Domain | Status | SSL | Notes |
|--------|--------|-----|-------|
| `interpwhat.com` | ✅ Working | ✅ Valid | Primary domain |
| `www.interpwhat.com` | ⚠️ SSL Error | ❌ Not covered | Redirects to non-www (after code deploy) |

---

## 🔧 Verification After Fix

### After Code Deployment

```bash
# Test redirect (should redirect to interpwhat.com)
curl -I https://www.interpwhat.com

# Should show:
# HTTP/2 301
# Location: https://interpwhat.com
```

### After Railway Configuration

```bash
# Both should work independently
pnpm check-railway interpwhat.com
pnpm check-railway www.interpwhat.com

# Both should show valid SSL certificates
```

---

## 🚀 Next Steps

1. **Deploy Updated Code**
   - Commit the redirect middleware fix
   - Push to GitHub
   - Railway will auto-deploy
   - `www.interpwhat.com` will redirect (no SSL errors for users)

2. **Configure Railway (Optional but Recommended)**
   - Add `www.interpwhat.com` in Railway dashboard
   - Verify DNS
   - Wait for SSL provisioning
   - Both domains work with valid SSL

---

## 📝 DNS Configuration

### Current DNS Status
- ✅ `www.interpwhat.com` → `qqd6k908.up.railway.app` (resolving)
- ✅ `interpwhat.com` → `qqd6k908.up.railway.app` (resolving)

### What Railway Needs
- Both domains should be listed in Railway dashboard
- Railway needs to provision SSL for both
- DNS is already correct, just need Railway configuration

---

## ⚠️ Important Notes

1. **Code Fix is Immediate**
   - Redirect middleware will work after next deployment
   - Users won't see SSL errors (they'll be redirected)
   - SEO-friendly (301 permanent redirect)

2. **Railway Configuration is Better**
   - Both domains work independently
   - Proper SSL for both
   - Better for marketing/links

3. **Both Solutions Work**
   - Redirect = Quick fix (already implemented)
   - Railway config = Proper long-term solution

---

**Status:** Code fix applied ✅  
**Next:** Deploy to Railway or configure Railway dashboard for full SSL coverage

