# Integration Guide: GitHub, Supabase, and Deployment Platforms

**Last Updated:** November 2024  
**Status:** ✅ Verified against actual codebase

This guide covers setup, configuration, and troubleshooting for all external integrations used by InterpWhat.

**Verified Integrations:**
- ✅ GitHub: Connected and verified
- ✅ Supabase: Client-side auth implementation verified
- ✅ Deployment: **Railway** (confirmed by user)

---

## 🔗 GitHub Integration

### Repository Information
- **URL**: `https://github.com/zganich/interpwhat.git`
- **Status**: ✅ Connected

### Verification
```bash
# Check current remote
git remote -v

# Should show:
# origin  https://github.com/zganich/interpwhat.git (fetch)
# origin  https://github.com/zganich/interpwhat.git (push)
```

### Common Workflows
```bash
# Pull latest changes
git pull origin main

# Push changes
git add .
git commit -m "Your commit message"
git push origin main

# Check status
git status
```

### Reconnecting GitHub (if needed)
If you need to reconnect or change the remote:
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/zganich/interpwhat.git

# Verify
git remote -v
```

---

## 🔐 Supabase Integration

### Overview
✅ **VERIFIED**: Supabase is used for **client-side authentication only**. The main database uses PostgreSQL via `DATABASE_URL` (managed separately, not via Supabase).

### Required Environment Variables
```env
# Frontend (client-side) - Must be prefixed with VITE_ to work in client code
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Implementation Details (Verified):**
- ✅ Uses `@supabase/supabase-js` v2.77.0
- ✅ Client initialized in `client/src/lib/supabase.ts`
- ✅ Auth context provided in `client/src/contexts/SupabaseAuthContext.tsx`
- ✅ Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

These are **public keys** safe for client-side use. The Supabase client handles:
- User sign up/in
- Session management
- Password reset
- Auth state changes

### Setup Instructions

#### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project to be provisioned (~2 minutes)

#### 2. Get Your Credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

#### 3. Configure Environment
Add to your `.env` file (or `.env.local` for frontend):
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4. Verify Setup
```bash
# Check if variables are set
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Authentication Flow
1. User signs up/logs in via `SupabaseAuthContext`
2. Supabase handles authentication
3. Session is stored client-side
4. Protected routes check `user` state from context

### Code Reference
- **Client Setup**: `client/src/lib/supabase.ts`
- **Auth Context**: `client/src/contexts/SupabaseAuthContext.tsx`
- **Usage**: See `client/src/pages/Login.tsx`, `client/src/pages/Dashboard.tsx`

### Troubleshooting

**Issue**: "Missing Supabase environment variables"
- **Solution**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- **Check**: Look for warnings in browser console

**Issue**: Authentication not working
- **Solution**: Verify Supabase project is active and credentials are correct
- **Check**: Supabase dashboard → Settings → API

**Issue**: CORS errors
- **Solution**: Check Supabase project settings for allowed origins
- **Location**: Supabase Dashboard → Settings → API → CORS

---

## 🚀 Deployment Platforms

### Current Deployment Status

**✅ CONFIRMED**: InterpWhat is deployed on **Railway**.

**Note:** The codebase also has:
- **Vercel** configuration (`vercel.json`, `api/index.ts`) - **Now primary deployment platform**
- **Manus Platform** references (legacy/integration code)

---

### 🏗️ Manus Platform (Current)

#### Overview
The application currently runs on **Manus Platform**, which provides:
- Built-in OAuth authentication (via `OAUTH_SERVER_URL`)
- File storage via Forge API (`BUILT_IN_FORGE_API_URL`)
- Runtime environment for the Express server

#### Configuration
- Uses `vite-plugin-manus-runtime` plugin
- Allowed hosts configured in `vite.config.ts`
- Manus domains: `.manusvm.computer`, `.manus.computer`, etc.

#### Required Environment Variables (Manus)
```env
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://oauth-server-url
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
OWNER_OPEN_ID=your-owner-open-id
BUILT_IN_FORGE_API_URL=https://forge-api-url
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

---

### ▲ Vercel Deployment (PRIMARY)

#### Overview
✅ **InterpWhat is configured for Vercel deployment**. Vercel provides serverless functions, automatic SSL, and global CDN.

#### Configuration Files
- `vercel.json` - Deployment configuration
- `api/index.ts` - Serverless function entry point
- Build output: `dist/public` (frontend static files)
- API routes: All `/api/*` requests routed to serverless function

#### Build Settings
- **Build Command**: `pnpm install && pnpm build`
- **Output Directory**: `dist/public`
- **Install Command**: `pnpm install`

#### See Full Documentation
See **[docs/VERCEL-DEPLOYMENT.md](../VERCEL-DEPLOYMENT.md)** for complete Vercel deployment guide.

---

### 🚂 Railway Deployment (CURRENT - ACTIVE)

#### Overview
✅ **InterpWhat is currently deployed on Railway**. Railway automatically provisions SSL certificates and handles HTTPS.

