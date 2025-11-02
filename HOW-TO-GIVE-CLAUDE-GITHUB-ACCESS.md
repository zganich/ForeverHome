# How to Give Claude Access to Your Private GitHub Repository

## Quick Answer

Claude can access your private repositories if you connect your GitHub account through Claude's settings. Here's how:

## Detailed Instructions

### Method 1: Through Claude Website/App

1. **Go to Claude Settings**
   - Open the Claude app or website
   - Click on your profile/settings icon
   - Navigate to "Settings" or "Account Settings"

2. **Find GitHub Integration**
   - Look for "Integrations" or "Connected Accounts"
   - Find "GitHub" in the list
   - Click "Connect" or "Authorize"

3. **Authorize Access**
   - You'll be redirected to GitHub
   - Sign in to GitHub if needed
   - GitHub will ask what permissions Claude needs
   - Select: **"Read access to private repositories"**
   - Click "Authorize"

4. **Verify**
   - You should be redirected back to Claude
   - GitHub should show as "Connected"
   - Claude should now be able to access your private repos

### Method 2: Through GitHub Directly

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/connections/applications
   - Or: GitHub Settings → Applications → Authorized OAuth Apps

2. **Find Claude**
   - Look for "Claude" or "Anthropic Claude" in the list
   - If it's not there, the integration hasn't been set up yet
   - Use Method 1 above to create the connection

3. **Configure Permissions**
   - Click on "Claude" app
   - Click "Manage access"
   - Make sure private repositories are enabled

### What Claude Can Access

Once connected, Claude will be able to:
- ✅ Read your private repository code
- ✅ Browse file structure
- ✅ Read documentation
- ✅ Analyze codebase
- ✅ Help with development tasks

**Important:** Claude can only **read** your repositories - it cannot:
- ❌ Push changes to your repos
- ❌ Modify code directly
- ❌ Delete files or branches
- ❌ Create or merge pull requests

## Troubleshooting

### "I don't see GitHub in my Claude settings"
- Try logging out and back into Claude
- Update the Claude app if using the desktop version
- Check if your Claude plan includes GitHub integration
- Contact Claude support if the option is missing

### "GitHub shows Claude as connected but Claude still can't see my repo"
- Make sure "Private repositories" permission is granted
- Try disconnecting and reconnecting GitHub
- Check if the repository is actually private (Settings → Danger Zone)
- Verify you have access to the repository on GitHub

### "I want to revoke access later"
1. Go to: https://github.com/settings/connections/applications
2. Find "Claude" in the list
3. Click "Revoke access" or "Remove"

## Alternative: Temporary Public Access

If you don't want to connect GitHub to Claude permanently, you can temporarily:

1. **Make repository public** (Settings → Danger Zone → Change visibility)
2. Let Claude access and analyze it
3. **Make it private again** when done

⚠️ **Warning:** Making your repo public exposes it to everyone on GitHub. Only do this if you're comfortable with that.

## Recommended Approach

**Best practice:** Connect Claude to GitHub through OAuth. This gives you:
- ✅ Secure, controlled access
- ✅ Can revoke anytime
- ✅ No need to make repos public
- ✅ Works for all your private repos
- ✅ Same access you'd give any GitHub integration

## Your Specific Repository

For your InterpWhat repository:
- **URL:** https://github.com/zganich/interpwhat
- **Status:** Private
- **What Claude needs:** Read access to private repositories
- **After connection:** Claude can browse, read, and analyze your code

## Summary

**The key steps:**
1. Open Claude settings
2. Find GitHub integration
3. Click "Connect" or "Authorize"
4. Grant "private repositories" permission
5. Done! Claude can now access your repo

Your InterpWhat repository is already fully pushed and working - Claude just needs permission to read it because it's private.

---

*Last updated: November 1, 2025*

