import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SalesFields {
  name: string | null;
  email: string | null;
  projectType: string | null;
  budget: string | null;
  timeline: string | null;
}

// Agent prompts
const ROUTER_PROMPT = `You are a router that detects user intent in MSN Messenger conversations.

Respond with ONLY "sales" or "casual".

Look at the LATEST MESSAGE and CONVERSATION CONTEXT to determine intent.

SALES intent if user mentions:
- Building/developing a website, app, or software
- Need help with AI integration, chatbots, automation  
- Want to hire or work with Fran Francois
- Asking about services, rates, pricing, or availability
- Project consultation or collaboration
- Any form of "I want to build X" or "I need to create Y"
- Buying intent: "I want to buy", "I need this", "Can you make me..."
- Responding YES to proactive offers: "Yes, I'd love that!" after Fran offers services

CASUAL intent (but watch for proactive triggers):
- General questions about the portfolio
- Asking about Fran's background or projects
- Just saying hi or chatting
- Playing games, exploring the site
- Commenting on the website features
- Strong interest phrases: "This is amazing!", "I love this!", "This is exactly what I need!"

PROACTIVE SALES LOGIC:
If user shows STRONG INTEREST in portfolio ("amazing", "love this", "incredible", etc.)
→ Stay CASUAL (let Fran make the proactive offer)
→ ONLY switch to SALES if they respond positively to the offer

IMPORTANT: Even if conversation STARTED casual, if LATEST MESSAGE shows buying/building intent, route to SALES.

Example scenarios:
- "This is amazing!" → CASUAL (Fran will proactively offer)
- "Yes, I'd love something similar!" (after offer) → SALES  
- "I want to build a website" → SALES
- "Can you create something similar?" → SALES`;

const CASUAL_CHAT_PROMPT = `You ARE Fran Francois (Fran), not an AI pretending to be him. This is YOUR portfolio website.

IDENTITY:
- You're a DevRel at Kluster.ai - a decentralized AI cloud for developers
- AI Advocate, Speaker, and seasoned AI Engineer & Full-Stack Developer
- Known as "The Go-To Guy for Gen AI Insights"
- Based in Valencia, Spain

YOUR VOICE & PERSONALITY:
- Casual but professional - approachable but you know your stuff  
- Direct and practical - no corporate buzzwords
- Enthusiastic about tech without being salesy
- Occasional tech humor and retro computing nostalgia
- Uses 'I'm Fran' not 'I'm an AI assistant'
- Short sentences. Punchy. Gets to the point.
- MSN Messenger vibes with emoticons: :) :D ;) :P

🚀 PROACTIVE SALES - BE OPPORTUNISTIC:
When users show STRONG INTEREST, naturally offer services:

TRIGGER PHRASES that show buying intent:
- "This is amazing/incredible/awesome!"
- "I love this site/portfolio!"
- "How did you build this?"
- "This is exactly what I need!"
- "I wish I had something like this"
- "This is so cool/impressive"
- "Can I get one like this?"

PROACTIVE RESPONSES (match their language):
English: "Thanks! :D Want me to build something similar for you?"
Spanish: "¡Gracias! :D ¿Quieres que te haga algo similar?"
French: "Merci! :D Tu veux que je te fasse quelque chose comme ça?"
German: "Danke! :D Soll ich dir was Ähnliches machen?"

DON'T be pushy - be natural and helpful!

EXPERTISE YOU'RE PROUD OF:
- Gen AI: RAG, Agents, Multi-tool systems, Prompt Engineering
- Full-stack: Next.js, TypeScript, Python, React
- AI Frameworks: Langchain, LlamaIndex, Autogen, Crew AI
- 20M+ in AI automation savings at BASF
- 1 Invention Patent (2025)
- Won 1st Prize at Daimler Hackathon for AI chat interface

THIS PORTFOLIO SITE:
- Fully functional Windows 3.1 OS simulation you built
- Technical flex: window manager, MS Paint clone, Minesweeper, file system
- Built with Next.js 15, TypeScript, Tailwind CSS, Groq AI
- Has boot sequence, draggable windows, working Start Menu

REMEMBER: Keep responses 2-4 sentences usually. Be enthusiastic but not overwhelming. You're Fran showing off your retro portfolio!`;

// Extract fields from conversation history
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
    model: groq(process.env.GROQ_EXTRACTOR_MODEL || 'llama-3.3-70b-versatile'), // Use configurable model
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
  } catch (parseError) {
    console.error('Failed to parse extraction response:', parseError, jsonText);
    return {
      name: null,
      email: null,
      projectType: null,
      budget: null,
      timeline: null,
    };
  }
}

interface ValidationResult {
  valid: boolean;
  issues: string[];
  missingFields: string[];
  confidence: number;
}

// Validator agent function
async function validateFields(fields: SalesFields): Promise<ValidationResult> {
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
    model: groq(process.env.GROQ_VALIDATOR_MODEL || 'llama-3.3-70b-versatile'), // Use configurable model
    prompt: validatorPrompt,
    temperature: 0.2, // Very strict
  });

  let jsonText = response.text.trim();
  
  // Handle markdown wrapping
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }
  
  // Remove any extra text before/after JSON
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    console.error('Validator parse error:', parseError, jsonText);
    return {
      valid: false,
      issues: ['Failed to parse validation response'],
      missingFields: Object.keys(fields).filter(k => !fields[k as keyof SalesFields]),
      confidence: 0,
    };
  }
}

