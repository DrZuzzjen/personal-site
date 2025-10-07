# 🤖 Sales Agent Architecture - Multi-Agent System

## 🎯 Goal

Build an intelligent sales agent that can:
1. Detect when users want services (intent detection)
2. Switch to "sales mode" automatically
3. Ask qualifying questions conversationally
4. Collect project details + contact info
5. Send detailed email to YOU with all context

---

## 🏗️ Architecture: Multi-Agent System

```
User Message
    ↓
┌─────────────────────────┐
│   ROUTER AGENT          │ ← Decides which agent handles this
│   (Intent Detection)    │
└─────────────────────────┘
    ↓                ↓
[Casual Chat Agent]  [Sales Agent]
         │                │
         │                └─→ Qualification Questions
         │                     └─→ Data Collection
         │                          └─→ send_sales_inquiry() tool
         │
         └─→ Fun, friendly responses
```

---

## 🛠️ Tech Stack

### Core Libraries:
```bash
npm install @openai/agents zod@3
npm install @ai-sdk/groq  # Vercel AI SDK - Groq provider
npm install resend         # Email sending
```

**Why this stack:**
- ✅ **OpenAI Agents JS SDK**: Agent orchestration, handoffs, tool calling
- ✅ **Vercel AI SDK (@ai-sdk/groq)**: Use Groq with Agents SDK
- ✅ **Zod**: Validation (required by Agents SDK)
- ✅ **Resend**: Email sending (already decided)

---

## 📊 Agent Definitions

### 1. Router Agent (Intent Detection)

**Role:** Decide if user wants services or just chatting

```typescript
import { Agent } from '@openai/agents';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const routerAgent = new Agent({
  name: 'Router',
  model: groq('llama-3.3-70b-versatile'),
  instructions: `You are a router that detects user intent.

If user mentions ANY of these, handoff to Sales Agent:
- Building/developing a website, app, or software
- Need help with AI integration
- Want to hire or work with Jean Francois
- Asking about services, rates, or availability
- Project consultation or collaboration

Otherwise, handoff to Casual Chat Agent for friendly conversation.

Be sensitive to context - "I want to build something" = sales intent.`,

  handoffs: ['casualChat', 'sales'],
});
```

### 2. Casual Chat Agent

**Role:** Friendly MSN Messenger buddy

```typescript
const casualChatAgent = new Agent({
  name: 'CasualChat',
  model: groq('llama-3.3-70b-versatile'),
  instructions: `You're Jean Francois' friendly MSN Messenger assistant.

Personality:
- Short, punchy responses (MSN messenger style!)
- Use emojis occasionally 😄
- Be fun but not cringe
- Reference retro Windows 3.1 vibes

If user shows interest in Jean's work/services, say:
"Want to chat about your project? Happy to help!"
Then handoff to Sales Agent.

Otherwise keep it light and friendly!`,

  handoffs: ['sales'], // Can escalate to sales if needed
});
```

### 3. Sales Agent (Main Star ⭐)

**Role:** Qualify leads, collect details, send email

```typescript
import { z } from 'zod';

const salesAgent = new Agent({
  name: 'Sales',
  model: groq('llama-3.3-70b-versatile'),
  instructions: `You're Jean Francois' sales assistant in MSN Messenger.
A user wants to work with Jean or needs services.

YOUR PROCESS:
1. **Understand the Project** (2-3 questions)
   - What are they building? (web app, mobile, AI integration, etc.)
   - What features/functionality do they need?
   - Any specific tech requirements?

2. **Qualify Timeline & Budget** (1-2 questions)
   - What's their timeline? (weeks, months, ASAP?)
   - Budget range: <$5k | $5k-$20k | $20k-$50k | $50k+ | "not sure yet"

3. **Collect Contact Info** (required)
   - Full name
   - Email address
   - LinkedIn (optional but recommended)
   - Preferred meeting time

4. **Send Email**
   Once you have all info, call send_sales_inquiry tool with COMPLETE details.

STYLE:
- Conversational, not interrogative
- Ask 1-2 questions per message max
- Be consultative: "That sounds exciting!" "I can see why that'd be valuable"
- Don't rush - build rapport
- If they're vague, ask follow-ups: "Tell me more about that"

