# InterpWhat: Technical Architecture & Agent Swarm Design

**Version:** 1.0
**Date:** October 15, 2025

---

## 1. System Architecture Overview

InterpWhat follows a modern, serverless architecture optimized for rapid development, low operational costs, and high scalability. The system is designed around an **AI Agent Swarm** pattern where specialized agents collaborate to deliver comprehensive pet behavior analysis.

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (Web Browser)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js / Vercel)                     │
│  • React Components                                          │
│  • TailwindCSS + Framer Motion                              │
│  • Image/Video Upload UI                                     │
│  • Real-time Analysis Streaming                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (FastAPI / Render)                  │
│  • Authentication & Authorization                            │
│  • Media Processing Pipeline                                 │
│  • Agent Orchestration Layer                                 │
│  • Rate Limiting & Cost Control                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   SUPABASE   │ │  OPENAI API  │ │  STORAGE     │
│              │ │              │ │              │
│ • Auth       │ │ • GPT-4o     │ │ • Media      │
│ • PostgreSQL │ │ • Vision     │ │   Files      │
│ • Storage    │ │ • Embeddings │ │ • Cache      │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 2. Agent Swarm Architecture

The AI Agent Swarm is the core intelligence of InterpWhat. Each agent has a specific responsibility and communicates through a central orchestrator.

### 2.1 Agent Roles & Responsibilities

#### **Vision Agent**
- **Purpose:** Analyze visual content from uploaded images/videos
- **Model:** GPT-4o with vision capabilities
- **Inputs:** Image frames (extracted from video or direct upload)
- **Outputs:** 
  - Detected postures (tail position, ear set, body stance)
  - Facial expressions (eyes, mouth, tension indicators)
  - Environmental context (indoor/outdoor, other animals present)
  - Confidence scores for each observation

**Sample Prompt Structure:**
```
You are a pet behavior vision specialist. Analyze this image of a [BREED] [SPECIES].

Focus on:
1. Body posture (tail, ears, stance)
2. Facial expression (eyes, mouth, tension)
3. Environmental context

Return a structured JSON with your observations and confidence scores.
```

#### **Context Agent**
- **Purpose:** Enrich analysis with pet-specific and situational context
- **Model:** GPT-4o
- **Inputs:**
  - Pet profile data (breed, age, known behaviors)
  - User-provided context (e.g., "This was after a walk")
  - Historical analysis data (from Memory Agent)
- **Outputs:**
  - Breed-specific behavioral tendencies
  - Age-appropriate behavior expectations
  - Relevant historical patterns

#### **Behavioral Synthesis Agent**
- **Purpose:** Combine all inputs to form a holistic interpretation
- **Model:** GPT-4o (reasoning-optimized)
- **Inputs:**
  - Vision Agent observations
  - Context Agent enrichment
  - Audio Agent data (Phase 2)
- **Outputs:**
  - Primary behavior classification (e.g., "Anxious", "Playful")
  - Confidence score (0-100%)
  - Reasoning explanation
  - Alternative interpretations (if confidence is low)

**Sample Prompt Structure:**
```
You are an expert pet behaviorist synthesizing multiple data sources.

Vision Analysis: [VISION_DATA]
Context: [CONTEXT_DATA]
Historical Patterns: [MEMORY_DATA]

Provide:
1. Primary behavior interpretation
2. Confidence score (0-100%)
3. Clear explanation of reasoning
4. Alternative interpretations if confidence < 70%

Be empathetic and educational in your explanation.
```

#### **Recommendation Agent**
- **Purpose:** Generate actionable, safe suggestions for pet owners
- **Model:** GPT-4o
- **Inputs:** Behavioral Synthesis output
- **Outputs:**
  - 2-3 specific, actionable recommendations
  - Safety warnings (if applicable)
  - When to consult a veterinarian

**Safety Guidelines Built Into Prompt:**
- Never diagnose medical conditions
- Always suggest vet consultation for concerning behaviors
- Provide positive reinforcement-based suggestions
- Avoid punitive or harmful advice

#### **Memory Agent**
- **Purpose:** Store, retrieve, and learn from historical data
- **Technology:** PostgreSQL (Supabase) + Vector embeddings
- **Functions:**
  - Store each analysis with timestamp
  - Track user feedback (helpful/not helpful)
  - Identify behavioral patterns over time
  - Retrieve relevant historical context for new analyses

