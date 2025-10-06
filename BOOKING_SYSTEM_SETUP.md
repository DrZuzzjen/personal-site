# 🚀 Booking System - Complete Setup Guide for Autonomous Implementation

## 📋 Pre-Implementation Checklist

This guide contains **everything** needed for a developer to implement the booking system autonomously. Follow each step sequentially.

---

## 1️⃣ Required API Keys & Accounts

### ✅ Already Have
- [x] **Groq API** - Already configured for MSN Messenger chatbot
- [x] **Vercel** - Deployment platform (auto-deploy on push)
- [x] **Google Analytics** - Already integrated

### 🆕 Need to Create

#### **Cal.com (Calendar Booking)**
**Status:** ⚠️ NOT CREATED YET

**Steps:**
1. Go to https://cal.com/signup
2. Sign up with GitHub or email
3. Complete onboarding (connect Google Calendar or Outlook)
4. Create an event type:
   - Name: "30 Min Meeting with Jean Francois"
   - Duration: 30 minutes
   - Location: Google Meet (auto-generated)
   - Availability: Set your working hours
5. Get API credentials:
   - Go to Settings → Developer → API Keys
   - Click "Create API Key"
   - Save the API key (starts with `cal_live_...`)
6. Get Event Type ID:
   - Go to Event Types → Click on "30 Min Meeting"
   - Copy the ID from the URL (e.g., `evt_xxxxxxxxxxxxx`)

**Required Environment Variables:**
```bash
CAL_API_KEY=cal_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CAL_EVENT_TYPE_ID=evt_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

#### **Resend (Email Service)**
**Status:** ⚠️ NOT CREATED YET

**Steps:**
1. Go to https://resend.com/signup
2. Sign up with GitHub or email
3. Verify your email
4. Add your domain (or use Resend's test domain for now):
   - Go to Domains → Add Domain
   - For testing: Can send to verified emails without domain
   - For production: Add DNS records for your domain (fran-ai.dev)
5. Create API key:
   - Go to API Keys → Create API Key
   - Name: "Production"
   - Permission: "Sending access"
   - Save the key (starts with `re_...`)
6. Set sender email:
   - Default: `onboarding@resend.dev` (for testing)
   - Production: `hello@fran-ai.dev` (after domain verification)

**Required Environment Variables:**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=hello@fran-ai.dev
```

**DNS Records for Production (fran-ai.dev):**
```
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend dashboard]

Type: MX
Name: @
Value: feedback-smtp.resend.com
Priority: 10
```

---

#### **Supabase (Database)**
**Status:** ⚠️ NOT CREATED YET (package not installed)

**Option A: Supabase Cloud (Recommended - Easiest)**

1. Go to https://supabase.com/dashboard/sign-up
2. Sign up with GitHub
3. Create new project:
   - Organization: Personal
   - Project name: "personal-site-bookings"
   - Database password: Generate strong password (SAVE IT!)
   - Region: Choose closest to you (e.g., US East)
   - Plan: Free tier (500MB database, 50MB file storage)
4. Wait for project to provision (~2 minutes)
5. Get API credentials:
   - Go to Project Settings → API
   - Copy "Project URL" (e.g., `https://xxxxx.supabase.co`)
   - Copy "anon public" key (starts with `eyJ...`)
   - Copy "service_role" key (starts with `eyJ...`) - **KEEP SECRET!**
6. Create database table (see schema below)

**Required Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Option B: Supabase CLI (Local Development + Production)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to cloud project (after creating on dashboard)
supabase link --project-ref xxxxxxxxxxxxx

# Apply migrations
supabase db push

