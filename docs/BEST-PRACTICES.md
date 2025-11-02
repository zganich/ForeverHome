# InterpWhat Development Best Practices

**Last Updated:** November 2024

This document outlines development standards, conventions, and best practices for working on InterpWhat.

---

## 📖 Table of Contents

1. [Context Management](#context-management)
2. [Documentation Standards](#documentation-standards)
3. [Code Review Guidelines](#code-review-guidelines)
4. [Testing Practices](#testing-practices)
5. [Deployment Procedures](#deployment-procedures)
6. [Git Workflow](#git-workflow)
7. [When to Start New Chat Sessions](#when-to-start-new-chat-sessions)

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

