# SSL Certificate Fix for www.interpwhat.com

**Issue Detected:** November 2024  
**Problem:** SSL certificate doesn't cover `www.interpwhat.com`  
**Error:** `SSL: no alternative certificate subject name matches target host name 'www.interpwhat.com'`

---

## 🔍 Issue Analysis

**Current Status:**
- ✅ DNS resolves correctly: `www.interpwhat.com` → `qqd6k908.up.railway.app`
- ❌ SSL certificate doesn't include `www.interpwhat.com` in Subject Alternative Names (SAN)
- ⚠️ HTTPS connection fails with certificate mismatch error

**Root Cause:**
The SSL certificate issued by Railway likely only covers:
- `interpwhat.com` (without www)
- But NOT `www.interpwhat.com`

---

## ✅ Solution: Fix in Railway Dashboard

### Option 1: Add www.interpwhat.com as Separate Domain (Recommended)

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Select your InterpWhat project
   - Click on your service

2. **Add www Domain**
   - Go to **Settings** → **Domains**
   - Click **+ Add Domain** or **Custom Domain**
   - Enter: `www.interpwhat.com`
   - Railway will provide DNS verification instructions

3. **Verify DNS**
   - Railway will show DNS records needed
   - Add CNAME record in your DNS provider:
     ```
     Type: CNAME
     Name: www
     Value: qqd6k908.up.railway.app (or Railway-provided value)
     ```
   - Wait for DNS propagation (5-30 minutes)

4. **Wait for SSL Provisioning**
   - Once domain shows as "Verified" in Railway
   - Railway automatically provisions SSL certificate
   - This typically takes 2-5 minutes after verification

### Option 2: Set Up Redirect (Alternative)

If you want `www.interpwhat.com` to redirect to `interpwhat.com`:

1. **In Railway**
   - Keep only `interpwhat.com` configured
   
2. **In Your DNS Provider**
   - Set up redirect at DNS level (if supported)
   - Or use Railway's redirect feature (if available)

3. **In Application Code**
   - Add Express middleware to redirect www to non-www:
   ```typescript
   // server/_core/index.ts or similar
   app.use((req, res, next) => {
     if (req.hostname.startsWith('www.')) {
       return res.redirect(301, `https://interpwhat.com${req.url}`);
     }
     next();
   });
   ```

---

## 🔧 Verification Steps

After fixing, verify:

1. **Check Domain Status in Railway**
   ```bash
   # Check Railway dashboard → Settings → Domains
   # Should show both domains as "Verified"
   ```

2. **Test SSL Certificate**
   ```bash
   pnpm check-railway www.interpwhat.com
   ```

3. **Test HTTPS Connection**
   ```bash
   curl -I https://www.interpwhat.com
   # Should return 200 or 301 (not SSL errors)
   ```

4. **Browser Test**
   - Visit https://www.interpwhat.com
   - Should show valid SSL certificate (no security warnings)
   - Check certificate details in browser (click padlock icon)

---

## 📋 DNS Configuration Required

### For www.interpwhat.com

In your DNS provider (wherever `interpwhat.com` is registered):

```
Type: CNAME
Name: www
Value: qqd6k908.up.railway.app
TTL: 3600 (or default)
```

**Note:** Railway may provide a different CNAME target. Always use what Railway shows in the dashboard.

### Current DNS Status
- ✅ `www.interpwhat.com` → `qqd6k908.up.railway.app` (resolving correctly)
- Need to ensure Railway recognizes and provisions SSL for it

---

## ⚠️ Common Issues & Solutions

### Issue: Domain shows as "Pending" in Railway
- **Solution:** Verify DNS CNAME record is correct
- **Check:** DNS propagation can take time (use `dig www.interpwhat.com` to verify)

### Issue: SSL not provisioning after domain verification
- **Solution:** 
  - Remove domain from Railway
  - Wait 5 minutes
  - Re-add domain
  - This triggers new certificate issuance

### Issue: Certificate still shows wrong domain
- **Solution:** 
  - Clear browser cache
  - Wait for certificate renewal (Railway auto-renews)
  - Check certificate in Railway dashboard

---

## 🎯 Quick Fix Checklist

1. [ ] Go to Railway dashboard → Project → Service → Settings → Domains
2. [ ] Verify `interpwhat.com` is listed and "Verified"
3. [ ] Add `www.interpwhat.com` if not present
4. [ ] Configure DNS CNAME for www subdomain
5. [ ] Wait for domain verification (5-30 minutes)
6. [ ] Wait for SSL provisioning (2-5 minutes after verification)
7. [ ] Test: `pnpm check-railway www.interpwhat.com`
8. [ ] Test in browser: https://www.interpwhat.com

---

## 📝 Notes

- Railway automatically provisions SSL certificates via Let's Encrypt
- Certificates are auto-renewed
- Both `www` and non-`www` domains need to be added separately in Railway
- DNS changes can take time to propagate globally

---

**Next Steps:**
1. Check Railway dashboard for domain configuration
2. Add www.interpwhat.com if missing
3. Verify DNS records
4. Wait for SSL provisioning
5. Test using `pnpm check-railway www.interpwhat.com`

