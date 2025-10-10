# 📚 Vercel AI SDK Agents - Complete Developer Guide

**For:** Steven & Codex
**Project:** Sales Agent Migration
**Version:** AI SDK v5.0+
**Last Updated:** January 2025

---

## 🎯 What Are Agents?

**Definition:** Agents are LLMs that use tools in a loop to accomplish tasks.

**Key Difference:**
```typescript
// ❌ OLD WAY: Manual tool calling with generateText()
const { text, toolCalls } = await generateText({
  model: groq('llama-3.3-70b'),
  messages: [...],
  tools: { myTool }
});
// YOU manually check toolCalls and execute them

// ✅ NEW WAY: Automatic tool loop with Agent
const agent = new Agent({
  model: groq('llama-3.3-70b'),
  tools: { myTool },
  stopWhen: stepCountIs(10)
});
const result = await agent.generate({ prompt: '...' });
// Agent AUTOMATICALLY executes tools in a loop
```

---

## 🏗️ Agent Class API Reference

### Constructor

```typescript
import { Experimental_Agent as Agent } from 'ai';
import { groq } from '@ai-sdk/groq';
import { tool } from 'ai';
import { z } from 'zod';

const myAgent = new Agent({
  // REQUIRED: The LLM model
  model: groq('llama-3.3-70b-versatile'),

  // OPTIONAL: System prompt (like personality)
  system: 'You are a helpful sales assistant...',

  // OPTIONAL: Tools the agent can use
  tools: {
    toolName: tool({
      description: 'What this tool does',
      inputSchema: z.object({
        param: z.string().describe('Parameter description')
      }),
      execute: async ({ param }) => {
        // Tool logic here
        return { result: 'success' };
      }
    })
  },

  // OPTIONAL: When to stop the loop (default: stepCountIs(1))
  stopWhen: stepCountIs(20),

  // OPTIONAL: Control tool usage
  toolChoice: 'auto', // 'auto' | 'required' | 'none'

  // OPTIONAL: Temperature for randomness
  temperature: 0.8,

  // OPTIONAL: Max tokens to generate
  maxTokens: 2000
});
```

### Methods

#### `agent.generate()`
Main method to run the agent.

```typescript
const result = await agent.generate({
  // REQUIRED: User input (one of these)
  prompt: 'Hello agent!',
  // OR
  messages: [
    { role: 'user', content: 'Hello!' },
    { role: 'assistant', content: 'Hi!' },
    { role: 'user', content: 'What is the weather?' }
  ]
});

// Result object structure
console.log(result.text);    // Final text response
console.log(result.steps);   // Array of steps taken
console.log(result.usage);   // Token usage stats
```

---

## 🔧 Tool Definition Patterns

### Basic Tool
```typescript
const weatherTool = tool({
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name')
  }),
  execute: async ({ location }) => {
    const weather = await fetchWeather(location);
    return { temperature: weather.temp, conditions: weather.desc };
  }
});
```

### Tool with Complex Input
```typescript
const emailTool = tool({
  description: 'Send an email to a customer',
  inputSchema: z.object({
    to: z.string().email().describe('Recipient email'),
    subject: z.string().describe('Email subject'),
    body: z.string().describe('Email body'),
    priority: z.enum(['low', 'normal', 'high']).optional()
  }),
  execute: async ({ to, subject, body, priority = 'normal' }) => {
    await sendEmail({ to, subject, body, priority });
    return { sent: true, timestamp: new Date().toISOString() };
  }
});
```

### Tool with Error Handling
```typescript
const databaseTool = tool({
  description: 'Query database for customer info',
  inputSchema: z.object({
    customerId: z.string()
  }),
  execute: async ({ customerId }) => {
    try {
      const customer = await db.customers.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        return { error: 'Customer not found', found: false };
      }

      return {
        found: true,
        customer: { name: customer.name, email: customer.email }
      };
    } catch (error) {
      console.error('Database error:', error);
      return { error: 'Database connection failed', found: false };
    }
  }
});
```

---

## 🔄 Loop Control with `stopWhen`

The `stopWhen` parameter controls when the agent stops executing tools.

### Built-in Stop Conditions

```typescript
import { stepCountIs } from 'ai';

// Stop after 1 step (default)
stopWhen: stepCountIs(1)

// Stop after 10 steps (multi-turn workflow)
stopWhen: stepCountIs(10)

// Stop after 20 steps (complex workflows)
stopWhen: stepCountIs(20)
```

### Custom Stop Condition
```typescript
// Stop when a specific tool is called
stopWhen: ({ steps }) => {
  return steps.some(step =>
    step.toolCalls?.some(call => call.toolName === 'sendEmail')
  );
}

// Stop when output contains specific text
stopWhen: ({ text }) => text.includes('DONE')
```

