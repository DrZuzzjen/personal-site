# 🚀 Sales Agent Migration - Master Plan

**Project Owner:** Product Owner / Senior Architect
**Developers:** Steven, Codex
**Timeline:** 4-6 days
**Branch:** `feature/sales-agent-migration`
**Status:** 🟢 ACTIVE

---

## 📊 Executive Summary

**Objective:** Migrate Sales workflow from manual orchestration to Vercel AI SDK Agent class

**Expected Benefits:**
- ⚡ 40-50% faster response time (8s → 4-5s)
- 💰 40% cost reduction (4 LLM calls → 2-3 calls)
- 📦 60% less code (398 lines → ~150 lines)
- 🛡️ Better error handling (built-in retries)
- 🧪 Easier testing (isolated agents)

**Risk Level:** MEDIUM (sales workflow is business-critical)

---

## 🏗️ System Architecture

### Current Architecture (Manual Orchestration)
```
User Message
  ↓
detectIntent() [LLM call #1]
  ↓
handleSalesChat()
  ├─→ extractFields() [LLM call #2]
  ├─→ generateText(salesPrompt) [LLM call #3]
  ├─→ extractFields() again [LLM call #4]
  ├─→ validateFields() [LLM call #5]
  └─→ sendEmail() [API call]
```

**Issues:**
- ❌ extractFields called TWICE (redundant)
- ❌ No parallelization opportunities
- ❌ Complex state management (manual)
- ❌ Hard to test (monolithic)

### Target Architecture (Agent-Based)
```
User Message
  ↓
Router Agent [LLM call #1] → Detects "sales" intent
  ↓
Field Extractor Agent (pre-processing) [LLM call #2]
  ↓ (returns: { name, email, projectType, budget, timeline })
  ↓
Sales Agent [LLM call #3]
  ├─→ Has current field status in context
  ├─→ Asks for missing fields OR
  └─→ Calls validateAndSendEmail tool
      ├─→ Validates fields (sync, no LLM)
      └─→ Sends email if valid
```

**Total: 3 LLM calls (vs 5 currently)**

---

## 🧩 Component Breakdown

### 1. Field Extractor Agent
**Purpose:** Extract customer data from conversation history
**Model:** `llama-3.3-70b-versatile`
**Input:** Conversation messages
**Output:** `SalesFields` object
**Responsibility:** Steven (Mission 1A)

### 2. Sales Agent
**Purpose:** Converse with customer, collect missing info, trigger email
**Model:** `moonshotai/kimi-k2-instruct-0905`
**Tools:** `validateAndSendEmail`
**Responsibility:** Codex (Mission 1B)

### 3. Validator Tool (not an agent)
**Purpose:** Validate field quality (email format, etc.)
**Type:** Regular TypeScript function
**Responsibility:** Both (refactor existing)

### 4. Email Service
**Purpose:** Send structured sales inquiry email
**Type:** API call wrapper
**Responsibility:** Both (already exists in `email-utils.ts`)

---

## 📅 Phase Breakdown

### Phase 1: Foundation (Days 1-2) - PARALLEL WORK
**Goal:** Set up infrastructure and refactor existing code

**Mission 1A (Steven):** Agent Infrastructure
- Create `app/lib/ai/agents/` folder structure
- Create `types.ts` with shared interfaces
- Create `field-extractor-agent.ts`
- Write unit tests for extractor

**Mission 1B (Codex):** Sales Agent Core
- Create `sales-agent.ts` with Agent class
- Implement `validateAndSendEmail` tool
- Integrate with existing email service
- Write unit tests for sales agent

**Deliverables:**
- ✅ `app/lib/ai/agents/types.ts`
- ✅ `app/lib/ai/agents/field-extractor-agent.ts`
- ✅ `app/lib/ai/agents/sales-agent.ts`
- ✅ Unit tests for both

---

### Phase 2: Integration (Days 3-4) - PARALLEL WORK
**Goal:** Connect agents and create new API endpoint

**Mission 2A (Steven):** New API Route
- Create `app/api/chat-v2/route.ts` (new endpoint)
- Integrate Field Extractor Agent
- Integrate Sales Agent
- Handle errors and edge cases
- E2E tests

**Mission 2B (Codex):** Performance & Monitoring
- Add telemetry logging (latency, token count)
- Create performance comparison script
- Set up A/B testing infrastructure (feature flag)
- Load testing with realistic scenarios

**Deliverables:**
- ✅ `app/api/chat-v2/route.ts` (working endpoint)
- ✅ Performance monitoring in place
- ✅ A/B testing ready

---

### Phase 3: Testing & Comparison (Day 5) - PARALLEL WORK
**Goal:** Validate new implementation matches/exceeds old one

**Mission 3A (Steven):** Functional Testing
- Test all sales scenarios (happy path + edge cases)
- Test language detection (ES/EN/FR/DE)
- Test email sending
- Test validation failures
- Document any discrepancies

