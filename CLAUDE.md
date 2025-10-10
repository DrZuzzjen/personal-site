# Project Memory - Windows 3.1 Portfolio/CV

## Project Overview
**A fully functional Windows 3.1 OS simulation** serving as a portfolio/CV website. This is a technical flex showcasing advanced frontend capabilities: real-time canvas manipulation, complex state management, window system simulation, and retro UI/UX.

**Core Concept**: Full desktop OS simulation where ALL content is accessed through windows, icons, and a simulated file system - not just themed chrome on top of a modern portfolio.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Package Manager**: npm

## Project Structure
- App Router (no src directory)
- Import alias: `@/*`
- Turbopack enabled
- ESLint configured

---

## Core Features & Technical Decisions

### Desktop Environment
**Desktop Icons:**
- 🖥️ **My Computer** - Opens window with CV card + file system
- 🎨 **Paint.exe** - Functional MS Paint clone (basic tools)
- 💣 **Minesweeper.exe** - Classic game implementation
- 🗑️ **Recycle Bin** - Protected with easter eggs

### File System Structure
```
Desktop/
├── My Computer/
│   ├── About.txt (CV card: name, title, LinkedIn, X, GitHub)
│   ├── My Documents/
│   │   ├── Project_1.txt
│   │   ├── Project_2.txt
│   │   ├── Project_3.txt
│   │   ├── Project_4.txt
│   │   └── Project_5.txt (GitHub repos, not runnable demos)
│   └── A:\ Floppy/
│       └── Resume.pdf (downloadable)
├── Paint.exe
├── Minesweeper.exe
└── Recycle Bin/
```

### Window Manager Specifications
**Rendering Strategy**: Hybrid approach
- HTML/React components for text content and UI
- Canvas for Paint.exe and pixel-perfect retro elements
- Each window = React component with absolute positioning

**Drag Behavior**: Outline dragging (authentic Win3.1)
- Drag shows window outline/frame only
- Content renders when drop completes
- More performant and period-accurate

**Window Features**:
- Full drag/drop with outline
- Minimize/maximize/close buttons
- Z-index stacking (click to bring to front)
- Resizable (if time permits)
- Title bars with authentic styling

### Boot Sequence
**YES - Full immersive boot:**
1. POST screen (Power-On Self-Test)
2. Memory check with real/funny messages
3. "Loading Windows..." with progress
4. Desktop fade-in

**Easter Egg Messages During Boot:**
- "Detecting creativity... FOUND"
- "Loading personality drivers... OK"
- "Initializing humor.dll... SUCCESS"
- etc.

