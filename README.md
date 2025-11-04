# InterpWhat 🐾

**AI-powered pet parenting platform** - Understand your pet's behavior, track their care, and make better decisions.

*Built with ❤️ by Chantell and the guy with the mumbling drawl...and in memory of Paisley*

---

## 🎯 What is InterpWhat?

InterpWhat is the all-in-one platform for pet parents that combines:
- **Pet Voice™ Analysis** - AI interprets pet behavior from photos/videos
- **AI Breed Identification** - Identify breeds from photos
- **Care Reminders** - Never miss medication, vet visits, or grooming
- **Multi-Pet Comparison** - Compare behaviors across multiple pets
- **Pet Timeline™** - Track your pet's history and milestones

---

## 🚀 Features

### Core Features
- ✅ Pet behavior analysis using AI (Phase 1 optimized - 42% cost reduction)
- ✅ Pet profile management (unlimited pets)
- ✅ Photo/video upload and analysis
- ✅ AI-powered insights and recommendations
- ✅ Pet Timeline™ - track milestones and history
- ✅ Quick mode for 5-8 second analysis
- ✅ Progress tracking and streaming support (Phase 2 ready)

### Premium Features
- ✅ AI Breed Identification
- ✅ Care Reminders (medication, vet, grooming)
- ✅ Multi-Pet Comparison
- ✅ Advanced behavioral insights
- ✅ Priority support (24-hour response)
- ✅ Export reports (PDF)

---

## 💰 Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Essential** | $9.99/mo | 3 pets, 10 analyses/mo, basic features |
| **Premium** | $19.99/mo | Unlimited pets, 30 analyses/mo, all features |
| **Rescue Adopter** | $14.99/mo | All Premium + lifetime discount for rescue pet adopters |
| **Shelter Org** | $33/mo | Organizational account + 10% revenue share |

---

## 🛠️ Tech Stack

**Frontend:**
- React 19.2.0 + TypeScript
- Wouter (routing)
- TanStack Query
- Tailwind CSS + shadcn/ui

**Backend:**
- Node.js 22.13.0 + Express
- tRPC (type-safe API)
- Drizzle ORM + PostgreSQL

**AI & Services:**
- OpenAI GPT-4 Vision (behavior analysis)
- OpenAI TTS (voice generation)
- AWS S3 (file storage)
- Stripe (payments)

---

## 📦 Installation

### Prerequisites
- Node.js 22.13.0+
- pnpm
- PostgreSQL database

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/zganich/interpwhat.git
cd interpwhat
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
# See .env.example for all required variables
# See docs/integrations/GITHUB-SUPABASE-RAILWAY.md for setup help
```

4. **Verify setup** (optional but recommended)
```bash
bash scripts/setup-check.sh
```

5. **Run database migrations**
```bash
pnpm db:push
```

6. **Start development server**
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

**Note:** Make sure all environment variables are set. Run `bash scripts/setup-check.sh` to verify your setup.

---

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and subscriptions
- `pets` - Pet profiles
- `analyses` - Behavior analysis results
- `reminders` - Care reminders

### Partner Tables
- `shelter_partners` - Shelter organizations
- `adoption_verifications` - Adoption paperwork verification

### Marketing Tables
- `email_campaigns` - Email marketing campaigns
- `email_recipients` - Individual email tracking
- `analytics_events` - Event tracking

---

## 📁 Project Structure

```
interpwhat/
├── client/              # Frontend (React)
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable components
│       └── App.tsx      # Main app + routing
│
├── server/              # Backend (Express)
│   ├── _core/           # Server core
│   ├── routers.ts       # tRPC API routes
│   ├── routes/          # Express routes
│   ├── aiAgents.ts      # AI analysis logic
│   └── db.ts            # Database queries
│
└── drizzle/             # Database
    └── schema.ts        # Database schema
```

---

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=interpwhat-uploads

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# OAuth (Manus)
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
```

---

## 🚀 Deployment

### Vercel Deployment (Primary)

InterpWhat is configured for deployment on **Vercel**. See **[docs/VERCEL-DEPLOYMENT.md](./docs/VERCEL-DEPLOYMENT.md)** for complete deployment guide.

**Quick Start:**
1. Connect repository to Vercel
2. Configure environment variables (see deployment guide)
3. Deploy automatically from GitHub

**Key Configuration:**
- **Build Command:** `pnpm install && pnpm build`
- **Output Directory:** `dist/public`
- **API Function:** `api/index.ts` (60s timeout for AI analysis)

