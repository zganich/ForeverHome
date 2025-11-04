# Context Management Guide for LLM Assistants

**Last Updated:** January 2025

## ⚠️ CRITICAL: 50% Context Limit Prevents Hallucinations

**This guide is about preventing hallucinations and incorrect code, not just convenience.**

When context usage exceeds 50%, LLMs begin to:
- **Hallucinate** - Make up code, functions, or features that don't exist
- **Lose accuracy** - Provide incorrect implementations or false information
- **Create false memories** - Claim files or features exist when they don't
- **Generate broken code** - Write code that appears correct but doesn't work

**50% is a hard limit based on LLM behavior, not an arbitrary threshold.**

---

## 🎯 Context Usage Thresholds

### 🚨 Primary Threshold: **50% Context Usage - MANDATORY STOP**

**When you reach 50% context usage, you MUST:**
1. ✅ **STOP IMMEDIATELY** - Do not continue with current or new work
2. ✅ Complete current task (if seconds away from finishing)
3. ✅ Save all changes and commit work
4. ✅ Review what's been accomplished
5. ✅ **Start a new chat session** using `CURSOR-STARTUP.md` checklist

**Why stop at 50%?** Because beyond this point, the AI will begin hallucinating. You may see:
- References to files that don't exist
- Functions or APIs that were never created
- Incorrect implementations that seem plausible but are wrong
- False claims about what was previously done

### ⚠️ Secondary Threshold: **40% Context Usage - Warning Level**

At 40%, you should:
- Prepare to wrap up current task
- Do NOT start new features or complex work
- Monitor closely as you approach 50%
- Have a plan for what to commit before hitting 50%

### 🚨 Emergency Threshold: **60-65% (Critical - Immediate Reset)**

If you somehow exceed 50%, start a new chat **immediately** at 60-65%. 
- **Do not proceed beyond this point under any circumstances**
- Hallucinations are almost guaranteed at this level
- Code quality will be severely degraded

---

## 📋 Context Reset Checklist (Use at 50%)

When you hit 50% context usage, follow this checklist:

### 1. Complete Current Work
- [ ] Finish the current task or feature you're working on
- [ ] Save all file changes
- [ ] Run any necessary tests
- [ ] Verify code compiles/builds correctly

### 2. Document What Was Done
- [ ] Update relevant documentation if features were added
- [ ] Note any breaking changes
- [ ] Update `docs/CURRENT-STATUS.md` if needed

### 3. Commit Your Work
- [ ] Stage all changes (`git add .`)
- [ ] Create a descriptive commit message
- [ ] Push to GitHub if ready

### 4. Prepare for New Session
- [ ] Note what you were working on (for continuity)
- [ ] Note any issues or blockers encountered
- [ ] List next steps/todos for the new session

### 5. Start Fresh
- [ ] Open a new chat in Cursor
- [ ] Follow `CURSOR-STARTUP.md` checklist
- [ ] Reference your notes from previous session

---

## 🔔 Context Reset Prompt Template

When you hit 50% context usage, use this prompt to wrap up and reset:

```
🚨 CONTEXT THRESHOLD REACHED (50%) - STOPPING TO PREVENT HALLUCINATIONS

I've reached 50% context usage. As per guidelines, I'm stopping immediately to prevent hallucinations and incorrect code.

Before starting a new chat, let me:

1. Complete current work (if seconds away from finishing)
2. Save and document changes
3. Commit work to Git
4. Push to GitHub
5. Prepare notes for next session

Current work status: [Describe what you were working on]
Next steps: [What needs to be done next]

⚠️ IMPORTANT: Starting a new chat session now to ensure accuracy.
```

Then after completing the checklist:

```
✅ Context Reset Complete - Starting New Chat

I've completed the context reset checklist:
- ✅ Current work saved and committed
- ✅ Changes pushed to GitHub
- ✅ Documentation updated
- ✅ Notes prepared for next session

Starting fresh chat session now with CURSOR-STARTUP.md checklist.
This ensures no hallucinations and maintains code quality.
```

---

## 📊 Monitoring Context Usage

### How to Check Context Usage in Cursor
- Context usage is displayed in the Cursor UI (usually top-right or in chat header)
- Monitor it regularly, especially during long coding sessions
- Set a mental alarm at 40% to prepare for reset

### Warning Signs
- Context usage approaching 40% = ⚠️ Time to wrap up current task - Do NOT start new features
- Context usage at 50% = 🚨 **MUST RESET NOW - HALLUCINATIONS BEGIN**
- Context usage above 60% = 🚨🚨 **EMERGENCY RESET - IMMEDIATE HALLUCINATION RISK**

