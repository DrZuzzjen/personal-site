# Mission 2F: Fix Premature Email Tool Call

## Problem
Agent is calling `validateAndSendEmail` tool with invalid data (`"email": "unknown"`) before collecting actual customer information, causing validation errors and 500 responses.

## Evidence from Testing

### Test Input (Spanish)
```
User: "Hola amigo me intesa comprar un sitio web"
```

### What Happened
```
[chat-v2] Extracted fields: {
  name: null,
  email: null,
  projectType: 'sitio web',  // ✅ Correctly extracted
  budget: null,
  timeline: null
}

Error: tool call validation failed: parameters for tool validateAndSendEmail
did not match schema: errors: [`/email`: 'unknown' is not valid 'email']

Failed tool call:
{
  "name": "unknown",
  "email": "unknown",        // ❌ Invalid - fails Zod .email() validation
  "projectType": "sitio web",
  "budget": "unknown",
  "timeline": "unknown",
  "conversationHistory": "[...]"
}
```

### What SHOULD Happen
Agent should respond: "¡Perfecto! Un sitio web 😊 ¿Cómo te llamas?" (asking for name)

## Root Cause

The agent is calling the tool despite having `null` values in the extracted fields. The prompt in [sales-agent-en.txt:24](app/lib/ai/prompts/sales-agent-en.txt#L24) says:

> "When you have name + email + projectType → send email immediately"

But it's not explicit enough about what "have" means. The agent is interpreting missing fields as "unknown" and trying to send anyway.

## Solution

### Fix 1: Update Sales Agent Prompt
Strengthen [sales-agent-en.txt](app/lib/ai/prompts/sales-agent-en.txt) to be more explicit:

```txt
TOOL USAGE - CRITICAL RULES:
❌ NEVER call validateAndSendEmail if ANY required field is missing/null
❌ NEVER use placeholder values like "unknown", "N/A", or empty strings
✅ ONLY call validateAndSendEmail when you have REAL values for: name, email, projectType

VALIDATION BEFORE CALLING TOOL:
- name: Must be an actual name (not null, not "unknown")
- email: Must be a valid email with @ symbol (not null, not "unknown")
- projectType: Must be what they want to build (not null, not "unknown")

IF ANY FIELD IS MISSING:
1. Ask for the FIRST missing required field
2. Wait for customer response
3. Do NOT call the tool yet

EXAMPLE FLOW:
User: "I want a website"
→ You: "Awesome! 🎨 What's your name?"
[DO NOT call tool yet - missing name and email]

User: "John"
→ You: "Nice to meet you John! What's your email?"
[DO NOT call tool yet - missing email]

User: "john@gmail.com"
→ Now you have: name=John, email=john@gmail.com, projectType=website
→ NOW call validateAndSendEmail tool
```

Replace the existing "TOOL USAGE:" section (lines 36-39) with the above text.

### Fix 2: Add Safety Check in Sales Agent Constructor
Add validation in [sales-agent.ts](app/lib/ai/agents/sales-agent.ts) to prevent premature tool calls:

```typescript
private buildSystemPrompt(fieldStatus: string): string {
  const basePrompt = PROMPTS.SALES_AGENT(fieldStatus);

  // Add explicit safety instructions at the end
  const safetyNote = `

CRITICAL SAFETY CHECK - READ CAREFULLY:
Before calling validateAndSendEmail, verify:
1. name is NOT null and NOT "unknown" → ask "What's your name?" if missing
2. email is NOT null and NOT "unknown" → ask "What's your email?" if missing
3. projectType is NOT null and NOT "unknown" → already extracted from conversation

If ANY of the above is null/"unknown", DO NOT call the tool. Ask for the missing field instead.
`;

  return basePrompt + safetyNote;
}
```

Update the method call in constructor (line 21):
```typescript
const systemPrompt = this.buildSystemPrompt(fieldStatus);
```

### Fix 3: Improve Tool Description
Update [email-tool.ts:57-70](app/lib/ai/agents/tools/email-tool.ts#L57) to be more explicit:

```typescript
description: `Validate customer fields and send sales inquiry email to Fran.

⚠️ CRITICAL: ONLY call this tool when you have REAL VALUES for all 3 required fields.

WHEN TO USE:
✅ You have actual name (not null, not "unknown")
✅ You have valid email with @ symbol (not null, not "unknown")
✅ You have projectType (not null, not "unknown")
✅ Budget/timeline are optional - can be "I don't know" or any answer

WHEN NOT TO USE:
❌ ANY required field is null
❌ ANY required field is "unknown" or placeholder value
❌ Email doesn't have @ symbol
❌ Name is too short (< 2 chars)

IF FIELDS ARE MISSING:
→ Ask the customer for the missing information
→ Do NOT call this tool with placeholder values

WHAT IT DOES:
1. Validates required fields are present and correctly formatted
2. Sends email to Fran with the customer inquiry
3. Returns success or failure details`,
```

## Testing Plan

### Test Case 1: Single Message with All Info
```
Input: "Hi, I'm John (john@gmail.com) and I want a website"
Expected:
- Extract all 3 fields
- Call tool immediately
- Success
```

### Test Case 2: Incremental Collection (MAIN TEST)
```
Input 1: "Hola amigo me intesa comprar un sitio web"
Expected: Agent asks "¿Cómo te llamas?" (What's your name?)
Verify: Tool NOT called, no error

Input 2: "Joaquin Fernanzes"
Expected: Agent asks "¿Cuál es tu email?" (What's your email?)
Verify: Tool NOT called, no error

Input 3: "joa@gmail.com"
Expected: Tool called with valid data, email sent
Verify: Tool called successfully, no validation errors
```

### Test Case 3: Partial Info
```
Input: "I want to build an app"
Expected: Agent asks "What's your name?"
Verify: Tool NOT called (missing name + email)
```

## Files to Modify
1. [app/lib/ai/prompts/sales-agent-en.txt](app/lib/ai/prompts/sales-agent-en.txt) - Strengthen tool usage rules
2. [app/lib/ai/agents/sales-agent.ts](app/lib/ai/agents/sales-agent.ts) - Add safety check in prompt builder
3. [app/lib/ai/agents/tools/email-tool.ts](app/lib/ai/agents/tools/email-tool.ts) - Improve tool description

## Acceptance Criteria
- [ ] Agent NEVER calls tool with "unknown" or null values
- [ ] Agent asks for missing required fields one at a time
- [ ] Spanish test case passes (incremental collection)
- [ ] No validation errors in logs
- [ ] All 3 test cases pass

## Priority
**HIGH** - Blocking E2E testing. Agent is unusable in current state.

## Notes
This is a prompt engineering issue - the agent needs clearer instructions about WHEN to call the tool vs WHEN to ask for more info. The tool schema validation is working correctly by rejecting invalid data.
