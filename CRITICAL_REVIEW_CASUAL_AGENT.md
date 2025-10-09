# CRITICAL REVIEW: Casual Agent Migration

## Executive Summary

Steven migrated casual chat to Agent pattern after fixing 4 major bugs caused by the initial `generateText()` implementation. While the Agent pattern is the CORRECT approach, the current implementation has **5 critical architectural issues** that need to be fixed.

---

## Bug History: What Went Wrong

### My Initial Mistake
In **MISSION_CODEX_3A.md**, I recommended Option A (keep casual as `generateText()` + tools) thinking it would be "faster and simpler." This was **WRONG**.

### Cascade of Bugs (All Caused by generateText())

**Commit 7cb3101** - "Listo!" stuck response
- Tool execution returned undefined
- System fell back to hardcoded "Listo!" instead of AI response

**Commit 5269bf1** - Accidental app opening
- User said "muy bueno" (compliment) → Portfolio opened
- AI couldn't distinguish compliments from commands

**Commit 492dbf2** - Function syntax bleeding
- Messages showed: `"Genial! 😃 <function=openApp>{\"appName\": \"paint\"}"`
- Tool execution wasn't separated from text response

**Commit 097d7c2** - AI writing function syntax
- AI typed `"<function=open> 🙂"` instead of calling tool
- Had to add explicit prompt instructions: "NEVER write function syntax"

**Commit ac298d4** - Agent migration (current)
- Replaced `generateText()` with Agent class
- Fixed tool execution bleeding
- **But introduced new architectural issues (see below)**

---

## Critical Issues in Current Implementation

### 🚨 ISSUE #1: Global Singleton Agent (CRITICAL)

**Current Code:**
```typescript
// Lines 40-84: Global agent created at module load
const casualAgent = new Agent({
  model: groq(process.env.GROQ_CASUAL_MODEL || 'llama-3.3-70b-versatile'),
  system: PROMPTS.CASUAL_CHAT(), // Static prompt
  temperature: 0.8,
  stopWhen: stepCountIs(3),
  tools: { openApp, closeApp, restart }
});

// Line 92: All requests use the SAME agent instance
const result = await casualAgent.generate({
  messages: [...]
});
```

**Compare to SalesAgent (CORRECT):**
```typescript
// Line 17: NEW instance created PER REQUEST
constructor(config: SalesAgentConfig) {
  const { currentFields } = config;
  const fieldStatus = this.formatFieldStatus(currentFields);
  const systemPrompt = this.buildSystemPrompt(fieldStatus); // Dynamic prompt

  this.agent = new Agent({
    system: systemPrompt, // Changes per request
    //...
  });
}

// In route.ts
const salesAgent = createSalesAgent({
  currentFields: extraction.fields // Fresh context
});
```

**Why This Matters:**

| Aspect | CasualAgent (Wrong) | SalesAgent (Correct) |
|--------|---------------------|----------------------|
| Instance creation | Once at module load | Per request |
| System prompt | Static | Dynamic (includes field status) |
| Context injection | Impossible | Easy (browser info, user state) |
| Memory management | Shared state across users | Isolated per request |
| Personalization | None | Full |

**Consequences:**
- ❌ Cannot inject browser context (language, timezone, returning visitor)
- ❌ Cannot personalize prompt per user
- ❌ Potential memory leaks from shared state
- ❌ All users share same agent instance (not isolated)

**Fix Required:**
Create `CasualAgent` class in `app/lib/ai/agents/casual-agent.ts`:
```typescript
export class CasualAgent {
  private readonly agent: Agent;

  constructor() {
    const systemPrompt = PROMPTS.CASUAL_CHAT();

    this.agent = new Agent({
      model: groq(process.env.GROQ_CASUAL_MODEL || 'llama-3.3-70b-versatile'),
      system: systemPrompt,
      temperature: 0.8,
      tools: { ... },
      stopWhen: ({ steps }) => {
        const hasToolCall = steps.some(s => s.toolCalls?.length > 0);
        return hasToolCall || steps.length >= 2;
      }
    });
  }

  async generate(messages: Message[]) {
    // Trim history like SalesAgent
    const trimmedHistory = messages
      .filter(m => m.role !== 'system')
      .slice(-12);

    return this.agent.generate({ messages: trimmedHistory });
  }
}
```

