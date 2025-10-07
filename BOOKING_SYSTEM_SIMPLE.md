# 🚀 Simple Booking System - Email-Only Version

## 🎯 What It Does

User chats with MSN Messenger → Bot collects info → **Email sent to YOU** → You handle booking manually

**Perfect MVP:** No databases, no calendar APIs, just a simple lead capture via email!

---

## 💰 Cost: **$0/month**

Only need:
- ✅ **Resend** (3,000 emails/month FREE - Vercel team's service)
- ✅ **Groq** (already have - FREE)

That's it! 🎉

---

## 🔧 Setup (5 Minutes)

### 1. Create Resend Account

1. Go to https://resend.com/signup
2. Sign up with GitHub
3. Verify email
4. Go to API Keys → Create API Key
5. Copy the key (starts with `re_...`)

### 2. Add Environment Variables

**Local (`.env.local`):**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BOOKING_EMAIL_TO=your-email@example.com
```

**Vercel Dashboard:**
- Add `RESEND_API_KEY`
- Add `BOOKING_EMAIL_TO=your-email@example.com`

### 3. Install Package

```bash
npm install resend
```

**That's it!** No database, no Cal.com, no complexity.

---

## 💬 Conversational Flow

```
User: "I want to book a meeting"

Bot: "Awesome! Let's get you scheduled. What's your name?"
User: "John Smith"

Bot: "Nice to meet you, John! What's your email?"
User: "john@example.com"

Bot: "Got it! When would you like to meet? (e.g., 'next Tuesday at 3pm')"
User: "This Friday at 2pm"

Bot: "Perfect! Want to share your LinkedIn? (optional, just type 'skip' if not)"
User: "linkedin.com/in/johnsmith"

Bot: "Excellent! I've sent your meeting request to Jean Francois.
You'll hear back soon to confirm the time! 🎉"
```

**Meanwhile:** You receive an email with all the info → You reply to book it manually.

---

## 📧 Email You'll Receive

**Subject:** 🗓️ New Meeting Request from John Smith

**Body:**
```
New meeting request via MSN Messenger Chatbot!

👤 Name: John Smith
📧 Email: john@example.com
🕐 Preferred Time: This Friday at 2pm
💼 LinkedIn: linkedin.com/in/johnsmith

📝 Chat Context:
User asked about your AI consulting services and
wants to discuss a potential project.

---
Reply directly to john@example.com to confirm the meeting.
```

---

## 🛠️ Implementation (2-3 Hours)

### File Structure

```
app/
├── api/
│   ├── chat/
│   │   └── route.ts (MODIFY - add function calling)
│   └── booking/
│       └── send-email/
│           └── route.ts (NEW - send email to you)
└── lib/
    └── resend.ts (NEW - Resend client)
```

### 1. Create Resend Client

**File:** `app/lib/resend.ts`

```typescript
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const BOOKING_EMAIL = process.env.BOOKING_EMAIL_TO || 'your-fallback@example.com';
```

### 2. Create Email Sending Endpoint

**File:** `app/api/booking/send-email/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { resend, BOOKING_EMAIL } from '@/app/lib/resend';

interface BookingRequest {
  name: string;
  email: string;
  preferredTime: string;
  linkedin?: string;
  chatContext?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.preferredTime) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, or preferredTime' },
        { status: 400 }
      );
    }

    // Send email to YOU
    const { data, error } = await resend.emails.send({
      from: 'MSN Messenger <onboarding@resend.dev>', // Use verified domain in production
      to: BOOKING_EMAIL,
      replyTo: body.email, // User's email for easy reply
      subject: `🗓️ New Meeting Request from ${body.name}`,
      html: `
        <h2>New meeting request via MSN Messenger Chatbot!</h2>

        <p><strong>👤 Name:</strong> ${body.name}</p>
        <p><strong>📧 Email:</strong> <a href="mailto:${body.email}">${body.email}</a></p>
        <p><strong>🕐 Preferred Time:</strong> ${body.preferredTime}</p>
        ${body.linkedin ? `<p><strong>💼 LinkedIn:</strong> <a href="${body.linkedin}">${body.linkedin}</a></p>` : ''}

        ${body.chatContext ? `
          <hr>
          <h3>📝 Chat Context:</h3>
          <p>${body.chatContext}</p>
        ` : ''}

        <hr>
        <p><em>Reply directly to this email to reach the user at ${body.email}</em></p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id
    });

  } catch (error) {
    console.error('Booking email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Add Function Calling to Chat

**File:** `app/api/chat/route.ts` (MODIFY)

Add this tool definition to your Llama function calling:

```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'send_booking_request',
      description: 'Send a meeting booking request to Jean Francois when user wants to schedule a call or meeting',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'User\'s full name',
          },
          email: {
            type: 'string',
            description: 'User\'s email address',
          },
          preferredTime: {
            type: 'string',
            description: 'When user wants to meet (e.g., "next Tuesday at 3pm", "this Friday afternoon")',
          },
          linkedin: {
            type: 'string',
            description: 'User\'s LinkedIn profile URL (optional)',
          },
        },
        required: ['name', 'email', 'preferredTime'],
      },
    },
  },
];

