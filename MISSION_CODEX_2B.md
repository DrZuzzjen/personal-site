# 🎯 MISSION 2B: Performance & Monitoring

**Developer:** Codex
**Phase:** 2 (Integration)
**Duration:** 1 day
**Parallel Work:** Steven is working on Mission 2A (API Route)
**Branch:** `feature/sales-agent-migration` (shared)

---

## 📋 Context

**What You Built (Phase 1):**
- ✅ `sales-agent.ts` - Sales conversation agent
- ✅ `email-tool.ts` - Email validation & sending tool
- ✅ Tests

**What Steven Built (Phase 1):**
- ✅ `field-extractor-agent.ts` - Data extraction agent
- ✅ Tests + docs

**What Steven is Building Now (Mission 2A):**
- New `/api/chat-v2` endpoint that uses both agents

**Your Mission:**
Add performance monitoring and comparison tools so we can measure if the new system is actually faster/better.

---

## 🎯 Tasks

### Task 1: Add Telemetry Logging

**File:** `app/lib/telemetry.ts` (create this)

Track:
- API response time
- LLM token usage
- Number of agent steps
- Email success/failure rate

```typescript
export interface TelemetryEvent {
  timestamp: string;
  endpoint: '/api/chat' | '/api/chat-v2';
  intent: 'sales' | 'casual';
  latencyMs: number;
  tokensUsed?: number;
  agentSteps?: number;
  emailSent: boolean;
  error?: string;
}

class Telemetry {
  private events: TelemetryEvent[] = [];

  log(event: TelemetryEvent) {
    this.events.push(event);
    console.log('[Telemetry]', event);

    // Optional: Send to analytics service
    // await fetch('https://analytics.example.com', { method: 'POST', body: JSON.stringify(event) });
  }

  getStats() {
    return {
      totalCalls: this.events.length,
      avgLatency: this.events.reduce((sum, e) => sum + e.latencyMs, 0) / this.events.length,
      emailSuccessRate: this.events.filter(e => e.emailSent).length / this.events.filter(e => e.intent === 'sales').length,
      errorRate: this.events.filter(e => e.error).length / this.events.length
    };
  }

  clear() {
    this.events = [];
  }
}

export const telemetry = new Telemetry();
```

**Usage in Steven's route:**

```typescript
// At start of POST handler
const startTime = Date.now();

// At end (success)
telemetry.log({
  timestamp: new Date().toISOString(),
  endpoint: '/api/chat-v2',
  intent: 'sales',
  latencyMs: Date.now() - startTime,
  tokensUsed: result.usage?.totalTokens,
  agentSteps: result.steps.length,
  emailSent: emailSent
});

// At end (error)
telemetry.log({
  timestamp: new Date().toISOString(),
  endpoint: '/api/chat-v2',
  intent: 'sales',
  latencyMs: Date.now() - startTime,
  emailSent: false,
  error: error.message
});
```

---

### Task 2: Performance Comparison Script

**File:** `scripts/compare-performance.ts` (create folder if needed)

```typescript
/**
 * Compare old API vs new API performance
 *
 * Usage: npx tsx scripts/compare-performance.ts
 */

const testScenarios = [
  {
    name: 'Full sales workflow (5 turns)',
    messages: [
      [{ role: 'user', content: 'I want a website' }],
      [
        { role: 'user', content: 'I want a website' },
        { role: 'assistant', content: 'Great! What is your name?' },
        { role: 'user', content: 'John Doe' }
      ],
      // ... continue for 5 turns
    ]
  },
  {
    name: 'Quick inquiry (all info at once)',
    messages: [
      [{ role: 'user', content: 'Hi I am Jane Smith, jane@example.com, need an e-commerce site, budget 10k, timeline 2 months' }]
    ]
  }
];

async function testEndpoint(endpoint: string, messages: any[]) {
  const start = Date.now();

  const response = await fetch(`http://localhost:3001${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });

  const latency = Date.now() - start;
  const data = await response.json();

  return { latency, data };
}

async function runComparison() {
  console.log('🔥 Performance Comparison: Old vs New\n');

  for (const scenario of testScenarios) {
    console.log(`📊 Scenario: ${scenario.name}`);

    // Test old API
    const oldResults = [];
    for (const msgs of scenario.messages) {
      const result = await testEndpoint('/api/chat', msgs);
      oldResults.push(result);
    }

    // Test new API
    const newResults = [];
    for (const msgs of scenario.messages) {
      const result = await testEndpoint('/api/chat-v2', msgs);
      newResults.push(result);
    }

    const oldAvg = oldResults.reduce((sum, r) => sum + r.latency, 0) / oldResults.length;
    const newAvg = newResults.reduce((sum, r) => sum + r.latency, 0) / newResults.length;
    const improvement = ((oldAvg - newAvg) / oldAvg * 100).toFixed(1);

    console.log(`  Old API: ${oldAvg.toFixed(0)}ms avg`);
    console.log(`  New API: ${newAvg.toFixed(0)}ms avg`);
    console.log(`  Improvement: ${improvement}% ${improvement > 0 ? '✅' : '❌'}\n`);
  }
}

