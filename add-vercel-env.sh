#!/bin/bash

# Script to add missing Vercel environment variables interactively
# This will prompt you for each value and add it to Vercel

echo "🚀 Vercel Environment Variables Setup"
echo "===================================="
echo ""
echo "This script will prompt you to enter values for required environment variables."
echo "Press Ctrl+C at any time to cancel."
echo ""
echo "Note: Your input will be hidden for sensitive values (passwords, keys, etc.)"
echo ""

# Array of required environment variables
declare -a REQUIRED_VARS=(
    "VITE_APP_ID"
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "OAUTH_SERVER_URL"
    "OAUTH_CLIENT_ID"
    "OAUTH_CLIENT_SECRET"
    "OWNER_OPEN_ID"
    "BUILT_IN_FORGE_API_URL"
    "BUILT_IN_FORGE_API_KEY"
)

# Array of optional environment variables
declare -a OPTIONAL_VARS=(
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
)

# Function to add environment variable
add_env_var() {
    local var_name=$1
    local is_sensitive=$2
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 Adding: $var_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$is_sensitive" = "true" ]; then
        echo -n "Enter value (input will be hidden): "
        read -s value
        echo ""
    else
        echo -n "Enter value: "
        read value
    fi
    
    if [ -z "$value" ]; then
        echo "⚠️  Skipping $var_name (empty value)"
        return
    fi
    
    # Add to all environments (production, preview, development)
    echo "$value" | vercel env add "$var_name" production 2>&1 | grep -q "Added" && echo "✅ Added $var_name to Production"
    echo "$value" | vercel env add "$var_name" preview 2>&1 | grep -q "Added" && echo "✅ Added $var_name to Preview"
    echo "$value" | vercel env add "$var_name" development 2>&1 | grep -q "Added" && echo "✅ Added $var_name to Development"
    
    echo "✅ $var_name configured for all environments!"
}

# Add required variables
echo "📋 REQUIRED VARIABLES"
echo "--------------------"
for var in "${REQUIRED_VARS[@]}"; do
    # Determine if variable is sensitive (contains SECRET, KEY, or TOKEN)
    if [[ "$var" =~ (SECRET|KEY|TOKEN|PASSWORD) ]]; then
        add_env_var "$var" "true"
    else
        add_env_var "$var" "false"
    fi
done

# Ask about optional variables
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💳 OPTIONAL: Stripe Payment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Do you want to add Stripe keys? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    for var in "${OPTIONAL_VARS[@]}"; do
        add_env_var "$var" "true"
    done
else
    echo "⏭️  Skipping Stripe variables"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To verify all variables, run:"
echo "  vercel env ls"
echo ""
echo "To deploy, run:"
echo "  vercel --prod"
echo ""

