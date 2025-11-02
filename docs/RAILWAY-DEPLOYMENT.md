# Railway Deployment Guide

**Last Updated:** November 2024  
**Status:** ✅ Active Deployment Platform

---

## 🚂 Railway Deployment Status

InterpWhat is deployed on **Railway**. Railway automatically handles:
- ✅ SSL/HTTPS certificates (auto-provisioned)
- ✅ DNS resolution
- ✅ Auto-deployments from GitHub
- ✅ Environment variable management
- ✅ Database provisioning (PostgreSQL)

---

## 🔍 Finding Your Railway Deployment URL

### Method 1: Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Sign in and select your **InterpWhat** project
3. Click on your service
4. Go to **Settings** → **Domains**
5. You'll see either:
   - **Railway auto-generated URL**: `*.railway.app` (e.g., `interpwhat-production.railway.app`)
   - **Custom domain**: If you've configured one

### Method 2: Check Recent Deployments
1. Railway Dashboard → Your Project
2. Click on **Deployments** tab
3. View deployment logs - the URL is often shown in logs

---

## 🔒 SSL Certificate Status

### Railway Auto-Generated Domains (*.railway.app)
- ✅ **SSL is automatically provisioned**
- ✅ **Auto-renewed by Railway**
- ✅ **No configuration needed**
- ✅ **Valid HTTPS certificate**

### Custom Domains
- ✅ **SSL is automatically provisioned** after domain verification
- ✅ Railway verifies domain ownership via DNS
- ✅ Certificate is issued within minutes of verification
- ✅ Auto-renewed

### Check SSL Certificate
```bash
# If you know your Railway URL:
bash scripts/check-railway-ssl.sh your-app.railway.app

# Or with pnpm:
pnpm check-railway your-app.railway.app
```

---

## 📊 Railway Dashboard Checklist

### Service Health
- [ ] Service shows as "Running" in Railway dashboard
- [ ] No critical errors in deployment logs
- [ ] Resource usage is within limits

### Environment Variables
- [ ] All required variables are set (see `.env.example`)
- [ ] `DATABASE_URL` is configured (Railway PostgreSQL service)
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- [ ] `OPENAI_API_KEY` is configured
- [ ] Other service keys are set

### Domain & SSL
- [ ] Domain is listed in Settings → Domains
- [ ] Domain shows as "Verified" (if custom domain)
- [ ] SSL certificate status is "Active" or "Valid"

### Deployment
- [ ] Latest commit is deployed
- [ ] Build succeeded in Railway logs
- [ ] Application starts successfully

---

## 🛠️ Railway Configuration

### Build Settings
Railway should auto-detect:
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Root Directory**: `/` (project root)

### Port Configuration
Railway automatically sets `PORT` environment variable. Your Express app should use:
```typescript
const port = process.env.PORT || 3000;
```

---

## 📝 Verification Commands

### Check Railway Deployment URL
```bash
# You need to find your Railway URL first from dashboard
# Then check SSL:
pnpm check-railway <your-railway-url>
```

### Example
```bash
pnpm check-railway interpwhat-production.railway.app
# or
pnpm check-railway yourdomain.com
```

---

## 🔧 Troubleshooting

### SSL Certificate Issues

**Problem**: Certificate not showing as valid
- **Solution**: Wait a few minutes after domain verification - Railway provisions SSL automatically
- **Check**: Railway dashboard → Settings → Domains → Certificate status

**Problem**: Custom domain SSL not provisioning
- **Solution**: 
  1. Verify DNS records are correct (CNAME pointing to Railway)
  2. Ensure domain is marked as "Verified" in Railway
  3. Remove and re-add domain to trigger new certificate issuance

### Deployment Issues

**Problem**: Application returns 502/503 errors
- **Solution**: Check Railway logs for application errors
- **Check**: Environment variables are set correctly
- **Verify**: Database connection (`DATABASE_URL`)

**Problem**: Build fails
- **Solution**: Check Railway build logs
- **Common causes**: Missing dependencies, incorrect build command
- **Fix**: Verify `package.json` scripts are correct

---

## 📚 Railway Resources

- **Railway Dashboard**: https://railway.app
- **Railway Docs**: https://docs.railway.app
- **Railway Status**: https://status.railway.app

---

## ✅ Quick Checklist

1. ✅ Railway deployment is active
2. ✅ SSL certificate is auto-provisioned by Railway
3. ✅ DNS resolves correctly
4. ✅ Environment variables are configured
5. ✅ Application is running and accessible

**To verify everything is working:**
1. Find your Railway URL in the dashboard
2. Run: `pnpm check-railway <your-url>`
3. Check Railway dashboard for deployment status

---

**Last Verified:** November 2024  
**Platform:** Railway  
**SSL Status:** Auto-provisioned by Railway

