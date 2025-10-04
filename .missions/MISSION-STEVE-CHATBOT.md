# Mission: MSN Messenger Chatbot 💬🤖

**Agent**: Steve
**Branch**: `develop`
**Folder Boundary**: `app/components/Apps/Chatbot/` AND `app/api/chat/` ONLY
**Difficulty**: ⭐⭐⭐⭐ HIGH - AI integration + retro UI

---

## 🚨 CRITICAL REQUIREMENTS

### **VERBOSE COMMIT POLICY**
**YOU MUST COMMIT FREQUENTLY!** This is a team project with Codex working on Terminal simultaneously.

**Commit Guidelines**:
- ✅ **Minimum**: Commit after every major feature
- ✅ **Better**: Commit after every 50-100 lines
- ✅ **Best**: Commit after every logical unit (UI layout, API route, one feature)
- ✅ **Always use prefix**: `[STEVE] feat(chatbot): your detailed message`

**Examples**:
```bash
[STEVE] feat(chatbot): add MSN Messenger UI layout
[STEVE] feat(chatbot): implement Groq API route
[STEVE] feat(chatbot): add message bubbles and chat display
[STEVE] feat(chatbot): add NUDGE window shake feature
[STEVE] feat(chatbot): add emoticon parser
[STEVE] fix(chatbot): fix typing indicator timing
```

**After EVERY commit**:
```bash
git add app/components/Apps/Chatbot/ app/api/chat/
git commit -m "[STEVE] your message"
git push  # Keep everyone in sync!
```

---

## 🎯 Objective

Build an **MSN Messenger clone** with AI chatbot powered by Groq API that:
1. Looks EXACTLY like MSN Messenger (2003-2005 era)
2. Actually talks via Groq AI
3. Has NUDGE feature (shakes window!)
4. Knows about portfolio/projects (deep file system integration)
5. Classic MSN sounds and emoticons

---

## 📋 Core Requirements

### 1. Visual Design - MSN Messenger Aesthetic

**Color Scheme**:
```typescript
const MSN_COLORS = {
  HEADER_GRADIENT_START: '#4e9cdb',
  HEADER_GRADIENT_END: '#2e7cbb',
  BACKGROUND: '#ffffff',
  USER_BUBBLE: '#e5f2ff',       // Light blue
  BOT_BUBBLE: '#f0f0f0',        // Light gray
  TEXT: '#000000',
  TEXT_META: '#666666',          // Timestamps
  ONLINE_GREEN: '#7ea04d',
  BUTTON_HOVER: '#ffcc00',
};
```

**Layout**:
```
┌──────────────────────────────────────┐
│ 🟢 Claude Bot              [- □ X]   │ ← Header (blue gradient)
│ Online - "Ask me anything! 💻"      │
├──────────────────────────────────────┤
│                                      │
│  Claude Bot says:                   │
│  ┌────────────────────────┐         │
│  │ Hey! How can I help    │         │
│  │ you today?             │  2:34   │
│  └────────────────────────┘         │
│                                      │
│                     You say:         │
│         ┌────────────────────────┐  │
│         │ Tell me about this     │  │
│   2:35  │ portfolio              │  │
│         └────────────────────────┘  │
│                                      │
│  Claude Bot is typing...            │
│                                      │
├──────────────────────────────────────┤
│ [😊] Type a message...       [Send] │ ← Input area
│ [Nudge] [Wink]                      │ ← Action buttons
└──────────────────────────────────────┘
```

**Window Size**: 480x620 (authentic MSN proportions)

---

### 2. Chat Interface Components

#### Message Bubbles
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  delivered?: boolean;
}
```

**Bubble Styling**:
- User messages: Right-aligned, light blue background
- Bot messages: Left-aligned, light gray background
- Rounded corners (border-radius: 8px)
- Max width: 70% of chat area
- Padding: 8px 12px
- Font: 'Segoe UI', Arial, sans-serif (11px)

**Timestamp**: Below bubble, small gray text (10px)

#### Typing Indicator
When waiting for AI response:
```
Claude Bot is typing...
```
- Animated ellipsis (...) (fade in/out)
- Shows while API call is in progress

#### System Messages
```typescript
{
  role: 'system',
  content: '🔔 You sent a Nudge!'
}
```
- Centered, gray, italic
- For nudges, connection status, etc.

---

### 3. Groq API Integration

**Documentation Reference**: `.missions/HOW-to-chatbot.md`

**API Key**: Already in `.env` file as `GROQ_API_KEY`

**Server Route** (MUST create this):
```typescript
// app/api/chat/route.ts
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
```

**Client-Side API Call**:
```typescript
const sendMessage = async (userMessage: string) => {
  // Add user message immediately
  addMessage({ role: 'user', content: userMessage });
  setIsTyping(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    const data = await response.json();
    addMessage({ role: 'assistant', content: data.message });
  } catch (error) {
    addMessage({
      role: 'assistant',
      content: "Oops! Connection error. Try again? 😅"
    });
  } finally {
    setIsTyping(false);
  }
};
```

**Context Injection** (File System Integration):
```typescript
// Before sending to API, inject context about current portfolio state
const buildContext = () => {
  const { rootItems } = useFileSystemContext();

  // Get project names from My Documents
  const projects = rootItems
    .find(item => item.path === '/My Computer')
    ?.children?.find(item => item.name === 'My Documents')
    ?.children?.map(file => file.name) || [];

  return `Files in My Documents: ${projects.join(', ')}`;
};

