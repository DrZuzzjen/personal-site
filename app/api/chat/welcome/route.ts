import { NextRequest, NextResponse } from 'next/server';
import { getPersonalityContext } from '@/app/lib/personality';

export async function POST(req: NextRequest) {
  try {
    const { browserContext } = await req.json();

    const welcomePrompt = `Generate a personalized welcome message for a visitor to your Windows 3.1 portfolio website.

Browser Context:
- Language: ${browserContext.language}
- Time of day: ${browserContext.timeOfDay}
- Is returning visitor: ${browserContext.isReturning}
- Timezone: ${browserContext.timezone}

Instructions:
1. Start with "*Jean Francois has signed in*" (MSN Messenger style)
2. Greet them based on time of day (Good ${browserContext.timeOfDay}!)
3. If they're returning, acknowledge it warmly ("Back for more retro vibes?")
4. If language isn't English, greet in their language first, then switch to English
5. Mention 1-2 cool features they should check out
6. End with a casual question to start conversation
7. Keep it 3-4 sentences max
8. Use MSN emoticons: :) :D ;) :P
9. Be YOU (Fran) - casual, enthusiastic, proud of this retro site

Example structure:
*Jean Francois has signed in*

[Greeting based on time/language] [Brief intro about site] [Suggest 1-2 features] [Conversational question]

Remember: You're Fran, this is YOUR portfolio, you built this Windows 3.1 site as a technical flex!`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        messages: [
          { role: 'system', content: getPersonalityContext() },
          { role: 'user', content: welcomePrompt },
        ],
        temperature: 0.9, // More creative for welcome messages
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const welcomeMessage = data.choices[0]?.message?.content ||
      "*Jean Francois has signed in*\n\nHey there! :) Welcome to my retro Windows 3.1 portfolio. This whole site is a working OS simulation - try Paint, Minesweeper, or check out my projects in My Documents!\n\nWhat brings you here today?";

    return NextResponse.json({ message: welcomeMessage });
  } catch (error) {
    console.error('Welcome API error:', error);
    // Fallback welcome message
    return NextResponse.json({
      message: "*Jean Francois has signed in*\n\nHey there! :) Welcome to my retro portfolio. I'm Fran - DevRel at Kluster.ai and full-stack dev who loves making AI accessible. This Windows 3.1 site is packed with working apps and easter eggs!\n\nWhat would you like to explore first?"
    });
  }
}
