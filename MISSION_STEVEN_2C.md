# Mission 2C: Fix Intent Detection Classification Issue

## Problem
User tested the new `/api/chat-v2` endpoint and input "I want a website" but received "Casual mode not implemented yet in v2" error. The router is incorrectly classifying this as casual intent instead of sales intent.

## Root Cause Analysis
The router prompt ([router.txt:13](app/lib/ai/prompts/router.txt#L13)) explicitly states that "I want to build X" should be classified as SALES intent, and the example at line 35 confirms this. However, the `detectIntent()` function in [route.ts:25-26](app/api/chat-v2/route.ts#L25) has a fragile parsing implementation:

```typescript
const intent = text.toLowerCase().trim();
return intent === 'sales' ? 'sales' : 'casual';
```

This only works if the LLM returns exactly "sales" or "casual". The LLM might be:
1. Adding extra whitespace or punctuation
2. Returning explanations alongside the intent
3. Using uppercase/mixed case (though .toLowerCase() handles this)
4. The router.txt prompt structure might need reinforcement

## Task: Fix Intent Detection Robustness

### Step 1: Enhance Router Prompt
Update [router.txt](app/lib/ai/prompts/router.txt) to be more explicit:

```
You are a router that detects user intent in MSN Messenger conversations.

Respond with ONLY ONE WORD: "sales" or "casual" (lowercase, no punctuation, no explanation).

[Keep rest of prompt as-is, but add at the very end:]

CRITICAL: Your response MUST be exactly one word: "sales" or "casual"
Do NOT add explanations, punctuation, or extra text.
```

### Step 2: Make detectIntent() More Robust
Update [route.ts:11-31](app/api/chat-v2/route.ts#L11) to handle edge cases:

```typescript
async function detectIntent(userMessage: string, conversationHistory: Message[] = []): Promise<'sales' | 'casual'> {
  try {
    const recentHistory = conversationHistory.slice(-4);
    const conversationContext = recentHistory.length > 0
      ? `\n\nRecent conversation context:\n${recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    const { text } = await generateText({
      model: groq(process.env.GROQ_ROUTER_MODEL || 'llama-3.3-70b-versatile'),
      prompt: `${PROMPTS.ROUTER()}${conversationContext}\n\nLatest message: "${userMessage}"`,
      temperature: 0.1,
    });

    // More robust parsing - check if "sales" appears anywhere in response
    const normalizedText = text.toLowerCase().trim();

    // Log for debugging
    console.log('[detectIntent] Raw LLM response:', text);
    console.log('[detectIntent] User message:', userMessage);

    if (normalizedText.includes('sales')) {
      console.log('[detectIntent] Classified as SALES');
      return 'sales';
    } else {
      console.log('[detectIntent] Classified as CASUAL');
      return 'casual';
    }
  } catch (error) {
    console.error('Intent detection error:', error);
    return 'casual'; // Default fallback
  }
}
```

### Step 3: Test Edge Cases
Test with these inputs to verify the fix:
- "I want a website"
- "I need to build an app"
- "Can you make me a chatbot?"
- "I want to hire you"
- "This is amazing!" (should be casual)
- "Just browsing" (should be casual)

### Expected Results
After this fix:
- "I want a website" → SALES intent → Sales agent engages
- Console logs show clear classification decisions
- More resilient to LLM response variations

## Files to Modify
1. [app/lib/ai/prompts/router.txt](app/lib/ai/prompts/router.txt) - Add explicit instruction
2. [app/api/chat-v2/route.ts](app/api/chat-v2/route.ts) - Improve detectIntent() robustness

## Acceptance Criteria
- [ ] Router prompt explicitly demands single-word response
- [ ] detectIntent() uses `.includes('sales')` instead of exact match
- [ ] Console logs show classification decisions for debugging
- [ ] "I want a website" correctly triggers sales flow
- [ ] Test all edge cases pass

## Notes
This is a critical bug blocking E2E testing. The router prompt is correct, but the parsing logic is too fragile. This fix makes it production-ready.