#### Setup Instructions

#### 1. Connect Repository
1. Go to [railway.app](https://railway.app)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Choose `zganich/interpwhat` repository

#### 2. Configure Environment Variables
In Railway dashboard, go to **Variables** tab and add:

**Required Variables:**
```env
# Server
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-jwt-secret-here
VITE_APP_ID=your-app-id

# Supabase (for client)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-...

# OAuth (Manus)
OAUTH_SERVER_URL=https://...
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
OWNER_OPEN_ID=...

# Storage (Forge API)
BUILT_IN_FORGE_API_URL=https://...
BUILT_IN_FORGE_API_KEY=...

# Stripe (if using)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
```

#### 3. Configure Build Settings
Railway should auto-detect:
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Root Directory**: `/`

If needed, manually set in **Settings** → **Deploy**.

#### 4. Database Setup
Railway can provision PostgreSQL:
1. In Railway project, click **+ New**
2. Select **Database** → **PostgreSQL**
3. Copy the connection string
4. Add as `DATABASE_URL` environment variable

#### 5. Run Migrations
After database is connected:
```bash
# Via Railway CLI or in deployment
pnpm db:push
```

### Deployment Process
1. Push to GitHub
2. Railway automatically deploys (if auto-deploy enabled)
3. Check **Deployments** tab for status
4. View logs in **Deploy Logs**

### Monitoring
- **Logs**: Available in Railway dashboard
- **Metrics**: CPU, Memory, Network in **Metrics** tab
- **Custom Domain**: Configure in **Settings** → **Domains**

### Troubleshooting

**Issue**: Build fails
- **Solution**: Check build logs in Railway dashboard
- **Common causes**: Missing dependencies, build command incorrect

**Issue**: Application won't start
- **Solution**: Verify `PORT` environment variable is set
- **Check**: Railway uses `PORT` env var for dynamic port assignment

**Issue**: Database connection fails
- **Solution**: Verify `DATABASE_URL` is correct and database is provisioned
- **Check**: Railway database service status

**Issue**: Environment variables not loading
- **Solution**: Ensure variables are set in Railway (not just `.env` file)
- **Note**: `.env` file is not automatically used in Railway

---

## 🔄 Integration Status Check

### Quick Verification Script
Run the setup check script:
```bash
bash scripts/setup-check.sh
```

### Manual Checks

#### GitHub
```bash
git remote -v  # Should show GitHub URL
git fetch      # Should connect successfully
```

#### Supabase
```bash
# Check if env vars are set (frontend)
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Or check in browser console:
# Look for Supabase client initialization
```

#### Deployment Platform (Railway)
- **Railway**: ✅ Primary deployment platform
  - Check Railway dashboard: https://railway.app
  - Go to project → Service → Settings → Domains (to find deployment URL)
  - View deployment logs and metrics
  - Check SSL certificate status (auto-provisioned)
- **Vercel**: Alternative/backup configuration available
- Verify environment variables are set in Railway dashboard
- Check Railway deployment logs for errors

---

## 🔐 Security Best Practices

1. **Never commit secrets**
   - Use `.env.example` as template
   - Add `.env` to `.gitignore`
   - Use Railway/Supabase environment variable settings

2. **Use appropriate keys**
   - Supabase `anon` key is safe for client-side (it's public)
   - Server-side keys should never be exposed to client

3. **Rotate keys regularly**
   - Update in Railway dashboard
   - Update in Supabase dashboard
   - Update in `.env` file locally

---

## 📚 Additional Resources

- **GitHub Docs**: https://docs.github.com
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app (if using Railway)
- **InterpWhat Best Practices**: `docs/BEST-PRACTICES.md`

---

## ❓ Need Help?

1. **Check this guide first** - Most common issues are covered
2. **Review service dashboards** - GitHub, Supabase, Railway
3. **Check application logs** - Railway deployment logs
4. **Consult documentation** - Service-specific docs linked above

---

**Last verified**: November 2024  
**Verified against**: Actual codebase implementation  
**Maintained by**: Development Team

---

## 📝 Verification Notes

### Supabase Integration ✅
- **Status**: VERIFIED - Correctly implemented
- **Usage**: Client-side authentication only
- **Files**: `client/src/lib/supabase.ts`, `client/src/contexts/SupabaseAuthContext.tsx`
- **Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Database ✅
- **Actual**: PostgreSQL (via `drizzle-orm/postgres-js`)
- **Config**: `drizzle.config.ts` uses `dialect: "postgresql"`
- **Note**: Some docs incorrectly mention MySQL - this has been corrected

### Deployment Platforms ✅
- **Current**: **Railway** (confirmed - active deployment)
- **Vercel**: Configuration files present (`vercel.json`, `api/index.js`) - available as alternative
- **Manus**: Legacy/integration code references (not primary deployment)
- **Files**: `vercel.json`, `api/index.js` (Vercel config available)

