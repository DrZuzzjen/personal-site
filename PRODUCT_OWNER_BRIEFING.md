# 🎯 Product Owner Briefing - Sales Agent Migration

**Your Role:** Product Owner & Senior Architect
**Project:** Sales Agent Migration to Vercel AI SDK
**Team:** Steven (Dev 1), Codex (Dev 2)
**Timeline:** 4-6 days
**Status:** 🟢 READY TO START

---

## 📊 Executive Summary

### What We're Building
Migrating the sales workflow from manual orchestration (5 LLM calls) to Vercel AI SDK Agent class (2-3 LLM calls).

### Why Now
- **40-50% faster** response time (8s → 4-5s)
- **40% cost reduction** (fewer API calls)
- **60% less code** (398 lines → ~150 lines)
- **Better maintainability** (isolated agents vs monolithic functions)

### Risk Level
**MEDIUM** - Sales workflow is business-critical, but we have:
- ✅ Comprehensive test coverage
- ✅ Gradual rollout plan
- ✅ Instant rollback capability
- ✅ A/B testing infrastructure

---

## 📋 What You've Set Up

### Documentation Created (All in root directory)

1. **SALES_AGENT_MIGRATION_PLAN.md** (Master Plan)
   - 4-phase breakdown
   - Architecture diagrams
   - Success criteria
   - Risk mitigation

2. **VERCEL_AI_SDK_AGENTS_GUIDE.md** (Technical Deep Dive)
   - Complete API reference
   - Code examples
   - Common pitfalls
   - Performance comparison

