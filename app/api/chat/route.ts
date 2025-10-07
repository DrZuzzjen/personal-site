import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Agent prompts
const ROUTER_PROMPT = `You are a router that detects user intent in MSN Messenger conversations.

Respond with ONLY "sales" or "casual".

Look at the LATEST MESSAGE and CONVERSATION CONTEXT to determine intent.

SALES intent if user mentions:
- Building/developing a website, app, or software
- Need help with AI integration, chatbots, automation  
- Want to hire or work with Jean Francois
- Asking about services, rates, pricing, or availability
- Project consultation or collaboration
- Any form of "I want to build X" or "I need to create Y"
- Buying intent: "I want to buy", "I need this", "Can you make me..."
- Responding YES to proactive offers: "Yes, I'd love that!" after Fran offers services

CASUAL intent (but watch for proactive triggers):
- General questions about the portfolio
- Asking about Jean's background or projects
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

const CASUAL_CHAT_PROMPT = `You ARE Jean Francois (Fran), not an AI pretending to be him. This is YOUR portfolio website.

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

REMEMBER: Keep responses 2-4 sentences usually. Be enthusiastic but not overwhelming. You're Fran showing off your retro portfolio!`;;

const SALES_PROMPT = `You're Jean Francois' sales assistant in MSN Messenger.
A user wants to work with Jean or needs development services.

🌍 CRITICAL: LANGUAGE MATCHING
- Detect the user's language from conversation history
- If they write in Spanish → respond in Spanish
- If they write in French → respond in French  
- If they write in German → respond in German
- Match their language IMMEDIATELY in your first response
- Keep using their preferred language throughout

YOUR PROCESS (in order):
1. UNDERSTAND THE PROJECT (1-2 short questions)
   - What are they building? 
   - What features do they need?

2. QUALIFY TIMELINE & BUDGET (1-2 short questions)
   - Timeline? (weeks/months/ASAP?)
   - Budget: <$5k | $5k-$20k | $20k-$50k | $50k+

3. COLLECT CONTACT INFO (required)
   - Full name + email
   - LinkedIn (optional)
   - Preferred meeting time

4. SUCCESS MESSAGE: When you have ALL info, say something like:
   "Perfect! I've got everything! 🎉
   Fran will reach out at [their email] within 24 hours.
   Talk soon!"

MSN CHAT STYLE - SUPER IMPORTANT:
- 1-2 lines MAX per response (like texting a friend!)
- Short, punchy questions: "Budget range?" not paragraphs
- Use emojis but don't overdo: :) :D 🚀
- Think "quick chat" not "business email"

EXAMPLES:
User: "Quiero construir una app"
You: "¡Genial! :) ¿Qué tipo de app tienes en mente?"

User: "Je veux créer un site web"  
You: "Super! :D Quel genre de site web?"

User: "I need an AI chatbot"
You: "awesome! what kind of chatbot? :)"

REMEMBER: Match their language + keep it SHORT! 🚀`;

// Detect user intent using Vercel AI SDK with conversation context
async function detectIntent(userMessage: string, conversationHistory: Message[] = []): Promise<'sales' | 'casual'> {
  try {
    // Get last 4 messages for context (not too much, not too little)
    const recentHistory = conversationHistory.slice(-4);
    const conversationContext = recentHistory.length > 0 
      ? `\n\nRecent conversation context:\n${recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
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
      model: groq('llama-3.3-70b-versatile'),
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

// Handle sales chat using Vercel AI SDK
async function handleSalesChat(userMessage: string, conversationHistory: Message[]): Promise<string> {
  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      messages: [
        { role: 'system', content: SALES_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
    });

    // Check if the response indicates the sales process is complete
    const response = text || "Awesome! :) Tell me more about your project!";
    
    // If the response indicates completion (success message), trigger email
    if (response.toLowerCase().includes('jean will reach out') || 
        response.toLowerCase().includes('i\'ve got everything') ||
        response.toLowerCase().includes('perfect! i\'ve got') ||
        response.toLowerCase().includes('talk soon!')) {
      
      // Extract information from conversation history for email
      await sendSalesInquiry(conversationHistory, userMessage);
    }

    return response;
  } catch (error) {
    console.error('Sales chat error:', error);
    return "Awesome! :) Tell me more about your project!";
  }
}

// Send sales inquiry email with structured data extraction
async function sendSalesInquiry(conversationHistory: Message[], latestMessage: string): Promise<void> {
  try {
    // Step 1: Use LLM to extract structured data from conversation
    const extractionPrompt = `Analyze this sales conversation and extract the following information in JSON format:

{
  "name": "Full name of the person",
  "email": "Their email address",
  "linkedin": "LinkedIn URL if mentioned",
  "preferredTime": "When they want to meet",
  "projectType": "Type of project (web app, mobile, AI, etc.)",
  "projectDescription": "What they want to build",
  "features": "Key features they mentioned",
  "techRequirements": "Specific tech they need",
  "timeline": "Project timeline",
  "budget": "Budget range",
  "qualificationNotes": "YOUR assessment of this lead: Is budget realistic? Timeline reasonable? Project well-defined? Serious buyer? Rate as: QUALIFIED/MAYBE/NEEDS_FOLLOWUP and explain why."
}

If any field is not mentioned, use "Not mentioned" as the value.
For qualificationNotes, ALWAYS provide an assessment even if limited info.

Conversation:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
${latestMessage ? `user: ${latestMessage}` : ''}

Return ONLY the JSON object, no other text.`;

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: extractionPrompt,
      temperature: 0.1, // Low temperature for consistent extraction
    });

    // Step 2: Parse extracted data
    let extractedData;
    try {
      extractedData = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse extracted data:', parseError);
      // Fallback: send raw conversation
      extractedData = {
        name: 'Parse Error',
        email: 'noreply@resend.dev',
        projectDescription: conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
      };
    }

    console.log('Extracted data for email processing');

    // Step 3: Call email API with structured data
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3003'}/api/booking/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sales_inquiry',
        ...extractedData, // All the structured fields
        timestamp: new Date().toISOString(),
        source: 'MSN Messenger Chat'
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email:', await response.text());
    } else {
      console.log('Sales inquiry email sent successfully');
    }
    
  } catch (error) {
    console.error('Failed to send sales inquiry email:', error);
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
    let response: string;
    if (intent === 'sales') {
      response = await handleSalesChat(userMessage, conversationHistory);
    } else {
      response = await handleCasualChat(userMessage, conversationHistory);
    }

    // Return final response
    return NextResponse.json({
      message: response,
      _debug: process.env.NODE_ENV === 'development' ? { intent } : undefined,
    });

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
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}