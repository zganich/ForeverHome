# InterpWhat Knowledge Base - Master Document

**Last Updated:** October 18, 2024  
**Purpose:** Single source of truth for all InterpWhat knowledge  
**Audience:** Developers, marketers, partners, and stakeholders

---

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Product & Features](#product--features)
4. [Technical Architecture](#technical-architecture)
5. [Business Model](#business-model)
6. [Marketing & Launch](#marketing--launch)
7. [Partner Strategy](#partner-strategy)
8. [Admin & Operations](#admin--operations)
9. [Quick Reference](#quick-reference)
10. [Archive](#archive)

---

## 1. Project Overview

### What is InterpWhat?

**InterpWhat** is an AI-powered pet parenting platform that helps pet owners understand their pets' behavior, track their care, and make better decisions. Built in memory of Paisley, Chantell's beloved dog.

### Mission

Empower pet parents with AI-driven insights to build deeper connections with their companions and help rescue pets stay in loving homes.

### Core Values

- **Mission-Driven:** Every subscription supports no-kill shelters
- **Science-Based:** AI trained on veterinary and behavioral science
- **Accessible:** Affordable plans for all pet parents
- **Rescue-First:** Lifetime discounts for rescue pet adopters

---

## 2. Current Status

### ✅ What's Live

**Platform:**
- ✅ Full-stack web application (React + Express + MySQL)
- ✅ User authentication (OAuth via Manus)
- ✅ Pet profile management
- ✅ AI behavior analysis (GPT-4 Vision)
- ✅ Breed identification
- ✅ Care reminders
- ✅ Multi-pet comparison
- ✅ Pet Timeline™
- ✅ Admin dashboard

**Infrastructure:**
- ✅ Database schema (10 tables)
- ✅ File storage (S3)
- ✅ API endpoints (tRPC)
- ✅ Development server running

**Marketing:**
- ✅ Website copy updated
- ✅ Pricing model finalized
- ✅ Black Friday campaign ready
- ✅ Social media calendar (30 days)
- ✅ Partner outreach materials
- ✅ Email sequences prepared

### ⏳ In Progress

- ⏳ Email integration (Resend setup needed)
- ⏳ Stripe subscription products (rescue adopter tier)
- ⏳ Admin authentication
- ⏳ Adoption verification UI

### 📊 Key Metrics (Current)

- **Total Users:** 1
- **Active Subscriptions:** 0
- **Revenue:** $0/month
- **Shelter Partners:** 0

---

## 3. Product & Features

### Feature Set

#### **Core Features (All Plans)**
1. **Pet Voice™ Analysis** - AI interprets pet behavior from photos/videos
2. **Pet Timeline™** - Track your pet's history and milestones
3. **Basic Behavior Insights** - Understand what your pet is communicating

#### **Premium Features**
4. **AI Breed Identification** - Identify breed from photos (unlimited)
5. **Care Reminders** - Schedule medication, vet visits, grooming
6. **Multi-Pet Comparison** - Compare behaviors across multiple pets
7. **Advanced Insights** - Deeper behavioral analysis
8. **Priority Support** - 24-hour response time
9. **Export Reports** - Download PDF reports

### Subscription Plans

| Plan | Price | Features | Target Audience |
|------|-------|----------|----------------|
| **Essential** | $9.99/mo | 3 pets, 10 analyses/mo, basic features | Casual pet owners |
| **Premium** | $19.99/mo | Unlimited pets, 30 analyses/mo, all features | Dedicated pet parents |
| **Rescue Adopter** | $14.99/mo | All Premium + lifetime discount | Rescue pet adopters |
| **Shelter Org** | $33/mo | Organizational account + revenue share | Shelters & rescues |

### Unique Value Propositions

1. **All-In-One Platform** - Only app combining behavior analysis, breed ID, reminders, and comparison
2. **Mission-Driven** - Portion of revenue supports no-kill shelters
3. **Rescue Rewards** - Lifetime discount for rescue adopters
4. **Shelter Partnership** - Revenue sharing model incentivizes adoption

---

## 4. Technical Architecture

### Stack

**Frontend:**
- React 19.2.0
- TypeScript
- Wouter (routing)
- TanStack Query
- Tailwind CSS + shadcn/ui

**Backend:**
- Node.js 22.13.0
- Express
- tRPC (type-safe API)
- Drizzle ORM

**Database:**
- MySQL (via Drizzle)
- 10 tables (users, pets, analyses, reminders, shelter_partners, etc.)

**AI & Services:**
- OpenAI GPT-4 Vision (behavior analysis)
- OpenAI TTS (voice generation)
- AWS S3 (file storage)
- Stripe (payments)

### Key Files

**Server:**
- `/server/_core/index.ts` - Main server entry
- `/server/routers.ts` - tRPC API routes
- `/server/routes/admin.ts` - Admin endpoints
- `/server/aiAgents.ts` - AI analysis logic
- `/server/breedIdentification.ts` - Breed ID logic
- `/server/reminders.ts` - Reminder system

**Client:**
- `/client/src/App.tsx` - Main app + routing
- `/client/src/pages/Home.tsx` - Landing page
- `/client/src/pages/Dashboard.tsx` - User dashboard
- `/client/src/pages/AdminDashboard.tsx` - Admin dashboard

**Database:**
- `/drizzle/schema.ts` - Database schema
- `/drizzle/0009_hesitant_galactus.sql` - Latest migration

### Database Schema

**Core Tables:**
1. `users` - User accounts and subscriptions
2. `pets` - Pet profiles
3. `analyses` - Behavior analysis results
4. `reminders` - Care reminders

**Partner Tables:**
5. `shelter_partners` - Shelter organizations
6. `adoption_verifications` - Adoption paperwork verification

**Marketing Tables:**
7. `email_campaigns` - Email marketing campaigns
8. `email_recipients` - Individual email tracking
9. `analytics_events` - Event tracking

**Payment Tables:**
10. `purchases` - Credit purchases (legacy)

---

## 5. Business Model

### Revenue Streams

1. **Direct Subscriptions** (Primary)
   - Essential: $9.99/mo
   - Premium: $19.99/mo
   - Rescue Adopter: $14.99/mo

2. **Shelter Partnerships** (Secondary)
   - Organizational: $33/mo
   - Revenue share: 10% of adopter subscriptions

3. **Credit Packs** (Legacy, being phased out)
   - Starter: $4.99 (5 credits)
   - Value: $9.99 (12 credits)
   - Power: $19.99 (30 credits)

### Financial Projections

**Month 12 Targets:**
- 800 Premium subscribers × $19.99 = $15,992
- 1,000 Essential subscribers × $9.99 = $9,990
- 500 Rescue Adopters × $14.99 = $7,495
- 25 Shelter Orgs × $33 = $825
- **Total: $34,302/month ($411,624/year)**

### Customer Lifetime Value

| Plan | 12 Months | 24 Months | 36 Months |
|------|-----------|-----------|-----------|
| Essential | $119.88 | $239.76 | $359.64 |
| Premium | $239.88 | $479.76 | $719.64 |
| Rescue Adopter | $179.88 | $359.76 | $539.64 |

### Unit Economics

**Customer Acquisition Cost (CAC):** ~$15 (estimated)  
**Lifetime Value (LTV):** $240-720 (12-36 months)  
**LTV:CAC Ratio:** 16:1 to 48:1 (excellent)

---

## 6. Marketing & Launch

### Launch Timeline

**Week 1 (Now):**
- ✅ Website live with new pricing
- ✅ Admin dashboard functional
- ⏳ Send announcement email to existing users
- ⏳ Begin social media posting

**Week 2-3:**
- Start shelter outreach (5 targets in SLC + Austin)
- Build anticipation for Black Friday
- Continue daily social media content

**Week 4 (Black Friday - Nov 22-26):**
- Launch 50% off annual Premium ($119.94 for first year)
- Email blast to all users
- Social media blitz
- Partner co-marketing

### Marketing Channels

1. **Social Media** (Primary)
   - TikTok: Pet behavior tips, behind-the-scenes
   - Instagram: Visual stories, user testimonials
   - Reddit: r/dogs, r/cats, r/pets community engagement
   - Facebook: Pet parent groups

2. **Partner Outreach** (High Priority)
   - Animal shelters (adoption referrals)
   - Pet influencers (sponsored content)
   - Veterinary practices (referral partnerships)

3. **Content Marketing**
   - Blog posts on pet behavior
   - YouTube tutorials
   - Email newsletters

4. **Paid Advertising** (Month 3+)
   - Facebook/Instagram ads
   - Google Search ads
   - TikTok ads

### Key Marketing Assets

**Ready to Use:**
- Black Friday landing page
- 5 promotional graphics
- 30-day social media calendar
- 24 content ideas
- Email sequences (5 emails)
- Partner outreach emails (3 types × 3-4 emails each)
- Sales one-pager
- Partner pitch deck

---

## 7. Partner Strategy

### Shelter Partner Program

**Value Proposition:**
- **For Shelters:** Passive revenue ($1.50/month per adopter), zero cost
- **For Adopters:** Lifetime $5/month discount on Premium
- **For InterpWhat:** Distribution channel, mission alignment

**Target Shelters:**

**Salt Lake City:**
1. Best Friends Animal Society - utahadoptions@bestfriends.org
2. Humane Society of Utah - Via contact form
3. Paws For Life Utah - (435) 640-4752 (TEXT FIRST)

**Austin:**
4. Austin Pets Alive! - partnerships@austinpetsalive.org
5. Austin Humane Society - Via contact form

**Outreach Process:**
1. Research shelter (programs, scale, mission)
2. Personalize email (reference specific initiatives)
3. Send initial outreach
4. Follow up after 5 days
5. Schedule demo call
6. Sign partnership agreement

### Influencer Strategy

**Target Criteria:**
- 10K-500K followers
- High engagement rate (>3%)
- Pet-focused content
- Authentic, educational tone

**Partnership Models:**
1. **Affiliate:** 20% commission on referrals
2. **Sponsored Content:** $500-2,000 per post
3. **Brand Ambassador:** Free Premium + monthly fee

### Veterinary Partnerships

**Value Proposition:**
- Enhance client relationships
- Reduce behavior-related surrenders
- Professional referral tool

**Outreach:** Focus on progressive, tech-forward practices

---

## 8. Admin & Operations

### Admin Dashboard

**Access:** `/admin/dashboard`  
**API:** `/api/admin/analytics`

**Metrics Tracked:**
- Total users
- Active subscriptions (by plan)
- Monthly revenue (by plan)
- Shelter partners
- Rescue adopter sign-ups
- Customer lifetime value
- Churn rate
- Recent activity

**Export Options:**
- Users list
- Shelter partners
- Adoption verifications

**⚠️ Security:** Currently no authentication - add before production

### Operations Checklist

**Daily:**
- [ ] Monitor server health
- [ ] Check error logs
- [ ] Respond to support emails

**Weekly:**
- [ ] Review analytics dashboard
- [ ] Send partner follow-ups
- [ ] Post social media content (7×/week)
- [ ] Monitor subscription signups

**Monthly:**
- [ ] Calculate shelter revenue share
- [ ] Send partner payments
- [ ] Review financial metrics
- [ ] Plan next month's content

---

## 9. Quick Reference

### Important Links

**Live App:** https://3000-iinx3otu9hzt0gmwzovcq-ba7ae41d.manusvm.computer  
**Admin Dashboard:** https://3000-iinx3otu9hzt0gmwzovcq-ba7ae41d.manusvm.computer/admin/dashboard  
**GitHub:** (Add when repo is created)

### Key Contacts

**Shelter Partners:**
- Best Friends SLC: utahadoptions@bestfriends.org
- Austin Pets Alive!: partnerships@austinpetsalive.org

**Support Email:** hello@interpwhat.com

### File Locations

**Documentation:** `/home/ubuntu/InterpWhat-Documentation/`  
**Marketing:** `/home/ubuntu/InterpWhat-Marketing/`  
**App Code:** `/home/ubuntu/interpwhat/`  
**Quick Reference:** `/home/ubuntu/InterpWhat-Quick-Reference/`

### Command Cheat Sheet

```bash
# Start development server
cd /home/ubuntu/interpwhat && pnpm dev

# Run database migrations
cd /home/ubuntu/interpwhat && pnpm drizzle-kit push

# Check server status
ps aux | grep tsx

# View server logs
tail -f /tmp/server.log

# Test admin API
curl http://localhost:3000/api/admin/analytics
```

---

## 10. Archive

### Archived Documents

**Location:** `/home/ubuntu/InterpWhat-Documentation/archive/`

**Archived (No Longer Needed):**
- ChatGPT Features Analysis (features now implemented)
- Old PRD versions (superseded by v2)
- Old marketing materials (v1, v2 replaced by v3)
- Beta testing guides (beta phase complete)
- Website copy analysis (copy now updated)

**Keep for Reference:**
- Technical research findings
- PRD feedback
- Pet AI technical findings

---

## 📋 Document Index

### Essential Documents (Read These First)

1. **This Document** - Master knowledge base
2. `/InterpWhat-Documentation/CURRENT-STATUS.md` - Current state
3. `/InterpWhat-Pricing-Model-REVISED.md` - Business model
4. `/InterpWhat-Marketing/LAUNCH-PACKAGE-SUMMARY.md` - Launch plan
5. `/InterpWhat-Admin-Dashboard-IMPLEMENTED.md` - Admin guide

### Product Documents

- `/InterpWhat-Documentation/product/InterpWhat-PRD-v2-Final.md` - Product requirements
- `/InterpWhat-Documentation/product/interpwhat-financial-analysis.md` - Financial model
- `/InterpWhat-Documentation/product/interpwhat-saas-growth-strategies.md` - Growth strategies

### Technical Documents

- `/InterpWhat-Documentation/technical/interpwhat-architecture.md` - System architecture
- `/InterpWhat-Documentation/technical/interpwhat-ai-architecture.md` - AI design
- `/InterpWhat-Documentation/EMAIL-INTEGRATION-GUIDE.md` - Email setup

### Marketing Documents

- `/InterpWhat-Marketing/revenue-drivers/REVENUE-STRATEGY.md` - Revenue strategy
- `/InterpWhat-Marketing/revenue-drivers/InterpWhat-Black-Friday-Playbook-v3.md` - Black Friday
- `/InterpWhat-Marketing/social-media/SOCIAL-MEDIA-EXECUTION-PLAN.md` - Social media
- `/InterpWhat-Marketing/partner-outreach/PARTNER-OUTREACH-PLAN.md` - Partner strategy

---

## 🔄 Maintenance

**This document should be updated:**
- Weekly: Current status, metrics
- Monthly: Financial projections, partner list
- Quarterly: Strategic direction, product roadmap

**Last Reviewed:** October 18, 2024  
**Next Review:** October 25, 2024

---

**Built with ❤️ by Chantell and the guy with the mumbling drawl...and in memory of Paisley 🐾**

