# Cursor Startup Checklist - New Chat Session

**Use this checklist at the start of EVERY new chat session to get up to speed quickly.**

---

## 📋 Mandatory First Steps

### 1. Read Core Documentation (5 minutes)
- [ ] **README.md** - Project overview, tech stack, setup instructions
- [ ] **docs/CURRENT-STATUS.md** - Current features, status, and priorities
- [ ] **docs/README.md** - Documentation index and structure
- [ ] **.cursorrules** - LLM context and development guidelines

### 2. Check Integration Status
- [ ] **GitHub**: Verify connection with `git remote -v` (should show `https://github.com/zganich/interpwhat.git`)
- [ ] **Supabase**: Check if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- [ ] **Database**: Verify `DATABASE_URL` is configured
- [ ] **Deployment**: Check current platform (Manus/Vercel) - see `docs/integrations/GITHUB-SUPABASE-RAILWAY.md`

### 3. Verify Environment Setup
Run the setup verification script:
```bash
bash scripts/setup-check.sh
```

---

## 🎯 Quick Context Refresh

### What is InterpWhat?
AI-powered pet behavior analysis platform that:
- Analyzes pet photos/videos with GPT-4 Vision
- Provides personality-driven "Pet Voice" interpretations
- Tracks pet history with Timeline feature
- Manages care reminders and multi-pet comparisons

### Current Tech Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Wouter
- **Backend**: Node.js 22 + Express + tRPC
- **Database**: PostgreSQL (Drizzle ORM) ✅ Verified
- **Auth**: Supabase (client-side) ✅ Verified
- **AI**: OpenAI GPT-4 Vision + TTS
- **Storage**: Built-in Forge API (Manus platform) ✅ Verified
- **Payments**: Stripe
- **Deployment**: Manus Platform (primary), Vercel (configured)

### Key Directories
```
client/src/          # Frontend React app
server/              # Backend Express app
  _core/            # Core server utilities
  routers.ts        # tRPC API routes
drizzle/            # Database schema
docs/               # All documentation
```

---

## 📚 Essential Documentation Reference

### Product & Strategy
- `docs/CURRENT-STATUS.md` - **Single source of truth** for current state
- `docs/product/InterpWhat-PRD-v2-Final.md` - Complete product requirements
- `docs/product/interpwhat-financial-analysis.md` - Revenue model

### Technical
- `docs/technical/interpwhat-architecture.md` - System architecture
- `docs/technical/interpwhat-ai-architecture.md` - AI agent swarm design

### Integration Setup
- `docs/integrations/GITHUB-SUPABASE-RAILWAY.md` - All integration details

### Best Practices
- `docs/BEST-PRACTICES.md` - Development guidelines and standards

---

## 🔧 Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm check            # TypeScript type checking

# Status & Next Tasks
pnpm status           # Show project status, changes, and next tasks
pnpm next             # Alias for status command

# Database
pnpm db:push          # Push schema changes to database

# Environment
cp .env.example .env  # Create .env from template
bash scripts/setup-check.sh  # Verify setup
```

---

## 🚨 Critical Reminders - READ FIRST

1. **Context Management - PREVENTS HALLUCINATIONS** (MOST CRITICAL)
   - **⚠️ 50% CONTEXT USAGE = MANDATORY STOP AND NEW CHAT**
   - **Why**: Exceeding 50% causes hallucinations, incorrect code, and false memories
   - **Check context usage regularly** (shown in Cursor UI - usually top-right)
   - **At 40%**: ⚠️ Warning - Prepare to wrap up, DO NOT start new features
   - **At 50%**: 🚨 STOP IMMEDIATELY - Complete current work, commit, push, start new chat
   - **NEVER continue past 50%** - This WILL cause hallucinations and errors
   - Reference files by path when possible instead of reading full contents
   - See `docs/CONTEXT-MANAGEMENT.md` for complete reset checklist
   - **If you see context > 50%, immediately stop and start a new chat**

2. **Version Control** (CRITICAL)
   - **ALWAYS commit and push to GitHub** after completing any task or feature
   - Use descriptive commit messages (e.g., "feat: Add photo validation")
   - Push to `main` branch (Vercel auto-deploys from GitHub)
   - Never end a session with uncommitted work
   - See `.cursorrules` for complete workflow guidelines

3. **Documentation First**
   - Check `docs/` folder before asking questions
   - Review existing implementations before coding
   - Update documentation after making changes
   - **Commit documentation updates to GitHub**

4. **Integration Status**
   - GitHub: ✅ Connected
   - Supabase: Check environment variables
   - Vercel: Primary deployment platform (auto-deploys from GitHub)
   - Database: Uses `DATABASE_URL` env var

5. **Code Patterns**
   - Use tRPC for all API calls
   - Authentication via `SupabaseAuthContext`
   - Database queries via Drizzle ORM in `server/db.ts`
   - File uploads via `server/upload.ts`

---

## 🎯 Current Priorities

Check `docs/CURRENT-STATUS.md` for the most up-to-date priorities. Generally:
- Feature development and improvements
- Bug fixes and optimizations
- Documentation updates
- Integration maintenance

---

## ❓ Need Help?

1. **Check Documentation**: Most answers are in `docs/`
2. **Review Code**: Check similar existing implementations
3. **Integration Issues**: See `docs/integrations/GITHUB-SUPABASE-RAILWAY.md`
4. **Best Practices**: See `docs/BEST-PRACTICES.md`

---

## ✅ Ready to Work

After completing this checklist, you should have:
- ✅ Understanding of project structure and tech stack
- ✅ Knowledge of current status and priorities
- ✅ Access to all key documentation
- ✅ Verified integration status
- ✅ Context for efficient development

**Let's build something great! 🐾**

