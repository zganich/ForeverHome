#!/bin/bash
# Script to pull environment variables from Railway and add to Vercel

echo "🔄 Pulling Environment Variables from Railway"
echo "============================================"
echo ""

# Use node to run railway since there's a permission issue
RAILWAY_CMD="node /usr/local/lib/node_modules/@railway/cli/bin/railway.js"

# Check if logged in
echo "Checking Railway login status..."
if ! $RAILWAY_CMD whoami &> /dev/null; then
    echo ""
    echo "⚠️  Please log in to Railway first:"
    echo "   node /usr/local/lib/node_modules/@railway/cli/bin/railway.js login"
    echo ""
    exit 1
fi

echo "✅ Logged into Railway"
echo ""

# List projects and let user select
echo "Fetching Railway projects..."
$RAILWAY_CMD list

echo ""
echo "Please enter your project name or ID:"
read -r PROJECT_INPUT

# Get environment variables from Railway
echo ""
echo "Fetching environment variables from Railway..."
$RAILWAY_CMD variables --service "$PROJECT_INPUT" > /tmp/railway_vars.txt 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Variables fetched from Railway"
    echo ""
    echo "Variables found:"
    cat /tmp/railway_vars.txt
    echo ""
    
    # Now add to Vercel
    echo "Would you like to add these to Vercel? (y/n)"
    read -r ADD_TO_VERCEL
    
    if [[ "$ADD_TO_VERCEL" =~ ^[Yy]$ ]]; then
        echo ""
        echo "Adding variables to Vercel..."
        # This would need to parse and add each variable
        # For now, showing what we got
        echo "See /tmp/railway_vars.txt for the variables"
    fi
else
    echo "❌ Failed to fetch variables. Try running manually:"
    echo "   $RAILWAY_CMD variables"
fi

