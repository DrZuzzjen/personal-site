import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Agent prompts
const ROUTER_PROMPT = `You are a router that detects user intent in MSN Messenger.

Respond with ONLY "sales" or "casual".

SALES intent if user mentions:
- Building/developing a website, app, or software
- Need help with AI integration, chatbots, automation
- Want to hire or work with Jean Francois
- Asking about services, rates, pricing, or availability
- Project consultation or collaboration
- Any form of "I want to build X"

CASUAL intent otherwise:
- General questions about the portfolio
- Asking about Jean's background or projects
- Just saying hi or chatting
- Playing games, exploring the site`;

const CASUAL_CHAT_PROMPT = `You're Jean Francois' friendly MSN Messenger assistant.

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

Keep it casual, keep it MSN! :)`;

const SALES_PROMPT = `You're Jean Francois' sales assistant in MSN Messenger.
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

4. WHEN YOU HAVE ALL INFO: Say "Perfect! Let me send your details to Jean right now..." and include a summary.

STYLE:
- Conversational, NOT interrogative
- Ask 1-2 questions per message MAX
- Be consultative: "That sounds exciting!" "I can see why that'd be valuable"
- Don't rush - build rapport
- Use emojis occasionally :) 🚀 but don't overdo it

Be natural. Be helpful. Close the deal! 🚀`;

// Detect user intent using Vercel AI SDK
async function detectIntent(userMessage: string): Promise<'sales' | 'casual'> {
  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `${ROUTER_PROMPT}\n\nMessage: "${userMessage}"`,
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
    
    // If the response mentions sending details to Jean, trigger email
    if (response.toLowerCase().includes('send your details to jean') || 
        response.toLowerCase().includes('perfect! let me send')) {
      
      // Extract information from conversation history for email
      await sendSalesInquiry(conversationHistory, userMessage);
    }

    return response;
  } catch (error) {
    console.error('Sales chat error:', error);
    return "Awesome! :) Tell me more about your project!";
  }
}

// Send sales inquiry email
async function sendSalesInquiry(conversationHistory: Message[], latestMessage: string): Promise<void> {
  try {
    // Extract conversation content
    const fullConversation = conversationHistory
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    console.log('Sales inquiry detected!');
    console.log('Full conversation:', fullConversation);
    console.log('Latest message:', latestMessage);
    
    // TODO: Implement email sending via API call to /api/booking/send-email
    // For now, just log the inquiry
    
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
    const intent = await detectIntent(userMessage);

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