// Language detection helper
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

// Detect user intent using Vercel AI SDK with conversation context
async function detectIntent(userMessage: string, conversationHistory: Message[] = []): Promise<'sales' | 'casual'> {
  try {
    // Get last 4 messages for context (not too much, not too little)
    const recentHistory = conversationHistory.slice(-4);
    const conversationContext = recentHistory.length > 0 
      ? `\n\nRecent conversation context:\n${recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    const { text } = await generateText({
      model: groq(process.env.GROQ_ROUTER_MODEL || 'llama-3.3-70b-versatile'),
      prompt: `${ROUTER_PROMPT}${conversationContext}\n\nLatest message: "${userMessage}"`,
      temperature: 0.1,
    });

    const intent = text.toLowerCase().trim();
    return intent === 'sales' ? 'sales' : 'casual';
  } catch (error) {
    console.error('Intent detection error:', error);
    return 'casual'; // Default fallback
  }
}

// Handle casual chat using Vercel AI SDK
async function handleCasualChat(userMessage: string, conversationHistory: Message[]): Promise<string> {
  try {
    const { text } = await generateText({
      model: groq(process.env.GROQ_CASUAL_MODEL || 'llama-3.3-70b-versatile'),
      messages: [
        { role: 'system', content: CASUAL_CHAT_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.8,
    });

    return text || "hey! :) what's up?";
  } catch (error) {
    console.error('Casual chat error:', error);
    return "hey! :) what's up?";
  }
}

// Handle sales chat using Vercel AI SDK with state tracking
async function handleSalesChat(
  userMessage: string,
  conversationHistory: Message[]
): Promise<{ message: string; systemMessage?: string; emailSent: boolean }> {

  // Step 1: Extract current fields from conversation
  const currentFields = await extractFields(conversationHistory);

  // Step 2: Build state-aware prompt
  const salesPrompt = `
You are Fran Francois's AI sales assistant in MSN Messenger.
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
    model: groq(process.env.GROQ_SALES_MODEL || 'llama-3.3-70b-versatile'), // Use configurable model
    prompt: salesPrompt,
    temperature: 0.8,
  });

  const agentMessage = response.text.trim();

  // Step 4: After agent responds, re-extract fields
  const updatedHistory: Message[] = [...conversationHistory,
    { role: 'user' as const, content: userMessage },
    { role: 'assistant' as const, content: agentMessage }
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
  try {
    await sendSalesInquiry(updatedFields, conversationHistory);

    // Step 8: Return confirmation
    const language = detectLanguage(conversationHistory);
    const confirmations = {
      es: '¡Perfecto! Enviando email a Fran ahora... 📧',
      en: 'Perfect! Sending email to Fran now... 📧',
      fr: 'Parfait! J\'envoie un email à Fran maintenant... 📧',
      de: 'Perfekt! Sende jetzt E-Mail an Fran... 📧',
    };

    const systemMessages = {
      es: '✅ Email enviado exitosamente! Fran te responderá en 24 horas.',
      en: '✅ Email sent successfully! Fran will reply within 24 hours.',
      fr: '✅ Email envoyé avec succès! Fran répondra dans 24 heures.',
      de: '✅ Email erfolgreich gesendet! Fran antwortet innerhalb von 24 Stunden.',
    };

    return {
      message: confirmations[language as keyof typeof confirmations] || confirmations.en,
      systemMessage: systemMessages[language as keyof typeof systemMessages] || systemMessages.en,
      emailSent: true,
    };
  } catch (emailError) {
    // Email failed, but still show success to user and log error
    console.error('Email sending failed:', emailError);
    
    const language = detectLanguage(conversationHistory);
    const errorMessages = {
      es: '¡Perfecto! He recopilado toda tu información. 📋\nFran te contactará pronto.',
      en: 'Perfect! I\'ve collected all your information. 📋\nFran will contact you soon.',
      fr: 'Parfait! J\'ai collecté toutes tes informations. 📋\nFran te contactera bientôt.',
      de: 'Perfekt! Ich habe alle deine Informationen gesammelt. 📋\nFran wird dich bald kontaktieren.',
    };

    return {
      message: errorMessages[language as keyof typeof errorMessages] || errorMessages.en,
      emailSent: false, // Don't claim email was sent if it failed
    };
  }
}

// Send sales inquiry email with structured data
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
      const errorText = await response.text();
      console.error('Failed to send email:', errorText);
      throw new Error(`Email API responded with ${response.status}: ${errorText}`);
    }
    
    console.log('✅ Sales inquiry email sent successfully');
  } catch (error) {
    console.error('Failed to send sales inquiry email:', error);
    throw error;
  }
}

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

    // Build conversation context
    const conversationHistory = messages.slice(0, -1); // All except the last message

    // Detect intent using Vercel AI SDK
    // Detect user intent with conversation context
    const intent = await detectIntent(userMessage, conversationHistory);

    // Route to appropriate handler using Vercel AI SDK
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
    
    // Handle configuration errors gracefully
    if (error instanceof Error && error.message.includes('Configuration error')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      {
        message: 'Sorry, something went wrong. Can you repeat that? 🙏',
        emailSent: false
      },
      { status: 500 }
    );
  }
}