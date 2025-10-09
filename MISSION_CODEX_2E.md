# Mission 2E: Performance Investigation & Optimization

## Problem Statement
The new agent-based system (`/api/chat-v2`) is **15x slower** than the old system:
- **Old system**: ~3 seconds per request
- **New system**: 45 seconds per request (45305ms)
- **Token usage**: 2544 tokens in 5 agent steps

This will fail on Vercel due to timeout limits and cost concerns.

## Evidence from Testing

### Test Scenario
User typed: "I want a website" → provided name, email, project type

### Performance Logs
```
[Telemetry] {
  "endpoint": "/api/chat-v2",
  "intent": "sales",
  "latencyMs": 45305,  // 45 SECONDS!!!
  "tokensUsed": 2544,
  "agentSteps": 5,
  "emailSent": false
}
POST /api/chat-v2 200 in 45637ms
```

### Comparison with Old System
From your previous performance testing:
```
Old system (/api/chat):
- Full sales workflow: 2335 ms
- Quick inquiry: 2694 ms

New system (/api/chat-v2):
- Full sales workflow: 45305 ms (19x SLOWER!)
```

## Hypothesis: Root Causes

### 1. Field Extractor Running on Every Message
The Field Extractor Agent might be analyzing the ENTIRE conversation history on every message, even when fields are already extracted.

**Check this:**
```typescript
// In route.ts
const extraction = await fieldExtractorAgent.extract(messages);
```

Is this running even when we already have all 3 required fields? If yes, this is wasteful.

### 2. Agent Making Too Many Steps
5 agent steps for a simple field collection seems excessive. The old system was optimized for incremental collection.

**Check this:**
- How many LLM calls per step?
- What is each step doing?
- Are steps waiting for each other unnecessarily?

### 3. No Caching or Memoization
Each request re-processes the entire conversation from scratch. The old system might have had some optimization here.

### 4. Possible localStorage Loop (User's Observation)
User mentioned: "I think the problem is how the 'user' is constructed from localStorage or something like that, then a loop process from somewhere"

**Check this:**
- Is there a loop reading/writing to localStorage on every message?
- Is the frontend re-sending the entire history multiple times?
- Are there duplicate API calls happening?

## Your Tasks

### Task 1: Add Detailed Performance Logging
Add timestamps and logging to identify bottlenecks in [route.ts](app/api/chat-v2/route.ts):

```typescript
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[PERF] Request started');

  try {
    const { messages } = await request.json();
    console.log('[PERF] Messages parsed:', Date.now() - startTime, 'ms');

    // Intent detection
    const intentStart = Date.now();
    const intent = await detectIntent(lastMessage.content, conversationHistory);
    console.log('[PERF] Intent detected:', Date.now() - intentStart, 'ms');

    // Field extraction
    const extractStart = Date.now();
    const extraction = await fieldExtractorAgent.extract(messages);
    console.log('[PERF] Fields extracted:', Date.now() - extractStart, 'ms');
    console.log('[PERF] Extracted fields:', extraction.fields);

    // Sales agent
    const salesStart = Date.now();
    const salesAgent = createSalesAgent({ currentFields: extraction.fields });
    const result = await salesAgent.generate(messages);
    console.log('[PERF] Sales agent completed:', Date.now() - salesStart, 'ms');
    console.log('[PERF] Agent steps:', result.steps.length);
    console.log('[PERF] Total tokens:', result.usage?.totalTokens);

    // ... rest of code
  }
}
```

### Task 2: Investigate Field Extractor Efficiency
Check if [field-extractor-agent.ts](app/lib/ai/agents/field-extractor-agent.ts) is doing unnecessary work:

**Questions to answer:**
1. Does it re-analyze the entire conversation history every time?
2. Can we short-circuit if we already have all 3 required fields?
3. Is the prompt too complex, causing slow LLM responses?

**Potential optimization:**
```typescript
async extract(conversationHistory: Message[]): Promise<ExtractionResult> {
  // Quick check: if last extraction was complete and recent, skip re-extraction
  if (this.cachedExtraction && this.cachedExtraction.confidence > 90) {
    console.log('[FieldExtractor] Using cached extraction');
    return this.cachedExtraction;
  }

  // Otherwise, proceed with extraction
  // ...
}
```

### Task 3: Analyze Agent Step Count
The sales agent took 5 steps for a simple conversation. Each step = 1+ LLM calls.

**Questions to answer:**
1. What is each step doing? (Log the step contents)
2. Are there unnecessary back-and-forth loops?
3. Can we reduce the conversation to 2-3 steps maximum?

Add logging:
```typescript
result.steps.forEach((step: any, index: number) => {
  console.log(`[PERF] Step ${index + 1}:`, {
    toolCalls: step.toolCalls?.map((c: any) => c.toolName),
    hasText: !!step.text,
    textLength: step.text?.length
  });
});
```

### Task 4: Check for localStorage Loop Issue
User suspects a loop related to localStorage. Check [Chatbot.tsx](app/components/Apps/Chatbot/Chatbot.tsx):

**Questions to answer:**
1. Is `localStorage.getItem('chatbot-history')` being called repeatedly?
2. Is there a React effect causing re-renders that trigger API calls?
3. Are we accidentally making duplicate fetch requests?

Add logging in Chatbot.tsx:
```typescript
const sendMessage = async (content: string) => {
  console.log('[Chatbot] sendMessage called, messages count:', messages.length);
  console.log('[Chatbot] Sending to API:', content);

  const res = await fetch('/api/chat-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [...messages, newMessage] }),
  });

  console.log('[Chatbot] API response received');
};
```

### Task 5: Compare Old vs New System Architecture
Review the old `/api/chat` endpoint (commit 904b4cc) and document:

**What made the old system fast?**
1. Did it skip field extraction after first pass?
2. Did it use a simpler prompt structure?
3. Did it have fewer LLM calls per request?

Create a comparison document showing the difference in architecture.

## Deliverables

1. **Performance Report**: Detailed breakdown of where the 45 seconds is spent
2. **Optimization Recommendations**: Specific code changes to reduce latency to <5 seconds
3. **Comparison Analysis**: Why old system was faster and what we can learn from it
4. **Code Changes**: Implement the top 3 optimizations

## Success Criteria
- [ ] Identify which operation takes the most time (intent, extraction, or agent generation)
- [ ] Reduce latency from 45s to under 5s
- [ ] Reduce token usage by at least 30%
- [ ] Maintain the same functionality (email sending, field collection)
- [ ] Document all findings in a PERFORMANCE_ANALYSIS.md file

## Priority
**HIGH** - This blocks Vercel deployment. We need to fix this before Phase 3 testing.

## Notes
- Focus on measurement first, optimization second
- Don't break existing functionality while optimizing
- If architecture is fundamentally flawed, recommend a redesign approach
