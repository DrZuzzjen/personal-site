# 🚀 Sales Agent Migration - START HERE

**Welcome, Steven & Codex!**

This is your mission control for the Sales Agent migration project.

---

## 📁 Documentation Structure

Read these files **in order**:

### 1. **SALES_AGENT_MIGRATION_PLAN.md** (15 min read)
The master plan with:
- Executive summary
- Architecture diagrams
- 4-phase breakdown
- Success criteria
- Risk mitigation

**Read this FIRST to understand the big picture.**

---

### 2. **VERCEL_AI_SDK_AGENTS_GUIDE.md** (30 min read)
Complete technical guide with:
- Agent class API reference
- Tool definition patterns
- Workflow patterns
- Common pitfalls
- Real-world examples
- Performance comparison

**Read this SECOND to become an expert on Vercel AI SDK Agents.**

---

### 3. Your Mission Briefing (20 min read)
- **Steven:** Read `MISSION_STEVEN_1A.md`
- **Codex:** Read `MISSION_CODEX_1B.md`

Your mission briefing contains:
- Specific tasks for Day 1 & 2
- Code templates
- Test examples
- Definition of Done checklist

**Read this THIRD to know exactly what to build.**

---

## 🎯 Quick Start (After Reading Docs)

### Steven's First Steps:
```bash
# 1. Create branch (if not exists)
git checkout -b feature/sales-agent-migration

# 2. Create folder structure
mkdir -p app/lib/ai/agents/__tests__
mkdir -p app/lib/ai/agents/tools

# 3. Start with Task 1: Create types.ts
code app/lib/ai/agents/types.ts

# 4. Commit often
git add app/lib/ai/agents/types.ts
git commit -m "[Mission 1A] Create shared types for agents"
git push origin feature/sales-agent-migration
```

### Codex's First Steps:
```bash
# 1. Pull Steven's branch
git checkout feature/sales-agent-migration
git pull origin feature/sales-agent-migration

# 2. Wait for Steven to push types.ts (check Slack)

# 3. Start with Task 1: Create email-tool.ts
code app/lib/ai/agents/tools/email-tool.ts

# 4. Commit often
git add app/lib/ai/agents/tools/email-tool.ts
git commit -m "[Mission 1B] Create validateAndSendEmail tool"
git push origin feature/sales-agent-migration
```

---

## ⚙️ Environment Setup

### Required Env Variables
Check your `.env` file has:
```bash
GROQ_API_KEY=gsk_...
GROQ_EXTRACTOR_MODEL=llama-3.3-70b-versatile
GROQ_SALES_MODEL=llama-3.3-70b-versatile
RESEND_API_KEY=re_...
```

### Install Dependencies
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```

### Run Tests
```bash
# All tests
npm test

# Specific test
npm test -- field-extractor.test.ts

# Watch mode
npm test -- --watch
```

---

## 🔄 Git Workflow

### Pull Often (Every 2 Hours)
```bash
git pull origin feature/sales-agent-migration --rebase
```

### Commit Format
```
[Mission ID] Brief description

- Detail 1
- Detail 2

Affects: file paths
```

### Example Commits
```
[Mission 1A] Create Field Extractor Agent

- Implement Agent class with Vercel AI SDK
- Add extractFields method with proper typing
- Include error handling for malformed JSON

Affects: app/lib/ai/agents/field-extractor-agent.ts
```

---

## 📞 Communication

### Daily Standup
**Time:** 9:00 AM (15 min max)
**Format:**
- What I did yesterday
- What I'm doing today
- Any blockers

### Slack Channels
- `#sales-agent-migration` - Project discussion
- `#dev-general` - General dev questions

### Tagging
- `@ProductOwner` - Architecture/planning questions
- `@Steven` / `@Codex` - Coordinate with each other

### Blockers
Post immediately in `#sales-agent-migration`:
```
🚨 BLOCKER: [Brief description]
Context: [What you were trying to do]
Impact: [What's blocked]
Need: [What you need to unblock]
```

---

## ✅ Definition of Done (Phase 1)

Both missions complete when:

**Steven (1A):**
- [ ] types.ts created and pushed
- [ ] field-extractor-agent.ts implemented
- [ ] Unit tests passing (>90% coverage)
- [ ] README.md documentation created

**Codex (1B):**
- [ ] email-tool.ts created and pushed
- [ ] sales-agent.ts implemented
- [ ] Unit tests passing (>90% coverage)
- [ ] README.md documentation updated

**Both:**
- [ ] All tests pass: `npm test`
- [ ] No console errors: `npm run dev`
- [ ] Code review completed
- [ ] All commits pushed to `feature/sales-agent-migration`

---

## 🎓 Learning Resources

### Vercel AI SDK
- [Agents Overview](https://ai-sdk.dev/docs/agents/overview)
- [Building Agents](https://ai-sdk.dev/docs/agents/building-agents)
- [Workflow Patterns](https://ai-sdk.dev/docs/agents/workflows)

### Project Context
- `CLAUDE.md` - Project overview and tech stack
- `ai_migration.md` - Migration analysis
- `app/api/chat/route.ts` - Current implementation

### Testing
- [Vitest Docs](https://vitest.dev/)
- [Zod Docs](https://zod.dev/)

---

## 📊 Progress Tracking

Update this daily in Slack `#sales-agent-migration`:

```
📅 Day X Progress Update

Steven (Mission 1A):
✅ Task 1: types.ts created
✅ Task 2: field-extractor-agent.ts implemented
🔄 Task 3: Writing unit tests (60% done)
⏳ Task 4: Documentation (not started)

Codex (Mission 1B):
✅ Task 1: email-tool.ts created
🔄 Task 2: sales-agent.ts (70% done)
⏳ Task 3: Unit tests (not started)
⏳ Task 4: Documentation (not started)

Blockers: None
ETA: End of Day 2
```

---

## 🚨 Troubleshooting

### "Agent is not exported from 'ai'"
```bash
npm install ai@latest
```
Import as: `import { Experimental_Agent as Agent } from 'ai'`

### "GROQ_API_KEY is not defined"
Check `.env` file has:
```
GROQ_API_KEY=gsk_your_key_here
```

### Tests failing with "Cannot find module"
```bash
npm install --save-dev @types/node
```

### Merge conflicts
```bash
git pull origin feature/sales-agent-migration --rebase
# Fix conflicts in VS Code
git add .
git rebase --continue
```

---

## 🎯 Success Metrics

**Code Quality:**
- Test coverage > 90%
- No TypeScript errors
- No ESLint warnings

**Performance:**
- Field extraction < 500ms
- Sales agent response < 1200ms
- Email sending < 2000ms

**Functionality:**
- All test scenarios pass
- Manual testing successful
- No regressions in existing features

---

## 🏁 Next Steps (After Phase 1)

Once both missions complete:

1. **Code review session** (both devs + Product Owner)
2. **Manual testing** on dev server
3. **Move to Phase 2:** API integration (see `SALES_AGENT_MIGRATION_PLAN.md`)

---

## 📝 Notes

- **Don't rush** - Focus on quality over speed
- **Test thoroughly** - Sales workflow is business-critical
- **Communicate often** - Better to over-communicate
- **Ask questions** - No stupid questions, only unasked ones
- **Have fun** - You're building something awesome! 🚀

---

**Ready? Let's build this! 💪**

**Step 1:** Read `SALES_AGENT_MIGRATION_PLAN.md`
**Step 2:** Read `VERCEL_AI_SDK_AGENTS_GUIDE.md`
**Step 3:** Read your mission briefing
**Step 4:** Start coding!

Good luck, team! 🎉
