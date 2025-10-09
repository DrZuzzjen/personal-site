import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';
import { getPersonalityContext } from '@/app/lib/personality.server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { browserContext, conversationHistory, currentApp } = body;

    // Infer language from timezone (same logic as welcome)
    const timezone = browserContext?.timezone || '';
    const city = browserContext?.city?.toLowerCase() || '';

    let detectedLang = 'en'; // default

    // Spanish timezones and cities
    if (
      timezone.includes('Madrid') ||
      timezone.includes('Europe/Madrid') ||
      timezone.includes('Europe/Barcelona') ||
      city.includes('madrid') ||
      city.includes('barcelona') ||
      city.includes('valencia') ||
      city.includes('sevilla')
    ) {
      detectedLang = 'es';
    }
    // Add more languages as needed

    const isSpanish = detectedLang === 'es';

    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay = 'day';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Build context about what user is doing
    let activityContext = '';
    if (currentApp) {
      switch (currentApp) {
        case 'minesweeper':
          activityContext = isSpanish
            ? 'El usuario está jugando Minesweeper (buscaminas)'
            : 'User is playing Minesweeper';
          break;
        case 'snake':
          activityContext = isSpanish
            ? 'El usuario está jugando Snake'
            : 'User is playing Snake';
          break;
        case 'paint':
          activityContext = isSpanish
            ? 'El usuario está usando Paint (dibujando)'
            : 'User is using Paint (drawing)';
          break;
        case 'notepad':
          activityContext = isSpanish
            ? 'El usuario está leyendo un documento en Notepad'
            : 'User is reading a document in Notepad';
          break;
        case 'explorer':
          activityContext = isSpanish
            ? 'El usuario está explorando archivos'
            : 'User is exploring files';
          break;
        default:
          activityContext = isSpanish
            ? 'El usuario está en el escritorio (idle)'
            : 'User is on desktop (idle)';
      }
    }

    // Build conversation summary (last 2-3 messages)
    let conversationSummary = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-3);
      conversationSummary = recentMessages
        .map((msg: any) => `${msg.role}: ${msg.content.substring(0, 50)}...`)
        .join('\n');
    }

    const proactivePrompt = `You are Jean Francois checking in on the user after they minimized MSN Messenger.

CONTEXT:
- Language: ${isSpanish ? 'Spanish ONLY' : 'English ONLY'}
- Time: ${timeOfDay}
- User activity: ${activityContext || 'Unknown'}
- Location: ${city || 'unknown'}
- Timezone: ${timezone}

RECENT CONVERSATION:
${conversationSummary || 'No previous conversation'}

RULES:
1. Write ONLY in ${isSpanish ? 'Spanish' : 'English'}
2. Be clever about their current activity! Make a casual comment about what they're doing
3. Keep it super short: 2 lines MAX
4. Use emoticons: :) :D ;) 💣 🎨 🐍
5. Be helpful but casual - you're just checking in
6. NO forbidden words: "check out", "explore", "portfolio"

EXAMPLES:

If playing Minesweeper (Spanish):
"¿todavía minando? 💣
¿necesitas ayuda o un descanso? :)"

If playing Snake (Spanish):
"¿cuántos puntos llevas? 🐍
¡a ver si me superas!"

If using Paint (Spanish):
"¿qué estás dibujando? 🎨
¡muéstrame cuando termines!"

If idle (Spanish):
"¿qué tal? ¿aburrido?
¿quieres ver mis proyectos? :D"

If playing Minesweeper (English):
"still mining? 💣
need a break? :)"

Now write your check-in message based on what they're doing:`;

    // Remove sensitive logging for production security
    // console.log('=== PROACTIVE MESSAGE REQUEST ===');
    // console.log('Language:', detectedLang);
    // console.log('Activity:', activityContext);
    // console.log('Time of day:', timeOfDay);

    // Use Vercel AI SDK for cleaner, type-safe API calls
    const { text: proactiveMessage } = await generateText({
      model: groq(process.env.GROQ_PROACTIVE_MODEL || 'meta-llama/llama-4-maverick-17b-128e-instruct'),
      messages: [
        { role: 'system', content: getPersonalityContext() },
        { role: 'user', content: proactivePrompt },
      ],
      temperature: 0.9,
      maxTokens: 150,
    });

    // Remove quotes that LLM sometimes adds
    const cleanedMessage = proactiveMessage.replace(/^["']|["']$/g, '').trim();

    // Remove sensitive logging for production security
    // console.log('=== LLM PROACTIVE RESPONSE ===');
    // console.log('Message:', cleanedMessage);

    return NextResponse.json({ message: cleanedMessage });
  } catch (error) {
    console.error('Proactive API error:', error);
    return NextResponse.json({ message: "hey! :)\nstill there?" });
  }
}
