# Vercel Deployment Guide

**Last Updated:** January 2025  
**Status:** ✅ Configured and Ready for Deployment

---

## ▲ Vercel Deployment Overview

InterpWhat is configured for deployment on **Vercel**, which provides:
- ✅ **Serverless Functions** - API routes run as serverless functions
- ✅ **Automatic SSL** - Both www and non-www domains work automatically
- ✅ **Global CDN** - Fast frontend delivery worldwide
- ✅ **Automatic Deployments** - From GitHub
- ✅ **Edge Network** - Optimized performance

---

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Connected to Vercel
3. **PostgreSQL Database** - External database (Vercel Postgres, Supabase, or other)
4. **Environment Variables** - All required vars configured

---

## 🚀 Quick Start Deployment

### 1. Connect Repository to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New...** → **Project**
3. Import your GitHub repository: `zganich/interpwhat`
4. Vercel will auto-detect settings:
   - **Framework Preset:** Other
   - **Root Directory:** `/`
   - **Build Command:** `pnpm install && pnpm build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `pnpm install`

### 2. Configure Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

**Required Variables:**
```env
# Server Configuration
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-jwt-secret-here
VITE_APP_ID=your-app-id

# Supabase (for client-side auth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (for AI analysis)
OPENAI_API_KEY=sk-...

# OAuth (Manus Platform)
OAUTH_SERVER_URL=https://...
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
OWNER_OPEN_ID=...

# Storage (Vercel Blob - Automatic, no keys needed!)
# File storage uses Vercel Blob - no API keys required
# Forge API still used for: dataApi, notifications, LLM fallback
BUILT_IN_FORGE_API_URL=https://... # Optional: for dataApi/notifications only
BUILT_IN_FORGE_API_KEY=... # Optional: for dataApi/notifications only

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
```

**Important Notes:**
- Variables prefixed with `VITE_` are exposed to the client
- Variables without `VITE_` are server-only
- Set variables for **Production**, **Preview**, and **Development** environments as needed

### 3. Deploy

1. Click **Deploy**
2. Wait for build to complete (usually 2-5 minutes)
3. Your app will be available at `https://your-project.vercel.app`

---

## 🏗️ Configuration Files

### vercel.json

Located at project root, configured with:
- **Output Directory:** `dist/public` (matches Vite build output)
- **API Function:** `api/index.ts` with 60s timeout (for AI analysis)
- **Rewrites:** All requests route through API for SPA routing
- **Security Headers:** XSS protection, frame options, etc.

### api/index.ts

Serverless function entry point that:
- Creates Express app using `createApp()`
- Serves static files for frontend
- Handles all API routes (tRPC, file uploads, OAuth)
- Caches app instance for performance

---

## 📦 Build Process

Vercel runs these commands automatically:

1. **Install:** `pnpm install`
2. **Build:** `pnpm build`
   - Builds frontend with Vite → `dist/public`
   - Bundles server code with esbuild → `dist/index.js`
3. **Deploy:** 
   - Serves static files from `dist/public`
   - Routes API requests to `api/index.ts`

---

## 🔄 Automatic Deployments

Vercel automatically deploys:
- **Production:** Every push to `main` or `master` branch
- **Preview:** Every push to other branches or pull requests

To configure:
1. Go to **Settings** → **Git**
2. Select production branch (usually `main`)
3. Enable **Automatic deployments**

---

## 🌐 Custom Domain Setup

### Add Custom Domain

1. Go to **Settings** → **Domains**
2. Add your domain: `interpwhat.com`
3. Add DNS records as instructed:
   - **A Record** or **CNAME** pointing to Vercel
4. Vercel automatically provisions SSL certificate
5. **Both www and non-www work automatically** ✅

### DNS Configuration

**For root domain (interpwhat.com):**
- Add **A Record**: `@` → `76.76.21.21` (Vercel IP)
- Or use **CNAME**: `@` → `cname.vercel-dns.com`

**For www subdomain:**
- Add **CNAME**: `www` → `cname.vercel-dns.com`
- Vercel handles this automatically

---

## ⚙️ Serverless Function Configuration

### Function Timeout

AI analysis takes 15-25 seconds, so we use **60s timeout**:

```json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 60
    }
  }
}
```

**Note:** This requires **Vercel Pro** ($20/month) for functions longer than 10s.

### Cold Starts

- First request after inactivity: ~1-2 seconds
- Subsequent requests: Instant
- Function stays warm for ~5 minutes

---

## 🗄️ Database Setup

Vercel doesn't provide built-in PostgreSQL, so use external provider:

### Option 1: Vercel Postgres (Recommended)
1. In Vercel project, go to **Storage** tab
2. Add **Postgres** database
3. Connection string automatically added as `DATABASE_URL`

### Option 2: Supabase PostgreSQL
1. Create PostgreSQL database in Supabase
2. Copy connection string
3. Add as `DATABASE_URL` in Vercel environment variables

