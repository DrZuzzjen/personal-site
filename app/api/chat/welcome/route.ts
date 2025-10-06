import { NextRequest, NextResponse } from 'next/server';
import { getPersonalityContext } from '@/app/lib/personality.server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Health check mode
    if (body.test === true) {
      return NextResponse.json({ status: 'ok' });
    }

    const { browserContext } = body;

    // Log browser context for debugging
    console.log('=== WELCOME API ===');
    console.log('Browser context:', browserContext);

    // Infer language from timezone (more reliable than browser language)
    const timezone = browserContext.timezone || '';
    const city = browserContext.city?.toLowerCase() || '';

    let detectedLang = 'en'; // default

    // Spanish timezones and cities
    if (timezone.includes('Madrid') || timezone.includes('Europe/Madrid') ||
        city.includes('madrid') || city.includes('barcelona') || city.includes('valencia') ||
        city.includes('sevilla') || city.includes('malaga') || city.includes('bilbao')) {
      detectedLang = 'es';
    }
    // French timezones and cities
    else if (timezone.includes('Paris') ||
        city.includes('paris') || city.includes('lyon') || city.includes('marseille')) {
      detectedLang = 'fr';
    }
    // German timezones and cities
    else if (timezone.includes('Berlin') ||
        city.includes('berlin') || city.includes('munich') || city.includes('hamburg')) {
      detectedLang = 'de';
    }
    // Fallback to browser language if no timezone match
    else {
      const browserLang = browserContext.languageCode?.toLowerCase() || 'en';
      detectedLang = browserLang.split('-')[0]; // es-ES -> es
    }

    console.log('Timezone:', timezone);
    console.log('City:', city);
    console.log('Detected language:', detectedLang);

    const isSpanish = detectedLang === 'es';
    const isFrench = detectedLang === 'fr';
    const isGerman = detectedLang === 'de';
    const timeOfDay = browserContext.timeOfDay || 'afternoon';
    const isReturning = browserContext.isReturning || false;

    const welcomePrompt = `You are Jean Francois greeting someone on MSN Messenger.

CONTEXT:
- Language: ${isSpanish ? 'Spanish ONLY' : isFrench ? 'French ONLY' : isGerman ? 'German ONLY' : 'English ONLY'}
- Time: ${timeOfDay}
- Location: ${city ? city : 'unknown'}
- Timezone: ${timezone}
- Returning: ${isReturning ? 'yes' : 'no'}

RULES:
1. Write ONLY in ${isSpanish ? 'Spanish' : isFrench ? 'French' : isGerman ? 'German' : 'English'}
2. Be clever about their location! Make a casual comment about their city/country
3. Use time-appropriate greeting
4. Keep it 2-3 lines max
5. Use emoticons: :) :D ;)
6. NO forbidden words: "check out", "explore", "portfolio", "Windows"

LOCATION EXAMPLES:

Buenos Aires (Spanish):
"hola che! :)
¿todavía por Argentina?
¿qué tal la noche?"

Madrid (Spanish):
"buenas noches! :)
¿qué tal Madrid hoy?"

London (English):
"hey mate! :)
how's the weather in the UK?"

New York (English):
"hey! :)
NYC at night?
can't sleep? jaja"

Paris (French):
"salut! :)
comment ça va à Paris?"

Generic (no location):
"hey! :)
what brings you here?"

Now write your greeting:`;

    console.log('=== PROMPT BEING SENT ===');
    console.log(welcomePrompt);

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
    let welcomeMessage = data.choices[0]?.message?.content ||
      "hey! :)\nwhat's up?";

    // Remove quotes that LLM sometimes adds
    welcomeMessage = welcomeMessage.replace(/^["']|["']$/g, '').trim();

    console.log('=== LLM RESPONSE ===');
    console.log('Welcome message:', welcomeMessage);

    return NextResponse.json({ message: welcomeMessage });
  } catch (error) {
    console.error('Welcome API error:', error);
    // Fallback welcome message
    return NextResponse.json({
      message: "hey! :)\nwhat's up?"
    });
  }
}
