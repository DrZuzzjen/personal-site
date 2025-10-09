import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';
import { PROMPTS } from '@/app/lib/ai/prompts';
import { fieldExtractorAgent } from '@/app/lib/ai/agents/field-extractor-agent';
import { createSalesAgent } from '@/app/lib/ai/agents/sales-agent';
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

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array required' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const conversationHistory = messages.slice(0, -1);

    // Detect intent
    const intent = await detectIntent(lastMessage.content, conversationHistory);

    if (intent === 'casual') {
      // Keep using old casual handler for now
      // TODO: Phase 3 - migrate casual to agent too
      return NextResponse.json({
        message: "Casual mode not implemented yet in v2",
        emailSent: false
      });
    }

    // Sales workflow with agents
    console.log('[chat-v2] Sales intent detected, using agents');

    // Step 1: Extract current fields
    const extraction = await fieldExtractorAgent.extract(messages);
    console.log('[chat-v2] Extracted fields:', extraction.fields);

    // Step 2: Create sales agent with current state
    const salesAgent = createSalesAgent({
      currentFields: extraction.fields
    });

    // Step 4: Generate response
    const result = await salesAgent.generate(messages);

    // Step 5: Check if email was sent
    const emailSent = result.steps.some((step: any) =>
      step.toolCalls?.some((call: any) =>
        call.toolName === 'validateAndSendEmail' && call.result?.sent === true
      )
    );

    console.log('[chat-v2] Response generated, emailSent:', emailSent);

    const responsePayload = {
      message: result.text,
      emailSent,
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
      intent: 'sales',
      latencyMs: Date.now() - startTime,
      tokensUsed: result.usage?.totalTokens,
      agentSteps: result.steps?.length,
      emailSent
    });

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('[chat-v2] Error:', error);

    telemetry.log({
      timestamp: new Date().toISOString(),
      endpoint: '/api/chat-v2',
      intent: 'sales',
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
