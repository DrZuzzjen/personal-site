# 🚀 Sales Agent Implementation Guide

**For:** Steven (AI Engineer / Full Stack Developer)
**From:** Claude (Product Manager / System Architect)
**Branch:** `booking-system`
**Estimated Time:** 4-5 hours

---

## 📋 Overview

Steven will implement a multi-agent AI system for MSN Messenger that:
1. Detects when users want services (intent detection)
2. Switches to "sales mode" automatically
3. Asks qualifying questions conversationally
4. Collects detailed project info + contact details
5. Sends comprehensive email to Jean Francois with AI assessment

**Architecture:** Router Agent → Sales Agent | Casual Chat Agent

---

## 🔌 How It Integrates with Current MSN Messenger

### Current Flow (DO NOT CHANGE):
```
1. User opens MSN → /api/chat/welcome generates personalized welcome
2. User minimizes + idle → /api/chat/proactive sends follow-up
3. User clicks nudge → /api/chat handles nudge response
```

### Where Agent System Plugs In:
```
4. User sends ANY regular message → /api/chat (THIS IS WHAT STEVEN REPLACES)
```

**Key Points for Steven:**
- ✅ Agent system ONLY affects `/api/chat/route.ts`
- ✅ Welcome API (`/api/chat/welcome/route.ts`) stays unchanged
- ✅ Proactive API (`/api/chat/proactive/route.ts`) stays unchanged
- ✅ Frontend (`app/components/Apps/Chatbot/Chatbot.tsx`) stays unchanged
- ✅ Agents start listening AFTER welcome message, on first user message

---

## 📦 Prerequisites

### 1. Install Dependencies

Steven should run:
```bash
npm install @openai/agents zod@3 @ai-sdk/groq resend
```

**What each does:**
- `@openai/agents` - Agent orchestration & handoffs
- `zod@3` - Validation (required by Agents SDK)
- `@ai-sdk/groq` - Groq provider for Vercel AI SDK
- `resend` - Email sending service

### 2. Environment Variables

**Already configured:**
- ✅ `GROQ_API_KEY` (existing)