### Recommended Values
- **Simple queries (no tools):** `stepCountIs(1)` (default)
- **Single tool execution:** `stepCountIs(3)`
- **Multi-step workflows:** `stepCountIs(10)`
- **Complex workflows:** `stepCountIs(20)`
- **⚠️ Max recommended:** `stepCountIs(50)` (cost/performance)

---

## 📊 Workflow Patterns (Critical for Sales Agent)

### Pattern 1: Sequential Processing (Chain)
**Use Case:** Steps must happen in order

```typescript
// Sales workflow: Extract → Validate → Send Email
const salesAgent = new Agent({
  model: groq('llama-3.3-70b'),
  system: `You are a sales assistant. Follow these steps:
1. Extract customer information from the conversation
2. Validate the information is complete and correct
3. Send the sales inquiry email
4. Confirm to the customer`,
  tools: {
    extractFields: tool({
      description: 'Extract customer data from conversation',
      inputSchema: z.object({}),
      execute: async () => {
        // Extraction logic
        return { name: 'John', email: 'john@example.com' };
      }
    }),
    validateAndSend: tool({
      description: 'Validate fields and send email if valid',
      inputSchema: z.object({
        name: z.string(),
        email: z.string()
      }),
      execute: async ({ name, email }) => {
        // Validation + sending logic
        return { sent: true };
      }
    })
  },
  stopWhen: stepCountIs(5)
});
```

### Pattern 2: Routing
**Use Case:** Agent decides which path to take

```typescript
// Router agent: Casual vs Sales intent
const routerAgent = new Agent({
  model: groq('llama-3.3-70b'),
  system: 'Classify user intent as "sales" or "casual"',
  stopWhen: stepCountIs(1) // Single classification
});

const result = await routerAgent.generate({
  prompt: userMessage
});

if (result.text.includes('sales')) {
  // Route to sales agent
} else {
  // Route to casual agent
}
```

### Pattern 3: Evaluator-Optimizer Loop
**Use Case:** Iterative improvement with quality checks

```typescript
const translationAgent = new Agent({
  model: groq('llama-3.3-70b'),
  system: 'Translate and improve translation quality',
  tools: {
    evaluateTranslation: tool({
      description: 'Check translation quality',
      inputSchema: z.object({ translation: z.string() }),
      execute: async ({ translation }) => {
        const score = calculateQualityScore(translation);
        return {
          score,
          needsImprovement: score < 0.8,
          suggestions: ['Fix grammar', 'Better idioms']
        };
      }
    })
  },
  stopWhen: ({ steps }) => {
    // Stop when quality is good OR max attempts reached
    const lastEval = steps.findLast(s =>
      s.toolCalls?.some(c => c.toolName === 'evaluateTranslation')
    );
    return lastEval?.result?.score >= 0.8 || steps.length >= 10;
  }
});
```

---

## 🎨 System Prompt Best Practices

### Good System Prompt
```typescript
system: `You are a professional sales assistant for Fran AI Consultancy.

YOUR ROLE:
- Collect customer information: name, email, project type, budget, timeline
- Be friendly and conversational (not robotic)
- Speak the customer's language (ES/EN/FR/DE)

BEHAVIOR:
- Ask for ONE piece of information at a time
- If customer provides multiple fields, acknowledge all
- Never skip validation before sending email
- Confirm email sent with "✅" emoji

