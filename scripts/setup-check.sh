#!/bin/bash

# InterpWhat Setup Verification Script
# Checks integration status and environment configuration

echo "🔍 InterpWhat Setup Verification"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_GOOD=true

# Function to check if variable is set
check_env_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name: NOT SET${NC}"
        ALL_GOOD=false
    else
        # Mask sensitive values (show first 10 chars only)
        local masked_value="${var_value:0:10}..."
        echo -e "${GREEN}✅ $var_name: SET${NC} (${masked_value})"
    fi
}

# Check GitHub connection
echo "📦 GitHub Integration"
echo "-------------------"
if git remote -v 2>/dev/null | grep -q "github.com"; then
    REMOTE_URL=$(git remote get-url origin 2>/dev/null)
    echo -e "${GREEN}✅ GitHub: Connected${NC}"
    echo "   Remote: $REMOTE_URL"
else
    echo -e "${RED}❌ GitHub: Not connected${NC}"
    ALL_GOOD=false
fi
echo ""

# Check Supabase (Frontend)
echo "🔐 Supabase Integration (Frontend)"
echo "-----------------------------------"
check_env_var "VITE_SUPABASE_URL"
check_env_var "VITE_SUPABASE_ANON_KEY"
echo ""

# Check Database
echo "🗄️  Database Configuration"
echo "-------------------------"
check_env_var "DATABASE_URL"
if [ ! -z "$DATABASE_URL" ]; then
    # Check if it's a valid connection string
    if [[ "$DATABASE_URL" == postgres* ]] || [[ "$DATABASE_URL" == postgresql* ]]; then
        echo -e "${GREEN}✅ Database: PostgreSQL connection string detected${NC}"
    elif [[ "$DATABASE_URL" == mysql* ]]; then
        echo -e "${YELLOW}⚠️  Database: MySQL connection string detected (Note: Project uses PostgreSQL)${NC}"
    else
        echo -e "${YELLOW}⚠️  Database: Unknown connection string format${NC}"
    fi
fi
echo ""

# Check Server Environment Variables
echo "🖥️  Server Environment Variables"
echo "-------------------------------"
check_env_var "JWT_SECRET"
check_env_var "VITE_APP_ID"
check_env_var "OAUTH_SERVER_URL"
check_env_var "OAUTH_CLIENT_ID"
check_env_var "OAUTH_CLIENT_SECRET"
echo ""

# Check OpenAI
echo "🤖 OpenAI Configuration"
echo "----------------------"
check_env_var "OPENAI_API_KEY"
echo ""

# Check Storage (Forge API)
echo "💾 Storage Configuration (Forge API)"
echo "-----------------------------------"
check_env_var "BUILT_IN_FORGE_API_URL"
check_env_var "BUILT_IN_FORGE_API_KEY"
echo ""

# Check Stripe (Optional)
echo "💳 Stripe Configuration (Optional)"
echo "----------------------------------"
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${YELLOW}⚠️  STRIPE_SECRET_KEY: Not set (optional)${NC}"
else
    echo -e "${GREEN}✅ STRIPE_SECRET_KEY: SET${NC}"
fi

if [ -z "$STRIPE_PUBLISHABLE_KEY" ]; then
    echo -e "${YELLOW}⚠️  STRIPE_PUBLISHABLE_KEY: Not set (optional)${NC}"
else
    echo -e "${GREEN}✅ STRIPE_PUBLISHABLE_KEY: SET${NC}"
fi
echo ""

# Check Node.js and pnpm
echo "⚙️  Development Environment"
echo "-------------------------"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js: Not installed${NC}"
    ALL_GOOD=false
fi

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✅ pnpm: $PNPM_VERSION${NC}"
else
    echo -e "${RED}❌ pnpm: Not installed${NC}"
    ALL_GOOD=false
fi
echo ""

# Check .env file
echo "📄 Environment File"
echo "------------------"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "   Create one from .env.example if needed"
fi

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example file exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env.example file not found${NC}"
fi
echo ""

# Summary
echo "================================"
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo ""
    echo "You're ready to start development."
    echo "Run 'pnpm dev' to start the development server."
else
    echo -e "${RED}❌ Some checks failed${NC}"
    echo ""
    echo "Please fix the issues above before continuing."
    echo "See docs/integrations/GITHUB-SUPABASE-RAILWAY.md for setup help."
fi
echo ""

