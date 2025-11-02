#!/bin/bash
# Helper script to export Railway variables
# This needs to be run in an interactive terminal

RAILWAY_CMD="node /usr/local/lib/node_modules/@railway/cli/bin/railway.js"

echo "🚂 Railway Environment Variables Export"
echo "========================================"
echo ""
echo "This script will help you export Railway variables."
echo ""
echo "First, let's link to your Railway project:"
echo ""

# Try to link
$RAILWAY_CMD link

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Linked to Railway project"
    echo ""
    echo "Fetching variables..."
    $RAILWAY_CMD variables
    echo ""
    echo "Variables exported above. You can now copy them to Vercel."
else
    echo "Failed to link. You may need to run this interactively."
fi

