# Bugs & Enhancements Tracker

## 🚧 IN PROGRESS (develop branch)

### 🐍 Snake Game App - Codex
**Status**: Building classic Snake with retro Nokia/MS-DOS aesthetic
**Folder**: `app/components/Apps/Snake/`
**Mission**: `.missions/MISSION-CODEX-SNAKE-GAME.md`

### 🖱️ Context Menu + File Dragging - Steve
**Status**: Fixing "New" submenu + drag files to Desktop
**Folder**: `app/components/Desktop/`
**Mission**: `.missions/MISSION-STEVE-CONTEXT-MENU-DRAG.md`

### 📝 Real Portfolio Content - Claude (NEXT)
**Status**: Pending (after Steve/Codex merge)
**Tasks**: Add real CV, projects, SEO metadata, OG tags
**Mission**: `.missions/MISSION-CLAUDE-REAL-CONTENT.md`

---

## 🐛 Known Bugs

### 1. Desktop Right-Click "New" Submenu Not Showing
**Status**: 🚧 IN PROGRESS (Steve on develop)
**Issue**: Right-click desktop → "New" option exists but submenu doesn't appear
**Expected**: Should show submenu with "Text Document", "Folder", maybe "Image"
**Current State**: Folder/File CRUD functions exist, just UI not wired
**Fix**: Wire up context menu to show submenu options

---

## 🚀 Enhancements Needed

### 1. Drag Files from FileExplorer to Desktop
**Status**: 🚧 IN PROGRESS (Steve on develop)
**Feature**: Drag .txt files from My Documents to Desktop (like real Windows)
**Current**: Files only exist in FileExplorer, can't drag to desktop
**Requirements**:
- Drag file item from FileExplorer window
- Drop on Desktop creates desktop icon for that file
- Double-click desktop icon opens file in Notepad
- Should work with any file type

**Technical Notes**:
- FileExplorer items need drag handlers
- Desktop needs drop zone
- Create desktop icon on drop
- Link icon to file path in FileSystemContext

**Priority**: High (feels very authentic Windows)

---

### 2. Start Menu Enhancements
**Feature Ideas**:
- Run... dialog (just for fun)
- Recent documents list
- Keyboard navigation (arrow keys)
- Submenu hover delay (feels more authentic)

**Priority**: Low (Start Menu already functional)

---

### 3. Mobile Support
**Feature**: Graceful degradation or warning for mobile users
**Current**: Probably broken on mobile/touch devices
**Options**:
- Show warning dialog: "This experience requires desktop browser"
- Simplified mobile view (just show CV content)
- Touch-friendly adaptations (bigger tap targets, no drag)

**Priority**: Medium (depends on target audience)

---

### 4. App Enhancements

#### Paint Improvements
- Shape tools (rectangle, circle, line)
- Fill bucket tool
- Undo/Redo
- Clear canvas button
- Load image from file

#### Minesweeper
- Difficulty levels (Beginner, Intermediate, Expert)
- Timer
- Flag counter
- High scores (localStorage)

#### Notepad
- Find/Replace functionality
- Print preview (just for show)
- Font size options

**Priority**: Low (apps already functional)

---

## 📋 New Apps to Build

### 🐍 Snake Game (Codex - IN PROGRESS)
**Description**: Classic Snake with retro aesthetic
**Features**: Arrow key controls, score tracking, high scores (localStorage)
**Visual**: Nokia green or MS-DOS colors, grid layout
**Priority**: HIGH - Codex currently building
**Status**: 🚧 Active mission on develop branch

---

### 🖥️ Terminal App (PLANNED - Ultra Deep Think)
**Description**: MS-DOS Command Prompt with functional commands + hidden games
**Features**:
- Virtual file system commands (cd, dir, type, mkdir, etc.)
- Hidden easter eggs and games (text adventure? ASCII Snake? hack simulator?)
- Classic terminal aesthetic (green/amber/white phosphor text)
- Command history (up/down arrows)
- Integration with existing file system

**Technical Challenges**:
- Command parser and interpreter
- Game state management (if text adventure)
- Keyboard event handling
- ASCII art rendering

**Easter Egg Ideas**:
- Text adventure game (portfolio-themed Zork)
- `hack` - fake hacking simulator
- `cowsay`, `fortune`, `matrix` - classic Unix fun
- `sudo rm -rf /` - funny error message

**Questions to Answer** (see `.missions/FUTURE-APPS-PLANNING.md`):
- Which hidden game(s)?
- Commands functional or cosmetic?
- Default terminal color?
- Easter egg density?

**Priority**: HIGH - Next after Snake/Desktop features
**Status**: 📋 Planning phase - needs user input

---

### 💬 Chatbot App (PLANNED - Ultra Deep Think)
**Description**: MSN Messenger clone with AI chatbot (Groq API)
**Features**:
- Classic MSN Messenger UI (circa 2003-2005)
- Real-time AI chat via Groq API
- MSN features: Nudge (shake window!), emoticons, typing indicator
- Chat history persistence
- Sound effects (message ding, nudge buzz)
- Personal message/status

**Technical Challenges**:
- Groq API integration (streaming responses)
- Server-side API route (hide API key)
- Rate limiting strategy
- MSN-accurate UI/UX
- Sound effect integration

**Bot Personality Options**:
- Portfolio Q&A assistant
- Conversational friend (early 2000s vibe)
- Multiple bot "contacts" with different personalities

**Questions to Answer** (see `.missions/FUTURE-APPS-PLANNING.md`):
- API key handling (env var vs user-provided)?
- Bot personality/scope?
- Chat history persistence?
- Integration with file system/apps?

**Priority**: HIGH - After Terminal (or flip order?)
**Status**: 📋 Planning phase - needs user input

---

### Sound System
**Feature**: Windows error beep, startup sound
**Tech**: Web Audio API or embedded audio files
**Priority**: Low (polish)

---

## 🔧 Technical Debt

### Code Quality
- [ ] Add PropTypes or better TypeScript validation
- [ ] Extract common button styles to shared components
- [ ] Centralize z-index values (currently scattered)
- [ ] Add error boundaries for app components

### Performance
- [ ] Lazy load app components (don't render until window opens)
- [ ] Optimize canvas re-renders in Paint
- [ ] Debounce drag operations if laggy
- [ ] Virtual scrolling for large file lists

### Testing
- [ ] Unit tests for hooks (useWindowManager, useFileSystem)
- [ ] Integration tests for file operations
- [ ] E2E tests for critical flows (boot → open app → save file)

**Priority**: Post-launch

---

## ✅ Completed Enhancements

- ✅ Boot sequence with skip functionality
- ✅ Easter eggs (BSOD, error dialogs)
- ✅ Start Menu with Restart/Shut Down
- ✅ Context menu on desktop
- ✅ Protected file system
- ✅ Taskbar with live window buttons
- ✅ Full window management (drag, minimize, maximize, focus)
- ✅ Notepad CRUD editor (create, edit, save files)
- ✅ Mobile warning dialog
- ✅ Notepad desktop icon
- ✅ Window resizing (drag corners to resize)
- ✅ Paint UI redesign (larger canvas, sidebar, zoom controls)
- ✅ Camera app with webcam and screenshot capture
- ✅ Retro TV app with YouTube player
- ✅ Production deployment to Vercel

---

*Last Updated: Post-deployment - Snake + Context Menu/Drag in progress on develop*