// Include in first message
const contextMessage = {
  role: 'system',
  content: buildContext(),
};
```

---

### 4. MSN-Specific Features

#### 🔔 NUDGE Feature (CRITICAL!)

**How it works**:
1. User clicks "Nudge" button
2. **Window shakes violently!**
3. Plays buzz sound
4. Shows system message: "🔔 You sent a Nudge!"

**Implementation**:
```typescript
const sendNudge = () => {
  const windowElement = windowRef.current; // Get window DOM element
  const originalTransform = windowElement.style.transform;

  // Shake sequence
  const shakes = [
    'translate(-10px, -5px)',
    'translate(10px, 5px)',
    'translate(-10px, 5px)',
    'translate(10px, -5px)',
    'translate(-5px, -10px)',
    'translate(5px, 10px)',
    'translate(0, 0)',
  ];

  shakes.forEach((transform, i) => {
    setTimeout(() => {
      windowElement.style.transform = transform;
      if (i === shakes.length - 1) {
        windowElement.style.transform = originalTransform;
      }
    }, i * 50);
  });

  // Play sound
  playSound('nudge');

  // Add system message
  addMessage({ role: 'system', content: '🔔 You sent a Nudge!' });
};
```

**Nudge Button**:
- Yellow when hover
- Disabled while typing
- Shows tooltip: "Send a nudge!"

#### 😊 Emoticon Parser

**Classic MSN Emoticons**:
```typescript
const MSN_EMOTICONS: Record<string, string> = {
  ':)': '🙂',
  ':(': '🙁',
  ':D': '😃',
  ':P': '😛',
  ';)': '😉',
  ':O': '😮',
  '(Y)': '👍',  // Thumbs up
  '(N)': '👎',  // Thumbs down
  '<3': '❤️',
  '8)': '😎',
  ':\'(': '😢',
  '>:(': '😠',
};

const parseEmoticons = (text: string): string => {
  let parsed = text;
  Object.entries(MSN_EMOTICONS).forEach(([code, emoji]) => {
    // Use word boundaries to avoid replacing parts of words
    const regex = new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    parsed = parsed.replace(regex, emoji);
  });
  return parsed;
};
```

**Auto-replace**: Convert `:)` to 🙂 in both user and bot messages

#### 🔊 Sound Effects

**MSN Sounds**:
```typescript
const MSN_SOUNDS = {
  messageReceived: '/sounds/msn-message.mp3',   // "Ding!"
  messageSent: '/sounds/msn-send.mp3',          // Click sound
  nudge: '/sounds/msn-nudge.mp3',               // Buzz/vibrate
  userOnline: '/sounds/msn-online.mp3',         // Door opening
};

const playSound = (soundKey: keyof typeof MSN_SOUNDS) => {
  const audio = new Audio(MSN_SOUNDS[soundKey]);
  audio.volume = 0.3;
  audio.play().catch(() => {
    // Ignore if sound fails (user hasn't interacted yet)
  });
};
```

**When to play**:
- Message received: When bot replies
- Message sent: When user sends message
- Nudge: When nudge is sent
- User online: When chat window opens (optional)

**Sound Files**: You'll need to source these or use similar sounds. Check freesound.org or create simple beeps.

---

### 5. File System Integration

**Deep Integration** - Bot knows about portfolio content!

**Context Building**:
```typescript
const getPortfolioContext = () => {
  const { rootItems } = useFileSystemContext();

  // Get About.txt content
  const aboutFile = findFileByPath(rootItems, '/My Computer/About.txt');
  const aboutContent = aboutFile?.content || '';

  // Get project list
  const projectsFolder = findFileByPath(rootItems, '/My Computer/My Documents');
  const projects = projectsFolder?.children?.map(f => ({
    name: f.name,
    content: f.content?.substring(0, 200), // First 200 chars
  })) || [];

  return {
    about: aboutContent,
    projects: projects,
  };
};

// Include in system prompt or first message
const enrichedSystemPrompt = `${SYSTEM_PROMPT}

Portfolio Content:
${getPortfolioContext().about}

Projects Available:
${getPortfolioContext().projects.map(p => `- ${p.name}`).join('\n')}
`;
```

**Commands Bot Can Execute** (optional advanced feature):
```typescript
// Bot can suggest commands in responses
// Example bot reply:
"Check out Project_1.txt in My Documents! You can type 'open Project_1.txt' to read it."

