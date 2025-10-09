# Mission 3A: Integrate Casual Chat Agent into chat-v2

## Objective
Migrate the working casual chat handler from `/api/chat` into `/api/chat-v2` to provide seamless conversational experience alongside the Sales Agent.

## Current State

**Problem:** `/api/chat-v2` returns error for casual intent:
```typescript
if (intent === 'casual') {
  return NextResponse.json({
    message: "Casual mode not implemented yet in v2",
    emailSent: false
  });
}
```

**Solution:** Copy the existing `handleCasualChat()` function from `/api/chat/route.ts` which already works perfectly with:
- Jean Francois personality (`PROMPTS.CASUAL_CHAT()`)
- Function calling tools (openApp, closeApp, restart)
- All 12 Start Menu apps support
- Tool execute() result messages (clean UX)

## Why NOT Migrate to Agent Class

We're keeping casual chat as `generateText()` + tools (not Agent class) because:

1. **Performance** - Casual is one-shot responses, no multi-step reasoning needed
2. **Speed** - Single LLM call vs Agent's multiple steps
3. **Simplicity** - Less complexity for simple interactions
4. **Tool Support** - `generateText()` supports tools just like Agent class

**Agent class is reserved for Sales workflow** which needs multi-step field collection.

## Implementation Steps

### Step 1: Copy Helper Functions

Copy these functions from `/api/chat/route.ts` to `/api/chat-v2/route.ts`:

**Line 23-24** - Action interface:
```typescript
interface Action {
  type: 'openApp' | 'closeApp' | 'restart';
  appName?: string;
}
```

**Lines 140-228** - Casual handler:
```typescript
async function handleCasualChat(userMessage: string, conversationHistory: Message[]): Promise<{ message: string; actions: Action[] }> {
  try {
    const { text, toolCalls } = await generateText({
      model: groq(process.env.GROQ_CASUAL_MODEL || 'llama-3.3-70b-versatile'),
      messages: [
        { role: 'system', content: PROMPTS.CASUAL_CHAT() },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.8,
      tools: {
        openApp: {
          description: 'Opens an application window on the Windows desktop. Use this when user asks to open, launch, or start an app. Available apps: paint, minesweeper, snake, notepad, camera, tv, browser (internet explorer), chatbot (MSN Messenger), portfolio, terminal, mycomputer, explorer.',
          inputSchema: z.object({
            appName: z.enum(['paint', 'minesweeper', 'snake', 'notepad', 'camera', 'tv', 'browser', 'chatbot', 'portfolio', 'terminal', 'mycomputer', 'explorer'])
              .describe('The name of the application to open')
          }),
          execute: async ({ appName }) => {
            const messages: Record<string, string> = {
              paint: '¡Listo! Abriendo Paint 🎨',
              minesweeper: '¡A jugar! Abriendo Minesweeper 💣',
              snake: '¡Vamos! Abriendo Snake 🐍',
              notepad: 'Abriendo Bloc de notas 📝',
              camera: 'Abriendo cámara 📷',
              tv: 'Abriendo TV 📺',
              browser: 'Abriendo navegador 🌐',
              chatbot: 'Abriendo MSN Messenger 💬',
              portfolio: 'Abriendo Portfolio 📁',
              terminal: 'Abriendo Terminal 💻',
              mycomputer: 'Abriendo Mi PC 🖥️',
              explorer: 'Abriendo explorador de archivos 📂'
            };
            return { appName, message: messages[appName] || '¡Listo!' };
          }
        },
        closeApp: {
          description: 'Closes an open application window. Use this when user asks to close, quit, or exit an app.',
          inputSchema: z.object({
            appName: z.enum(['paint', 'minesweeper', 'snake', 'notepad', 'camera', 'tv', 'browser', 'chatbot', 'portfolio', 'terminal', 'mycomputer', 'explorer'])
              .describe('The name of the application to close')
          }),
          execute: async ({ appName }) => ({ appName, message: `✅ Cerrando ${appName}` })
        },
        restart: {
          description: 'Closes all open windows and restarts the desktop. Use this when user asks to restart, reboot, or close everything.',
          inputSchema: z.object({}),
          execute: async () => ({ success: true, message: '🔄 Reiniciando escritorio...' })
        }
      }
    });

    // Convert toolCalls to actions for client-side execution
    const actions: Action[] = toolCalls.map(call => {
      if (call.toolName === 'openApp' || call.toolName === 'closeApp') {
        return {
          type: call.toolName,
          appName: (call as any).input?.appName
        };
      } else if (call.toolName === 'restart') {
        return { type: 'restart' };
      }
      return { type: 'openApp' };
    });

    // Generate clean message based on tool results (NOT from LLM text)
    let cleanMessage = '';

    if (toolCalls.length > 0) {
      const firstToolResult = (toolCalls[0] as any).result;
      cleanMessage = firstToolResult?.message || '¡Listo!';
    } else {
      cleanMessage = text || "hey! :) what's up?";
    }

    return {
      message: cleanMessage,
      actions
    };
  } catch (error) {
    console.error('Casual chat error:', error);
    return {
      message: "hey! :) what's up?",
      actions: []
    };
  }
}
```

