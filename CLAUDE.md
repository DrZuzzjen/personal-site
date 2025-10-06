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

1. **Window Manager**: Complex state management for multiple overlapping windows
2. **Canvas Rendering**: Real-time Paint.exe with tool palette
3. **File System Simulation**: Hierarchical structure with CRUD operations
4. **State Persistence**: localStorage for user-created content
5. **Drag/Drop System**: Smooth outline dragging with proper z-index handling
6. **Boot Animation**: Authentic sequence with timing and transitions

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
- ✅ All phases complete - DEPLOYED TO PRODUCTION
- ✅ **MSN Messenger Chatbot Enhanced** (Oct 2025)
  - Personalized LLM-powered welcome messages
  - Jean Francois personality integration
  - Browser context detection (language, timezone, time of day)
  - Typing sound effects (type.mp3)
  - Context-aware AI responses with CV knowledge

## MSN Messenger Chatbot - Technical Details

### Personality System (`app/lib/personality.ts`)
- **Jean Francois persona** derived from CV (DevRel at Kluster.ai)
- Voice characteristics: "Direct and practical - no corporate buzzwords"
- Technical expertise: Gen AI, RAG, Agents, Full-stack (Next.js, Python, TypeScript)
- Achievements: 20M+ AI automation savings, 1 patent, hackathon organizer
- Writing style: "Short sentences. Punchy. Gets to the point."
- Signature phrases: "I'm your guy", "Let's shake things up", "Tailor-made solutions"

### LLM Integration
- **System Prompt**: `getPersonalityContext()` - comprehensive personality config
- **Welcome API** (`app/api/chat/welcome/route.ts`): Generates personalized greetings
- **Browser Context Detection**: Language, timezone, time of day, returning visitor status
- **Model**: Groq API with Llama-4-Maverick-17b-128e-instruct
- **Temperature**: 0.9 for welcome (creative), 0.8 for chat (balanced)

### Audio Features
- **Typing Sound**: `/sounds/type.mp3` plays on AI message received
- **MSN Sounds**: Nudge, send, receive (authentic MSN Messenger experience)

### Smart Welcome Messages
Examples based on context:
- Morning visitor in Spanish: Greets "¡Buenos días!" then switches to English
- Late night returning visitor: "Back for more! What should we explore tonight?"
- First-time visitor: Full portfolio introduction with app suggestions

### Context Awareness
Chatbot knows:
- Jean Francois's full professional background (from CV)
- Portfolio technical stack (Next.js 15, TypeScript, Tailwind)
- All available apps (Paint, Minesweeper, Camera, TV, etc.)
- Project structure and features
- README content and achievements

## Working Directory
`/Users/franzuzz/Documents/GitHub/personal-site`