### Build for production
```bash
pnpm build
```

### Start production server (for Railway/other platforms)
```bash
pnpm start
```

---

## 📊 Admin Dashboard

Access the admin dashboard at `/admin/dashboard` to view:
- Total users and revenue
- Active subscriptions by plan
- Shelter partner metrics
- Customer lifetime value
- Recent activity

**⚠️ Note:** Add authentication before production!

---

## 🤝 Partner Program

### Shelter Partnership
- **For Shelters:** Earn $1.50/month per adopter (10% revenue share)
- **For Adopters:** Get lifetime $5/month discount on Premium
- **Zero cost** to shelters

### Target Partners
- Animal shelters & rescues
- Pet influencers
- Veterinary practices

---

---

## 🤖 For AI Assistants / LLMs

**Starting a new chat session?** Follow this checklist:

1. ✅ Read **[CURSOR-STARTUP.md](./CURSOR-STARTUP.md)** - Complete new chat checklist
2. ✅ Review **[docs/CURRENT-STATUS.md](./docs/CURRENT-STATUS.md)** - Understand current state
3. ✅ Check **[.cursorrules](./.cursorrules)** - Project context and guidelines
4. ✅ Verify integrations - Run `bash scripts/setup-check.sh`

**🚨 CRITICAL: Context Management**
- **MUST reset at 50% context usage** (hard limit)
- See **[docs/CONTEXT-MANAGEMENT.md](./docs/CONTEXT-MANAGEMENT.md)** for complete guidelines
- Use **[CONTEXT-RESET-PROMPT.md](./CONTEXT-RESET-PROMPT.md)** when hitting 50%

This helps keep context usage low and ensures you stay on task!

---

## 📚 Documentation

All documentation is in the `docs/` folder:

- **[docs/README.md](./docs/README.md)** - Documentation index
- **[docs/CURRENT-STATUS.md](./docs/CURRENT-STATUS.md)** - Current features and status (single source of truth)
- **[docs/BEST-PRACTICES.md](./docs/BEST-PRACTICES.md)** - Development standards
- **[docs/integrations/GITHUB-SUPABASE-RAILWAY.md](./docs/integrations/GITHUB-SUPABASE-RAILWAY.md)** - Integration setup guide

---

## 🎯 Quick Status Check

**See latest changes and next tasks:**
```bash
pnpm status    # or pnpm next
```

**Check SSL certificate and DNS:**
```bash
pnpm check-ssl          # General SSL check (if you have a specific domain)
pnpm check-railway <url> # Check Railway deployment SSL (recommended)
```

**To find your Railway URL:**
1. Go to https://railway.app
2. Select your InterpWhat project
3. Go to Service → Settings → Domains
4. Use that URL with `pnpm check-railway <url>`

These commands show:
- ✅ Modified, staged, and untracked files
- 📋 TODO items in codebase
- 📅 Next tasks from documentation
- 📊 Quick project stats
- 🔒 SSL certificate status
- 🌐 DNS resolution

Perfect for starting a new work session!

---

## 🔗 Integration Status

- ✅ **GitHub**: Connected (`https://github.com/zganich/interpwhat.git`)
- ✅ **Supabase**: Used for client-side authentication (verified in codebase)
- ✅ **Deployment**: **Vercel** (configured - automatic SSL for www/non-www)
- ✅ **Railway**: Also supported (alternative deployment platform)

For detailed setup instructions, see:
- **[docs/VERCEL-DEPLOYMENT.md](./docs/VERCEL-DEPLOYMENT.md)** - **PRIMARY** - Complete Vercel deployment guide
- **[docs/integrations/GITHUB-SUPABASE-RAILWAY.md](./docs/integrations/GITHUB-SUPABASE-RAILWAY.md)** - Complete integration guide
- **[docs/RAILWAY-DEPLOYMENT.md](./docs/RAILWAY-DEPLOYMENT.md)** - Railway deployment details

---

## 📧 Contact

- **Support:** hello@interpwhat.com
- **Partnerships:** partnerships@interpwhat.com

---

## 📄 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

Built in loving memory of **Paisley**, Chantell's beloved companion who inspired this mission to help pet parents understand their furry friends better.

Every subscription helps support no-kill shelters and keeps rescue pets in loving homes.

---

**🐾 Making the world a better place for pets, one behavior at a time.**

