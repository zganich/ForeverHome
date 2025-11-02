#!/bin/bash

# InterpWhat - Auto Update & Show Next Tasks
# This script shows recent changes and highlights next tasks automatically

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${CYAN}🔄 Auto-Update: Showing Latest Changes & Next Tasks${NC}"
echo ""

# Run the status script
bash scripts/show-status.sh

echo ""
echo -e "${BOLD}${YELLOW}💡 Tip: Run 'pnpm status' or 'pnpm next' anytime to see this!${NC}"
echo ""

