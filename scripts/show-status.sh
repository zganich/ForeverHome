#!/bin/bash

# InterpWhat Status & Next Tasks Script
# Shows latest changes, modified files, and next tasks

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}  InterpWhat - Project Status & Next Tasks${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get current branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo -e "${BOLD}📍 Current Branch:${NC} ${GREEN}${BRANCH}${NC}"
echo ""

# Git Status
echo -e "${BOLD}${BLUE}📊 Git Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if git repo
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
else
    # Modified files
    MODIFIED=$(git diff --name-only 2>/dev/null)
    STAGED=$(git diff --cached --name-only 2>/dev/null)
    UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null)
    
    if [ -z "$MODIFIED" ] && [ -z "$STAGED" ] && [ -z "$UNTRACKED" ]; then
        echo -e "${GREEN}✅ Working directory is clean${NC}"
    else
        # Show modified files
        if [ ! -z "$MODIFIED" ]; then
            echo -e "${YELLOW}📝 Modified Files (not staged):${NC}"
            echo "$MODIFIED" | while read file; do
                echo -e "   ${YELLOW}✏️  ${file}${NC}"
            done
            echo ""
        fi
        
        # Show staged files
        if [ ! -z "$STAGED" ]; then
            echo -e "${GREEN}✅ Staged Files:${NC}"
            echo "$STAGED" | while read file; do
                echo -e "   ${GREEN}✓  ${file}${NC}"
            done
            echo ""
        fi
        
        # Show untracked files
        if [ ! -z "$UNTRACKED" ]; then
            echo -e "${CYAN}🆕 Untracked Files:${NC}"
            echo "$UNTRACKED" | while read file; do
                echo -e "   ${CYAN}+  ${file}${NC}"
            done
            echo ""
        fi
    fi
    
    # Recent commits
    echo -e "${BOLD}Recent Commits:${NC}"
    git log --oneline -5 --decorate --color=always 2>/dev/null | head -5
    echo ""
fi

echo ""

# Recent File Changes (last 24 hours)
echo -e "${BOLD}${MAGENTA}🕐 Recently Modified Files (Last 24 Hours)${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

find . -type f \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./dist/*" \
    -not -path "./.next/*" \
    -not -name "*.log" \
    -mtime -1 \
    -exec ls -lh {} \; 2>/dev/null | \
    awk '{print $9, "(" $5 ")"}' | \
    while read file size; do
        if [ ! -z "$file" ]; then
            echo -e "   ${MAGENTA}🕐 ${file} ${size}${NC}"
        fi
    done | head -10

if [ -z "$(find . -type f -mtime -1 -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)" ]; then
    echo -e "   ${YELLOW}No files modified in last 24 hours${NC}"
fi

echo ""

# TODO Items
echo -e "${BOLD}${RED}📋 TODO Items in Codebase${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Search for TODO comments
TODOS=$(grep -r "TODO\|FIXME\|XXX\|HACK" \
    --include="*.ts" \
    --include="*.tsx" \
    --include="*.js" \
    --include="*.jsx" \
    --include="*.md" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=dist \
    . 2>/dev/null | \
    head -20)

if [ ! -z "$TODOS" ]; then
    echo "$TODOS" | while IFS=: read file line content; do
        file=$(echo "$file" | sed 's|^\./||')
        content=$(echo "$content" | sed 's/.*TODO/TODO/' | sed 's/.*FIXME/FIXME/' | sed 's/.*XXX/XXX/' | sed 's/.*HACK/HACK/')
        echo -e "   ${RED}⚠️  ${file}:${line}${NC}"
        echo -e "      ${content}"
        echo ""
    done
else
    echo -e "   ${GREEN}✅ No TODO items found${NC}"
fi

echo ""

# Next Tasks from Documentation
echo -e "${BOLD}${CYAN}📋 Next Tasks (from CURRENT-STATUS.md)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "docs/CURRENT-STATUS.md" ]; then
    # Extract "What's Next" or "Next Steps" sections
    awk '/## 🚀 What'"'"'s Next|## 🚀 Next Steps|### Immediate Priorities|### Short-Term|### Medium-Term|### Long-Term/,/^## |^---$|^$/' docs/CURRENT-STATUS.md | \
        grep -E "^- \[ \]|^- |^[0-9]+\.|###" | \
        head -15 | \
        sed 's/^- \[ \]/   📌 /' | \
        sed 's/^- /   • /' | \
        sed 's/^[0-9]\+\./   /' | \
        sed 's/^### /   📅 /'
    
    if [ -z "$(awk '/## 🚀 What'"'"'s Next|## 🚀 Next Steps|### Immediate Priorities/,/^## |^---$|^$/' docs/CURRENT-STATUS.md | grep -E "^- \[ \]|^- |^[0-9]+\.")" ]; then
        echo -e "   ${YELLOW}No next tasks found in CURRENT-STATUS.md${NC}"
    fi
else
    echo -e "   ${YELLOW}docs/CURRENT-STATUS.md not found${NC}"
fi

echo ""

# Build Status
echo -e "${BOLD}${BLUE}🔨 Build Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "dist" ]; then
    echo -e "   ${GREEN}✅ dist/ directory exists${NC}"
else
    echo -e "   ${YELLOW}⚠️  dist/ directory not found (run 'pnpm build')${NC}"
fi

if [ -f "package.json" ]; then
    echo -e "   ${GREEN}✅ package.json exists${NC}"
fi

if [ -f "node_modules" ] || [ -d "node_modules" ]; then
    echo -e "   ${GREEN}✅ node_modules exists${NC}"
else
    echo -e "   ${YELLOW}⚠️  node_modules not found (run 'pnpm install')${NC}"
fi

echo ""

# Quick Stats
echo -e "${BOLD}${GREEN}📈 Quick Stats${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Count files
TS_FILES=$(find . -name "*.ts" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" 2>/dev/null | wc -l | tr -d ' ')
TSX_FILES=$(find . -name "*.tsx" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" 2>/dev/null | wc -l | tr -d ' ')
MD_FILES=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" 2>/dev/null | wc -l | tr -d ' ')

echo -e "   📄 TypeScript files: ${CYAN}${TS_FILES}${NC}"
echo -e "   ⚛️  React components: ${CYAN}${TSX_FILES}${NC}"
echo -e "   📝 Documentation files: ${CYAN}${MD_FILES}${NC}"

echo ""

# Quick Actions
echo -e "${BOLD}${YELLOW}⚡ Quick Actions${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "   ${CYAN}Run these commands:${NC}"
echo ""
echo -e "   ${GREEN}bash scripts/setup-check.sh${NC}        # Verify environment setup"
echo -e "   ${GREEN}git status${NC}                         # Detailed git status"
echo -e "   ${GREEN}git diff${NC}                           # View all changes"
echo -e "   ${GREEN}pnpm check${NC}                         # TypeScript type checking"
echo -e "   ${GREEN}pnpm build${NC}                         # Build project"
echo ""

echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}  Status check complete!${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