**Database Schema:**
```sql
-- Pets table
CREATE TABLE pets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT,
  species TEXT, -- 'dog' or 'cat'
  breed TEXT,
  age INTEGER,
  photo_url TEXT,
  created_at TIMESTAMP
);

-- Analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY,
  pet_id UUID REFERENCES pets,
  media_url TEXT,
  media_type TEXT, -- 'image' or 'video'
  vision_data JSONB,
  context_data JSONB,
  synthesis_data JSONB,
  recommendations JSONB,
  confidence_score INTEGER,
  user_feedback TEXT, -- 'helpful', 'not_helpful', or NULL
  created_at TIMESTAMP
);

-- Behavioral patterns (computed)
CREATE TABLE behavioral_patterns (
  id UUID PRIMARY KEY,
  pet_id UUID REFERENCES pets,
  pattern_type TEXT, -- e.g., 'frequent_anxiety', 'play_preference'
  pattern_data JSONB,
  confidence FLOAT,
  first_observed TIMESTAMP,
  last_observed TIMESTAMP
);
```

---

## 3. Data Flow: User Upload to Results

```
1. USER UPLOADS MEDIA
   └─> Frontend validates file (size, type)
   └─> Upload to Supabase Storage
   └─> Generate signed URL

2. BACKEND RECEIVES ANALYSIS REQUEST
   └─> Check user rate limits
   └─> Extract frames (if video)
   └─> Initiate Agent Orchestration

3. AGENT ORCHESTRATION
   └─> Vision Agent analyzes frames → vision_data
   └─> Context Agent enriches with pet profile → context_data
   └─> Memory Agent retrieves historical patterns → memory_data
   └─> Synthesis Agent combines all data → synthesis_result
   └─> Recommendation Agent generates suggestions → recommendations

4. RESULTS RETURNED TO FRONTEND
   └─> Stream results in real-time (for better UX)
   └─> Display with confidence visualization
   └─> Store complete analysis in database

5. USER PROVIDES FEEDBACK
   └─> Update analysis record with feedback
   └─> Memory Agent learns from feedback
```

---

## 4. Cost Optimization Strategies

Given the constraint of keeping costs low, we implement several strategies:

### 4.1 Rate Limiting
- Free tier: 3 analyses per month per user
- Premium: Unlimited analyses
- Implement token bucket algorithm to prevent abuse

### 4.2 Intelligent Caching
- Cache identical media uploads (hash-based)
- Cache breed-specific context data
- Use Redis or Supabase edge functions for fast retrieval

### 4.3 Model Selection
- Use GPT-4o-mini for Context Agent (cheaper, sufficient for text)
- Use GPT-4o for Vision and Synthesis (where accuracy matters most)
- Batch requests where possible

### 4.4 Media Processing
- Compress uploaded media before storage
- Extract only 3-5 key frames from videos (not every frame)
- Resize images to optimal resolution for vision models

**Estimated Costs (Monthly):**
- Supabase Free Tier: $0
- Vercel Free Tier: $0
- Render Free Tier: $0
- OpenAI API (100 analyses): ~$15-25
- **Total for MVP/Beta: $15-25/month**

---

## 5. Security & Privacy

- **Authentication:** Supabase Auth (email/password, social login ready)
- **Data Encryption:** All data encrypted at rest and in transit
- **Media Storage:** Signed URLs with expiration
- **API Security:** Rate limiting, CORS, input validation
- **Privacy Policy:** Clear disclosure of data usage for personalization
- **User Data Control:** Easy export and deletion of all user data

---

## 6. Scalability Plan

### Phase 1 (MVP): 0-100 Users
- Free tiers for all services
- Manual monitoring
- Simple agent orchestration

### Phase 2 (Beta): 100-1,000 Users
- Upgrade to paid Supabase tier (~$25/mo)
- Implement caching layer
- Add monitoring (Sentry for errors)

### Phase 3 (Growth): 1,000+ Users
- Migrate to dedicated backend hosting if needed
- Implement queue system for async processing
- Add CDN for media delivery
- Consider fine-tuning smaller models for cost reduction

---

## 7. Development Timeline

**Day 1-2: Foundation**
- Set up Next.js frontend with TailwindCSS
- Set up FastAPI backend
- Configure Supabase (auth, database, storage)
- Implement basic authentication flow

**Day 3: Core Agent Implementation**
- Build Vision Agent with GPT-4o
- Build Context Agent
- Build Synthesis Agent
- Build Recommendation Agent

**Day 4: Integration & UI**
- Complete upload flow
- Implement agent orchestration
- Build results display UI
- Add feedback mechanism

**Day 5: Polish & Deploy**
- Testing and bug fixes
- Deploy to Vercel (frontend) and Render (backend)
- Beta user onboarding

---

This architecture is designed to be lean, fast, and scalable while keeping costs minimal. The agent swarm approach allows us to leverage the power of modern LLMs without the complexity and cost of training custom models.

