# Connect Claude to GitHub for Private Repository Access

## Current Status

- ❌ Claude is **NOT** currently authorized in GitHub
- ✅ Your repository exists and is private: https://github.com/zganich/interpwhat
- ✅ All files are pushed and working
- ⚠️ Claude simply cannot see it without authorization

## Step-by-Step Connection Instructions

### Method 1: Through Claude App/Website (Recommended)

1. **Open Claude**
   - Use the Claude app or go to claude.ai
   - Sign in to your Claude account

2. **Go to Settings**
   - Click your profile icon or avatar
   - Select **"Settings"** or **"Account Settings"**

3. **Find Connectors/Integrations**
   - Look for **"Connectors"** tab or section
   - Or search for **"Integrations"**
   - Find **"GitHub"** in the list

4. **Connect GitHub**
   - Click **"Connect"** next to GitHub
   - You'll be redirected to GitHub.com

5. **⚠️ IMPORTANT: Authorize with Private Repo Access**
   
   On the GitHub authorization page:
   - **IMPORTANT:** Look for "This application will be able to:"
   - Find and **CHECK** any box that mentions:
     - ✅ "Access private repositories"
     - ✅ "Read private repository data"
     - ✅ Something similar about private repos
   - Also check:
     - ✅ "Read access to public repositories" (usually checked by default)
     - ✅ Any other permissions you're comfortable with
   - **Click "Authorize [App Name]"** or "Grant Access"

6. **Verify Connection**
   - You should be redirected back to Claude
   - GitHub should now show as "Connected" in Claude settings

7. **Test It**
   - Ask Claude: "Can you see my InterpWhat repository on GitHub?"
   - Or: "List the files in my InterpWhat repo"
   - If Claude can read it, you're done!

### Method 2: Direct GitHub Authorization URL

If Claude provides a direct authorization link, use it and make sure to:
- ✅ Check "Access private repositories"
- ✅ Complete the full authorization

### What Claude Should Request

When authorizing, Claude should ask for these permissions:

✅ **Required:**
- Read access to private repositories

✅ **Nice to Have:**
- Read access to public repositories
- Read access to issues
- Read access to pull requests

❌ **Not Needed (don't grant unless required):**
- Write access
- Admin access
- Delete access

## After Connecting

1. **Verify in GitHub:**
   - Go to: https://github.com/settings/applications
   - Check **"Authorized OAuth Apps"** tab
   - You should now see "Claude" (or "Anthropic Claude")
   - Verify it has "Access private repositories" checked

2. **Verify in Claude:**
   - Settings → Connectors
   - GitHub should show "Connected"

3. **Test Access:**
   - Ask Claude to read from your InterpWhat repo
   - See if it can see files, docs, etc.

## Troubleshooting

### "I don't see GitHub in Claude Settings"

**Possible reasons:**
- Your Claude plan doesn't include GitHub integration
- The feature isn't available in your region
- You need to update your Claude app
- You're using a limited version of Claude

**Solutions:**
- Update the Claude app to the latest version
- Check Claude's pricing/plan features
- Contact Claude support: https://support.anthropic.com
- Try using Claude via API instead

### "GitHub authorization page doesn't show private repo option"

**This means:**
- The OAuth app might not be configured to request private repos
- You might be on a basic GitHub authorization flow

**Solutions:**
- Continue with the authorization anyway
- After authorizing, go to GitHub Settings → Authorized Apps
- Click on Claude app → Check if you can add private repo access there
- If not, revoke and try again
- Contact Claude support if this doesn't work

### "I authorized but Claude still can't see my repo"

**Check these:**
1. Wait a few minutes for the connection to sync
2. Try asking Claude again
3. In GitHub, verify Claude has "Access private repositories"
4. Try disconnecting and reconnecting
5. Make sure you're using the right GitHub account

## Alternative: Make Repository Public Temporarily

If OAuth setup continues to fail:

1. **Temporarily make public:**
   - Go to: https://github.com/zganich/interpwhat/settings
   - Scroll to **Danger Zone**
   - Click **"Change visibility"** → **"Make public"**

2. **Have Claude access it**

3. **Immediately make private again:**
   - Go back to Settings → Danger Zone
   - Click **"Change visibility"** → **"Make private"**

⚠️ **Security Note:** Public repos are visible to everyone for the time they're public. Don't leave sensitive data in your repo if making it public.

## Your Repository Details

For reference when connecting:

- **Repository URL:** https://github.com/zganich/interpwhat
- **Owner:** zganich
- **Repository Name:** interpwhat
- **Visibility:** Private
- **Permissions Needed:** Read access to private repositories
- **Current Status:** All files pushed, 30 commits, 254 files

## Summary Checklist

- [ ] Open Claude app or website
- [ ] Go to Settings → Connectors or Integrations
- [ ] Find GitHub in the list
- [ ] Click "Connect"
- [ ] ⚠️ **IMPORTANT:** On GitHub auth page, **CHECK "Access private repositories"**
- [ ] Click "Authorize" on GitHub
- [ ] Return to Claude and verify "Connected"
- [ ] Verify in GitHub Authorized Apps
- [ ] Test by asking Claude to read your repo

## Next Steps After Connecting

Once Claude can access your repository:

1. **Try asking:**
   - "What's in my InterpWhat documentation folder?"
   - "What deployment guides do I have?"
   - "Show me my Vercel configuration"

2. **Claude will be able to:**
   - Read your code
   - Analyze your architecture
   - Help with development
   - Review documentation
   - Assist with debugging

## Still Need Help?

- **Claude Support:** https://support.anthropic.com
- **Claude Documentation:** Check Claude's help/docs
- **GitHub OAuth Docs:** https://docs.github.com/en/developers/apps/managing-oauth-apps

---

**Current Status:** Awaiting GitHub authorization connection  
**Action Needed:** Connect Claude to GitHub with private repo permissions  
**Repository:** Ready and fully pushed, just needs authorization  

*Last updated: November 1, 2025*

