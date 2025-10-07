# 🚀 Sales Agent v2.0 - Implementation Guide for Steven

## Mission Overview
Fix the MSN Messenger sales agent to:
1. **Remember what it already collected** (no more asking twice)
2. **Validate data before sending** (no fake emails like `pepe@pepus.pep`)
3. **Send email only when ALL data is valid**
4. **Show clear confirmation to user** (✅ Email sent!)

---

## 🧠 The Problem (Current Behavior)

### What's Wrong:
```
User: "Quiero un sitio web como este"
Agent: "¿Cuál es tu email?"

User: "pepe@pepus.pep"
Agent: "¿Cuál es tu nombre completo?" ❌ Should reject bad email!

User: "Pepe Alberto Pestañas"
Agent: "Te enviaré un correo..." ❌ Email NEVER actually sent!

[User has NO IDEA if it worked] ❌ No confirmation!
```

### Why It Fails:
- **No memory**: Agent doesn't track what fields it already has
- **No validation**: Accepts fake emails without checking
- **No trigger**: Doesn't know when to actually send the email
- **No feedback**: User left hanging, no visual confirmation

---

## ✅ The Solution (Multi-Agent Flow)

```
User Message
    ↓
Router Agent (casual vs sales?)
    ↓
Sales Agent (with state tracking)
    ↓
Field Extractor (parse conversation)
    ↓
Are all fields complete? ─────→ NO → Continue asking
    ↓ YES
Validator Agent (double-check)
    ↓
Send Email 📧
    ↓
Return confirmation message + system message
    ↓
Frontend shows: "✅ Email sent successfully!"
```

---

## 🎯 Available Models (Groq - Oct 2025)

### **Recommended for Text Generation:**

| Model ID | Context | Owner | Best For |
|----------|---------|-------|----------|
| `moonshotai/kimi-k2-instruct-0905` | 262K | Moonshot AI | 🌟 **BEST** - Huge context, multilingual |
| `deepseek-r1-distill-llama-70b` | 131K | DeepSeek/Meta | 🧠 Reasoning, complex logic |
| `llama-3.3-70b-versatile` | 131K | Meta | ⚡ **CURRENT** - Fast, versatile |
| `qwen/qwen3-32b` | 131K | Alibaba | 🌏 Great multilingual support |
| `groq/compound` | 131K | Groq | 🔥 Groq's newest model |
| `openai/gpt-oss-120b` | 131K | OpenAI | 🚀 Large, powerful |
| `meta-llama/llama-4-maverick-17b-128e-instruct` | 131K | Meta | 💪 Llama 4 series |
| `llama-3.1-8b-instant` | 131K | Meta | ⚡ **FASTEST** - Small, quick |
| `gemma2-9b-it` | 8K | Google | 🎯 Efficient, smaller tasks |

### **Specialized Models:**

| Model ID | Use Case |
|----------|----------|
| `meta-llama/llama-guard-4-12b` | Safety/content filtering |
| `meta-llama/llama-prompt-guard-2-86m` | Prompt injection detection |
| `whisper-large-v3-turbo` | Speech-to-text (audio) |
| `playai-tts` | Text-to-speech (audio) |

---

## 📋 Model Selection Strategy

### **Option 1: Single Model (Simplest)**
Use `llama-3.3-70b-versatile` for everything, just vary temperature:
- **Sales Agent**: temp 0.8 (conversational)
- **Field Extractor**: temp 0.3 (accurate parsing)
- **Validator**: temp 0.2 (strict validation)

### **Option 2: Multi-Model (Better Performance)**
| Agent | Model | Why |
|-------|-------|-----|
| Router | `llama-3.1-8b-instant` | Fast intent detection |
| Casual Chat | `llama-3.3-70b-versatile` | Conversational |
| Sales Agent | `moonshotai/kimi-k2-instruct-0905` | 🌟 Best multilingual + long context |
| Field Extractor | `qwen/qwen3-32b` | Great at structured data |
| Validator | `deepseek-r1-distill-llama-70b` | 🧠 Reasoning for validation |

### **Option 3: Recommended Balanced**
| Agent | Model | Why |
|-------|-------|-----|
| Router | `llama-3.1-8b-instant` | Fast, cheap |
| Casual Chat | `llama-3.3-70b-versatile` | Current favorite |
| Sales Agent | `moonshotai/kimi-k2-instruct-0905` | 🌟 262K context, multilingual |
| Field Extractor | `llama-3.3-70b-versatile` | Reliable |
| Validator | `deepseek-r1-distill-llama-70b` | 🧠 Smart validation |

