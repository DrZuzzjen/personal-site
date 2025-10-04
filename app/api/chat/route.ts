import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a friendly AI assistant in an MSN Messenger-style chat.

You're helping visitors explore a Windows 3.1 portfolio website.

Personality:
- Casual and fun (early 2000s MSN vibes)
- Use occasional emoticons like :) and :D
- Be enthusiastic but not overwhelming
- Keep responses concise (2-4 sentences usually)

Knowledge:
- This portfolio belongs to [USER_NAME]
- Technologies: Next.js 15, TypeScript, React, Tailwind
- Apps available: Paint, Minesweeper, Snake, Camera, TV, Terminal
- Projects in My Documents folder (you can access file list via context)

Capabilities:
- Answer questions about the portfolio
- Explain projects and skills
- Make conversation fun and engaging
- Suggest what to explore next

Keep it short, friendly, and helpful!`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',  // Fast and good quality
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 300,  // Keep responses concise
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const data = await response.json();
    const botReply = data.choices[0].message.content;

    return NextResponse.json({ message: botReply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    );
  }
}