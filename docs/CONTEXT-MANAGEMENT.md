# Context Management Guide for LLM Assistants

**Last Updated:** November 2024

This guide helps manage context usage efficiently in Cursor/LLM chat sessions to prevent context exhaustion and maintain quality interactions.

---

## 🎯 Context Usage Thresholds

### Primary Threshold: **50% Context Usage**

**When you reach 50% context usage, you MUST:**
1. ✅ Complete current task (if close to completion)
2. ✅ Save all changes and commit work
3. ✅ Review what's been accomplished
4. ✅ Start a new chat session using `CURSOR-STARTUP.md` checklist

### Secondary Threshold: **60-65% (Emergency)**

If you somehow exceed 50%, start a new chat immediately at 60-65%. Do not proceed beyond this point.

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
⚠️ CONTEXT THRESHOLD REACHED (50%)

I've reached 50% context usage. Before starting a new chat, let me:

1. Complete current work
2. Save and document changes
3. Commit work to Git
4. Prepare notes for next session

Current work status: [Describe what you were working on]
Next steps: [What needs to be done next]
```

Then after completing the checklist:

```
✅ Context Reset Complete

I've completed the context reset checklist:
- ✅ Current work saved and committed
- ✅ Documentation updated
- ✅ Notes prepared for next session

Starting new chat session now with CURSOR-STARTUP.md checklist.
```

---

## 📊 Monitoring Context Usage

### How to Check Context Usage in Cursor
- Context usage is displayed in the Cursor UI (usually top-right or in chat header)
- Monitor it regularly, especially during long coding sessions
- Set a mental alarm at 40% to prepare for reset

### Warning Signs
- Context usage approaching 40% = Time to wrap up current task
- Context usage at 50% = **MUST RESET NOW**
- Context usage above 60% = **EMERGENCY RESET**

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
   - **STOP immediately**
   - Complete current task only
   - Follow reset checklist
   - Start new chat

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

1. **50% is the hard limit** - Not a suggestion, a requirement
2. **Always commit before resetting** - Don't lose work
3. **Document your progress** - Makes handoff easier
4. **Stay on task** - Don't let context fill with unrelated info
5. **Reference over read** - Use file paths, not full contents

---

## 📚 Related Documentation

- **CURSOR-STARTUP.md** - New chat session checklist
- **docs/BEST-PRACTICES.md** - General development guidelines
- **.cursorrules** - Project context and rules

---

## ❓ FAQ

**Q: What if I'm in the middle of an important task at 50%?**
A: Complete the current logical unit (function, feature, bug fix), then reset. Don't start new work.

**Q: Can I go slightly over 50%?**
A: Only if you're seconds away from completing critical work. Reset immediately after.

**Q: What if context resets are happening too frequently?**
A: Review your workflow:
- Are you reading files unnecessarily?
- Are you staying focused on one task?
- Are you using search tools efficiently?

**Q: How do I check context usage?**
A: Look for context usage indicator in Cursor UI (usually in chat header or top-right corner).

---

**Remember**: Context management is about maintaining quality interactions. Resetting at 50% ensures you always have enough context for good work while staying fresh and focused.