---

## 🏗️ Implementation Steps

### **Phase 1: Backend Changes (app/api/chat/route.ts)**

#### 1.1 Add Field Extraction Function
```typescript
import { generateText } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';

interface SalesFields {
  name: string | null;
  email: string | null;
  projectType: string | null;
  budget: string | null;
  timeline: string | null;
}

async function extractFields(conversationHistory: Message[]): Promise<SalesFields> {
  const extractionPrompt = `
Extract sales information from this conversation.
Return ONLY valid JSON, no markdown, no explanation.

CONVERSATION:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

EXTRACTION RULES:
- name: Full name (first + last) or null if not provided
- email: Valid email address or null (if fake like "pepus.pep" → null)
- projectType: What they want built (description) or null
- budget: Amount with currency symbol (e.g., "$5,000" or "$5k-$10k") or null
- timeline: Timeframe (e.g., "2 months", "3 weeks") or null

EXAMPLES:
- "5k" → budget: "$5,000"
- "2 meses" → timeline: "2 months"
- "lo mismo que esto" → projectType: "Retro portfolio website similar to this"
- "pepe@pepus.pep" → email: null (fake domain)

Return JSON:
{
  "name": "...",
  "email": "...",
  "projectType": "...",
  "budget": "...",
  "timeline": "..."
}
`;

  const response = await generateText({
    model: groq('llama-3.3-70b-versatile'), // Or use kimi-k2 for better accuracy
    prompt: extractionPrompt,
    temperature: 0.3, // Low temp for accuracy
  });

  // Extract JSON from response (handle markdown wrapping)
  let jsonText = response.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse extraction response:', jsonText);
    return {
      name: null,
      email: null,
      projectType: null,
      budget: null,
      timeline: null,
    };
  }
}
```

#### 1.2 Add Email Validation Function
```typescript
function isValidEmail(email: string | null): boolean {
  if (!email) return false;

  // Basic regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return false;

  // Check for obviously fake domains
  const fakeDomains = [
    'test.com', 'example.com', 'fake.fake', 'test.test',
    'pepus.pep', 'demo.demo', 'sample.sample'
  ];
  const domain = email.split('@')[1]?.toLowerCase();
  if (fakeDomains.includes(domain)) return false;

  // Check domain has valid TLD (common ones)
  const validTLDs = [
    'com', 'net', 'org', 'io', 'dev', 'ai', 'co', 'app',
    'es', 'fr', 'de', 'uk', 'us', 'ca', 'mx', 'ar', 'cl',
    'edu', 'gov', 'mil'
  ];
  const tld = domain?.split('.').pop()?.toLowerCase();
  if (!tld || !validTLDs.includes(tld)) return false;

  return true;
}
```

#### 1.3 Add Validator Agent
```typescript
interface ValidationResult {
  valid: boolean;
  issues: string[];
  missingFields: string[];
  confidence: number;
}

async function validateFields(fields: SalesFields, language: string = 'en'): Promise<ValidationResult> {
  const validatorPrompt = `
You are a strict data validator. Check if this sales inquiry is complete and valid.

DATA TO VALIDATE:
${JSON.stringify(fields, null, 2)}

VALIDATION RULES:
1. name: Must be a real full name (first + last), not "N/A" or single word
2. email: Must be valid format AND real domain (not fake like "pepus.pep")
3. projectType: Must have clear description of what they want
4. budget: Must have specific amount or range (not "flexible" or "no sé")
5. timeline: Must have specific timeframe (not "soon" or "pronto")

Return ONLY valid JSON:
{
  "valid": true/false,
  "issues": ["list of specific problems found"],
  "missingFields": ["field names that are null or invalid"],
  "confidence": 0-100
}

EXAMPLES:
Good: {"name": "Juan Pérez", "email": "juan@gmail.com", "budget": "$5,000", ...}
Bad: {"name": "Juan", "email": "juan@fake.fake", "budget": "no mucho", ...}
`;

  const response = await generateText({
    model: groq('deepseek-r1-distill-llama-70b'), // Smart reasoning model
    prompt: validatorPrompt,
    temperature: 0.2, // Very strict
  });

  let jsonText = response.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Validator parse error:', jsonText);
    return {
      valid: false,
      issues: ['Failed to parse validation response'],
      missingFields: Object.keys(fields).filter(k => !fields[k as keyof SalesFields]),
      confidence: 0,
    };
  }
}
```