Then in `route.ts`:
```typescript
async function handleCasualChat(...) {
  const casualAgent = new CasualAgent(); // NEW instance per request
  const result = await casualAgent.generate([...conversationHistory, { role: 'user', content: userMessage }]);
  // ...
}
```

---

### 🚨 ISSUE #2: No Conversation History Trimming

**Current Code (Line 92-96):**
```typescript
const result = await casualAgent.generate({
  messages: [
    ...conversationHistory, // ALL history, no limit
    { role: 'user', content: userMessage }
  ]
});
```

**SalesAgent (Line 66-74):**
```typescript
const toolHistory = messages
  .filter(message => message.role !== 'system')
  .map(message => ({
    role: message.role,
    content: message.content.length > 500
      ? message.content.slice(-500)  // Trim long messages
      : message.content,
  }))
  .slice(-12); // Only last 12 messages
```

**Consequences:**
- ❌ Long conversations = huge token usage
- ❌ Slower response times as conversation grows
- ❌ Potential context window overflow
- ❌ Cost explosion for long chats

**Fix Required:**
Add trimming in CasualAgent.generate() (see Issue #1 fix above).

---

### 🚨 ISSUE #3: Arbitrary stepCountIs(3)

**Current Code (Line 44):**
```typescript
stopWhen: stepCountIs(3) // Why 3?
```

**Problems:**
- What if user says "hi"? → No tools needed, but agent runs 3 steps anyway
- What if user says "open paint and minesweeper"? → Needs 2 tool calls, but stops at 3 steps (might work, might not)
- Hard limit doesn't adapt to actual need

**SalesAgent (Line 30-53) - Smart Stopping:**
```typescript
stopWhen: ({ steps }) => {
  // Stop when specific condition met
  const emailSent = steps.some(step =>
    step.toolCalls?.some(call =>
      call.toolName === 'validateAndSendEmail' &&
      call.result?.sent === true
    )
  );

  if (emailSent) {
    console.log('[SalesAgent] Email sent successfully, stopping agent');
    return true;
  }

  // Safety limit
  if (steps.length >= 10) {
    console.log('[SalesAgent] Max steps reached');
    return true;
  }

  return false;
},
```

**Fix Required:**
```typescript
stopWhen: ({ steps }) => {
  // Stop after first tool call OR after 2 conversational turns
  const hasToolCall = steps.some(s => s.toolCalls && s.toolCalls.length > 0);

  if (hasToolCall) {
    console.log('[CasualAgent] Tool executed, stopping');
    return true;
  }

  // For pure conversation, stop after 2 steps
  if (steps.length >= 2) {
    console.log('[CasualAgent] Conversation complete, stopping');
    return true;
  }

  return false;
}
```

---

### 🚨 ISSUE #4: No Error Handling in Action Extraction

**Current Code (Line 100-125):**
```typescript
const actions: Action[] = [];
for (const step of result.steps) {  // What if result.steps is undefined?
  if (step.toolCalls) {
    for (const toolCall of step.toolCalls) {
      if (toolCall.toolName === 'openApp') {
        const input = toolCall.input as { appName: string }; // Unsafe type assertion
        if (input?.appName) {
          actions.push({
            type: 'openApp',
            appName: input.appName
          });
        }
      }
      // ... more
    }
  }
}
```

**Risks:**
- `result.steps` could be undefined → crash
- `toolCall.input` structure could change → type assertion fails silently
- No validation of `appName` value
- No try/catch for unexpected errors

**Fix Required:**
```typescript
function extractActionsFromSteps(steps: any[]): Action[] {
  const actions: Action[] = [];

  try {
    if (!steps || !Array.isArray(steps)) {
      console.warn('[CasualAgent] No steps to extract actions from');
      return actions;
    }

    for (const step of steps) {
      if (!step.toolCalls || !Array.isArray(step.toolCalls)) {
        continue;
      }

      for (const toolCall of step.toolCalls) {
        try {
          if (toolCall.toolName === 'openApp') {
            const input = toolCall.input as { appName?: string };
            if (input?.appName && typeof input.appName === 'string') {
              actions.push({
                type: 'openApp',
                appName: input.appName
              });
            }
          } else if (toolCall.toolName === 'closeApp') {
            const input = toolCall.input as { appName?: string };
            if (input?.appName && typeof input.appName === 'string') {
              actions.push({
                type: 'closeApp',
                appName: input.appName
              });
            }
          } else if (toolCall.toolName === 'restart') {
            actions.push({ type: 'restart' });
          }
        } catch (error) {
          console.error('[CasualAgent] Failed to extract action from tool call:', toolCall, error);
        }
      }
    }
  } catch (error) {
    console.error('[CasualAgent] Failed to extract actions from steps:', error);
  }

  return actions;
}

// Usage
const actions = extractActionsFromSteps(result.steps);
```

---

### ⚠️ ISSUE #5: Naive Message Extraction

**Current Code (Line 127-129):**
```typescript
return {
  message: result.text || "Hey! :) How's it going?",
  actions
};
```

**Problems:**
- `result.text` might be empty (even when conversation happened)
- `result.text` might contain multi-step reasoning artifacts
- Fallback is English-only (not multilingual)

**Better Approach:**
```typescript
// Extract the LAST conversational message from steps
let message = "Hey! :) How's it going?";

if (result.text && result.text.trim().length > 0) {
  message = result.text.trim();
} else if (result.steps && result.steps.length > 0) {
  // Find last step with text content
  for (let i = result.steps.length - 1; i >= 0; i--) {
    const step = result.steps[i];
    if (step.text && step.text.trim().length > 0) {
      message = step.text.trim();
      break;
    }
  }
}

return { message, actions };
```

---

## What Steven Did RIGHT ✅

1. ✅ **Migrated to Agent pattern** - Correct architectural decision
2. ✅ **Used tool() wrapper** - Proper Vercel AI SDK v5 pattern
3. ✅ **Separated tool execution from text** - Clean action extraction
4. ✅ **Fixed all bleeding issues** - No more function syntax in messages
5. ✅ **Kluster verification passed** - No security/quality issues detected

---

## What I Did WRONG ❌

1. ❌ **Bad recommendation in Mission 3A** - Should have insisted on Agent pattern from start
2. ❌ **Underestimated generateText() issues** - Didn't foresee tool execution bleeding
3. ❌ **Prioritized "speed" over architecture** - Led to 4 bug fix commits
4. ❌ **Didn't provide clear Agent class guidance** - Should have given Codex a template like SalesAgent

---

## Comparison: Current vs Correct Architecture

| Aspect | Current (chat-v2/route.ts) | Correct (should be) |
|--------|---------------------------|---------------------|
| **Structure** | Global singleton agent | CasualAgent class |
| **File location** | Inline in route.ts | `app/lib/ai/agents/casual-agent.ts` |
| **Instance creation** | Once at module load | Per request |
| **History trimming** | None | Last 12 messages |
| **stopWhen logic** | `stepCountIs(3)` | Smart (tool call detection) |
| **Error handling** | None | Try/catch with validation |
| **Message extraction** | `result.text` only | Smart fallback logic |
| **Consistency** | Different from SalesAgent | Matches SalesAgent pattern |

---

## Action Plan: Fix These Issues

### Priority 1: Refactor to Class Pattern
- Create `app/lib/ai/agents/casual-agent.ts`
- Move agent logic from route.ts to class
- Match SalesAgent architecture

### Priority 2: Add History Trimming
- Filter system messages
- Slice to last 12 messages
- Trim long message content

### Priority 3: Fix stopWhen Logic
- Detect tool execution
- Stop after tool call OR 2 conversational steps
- Add logging

### Priority 4: Add Error Handling
- Validate steps structure
- Try/catch in action extraction
- Type guards for input validation

### Priority 5: Improve Message Extraction
- Check result.text first
- Fall back to last step.text
- Ensure non-empty message

---

## Testing Required After Fix

1. **Casual greeting** - "Hey!" → conversational response
2. **Tool call** - "Open Paint" → Paint opens, clean message
3. **Multiple tools** - "Open Paint and Minesweeper" → both open
4. **Long conversation** - 20+ messages → still fast (trimmed history)
5. **Intent switching** - Casual → Sales → Casual (context preserved)
6. **Error scenarios** - Malformed responses, network issues

---

## Lessons Learned

### For Me (Product Owner/Architect):
1. **Trust the framework** - Vercel AI SDK designed Agent pattern for a reason
2. **Consistency matters** - All agents should use same architecture
3. **Test before recommending** - Should have prototyped both options
4. **Architecture > Performance** - Clean code beats premature optimization

### For Steven (Developer):
1. **Follow established patterns** - SalesAgent was the template
2. **Question global state** - Singletons are usually wrong in request handlers
3. **Add error handling** - Especially when traversing nested structures
4. **Match team patterns** - Consistency reduces bugs

### For Codex (Developer):
1. **Push back on bad guidance** - Should have questioned generateText() approach
2. **Reference existing code** - SalesAgent was right there as example
3. **Test incrementally** - Don't commit until tool execution works cleanly

---

## Conclusion

Steven's Agent migration was the **RIGHT direction** but has **architectural issues** that make it inconsistent with SalesAgent and less robust than it should be.

**Immediate next steps:**
1. Create CasualAgent class matching SalesAgent pattern
2. Add history trimming, smart stopWhen, error handling
3. Test thoroughly
4. Then production-ready

**Status:** ⚠️ Works but needs refactoring before production

**My responsibility:** I take full blame for the initial bad recommendation that caused this cascade of fixes. The final solution should have been Agent pattern from the start.

---

## 🚨 ISSUE #6: Sales Agent Premature Tool Call (CRITICAL REGRESSION)

**Evidence from Production Logs:**

Real conversation that triggered the bug (Spanish):
```
1. Casual chat about work → ✅ Works
2. "Vale abre el portfolio" → ✅ Portfolio opens
3. "Impresionante. Me harías uno sitio web a mi?"
   (Impressive. Would you make me a website?)
   → Router: SALES intent detected ✅
   → Field Extractor: projectType='sitio web', name=null, email=null ✅
   → Sales Agent: Calls validateAndSendEmail("unknown", "unknown", "sitio web") ❌
   → Error: 'unknown' is not valid 'email' ❌
   → User sees: "Zzzzzzz 😴 Opening Hours: not now" ❌
```

**Server Error:**
```
[chat-v2] Extracted fields: {
  name: null,
  email: null,
  projectType: 'sitio web',
  budget: null,
  timeline: null
}

Error: tool call validation failed: parameters for tool validateAndSendEmail 
did not match schema: errors: [`/email`: 'unknown' is not valid 'email']

failed_generation: "<function=validateAndSendEmail>{
  \"name\": \"unknown\",
  \"email\": \"unknown\",
  \"projectType\": \"sitio web\",
  ...
}"
```

**What SHOULD Happen:**
```
User: "Me harías uno sitio web a mi?"
Agent: "¡Perfecto! Un sitio web 😊 ¿Cómo te llamas?"
[Waits for response, does NOT call tool]
```

**Root Cause:**

The safety check added in Mission 2F (commit e507802, `sales-agent.ts:110-119`) is NOT working:

```typescript
const safetyNote = `
CRITICAL SAFETY CHECK - READ CAREFULLY:
Before calling validateAndSendEmail, verify:
1. name is NOT null and NOT "unknown" → ask "What's your name?" if missing
2. email is NOT null and NOT "unknown" → ask "What's your email?" if missing
...
If ANY of the above is null/"unknown", DO NOT call the tool.
`;
```

The LLM is **IGNORING this safety note** because:
1. It's appended at the END of a long prompt
2. Conflicting instruction at line 24: "send email immediately when you have 3 fields"
3. Field status shows `name: NOT COLLECTED` but doesn't tell agent to ASK for it
4. No concrete examples showing the correct flow

**The Fix (Triple Defense):**

### Fix 1: Update Main Prompt (`sales-agent-en.txt:24`)

Replace:
```
3. When you have name + email + projectType → send email immediately
```

With:
```
3. When you have REAL VALUES (not null, not "unknown") for name + email + projectType → send email

CRITICAL - What "have" means:
❌ null → ASK FOR IT
❌ "unknown" → ASK FOR IT  
❌ "NOT COLLECTED" → ASK FOR IT
✅ Actual value → Ready to send

EXAMPLE:
User: "Quiero un sitio web"
→ Fields: name=null, email=null, projectType='sitio web'
→ You say: "¡Perfecto! ¿Cómo te llamas?"
→ DO NOT CALL TOOL

User: "Juan"
→ Fields: name='Juan', email=null, projectType='sitio web'
→ You say: "Genial! ¿Cuál es tu email?"
→ DO NOT CALL TOOL

User: "juan@gmail.com"
→ Fields: name='Juan', email='juan@gmail.com', projectType='sitio web'
→ NOW call validateAndSendEmail ✅
```

### Fix 2: Improve Field Status Format (`sales-agent.ts:96-103`)

Change from:
```typescript
name: NOT COLLECTED
email: NOT COLLECTED
projectType: sitio web
```

To:
```typescript
private formatFieldStatus(fields: SalesFields): string {
  const hasName = fields.name && fields.name !== 'null';
  const hasEmail = fields.email && fields.email !== 'null';
  const hasProject = fields.projectType && fields.projectType !== 'null';

  return `
FIELD STATUS:
name: ${hasName ? '✅ ' + fields.name : '❌ MISSING - ASK FOR IT NOW'}
email: ${hasEmail ? '✅ ' + fields.email : '❌ MISSING - ASK FOR IT NOW'}
projectType: ${hasProject ? '✅ ' + fields.projectType : '❌ MISSING - ASK FOR IT NOW'}
budget: ${fields.budget || '(optional - can be "I don\'t know")'}
timeline: ${fields.timeline || '(optional - can be "flexible")'}

YOUR NEXT ACTION:
${!hasName ? '→ Ask: "¿Cómo te llamas?" and WAIT - DO NOT call tool' :
  !hasEmail ? '→ Ask: "¿Cuál es tu email?" and WAIT - DO NOT call tool' :
  !hasProject ? '→ Ask what they want to build and WAIT - DO NOT call tool' :
  '→ ALL REQUIRED FIELDS READY - Call validateAndSendEmail NOW'}
`;
}
```

This makes it IMPOSSIBLE to misunderstand what to do.

### Fix 3: Strengthen Tool Description (`email-tool.ts:57`)

Add to top of description:
```typescript
description: `⚠️⚠️⚠️ STOP! READ BEFORE CALLING ⚠️⚠️⚠️

ONLY call this if ALL 3 conditions are TRUE:
1. ✅ name = actual name (NOT null, NOT "unknown", NOT "NOT COLLECTED")
2. ✅ email = actual email with @ (NOT null, NOT "unknown")
3. ✅ projectType = actual project (NOT null, NOT "unknown")

IF ANY FIELD IS MISSING:
→ DO NOT CALL THIS TOOL
→ ASK CUSTOMER FOR THE FIELD
→ WAIT FOR RESPONSE

WRONG (DO NOT DO):
❌ validateAndSendEmail("unknown", "unknown", "sitio web")
❌ validateAndSendEmail(null, "user@email.com", "app")

CORRECT:
✅ validateAndSendEmail("Juan García", "juan@gmail.com", "sitio web")

Validate customer fields and send sales inquiry email to Fran...
[rest of description]
```

**Test to Verify Fix:**
```bash
# Send this exact message
curl -X POST http://localhost:3000/api/chat-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Me harías uno sitio web a mi?"}
    ]
  }'

# Expected response:
{
  "message": "¡Perfecto! Un sitio web 😊 ¿Cómo te llamas?",
  "emailSent": false
}

# Should NOT see validation error
# Should NOT call validateAndSendEmail tool yet
```

**Impact:**
- 🔥 CRITICAL - Blocks ALL sales conversions where user doesn't provide full info upfront
- 🔥 User sees error message instead of friendly name request
- 🔥 Mission 2F "fix" didn't actually work - regression from e507802

**Status:** BLOCKING PRODUCTION DEPLOYMENT