3. **MISSION_STEVEN_1A.md** (Steven's Tasks)
   - Agent infrastructure
   - Field Extractor Agent
   - Unit tests
   - Documentation

4. **MISSION_CODEX_1B.md** (Codex's Tasks)
   - Sales Agent core
   - validateAndSendEmail tool
   - Unit tests
   - Documentation

5. **START_HERE.md** (Team Onboarding)
   - Reading order
   - Quick start guide
   - Git workflow
   - Troubleshooting

6. **PRODUCT_OWNER_BRIEFING.md** (This Document)
   - Your responsibilities
   - Daily checklist
   - Decision framework
   - Escalation paths

---

## 🏗️ Architecture Overview

### Current System
```
User Message
  ↓
[Router] detectIntent() ────→ LLM call #1
  ↓
[Sales] extractFields() ────→ LLM call #2
  ↓
[Sales] generateText() ─────→ LLM call #3
  ↓
[Sales] extractFields() ────→ LLM call #4 (redundant!)
  ↓
[Sales] validateFields() ───→ LLM call #5
  ↓
[Sales] sendEmail() ────────→ API call

Total: 5 LLM calls, ~8 seconds
```

### Target System
```
User Message
  ↓
[Router Agent] ─────────────→ LLM call #1
  ↓
[Field Extractor Agent] ───→ LLM call #2 (returns current state)
  ↓
[Sales Agent] ──────────────→ LLM call #3
  ├─→ Has field state in context
  ├─→ Asks for missing fields OR
  └─→ Calls validateAndSendEmail tool
      └─→ Validates + sends email (no LLM)

Total: 3 LLM calls, ~4-5 seconds
```

**Key Improvements:**
- ✅ Eliminated redundant extractFields call
- ✅ Validation is now sync (no LLM needed)
- ✅ Agent decides when to trigger email
- ✅ Better separation of concerns

---

## 📅 Phase 1 Timeline (Current Phase)

### Day 1-2: Foundation
**Steven:** Agent infrastructure + Field Extractor
**Codex:** Sales Agent core + Email tool

**Your Responsibilities:**
- [ ] Morning standup (9 AM daily)
- [ ] Answer architecture questions in Slack
- [ ] Review commits (end of day)
- [ ] Unblock issues (within 1 hour)

---

## 🔍 Daily Checklist (Product Owner)

### Morning (9:00 AM)
- [ ] Attend standup call
- [ ] Note blockers and assign owners
- [ ] Review Slack `#sales-agent-migration` for overnight questions

### Midday (12:00 PM)
- [ ] Check commit activity (both devs should have commits)
- [ ] Review any PRs or questions
- [ ] Spot-check code quality

### Evening (5:00 PM)
- [ ] Review day's commits
- [ ] Provide feedback in Slack
- [ ] Update project status if needed
- [ ] Plan tomorrow's priorities

### Metrics to Track
- [ ] Commits per dev per day (expect 2-4)
- [ ] Test coverage (should stay >85%)
- [ ] Build status (should be green)
- [ ] Blocker count (should be 0-1)

---

## 🚦 Decision Framework

### When to Approve

**Agent Implementation:**
✅ Approve if:
- Uses `Experimental_Agent as Agent` from 'ai'
- Has clear system prompt
- Has proper stopWhen condition
- Has error handling
- Has unit tests

❌ Reject if:
- No error handling
- No tests
- Vague system prompts
- Missing type safety

**Tool Implementation:**
✅ Approve if:
- Clear description
- Zod schema validation
- Returns error states (not throws)
- Logs all operations
- Has unit tests

❌ Reject if:
- Throws errors instead of returning error states
- No logging
- No validation
- Missing tests

**Tests:**
✅ Approve if:
- Coverage >90%
- Tests edge cases
- Tests error scenarios
- Tests multilingual support
- Fast (<5s total)

❌ Reject if:
- Coverage <85%
- Only happy path tested
- Tests are slow
- Tests are flaky

---

## 💬 Common Questions & Your Answers

### "Should we use Agent class or just generateText()?"

**Answer:** Agent class for Sales workflow because:
- It's a multi-step chain (extract → validate → send)
- Reduces 5 LLM calls to 3
- Better error handling
- Easier to test

For simple one-shot tasks, generateText() is fine.

### "What if extractFields agent fails?"

**Answer:** Return all fields as null with confidence 0. Sales agent will ask for all fields. No silent failures.

### "Should we retry email sending if it fails?"

**Answer:** No automatic retries in tool. Return error to agent, let agent explain to user and ask to retry. User-driven retries only.

### "How do we handle language detection?"

**Answer:** Field Extractor Agent is language-agnostic (works on any language). Sales Agent constructor takes `language` parameter. Detect language in API route, pass to Sales Agent.

### "What if user provides wrong information?"

**Answer:** Validation happens in tool. If invalid (bad email format, etc.), tool returns error, agent asks to correct. No silent corrections.

---

## 🚨 Red Flags to Watch For

### Code Smells
- ❌ Agent with no stopWhen (infinite loop risk)
- ❌ Tool that throws errors (breaks agent)
- ❌ No logging in critical paths
- ❌ Hardcoded values (should use env vars)
- ❌ No type safety (any, unknown)

### Process Issues
- ❌ Dev hasn't committed in 4+ hours (check if blocked)
- ❌ Tests failing on main branch
- ❌ Merge conflicts piling up
- ❌ Devs not communicating
- ❌ Questions going unanswered >2 hours

### Technical Debt
- ❌ TODO comments piling up
- ❌ Console.log instead of proper logging
- ❌ Copy-paste code
- ❌ Tests with setTimeout (flaky)
- ❌ Mocking entire modules (tight coupling)

---

## 🎯 Success Criteria (Phase 1 Complete)

### Code Quality
- [ ] Test coverage >90%
- [ ] TypeScript strict mode passing
- [ ] ESLint warnings = 0
- [ ] All commits follow format

### Functionality
- [ ] Field Extractor Agent working
- [ ] Sales Agent working
- [ ] Email tool integrated
- [ ] All unit tests passing

### Documentation
- [ ] types.ts documented
- [ ] Both agents documented
- [ ] README.md complete
- [ ] Code has JSDoc comments

### Team
- [ ] No blockers remaining
- [ ] Both devs confident
- [ ] Code reviewed
- [ ] Ready for Phase 2

---

## 📞 Escalation Paths

### Technical Blocker (>2 hours)
1. Dev posts in Slack with `@ProductOwner`
2. You respond within 1 hour
3. If unsure, schedule 15min call
4. Document decision in Slack thread

### Architectural Question
1. Dev reads `VERCEL_AI_SDK_AGENTS_GUIDE.md` first
2. If still unclear, posts question in Slack
3. You provide answer with reasoning
4. Update docs if question is common

### Emergency (Production Issue)
1. Rollback immediately (feature flag)
2. Post in `#incidents` channel
3. Investigate root cause
4. Fix and redeploy
5. Postmortem document

---

## 📊 Phase 2 Preview (After Day 2)

### Mission 2A (Steven): New API Route
Create `app/api/chat-v2/route.ts` that:
- Integrates Field Extractor Agent
- Integrates Sales Agent
- Handles errors gracefully
- Returns same format as old API

### Mission 2B (Codex): Performance & Monitoring
- Add telemetry logging
- Create performance comparison script
- Set up A/B testing infrastructure
- Load testing

---

## 🎓 Your Study Materials

### Must Read (If Not Already)
- [Vercel AI SDK Agents Overview](https://ai-sdk.dev/docs/agents/overview)
- [Building Agents](https://ai-sdk.dev/docs/agents/building-agents)
- [Workflow Patterns](https://ai-sdk.dev/docs/agents/workflows)

### Internal Docs
- `VERCEL_AI_SDK_AGENTS_GUIDE.md` (you created this, skim it)
- `ai_migration.md` (original analysis)

---

## ✅ Your Action Items (Right Now)

1. [ ] Read this document (you're doing it!)
2. [ ] Skim `VERCEL_AI_SDK_AGENTS_GUIDE.md` (refresh your knowledge)
3. [ ] Create Slack channel `#sales-agent-migration` (if not exists)
4. [ ] Invite Steven & Codex to channel
5. [ ] Post welcome message:

```
👋 Welcome to Sales Agent Migration!

📚 Reading order:
1. SALES_AGENT_MIGRATION_PLAN.md (master plan)
2. VERCEL_AI_SDK_AGENTS_GUIDE.md (technical guide)
3. Your mission briefing (MISSION_STEVEN_1A.md or MISSION_CODEX_1B.md)

Then check START_HERE.md for quick start instructions.

🎯 Goal: By end of Day 2, have both agents implemented and tested.

📅 Daily standup: 9 AM
💬 Post blockers immediately
🚀 Let's build this!

Any questions before starting?
```

6. [ ] Schedule standup for tomorrow 9 AM
7. [ ] Set reminder to check commits EOD

---

## 🎉 Final Notes

**You've done great prep work.** All documentation is clear, comprehensive, and actionable.

**Your team is set up for success.** They have:
- ✅ Clear mission briefings
- ✅ Code templates
- ✅ Test examples
- ✅ Architectural guidance
- ✅ Troubleshooting guides

**Your job now:**
- Be available for questions
- Unblock issues quickly
- Review code quality
- Keep team motivated

**Remember:**
- Quality > Speed
- Communication > Perfection
- Progress > Perfect planning

---

**Good luck, Product Owner! You've got this. 💪**

**Next Action:** Send welcome message in Slack and schedule standup.
