# MSN Messenger Booking System - Complete Implementation Guide

## 🎯 Goal
Add calendar booking functionality to MSN Messenger chatbot for direct lead conversion. Users can book meetings through conversational flow without leaving the chat.

---

## 📊 Recommended Tech Stack (All Free Tier)

### Services
1. **📅 Calendar:** Cal.com Cloud (free tier - 1 calendar, basic features)
2. **📧 Email:** Resend (3,000 emails/month free, built for Vercel)
3. **🗄️ Database:** Supabase (already installed - 500MB free)
4. **🤖 AI:** Llama 3.3 70B Versatile (already using - excellent function calling)
5. **📊 Analytics:** Vercel Analytics (already installed)

### NPM Packages
```bash
npm install @calcom/react-widget resend @react-email/components chrono-node zod @supabase/supabase-js
```

**Total Monthly Cost:** $0

---

## 🏗️ Architecture

```
MSN Messenger Chatbot (User)
    ↓
Llama 3.3 70B Function Calling (detects booking intent)
    ↓
Conversational Data Collection:
  - "When works for you?" → preferred date/time
  - "What's your name?" → name
  - "Your email?" → email
  - "LinkedIn? (optional)" → LinkedIn URL
    ↓
chrono-node (parses "next Tuesday 3pm" → ISO date)
    ↓
Zod (validates all input data)
    ↓
Cal.com API (creates booking + Google Calendar sync)
    ↓
Supabase (stores booking history + metadata)
    ↓
Resend + React Email (sends confirmation email)
    ↓
Cal.com Webhook → Supabase (updates booking status)
```

---

## 🎨 Conversational Flow Example

```
Bot: "Want to schedule a call? :)"
User: "Yes"
Bot: "Nice! When works for you?"
User: "Next Tuesday at 3pm"
Bot: "Perfect! What's your name?"
User: "John Smith"
Bot: "Cool! And your email?"
User: "john@example.com"
Bot: "Got it! Want to share your LinkedIn? (optional)"
User: "linkedin.com/in/johnsmith"
Bot: "Awesome! Booking your call for Tuesday Oct 15 at 3pm EST... ✓
Check your email for confirmation! :)"
```

---

## 🔧 Implementation Details

### 1. Cal.com Setup

**Why Cal.com:**
- ✅ Open source (AGPLv3)
- ✅ Built with Next.js (perfect stack match)
- ✅ API-first architecture
- ✅ Webhook support (BOOKING_CREATED, BOOKING_RESCHEDULED, BOOKING_CANCELLED)
- ✅ Google Calendar / Outlook sync
- ✅ Free tier available