### Option 3: Other Providers
- Railway PostgreSQL
- Neon PostgreSQL
- AWS RDS
- Any PostgreSQL database

**Connection String Format:**
```
postgresql://user:password@host:port/database?sslmode=require
```

### Running Migrations

Migrations should run automatically or via Vercel build command:

```bash
# Add to package.json build script if needed
"build": "vite build && esbuild ... && pnpm db:push"
```

Or run manually after deployment:
```bash
vercel env pull .env.local
pnpm db:push
```

---

## 📊 Monitoring & Logs

### View Logs

1. Go to **Deployments** tab
2. Click on a deployment
3. View **Function Logs** or **Build Logs**

### Real-time Logs

```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs
```

### Metrics

- **Requests:** Function invocations
- **Duration:** Response times
- **Errors:** Error rates
- View in **Analytics** tab

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Vercel dashboard for secrets
- ✅ Use different values for dev/preview/production
- ✅ Rotate secrets regularly

### API Routes
- ✅ All `/api/*` routes are serverless functions
- ✅ Client-side code can't access server-only env vars
- ✅ tRPC provides type-safe API layer

### CORS & Headers
- Security headers configured in `vercel.json`
- CORS handled by Express middleware
- Static files served with proper headers

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build command fails  
**Solutions:**
- Check build logs in Vercel dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `package.json` (not only `devDependencies`)

**Issue:** TypeScript errors  
**Solutions:**
- Run `pnpm check` locally first
- Fix type errors before deploying
- Check `tsconfig.json` configuration

### Function Errors

**Issue:** Function timeout  
**Solutions:**
- AI analysis takes 15-25s, requires Vercel Pro (60s timeout)
- Free tier has 10s limit (too short)
- Consider optimizing AI calls or using Pro tier

**Issue:** Cold start too slow  
**Solutions:**
- Cold starts are normal (~1-2s first request)
- Use Vercel Pro for faster cold starts
- Keep functions warm with periodic pings (optional)

### Static Files Not Loading

**Issue:** 404 for static assets  
**Solutions:**
- Verify `outputDirectory` in `vercel.json` matches Vite build output
- Check that `dist/public` exists after build
- Ensure `serveStatic()` function finds correct path

**Issue:** SPA routing not working  
**Solutions:**
- Verify rewrites in `vercel.json` route all requests to `/api/index`
- Check that `serveStatic()` serves `index.html` for non-API routes
- Test with browser dev tools network tab

### Database Connection Issues

**Issue:** Database connection fails  
**Solutions:**
- Verify `DATABASE_URL` is set correctly
- Check database allows connections from Vercel IPs
- Ensure SSL is enabled in connection string: `?sslmode=require`
- Test connection string locally first

### Environment Variables Not Working

**Issue:** Variables not available in functions  
**Solutions:**
- Variables without `VITE_` prefix are server-only (correct)
- Variables with `VITE_` prefix are exposed to client
- Redeploy after adding/changing environment variables
- Check variable is set for correct environment (Production/Preview/Development)

---

## 💰 Pricing & Limits

### Free Tier
- ✅ 100GB bandwidth/month
- ✅ 100 serverless function invocations/day
- ⚠️ 10s function timeout (too short for AI analysis)
- ⚠️ 100 function execution hours/month

### Pro Tier ($20/month)
- ✅ Unlimited bandwidth
- ✅ 1000 function invocations/day
- ✅ **60s function timeout** (required for AI analysis)
- ✅ Unlimited function execution hours
- ✅ Advanced analytics

**Recommendation:** Use **Vercel Pro** for InterpWhat (AI analysis needs 60s timeout)

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured in Vercel
- [ ] Database migrations run successfully
- [ ] `vercel.json` configuration correct
- [ ] Build completes without errors locally
- [ ] Custom domain added and DNS configured
- [ ] SSL certificate provisioned (automatic)
- [ ] Test API endpoints work correctly
- [ ] Test file uploads work (50MB limit)
- [ ] Test AI analysis completes within timeout
- [ ] Monitor logs for errors after deployment

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)
- [Custom Domains Guide](https://vercel.com/docs/custom-domains)

---

## 🔄 Migration from Railway

If migrating from Railway:

1. **Export environment variables** from Railway dashboard
2. **Import to Vercel** environment variables
3. **Update DNS** to point to Vercel
4. **Deploy to Vercel**
5. **Test thoroughly** before switching DNS
6. **Update Railway** once Vercel is confirmed working
7. **Keep Railway** as backup for a few days

---

## ✅ Advantages of Vercel

1. **Automatic SSL** - Both www and non-www work
2. **Global CDN** - Faster frontend delivery
3. **Edge Network** - Optimized performance
4. **Better for React Apps** - Designed for this architecture
5. **Easy Custom Domains** - Simple DNS configuration
6. **Preview Deployments** - Test PRs before merge
7. **Automatic Deployments** - From GitHub

---

*Last updated: January 2025*

