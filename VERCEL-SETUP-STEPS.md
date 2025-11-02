# Step-by-Step: Vercel Setup Guide

## ✅ What We've Done So Far
- ✅ Logged into Vercel CLI
- ✅ Linked your project to Vercel
- ✅ Added NODE_ENV=production

## 📝 Step 1: Open Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. You should see your project called **"interpwhat"**
3. Click on the project name to open it

---

## 📝 Step 2: Go to Environment Variables

1. In your project, click on **"Settings"** (top menu)
2. Click on **"Environment Variables"** (left sidebar)
3. You'll see a list of current variables

---

## 📝 Step 3: Add Missing Variables

You'll see some variables already set:
- ✅ DATABASE_URL
- ✅ JWT_SECRET  
- ✅ OPENAI_API_KEY
- ✅ VITE_APP_LOGO
- ✅ VITE_APP_TITLE
- ✅ NODE_ENV

Now add these **one by one**:

### Click "Add New" button for each:

1. **VITE_APP_ID**
   - Key: `VITE_APP_ID`
   - Value: (your app ID - check if you have this from Manus/Railway)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **VITE_SUPABASE_URL**
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co` (your Supabase project URL)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **VITE_SUPABASE_ANON_KEY**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: (your Supabase anon key)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

4. **OAUTH_SERVER_URL**
   - Key: `OAUTH_SERVER_URL`
   - Value: (your OAuth server URL)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. **OAUTH_CLIENT_ID**
   - Key: `OAUTH_CLIENT_ID`
   - Value: (your OAuth client ID)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

6. **OAUTH_CLIENT_SECRET**
   - Key: `OAUTH_CLIENT_SECRET`
   - Value: (your OAuth client secret)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

7. **OWNER_OPEN_ID**
   - Key: `OWNER_OPEN_ID`
   - Value: (your owner open ID)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

8. **BUILT_IN_FORGE_API_URL**
   - Key: `BUILT_IN_FORGE_API_URL`
   - Value: (your Forge API URL)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

9. **BUILT_IN_FORGE_API_KEY**
   - Key: `BUILT_IN_FORGE_API_KEY`
   - Value: (your Forge API key)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

---

## 📝 Step 4: Where to Find These Values

If you don't have these values:

### Option A: Check Railway (if you deployed there)
1. Go to https://railway.app
2. Open your InterpWhat project
3. Go to **Variables** tab
4. Copy the values from there

### Option B: Check Supabase
1. Go to https://supabase.com
2. Open your project
3. Settings → API
4. Copy the URL and anon key

### Option C: Check Your Notes/Docs
- Look in your documentation
- Check email/notes where you saved these values

---

## 📝 Step 5: After Adding Variables

Once you've added all variables:

1. **Verify** - Scroll down and make sure all variables are listed
2. **Deploy** - Go back to project → **Deployments** tab
3. Click **"Redeploy"** or push to GitHub to trigger new deployment

---

## 🚀 Quick Deploy Command

After adding variables, you can deploy from terminal:

```bash
cd /Users/jamesknight/InterpWhat
vercel --prod
```

---

## ❓ Need Help?

If you're missing any values, let me know which ones and I can help you find them or determine if they're optional.