**Setup Steps:**
1. Create account at [cal.com](https://cal.com)
2. Create an event type (e.g., "30 Min Meeting")
3. Get API key from Settings → Developer
4. Get Event Type ID from event settings

**API Integration:**
```typescript
const response = await fetch('https://api.cal.com/v2/bookings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    eventTypeId: process.env.CAL_EVENT_TYPE_ID,
    start: '2025-10-15T15:00:00Z', // ISO 8601
    attendee: {
      name: 'John Doe',
      email: 'john@example.com',
      timeZone: 'America/New_York',
    },
    metadata: {
      linkedin: 'https://linkedin.com/in/johndoe',
      source: 'MSN Messenger Chatbot'
    }
  }),
});
```

---

### 2. Resend Email Setup

**Why Resend over Nodemailer/SendGrid:**
- ✅ Built for Vercel/Next.js (by React Email team)
- ✅ 3,000 emails/month FREE (permanent, not trial)
- ✅ React Email templates (write emails as React components)
- ✅ 1-command setup
- ✅ Better deliverability than Gmail SMTP

**vs Nodemailer:** Requires SMTP config, no templates, spam issues
**vs SendGrid:** Only 100 emails/day for 60 days, then $20/month

**Setup Steps:**
1. Create account at [resend.com](https://resend.com)
2. Get API key
3. Add domain (or use resend.dev for testing)

**Implementation:**
```typescript
// app/api/send-confirmation/route.ts
import { Resend } from 'resend';
import { BookingConfirmationEmail } from '@/app/components/emails/BookingConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, date, time } = await req.json();

  await resend.emails.send({
    from: 'Jean Francois <noreply@fran-ai.dev>',
    to: email,
    subject: 'Meeting Confirmed! :)',
    react: BookingConfirmationEmail({ name, date, time }),
  });

  return NextResponse.json({ success: true });
}
```

**React Email Template:**
```tsx
// app/components/emails/BookingConfirmation.tsx
import { Html, Head, Body, Container, Heading, Text } from '@react-email/components';

export function BookingConfirmationEmail({ name, date, time }) {
  return (
    <Html>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f0f0f0' }}>
        <Container style={{ padding: '20px', backgroundColor: 'white' }}>
          <Heading>Hey {name}! :)</Heading>
          <Text>Your meeting with Jean Francois is confirmed!</Text>
          <Text><strong>Date:</strong> {date}</Text>
          <Text><strong>Time:</strong> {time}</Text>
          <Text>See you there!</Text>
          <Text>- Jean Francois</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

---

### 3. Llama 3.3 Function Calling

**Current Model:** `llama-3.3-70b-versatile` (already using in `/app/api/chat/route.ts`)

**Good News:** This model has **excellent native function calling** support (Groq's #1 recommended for tool use in 2025).

**Function Definitions:**
```typescript
const BOOKING_TOOLS = [
  {
    type: "function",
    function: {
      name: "initiate_booking",
      description: "Start booking process when user wants to schedule a meeting",
      parameters: {
        type: "object",
        properties: {
          user_intent: {
            type: "string",
            description: "User's original message expressing booking intent"
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "collect_booking_details",
      description: "Collects booking details as user provides them",
      parameters: {
        type: "object",
        properties: {
          preferred_date: {
            type: "string",
            description: "Natural language date (e.g., 'next Tuesday', 'Oct 15')"
          },
          preferred_time: {
            type: "string",
            description: "Time preference (e.g., '3pm', 'afternoon')"
          },
          name: { type: "string", description: "User's full name" },
          email: { type: "string", description: "User's email" },
          linkedin: { type: "string", description: "LinkedIn URL (optional)" }
        },
        required: []
      }
    }
  }
];
```

**Groq API Call:**
```typescript
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: getBookingSystemPrompt() },
      ...messages,
    ],
    tools: BOOKING_TOOLS,
    tool_choice: "auto",
    temperature: 0.8,
  }),
});

const data = await response.json();
const message = data.choices[0]?.message;

// Check for function calls
if (message.tool_calls) {
  const toolCall = message.tool_calls[0];
  const functionName = toolCall.function.name;
  const args = JSON.parse(toolCall.function.arguments);

  // Handle function call
  if (functionName === 'collect_booking_details') {
    // Process booking with collected data
  }
}
```

**System Prompt Addition:**
```typescript
function getBookingSystemPrompt() {
  return `${getPersonalityContext()}

## BOOKING CONVERSATION RULES:

You can help users book meetings! When they want to schedule:

1. **Detect booking intent** - Call initiate_booking() when user says:
   - "book a call"
   - "schedule a meeting"
   - "let's talk"
   - "can we chat?"

2. **Collect info naturally** - Ask ONE question at a time:
   - "When works for you?" → get date/time
   - "What's your name?" → get name
   - "And your email?" → get email
   - "LinkedIn profile? (optional)" → get linkedin

3. **Keep it casual** - Stay Jean Francois personality:
   "Cool! When works for you? :)"
   NOT: "Please provide your preferred date and time."

4. **Call collect_booking_details()** as you gather info

Example:
User: "I want to book a call"
You: "Nice! :) When works for you?"
User: "Next Tuesday at 3pm"
You: "Perfect! What's your name?"`;
}
```

---

### 4. Natural Language Date Parsing (chrono-node)

**Problem:** Users say "next Tuesday at 3pm" but APIs need ISO 8601 dates.

**Solution:** chrono-node library

```bash
npm install chrono-node
```

**Usage:**
```typescript
import * as chrono from 'chrono-node';

// Examples
chrono.parseDate('next Tuesday at 3pm');
// → Date object for next Tuesday 15:00

chrono.parseDate('tomorrow afternoon');
// → Date object for tomorrow ~14:00

chrono.parseDate('October 15th at 2:30pm');
// → Date object for Oct 15, 14:30

