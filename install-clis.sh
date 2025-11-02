#!/bin/bash
# Install Railway and Supabase CLIs to help get environment variables

echo "📦 Installing CLI Tools"
echo "====================="
echo ""

# Install Railway CLI
echo "Installing Railway CLI..."
npm install -g @railway/cli

if [ $? -eq 0 ]; then
    echo "✅ Railway CLI installed"
else
    echo "❌ Failed to install Railway CLI"
fi

echo ""

# Install Supabase CLI
echo "Installing Supabase CLI..."
npm install -g supabase

if [ $? -eq 0 ]; then
    echo "✅ Supabase CLI installed"
else
    echo "❌ Failed to install Supabase CLI"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Railway: railway login"
echo "2. Supabase: supabase login"
echo ""
echo "Then we can pull your environment variables!"