TOOLS:
- Use validateAndSendEmail when you have all 5 fields
- Only call it once (don't retry unless customer asks)

NEVER:
- Don't ask for information already provided
- Don't be pushy or sales-y
- Don't make up information`
```

### Bad System Prompt
```typescript
// ❌ Too vague
system: 'You help with sales'

// ❌ Too restrictive
system: 'Only respond with JSON'

// ❌ No tool guidance
system: 'Be helpful'
```

---

## 📦 Return Value Structure

```typescript
const result = await agent.generate({ prompt: '...' });

// Text output
console.log(result.text); // "I've sent the email! ✅"

// Steps taken (for debugging)
console.log(result.steps);
/* [
  {
    type: 'text',
    content: 'Let me extract the information...'
  },
  {
    type: 'tool-call',
    toolName: 'extractFields',
    args: {},
    result: { name: 'John', email: 'john@example.com' }
  },
  {
    type: 'tool-call',
    toolName: 'sendEmail',
    args: { name: 'John', email: 'john@example.com' },
    result: { sent: true }
  }
] */

// Token usage (for cost tracking)
console.log(result.usage);
/* {
  promptTokens: 1500,
  completionTokens: 300,
  totalTokens: 1800
} */

// Finish reason
console.log(result.finishReason); // 'stop' | 'length' | 'tool-calls' | 'content-filter'
```

---

## ⚠️ Common Pitfalls & Solutions

### Pitfall 1: Infinite Loops
```typescript
// ❌ BAD: No stop condition
const agent = new Agent({
  model: groq('llama-3.3-70b'),
  tools: { myTool }
  // Missing stopWhen! Will run forever
});

// ✅ GOOD: Always set stopWhen
const agent = new Agent({
  model: groq('llama-3.3-70b'),
  tools: { myTool },
  stopWhen: stepCountIs(10) // Safety limit
});
```

### Pitfall 2: Tool Description Too Vague
```typescript
// ❌ BAD: Agent won't know when to use this
const badTool = tool({
  description: 'Does stuff',
  inputSchema: z.object({ data: z.any() }),
  execute: async ({ data }) => data
});

// ✅ GOOD: Clear, specific description
const goodTool = tool({
  description: 'Validates email format and domain existence. Use this ONLY when you have an email to validate.',
  inputSchema: z.object({
    email: z.string().email().describe('Email address to validate')
  }),
  execute: async ({ email }) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return { valid: isValid, email };
  }
});
```

### Pitfall 3: Not Handling Tool Errors
```typescript
// ❌ BAD: Throws error, breaks agent
const badTool = tool({
  description: 'Fetch user data',
  inputSchema: z.object({ id: z.string() }),
  execute: async ({ id }) => {
    const user = await db.users.findUnique({ where: { id } });
    return user; // What if user is null?
  }
});

// ✅ GOOD: Returns error state
const goodTool = tool({
  description: 'Fetch user data',
  inputSchema: z.object({ id: z.string() }),
  execute: async ({ id }) => {
    try {
      const user = await db.users.findUnique({ where: { id } });

      if (!user) {
        return { found: false, error: 'User not found' };
      }

      return { found: true, user };
    } catch (error) {
      console.error('DB error:', error);
      return { found: false, error: 'Database error' };
    }
  }
});
```

### Pitfall 4: Passing Agent Result Directly to Client
```typescript
// ❌ BAD: Exposes internal details
return NextResponse.json(result);
// Client sees: { text: '...', steps: [...], usage: {...} }

// ✅ GOOD: Only return what client needs
return NextResponse.json({
  message: result.text,
  emailSent: result.steps.some(s =>
    s.toolCalls?.some(c => c.toolName === 'sendEmail')
  )
});
```

---

## 🔥 Real-World Example: Sales Agent

This is what you'll be building:

```typescript
import { Experimental_Agent as Agent, tool, stepCountIs } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

// Field extraction agent (pre-processor)
const fieldExtractorAgent = new Agent({
  model: groq('llama-3.3-70b-versatile'),
  system: `Extract customer information from conversation history.

Return JSON with these fields:
- name: Customer's name (or null)
- email: Customer's email (or null)
- projectType: Type of project (or null)
- budget: Budget range (or null)
- timeline: Desired timeline (or null)`,
  stopWhen: stepCountIs(1) // Single extraction
});

// Main sales agent
const salesAgent = new Agent({
  model: groq('moonshotai/kimi-k2-instruct-0905'),
  system: `You are a sales assistant for Fran AI Consultancy.

CURRENT FIELDS STATUS: {field_status}

YOUR GOAL: Collect all 5 fields: name, email, projectType, budget, timeline

BEHAVIOR:
- Ask for ONE missing field at a time
- Be conversational and friendly
- Match the customer's language (ES/EN/FR/DE)
- When ALL fields collected, use validateAndSendEmail tool

NEVER:
- Don't re-ask for information already collected
- Don't be pushy`,

  tools: {
    validateAndSendEmail: tool({
      description: 'Validate all fields are present and send sales inquiry email. Only use when all 5 fields are collected.',
      inputSchema: z.object({
        name: z.string(),
        email: z.string().email(),
        projectType: z.string(),
        budget: z.string(),
        timeline: z.string()
      }),
      execute: async ({ name, email, projectType, budget, timeline }) => {
        // Validation
        if (!email.includes('@')) {
          return { sent: false, error: 'Invalid email format' };
        }

        // Send email
        try {
          await sendSalesInquiryEmail({
            name, email, projectType, budget, timeline
          });
          return { sent: true, timestamp: new Date().toISOString() };
        } catch (error) {
          return { sent: false, error: 'Email service failed' };
        }
      }
    })
  },

  stopWhen: ({ steps }) => {
    // Stop when email is sent
    return steps.some(s =>
      s.toolCalls?.some(c =>
        c.toolName === 'validateAndSendEmail' && c.result?.sent
      )
    ) || steps.length >= 10; // Safety limit
  },

  temperature: 0.8
});

