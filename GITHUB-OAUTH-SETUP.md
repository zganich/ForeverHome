# Set Up Claude's GitHub Access Through GitHub Settings

## The Issue

Claude's UI shows "Connected" but doesn't let you configure permissions directly. You need to manage this from GitHub's side.

## Solution: Configure in GitHub

### Step 1: Go to GitHub Authorized Apps

Visit this URL directly:
```
https://github.com/settings/applications
```

Or navigate manually:
1. Go to GitHub.com
2. Click your profile photo → **Settings**
3. In the left sidebar, scroll to **Integrations**
4. Click **Applications** → **Authorized OAuth Apps**

### Step 2: Find Claude

Look for either:
- "Claude" 
- "Anthropic Claude"
- Any app that might be Claude-related

### Step 3: Check/Adjust Permissions

If you see Claude:
1. Click on it to view details
2. Check what permissions are currently granted
3. Look for:
   - ✅ "Access private repositories" 
   - ✅ "Read access to private repositories"
   - ✅ Something similar

If **private repos are NOT checked:**
- You can't adjust this from the settings page directly
- You need to **revoke** and **re-connect**

### Step 4: Revoke and Reconnect (If Needed)

If private repositories aren't enabled:

1. **In GitHub (Authorized Apps page):**
   - Find "Claude"
   - Click **"Revoke"** or **"Remove"**

2. **In Claude App:**
   - Go to Settings → Connectors
   - Click **"Disconnect"** next to GitHub
   - Click **"Connect"** again

3. **During Reconnection:**
   - GitHub will show an authorization screen
   - **IMPORTANT:** Carefully review the permissions it's requesting
   - Look for and **CHECK** any box about private repositories
   - Then click "Authorize"

## If You Can't Find Claude in Authorized Apps

This means the connection wasn't properly established. Try:

1. In Claude: Disconnect GitHub
2. Clear your browser cache (for GitHub)
3. In Claude: Connect GitHub again
4. Make sure you complete the full GitHub authorization flow
5. Check GitHub Authorized Apps again

## Alternative: Make Repo Temporarily Public

If OAuth setup is frustrating, you can temporarily:

```bash
# This is safe if you want Claude to see it once
```

1. Go to your repo: https://github.com/zganich/interpwhat
2. Click **Settings** tab
3. Scroll to bottom → **Danger Zone**
4. Click **"Change visibility"**
5. Select **"Make public"**
6. Let Claude access it
7. **Immediately change it back to private**

⚠️ **Warning:** Public repos are visible to everyone. Only do this briefly.

## Checking if It Worked

After reconnecting with proper permissions:

1. **In GitHub:**
   - Go to Authorized Apps
   - Verify "Claude" shows "private repositories" permission

2. **Test in Claude:**
   - Ask Claude: "Can you see my InterpWhat repository on GitHub?"
   - Or: "What's in the docs/ folder of my InterpWhat repo?"
   - If Claude can read it, you're good!

## Your Repository Info

- **URL:** https://github.com/zganich/interpwhat
- **Status:** Private
- **What you need:** "Access private repositories" permission
- **Where to set:** GitHub Settings → Applications → Authorized OAuth Apps

## Quick Command to Check Current Auth

You can also verify your current GitHub OAuth apps via command line:

```bash
# Install GitHub CLI if needed
brew install gh

# Authenticate
gh auth login

# Check authorized apps (requires auth)
gh api user/authorizations
```

## Summary Checklist

- [ ] Go to: https://github.com/settings/applications
- [ ] Find "Claude" in Authorized OAuth Apps
- [ ] Check if it has "private repositories" permission
- [ ] If NO: Revoke in GitHub, disconnect in Claude, reconnect with proper permissions
- [ ] If YES: Test by asking Claude to read your repo
- [ ] Alternative: Temporarily make repo public, let Claude see it, make private again

## Still Having Issues?

If this still doesn't work:

1. **Check Claude's documentation** for GitHub integration
2. **Contact Claude support** about GitHub connector issues
3. **Contact Anthropic** if you have a specific plan/feature question
4. **Consider using Claude via API** instead of the app for more control

---

*Last updated: November 1, 2025*