# Get connection string
supabase status
```

---

## 2️⃣ Database Schema

### Supabase SQL Migration

**File:** `supabase/migrations/001_create_bookings_table.sql`

```sql
-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Booking details
  cal_booking_id TEXT UNIQUE NOT NULL,
  event_type_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, rescheduled

  -- Attendee information
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_linkedin TEXT,
  attendee_timezone TEXT,

  -- Meeting details
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  meeting_url TEXT,

  -- Metadata
  conversation_context JSONB, -- Store chat history for context
  user_agent TEXT,
  user_language TEXT,

  -- Indexes
  INDEX idx_bookings_email (attendee_email),
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_start_time (start_time),
  INDEX idx_bookings_cal_booking_id (cal_booking_id)
);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything
CREATE POLICY "Service role can do everything"
  ON bookings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Public can read their own bookings by email
CREATE POLICY "Users can read their own bookings"
  ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (attendee_email = current_setting('request.jwt.claims')::json->>'email');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for analytics (optional)
CREATE OR REPLACE VIEW booking_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as booking_date,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
  COUNT(DISTINCT attendee_email) as unique_users
FROM bookings
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY booking_date DESC;
```

**Apply Migration:**

Option 1 - Via Supabase Dashboard:
1. Go to SQL Editor in dashboard
2. Paste the SQL above
3. Click "Run"

Option 2 - Via CLI:
```bash
supabase migration new create_bookings_table
# Paste SQL into generated file
supabase db push
```

---

## 3️⃣ Environment Variables Setup

### Update `.env.example`

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-P6TLW72YRQ

# Groq API (for MSN Chatbot)
GROQ_API_KEY=your_groq_api_key_here

# Cal.com (Calendar Booking)
CAL_API_KEY=cal_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CAL_EVENT_TYPE_ID=evt_xxxxxxxxxxxxxxxxxxxxxxxx

# Resend (Email Service)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=hello@fran-ai.dev

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Create `.env.local` (For Local Development)

```bash
# Copy example and fill with real values
cp .env.example .env.local

# Edit with your actual API keys
# DO NOT COMMIT THIS FILE (already in .gitignore)
```

### Configure Vercel Environment Variables

```bash
# Add via Vercel CLI
vercel env add CAL_API_KEY
vercel env add CAL_EVENT_TYPE_ID
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Or via Vercel Dashboard:
# 1. Go to project settings
# 2. Environment Variables
# 3. Add each variable for Production, Preview, Development
```

---

## 4️⃣ NPM Packages Installation

```bash
# Install all required packages
npm install @calcom/react-widget resend @react-email/components chrono-node zod @supabase/supabase-js

# Package purposes:
# - @calcom/react-widget: Cal.com embed widget (optional UI)
# - resend: Email sending service
# - @react-email/components: React-based email templates
# - chrono-node: Natural language date/time parsing
# - zod: Data validation schemas
# - @supabase/supabase-js: Supabase client library
```

---

## 5️⃣ File Structure for Implementation

```
app/
├── api/
│   ├── chat/
│   │   └── route.ts (MODIFY - add function calling)
│   ├── bookings/
│   │   ├── create/
│   │   │   └── route.ts (NEW - create booking endpoint)
│   │   ├── webhook/
│   │   │   └── route.ts (NEW - Cal.com webhook handler)
│   │   └── check-availability/
│   │       └── route.ts (NEW - check available slots)
│   └── emails/
│       └── send-confirmation/
│           └── route.ts (NEW - send confirmation email)
├── lib/
│   ├── supabase.ts (NEW - Supabase client)
│   ├── calcom.ts (NEW - Cal.com API wrapper)
│   ├── resend.ts (NEW - Email service)
│   └── booking-schemas.ts (NEW - Zod validation schemas)
└── emails/
    └── BookingConfirmation.tsx (NEW - React email template)
