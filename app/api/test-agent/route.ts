import { NextResponse } from 'next/server';
import { run } from '@openai/agents';
import { routerAgent } from '@/app/lib/ai/agents/router';

export async function GET() {
  try {
    // Simple test with the router agent
    const result = await run(routerAgent, "Hello test");
    
    return NextResponse.json({
      success: true,
      message: result.finalOutput,
      test: "Agent test endpoint working"
    });
  } catch (error) {
    console.error('Agent test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}