**Mission 3B (Codex):** Performance Testing
- Run load tests (100 concurrent users)
- Compare latency (old vs new)
- Compare cost (API calls, tokens)
- Compare error rates
- Generate comparison report

**Deliverables:**
- ✅ Test coverage report (>90%)
- ✅ Performance comparison report
- ✅ Go/No-Go recommendation

---

### Phase 4: Gradual Rollout (Day 6) - BOTH DEVS
**Goal:** Safely migrate production traffic

**Steps:**
1. Deploy with 0% traffic to new endpoint (warm-up)
2. 10% traffic → Monitor 4 hours
3. 25% traffic → Monitor 8 hours
4. 50% traffic → Monitor 24 hours
5. 100% traffic → Monitor 48 hours
6. Deprecate old `/api/chat` sales logic

**Rollback Plan:**
- Feature flag to instantly switch back
- Old implementation stays in codebase for 2 weeks
- Automated alerts for error rate spikes

---

## 📋 Development Methodology

### Branch Strategy
- **Single branch:** `feature/sales-agent-migration`
- **No sub-branches** - all commits go directly to feature branch
- **Frequent commits:** Every 30-60 minutes
- **Clear commit format:** `[Mission 1A] Create agent base types`

### Commit Message Format
```
[Mission ID] Brief description

- Detail 1
- Detail 2

Affects: <file paths>
```

Example:
```
[Mission 1A] Create Field Extractor Agent

- Implement Agent class with Vercel AI SDK
- Add extractFields method with proper typing
- Include error handling for malformed JSON

Affects: app/lib/ai/agents/field-extractor-agent.ts
```

### Code Review Protocol
- **No PRs during development** (working on same branch)
- **Daily sync calls** (morning standup)
- **Pair review before committing critical code**
- **Final PR** only at end of Phase 3

### Communication
- **Daily standup:** 9:00 AM (15 min max)
- **Blockers:** Post in `#sales-agent-migration` Slack channel immediately
- **Questions:** Tag @ProductOwner in Slack
- **End of day:** Post progress update with mission status

### Testing Requirements
- **Unit tests required** for all new functions
- **Integration tests required** for agents
- **E2E tests required** for API routes
- **Coverage target:** >90%

### Pull/Push Cadence
```bash
# Every 2 hours
git pull origin feature/sales-agent-migration --rebase
# Resolve conflicts if any
git push origin feature/sales-agent-migration
```

---

## 🎯 Success Criteria

**Must Have:**
- ✅ All sales scenarios work correctly
- ✅ Response time < 6 seconds (p95)
- ✅ Error rate < 1%
- ✅ Email delivery rate > 99%
- ✅ Test coverage > 90%

**Nice to Have:**
- ⭐ Response time < 5 seconds (p95)
- ⭐ API cost 40% lower
- ⭐ Code <150 lines

**Blockers (No Go):**
- ❌ Any sales scenario broken
- ❌ Error rate > 2%
- ❌ Email delivery < 95%

---

## 🚨 Risk Mitigation

### Risk 1: Data Loss (email not sent)
**Mitigation:**
- Extensive logging before/after email sending
- Retry logic with exponential backoff
- Dead letter queue for failed emails

### Risk 2: Breaking Changes
**Mitigation:**
- Keep old implementation intact
- A/B testing with gradual rollout
- Instant rollback capability

### Risk 3: Performance Regression
**Mitigation:**
- Load testing before production
- Performance monitoring in place
- Automatic alerts for latency spikes

### Risk 4: Merge Conflicts
**Mitigation:**
- Work on clearly separated files
- Pull/rebase every 2 hours
- Communication about file changes

---

## 📞 Escalation Path

**Technical Issues:**
1. Try to solve with pair programming
2. Post in Slack with `@ProductOwner`
3. Schedule emergency call if blocking >2 hours

**Architectural Questions:**
1. Post question in Slack thread
2. Product Owner responds within 1 hour
3. If urgent: DM Product Owner

**Production Issues:**
1. Rollback immediately (feature flag)
2. Post in `#incidents` channel
3. Investigate root cause
4. Fix and redeploy

---

## 📚 Resources

**Vercel AI SDK Docs:**
- [Agents Overview](https://sdk.vercel.ai/docs/agents/overview)
- [Building Agents](https://sdk.vercel.ai/docs/agents/building-agents)
- [Workflow Patterns](https://sdk.vercel.ai/docs/agents/workflows)

**Current Implementation:**
- `app/api/chat/route.ts` (lines 233-338: handleSalesChat)
- `app/lib/ai/prompts/sales.txt`
- `app/lib/ai/prompts/extractor.txt`
- `app/lib/ai/prompts/validator.txt`

**Internal Docs:**
- `ai_migration.md` (migration analysis)
- `CLAUDE.md` (project context)

---

**Next Steps:** See individual mission briefings
- `MISSION_STEVEN_1A.md`
- `MISSION_CODEX_1B.md`