// With timezone context
const parsedDate = chrono.parseDate(
  'next Tuesday 3pm',
  new Date(),
  { timezone: 'America/New_York' }
);
```

**Features:**
- ✅ Relative dates ("tomorrow", "next week", "in 2 days")
- ✅ Multiple languages (Spanish: "martes próximo", "mañana")
- ✅ Timezone-aware
- ✅ Ambiguous times ("afternoon" → 14:00, "morning" → 09:00)
- ✅ Very lightweight (~100KB)

---

### 5. Data Validation with Zod

**Setup:**
```bash
npm install zod
```

**Schema:**
```typescript
// app/lib/validation.ts
import { z } from 'zod';

export const bookingSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),

  email: z.string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),

  linkedin: z.string()
    .url('Invalid URL')
    .refine((url) => url.includes('linkedin.com'), {
      message: 'Must be a LinkedIn URL'
    })
    .optional()
    .or(z.literal('')),

  preferredDate: z.string()
    .min(1, 'Date is required'),

  preferredTime: z.string()
    .optional(),

  timezone: z.string()
    .default('UTC'),
});

export type BookingData = z.infer<typeof bookingSchema>;
```

**Usage:**
```typescript
try {
  const validatedData = bookingSchema.parse(body);
  // Proceed with booking
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
}
```

---

### 6. Supabase Database Schema

**Table: bookings**
```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),

  -- User info
  name text not null,
  email text not null,
  linkedin text,

  -- Booking details
  booking_date timestamptz not null,
  timezone text not null,
  cal_booking_id text not null unique,

  -- Status tracking
  status text default 'confirmed' check (status in ('confirmed', 'rescheduled', 'cancelled')),

  -- Metadata
  metadata jsonb,

  -- Indexes
  constraint bookings_email_check check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for fast lookups
create index idx_bookings_email on bookings(email);
create index idx_bookings_date on bookings(booking_date);
create index idx_bookings_status on bookings(status);
```

**Supabase Client Setup:**
```typescript
// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
);
```

---

## 📁 File Structure

```
app/
├── api/
│   ├── chat/
│   │   └── route.ts              # Modified with function calling
│   ├── booking/
│   │   ├── create/route.ts       # Create booking
│   │   ├── availability/route.ts # Check Cal.com slots
│   │   └── confirm/route.ts      # Send confirmation
│   └── webhooks/
│       └── cal/route.ts          # Handle Cal.com events
├── lib/
│   ├── cal.ts                    # Cal.com API helpers
│   ├── email.ts                  # Resend helpers
│   ├── validation.ts             # Zod schemas
│   ├── dateParser.ts             # chrono-node helpers
│   └── supabase.ts               # Supabase client
└── components/
    └── emails/
        └── BookingConfirmation.tsx # React Email template
```

---

## 🚀 Implementation Roadmap

### Phase 1: Basic Booking (2-3 hours)
- [ ] Set up Cal.com account + API key
- [ ] Set up Resend account + API key
- [ ] Modify chat API route to include function calling
- [ ] Create basic booking API route
- [ ] Test conversational flow

### Phase 2: Enhanced Experience (2-3 hours)
- [ ] Add chrono-node for natural language dates
- [ ] Create React Email confirmation template
- [ ] Set up Cal.com webhooks
- [ ] Add error handling and edge cases
- [ ] Test across timezones

### Phase 3: Polish (1-2 hours)
- [ ] Store bookings in Supabase
- [ ] Add "View my bookings" command
- [ ] Add rescheduling/cancellation flow
- [ ] Multilingual support (Spanish/English)

**Total Time:** 6-8 hours

---

## 💰 Cost Breakdown

| Service | Tier | Monthly Cost | Limits |
|---------|------|--------------|--------|
| **Cal.com** | Cloud Free | $0 | 1 calendar, basic features |
| **Resend** | Free | $0 | 3,000 emails/month (permanent) |
| **Groq** | Free | $0 | Check console limits |
| **Supabase** | Free | $0 | 500MB, unlimited API |
| **Vercel** | Hobby | $0 | Already using |
| **TOTAL** | | **$0/month** | |

**Upgrade Paths:**
- Cal.com Teams: $15/user/month (more calendars)
- Resend Pro: Scales with usage
- Groq Developer: 10x higher limits
- Supabase Pro: $25/month (8GB storage)

---

## 🔐 Environment Variables

```bash
# .env.local

# Cal.com
CAL_API_KEY=cal_live_xxxxx
CAL_EVENT_TYPE_ID=12345