IMPORTANT:
- Don't ask all questions at once!
- Let them elaborate naturally
- Qualify but don't be pushy
- Once you have enough info → collect contact details → call tool`,

  tools: {
    send_sales_inquiry: {
      description: 'Send detailed sales inquiry email to Jean Francois',
      parameters: z.object({
        // Contact Info
        name: z.string().describe('Lead\'s full name'),
        email: z.string().email().describe('Lead\'s email address'),
        linkedin: z.string().optional().describe('LinkedIn profile URL'),
        preferredTime: z.string().describe('When they want to meet (e.g., "next Tuesday", "this week")'),

        // Project Details
        projectType: z.string().describe('Type of project: web app, mobile app, AI integration, etc.'),
        projectDescription: z.string().describe('Detailed description of what they want to build'),
        features: z.string().describe('Key features or functionality they mentioned'),
        techRequirements: z.string().optional().describe('Specific technologies they want/need'),

        // Qualification
        timeline: z.string().describe('Desired timeline: ASAP, weeks, months, etc.'),
        budget: z.enum(['<$5k', '$5k-$20k', '$20k-$50k', '$50k+', 'not sure yet']).describe('Budget range'),

        // Context
        qualificationNotes: z.string().describe('Your assessment: are they serious? technically savvy? well-funded? urgent need?'),
      }),
      handler: async (params) => {
        // This will call our email API
        const response = await fetch('/api/booking/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'sales_inquiry',
            ...params,
          }),
        });

        if (response.ok) {
          return 'Email sent successfully! Jean Francois will reach out soon.';
        } else {
          throw new Error('Failed to send email');
        }
      },
    },
  },

  handoffs: ['casualChat'], // Can de-escalate if user changes mind
});
```

---

## 🔄 Agent Orchestration in Next.js

**File:** `app/api/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Agent, run } from '@openai/agents';
import { createGroq } from '@ai-sdk/groq';

// Initialize Groq provider
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Define all agents (from above)
const routerAgent = new Agent({ /* ... */ });
const casualChatAgent = new Agent({ /* ... */ });
const salesAgent = new Agent({ /* ... */ });

// Map agent names to instances
const agents = {
  router: routerAgent,
  casualChat: casualChatAgent,
  sales: salesAgent,
};

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId } = await request.json();

    // Get last user message
    const userMessage = messages[messages.length - 1].content;

    // Start with router agent (always begins here)
    const result = await run(
      routerAgent,
      userMessage,
      {
        // Pass conversation history for context
        context: {
          conversationHistory: messages,
          sessionId,
        },

        // Enable agent handoffs
        agents,

        // Tracing for debugging
        trace: {
          enabled: process.env.NODE_ENV === 'development',
        },
      }
    );

    return NextResponse.json({
      message: result.finalOutput,
      agent: result.agent?.name, // Which agent responded
      handoffs: result.handoffs,  // Track agent switches
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
```

---

## 📧 Enhanced Email Endpoint

**File:** `app/api/booking/send-email/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { resend, BOOKING_EMAIL } from '@/app/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === 'sales_inquiry') {
      // Rich sales inquiry email
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

          <h3>🎯 AGENT ASSESSMENT:</h3>
          <p>${body.qualificationNotes}</p>

          <hr>
          <p><em>Reply directly to this email to reach ${body.name} at ${body.email}</em></p>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
      }

      return NextResponse.json({ success: true, emailId: data?.id });
    }

    // Handle other email types (simple booking, etc.)
    // ...

  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## 💬 Example Conversation Flow

```
User: "Hey, can you help me build an AI chatbot?"

[Router Agent] → Detects "build" + "AI" → Handoff to Sales Agent

Sales Agent: "Absolutely! AI chatbots are my specialty 😄
What kind of chatbot are you thinking? Customer service? Lead generation? Something else?"

User: "Customer service for my e-commerce site. Want it to handle returns, track orders, that kind of stuff"

Sales Agent: "Nice! That's super valuable for e-commerce.
Do you already have an order management system it needs to integrate with?"

User: "Yeah, using Shopify"

Sales Agent: "Perfect, Shopify has great APIs for that.
What's your timeline looking like? Need this ASAP or got some runway?"

User: "Need it in about 2 months, we're launching a big campaign"

Sales Agent: "Got it, 2 months is doable.
Budget-wise, are we talking under $5k, $5k-$20k range, or $20k+?"

User: "Probably $10k-$15k range"