#### 1.4 Update Sales Agent Handler
```typescript
async function handleSalesChat(
  userMessage: string,
  conversationHistory: Message[]
): Promise<{ message: string; systemMessage?: string; emailSent: boolean }> {

  // Step 1: Extract current fields from conversation
  const currentFields = await extractFields(conversationHistory);

  // Step 2: Build state-aware prompt
  const salesPrompt = `
You are Jean Francois's AI sales assistant in MSN Messenger.
Your job: collect 5 pieces of information to send a sales inquiry.

CURRENT STATE OF DATA COLLECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Name:         ${currentFields.name || '❌ NOT COLLECTED'}
2. Email:        ${currentFields.email || '❌ NOT COLLECTED'}
3. Project Type: ${currentFields.projectType || '❌ NOT COLLECTED'}
4. Budget:       ${currentFields.budget || '❌ NOT COLLECTED'}
5. Timeline:     ${currentFields.timeline || '❌ NOT COLLECTED'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR TASK:
- ONLY ask for fields marked '❌ NOT COLLECTED'
- Ask ONE question at a time (MSN style = short!)
- Keep responses to 1-2 lines MAX
- Match user's language (español, français, English, deutsch)
- If user gives invalid data (bad email), politely re-ask for that specific field

USER'S LATEST MESSAGE:
"${userMessage}"

CONVERSATION CONTEXT:
${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

VALIDATION:
- Email MUST be valid format with real domain (NOT fake like "pepus.pep")
- Budget MUST have specific amount (NOT vague like "no mucho")
- Timeline MUST have timeframe (NOT vague like "pronto")

If user gives invalid data, respond like:
- Bad email: "Hmm, ese email parece inválido. ¿Tienes uno real como juan@gmail.com?"
- Vague budget: "¿Cuál es tu rango? Opciones: $1k-$5k, $5k-$10k, $10k-$20k, $20k+"
- Vague timeline: "¿Cuánto tiempo? Por ejemplo: 1 mes, 2 meses, 3 meses..."

Response in same language as user. Keep it SHORT and conversational!
`;

  // Step 3: Get sales agent response
  const response = await generateText({
    model: groq('moonshotai/kimi-k2-instruct-0905'), // Best multilingual model
    prompt: salesPrompt,
    temperature: 0.8,
  });

  const agentMessage = response.text.trim();

  // Step 4: After agent responds, re-extract fields
  const updatedHistory = [...conversationHistory,
    { role: 'user', content: userMessage },
    { role: 'assistant', content: agentMessage }
  ];
  const updatedFields = await extractFields(updatedHistory);

  // Step 5: Check if all fields are present
  const allFieldsPresent = Object.values(updatedFields).every(field => field !== null);

  if (!allFieldsPresent) {
    // Still collecting data
    return {
      message: agentMessage,
      emailSent: false,
    };
  }

  // Step 6: Validate fields
  const validation = await validateFields(updatedFields);

  if (!validation.valid || validation.confidence < 80) {
    // Has all fields but some are invalid
    const language = detectLanguage(conversationHistory);
    const reAskMessages = {
      es: `Hmm, necesito aclarar: ${validation.issues[0]} ¿Puedes darme esa info?`,
      en: `Hmm, I need to clarify: ${validation.issues[0]} Can you provide that?`,
      fr: `Hmm, j'ai besoin de clarifier: ${validation.issues[0]} Peux-tu me donner ça?`,
      de: `Hmm, ich muss klären: ${validation.issues[0]} Kannst du das angeben?`,
    };

    return {
      message: reAskMessages[language as keyof typeof reAskMessages] || reAskMessages.en,
      emailSent: false,
    };
  }

  // Step 7: All fields valid! Send email
  await sendSalesInquiry(updatedFields, conversationHistory);

  // Step 8: Return confirmation
  const language = detectLanguage(conversationHistory);
  const confirmations = {
    es: '¡Perfecto! Enviando email a Jean ahora... 📧',
    en: 'Perfect! Sending email to Jean now... 📧',
    fr: 'Parfait! J\'envoie un email à Jean maintenant... 📧',
    de: 'Perfekt! Sende jetzt E-Mail an Jean... 📧',
  };

  const systemMessages = {
    es: '✅ Email enviado exitosamente! Jean te responderá en 24 horas.',
    en: '✅ Email sent successfully! Jean will reply within 24 hours.',
    fr: '✅ Email envoyé avec succès! Jean répondra dans 24 heures.',
    de: '✅ Email erfolgreich gesendet! Jean antwortet innerhalb von 24 Stunden.',
  };

  return {
    message: confirmations[language as keyof typeof confirmations] || confirmations.en,
    systemMessage: systemMessages[language as keyof typeof systemMessages] || systemMessages.en,
    emailSent: true,
  };
}
```

#### 1.5 Update sendSalesInquiry
```typescript
async function sendSalesInquiry(
  fields: SalesFields,
  conversationHistory: Message[]
): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3003'}/api/booking/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sales_inquiry',
        name: fields.name,
        email: fields.email,
        projectType: fields.projectType,
        budget: fields.budget,
        timeline: fields.timeline,
        projectDescription: conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
        timestamp: new Date().toISOString(),
        source: 'MSN Messenger Chat'
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email:', await response.text());
      throw new Error('Email send failed');
    }
  } catch (error) {
    console.error('Failed to send sales inquiry email:', error);
    throw error;
  }
}
```

#### 1.6 Add Language Detection Helper
```typescript
function detectLanguage(conversationHistory: Message[]): string {
  // Check last 3 user messages for language indicators
  const userMessages = conversationHistory
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content.toLowerCase())
    .join(' ');

  if (/\b(hola|gracias|quiero|buenas|que|como|pero|con)\b/.test(userMessages)) return 'es';
  if (/\b(merci|bonjour|oui|non|je|tu|avec)\b/.test(userMessages)) return 'fr';
  if (/\b(danke|hallo|ja|nein|ich|du|mit)\b/.test(userMessages)) return 'de';

  return 'en';
}
```

#### 1.7 Update API Response Type
```typescript
export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const conversationHistory = messages.slice(0, -1);
    const userMessage = messages[messages.length - 1].content;

    // Detect intent
    const intent = await detectIntent(userMessage, conversationHistory);

    let result;
    if (intent === 'sales') {
      result = await handleSalesChat(userMessage, conversationHistory);
    } else {
      const casualResponse = await handleCasualChat(userMessage, conversationHistory);
      result = { message: casualResponse, emailSent: false };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        message: 'Sorry, something went wrong. Can you repeat that? 🙏',
        emailSent: false
      },
      { status: 500 }
    );
  }
}
```

---

### **Phase 2: Frontend Changes (app/components/Apps/Chatbot/Chatbot.tsx)**

#### 2.1 Update Message Type
```typescript
interface Message {
  role: 'user' | 'assistant' | 'system'; // Add 'system'
  content: string;
  timestamp?: string;
}
```

#### 2.2 Update Chat API Call Handler
```typescript
const handleSendMessage = async (message: string) => {
  if (!message.trim()) return;

  // Add user message
  const userMessage: Message = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInputValue('');
  setIsTyping(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMessage],
      }),
    });

    const data = await response.json();

    // Add assistant message
    const assistantMessage: Message = {
      role: 'assistant',
      content: data.message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Play typing sound
    const typeSound = new Audio('/sounds/type.mp3');
    typeSound.play();

    // If email was sent, show system message after 2 seconds
    if (data.emailSent && data.systemMessage) {
      setTimeout(() => {
        const systemMessage: Message = {
          role: 'system',
          content: data.systemMessage,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, systemMessage]);

        // Play success sound
        const sendSound = new Audio('/sounds/msn-send.mp3');
        sendSound.play();
      }, 2000);
    }

  } catch (error) {
    console.error('Failed to send message:', error);

    const errorMessage: Message = {
      role: 'system',
      content: '❌ Failed to send message. Please try again.',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};
```

#### 2.3 Update Message Rendering
```tsx
{messages.map((msg, idx) => (
  <div key={idx} className={`message-container ${msg.role}`}>
    {msg.role === 'system' ? (
      // System message (email confirmation)
      <div className="system-message">
        <div className="system-badge">System</div>
        <div className="system-content">{msg.content}</div>
      </div>
    ) : msg.role === 'assistant' ? (
      // Assistant message (Jean)
      <div className="assistant-message">
        <img src="/jean-avatar.png" alt="Jean" className="avatar" />
        <div className="message-bubble">
          {msg.content}
        </div>
      </div>
    ) : (
      // User message
      <div className="user-message">
        <div className="message-bubble">
          {msg.content}
        </div>
      </div>
    )}
  </div>
))}
```

#### 2.4 Add System Message Styling
```css
.system-message {
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
  border-left: 4px solid #00aa00;
  padding: 12px 16px;
  margin: 12px auto;
  max-width: 90%;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.system-badge {
  font-weight: bold;
  color: #00aa00;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.system-content {
  color: #333;
  font-style: italic;
  font-size: 13px;
  line-height: 1.4;
}
```

---

## 🧪 Testing Checklist

### Test Case 1: Happy Path (All Valid Data)
```
User: "Quiero un sitio web como este"
Expected: Agent asks for name

User: "Juan Pérez"
Expected: Agent asks for email

User: "juan@gmail.com"
Expected: Agent asks for project details

User: "lo mismo que esto"
Expected: Agent asks for budget

User: "5k"
Expected: Agent asks for timeline

User: "2 meses"
Expected:
- Agent: "¡Perfecto! Enviando email a Jean ahora... 📧"
- [2 seconds later]
- System: "✅ Email enviado exitosamente! Jean te responderá en 24 horas."
- Email arrives in inbox with all data
```

### Test Case 2: Invalid Email
```
User: "Quiero un sitio web"
Agent: "¿Cuál es tu nombre?"

User: "Pepe"
Agent: "¿Cuál es tu email?"

User: "pepe@pepus.pep"
Expected: "Hmm, ese email parece inválido. ¿Tienes uno real como pepe@gmail.com?"

User: "pepe@gmail.com"
Expected: Continue with next question (project type)
```

### Test Case 3: Incomplete Data
```
User: "quiero una app"
Agent: "¿Tu nombre?"

User: "Maria"
Agent: "¿Tu email?"

User: "maria@hotmail.com"
Agent: "¿Qué tipo de proyecto?"

User: [closes chat]
Expected: No email sent (missing budget, timeline)
```

### Test Case 4: Vague Budget
```
User: "necesito un sitio web"
[... agent collects name, email, project type ...]

Agent: "¿Cuál es tu presupuesto?"
User: "no mucho"
Expected: "¿Cuál es tu rango? Opciones: $1k-$5k, $5k-$10k, $10k-$20k, $20k+"
```

### Test Case 5: Language Switching
```
User: "Hola, quiero un sitio web"
Agent: "¡Hola! ¿Cuál es tu nombre?" [Spanish]

User: "Juan, but let's continue in English"
Agent: "Great! What's your email?" [English]
Expected: Agent matches user's language
```

---

## 🎯 Success Criteria

### ✅ Email Only Sends When:
1. All 5 fields collected (name, email, project, budget, timeline)
2. Email is valid format with real domain
3. Budget has specific amount (not vague)
4. Timeline has specific timeframe (not vague)
5. Name is full name (first + last)

### ✅ User Always Knows Status:
1. Agent shows "Enviando email..." message
2. System message appears after 2 seconds: "✅ Email enviado!"
3. Sound effect plays (MSN send sound)
4. System message has green left border + gray background

### ✅ Agent Has Memory:
1. Never asks for same field twice
2. Can see what's already collected vs what's missing
3. Re-asks only for invalid/incomplete fields
4. Doesn't move forward until current field is valid

---

## 🚀 Deployment Steps

1. **Test locally first:**
   ```bash
   npm run dev
   # Test all scenarios above
   ```

2. **Check console for errors:**
   - No console.log in production
   - Only console.error for debugging

3. **Verify email arrival:**
   - Check inbox for test emails
   - Verify all fields are populated correctly

4. **Build and deploy:**
   ```bash
   npm run build
   git add .
   git commit -m "feat: Sales Agent v2.0 with state tracking and validation"
   git push
   ```

5. **Monitor production:**
   - Test on live site
   - Check Groq API usage/costs
   - Monitor email delivery rate

---

## 💡 Pro Tips

### For Better Accuracy:
- Use `moonshotai/kimi-k2-instruct-0905` for sales agent (best multilingual)
- Use `deepseek-r1-distill-llama-70b` for validator (best reasoning)
- Lower temperature = more consistent (0.2-0.3 for extraction/validation)

### For Faster Responses:
- Use `llama-3.1-8b-instant` for router (fastest)
- Cache field extraction between messages (optional optimization)

### For Cost Savings:
- Use smaller models where possible (8B for simple tasks)
- Only run validator when all fields present (not on every message)

---

## 📞 Questions?

If you get stuck:
1. Check console for errors
2. Test each function individually (extraction, validation, etc.)
3. Verify Groq API key is working
4. Ask Jean to review

---

**Ready to build! 🚀**

Let me know if you need clarification on any part.

- Jean (via Claude)