### Visual Design
**Color Palette**: 32-bit color depth (not limited to 16 colors)
- Classic Windows gray (#C0C0C0) for window chrome
- Retro CRT aesthetic but with modern clarity
- Pixel-perfect fonts and icons

**Style Notes**:
- Authentic window borders and shadows
- Classic button states (pressed/unpressed)
- Menu bars with proper hover states
- System font (Chicago/MS Sans Serif style)

### User Interactions & Easter Eggs

**Protected Actions (with funny responses):**
- Try to delete My Documents → "Error: Cannot delete critical system folder. Nice try! 😏"
- Try to delete About.txt → Fake BSOD easter egg screen
- Drag protected desktop icons → Snap back with "Access Denied"

**User Freedom:**
- CAN create new folders/files on desktop
- CAN drag user-created items freely
- Right-click context menus (New Folder, New Text Document)
- Changes persist via localStorage

### Projects Display
- 5 projects total
- Each project = .txt file in My Documents
- Opens in Notepad-style window
- Contains: description, tech stack, GitHub link
- NOT runnable - links to external repos

---

## Technical Challenges (The Flex)

1. **Multi-Agent AI System**: 3-agent orchestration (Router, FieldExtractor, Sales/Casual agents) with tool calling, email automation, and desktop control
2. **Window Manager**: Complex state management for multiple overlapping windows with z-index, minimize/maximize, and drag/drop
3. **Canvas Rendering**: Real-time Paint.exe with tool palette and pixel manipulation
4. **File System Simulation**: Hierarchical structure with CRUD operations, symlinks, and Windows-style paths
5. **State Persistence**: localStorage with versioning, migration, and desktop icon management
6. **Drag/Drop System**: Authentic Win3.1 outline dragging with proper z-index handling
7. **Boot Animation**: Authentic POST → Memory check → Windows loading sequence
8. **Type Safety**: Centralized registries (app-configs, SDK types) eliminating "any" usage
9. **Agentic Workflows**: Sales funnel automation with email validation and multi-step conversations
10. **Desktop Integration**: AI-controlled window management (open/close apps via chat)

---

## MCP Configuration - CRITICAL INFO

### For Claude Code VS Code Extension on Windows:
**MCP servers MUST be configured in:**
`C:\Users\gutij\AppData\Roaming\Claude\claude_desktop_config.json`

This is the SAME file used by Claude Desktop app. The VS Code extension reads from here.

### Working MCP Server Configurations:

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["E:\\code\\AI\\MCP_Playground\\quickstart-resources\\weather-server-typescript\\build\\index.js"]
    },
    "kluster-verify": {
      "command": "kluster-verify-code-mcp",
      "args": [],
      "env": {
        "KLUSTER_API_KEY": "eb9b3c76-9c35-48a6-b34b-f24c476ce12e"
      }
    },
    "vercel": {
      "command": "mcp-remote",
      "args": ["https://mcp.vercel.com"]
    }
  }
}
```

### Key Lessons Learned:
1. **Global installation required**: MCP packages must be installed globally (`npm install -g`)
   - Installed: `@klusterai/kluster-verify-code-mcp`
   - Installed: `mcp-remote`

2. **Use direct binary commands**, not `npx` (npx fails when spawned by VS Code extension)

3. **Wrong config locations tried**:
   - ❌ `C:\Users\gutij\.claude.json` (user config, not used by VS Code extension)
   - ❌ `C:\ProgramData\ClaudeCode\managed-mcp.json` (doesn't exist for VS Code extension)
   - ❌ `E:\code\web\.claude\settings.local.json` (doesn't support mcpServers)
   - ❌ `E:\code\web\.mcp.json` (project scope, not read by extension)
   - ✅ `C:\Users\gutij\AppData\Roaming\Claude\claude_desktop_config.json` (CORRECT!)

4. **Window reload required**: After config changes, must reload VS Code window (Ctrl+Shift+P → "Developer: Reload Window")

## MCP Servers Status
- ✅ **Weather** - Connected (local Node.js server)
- ✅ **Kluster Verify** - Connected (code review and verification)
- ⏳ **Vercel** - Pending authentication via `/mcp`

## Development Status
- ✅ Git repository initialized
- ✅ Next.js project created
- ✅ Dependencies installed
- ✅ MCP servers configured and working
- ✅ **ALL PHASES COMPLETE - PRODUCTION READY** ✨
- ✅ **Deployed to**: https://fran-ai.dev
- ✅ **MSN Messenger Chatbot Enhanced** (Oct 2025)
  - Personalized LLM-powered welcome messages
  - Jean Francois personality integration
  - Browser context detection (language, timezone, time of day)
  - Typing sound effects (type.mp3)
  - Context-aware AI responses with CV knowledge

## Recent Updates (Oct 10, 2025)

### 🤖 AI Agentic System - **MAJOR ARCHITECTURE CHANGE**

Complete rewrite from single LLM to **multi-agent orchestration** using Vercel AI SDK.

#### Router Agent (`app/api/chat-v2/route.ts`)
- **Intent Detection**: Classifies messages as `sales` or `casual`
- Uses conversation history (last 4 messages) for context
- Model: Llama-3.3-70b-versatile (temp: 0.1)
- Fallback: `casual` on errors

#### Field Extractor Agent (`app/lib/ai/agents/field-extractor-agent.ts`)
- **Pure extraction**: NO validation, NO emails, NO conversation
- Extracts: name, email, company, role, budget, needs, urgency
- Trimmed history: 12 messages max (performance)
- Returns: confidence scores + fields
- **Security**: Removed PII cache (GDPR/CCPA fix)

#### Sales Agent (`app/lib/ai/agents/sales-agent.ts`)
- **Multi-step workflow**: Ask → Validate → Send email
- Tool: `validateAndSendEmail` (7 required fields)
- StopWhen: Immediately stops if email sent
- Conversational: Follow-ups, objection handling
- Multilingual: EN/ES/FR/DE post-sales messages

#### Casual Agent (`app/lib/ai/agents/casual-agent.ts`)
- **Desktop control**: Opens/closes apps, restarts
- Tools: `openApp`, `closeApp`, `restart`
- 12 apps: paint, minesweeper, snake, notepad, camera, tv, browser, chatbot, portfolio, terminal, mycomputer, explorer
- Post-sales mode: Auto-switches after email sent
- MSN Messenger personality (friendly, emoji-heavy)

#### Email Tool (`app/lib/ai/agents/tools/email-tool.ts`)
- Validates 7 fields before sending
- Rejects: "null", "unknown", "not collected", "n/a"
- Budget parsing: Handles ranges ("5000-10000" → 10000)
- Sends to: jeanfrancoisgutierrez@gmail.com
- API: Resend

#### Agent Flow Example
```
User: "I need an AI consultant"
  ↓ Router → 'sales'
  ↓ FieldExtractor → { name: null, email: null, ... }
  ↓ SalesAgent → "Great! What's your name?"
  ↓ User → "John from Acme Corp"
  ↓ SalesAgent → "And your email?"
  ↓ User → "john@acme.com"
  ↓ SalesAgent → validateAndSendEmail({ name: "John", email: "john@acme.com", ... })
  ↓ Result → { sent: true }
  ↓ Response → "Thanks! Check your inbox within 24h."