**Steven needs from Jean Francois:**
- ⚠️ `RESEND_API_KEY` (from Resend dashboard)
- ⚠️ `BOOKING_EMAIL_TO` (Jean's email for sales inquiries)

**Add to `.env.local`:**
```bash
GROQ_API_KEY=gsk_xxxxx  # Already have
RESEND_API_KEY=re_xxxxx  # Need from Jean
BOOKING_EMAIL_TO=your-email@example.com  # Jean's email
```

---

## 🗂️ Folder Structure

Steven should create this clean AI engineering structure:

```
app/
├── lib/
│   ├── ai/
│   │   ├── agents/
│   │   │   ├── router.ts          # Router agent definition
│   │   │   ├── sales.ts           # Sales agent definition
│   │   │   └── casual-chat.ts     # Casual chat agent definition
│   │   ├── prompts/
│   │   │   ├── router.txt         # Router system prompt
│   │   │   ├── sales.txt          # Sales system prompt
│   │   │   └── casual-chat.txt    # Casual chat system prompt
│   │   ├── tools/
│   │   │   └── send-sales-inquiry.ts  # Email sending tool
│   │   └── providers/
│   │       └── groq.ts            # Groq provider config
│   └── resend.ts                  # Resend client (existing or new)
└── api/
    ├── chat/
    │   ├── route.ts               # STEVEN REPLACES THIS
    │   ├── welcome/
    │   │   └── route.ts           # DON'T TOUCH
    │   └── proactive/
    │       └── route.ts           # DON'T TOUCH
    └── booking/
        └── send-email/
            └── route.ts           # NEW - Email API endpoint
```

**Why this structure:**
- ✅ Clean separation: agents, prompts, tools
- ✅ Prompts in separate `.txt` files (easier to iterate)
- ✅ Reusable provider config
- ✅ Easy to test each component independently

---

## 🛠️ Implementation Steps

### Step 1: Create Groq Provider Config

**File:** `app/lib/ai/providers/groq.ts`

```typescript
import { createGroq } from '@ai-sdk/groq';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is required');
}

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Export model for reuse
export const defaultModel = groq('llama-3.3-70b-versatile');
```

**Why separate file:**
- Reusable across all agents
- Single source of truth for model config
- Easy to swap models later

---

### Step 2: Create System Prompts

**File:** `app/lib/ai/prompts/router.txt`

```
You are a router that detects user intent in MSN Messenger.

HANDOFF TO SALES AGENT if user mentions:
- Building/developing a website, app, or software
- Need help with AI integration, chatbots, automation
- Want to hire or work with Jean Francois
- Asking about services, rates, pricing, or availability
- Project consultation or collaboration
- Any form of "I want to build X"

HANDOFF TO CASUAL CHAT AGENT otherwise:
- General questions about the portfolio
- Asking about Jean's background or projects
- Just saying hi or chatting
- Playing games, exploring the site

Be sensitive to context:
- "I want to build something" = SALES
- "What's up?" = CASUAL
- "Cool portfolio!" = CASUAL
- "Can you help me with a project?" = SALES

Always handoff on first message. Never respond directly.
```

**File:** `app/lib/ai/prompts/casual-chat.txt`

```
You're Jean Francois' friendly MSN Messenger assistant.

PERSONALITY:
- Short, punchy responses (1-3 lines max - this is MSN!)
- Use emoticons occasionally :) :D ;)
- Be fun but not cringe
- Reference retro Windows 3.1 vibes when appropriate

WHAT TO DO:
- Answer questions about Jean's portfolio
- Direct users to apps: "Check out Paint.exe!" or "Play Minesweeper!"
- Keep conversations light and friendly
- If user shows interest in Jean's SERVICES or wants to BUILD something:
  Say: "Want to chat about your project? I can connect you with Jean!"
  Then HANDOFF TO SALES AGENT

EXAMPLES:
User: "What's up?"
You: "hey! :) just vibing in this retro OS. check out the games!"

User: "Tell me about Jean"
You: "Jean's an AI Engineer who builds cool stuff with LLMs and agents. Check out Portfolio.exe for projects!"

User: "I'm thinking about building an app..."
You: "ooh nice! :D want to chat about your project? I can connect you with Jean!"
[HANDOFF TO SALES]

Keep it casual, keep it MSN! :)
```

**File:** `app/lib/ai/prompts/sales.txt`

```
You're Jean Francois' sales assistant in MSN Messenger.
A user wants to work with Jean or needs development services.

YOUR PROCESS (in order):

1. UNDERSTAND THE PROJECT (2-3 questions)
   - What are they building? (web app, mobile, AI integration, SaaS, etc.)
   - What features/functionality do they need?
   - Any specific tech requirements? (Next.js, Python, Claude, etc.)

2. QUALIFY TIMELINE & BUDGET (1-2 questions)
   - What's their timeline? (weeks, months, ASAP?)
   - Budget range: <$5k | $5k-$20k | $20k-$50k | $50k+ | "not sure yet"

3. COLLECT CONTACT INFO (required)
   - Full name
   - Email address
   - LinkedIn profile (optional but recommended)
   - Preferred meeting time

4. SEND EMAIL
   Once you have all required info, call send_sales_inquiry tool.

STYLE:
- Conversational, NOT interrogative
- Ask 1-2 questions per message MAX
- Be consultative: "That sounds exciting!" "I can see why that'd be valuable"
- Don't rush - build rapport
- If they're vague, ask follow-ups: "Tell me more about that"
- Use emojis occasionally :) 🚀 but don't overdo it

IMPORTANT RULES:
- DON'T ask all questions at once (overwhelming!)
- LET them elaborate naturally
- QUALIFY but don't be pushy
- If they change topic or say "never mind" → HANDOFF TO CASUAL CHAT
- Once you have enough info → call send_sales_inquiry tool

EXAMPLE FLOW:
User: "I want to build a chatbot"
You: "Awesome! :) What kind of chatbot are you thinking? Customer service? Lead gen? Something else?"

User: "Customer service for my e-commerce site"
You: "Nice! That's super valuable for e-commerce. What platform are you on? Shopify? Custom?"

User: "Shopify"
You: "Perfect! Shopify has great APIs. What's your timeline looking like?"

User: "Need it in 2 months"
You: "Got it. Budget-wise, are we talking <$5k, $5k-$20k, or $20k+?"

User: "$10k-$15k range"
You: "Cool! Let's get you on Jean's calendar. What's your name?"

[Continue collecting contact info, then call tool]

Be natural. Be helpful. Close the deal! 🚀
```

**Why separate .txt files:**
- Easy to iterate without touching code
- Version control tracks prompt changes
- Non-engineers can edit prompts
- Cleaner than huge template literals

---

### Step 3: Create Agents

**File:** `app/lib/ai/agents/router.ts`

```typescript
import { Agent } from '@openai/agents';
import { defaultModel } from '../providers/groq';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load prompt from file
const promptPath = join(process.cwd(), 'app/lib/ai/prompts/router.txt');
const routerPrompt = readFileSync(promptPath, 'utf-8');

export const routerAgent = new Agent({
  name: 'Router',
  model: defaultModel,
  instructions: routerPrompt,
  handoffs: ['casualChat', 'sales'],
});
```

**File:** `app/lib/ai/agents/casual-chat.ts`

```typescript
import { Agent } from '@openai/agents';
import { defaultModel } from '../providers/groq';
import { readFileSync } from 'fs';
import { join } from 'path';

const promptPath = join(process.cwd(), 'app/lib/ai/prompts/casual-chat.txt');
const casualChatPrompt = readFileSync(promptPath, 'utf-8');

export const casualChatAgent = new Agent({
  name: 'CasualChat',
  model: defaultModel,
  instructions: casualChatPrompt,
  handoffs: ['sales'], // Can escalate to sales
});
```

**File:** `app/lib/ai/agents/sales.ts`

```typescript
import { Agent } from '@openai/agents';
import { z } from 'zod';
import { defaultModel } from '../providers/groq';
import { sendSalesInquiry } from '../tools/send-sales-inquiry';
import { readFileSync } from 'fs';
import { join } from 'path';

const promptPath = join(process.cwd(), 'app/lib/ai/prompts/sales.txt');
const salesPrompt = readFileSync(promptPath, 'utf-8');

export const salesAgent = new Agent({
  name: 'Sales',
  model: defaultModel,
  instructions: salesPrompt,

  tools: {
    send_sales_inquiry: {
      description: 'Send detailed sales inquiry email to Jean Francois after qualifying the lead',
      parameters: z.object({
        // Contact Info
        name: z.string().describe('Lead\'s full name'),
        email: z.string().email().describe('Lead\'s email address'),
        linkedin: z.string().optional().describe('LinkedIn profile URL'),
        preferredTime: z.string().describe('When they want to meet'),

        // Project Details
        projectType: z.string().describe('Type of project: web app, mobile, AI integration, etc.'),
        projectDescription: z.string().describe('Detailed description of what they want'),
        features: z.string().describe('Key features they mentioned'),
        techRequirements: z.string().optional().describe('Specific tech they need'),

        // Qualification
        timeline: z.string().describe('Desired timeline'),
        budget: z.enum(['<$5k', '$5k-$20k', '$20k-$50k', '$50k+', 'not sure yet']),

        // Assessment
        qualificationNotes: z.string().describe('Your assessment of the lead quality'),
      }),
      handler: sendSalesInquiry,
    },
  },

  handoffs: ['casualChat'], // Can de-escalate
});
```

---

### Step 4: Create Email Tool

**File:** `app/lib/ai/tools/send-sales-inquiry.ts`

```typescript
interface SalesInquiryParams {
  name: string;
  email: string;
  linkedin?: string;
  preferredTime: string;
  projectType: string;
  projectDescription: string;
  features: string;
  techRequirements?: string;
  timeline: string;
  budget: string;
  qualificationNotes: string;
}

export async function sendSalesInquiry(params: SalesInquiryParams): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/booking/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sales_inquiry',
        ...params,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email API error:', error);
      throw new Error('Failed to send email');
    }

    return `Perfect! I've sent your details to Jean Francois. You'll hear back soon via email! 🎉`;

  } catch (error) {
    console.error('Tool error:', error);
    throw new Error('Oops, something went wrong. Can you try again or email directly at hello@fran-ai.dev?');
  }
}
```

---

### Step 5: Create Email API Endpoint

**File:** `app/api/booking/send-email/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/app/lib/resend';

const BOOKING_EMAIL = process.env.BOOKING_EMAIL_TO || 'fallback@example.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === 'sales_inquiry') {
      const { data, error } = await resend.emails.send({
        from: 'MSN Messenger Sales <onboarding@resend.dev>',
        to: BOOKING_EMAIL,
        replyTo: body.email,
        subject: `🚀 New Sales Inquiry from ${body.name}`,
        html: `
          <h2>New sales inquiry via MSN Messenger!</h2>

          <h3>👤 CONTACT INFO:</h3>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${body.email}">${body.email}</a></p>
          ${body.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${body.linkedin}">${body.linkedin}</a></p>` : ''}
          <p><strong>Preferred Meeting:</strong> ${body.preferredTime}</p>

          <hr>

          <h3>💼 PROJECT DETAILS:</h3>
          <p><strong>Type:</strong> ${body.projectType}</p>
          <p><strong>Description:</strong> ${body.projectDescription}</p>
          <p><strong>Key Features:</strong> ${body.features}</p>
          ${body.techRequirements ? `<p><strong>Tech Requirements:</strong> ${body.techRequirements}</p>` : ''}

          <hr>

          <h3>📊 QUALIFICATION:</h3>
          <p><strong>Timeline:</strong> ${body.timeline}</p>
          <p><strong>Budget:</strong> ${body.budget}</p>

          <hr>

          <h3>🎯 AI AGENT ASSESSMENT:</h3>
          <p>${body.qualificationNotes}</p>

          <hr>
          <p><em>Reply directly to this email to reach ${body.name}</em></p>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
      }

      return NextResponse.json({ success: true, emailId: data?.id });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

### Step 6: Update Resend Client (if not exists)

**File:** `app/lib/resend.ts`

```typescript
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required');
}

export const resend = new Resend(process.env.RESEND_API_KEY);
```

---

### Step 7: Replace Chat API Route

**File:** `app/api/chat/route.ts` (STEVEN REPLACES THIS ENTIRE FILE)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@openai/agents';
import { routerAgent } from '@/app/lib/ai/agents/router';
import { salesAgent } from '@/app/lib/ai/agents/sales';
import { casualChatAgent } from '@/app/lib/ai/agents/casual-chat';

// Map agent names to instances
const agents = {
  router: routerAgent,
  sales: salesAgent,
  casualChat: casualChatAgent,
};

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get last user message
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content;

    // Build conversation context (for agent memory)
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Run agent system (always starts with router)
    const result = await run(
      routerAgent,
      userMessage,
      {
        context: {
          conversationHistory,
        },
        agents,
        trace: {
          enabled: process.env.NODE_ENV === 'development',
        },
      }
    );

    // Return final response
    return NextResponse.json({
      message: result.finalOutput,
      // Optional debug info (remove in production)
      _debug: process.env.NODE_ENV === 'development' ? {
        agent: result.agent?.name,
        handoffs: result.handoffs,
      } : undefined,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
```

**What this does:**
- Receives messages from frontend (unchanged format)
- Starts with router agent (decides casual vs sales)
- Agent system handles handoffs automatically
- Returns response in same format frontend expects
- No frontend changes needed!

---

## 🧪 Testing Instructions for Steven

### 1. Local Development

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Open MSN Messenger
```

### 2. Test Cases

**Test A: Casual Chat (should route to Casual Chat Agent)**
```
User: "What's up?"
Expected: Friendly casual response

User: "Tell me about Jean"
Expected: Info about Jean's work

User: "Cool portfolio!"
Expected: Thanks + encouragement to explore
```

**Test B: Sales Intent (should route to Sales Agent)**
```
User: "I want to build a website"
Expected: Sales agent asks about project type

User: "E-commerce site for selling clothes"
Expected: Asks about features or timeline

[Continue conversation]
Expected: Collects all info → calls tool → sends email
```

**Test C: Escalation (Casual → Sales)**
```
User: "Hey"
Expected: Casual response

User: "Actually, I need help building something"
Expected: Switches to sales mode seamlessly
```

**Test D: De-escalation (Sales → Casual)**
```
User: "I want to build an app"
Expected: Sales mode activated

User: "Never mind, just browsing"
Expected: Switches back to casual chat
```

### 3. Email Verification

After sales conversation:
1. Check Jean's email (BOOKING_EMAIL_TO)
2. Verify all details captured correctly
3. Verify AI assessment makes sense
4. Verify reply-to is user's email

---

## 🐛 Debugging Tips for Steven

### Check Agent Handoffs

Enable debug mode in chat API:
```typescript
trace: {
  enabled: true, // Always on for debugging
}
```

Look for handoff logs in console.

### Test Individual Agents

Create test file `app/api/test-agent/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@openai/agents';
import { salesAgent } from '@/app/lib/ai/agents/sales';

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const result = await run(salesAgent, message);
  return NextResponse.json({ response: result.finalOutput });
}
```

Test with curl:
```bash
curl -X POST http://localhost:3000/api/test-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to build a website"}'
```

### Check Email Sending

Test email endpoint directly:
```bash
curl -X POST http://localhost:3000/api/booking/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sales_inquiry",
    "name": "Test User",
    "email": "test@example.com",
    "preferredTime": "Next week",
    "projectType": "Web app",
    "projectDescription": "Test project",
    "features": "User auth, dashboard",
    "timeline": "2 months",
    "budget": "$5k-$20k",
    "qualificationNotes": "Test lead"
  }'
```

Check Jean's email for test message.

---

## ✅ Definition of Done

Steven's implementation is complete when:

- [ ] All files created in correct folder structure
- [ ] All 3 agents defined with prompts in separate .txt files
- [ ] Email tool implemented
- [ ] Email API endpoint working
- [ ] `/api/chat/route.ts` replaced with agent system
- [ ] `/api/chat/welcome/route.ts` still works (untouched)
- [ ] `/api/chat/proactive/route.ts` still works (untouched)
- [ ] All 4 test cases pass (casual, sales, escalation, de-escalation)
- [ ] Email sent with all details + AI assessment
- [ ] No frontend changes needed (chatbot UI works unchanged)
- [ ] Deployed to Vercel successfully
- [ ] Jean receives test email with proper formatting

---

## 📊 Success Metrics

After deployment, track:
- **Conversion rate:** % of chat sessions that result in sales email
- **Qualification quality:** Are the leads actually qualified?
- **Agent accuracy:** Is router detecting intent correctly?
- **User experience:** Do conversations feel natural?

---

## 🎯 Future Enhancements (Not in Scope)

Ideas for later iterations:
- Add Support Agent (for troubleshooting portfolio)
- Add Technical Agent (for deep technical questions)
- Add CRM integration (store leads in database)
- Add calendar auto-booking (Cal.com integration)
- Add email auto-response (confirm receipt to user)

**But for now:** Keep it simple, ship the MVP! 🚀

---

## 📞 Questions for Jean Francois?

If Steven encounters issues:
1. Check this guide first
2. Review `AGENT_ARCHITECTURE.md` for architecture details
3. Check console logs for agent handoff traces
4. Test email endpoint independently

---

**Estimated Time:** 4-5 hours
**Complexity:** Medium
**Value:** High (better qualified leads = higher close rate)

Good luck Steven! 🚀
