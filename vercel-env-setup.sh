#!/bin/bash
# Script to add missing Vercel environment variables
# Run each command and enter the value when prompted

echo "Adding required Vercel environment variables..."
echo "You'll be prompted to enter each value."
echo ""

# Required variables - add these one by one
vercel env add VITE_APP_ID production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add OAUTH_SERVER_URL production
vercel env add OAUTH_CLIENT_ID production
vercel env add OAUTH_CLIENT_SECRET production
vercel env add OWNER_OPEN_ID production
vercel env add BUILT_IN_FORGE_API_URL production
vercel env add BUILT_IN_FORGE_API_KEY production

# Optional - Stripe (if using payments)
echo ""
read -p "Do you want to add Stripe keys? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env add STRIPE_SECRET_KEY production
    vercel env add STRIPE_PUBLISHABLE_KEY production
fi

echo ""
echo "✅ Environment variables added!"
echo "Run 'vercel env ls' to verify all variables are set."
echo ""
echo "Next step: Run 'vercel --prod' to deploy!"