Sales Agent: "Cool, that works! Let's get you on Jean's calendar.
What's your name?"

User: "Alex Chen"

Sales Agent: "Nice to meet you, Alex! And your email?"

User: "alex@mystore.com"

Sales Agent: "Perfect! Got a LinkedIn I can share with Jean?"

User: "linkedin.com/in/alexchen"

Sales Agent: "Awesome! When's good for you to chat? Next week work?"

User: "Yeah, Thursday afternoon?"

Sales Agent: "Perfect! I'm sending all the details to Jean right now... ✓

You'll get an email from Jean soon to lock in Thursday afternoon!
Excited to help you build this 🚀"

[Tool Called: send_sales_inquiry with all details]
```

**Email YOU receive:**
```
Subject: 🚀 New Sales Inquiry from Alex Chen

CONTACT INFO:
Name: Alex Chen
Email: alex@mystore.com
LinkedIn: linkedin.com/in/alexchen
Preferred Meeting: Thursday afternoon next week

PROJECT DETAILS:
Type: AI Chatbot Integration
Description: Customer service chatbot for Shopify e-commerce site
Key Features: Handle returns, track orders, customer inquiries
Tech Requirements: Shopify API integration

QUALIFICATION:
Timeline: 2 months (campaign launch deadline)
Budget: $5k-$20k (specifically mentioned $10k-$15k)

AGENT ASSESSMENT:
Highly qualified lead. Has clear use case, existing Shopify infrastructure,
defined timeline with business driver (campaign launch), and budget allocated.
Technically aware (mentioned APIs). Warm and engaged. Priority follow-up! 🔥
```

---

## 🎯 Benefits of This Architecture

✅ **Intelligent routing:** Router decides casual vs sales automatically
✅ **Natural conversation:** Sales agent asks questions progressively, not all at once
✅ **Rich context:** Email includes EVERYTHING said in conversation
✅ **Qualification built-in:** Agent assesses if lead is serious
✅ **Groq support:** Works with your existing Groq setup via Vercel AI SDK
✅ **Next.js native:** API routes, no external services needed
✅ **Extensible:** Easy to add more agents later (Support Agent, Tech Agent, etc.)

---

## 📦 Installation Steps

```bash
# 1. Install packages
npm install @openai/agents zod@3 @ai-sdk/groq resend

# 2. Set environment variables
GROQ_API_KEY=gsk_xxxxx
RESEND_API_KEY=re_xxxxx
BOOKING_EMAIL_TO=your-email@example.com

# 3. Implement agents (use code above)

# 4. Test in MSN Messenger
```

---

## 🧪 Testing Strategy

### 1. Test Intent Detection
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "I want to build a website"}]
  }'

# Should route to Sales Agent
```

### 2. Test Casual Chat
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What's up?"}]
  }'

# Should route to Casual Chat Agent
```

### 3. Test Full Sales Flow
- Open MSN Messenger
- Say: "I need help building an AI app"
- Follow conversation
- Check your email for sales inquiry

---

## 🚀 Deployment

**Vercel:**
1. Add environment variables in Vercel dashboard
2. Push to GitHub
3. Auto-deploy ✓

**No additional config needed** - agents run in your Next.js API routes!

---

## 📊 Comparison: Simple vs Agent Version

| Feature | Simple Version | Agent Version |
|---------|---------------|---------------|
| Intent detection | Manual keywords | AI-powered router |
| Question flow | Fixed script | Adaptive conversation |
| Context awareness | Basic | Full conversation history |
| Qualification | None | Built-in assessment |
| Extensibility | Limited | Easy to add agents |
| Implementation | 2-3 hours | 4-5 hours |
| Cost | $0/month | $0/month |

---

## 🎯 My Recommendation

**Start with Agent Version!** Why:
- ✅ Only 1-2 hours more work than simple version
- ✅ Way better user experience (natural conversation)
- ✅ You get qualified leads with assessment
- ✅ Extensible (add more agents easily later)
- ✅ Same cost ($0/month with Groq + Resend free tiers)

**The agent architecture is worth it** - your leads will be better qualified and you'll close more deals! 🎉

---

**Implementation Time:** 4-5 hours
**Cost:** $0/month
**Complexity:** Medium (but framework handles hard parts)
**ROI:** High (better qualified leads = higher close rate)

Let's build this! 🚀
