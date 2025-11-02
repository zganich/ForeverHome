#!/bin/bash
# Script to help export environment variables from Railway to Vercel

echo "🔄 Railway to Vercel Environment Variables Migration"
echo "===================================================="
echo ""
echo "This script will help you copy environment variables from Railway to Vercel."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI not installed."
    echo ""
    echo "To install Railway CLI:"
    echo "  npm i -g @railway/cli"
    echo ""
    echo "Then login:"
    echo "  railway login"
    echo ""
    echo "After that, run this script again."
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "⚠️  Not logged into Railway. Please run:"
    echo "  railway login"
    exit 1
fi

echo "✅ Logged into Railway"
echo ""
echo "Fetching environment variables from Railway..."
echo ""

# This would need Railway CLI commands - showing structure
echo "To export from Railway:"
echo "1. railway variables - Lists all variables"
echo "2. Then we can add them to Vercel"
echo ""

echo "Would you like to proceed? (This will list your Railway variables)"
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    railway variables
    echo ""
    echo "You can now manually add these to Vercel, or we can automate it."
else
    echo "Cancelled."
fi

