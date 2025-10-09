# 🎯 MISSION 2A: New API Route Integration

**Developer:** Steven
**Phase:** 2 (Integration)
**Duration:** 1 day
**Parallel Work:** Codex is working on Mission 2B (Performance & Monitoring)
**Branch:** `feature/sales-agent-migration` (shared)

---

## 📋 Context

**What You Built (Phase 1):**
- ✅ `types.ts` - Shared interfaces
- ✅ `field-extractor-agent.ts` - Extracts customer data
- ✅ Tests + documentation

**What Codex Built (Phase 1):**
- ✅ `sales-agent.ts` - Converses with customers
- ✅ `email-tool.ts` - Validates and sends email

**Your Mission Now:**
Create a new API route that uses both agents to handle sales conversations.

---

## 🎯 Task: Create `/api/chat-v2/route.ts`

**Purpose:** New endpoint that replaces the old manual sales workflow with agent-based workflow.

**Flow:**
```
User message
  ↓
1. Detect intent (sales vs casual) - reuse existing detectIntent()
  ↓
2. If sales:
   - Use Field Extractor Agent to get current fields
   - Use Sales Agent to generate response
   - Return response + emailSent status
```

### Implementation

**File:** `app/api/chat-v2/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fieldExtractorAgent } from '@/app/lib/ai/agents/field-extractor-agent';
import { createSalesAgent } from '@/app/lib/ai/agents/sales-agent';
import type { Message } from '@/app/lib/ai/agents/types';

// Reuse detectIntent from old route (or copy it here)
async function detectIntent(userMessage: string, conversationHistory: Message[]): Promise<'sales' | 'casual'> {
  // Copy from app/api/chat/route.ts lines 117-137
  // Or import if you refactor it
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array required' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const conversationHistory = messages.slice(0, -1);

    // Detect intent
    const intent = await detectIntent(lastMessage.content, conversationHistory);

    if (intent === 'casual') {
      // Keep using old casual handler for now
      // TODO: Phase 3 - migrate casual to agent too
      return NextResponse.json({
        message: "Casual mode not implemented yet in v2",
        emailSent: false
      });
    }

    // Sales workflow with agents
    console.log('[chat-v2] Sales intent detected, using agents');

    // Step 1: Extract current fields
    const extraction = await fieldExtractorAgent.extract(messages);
    console.log('[chat-v2] Extracted fields:', extraction.fields);

    // Step 2: Detect language (simple heuristic)
    const lastUserMessage = lastMessage.content.toLowerCase();
    let language: 'es' | 'en' | 'fr' | 'de' = 'en';
    if (/\b(hola|gracias|quiero)\b/.test(lastUserMessage)) language = 'es';
    else if (/\b(merci|bonjour|oui)\b/.test(lastUserMessage)) language = 'fr';
    else if (/\b(danke|hallo|ja)\b/.test(lastUserMessage)) language = 'de';

    // Step 3: Create sales agent with current state
    const salesAgent = createSalesAgent({
      currentFields: extraction.fields,
      language
    });

    // Step 4: Generate response
    const result = await salesAgent.generate(messages);

    // Step 5: Check if email was sent
    const emailSent = result.steps.some((step: any) =>
      step.toolCalls?.some((call: any) =>
        call.toolName === 'validateAndSendEmail' && call.result?.sent === true
      )
    );

    console.log('[chat-v2] Response generated, emailSent:', emailSent);

    return NextResponse.json({
      message: result.text,
      emailSent,
      // Debug info (remove in production)
      debug: {
        intent,
        extractedFields: extraction.fields,
        confidence: extraction.confidence,
        language
      }
    });

  } catch (error) {
    console.error('[chat-v2] Error:', error);
    return NextResponse.json(
      {
        message: "Sorry, something went wrong. Can you repeat that?",
        emailSent: false
      },
      { status: 500 }
    );
  }
}
```

---

## ✅ Definition of Done

- [ ] `app/api/chat-v2/route.ts` created
- [ ] Uses Field Extractor Agent
- [ ] Uses Sales Agent
- [ ] Detects language (ES/EN/FR/DE)
- [ ] Returns same format as old API: `{ message, emailSent }`
- [ ] Error handling with try/catch
- [ ] Logging for debugging
- [ ] Tested manually with curl or Postman
- [ ] No TypeScript errors
- [ ] Committed with proper message format

---

## 🧪 How to Test

### Manual Test with curl

```bash
curl -X POST http://localhost:3001/api/chat-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I want to build a website"}
    ]
  }'
```

Expected response:
```json
{
  "message": "Great! What's your name?",
  "emailSent": false,
  "debug": {
    "intent": "sales",
    "extractedFields": { "name": null, "email": null, ... },
    "confidence": 20,
    "language": "en"
  }
}
```

### Test Full Workflow

```bash
# Turn 1: Provide name
curl -X POST http://localhost:3001/api/chat-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I want a website"},
      {"role": "assistant", "content": "Great! What is your name?"},
      {"role": "user", "content": "John Doe"}
    ]
  }'

# Turn 2: Provide email
# ... continue until all fields collected

# Final turn should have emailSent: true
```

---

## 🚨 Edge Cases to Handle

1. **Empty messages array** → Return 400 error
2. **Field extraction fails** → All fields null, agent asks for everything
3. **Sales agent throws error** → Catch and return 500 with friendly message
4. **Email sending fails** → Agent returns `sent: false`, explain to user

---

## 📝 Commit Message Format

```
[Mission 2A] Create chat-v2 API route with agent integration

- Create new /api/chat-v2 endpoint
- Integrate Field Extractor Agent
- Integrate Sales Agent
- Add language detection (ES/EN/FR/DE)
- Add error handling and logging
- Tested manually with curl

Affects: app/api/chat-v2/route.ts
```

---

## 🔄 After This Mission

Once done:
- Codex will add telemetry to your route
- Phase 3: Full testing (both of you)
- Phase 4: Gradual rollout to production

---

**Questions?** Check `SALES_AGENT_MIGRATION_PLAN.md` or ask in Slack.

**Ready? Go build it! 🚀**
