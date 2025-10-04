# Future Apps - Deep Planning 🚀

**Status**: Planning Phase - NOT yet assigned
**For**: After Snake + Desktop features complete

---

## 🖥️ Terminal App (MS-DOS Command Prompt)

### 🎨 Visual Concept

**Style**: MS-DOS / Windows 3.1 Command Prompt
```
C:\>_
```

**Aesthetic**:
- Pure black background (#000000)
- Green phosphor text (#00ff00) OR amber (#ffb000) OR white (#ffffff)
- Classic PC font (IBM VGA, Fixedsys, or Courier New)
- Blinking cursor (underscore or block)
- Optional: CRT scanlines overlay
- Optional: Slight screen curvature effect

**Window Chrome**:
- Title: "MS-DOS Prompt - C:\WINDOWS"
- Default size: 640x400 (authentic DOS resolution)
- Monospace content, authentic prompt style

---

### 💡 Core Functionality

#### Virtual File System Commands
Wire into existing `useFileSystem` hook:

**Navigation**:
- `cd [path]` - Change directory
- `dir` or `ls` - List files in current directory
- `cd..` - Go up one directory
- `tree` - Show directory tree (ASCII art)

**File Operations**:
- `type [file]` or `cat [file]` - Display file contents
- `copy [src] [dest]` - Copy file
- `del [file]` or `rm [file]` - Delete file (with protection)
- `ren [old] [new]` - Rename file
- `mkdir [name]` - Create folder

**System Info**:
- `ver` - Show "Windows 3.1" version
- `whoami` - Display portfolio owner name/info (funny response)
- `date` - Show current date
- `time` - Show current time
- `cls` or `clear` - Clear screen

**Fun Commands**:
- `help` - List available commands
- `echo [text]` - Echo text back
- `color [code]` - Change text color (green/amber/white)

---

### 🎮 Hidden Games & Easter Eggs

#### Option 1: Text Adventure Game
```
C:\> adventure start

You are standing in an open field west of a white house,
with a boarded front door.
There is a small mailbox here.

> open mailbox
```

**Classic Zork-style adventure**:
- Simple parser (verb + noun)
- 5-10 rooms to explore
- Portfolio-themed: Find hidden projects, unlock skills
- Win condition: Reach the "Hired!" room
- Easter egg items: "Golden Mouse", "Disk of Knowledge"

#### Option 2: ASCII Snake in Terminal
```
C:\> play snake

╔════════════════════════════╗
║  ●●●●○                    ║
║                            ║
║           ★                ║
╚════════════════════════════╝

Score: 3  High: 15
[WASD to move, Q to quit]
```

#### Option 3: "Hack the Mainframe" Simulator
```
C:\> hack

[INITIALIZING CYBERDECK...]
[SCANNING FOR VULNERABILITIES...]
[BYPASSING FIREWALL...]
[ACCESSING MAINFRAME...]
[SUCCESS! YOU ARE NOW 1337 HACKER]

Achievement Unlocked: Script Kiddie 🏆
```

**Fake hacking sequences**:
- Progress bars with random hex
- Matrix-style falling characters
- "Accessing Gibson..." references
- Ends with job offer or portfolio link

#### Other Easter Eggs
- `sudo rm -rf /` - "Nice try! 😏 Access Denied."
- `format c:` - Fake FORMAT warning, then "Just kidding!"
- `win` - "Starting Windows..." then actually minimize terminal
- `cowsay [text]` - ASCII cow saying text
- `fortune` - Random programming jokes/quotes
- `matrix` - Matrix digital rain animation
- `starwars` - ASCII Star Wars (if we can embed)
- `konami` - Konami code in text form gives achievement
- `credits` - Scroll credits for the portfolio site
- `resume` - ASCII art resume or download PDF

---

### 🔧 Technical Architecture

#### Command Parser
```typescript
interface Command {
  name: string;
  aliases?: string[];
  execute: (args: string[], terminal: Terminal) => void;
  description: string;
}

const commands: Command[] = [
  {
    name: 'dir',
    aliases: ['ls'],
    execute: (args, term) => term.listFiles(args[0] || term.currentPath),
    description: 'List files in directory'
  },
  // ...
];

function parseCommand(input: string): { cmd: string; args: string[] } {
  const parts = input.trim().split(/\s+/);
  return { cmd: parts[0].toLowerCase(), args: parts.slice(1) };
}
```

#### Terminal State
```typescript
interface TerminalState {
  history: string[];          // Command history (up/down arrows)
  output: TerminalLine[];     // All terminal output
  currentPath: string;        // Current directory (C:\WINDOWS\...)
  commandHistory: string[];   // For up/down navigation
  historyIndex: number;
  color: 'green' | 'amber' | 'white';
}

interface TerminalLine {
  type: 'prompt' | 'output' | 'error';
  content: string;
}
```

#### File System Integration
```typescript
// Hook into existing useFileSystem
const { files, currentPath, navigateTo, getFile, createFile } = useFileSystem();

// Terminal can execute real operations
function executeCommand(cmd: string, args: string[]) {
  switch(cmd) {
    case 'cd':
      navigateTo(args[0]);
      break;
    case 'type':
      const file = getFile(args[0]);
      return file?.content || 'File not found';
    // ...
  }
}
```

#### Keyboard Handling
- **Enter**: Execute command
- **Up/Down Arrows**: Navigate command history
- **Tab**: Auto-complete file names (bonus)
- **Ctrl+C**: Interrupt current process (if running game)
- **Ctrl+L**: Clear screen

---

### 🤔 Questions for You

1. **Game Choice**: Which hidden game sounds most fun?
   - Text adventure (Zork-style, portfolio-themed)
   - ASCII Snake (simple, addictive)
   - Hack simulator (flashy, funny)
   - Multiple options available?

2. **Command Scope**: Should commands be:
   - **Functional**: Actually create/delete files in virtual FS
   - **Read-only**: Only navigate and read, can't modify
   - **Mixed**: Some commands work, some are cosmetic

3. **Color**: Default terminal color?
   - Green (classic Matrix/terminal)
   - Amber (old CRT monitors)
   - White (MS-DOS default)
   - User can toggle with `color` command?

4. **Easter Egg Density**: How many hidden commands?
   - Just a few major ones (adventure, hack)
   - Tons of silly commands (cowsay, fortune, matrix, etc.)

---

## 💬 Chatbot App (MSN Messenger Clone)

### 🎨 Visual Concept

**Style**: MSN Messenger circa 2003-2005

**Layout**:
```
┌─────────────────────────────────────┐
│ 🟢 Claude Bot                      │ ← Contact header
├─────────────────────────────────────┤
│                                     │
│  Claude Bot says:                  │ ← Chat messages
│  Hey! How can I help you today?    │
│                              [2:34] │
│                                     │
│  You say:                          │
│  Tell me about this portfolio      │
│                              [2:35] │
│                                     │
│  Claude Bot is typing...           │ ← Typing indicator
│                                     │
├─────────────────────────────────────┤
│ [Type a message...]          [Send] │ ← Input area
│ [😊] [Nudge] [Wink]               │ ← Action buttons
└─────────────────────────────────────┘
```

**Color Scheme**:
- Classic MSN blue gradient header (#4e9cdb → #2e7cbb)
- White message background
- Speech bubbles (alternating colors):
  - User: Light blue (#e5f2ff)
  - Bot: Light gray (#f0f0f0)
- Window chrome: Standard Windows 3.1 gray

---

### 💡 Core Features

#### Chat Interface
1. **Message Display**:
   - Speech bubbles with timestamps
   - User messages on right, bot on left (or opposite)
   - Auto-scroll to latest message
   - Message history persists (localStorage)

2. **Input Box**:
   - Text input at bottom
   - Enter to send, Shift+Enter for new line
   - Character limit indicator (optional)
   - Emoji picker button (classic MSN emoticons)

3. **Status Indicators**:
   - Contact status (Online/Away/Busy) - always "Online" for bot
   - "Typing..." indicator when waiting for AI response
   - Message delivery status (✓ sent, ✓✓ delivered)

4. **Actions**:
   - **Send**: Send message to AI
   - **Nudge**: Shake the entire window! (classic MSN feature)
   - **Wink**: Send animated emoticon (optional)
   - **Clear Chat**: Reset conversation

---

### 🤖 Groq API Integration

#### API Flow
```typescript
async function sendMessage(message: string) {
  // Add user message to UI immediately
  addMessage({ role: 'user', content: message });

  // Show typing indicator
  setTyping(true);

  try {
    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768', // or llama2-70b-4096
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const botReply = data.choices[0].message.content;

    // Add bot message to UI
    addMessage({ role: 'assistant', content: botReply });
  } catch (error) {
    // Fallback message
    addMessage({
      role: 'assistant',
      content: "Oops! Connection error. Try again? 😅"
    });
  } finally {
    setTyping(false);
  }
}
```

#### System Prompt Ideas
```typescript
const SYSTEM_PROMPT = `You are a friendly AI assistant in a retro MSN Messenger-style chat app.

You're chatting with visitors to a portfolio website built as a Windows 3.1 simulation.

Personality:
- Conversational and casual (like chatting with a friend in 2003)
- Use occasional emojis, but not excessively
- Reference retro tech/gaming if relevant
- Help users learn about the portfolio owner's skills and projects

Knowledge:
- This is a portfolio site for [Your Name]
- Built with Next.js, TypeScript, React
- Features: Paint, Minesweeper, Snake, Camera, TV apps
- Projects: [List your real projects here]

Keep responses concise (2-3 sentences usually). Be helpful and enthusiastic!`;
```

---

### 🎮 MSN-Specific Features

#### 1. Nudge Feature
```typescript
function sendNudge() {
  // Shake the window!
  const window = windowRef.current;
  const originalPos = { x: window.x, y: window.y };

  // Animate shake
  const shakeSequence = [
    { x: -10, y: 0 },
    { x: 10, y: 0 },
    { x: -10, y: 5 },
    { x: 10, y: -5 },
    { x: 0, y: 0 },
  ];

  shakeSequence.forEach((offset, i) => {
    setTimeout(() => {
      window.setPosition(originalPos.x + offset.x, originalPos.y + offset.y);
    }, i * 50);
  });

  // Play sound (optional)
  playSound('/sounds/nudge.mp3');

  // Show message
  addMessage({ role: 'system', content: '🔔 You sent a Nudge!' });
}
```

#### 2. Classic Emoticons
```typescript
const MSN_EMOTICONS = {
  ':)': '🙂',
  ':(': '🙁',
  ':D': '😃',
  ':P': '😛',
  ';)': '😉',
  ':O': '😮',
  '(Y)': '👍',
  '(N)': '👎',
  '<3': '❤️',
  '8)': '😎',
};

// Auto-replace in messages
function parseEmoticons(text: string): string {
  let parsed = text;
  Object.entries(MSN_EMOTICONS).forEach(([code, emoji]) => {
    parsed = parsed.replaceAll(code, emoji);
  });
  return parsed;
}
```

#### 3. Sound Effects
```typescript
// Classic MSN sounds (use Howler.js or native Audio)
const SOUNDS = {
  messageReceived: '/sounds/msn-message.mp3',  // "Ding!"
  messageSent: '/sounds/msn-send.mp3',         // Door closing
  nudge: '/sounds/msn-nudge.mp3',              // Buzz
  userJoin: '/sounds/msn-online.mp3',          // Door opening
};

function playSound(soundKey: keyof typeof SOUNDS) {
  const audio = new Audio(SOUNDS[soundKey]);
  audio.volume = 0.3;
  audio.play();
}
```

---

### 🔧 Technical Architecture

#### Message State
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  delivered?: boolean;
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  conversationId: string;
}

// Persist to localStorage
useEffect(() => {
  localStorage.setItem(`chat-${conversationId}`, JSON.stringify(messages));
}, [messages]);
```

#### API Key Management
**Options**:

1. **Environment Variable** (Recommended for demo):
   - Store in Vercel environment variable
   - Access via `/api/chat` route (server-side)
   - Never expose to client

2. **User Provides Key** (Secure but friction):
   - Settings dialog to enter API key
   - Store in localStorage
   - User responsible for usage

3. **Hybrid**:
   - Demo mode with your key (rate limited)
   - Option for users to enter their own key

#### Server Route (Recommended)
```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

---

### 🎨 Additional Polish

#### Personal Message / Status
```
┌─────────────────────────────────────┐
│ Claude Bot                          │
│ 🟢 Online                           │
│ "Ask me about this portfolio! 💻"  │ ← Personal message
└─────────────────────────────────────┘
```

#### Contact List (Future)
- Could add multiple bot "personalities"
- "Portfolio Bot" - talks about projects
- "Fun Bot" - tells jokes, plays games
- Switch between them like MSN contacts

#### Conversation Starters
Show suggested prompts when chat is empty:
- "Tell me about the projects"
- "What technologies were used?"
- "Show me the best work"
- "Who made this site?"

---

### 🤔 Questions for You

1. **API Key**: How should we handle Groq API key?
   - Environment variable (I'll show you how to add to Vercel)
   - User enters their own key
   - Free tier rate limiting concerns?

2. **Personality**: Should the bot:
   - Strictly answer portfolio questions
   - Be more conversational/fun (jokes, random chat)
   - Have a specific character (like Clippy but cooler)

3. **Privacy**: Should chat history:
   - Persist across sessions (localStorage)
   - Reset when window closes
   - Give user option to "Clear History"

4. **Scope**: Just MSN style, or could we also add:
   - IRC/AIM aesthetic option
   - Multiple bot personalities
   - Voice messages (text-to-speech, just for fun)

5. **Integration**: Should chatbot:
   - Know about files in My Documents (access file system)
   - Be able to open apps ("Open Paint for me")
   - Just chat, no integration

---

## 🚀 Development Priority

### Suggested Order:
1. **✅ Snake Game** (Codex - IN PROGRESS)
2. **✅ Desktop Features** (Steve - IN PROGRESS)
3. **Terminal App** (Next - High fun factor, good portfolio piece)
4. **Chatbot App** (After Terminal - Requires API setup)

### Or Alternative:
1. Snake + Desktop (current)
2. Chatbot first (impressive, interactive)
3. Terminal second (more complex, better with more time)

**Your call!** Which order sounds better?

---

## 💭 My Thoughts

### Why These Apps Rock:

**Terminal**:
- Shows command-line skills
- Easter eggs = personality
- File system integration = technical depth
- Text adventure = creative storytelling
- Appeals to developer audience

**Chatbot**:
- AI integration = cutting edge
- MSN nostalgia = instant connection (millennials/Gen Z)
- Interactive portfolio Q&A = user engagement
- Groq API = fast, cheap, impressive
- Can actually help users learn about your work

### Technical Challenges:

**Terminal**:
- Command parser (moderate complexity)
- Game state management (if including adventure)
- ASCII art rendering
- Keyboard event handling

**Chatbot**:
- API rate limiting (need strategy)
- Streaming responses (for better UX)
- Error handling (API down, etc.)
- Sound effects integration
- Message persistence

### Estimated Complexity:

**Terminal**: 🔧🔧🔧 (Medium-High)
- Core terminal: Easy
- Commands: Medium
- Hidden game: Varies (Snake=Easy, Adventure=Hard)

**Chatbot**: 🔧🔧 (Medium)
- UI: Easy (we have UI patterns down)
- API integration: Medium
- Polish (nudge, sounds): Easy but time-consuming

---

## ❓ Questions for You

Let me know your thoughts on:

### Terminal App:
1. Which hidden game(s) should we include?
2. Should commands actually modify files or just read?
3. Preferred default color (green/amber/white)?
4. Any specific easter eggs you want?

### Chatbot App:
5. Do you have a Groq API key? (I can guide you to get one)
6. What bot personality fits your portfolio vibe?
7. Should it persist chat history?
8. Just portfolio Q&A or more open-ended conversation?

### General:
9. Which app should we build first? (Terminal or Chatbot)
10. Any other features/ideas for either app?
11. Should these integrate with existing apps? (e.g., chatbot can open Paint)

---

**Status**: Awaiting your input to refine the plan! 🎯

Once you answer, I'll create detailed mission files like we did for Snake and Desktop features.