### How to Recognize Hallucinations
If you notice any of these, you may already be past 50%:
- References to files or functions that don't exist when you check
- Claims about features that were "just added" but aren't in the codebase
- Suggestions to use APIs or methods that don't exist in the project
- Code that looks correct but doesn't match the project's actual patterns
- **If you see any of these: Stop immediately and start a new chat**

---

## 💡 Best Practices for Context Efficiency

### Before Starting Work
1. **Reference, Don't Read**
   - Use file paths and line numbers instead of full file contents
   - Use `grep` or `codebase_search` to find specific patterns
   - Read only what's necessary for the current task

2. **Use Documentation**
   - Check `docs/` folder before reading code
   - Reference existing documentation
   - Use `CURSOR-STARTUP.md` for quick context

3. **Stay Focused**
   - Work on one feature/task at a time
   - Avoid scope creep
   - Complete tasks before starting new ones

### During Work
1. **Minimize Re-reading**
   - Once you understand a file, reference it by path
   - Don't re-read files unnecessarily
   - Use code references: `12:14:filepath`

2. **Efficient Searching**
   - Use `codebase_search` for semantic searches
   - Use `grep` for exact string matching
   - Use `grep` with file type filters when possible

3. **Batch Operations**
   - Group related file reads together
   - Plan edits before making them
   - Use search tools efficiently

### When Approaching Limits
1. **At 40% Context**
   - Start wrapping up current task
   - Prepare for transition
   - Don't start new complex features

2. **At 50% Context**
   - **STOP IMMEDIATELY** - Hallucinations begin beyond this point
   - Complete current task only (if seconds away)
   - Follow reset checklist
   - **MANDATORY**: Start new chat to prevent hallucinations
   - Do NOT continue any work, even "just one more thing"

---

## 📝 Context Reset Workflow

```
┌─────────────────────────────────┐
│  Monitor Context Usage          │
│  (Check regularly)              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Context Usage = 40%            │
│  ⚠️ Warning: Prepare to wrap up │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Context Usage = 50%            │
│  🚨 ACTION REQUIRED             │
│  Follow Reset Checklist         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  1. Complete Current Task       │
│  2. Save & Document             │
│  3. Commit to Git               │
│  4. Prepare Notes                │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Start New Chat Session         │
│  Follow CURSOR-STARTUP.md       │
└─────────────────────────────────┘
```

---

## 🎯 Key Principles

1. **50% is the hard limit** - Not a suggestion, a requirement based on LLM behavior
2. **Hallucinations are real** - Beyond 50%, the AI will make up code and features
3. **Always commit before resetting** - Don't lose work
4. **Document your progress** - Makes handoff easier
5. **Stay on task** - Don't let context fill with unrelated info
6. **Reference over read** - Use file paths, not full contents
7. **If in doubt, reset** - Better to start fresh than risk hallucinations

---

## 📚 Related Documentation

- **CURSOR-STARTUP.md** - New chat session checklist
- **docs/BEST-PRACTICES.md** - General development guidelines
- **.cursorrules** - Project context and rules

---

## ❓ FAQ

**Q: What if I'm in the middle of an important task at 50%?**
A: Complete only if you're literally seconds away (like committing). Otherwise, stop immediately. Hallucinations can corrupt your work even if it looks correct. Better to restart fresh.

**Q: Can I go slightly over 50%?**
A: **NO.** The 50% limit is based on when hallucinations begin. Even "slightly over" risks incorrect code. If you're at 50%, stop and start a new chat.

**Q: How do I know if I'm hallucinating?**
A: Signs include: references to non-existent files, claims about features that don't exist, code that doesn't match project patterns. If unsure, verify against the actual codebase or start a new chat.

**Q: What if I've already passed 50%?**
A: Stop immediately, commit what you have, and start a new chat. Verify any code written past 50% against the actual codebase, as it may be hallucinated.

**Q: What if context resets are happening too frequently?**
A: Review your workflow:
- Are you reading files unnecessarily?
- Are you staying focused on one task?
- Are you using search tools efficiently?

**Q: How do I check context usage?**
A: Look for context usage indicator in Cursor UI (usually in chat header or top-right corner).

---

**Remember**: Context management is about maintaining quality interactions. Resetting at 50% ensures you always have enough context for good work while staying fresh and focused.

