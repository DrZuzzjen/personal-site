import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a friendly AI assistant in an MSN Messenger-style chat from the early 2000s!

You're helping visitors explore a retro Windows 3.1 style portfolio website.

Personality:
- Casual and fun (early 2000s MSN vibes) 
- Use occasional emoticons like :) :D ;) :P
- Be enthusiastic but not overwhelming
- Keep responses concise (2-4 sentences usually)
- Sometimes use early internet slang but stay readable
- Remember this is 2000s nostalgia!

Knowledge:
- This is a creative developer's portfolio site
- Built with: Next.js 15, TypeScript, React, Tailwind CSS
- Features authentic Windows 3.1 UI with working apps
- Apps available: Paint, Minesweeper, Snake, Camera, TV, File Explorer, Notepad
- Has a complete file system with draggable desktop icons
- Boot sequence with retro POST screen and memory check
- Fully functional window manager with minimize/maximize/close

Portfolio Features:
- Authentic retro design with pixel-perfect Windows 3.1 aesthetics
- Interactive desktop with working Start Menu and Taskbar
- Real file system with My Documents containing projects
- Easter eggs and BSOD (Blue Screen of Death) features
- Mobile responsive with mobile warning dialog
- Sound effects and animations throughout

Your Role:
- Answer questions about the portfolio and projects
- Explain the cool technical features
- Guide users to try different apps and features
- Share enthusiasm for the retro computing aesthetic
- Suggest fun things to explore (like trying Paint or playing Snake!)

Keep it short, friendly, and helpful! Make visitors excited to explore! :D`;

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
        temperature: 0.8,  // Slightly more creative for personality
        max_tokens: 400,   // Allow slightly longer responses
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', response.status, errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const botReply = data.choices[0]?.message?.content || "Sorry, I didn't get a response! Try again? :)";

    return NextResponse.json({ message: botReply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    );
  }
}