### Step 2: Import Dependencies

Add to imports at top of `/api/chat-v2/route.ts`:
```typescript
import { z } from 'zod'; // Add if not already imported
```

### Step 3: Replace Casual Mode Error

Find this block (around line 58-68):
```typescript
if (intent === 'casual') {
  // Keep using old casual handler for now
  return NextResponse.json(
    {
      message: "Casual mode not implemented yet in v2",
      emailSent: false,
    },
    { status: 501 }
  );
}
```

Replace with:
```typescript
if (intent === 'casual') {
  console.log('[chat-v2] Casual intent detected, using casual handler');

  // Use casual chat handler with personality
  const casualResult = await handleCasualChat(lastMessage.content, conversationHistory);

  // Log telemetry for casual chats too
  telemetry.log({
    timestamp: new Date().toISOString(),
    endpoint: '/api/chat-v2',
    intent: 'casual',
    latencyMs: Date.now() - startTime,
    emailSent: false,
  });

  return NextResponse.json({
    message: casualResult.message,
    actions: casualResult.actions || [],
    emailSent: false,
  });
}
```

### Step 4: Update Frontend Response Handler

Check if `Chatbot.tsx` handles the `actions` array in the response. If not, add handling:

```typescript
const data = await res.json();

// Handle actions (tool calls from casual chat)
if (data.actions && data.actions.length > 0) {
  data.actions.forEach((action: any) => {
    if (action.type === 'openApp' && action.appName) {
      // Open app window via WindowContext
      const appConfig = getAppConfig(action.appName);
      if (appConfig) {
        addWindow(appConfig);
      }
    } else if (action.type === 'closeApp' && action.appName) {
      // Close app window
      // ... implement close logic
    } else if (action.type === 'restart') {
      // Close all windows
      // ... implement restart logic
    }
  });
}
```

## Testing Plan

### Test Case 1: Casual Greeting
```
Input: "Hey! How's it going?"
Expected: Friendly casual response in Jean Francois style
Verify: No tools called, personality shines through
```

### Test Case 2: Open App Tool Call
```
Input: "Open Paint"
Expected: "¡Listo! Abriendo Paint 🎨"
Verify: Paint window opens, action returned in response
```

### Test Case 3: Intent Switching (Critical)
```
Conversation flow:
1. "Hi!" → Casual response
2. "Cool portfolio!" → Casual response
3. "I want to build a website" → Sales agent activates
4. Provide name, email → Email sent
5. "Thanks!" → Back to casual

Verify: Smooth transitions, no context loss
```

### Test Case 4: All 12 Apps
```
Test opening each app via casual chat:
- paint, minesweeper, snake, notepad
- camera, tv, browser, chatbot
- portfolio, terminal, mycomputer, explorer

Verify: All apps open correctly via function calling
```

### Test Case 5: Multilingual Casual
```
Input (Spanish): "¡Hola! ¿Qué tal?"
Expected: Response in Spanish with personality
Input (French): "Salut! Comment ça va?"
Expected: Response in French with personality
```

## Performance Expectations

- **Casual chat latency**: <1.5 seconds (single generateText call)
- **Sales chat latency**: ~2 seconds (extraction + agent)
- **Intent detection**: ~300ms (already optimized)

Total casual flow should be **significantly faster** than sales flow.

## Files to Modify

1. **[app/api/chat-v2/route.ts](app/api/chat-v2/route.ts)** - Add handleCasualChat, wire up casual intent
2. **[app/components/Apps/Chatbot/Chatbot.tsx](app/components/Apps/Chatbot/Chatbot.tsx)** - Handle actions array (if not already done)

## Acceptance Criteria

- [ ] Casual chat works with Jean Francois personality
- [ ] All 12 apps open via function calling
- [ ] Intent switching works seamlessly (casual ↔ sales)
- [ ] Response times under 1.5s for casual
- [ ] Actions array properly handled in frontend
- [ ] Telemetry logs casual conversations
- [ ] Multilingual support maintained
- [ ] No regression in sales flow performance
- [ ] All 5 test cases pass

## Priority

**MEDIUM-HIGH** - This completes the unified chat experience. Sales agent is working, now we need casual to complete the system.

## Notes

- Keep casual as `generateText()` + tools (not Agent class) for performance
- Casual handler already battle-tested in `/api/chat`
- Router automatically handles intent switching on every message
- This is primarily a copy-paste integration task, minimal new code

## Success Metrics

After this mission:
- ✅ Full conversational experience (casual + sales)
- ✅ Function calling works (open/close apps)
- ✅ Personality system integrated
- ✅ Seamless intent transitions
- ✅ Production-ready chat-v2 endpoint

Let's complete the unified agent system! 🚀