```

---

## 6️⃣ Testing Checklist

### Before Implementation
- [ ] All API keys created and saved
- [ ] Supabase project created and database schema applied
- [ ] Environment variables added to Vercel
- [ ] `.env.local` created with real keys
- [ ] All NPM packages installed (`npm install`)

### During Implementation
- [ ] Test Cal.com API with Postman/curl first
- [ ] Test Resend email sending with test email
- [ ] Test Supabase connection and CRUD operations
- [ ] Test chrono-node date parsing with various inputs
- [ ] Test Llama function calling with booking intent

### After Implementation
- [ ] End-to-end booking flow works in local dev
- [ ] Email confirmation arrives and looks good
- [ ] Booking appears in Supabase database
- [ ] Booking appears in Cal.com dashboard
- [ ] Calendar event created in Google Calendar
- [ ] Webhook handler processes status updates
- [ ] Error handling for all edge cases

---

## 7️⃣ Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with real API keys

# 3. Initialize Supabase (if using CLI)
supabase init
supabase start

# 4. Apply database migrations
supabase db push
# OR paste SQL directly in Supabase dashboard

# 5. Start dev server
npm run dev

# 6. Test booking flow
# Open http://localhost:3000
# Open MSN Messenger
# Type: "I want to book a meeting"
```

---

## 8️⃣ Troubleshooting

### Cal.com API Issues
```bash
# Test API key
curl -X GET https://api.cal.com/v2/me \
  -H "Authorization: Bearer $CAL_API_KEY"

# Should return your user info
```

### Resend Email Issues
```bash
# Test email sending
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "text": "This is a test"
  }'

# Check response
```

### Supabase Connection Issues
```bash
# Test connection
node -e "
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  supabase.from('bookings').select('count').then(console.log);
"
```

### Environment Variables Not Loading
```bash
# Verify .env.local exists and is not in .gitignore
cat .env.local

# Restart dev server after adding variables
npm run dev
```

---

## 9️⃣ Security Checklist

- [ ] Never commit API keys to Git
- [ ] Use `SUPABASE_SERVICE_ROLE_KEY` only on server-side
- [ ] Validate all user input with Zod schemas
- [ ] Sanitize email addresses before sending
- [ ] Rate limit booking API endpoints
- [ ] Verify Cal.com webhook signatures
- [ ] Use HTTPS for all API calls
- [ ] Set proper CORS headers on API routes

---

## 🔟 Cost Breakdown (All Free Tier)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Cal.com | 1 calendar, unlimited bookings | $0 |
| Resend | 3,000 emails/month | $0 |
| Supabase | 500MB database, 1GB bandwidth | $0 |
| Groq (Llama 3.3) | 6,000 requests/day | $0 |
| Vercel | 100GB bandwidth | $0 |
| **Total** | | **$0/month** |

---

## 📚 Additional Resources

- **Cal.com API Docs:** https://cal.com/docs/api-reference/v2
- **Resend Docs:** https://resend.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Llama Function Calling:** https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_1/#json-based-tool-calling
- **chrono-node:** https://github.com/wanasit/chrono
- **Zod:** https://zod.dev/
- **React Email:** https://react.email/docs/introduction

---

## ✅ Final Pre-Implementation Checklist

**Account Creation:**
- [ ] Cal.com account created
- [ ] Cal.com API key obtained
- [ ] Cal.com Event Type ID obtained
- [ ] Resend account created
- [ ] Resend API key obtained
- [ ] Supabase project created
- [ ] Supabase API keys obtained

**Configuration:**
- [ ] `.env.local` created with all keys
- [ ] Vercel environment variables configured
- [ ] Database schema applied to Supabase
- [ ] NPM packages installed

**Testing:**
- [ ] Cal.com API tested with curl
- [ ] Resend email tested
- [ ] Supabase connection tested

**Ready to Implement:** YES / NO

---

## 🎯 Implementation Reference

See `BOOKING_SYSTEM_RESEARCH.md` for:
- Complete code examples
- Step-by-step implementation phases
- Function calling patterns
- Email templates
- API integration code

**Estimated Implementation Time:** 6-8 hours for complete feature

---

**Last Updated:** 2025-10-06
**Status:** Ready for autonomous implementation after API keys are configured
