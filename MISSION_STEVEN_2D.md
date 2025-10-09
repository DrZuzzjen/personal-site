# Mission 2D: Fix Critical Sales Agent Bugs

## Overview
Three critical bugs discovered during E2E testing that are blocking production deployment:

1. **Duplicate Email Sending** - Tool being called 4+ times in one conversation
2. **emailSent Detection Failure** - Despite emails being sent, API reports `emailSent: false`
3. **Session Persistence After Clear** - Clear button doesn't reset field extraction state

## Bug 1: Duplicate Email Sending

### Evidence from Logs
```
[validateAndSendEmailTool] Email sent successfully: c44a9ca9-8144-4bc6-a8a3-0a58209d2f9d
[validateAndSendEmailTool] Email sent successfully: 8475f023-fe4e-43e6-97b3-d9d9ec0f242b
[validateAndSendEmailTool] Email sent successfully: 403ac716-4a70-4196-9856-2e6054c9f0de
[validateAndSendEmailTool] Email sent successfully: 08a0b1f4-c6c0-455b-9c20-1bef1d7d0faf
```
4 emails sent in a single conversation when only 1 should be sent.

### Root Cause
The `stopWhen` condition in [sales-agent.ts:30-40](app/lib/ai/agents/sales-agent.ts#L30) checks `call.result?.sent === true`, but the agent doesn't stop immediately after the first successful send. The agent continues to generate more steps and calls the tool again.

### Fix Required
Update the `stopWhen` logic to be more aggressive:

```typescript
stopWhen: ({ steps }) => {
  // Stop immediately if ANY step has a successful email send
  const emailSent = steps.some((step: any) =>
    step.toolCalls?.some(
      (call: any) =>
        call.toolName === 'validateAndSendEmail' &&
        call.result?.sent === true,
    ),
  );

  // If email sent, stop regardless of step count
  if (emailSent) {
    console.log('[SalesAgent] Email sent successfully, stopping agent');
    return true;
  }

  // Otherwise, limit to 10 steps for safety
  if (steps.length >= 10) {
    console.log('[SalesAgent] Max steps reached without email send');
    return true;
  }

  return false;
},
```

Also verify the agent isn't being initialized multiple times per request in [route.ts](app/api/chat-v2/route.ts).

## Bug 2: emailSent Detection Failure

### Evidence from Logs
```
[chat-v2] Response generated, emailSent: false
[Telemetry] {...,"emailSent":false}
```

Despite 4 emails being sent successfully, the API response shows `emailSent: false`.

### Root Cause
The detection logic in [route.ts:86-90](app/api/chat-v2/route.ts#L86) is checking the same condition as the agent's `stopWhen`, but it's not working correctly:

```typescript
const emailSent = result.steps.some((step: any) =>
  step.toolCalls?.some((call: any) =>
    call.toolName === 'validateAndSendEmail' && call.result?.sent === true
  )
);
```

The issue is likely that `result.steps` doesn't contain the tool results in the expected format, or the path to `result.sent` is incorrect.

### Fix Required
Debug and fix the detection logic:

```typescript
// Step 5: Check if email was sent (with logging for debugging)
const emailSent = result.steps.some((step: any) => {
  if (!step.toolCalls) return false;

  return step.toolCalls.some((call: any) => {
    console.log('[chat-v2] Checking tool call:', {
      toolName: call.toolName,
      hasResult: !!call.result,
      result: call.result,
    });

    return (
      call.toolName === 'validateAndSendEmail' &&
      call.result?.sent === true
    );
  });
});

console.log('[chat-v2] Email sent detection result:', emailSent);
console.log('[chat-v2] Full result.steps:', JSON.stringify(result.steps, null, 2));
```

Run a test and examine the console output to see the actual structure of `result.steps`. Adjust the path to the `sent` field accordingly.

## Bug 3: Session Persistence After Clear

### Evidence
User reported: "The session storage is not reset when I hit 'clear' on the msn messenger then? just the chat history but not the 'user' or whatever?"

### Root Cause
The Clear button in [Chatbot.tsx:657-662](app/components/Apps/Chatbot/Chatbot.tsx#L657) only clears the messages array and localStorage:

```typescript
const clearChat = () => {
  if (confirm('Clear all messages?')) {
    setMessages([]);
    localStorage.removeItem('chatbot-history');
  }
};
```

However, the backend has no concept of "sessions". Each request to `/api/chat-v2` extracts fields from the conversation history. When the user clears the chat, the next message will have an empty conversation history, but the Field Extractor Agent might still detect fields from the user's latest message.

### Fix Required - Option A (Recommended): No backend changes needed
The current architecture is actually correct. Field extraction happens per-request based on conversation history. When the user clears the chat:
- Frontend: Messages cleared
- Backend: Next request has empty `conversationHistory`
- Field Extractor: Starts fresh with no prior context

**Verify this is working correctly by testing:**
1. Complete a full sales flow (provide name, email, project)
2. Click Clear button
3. Send a new message like "I want a website"
4. Verify the agent asks for name/email again (doesn't remember previous conversation)

If the agent DOES remember the previous fields after Clear, then we have a caching issue somewhere.

### Fix Required - Option B: Add explicit session reset
If testing shows the agent remembers fields after Clear, add a session ID system:

**Frontend (Chatbot.tsx):**
```typescript
const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

const clearChat = () => {
  if (confirm('Clear all messages?')) {
    setMessages([]);
    localStorage.removeItem('chatbot-history');
    setSessionId(crypto.randomUUID()); // Generate new session ID
  }
};

// Include sessionId in API request
const res = await fetch('/api/chat-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [...messages, newMessage],
    sessionId // Pass session ID to backend
  }),
});
```

**Backend (route.ts):**
```typescript
const { messages, sessionId } = await request.json();
// Use sessionId for any caching/session management if needed
```

## Testing Plan

### Test Case 1: Single Email Send
1. Start fresh conversation
2. Provide name: "John Doe"
3. Provide email: "john@example.com"
4. Provide project: "website"
5. **Expected**: Exactly 1 email sent, `emailSent: true` in response
6. **Verify**: Check logs for only one `[validateAndSendEmailTool] Email sent successfully`

### Test Case 2: Email Detection
1. Same as Test Case 1
2. **Expected**: API response shows `"emailSent": true`
3. **Verify**: Telemetry logs show `emailSent: true`

### Test Case 3: Session Reset
1. Complete full sales flow
2. Click Clear button
3. Send "I want a website"
4. **Expected**: Agent asks for name (doesn't remember previous conversation)
5. **Verify**: Field Extractor logs show empty fields

## Bug 4: Missing Green Notification Animation

### Evidence
User reported: "The notification green animation when the email was sent in the previous version is not here :( its sending emails and not really showing the animation we had before."

### Root Cause
The green success notification in [Chatbot.tsx:532](app/components/Apps/Chatbot/Chatbot.tsx#L532) only triggers when `data.emailSent === true`:

```typescript
if (data.emailSent && data.systemMessage) {
  setTimeout(() => {
    addMessage({ role: 'system', content: data.systemMessage });
    // Play success sound
  }, 2000);
}
```

Since `emailSent` is always `false` (Bug #2), the animation never shows.

### Fix Required
This bug will be **automatically fixed** when you fix Bug #2 (emailSent detection). No additional code changes needed - just verify the animation works after Bug #2 is resolved.

### Test Case 4: Green Notification Animation
1. Complete full sales flow
2. When email is sent, observe:
   - **Expected**: Green success message appears after 2 seconds
   - **Expected**: MSN send sound plays (`/sounds/msn-send.mp3`)
   - **Expected**: Status indicator shows green

## Files to Modify
1. [app/lib/ai/agents/sales-agent.ts](app/lib/ai/agents/sales-agent.ts) - Fix stopWhen logic
2. [app/api/chat-v2/route.ts](app/api/chat-v2/route.ts) - Fix emailSent detection with debug logging
3. [app/components/Apps/Chatbot/Chatbot.tsx](app/components/Apps/Chatbot/Chatbot.tsx) - Only if Option B is needed

## Acceptance Criteria
- [ ] Only 1 email sent per successful sales flow
- [ ] `emailSent: true` correctly reported in API response
- [ ] Green notification animation appears when email is sent
- [ ] Telemetry accurately reflects email sends
- [ ] Clear button resets conversation state completely
- [ ] All test cases pass
- [ ] Debug logs help diagnose any future issues

## Priority
**CRITICAL** - These bugs prevent production deployment and cause poor user experience (spam emails, incorrect data, missing feedback).
