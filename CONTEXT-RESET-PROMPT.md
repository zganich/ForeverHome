# Context Reset Prompt - Use at 50% Context Usage

**⚠️ COPY AND USE THIS WHEN YOU REACH 50% CONTEXT USAGE**

---

## Initial Warning (At 50% Context)

```
⚠️ CONTEXT THRESHOLD REACHED (50%)

I've reached 50% context usage. Following the context reset protocol:

**Current Work Status:**
[Briefly describe what you're working on]

**Immediate Actions:**
1. Completing current task
2. Saving all changes
3. Committing work to Git
4. Documenting progress
5. Preparing notes for next session

**Next Session Notes:**
- Task in progress: [describe]
- Completed: [list what's done]
- Next steps: [what needs to happen next]
- Blockers/Issues: [any problems encountered]

I will complete this checklist and then start a fresh chat session.
```

---

## After Completing Reset Checklist

```
✅ CONTEXT RESET COMPLETE

I've successfully completed the context reset checklist:

✅ **Completed:**
- [ ] Current work finished
- [ ] All changes saved
- [ ] Code tested/verified
- [ ] Documentation updated (if needed)
- [ ] Changes committed to Git
- [ ] Progress documented

✅ **Status:**
- Previous work: [what was accomplished]
- Next steps: [what needs to be done]
- Git commit: [commit message/hash if applicable]

**Starting new chat session now...**

[Then open a new chat and use CURSOR-STARTUP.md checklist]
```

---

## Quick Reference

**50% Context = HARD LIMIT**
- Not a suggestion
- Not negotiable
- Must reset immediately after completing current task

**Reset Checklist:**
1. Complete current task
2. Save all files
3. Test/verify
4. Document changes
5. Commit to Git
6. Start new chat

**Full Guidelines:** See `docs/CONTEXT-MANAGEMENT.md`