// When Llama calls the function:
if (toolCall.function.name === 'send_booking_request') {
  const args = JSON.parse(toolCall.function.arguments);

  // Call your email API
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/booking/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: args.name,
      email: args.email,
      preferredTime: args.preferredTime,
      linkedin: args.linkedin,
      chatContext: conversationSummary, // Pass recent chat messages
    }),
  });

  if (response.ok) {
    return "Perfect! I've sent your meeting request to Jean Francois. You'll hear back soon via email to confirm! 🎉";
  } else {
    return "Oops, something went wrong. Can you try again or email directly at hello@fran-ai.dev?";
  }
}
```

---

## 🧪 Testing

### 1. Test Email Sending Directly

```bash
curl -X POST http://localhost:3000/api/booking/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "preferredTime": "Next Tuesday at 3pm",
    "linkedin": "linkedin.com/in/johnsmith"
  }'
```

Check your email! You should receive the booking request.

### 2. Test via MSN Messenger

1. Open MSN Messenger chatbot
2. Type: "I want to book a meeting"
3. Answer the bot's questions
4. Check your email for the request

---

## 📊 What You Get

**Email contains:**
- ✅ User's name
- ✅ User's email (set as Reply-To for easy response)
- ✅ Preferred meeting time
- ✅ LinkedIn profile (optional)
- ✅ Chat context (what they talked about)

**You manually:**
- 📧 Reply to their email
- 📅 Send calendar invite
- 🤝 Close the deal!

---

## 🎯 Benefits of Simple Version

✅ **Fast:** 2-3 hours vs 6-8 hours
✅ **Simple:** No database, no webhooks, no Cal.com
✅ **Flexible:** You control the booking process
✅ **Free:** $0/month (3k emails free)
✅ **Personal:** You reply directly = more personal touch
✅ **MVP Ready:** Ship it, test it, iterate later

---

## 🚀 Future Upgrades (Optional)

**Phase 2 (if needed later):**
- Add Supabase to store booking history
- Add Cal.com for auto-booking
- Add automated confirmation emails
- Add availability checking

**But honestly?** This simple version might be all you need! 🎉

---

## 📋 Implementation Checklist

**Setup (5 min):**
- [ ] Create Resend account
- [ ] Get API key
- [ ] Add env vars to Vercel
- [ ] Install package: `npm install resend`

**Code (2-3 hours):**
- [ ] Create `app/lib/resend.ts`
- [ ] Create `app/api/booking/send-email/route.ts`
- [ ] Modify `app/api/chat/route.ts` - add function calling
- [ ] Test email sending
- [ ] Test via MSN Messenger

**Done! 🎉**

---

**Cost:** $0/month
**Time:** 2-3 hours
**Complexity:** Low
**Perfect for:** MVP, testing demand, keeping control

Let's ship the simple version first! 🚀