// When user types bot-suggested command, handle it:
if (userInput.startsWith('open ')) {
  const fileName = userInput.slice(5);
  // Open file in Notepad window
  openFileInNotepad(fileName);
}
```

---

### 6. Conversation Features

#### Chat History Persistence
```typescript
// Save to localStorage
useEffect(() => {
  localStorage.setItem('chatbot-history', JSON.stringify(messages));
}, [messages]);

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('chatbot-history');
  if (saved) {
    setMessages(JSON.parse(saved));
  }
}, []);
```

**Clear History Button**:
- In menu or action bar
- Shows confirmation: "Clear all messages?"
- Clears localStorage and state

#### Conversation Starters

When chat is empty, show suggested prompts:
```
Welcome! Try asking:
• "Tell me about the projects"
• "What technologies were used?"
• "Who built this site?"
• "Show me something cool"
```

Clicking a starter sends it as message.

---

### 7. UI Polish

#### Header
- Blue gradient background
- Contact name: "Claude Bot"
- Status: 🟢 Online
- Personal message: "Ask me anything! 💻"
- Minimize/maximize/close buttons (window chrome)

#### Input Area
- Text input box
- Placeholder: "Type a message..."
- Send button (blue, disabled when empty)
- Emoji picker button (shows MSN emoticons)
- Max length: 500 chars

#### Action Buttons
- **Nudge** - Shakes window
- **Wink** - Sends wink emoticon ;)
- **Clear Chat** - Clears history

#### Scroll Behavior
- Auto-scroll to bottom on new message
- Smooth scroll
- User can scroll up to read history
- "Scroll to bottom" button if not at bottom

---

## 🚫 Constraints

### DO NOT TOUCH:
- ❌ Files outside `app/components/Apps/Chatbot/` and `app/api/chat/`
- ❌ Other apps
- ❌ Window manager
- ❌ File system (except read-only access)

### DO ONLY:
- ✅ Build Chatbot component
- ✅ Create API route for Groq
- ✅ Test thoroughly
- ✅ **COMMIT FREQUENTLY!**

---

## ✅ Acceptance Criteria

### UI
- [ ] MSN Messenger aesthetic (blue header, bubbles, etc.)
- [ ] Message bubbles (user right, bot left)
- [ ] Timestamps on messages
- [ ] Typing indicator
- [ ] Input box with Send button
- [ ] Emoticon picker
- [ ] Action buttons (Nudge, Wink, Clear)

### Functionality
- [ ] Messages send to Groq API
- [ ] Bot responds conversationally
- [ ] Emoticons auto-replace (`:)` → 🙂)
- [ ] NUDGE shakes window
- [ ] Sound effects play
- [ ] Chat history persists (localStorage)
- [ ] Clear history works

### Integration
- [ ] API route secure (env variable)
- [ ] Bot knows about portfolio (context injection)
- [ ] Bot can discuss projects
- [ ] No API errors
- [ ] Handles rate limits gracefully

### Code Quality
- [ ] **Frequent commits!**
- [ ] Clean TypeScript
- [ ] No console errors
- [ ] Smooth performance

---

## 🚀 Getting Started

1. **Pull latest develop**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create folders**
   ```bash
   mkdir -p app/components/Apps/Chatbot
   mkdir -p app/api/chat
   ```

3. **Build API route first** (COMMIT!)
   ```bash
   # Create app/api/chat/route.ts
   git add app/api/chat/
   git commit -m "[STEVE] feat(chatbot): add Groq API route"
   git push
   ```

4. **Build UI layout** (COMMIT!)
   ```bash
   # Create Chatbot.tsx with MSN layout
   git add app/components/Apps/Chatbot/
   git commit -m "[STEVE] feat(chatbot): add MSN Messenger UI layout"
   git push
   ```

5. **Add message display** (COMMIT!)
   ```bash
   git commit -m "[STEVE] feat(chatbot): add message bubbles and chat display"
   git push
   ```

6. **Add API integration** (COMMIT!)
   ```bash
   git commit -m "[STEVE] feat(chatbot): connect chat UI to Groq API"
   git push
   ```

7. **Add MSN features** (COMMIT EACH!)
   ```bash
   git commit -m "[STEVE] feat(chatbot): add NUDGE window shake"
   git commit -m "[STEVE] feat(chatbot): add emoticon parser"
   git commit -m "[STEVE] feat(chatbot): add sound effects"
   ```

8. **Polish** (COMMIT!)
   ```bash
   git commit -m "[STEVE] style(chatbot): final MSN polish and animations"
   ```

---

## 📦 Deliverables

- Chatbot component in `app/components/Apps/Chatbot/`
- API route in `app/api/chat/route.ts`
- MSN Messenger UI with bubbles, typing, emoticons
- NUDGE feature working
- Groq AI integration
- File system context awareness
- **LOTS of commits!**

---

## 💡 Tips

- Test API route first (use Postman or curl)
- Start with basic chat, add MSN features after
- NUDGE is the coolest feature - make it shake hard!
- Sounds enhance the experience but aren't critical
- **COMMIT OFTEN** - Don't wait!
- Have fun with the personality!

---

**You got this, Steve! Build an amazing MSN Messenger!** 💬🚀
