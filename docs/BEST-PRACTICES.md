# InterpWhat Development Best Practices

**Last Updated:** January 2025

This document outlines development standards, conventions, and best practices for working on InterpWhat.

**"Bus Factor" Philosophy:** Write code as if you're teaching it to a new developer who will take over immediately. Always assume the next person has zero context.

---

## 📖 Table of Contents

1. [Bus Factor: Knowledge Continuity](#bus-factor-knowledge-continuity) ⭐ **START HERE**
2. [Vibe Coding & AI-Assisted Development](#-vibe-coding--ai-assisted-development) 🚀 **READ NEXT**
3. [Context Management](#context-management)
4. [Documentation Standards](#documentation-standards)
5. [Code Review Guidelines](#code-review-guidelines)
6. [Testing Practices](#testing-practices)
7. [Deployment Procedures](#deployment-procedures)
8. [Git Workflow](#git-workflow)
9. [When to Start New Chat Sessions](#when-to-start-new-chat-sessions)

---

## 🚌 Bus Factor: Knowledge Continuity ⭐

**The "Bus Factor" Problem:** If the primary developer is unavailable, can the project continue?

**Our Goal:** Make the project maintainable by ANY developer, even with zero prior context.

### Core Principles

#### 1. **Self-Documenting Code First**
Code should read like a story. If it needs comments, consider if the code itself can be clearer.

**Bad:**
```typescript
// Check if user is premium
if (x === 1) {
  // Give them 5 more analyses
  y += 5;
}
```

**Good:**
```typescript
if (user.subscriptionTier === 'premium') {
  user.remainingAnalyses += ANALYSES_BONUS_PREMIUM;
}
```

#### 2. **Comments Explain WHY, Code Explains WHAT**
Don't document obvious things. Document decisions, trade-offs, and context.

**Good Comments:**
```typescript
// Using setTimeout instead of requestIdleCallback because Safari doesn't support it yet
setTimeout(() => updateAnalytics(), 100);

// This query is intentionally NOT using an index to optimize for write performance
// Read operations are infrequent compared to writes (100:1 ratio)
```

**Bad Comments:**
```typescript
// Loop through users
users.forEach(user => {
  // Process user
  process(user);
});
```

#### 3. **Never Leave TODO/FIXME Without Context**
TODOs are only acceptable if they explain WHAT needs to be done and WHY.

**Bad:**
```typescript
// TODO: Fix this
function handlePayment() { }
```

**Good:**
```typescript
// TODO: Add retry logic for Stripe webhook failures
// Stripe recommends 3 retries with exponential backoff for failed webhooks
// See: https://stripe.com/docs/webhooks#retries
function handlePayment() { }
```

#### 4. **Meaningful Variable and Function Names**
Names should tell a story. If you need to look up what a variable does, the name is wrong.

**Bad:**
```typescript
const data = fetchData();
const temp = processData(data);
const result = calculate(temp);
```

**Good:**
```typescript
const petAnalyses = await fetchPetAnalyses();
const validatedAnalyses = validateImageQuality(petAnalyses);
const analysisResults = performBehaviorAnalysis(validatedAnalyses);
```

#### 5. **Type Safety Eliminates Ambiguity**
Use TypeScript types to document expectations. If a function can fail, the type should show it.

**Bad:**
```typescript
function analyzePet(photo) {
  // What if photo is null? What does it return?
  return openai.analyze(photo);
}
```

**Good:**
```typescript
async function analyzePetBehavior(
  photo: File
): Promise<{ success: false; error: string } | { success: true; analysis: PetAnalysis }> {
  try {
    const analysis = await openai.analyze(photo);
    return { success: true, analysis };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### 6. **Error Messages Are Documentation**
Error messages should explain what went wrong and how to fix it.

**Bad:**
```typescript
throw new Error("Failed");
```

**Good:**
```typescript
throw new Error(
  `Failed to process pet analysis: Image file size exceeds 10MB limit. ` +
  `Current size: ${file.size} bytes. Please compress the image and try again.`
);
```

### Continuity Checklist

Before committing code, ask yourself:

#### Code Quality
- [ ] Can a new developer understand this code in 5 minutes without asking questions?
- [ ] Are all functions under 50 lines? (Smaller functions = easier to understand)
- [ ] Do all non-obvious things have comments explaining WHY?
- [ ] Are all error cases handled with clear error messages?
- [ ] Can this code be tested without mocking half the universe?

#### Documentation
- [ ] Are all public APIs documented (JSDoc for functions, README for features)?
- [ ] Does the README explain how to run and deploy the project?
- [ ] Are all environment variables documented in `.env.example`?
- [ ] Is the database schema documented (schema diagrams or comments)?
- [ ] Are all third-party integrations documented (API keys, setup steps)?

#### Testing
- [ ] Can a new developer run tests to verify everything works?
- [ ] Do tests cover the critical paths (not just happy path)?
- [ ] Are edge cases and error conditions tested?
- [ ] Do failing tests clearly indicate what's broken?

#### Operations
- [ ] Can a new developer deploy this to production without tribal knowledge?
- [ ] Are all deployment steps documented (or automated)?
- [ ] Are environment variables documented with examples?
- [ ] Are database migrations documented?
- [ ] Are rollback procedures documented?

#### Security & Secrets
- [ ] Are all secrets in environment variables (never in code)?
- [ ] Is the `.env.example` file up-to-date with all required variables?
- [ ] Are API keys documented (where to get them, what permissions needed)?
- [ ] Is the security model documented (auth flows, permissions)?

### Knowledge Documentation Requirements

#### Must Document (Critical)
1. **Environment Setup**: How to go from zero to running app
2. **Database Schema**: What tables exist, relationships, indexes
3. **API Endpoints**: What each endpoint does, request/response formats
4. **Authentication Flow**: How users log in, session management
5. **Payment Processing**: Stripe integration, webhooks, subscription flows
6. **File Upload Flow**: How images/videos are validated, stored, and processed
7. **AI Analysis Pipeline**: How images are analyzed, error handling
8. **Deployment Process**: How to deploy to Vercel, rollback procedure
9. **Third-Party Integrations**: Supabase, Stripe, OpenAI setup and keys
10. **Known Issues**: What's broken, workarounds, planned fixes

#### Should Document (Important)
1. **Architecture Decisions**: Why certain technologies were chosen
2. **Performance Considerations**: Known bottlenecks, optimization strategies
3. **Testing Strategy**: What's tested, what's not, how to add tests
4. **Development Workflow**: Git flow, code review process, release process
5. **Monitoring & Logging**: Where logs go, how to debug production issues

### Emergency Handoff Document Template

Create an `EMERGENCY-HANDOFF.md` in the project root that covers:

```markdown
# Emergency Handoff Document

**Last Updated:** [Date]
**Critical Knowledge:** [Bullet points of "if I die tomorrow, you need to know..."]

## Quick Start
- [How to get the app running in < 5 minutes]

## Critical Systems
1. **Database**: [Connection string, backup location, migration commands]
2. **Payment Processing**: [Stripe webhook URLs, how to issue refunds]
3. **File Storage**: [Where files are stored, how to access them]
4. **Authentication**: [How to reset admin passwords, session management]

## Common Issues & Solutions
- [Known bugs and workarounds]
- [Things that break periodically and how to fix them]

## Contacts
- **AWS/Infrastructure**: [Who manages hosting, how to contact]
- **Payment Provider**: [Stripe support contact]
- **Domain/Email**: [Namecheap, email service]

## Secrets & Access
- [Where secrets are stored (password manager, env vars)]
- [What accounts have admin access]

## Daily Operations
- [Monitoring dashboards URLs]
- [Log locations]
- [Backup verification]
```

### Version Control Best Practices

#### Commit Messages That Tell a Story
Write commit messages as if explaining the change to someone six months later.

**Bad:**
```
fix bug
update code
wip
```

**Good:**
```
fix: Resolve Stripe webhook timeout by increasing timeout to 60s

Stripe webhooks for subscription cancellations were timing out because
they require up to 45 seconds to process. Increased serverless function
timeout from 30s to 60s to accommodate slow API responses.

Tested with: curl -X POST [webhook-url] -d "test_event"
Verified: Webhook completes in 52s for cancellation events
```

#### Atomic Commits
Each commit should represent ONE logical change that can be understood and potentially reverted independently.

**Bad:**
```
feat: Add new features and fix bugs
```

**Good:**
```
feat: Add photo quality validation before AI analysis

- Validate image format (jpg, png, webp only)
- Check image dimensions (min 256x256, max 8192x8192)
- Verify file size (max 10MB)
- Return descriptive errors for invalid images
- Update API docs

fix: Resolve memory leak in pet analysis cleanup

refactor: Extract image validation logic to separate module
```

#### Use Conventional Commits
Standardize commit message format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example:**
```
feat(api): Add photo quality validation

Validate images before processing to prevent wasted API credits
on low-quality or invalid images.

- Check format, dimensions, and file size
- Return descriptive errors
- Add tests for validation logic

Closes #42
```

### Code Review for Bus Factor

When reviewing code, ask:

1. **Can a new developer understand this without asking questions?**
2. **Are edge cases handled?**
3. **Do error messages explain what went wrong and how to fix it?**
4. **Is this code testable without heroic mocking efforts?**
5. **Would I be able to debug this at 2 AM with no context?**

If any answer is "no," request changes before approving.

### Monitoring and Observability

Make the system tell you when something's wrong:

#### Required Logging
- All errors (with stack traces and context)
- API requests (method, URL, duration, status code)
- Critical business events (payment processed, user subscribed, analysis completed)
- Performance metrics (slow queries, timeouts)

#### Log Formatting
Structured logs are searchable:

**Bad:**
```
Error occurred
```

**Good:**
```
{
  "level": "error",
  "message": "Failed to process Stripe webhook",
  "error": "Timeout after 30s",
  "webhook_event": "subscription.cancelled",
  "subscription_id": "sub_1234567890",
  "timestamp": "2025-01-15T10:30:00Z",
  "request_id": "req_abc123"
}
```

### Summary: The Bus Factor Test

**Final Check:** Could I explain everything a new developer needs to know in a 30-minute handoff meeting?

If not, document more.

**Remember:** The best code is the code that doesn't need to be read. Make it obvious.

---

## 🤖 Vibe Coding & AI-Assisted Development

**What is "Vibe Coding"?** An AI-assisted development approach that emphasizes flow state, creativity, and intuitive collaboration between developer and AI. When done right, it's faster and more enjoyable while maintaining code quality.

### Core Principles

#### 1. **AI is Your Pair Programming Partner, Not a Replacement**
Treat AI (Cursor/Claude) as a senior developer who needs clear communication but can handle tedious tasks.

**Good Collaboration:**
```
You: "Add photo validation before AI analysis. Check file type, 
      dimensions (min 256x256), and size (max 10MB). Return 
      descriptive errors."

AI: Generates complete implementation with error handling
You: Review, test edge cases, refine
```

**Bad Collaboration:**
```
You: "fix photo upload"
AI: Makes assumptions, you debug for hours
```

#### 2. **Clear, Specific Prompts Are Everything**
Vague prompts → wasted time debugging AI mistakes. Specific prompts → working code.

**Bad Prompt:**
```
"Add authentication"
```

**Good Prompt:**
```
"Add email/password authentication using Supabase Auth:
- Create login page at /login
- Create signup page at /signup
- Protect /dashboard route (redirect to /login if not authenticated)
- Store user session in SupabaseAuthContext
- Show user email in nav bar
- Add logout button"
```

**Great Prompt:**
```
"Add email/password authentication using Supabase Auth:
- Create login page at /login using existing Button and Input components
- Create signup page at /signup with password confirmation
- Protect /dashboard route (redirect to /login if not authenticated)
- Store user session in SupabaseAuthContext (already set up in lib/supabase.ts)
- Show user email in nav bar (use existing Nav component)
- Add logout button (clear session on click)
- Handle errors: display toast notifications on auth failures
- Add loading states during auth requests
- Follow existing code patterns in client/src/pages/Login.tsx"
```

#### 3. **Always Verify AI-Generated Code**
Trust but verify. AI makes mistakes, especially with edge cases and project-specific requirements.

**Verification Checklist:**
- [ ] Read through the generated code (don't blindly accept)
- [ ] Test happy path (does the main flow work?)
- [ ] Test error cases (invalid input, network failures, etc.)
- [ ] Check it follows project patterns (consistent with existing code)
- [ ] Verify security (no hardcoded secrets, proper auth checks)
- [ ] Check performance (no obvious N+1 queries, memory leaks)

#### 4. **Iterate and Refine**
Vibe coding is iterative. Get AI to generate initial version, then refine based on results.

**Iterative Workflow:**
1. **Initial Generation**: Get AI to create working prototype
2. **Test & Identify Issues**: Find edge cases, bugs, improvements
3. **Refine with Feedback**: Give AI specific feedback
4. **Repeat**: Until code is production-ready

**Example Iteration:**
```
Round 1: "Generate pet analysis API endpoint"
Result: Basic endpoint, no error handling

Round 2: "Add error handling for invalid file types and OpenAI failures"
Result: Better errors, but no logging

Round 3: "Add structured logging for all errors and successful analyses"
Result: Production-ready code

You: Deploy! 🚀
```

#### 5. **Document AI Prompts and Decisions**
Keep track of what prompts you used and why certain decisions were made.

**Create a `AI-PROMPTS.md` file:**
```markdown
## Feature: Photo Validation

**Prompt Used:**
"Add photo validation before AI analysis. Check: file type (jpg, png, webp), 
dimensions (min 256x256), size (max 10MB). Return descriptive errors."

**Why:** Prevents wasted API credits on invalid images

**Iterations:**
- v1: Basic validation ✅
- v2: Added dimension checks based on OpenAI requirements
- v3: Added specific error messages for each validation failure

**Key Decision:** Using file-type detection library instead of file extension
**Reason:** More secure, prevents spoofing with renamed files
```

#### 6. **Use AI for Boring, Repetitive Tasks**
Focus AI on tedious work, use your brain for architecture and creative problem-solving.

**Great AI Tasks:**
- Boilerplate code generation
- Writing tests for existing code
- Refactoring repetitive patterns
- Generating API documentation
- Creating mock data
- Adding error handling
- Converting data formats

**Better Human Tasks:**
- Architectural decisions
- Complex algorithms
- Security-critical logic
- User experience design
- Performance optimization
- Debugging unusual issues

#### 7. **Maintain Code Quality Standards**
Vibe coding doesn't mean sloppy code. All AI-generated code must meet the Bus Factor standards.

**Quality Gate for AI Code:**
- [ ] Readable by new developer in 5 minutes?
- [ ] Properly typed (TypeScript strict mode)?
- [ ] Error handling for all failure cases?
- [ ] Follows existing code patterns?
- [ ] Tested (at least manually)?
- [ ] Documented if non-obvious?

#### 8. **Balance Speed with Safety**
Vibe coding is fast, but rushing critical features causes problems.

**Safe to Vibe Code:**
- ✅ UI components (low risk)
- ✅ CRUD operations (well-understood)
- ✅ Data transformations (easy to test)
- ✅ Documentation generation
- ✅ Test writing

**Slow Down and Think:**
- ⚠️ Payment processing (security-critical)
- ⚠️ Authentication flows (security-critical)
- ⚠️ Database migrations (can't easily revert)
- ⚠️ User data deletion (compliance issues)
- ⚠️ Complex algorithmic changes (hard to verify)
- ⚠️ Production deployments (affects users)

### Prompt Engineering Best Practices

#### Structure Effective Prompts

**Template:**
```
CONTEXT:
[What you're working on, relevant background]

GOAL:
[Specific outcome you want]

REQUIREMENTS:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

CONSTRAINTS:
- [Constraint 1 - e.g., "must use existing Button component"]
- [Constraint 2 - e.g., "follow TypeScript strict mode"]

EXAMPLES:
[Reference similar code in your codebase]
```

**Real Example:**
```
CONTEXT: Creating new pet profile page. Users can upload photos 
and add pet details.

GOAL: Build /pet/:id page displaying pet info and timeline of analyses

REQUIREMENTS:
- Show pet name, breed, age
- Display photo gallery (use existing ImageGallery component)
- Show timeline of past analyses (use existing Timeline component)
- Add "Analyze New Photo" button linking to /analyze/:id
- Fetch data using tRPC getPet(id) endpoint

CONSTRAINTS:
- Must match existing page design (see /dashboard)
- Use existing Layout component
- Handle loading and error states
- Mobile-responsive

EXAMPLES:
See client/src/pages/Dashboard.tsx for layout patterns
See client/src/components/Timeline.tsx for timeline usage
```

#### Common Prompt Patterns

**Pattern 1: Generate New Code**
```
Create a [component/function/feature] that [does X]
- Follow the pattern in [existing file]
- Use [specific library/pattern]
- Handle [specific cases]
```

**Pattern 2: Fix Bug**
```
[Description of bug]
- Current behavior: [what happens]
- Expected behavior: [what should happen]
- Error: [error message if any]
- Relevant code: [file path or snippet]
```

**Pattern 3: Refactor**
```
Refactor [file/function] to [goal]
- Keep same functionality
- Improve: [readability/performance/maintainability]
- Follow pattern in [reference file]
```

**Pattern 4: Add Feature to Existing Code**
```
Add [feature] to [existing file]
- [Existing file context]
- [New feature requirements]
- Integrate with [existing patterns]
```

### Testing AI-Generated Code

#### Required Tests Before Merging

**1. Manual Testing**
- Test happy path (normal user flow)
- Test edge cases (empty input, large files, network failures)
- Test error cases (invalid input, auth failures)

**2. Code Review**
- Read through generated code line by line
- Check for security issues (SQL injection, XSS, auth bypass)
- Verify it follows project patterns
- Ensure it handles errors gracefully

**3. Integration Testing**
- Test with real data (not just mocks)
- Verify database changes work as expected
- Check API integrations (Stripe, OpenAI, etc.)

#### Red Flags in AI Code

**🚩 Immediate Reject If:**
- Hardcoded secrets or credentials
- No error handling
- Security vulnerabilities (SQL injection, auth bypass)
- Performance issues (N+1 queries, memory leaks)
- Inconsistent with existing code patterns
- Magic numbers or unclear logic
- No input validation

**⚠️ Review Carefully If:**
- Complex nested conditionals
- Recursive algorithms
- Performance-critical sections
- Third-party library integrations
- Database migrations
- Authentication logic

### Collaboration Between Human and AI

#### Effective AI Usage Patterns

**Pattern A: Exploratory Development**
```
You: "Research how to [do X] using [technology]"
AI: Provides options and trade-offs
You: Choose approach based on project needs
AI: Implement chosen approach
```

**Pattern B: Incremental Building**
```
You: "Build basic version"
AI: Generates simple implementation
You: "Now add [feature 1]"
AI: Extends implementation
You: "Now add [feature 2]"
AI: Further extends
```

**Pattern C: Debugging**
```
You: "Debug [issue], error is [error message]"
AI: Suggests causes
You: Test suggestions
AI: Refines based on results
```

#### Know When to Stop Using AI

**Switch to Manual Coding When:**
- AI keeps making the same mistakes
- You spend more time debugging AI than coding would take
- You need to deeply understand the implementation
- Working on security-critical features
- AI doesn't understand project-specific context
- You're reinventing the wheel better done manually

### Monitoring AI-Generated Code in Production

**Track These Metrics:**
- Error rates (AI code tends to have more subtle bugs)
- Performance degradation (AI may not optimize well)
- User complaints about AI-added features
- Time to fix AI-introduced bugs vs. manually-written bugs

**Red Flags:**
- New features have higher error rates than existing code
- Performance regressions after AI changes
- More bugs requiring hotfixes

**Response:**
- Add more thorough testing for AI-generated code
- Increase code review scrutiny
- Consider manual rewrite if issues persist

### Summary: Vibe Coding Best Practices

**✅ DO:**
- Use clear, specific prompts
- Always verify and test AI output
- Iterate and refine based on results
- Document prompts and decisions
- Maintain quality standards
- Use AI for boring tasks
- Balance speed with safety

**❌ DON'T:**
- Blindly accept AI suggestions
- Use vague prompts
- Skip testing AI code
- Deploy unverified code
- Vibe code security-critical features
- Forget to document
- Sacrifice code quality for speed

**Remember:** Vibe coding is about working WITH AI, not deferring to it. You're still the senior developer making architectural decisions.

---

## 🎯 Context Management

### For LLM Assistants (Cursor)

#### Starting New Chat Sessions
**Always start with the checklist in `CURSOR-STARTUP.md`:**

1. ✅ Read `README.md`
2. ✅ Read `docs/CURRENT-STATUS.md`
3. ✅ Read `docs/README.md`
4. ✅ Review `.cursorrules`

#### Context Usage Guidelines
- **Monitor context usage** (shown in Cursor UI)
- **Start new chat at 60-65%** context usage
- **Reference files by path** instead of reading full contents when possible
- **Use semantic search** (`codebase_search`) before asking questions

#### Efficiency Tips
- Read documentation before reading code
- Check existing implementations before creating new ones
- Use grep/search tools to find specific patterns
- Reference file paths in discussions instead of full code blocks

### For Human Developers

#### Onboarding
1. Read `README.md` for project overview
2. Review `docs/CURRENT-STATUS.md` for current state
3. Check `docs/README.md` for documentation index
4. Set up environment using `.env.example`

#### Staying Updated
- Review `docs/CURRENT-STATUS.md` regularly (updated when features change)
- Check `docs/README.md` for new documentation
- Follow Git commit messages for recent changes

---

## 📝 Documentation Standards

### Writing Documentation

#### Structure
1. **Clear title and purpose** - State what the document covers
2. **Table of contents** - For documents > 500 words
3. **Sections with headers** - Use descriptive headers
4. **Code examples** - Include practical examples
5. **Last updated date** - Always include when last modified

#### Content Guidelines
- **Be specific** - Avoid vague language
- **Include examples** - Show, don't just tell
- **Cross-reference** - Link to related documents
- **Keep it current** - Update when code changes

#### File Naming
- Use `UPPERCASE-WITH-HYPHENS.md` for important docs
- Use `lowercase-with-hyphens.md` for standard docs
- Group related docs in directories (e.g., `docs/product/`)

### Documentation Maintenance

#### When to Update
- **After adding features** - Update `CURRENT-STATUS.md`
- **After architecture changes** - Update technical docs
- **After integration changes** - Update integration docs
- **After process changes** - Update this file (best practices)

#### Update Checklist
- [ ] Update "Last Updated" date
- [ ] Review all sections for accuracy
- [ ] Add new information where relevant
- [ ] Remove outdated information
- [ ] Update cross-references if files moved

---

## 👀 Code Review Guidelines

### Starting New Chat Sessions

**Before starting work on a new feature, review:**

1. **Current Status**
   ```bash
   # Read these files first
   - README.md
   - docs/CURRENT-STATUS.md
   - docs/README.md
   - .cursorrules
   ```

2. **Related Code**
   - Find similar existing implementations
   - Review related components/files
   - Check type definitions

3. **Documentation**
   - Product requirements (PRD)
   - Architecture docs
   - Integration guides

### Code Review Checklist

#### Functionality
- [ ] Code works as intended
- [ ] Handles error cases
- [ ] Follows existing patterns
- [ ] No breaking changes (unless intentional)

#### Code Quality
- [ ] TypeScript types are correct
- [ ] No console.logs left in code
- [ ] No commented-out code
- [ ] Follows project style guide

#### Documentation
- [ ] Code is commented where needed
- [ ] README updated if needed
- [ ] `CURRENT-STATUS.md` updated if feature added
- [ ] Integration docs updated if integrations changed

#### Security
- [ ] No secrets in code
- [ ] Environment variables used correctly
- [ ] Authentication/authorization handled properly
- [ ] Input validation present

---

## 🧪 Testing Practices

### Testing Strategy

#### Manual Testing
- Test in development environment first
- Test all user flows
- Test error cases
- Test on different browsers/devices (if applicable)

#### Automated Testing
- Write tests for critical paths
- Use Vitest for unit tests
- Test API endpoints via tRPC
- Update tests when features change

### Before Deployment
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Environment variables verified
- [ ] Database migrations run (if needed)

---

## 🚀 Deployment Procedures

### Pre-Deployment Checklist

#### Environment Setup
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Build succeeds locally
- [ ] TypeScript checks pass (`pnpm check`)

#### Integration Verification
- [ ] GitHub connection verified
- [ ] Supabase credentials valid
- [ ] Railway deployment configured
- [ ] Database connection works

#### Code Quality
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] Changes committed and pushed

### Deployment Steps

1. **Build locally** (verify it works)
   ```bash
   pnpm build
   ```

2. **Check environment variables** (Railway/Supabase)
   - Verify all required vars are set
   - Check production vs development vars

3. **Run database migrations** (if schema changed)
   ```bash
   pnpm db:push
   ```

4. **Deploy**
   - Push to GitHub (Railway auto-deploys)
   - Or manually deploy via Railway dashboard

5. **Verify deployment**
   - Check Railway logs
   - Test application in production
   - Monitor for errors

### Post-Deployment
- [ ] Verify application works
- [ ] Check logs for errors
- [ ] Monitor performance
- [ ] Update documentation if needed

---

## 🔀 Git Workflow

### Commit Messages
Use clear, descriptive commit messages:

**Good:**
```
feat: Add photo quality validation before analysis
fix: Resolve Supabase auth token refresh issue
docs: Update CURRENT-STATUS.md with new features
```

**Bad:**
```
updates
fix
wip
```

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch (if using)
- Feature branches - For new features

### Before Committing
- [ ] Code works locally
- [ ] TypeScript checks pass
- [ ] No secrets in code
- [ ] Meaningful commit message

---

## 💬 When to Start New Chat Sessions

### Context Threshold (CRITICAL)
**🚨 HARD LIMIT: Start a new chat when context reaches 50%**

This is not optional - it's a requirement for maintaining quality.

**Warning System:**
- **40% context**: ⚠️ Warning - Prepare to wrap up current task
- **50% context**: 🚨 ACTION REQUIRED - Complete current work, commit, and reset
- **60%+ context**: ❌ EMERGENCY - Reset immediately (should never happen)

**At 50% Context, you MUST:**
1. Complete current task
2. Save and commit all changes
3. Document what was done
4. Start new chat following `CURSOR-STARTUP.md`

See `docs/CONTEXT-MANAGEMENT.md` for complete guidelines and reset checklist.

### Other Triggers
- **New feature** - Start fresh for clean context
- **Complex refactoring** - Easier with fresh start
- **After long break** - Refresh context
- **Context feels cluttered** - Clean slate helps

### Transition Checklist
1. ✅ Complete current task
2. ✅ Commit changes
3. ✅ Update documentation
4. ✅ Start new chat with `CURSOR-STARTUP.md` checklist

---

## 🎨 Code Style Preferences

### TypeScript
- Use strict mode
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use enums for constants

### React Components
- Use functional components
- Use hooks (not class components)
- Prefer composition over inheritance
- Keep components focused and small

### File Organization
- Group related files in directories
- Use consistent naming (camelCase for files)
- Keep shared code in `shared/` directory
- Keep client/server code separate

---

## 🔒 Security Practices

### Environment Variables
- Never commit `.env` file
- Use `.env.example` as template
- Document all required variables
- Rotate secrets regularly

### API Keys
- Store in environment variables
- Use appropriate key types (anon keys for client, secret keys for server)
- Never expose server keys to client

### Authentication
- Always verify authentication
- Use Supabase auth for client-side
- Validate user permissions
- Log authentication events

---

## 📊 Performance Considerations

### Optimization Tips
- Lazy load heavy components
- Optimize images before upload
- Use React.memo for expensive components
- Cache API responses when appropriate

### Monitoring
- Monitor API response times
- Track error rates
- Monitor database query performance
- Watch memory usage

---

## 🤝 Collaboration

### Communication
- Document decisions in relevant docs
- Update `CURRENT-STATUS.md` when status changes
- Comment complex code
- Use clear variable/function names

### Code Sharing
- Commit frequently
- Push to GitHub regularly
- Document breaking changes
- Keep PR descriptions clear

---

## ✅ Quick Reference

### Before Starting Work
1. Read `CURSOR-STARTUP.md` checklist
2. Review `docs/CURRENT-STATUS.md`
3. Check related documentation
4. Verify environment setup

### Before Committing
1. Code works locally
2. No TypeScript errors
3. No secrets in code
4. Documentation updated

### Before Deploying
1. All tests pass
2. Environment variables set
3. Database migrations run
4. Build succeeds

---

**Remember**: These practices help maintain code quality, reduce bugs, and make collaboration easier. Follow them consistently for best results.

**Questions?** 
- Check `docs/README.md` for documentation
- Check `docs/integrations/GITHUB-SUPABASE-RAILWAY.md` for integration help
- Check `docs/CONTEXT-MANAGEMENT.md` for context management (CRITICAL)
- Use `CONTEXT-RESET-PROMPT.md` when hitting 50% context usage