// Usage in API route
export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  // Step 1: Extract fields
  const extractionResult = await fieldExtractorAgent.generate({
    prompt: JSON.stringify(messages)
  });

  const fields = JSON.parse(extractionResult.text);

  // Step 2: Build field status for system prompt
  const fieldStatus = `
name: ${fields.name || '❌ NOT COLLECTED'}
email: ${fields.email || '❌ NOT COLLECTED'}
projectType: ${fields.projectType || '❌ NOT COLLECTED'}
budget: ${fields.budget || '❌ NOT COLLECTED'}
timeline: ${fields.timeline || '❌ NOT COLLECTED'}
  `.trim();

  // Step 3: Run sales agent with current state
  const salesResult = await salesAgent.generate({
    messages: [
      { role: 'system', content: salesAgent.system.replace('{field_status}', fieldStatus) },
      ...messages
    ]
  });

  // Step 4: Check if email was sent
  const emailSent = salesResult.steps.some(s =>
    s.toolCalls?.some(c =>
      c.toolName === 'validateAndSendEmail' && c.result?.sent
    )
  );

  return NextResponse.json({
    message: salesResult.text,
    emailSent,
    fields // For debugging
  });
}
```

---

## 📊 Performance Comparison

### Current Implementation (Manual)
```
User: "I want a website"
  ↓ [300ms] extractFields() call
  ↓ [800ms] generateText(salesPrompt)
User: "My name is John"
  ↓ [300ms] extractFields() call
  ↓ [800ms] generateText(salesPrompt)
User: "john@example.com"
  ↓ [300ms] extractFields() call
  ↓ [500ms] validateFields() call
  ↓ [200ms] sendEmail()

Total: 5 LLM calls, ~3.2 seconds
```

### Agent Implementation (Automatic)
```
User: "I want a website"
  ↓ [300ms] fieldExtractorAgent (once)
  ↓ [800ms] salesAgent responds
User: "My name is John, email john@example.com"
  ↓ [300ms] fieldExtractorAgent (once)
  ↓ [800ms] salesAgent calls validateAndSendEmail tool

Total: 4 LLM calls, ~2.2 seconds (31% faster!)
```

---

## ✅ Testing Agents

```typescript
import { describe, it, expect } from 'vitest';

describe('Sales Agent', () => {
  it('should collect all fields and send email', async () => {
    const result = await salesAgent.generate({
      messages: [
        { role: 'user', content: 'I want a website' },
        { role: 'assistant', content: 'What is your name?' },
        { role: 'user', content: 'John Doe' },
        { role: 'assistant', content: 'Email?' },
        { role: 'user', content: 'john@example.com' },
        { role: 'assistant', content: 'Project type?' },
        { role: 'user', content: 'E-commerce site' },
        { role: 'assistant', content: 'Budget?' },
        { role: 'user', content: '5000-10000' },
        { role: 'assistant', content: 'Timeline?' },
        { role: 'user', content: '2 months' }
      ]
    });

    expect(result.text).toContain('✅');
    expect(result.steps).toHaveLength(2); // Extract + Send

    const emailTool = result.steps.find(s =>
      s.toolCalls?.some(c => c.toolName === 'validateAndSendEmail')
    );
    expect(emailTool.result.sent).toBe(true);
  });

  it('should handle invalid email', async () => {
    const result = await salesAgent.generate({
      prompt: 'My email is not-an-email'
    });

    expect(result.text).toContain('valid email');
  });
});
```

---

## 🚀 Migration Checklist

Before starting implementation, confirm:

- [ ] Understand Agent vs generateText() difference
- [ ] Know how to define tools with Zod schemas
- [ ] Understand stopWhen and loop control
- [ ] Can write clear system prompts
- [ ] Know how to handle tool errors
- [ ] Understand the return value structure
- [ ] Can test agents with different scenarios
- [ ] Understand the workflow pattern for sales (Sequential)

---

## 📞 Questions?

**For Technical Questions:**
- Check [Vercel AI SDK Docs](https://ai-sdk.dev/docs/agents/overview)
- Post in `#sales-agent-migration` Slack channel
- Tag `@ProductOwner` for urgent issues

**For Architectural Decisions:**
- Refer to `SALES_AGENT_MIGRATION_PLAN.md`
- Ask in daily standup
- DM Product Owner for clarification

---

**You are now an expert on Vercel AI SDK Agents. Good luck! 🚀**
