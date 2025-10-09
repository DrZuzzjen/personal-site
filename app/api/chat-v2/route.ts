import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';
import { PROMPTS } from '@/app/lib/ai/prompts';
import { fieldExtractorAgent } from '@/app/lib/ai/agents/field-extractor-agent';
import { createSalesAgent } from '@/app/lib/ai/agents/sales-agent';
import { createCasualAgent, type Action } from '@/app/lib/ai/agents/casual-agent';
import type { Message } from '@/app/lib/ai/agents/types';
import { telemetry } from '@/app/lib/telemetry';

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
      prompt: `${PROMPTS.ROUTER()}${conversationContext}\n\nLatest message: "${userMessage}"`,
      temperature: 0.1,
    });

    const intent = text.toLowerCase().trim();
    return intent === 'sales' ? 'sales' : 'casual';
  } catch (error) {
    console.error('Intent detection error:', error);
    return 'casual'; // Default fallback
  }
}

async function handleCasualChat(
  userMessage: string,
  conversationHistory: Message[]
): Promise<{ message: string; actions: Action[] }> {
  try {
    // ✅ FIXED: Create new CasualAgent instance per request (not global singleton)
    const casualAgent = createCasualAgent();

    // Use the CasualAgent class with proper history trimming and error handling
    const result = await casualAgent.generate([
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]);

    return result;
  } catch (error) {
    console.error('Casual chat error:', error);
    return {
      message: "hey! :) what's up?",
      actions: []
    };
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[PERF] Request started');
  let intent: 'sales' | 'casual' = 'sales';

  try {
    const parseStart = Date.now();
    const { messages } = await request.json();
    console.log('[PERF] Messages parsed:', Date.now() - parseStart, 'ms');

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array required' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const conversationHistory: Message[] = messages.slice(0, -1);

    // Detect intent
    const intentStart = Date.now();
    intent = await detectIntent(lastMessage.content, conversationHistory);
    console.log('[PERF] Intent detected:', Date.now() - intentStart, 'ms');

    if (intent === 'casual') {
      const casualStart = Date.now();
      const casualResult = await handleCasualChat(lastMessage.content, conversationHistory);
      console.log('[PERF] Casual handler completed:', Date.now() - casualStart, 'ms');
      telemetry.log({
        timestamp: new Date().toISOString(),
        endpoint: '/api/chat-v2',
        intent,
        latencyMs: Date.now() - startTime,
        emailSent: false
      });

      return NextResponse.json({
        message: casualResult.message,
        actions: casualResult.actions,
        emailSent: false,
        debug: {
          intent
        }
      });
    }

    // Sales workflow with agents
    console.log('[chat-v2] Sales intent detected, using agents');

    // Step 1: Extract current fields
    const extractStart = Date.now();
    const extraction = await fieldExtractorAgent.extract(messages);
    console.log('[PERF] Fields extracted:', Date.now() - extractStart, 'ms');
    console.log('[chat-v2] Extracted fields:', extraction.fields);

    // Step 2: Create sales agent with current state
    const salesAgent = createSalesAgent({
      currentFields: extraction.fields
    });

    // Step 4: Generate response
    const salesStart = Date.now();
    const result = await salesAgent.generate(messages);
    console.log('[PERF] Sales agent completed:', Date.now() - salesStart, 'ms');
    console.log('[PERF] Agent steps:', result.steps?.length || 0);
    console.log('[PERF] Total tokens:', result.usage?.totalTokens);
    result.steps?.forEach((step: any, index: number) => {
      console.log(`[PERF] Step ${index + 1}:`, {
        toolCalls: step.toolCalls?.map((c: any) => c.toolName),
        hasText: !!step.text,
        textLength: step.text?.length
      });
    });

    // Step 5: Check if email was sent (optimized detection)
    const emailSent = result.steps.some((step: any) => {
      if (!step.content) return false;

      return step.content.some((content: any) => {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[chat-v2] Checking step content:', {
            type: content.type,
            toolName: content.toolName,
            hasOutput: !!content.output,
          });
        }

        return (
          content.type === 'tool-result' &&
          content.toolName === 'validateAndSendEmail' &&
          content.output?.sent === true
        );
      });
    });

    console.log('[chat-v2] Email sent detection result:', emailSent);

    const responsePayload = {
      message: result.text,
      emailSent,
      actions: [] as Action[],
      systemMessage: emailSent ? '✅ Email sent to Fran! Check your inbox within 24h.' : undefined,
      // Debug info (remove in production)
      debug: {
        intent,
        extractedFields: extraction.fields,
        confidence: extraction.confidence
      }
    };

    telemetry.log({
      timestamp: new Date().toISOString(),
      endpoint: '/api/chat-v2',
      intent,
      latencyMs: Date.now() - startTime,
      tokensUsed: result.usage?.totalTokens,
      agentSteps: result.steps?.length,
      emailSent
    });
    console.log('[PERF] Total latency:', Date.now() - startTime, 'ms');

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('[chat-v2] Error:', error);
    console.log('[PERF] Request failed after:', Date.now() - startTime, 'ms');

    telemetry.log({
      timestamp: new Date().toISOString(),
      endpoint: '/api/chat-v2',
      intent,
      latencyMs: Date.now() - startTime,
      emailSent: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      {
        message: "Sorry, something went wrong. Can you repeat that?",
        emailSent: false
      },
      { status: 500 }
    );
  }
}