```

#### Security Fixes (CodeRabbit - Oct 9)
- ✅ PII cache removed (no user data persistence)
- ✅ ReDoS vulnerability fixed (prompts.ts regex)
- ✅ Email validation (rejects placeholders + requires @)
- ✅ Budget parsing (handles ranges correctly)
- ✅ Multilingual detection (4 languages)
- ✅ Undefined guards (`result.steps ?? []`)

---

### 🎨 Centralized App Configurations

#### Problem: Paint Window Size Bug
Paint opened at **wrong size** from Terminal/MSN (520×420) vs Desktop (800×600).

#### Solution: `app/lib/app-configs.ts` Registry
Single source of truth for ALL 12 apps:
```typescript
export const APP_CONFIGS: Record<AppName, AppConfig> = {
  paint: {
    title: 'Paint',
    defaultSize: { width: 800, height: 600 }, // ✅ Canonical
    defaultPosition: { x: 340, y: 140 },
    icon: 'PT',
    defaultContent: { ... },
    aliases: ['paint.exe', 'paint'],
  },
  // ... 11 more
};
```

**Helpers:** `getAppConfigByName()`, `getAllAppNames()`

**Refactored:**
- `DesktopIcon.tsx` - Generic `createAppLaunch()`
- `Terminal/apps.ts` - Registry lookup
- `Chatbot.tsx` - `getAppConfigByName()`

**Impact:** -34 net lines (removed duplication)

---

### 🔒 TypeScript Type Safety Improvements
- ✅ **SDK Types Registry** - Created `app/lib/ai/agents/sdk-types.ts`
- ✅ **Window Content Types** - Fixed 5 files to use `WindowContent` vs `any`
- ✅ **Agent Response Types** - All agents use proper SDK types
- ✅ **-65% "any" usage** - 23 → 8 instances (all acceptable)
- ✅ **Inspired by app-configs.ts** - Centralized registry pattern

**SDK Types:** `AgentStep`, `AgentResult`, `ToolCall`, `ToolResult`, `StepContent`

**Remaining acceptable "any":**
- Test mocks (6) - Standard practice
- JSON parsing (2) - Runtime validation needed
- SDK agent instance (1) - Documented limitation

---

## Recent Updates (Oct 6, 2025)

### File System & Navigation Fixes
- ✅ **Symlink Resolution System** - My Computer → C: drive navigation works perfectly
- ✅ **Windows-Style Paths** - All paths display as `C:\Users\Guest` (not `/C:/Users/Guest`)
- ✅ **Terminal Path Formatting** - Prompt shows authentic `C:\Users\Guest>` format
- ✅ **UP Navigation Fixed** - Can navigate from drives back to My Computer
- ✅ **localStorage Version Migration** - Auto-fixes desktop icon corruption (v1.1)
- ✅ **Duplicate Executables Fixed** - Each .exe appears only once in Program Files

### Desktop & UI Improvements
- ✅ **Widescreen Icon Layout** - Icons spread across 6 columns for better space usage
- ✅ **Documents Desktop Icon** - Now correctly opens `/C:/Users/Guest/Documents`
- ✅ **Real CV Download** - Resume.pdf downloads actual CV (`/jean_francois_cv.pdf`)

### SEO & Metadata (Production Ready)
- ✅ **Meta Description**: "AI Engineer & DevRel - AI Consultancy, Workshops, Talks. Gen AI expert (AI, Agents, LLMs). Explore my interactive Retro-Windows portfolio."
- ✅ **Comprehensive Keywords**: Azure, AWS, OpenAI, Anthropic, Langchain, LlamaIndex, RAG, AI Agents, Gen AI, etc.
- ✅ **Open Graph & Twitter Cards** - Optimized for social media sharing
- ✅ **Favicon** - All sizes configured (16x16, 32x32, Apple Touch, Android Chrome)
- ✅ **Sitemap & robots.txt** - Search engine ready
- ✅ **Structured Data (JSON-LD)** - Person, WebSite, CreativeWork schemas

## MSN Messenger Chatbot - Technical Details

### Architecture Overview
**Multi-Agent System** (see "AI Agentic System" section above for full details)
- **Primary:** `/api/chat-v2` - Agentic routing (sales/casual workflows)
- **Fallback:** `/api/chat` - Simple LLM (welcome, nudge, proactive messages)

### Personality System (`app/lib/personality.ts`)
- **Jean Francois persona** derived from CV (DevRel at Kluster.ai)
- Voice characteristics: "Direct and practical - no corporate buzzwords"
- Technical expertise: Gen AI, RAG, Agents, Full-stack (Next.js, Python, TypeScript)
- Achievements: 20M+ AI automation savings, 1 patent, hackathon organizer
- Writing style: "Short sentences. Punchy. Gets to the point."
- Signature phrases: "I'm your guy", "Let's shake things up", "Tailor-made solutions"

### Conversation Modes

**1. Sales Mode** (Auto-detected by Router Agent)
- Triggers on: "need consultant", "hire", "project", "budget", etc.
- Agent: SalesAgent with email tool
- Flow: Extract info → Ask questions → Validate → Send email
- Email to: jeanfrancoisgutierrez@gmail.com
- Success: "✅ Email sent! Check inbox within 24h."

**2. Casual Mode** (Default)
- Triggers on: Everything else
- Agent: CasualAgent with desktop tools
- Capabilities:
  - Open apps: "open paint", "launch minesweeper"
  - Close apps: "close paint"
  - Restart system: "restart computer"
- Personality: MSN Messenger style (friendly, emoji-heavy)

**3. Post-Sales Mode** (Auto-switches after email sent)
- CasualAgent takes over after successful email
- Detects: "Email sent successfully" in 4 languages (EN/ES/FR/DE)
- User can continue chatting casually after sales workflow

### LLM Integration
- **Models**: Groq API
  - Router: Llama-3.3-70b-versatile (temp 0.1)
  - Agents: Llama-3.3-70b-versatile (temp 0.8)
  - Welcome: Llama-4-Maverick-17b-128e-instruct (temp 0.9)
- **System Prompt**: `getPersonalityContext()` - comprehensive config
- **Welcome API** (`app/api/chat/welcome/route.ts`): Personalized greetings
- **Browser Context**: Language, timezone, time of day, returning visitor

### Audio Features
- **Typing Sound**: `/sounds/type.mp3` on AI message
- **MSN Sounds**: Nudge, send, receive (authentic experience)

### Smart Welcome Messages
Examples based on browser context:
- Morning in Spanish: "¡Buenos días!" → English
- Late night: "Back for more! What should we explore?"
- First-time: Portfolio intro + app suggestions

### Desktop Control (Casual Agent)
**Available Actions:**
```typescript
interface Action {
  type: 'openApp' | 'closeApp' | 'restart';
  appName?: string; // 12 apps available
}
```

**Example Interactions:**
- User: "open paint" → Opens Paint.exe
- User: "close minesweeper" → Closes game
- User: "restart" → Closes all windows

### Context Awareness
Chatbot knows:
- Jean Francois's CV (About.txt content)
- 6 portfolio projects (My Documents/*.txt)
- All 12 available apps
- Portfolio tech stack (Next.js 15, TypeScript, Tailwind)
- File system structure
- Recent conversation history (last 4 messages for routing)

## Working Directory
`/Users/franzuzz/Documents/GitHub/personal-site`

---

## 🚀 DEPLOYMENT CHECKLIST - PRODUCTION READY

### ✅ Core Features Complete
- [x] Full Windows 3.1 OS simulation
- [x] Working file system with navigation
- [x] Desktop icon management with drag & drop
- [x] File Explorer with Windows-style paths
- [x] Terminal with MS-DOS commands
- [x] MSN Messenger AI chatbot
- [x] Paint.exe, Minesweeper, Snake, Camera, TV apps
- [x] Portfolio Media Center with project demos
- [x] Boot sequence animation

### ✅ Technical Implementation
- [x] Next.js 15 App Router
- [x] TypeScript with strict typing (-65% "any" usage)
- [x] Tailwind CSS styling
- [x] localStorage persistence with versioning
- [x] Symlink resolution system
- [x] Context API state management
- [x] Window manager with z-index stacking
- [x] **Multi-Agent AI System** (Router, FieldExtractor, Sales, Casual)
- [x] **Agent Tools** (email automation, desktop control)
- [x] **Centralized Registries** (app-configs, SDK types)

### ✅ SEO & Metadata
- [x] Comprehensive meta tags
- [x] Open Graph & Twitter Cards
- [x] Structured Data (JSON-LD)
- [x] Sitemap.xml
- [x] robots.txt
- [x] All favicon sizes

### ✅ Content & Assets
- [x] 6 real portfolio projects in Documents folder
- [x] Downloadable CV (jean_francois_cv.pdf)
- [x] All app icons configured
- [x] Background image (fran_background.png)
- [x] Sound effects (MSN sounds, typing)

### ✅ Bug Fixes & Polish
- [x] No duplicate executables
- [x] UP navigation works correctly
- [x] Documents icon opens correct folder
- [x] Widescreen icon layout optimized
- [x] localStorage version migration
- [x] Windows-style path formatting

### 🎯 Post-Deployment Tasks
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Create OG image (1200x630px) → `/public/og-image.png`
- [ ] Update Google verification code in layout.tsx
- [ ] Test on mobile devices
- [ ] Share on LinkedIn/Twitter with OG preview

### 📊 Performance & Analytics (Optional)
- [ ] Add Google Analytics
- [ ] Add Vercel Analytics
- [ ] Monitor Core Web Vitals
- [ ] Set up error tracking (Sentry)

---

## 🎨 Design Philosophy

**Authenticity First**: Every detail matches Windows 3.1 aesthetics - from window chrome to button states, from boot sequence to system fonts. This isn't just a theme, it's a faithful recreation.

**Frontend Mastery**: No backend needed. Everything (file system, state, persistence) runs client-side. This showcases advanced React patterns, context management, and localStorage architecture.

**Portfolio as Experience**: Instead of a boring list of projects, visitors *explore* your work by navigating a simulated OS. Each app, each folder, each interaction tells your story.

**Technical Flex**: Building a full OS simulation in the browser demonstrates:
- **Multi-Agent AI Orchestration**: Router, FieldExtractor, Sales/Casual agents with tool calling
- **Complex State Management**: Windows, file system, localStorage versioning
- **Canvas Rendering**: Real-time Paint.exe with pixel manipulation
- **Game Logic**: Minesweeper (mine detection), Snake (collision detection)
- **File System Architecture**: Hierarchical structure with symlinks and Windows paths
- **Window Management**: Z-index stacking, drag/drop, minimize/maximize
- **Agentic Workflows**: Sales automation with email validation and multi-step conversations
- **Desktop AI Control**: Chat-driven window management (open/close apps)
- **Type Safety Architecture**: Centralized registries eliminating unsafe types

This is the portfolio that makes recruiters go "Wait, WHAT?! Did you just automate your sales funnel with AI agents... IN A WINDOWS 3.1 SIMULATION?!" 🤯
