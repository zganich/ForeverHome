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
- ✅ Pet behavior analysis using GPT-4 Vision
- ✅ Pet profile management (unlimited pets)
- ✅ Photo/video upload and analysis
- ✅ AI-powered insights and recommendations
- ✅ Pet Timeline™ - track milestones and history

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
- Drizzle ORM + MySQL

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
- MySQL database

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
```

4. **Run database migrations**
```bash
pnpm drizzle-kit push
```

5. **Start development server**
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

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
DATABASE_URL=mysql://user:password@host:port/database

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

### Build for production
```bash
pnpm build
```

### Start production server
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