runComparison().catch(console.error);
```

**Add script to package.json:**
```json
"scripts": {
  "compare": "tsx scripts/compare-performance.ts"
}
```

Install tsx: `npm install --save-dev tsx`

---

### Task 3: A/B Testing Feature Flag

**File:** `app/lib/feature-flags.ts` (create this)

```typescript
/**
 * Feature flags for gradual rollout
 */

export interface FeatureFlags {
  useAgentBasedSales: boolean; // true = /api/chat-v2, false = /api/chat (old)
  agentRolloutPercentage: number; // 0-100
}

// Simple in-memory flags (production would use Redis/LaunchDarkly)
let flags: FeatureFlags = {
  useAgentBasedSales: false, // Start with 0%
  agentRolloutPercentage: 0
};

export function getFeatureFlags(): FeatureFlags {
  return { ...flags };
}

export function setFeatureFlags(newFlags: Partial<FeatureFlags>) {
  flags = { ...flags, ...newFlags };
  console.log('[FeatureFlags] Updated:', flags);
}

export function shouldUseAgentBasedSales(): boolean {
  if (!flags.useAgentBasedSales) return false;

  // Random percentage rollout
  return Math.random() * 100 < flags.agentRolloutPercentage;
}
```

**Usage in main API route** (for Phase 4 rollout):

```typescript
// In app/api/chat/route.ts
import { shouldUseAgentBasedSales } from '@/app/lib/feature-flags';

export async function POST(request: NextRequest) {
  // Route to new or old implementation
  if (shouldUseAgentBasedSales()) {
    // Forward to chat-v2
    return fetch(`${request.nextUrl.origin}/api/chat-v2`, {
      method: 'POST',
      body: JSON.stringify(await request.json())
    });
  }

  // Old implementation
  // ... existing code
}
```

---

## ✅ Definition of Done

**Task 1: Telemetry**
- [ ] `app/lib/telemetry.ts` created
- [ ] Logs: latency, tokens, steps, emailSent, errors
- [ ] Steven integrates it in `/api/chat-v2`
- [ ] Can view stats with `telemetry.getStats()`

**Task 2: Comparison Script**
- [ ] `scripts/compare-performance.ts` created
- [ ] Tests 2+ scenarios
- [ ] Compares old vs new API
- [ ] Shows improvement percentage
- [ ] Can run with `npm run compare`

**Task 3: Feature Flags**
- [ ] `app/lib/feature-flags.ts` created
- [ ] Can toggle agent-based sales on/off
- [ ] Can set rollout percentage (0-100%)
- [ ] Includes `shouldUseAgentBasedSales()` helper

**General:**
- [ ] All TypeScript errors fixed
- [ ] Code committed with proper messages
- [ ] Documented how to use each tool

---

## 🧪 How to Test

### Test Telemetry
```typescript
// In your code
import { telemetry } from '@/app/lib/telemetry';

// After some API calls
console.log(telemetry.getStats());
// { totalCalls: 10, avgLatency: 1250, emailSuccessRate: 0.8, errorRate: 0.1 }
```

### Test Comparison Script
```bash
# Start dev server first
npm run dev

# In another terminal
npm run compare
```

### Test Feature Flags
```typescript
import { setFeatureFlags, shouldUseAgentBasedSales } from '@/app/lib/feature-flags';

// Enable 50% rollout
setFeatureFlags({ useAgentBasedSales: true, agentRolloutPercentage: 50 });

// Test 100 times
const results = Array(100).fill(0).map(() => shouldUseAgentBasedSales());
console.log('Agent-based:', results.filter(Boolean).length); // ~50
```

---

## 📝 Commit Messages

```
[Mission 2B] Add telemetry logging system

- Create telemetry.ts with event tracking
- Track latency, tokens, steps, errors
- Export singleton for easy import

Affects: app/lib/telemetry.ts
```

```
[Mission 2B] Add performance comparison script

- Create compare-performance.ts
- Test old vs new API with scenarios
- Calculate improvement percentage
- Add npm run compare script

Affects: scripts/compare-performance.ts, package.json
```

```
[Mission 2B] Add feature flags for A/B testing

- Create feature-flags.ts
- Enable/disable agent-based sales
- Support percentage rollout (0-100%)
- Add shouldUseAgentBasedSales() helper

Affects: app/lib/feature-flags.ts
```

---

## 🔄 After This Mission

- Steven's API route will use your telemetry
- Phase 3: Run your comparison script to validate improvements
- Phase 4: Use feature flags for gradual production rollout

---

**Questions?** Check `SALES_AGENT_MIGRATION_PLAN.md` or ask in Slack.

**Ready? Let's build the monitoring! 📊**