# Resend
RESEND_API_KEY=re_xxxxx

# Groq (already have)
GROQ_API_KEY=gsk_xxxxx

# Supabase (already have)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

---

## 📝 Complete Booking API Route Example

```typescript
// app/api/booking/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as chrono from 'chrono-node';
import { Resend } from 'resend';
import { supabase } from '@/app/lib/supabase';
import { BookingConfirmationEmail } from '@/app/components/emails/BookingConfirmation';
import { bookingSchema } from '@/app/lib/validation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // 1. Validate input
    const body = await req.json();
    const data = bookingSchema.parse(body);

    // 2. Parse natural language date
    const dateString = `${data.preferredDate} ${data.preferredTime || ''}`;
    const parsedDate = chrono.parseDate(dateString, new Date(), {
      timezone: data.timezone
    });

    if (!parsedDate) {
      return NextResponse.json(
        { error: 'Could not understand that date. Try "next Tuesday at 3pm"' },
        { status: 400 }
      );
    }

    // 3. Create Cal.com booking
    const calResponse = await fetch('https://api.cal.com/v2/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventTypeId: process.env.CAL_EVENT_TYPE_ID,
        start: parsedDate.toISOString(),
        attendee: {
          name: data.name,
          email: data.email,
          timeZone: data.timezone,
        },
        metadata: {
          linkedin: data.linkedin,
          source: 'MSN Messenger Chatbot',
        },
      }),
    });

    if (!calResponse.ok) {
      const error = await calResponse.json();
      throw new Error(`Cal.com error: ${error.message}`);
    }

    const booking = await calResponse.json();

    // 4. Store in Supabase
    const { error: dbError } = await supabase
      .from('bookings')
      .insert({
        name: data.name,
        email: data.email,
        linkedin: data.linkedin,
        booking_date: parsedDate.toISOString(),
        timezone: data.timezone,
        cal_booking_id: booking.id,
        status: 'confirmed',
        metadata: {
          source: 'MSN Messenger',
          raw_date_input: data.preferredDate,
        }
      });

    if (dbError) {
      console.error('Supabase error:', dbError);
      // Continue anyway - booking is confirmed
    }

    // 5. Send confirmation email
    await resend.emails.send({
      from: 'Jean Francois <noreply@fran-ai.dev>',
      to: data.email,
      subject: 'Meeting Confirmed! :)',
      react: BookingConfirmationEmail({
        name: data.name,
        date: parsedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: parsedDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        timezone: data.timezone,
      }),
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        date: parsedDate.toISOString(),
        calendarLink: booking.url,
      }
    });

  } catch (error) {
    console.error('Booking error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Booking failed. Please try again?' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Success Metrics

Track these in your analytics:

1. **Booking Intent Detection Rate** - How many users express booking intent?
2. **Booking Completion Rate** - % who finish the full flow
3. **Drop-off Points** - Where do users abandon?
4. **Average Time to Book** - From intent to confirmation
5. **Calendar Sync Rate** - How many actually show up?

Use Supabase + Vercel Analytics to track these.

---

## 🔗 Useful Links

- [Cal.com API Docs](https://cal.com/docs/api-reference)
- [Resend Docs](https://resend.com/docs)
- [React Email Examples](https://react.email/examples)
- [Groq Function Calling](https://console.groq.com/docs/tool-use)
- [chrono-node GitHub](https://github.com/wanasit/chrono)
- [Zod Documentation](https://zod.dev)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

## 🎨 Alternative: Quick Embed Option

If you want to skip the conversational flow and just embed Cal.com:

```tsx
import Cal from '@calcom/react-widget';

// In MSN Messenger or separate window
<Cal
  calLink="jeanfrancois/30min"
  config={{
    inline: true,
    theme: 'dark',
  }}
/>
```

**Pros:** 5 minutes to implement
**Cons:** Less conversational, not as cool as chatbot flow

---

## 📋 Next Steps

1. ✅ Research completed and documented
2. ⏳ Create Cal.com + Resend accounts
3. ⏳ Get API keys
4. ⏳ Install packages
5. ⏳ Implement Phase 1 (basic booking)
6. ⏳ Test with different date formats
7. ⏳ Deploy to production

**Ready to implement when you are!** 🚀

---

*Last Updated: October 6, 2025*
*Researched and documented for fran-ai.dev portfolio project*
