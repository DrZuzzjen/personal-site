# Mission Briefing - Codex (Applications Team)

**Your Role**: Applications Developer - Phase 5
**Working**: Solo OR Parallel with Steve (Phase 4)
**Branch**: `feature/phase5-applications`
**Priority**: 🔴 HIGH - Core portfolio apps
**Estimated Time**: 5-6 hours autonomous execution

---

## 🤝 Team Context

**You (Codex)**: Applications Developer
- You built Phase 2 Window System (draggable windows)
- You built Phase 3 Taskbar components
- You're building: Notepad, Minesweeper, and Paint apps

**Steve**: Might be working on Phase 4 (Boot Sequence) simultaneously
- Different branch, different components
- No conflicts expected

**Claude**: Orchestrator (coordinating, reviewing)

---

## 📋 Improved Communication Protocol

### ✅ Lessons from Phase 3:

**What we learned:**
- ✅ Frequent commits prevent merge hell
- ✅ Detailed commit messages help everyone
- ✅ Prefixing with name identifies who did what

### Communication Rules for Phase 5:

### 1. **Commit Message Format**

**ALL commits MUST start with `[CODEX]`:**

```bash
git commit -m "[CODEX] feat(notepad): add Notepad component"
git commit -m "[CODEX] feat(minesweeper): add game logic"
git commit -m "[CODEX] fix(paint): resolve brush stroke lag"
```

---

### 2. **Progress Reports in Commits**

**After completing each major app, write detailed commit:**

```bash
git commit -m "[CODEX] feat(notepad): complete Notepad application

Built:
- Notepad.tsx with text display
- Menu bar (File, Edit - non-functional)
- Integration with file system for content loading
- Read-only mode for portfolio text files

Features:
- Opens .txt files from FileExplorer
- Displays content in monospace font
- Windows 3.1 authentic styling
- Scrollable text area

Technical:
- Uses Window component from Phase 2
- Reads FileSystemItem content
- Clean props interface

Next: Starting Minesweeper game logic

- Codex (Apps Team)"
```

---

### 3. **Questions & Notes**

**Use commit messages to ask questions:**

```bash
git commit -m "[CODEX] feat(paint): add basic canvas

NOTE: Using HTML canvas for drawing
QUESTION @claude: Should paint save to localStorage or just session?
TODO: Add color picker in next commit"
```

I'll respond via:
- Code review comments
- Creating `RESPONSE-CODEX.md` file
- Updating documentation

---

## 🎯 Your Mission: Build 3 Applications

You're building the **core apps** that make this portfolio interactive:

1. **Notepad** - Simple text viewer (Easy, start here)
2. **Minesweeper** - Classic game (Medium difficulty)
3. **Paint** - Drawing app (Most complex)

**Build them in this order!** Each one builds on lessons from the previous.

---

## 📦 Application 1: Notepad (START HERE)

### Component: Notepad

**File**: `app/components/Apps/Notepad/Notepad.tsx`

**What it should do:**
- Display text content from files
- Simple text viewer (read-only for now)
- Menu bar at top (File, Edit - visual only, non-functional)
- Scrollable text area
- Monospace font for authentic feel

**Visual Layout:**
```
┌──────────────────────────────┐
│ File  Edit  Search  Help     │ ← Menu bar
├──────────────────────────────┤
│                              │
│ Text content displays here   │
│ in monospace font            │ ← Text area
│ with scrolling               │
│                              │
└──────────────────────────────┘
```

**Props:**
```typescript
interface NotepadProps {
  fileId?: string;          // Which file to open
  initialContent?: string;  // Or provide content directly
  fileName?: string;        // Display in window title
}
```

**Key Features:**
- White background (#FFFFFF)
- Black text, monospace font
- Scrollable if content is long
- Menu bar with classic styling
- Opens via Window component (you built this!)

**Integration:**
- When FileExplorer opens a .txt file → creates Notepad window
- When double-clicking About.txt on desktop → opens in Notepad
- Reads content from FileSystemContext

**Think about:**
- How to get file content from file system?
- Should it support editing or just viewing?
- How to handle very long files?
- Line numbers? Word wrap?

**Success when:**
- [ ] Can open .txt files from FileExplorer
- [ ] Displays file content correctly
- [ ] Scrollable for long content
- [ ] Menu bar looks authentic (even if non-functional)
- [ ] Monospace font
- [ ] Works in Window component

---

## 📦 Application 2: Minesweeper

### Components:

**Main file**: `app/components/Apps/Minesweeper/Minesweeper.tsx`
**Logic file**: `app/components/Apps/Minesweeper/gameLogic.ts`

**What it should do:**
- Classic Minesweeper game
- Grid of cells (8x8 or 10x10 for easy mode)
- Click to reveal cells
- Right-click to flag potential mines
- Win when all safe cells revealed
- Lose when clicking a mine

**Visual:**
```
┌────────────────────────┐
│ Game  Help             │ ← Menu
├────────────────────────┤
│  [😊]  000  ⏱ 00:00  │ ← Status bar
├────────────────────────┤
│ ┌─┬─┬─┬─┬─┬─┬─┬─┐    │
│ │ │ │1│ │ │ │ │ │    │
│ ├─┼─┼─┼─┼─┼─┼─┼─┤    │
│ │🚩│1│1│ │ │ │ │ │    │ ← Grid
│ ├─┼─┼─┼─┼─┼─┼─┼─┤    │
│ │ │ │ │2│1│ │ │ │    │
│ └─┴─┴─┴─┴─┴─┴─┴─┘    │
└────────────────────────┘
```

**Game Logic:**

**In `gameLogic.ts`, create:**

1. **`initializeGrid(rows, cols, mineCount)`**
   - Creates grid of cells
   - Randomly places mines
   - Calculates adjacent mine counts
   - Returns initial game state

2. **`revealCell(grid, row, col)`**
   - Reveals clicked cell
   - If empty (0 adjacent mines) → flood fill neighbors
   - If mine → game over
   - Returns updated grid

3. **`toggleFlag(grid, row, col)`**
   - Toggles flag on cell
   - Returns updated grid

4. **`checkWin(grid)`**
   - Checks if all non-mine cells revealed
   - Returns boolean

**Cell States:**
- Hidden (unrevealed)
- Revealed (showing number or empty)
- Flagged (marked as potential mine)
- Mine (💣)

**Think about:**
- Grid size: 8x8 with 10 mines? Or 10x10 with 15 mines?
- How to prevent mines on first click?
- Flood fill algorithm for revealing empty cells?
- Timer for competitive play?
- Smiley face button (resets game)?

**Success when:**
- [ ] Grid renders with cells
- [ ] Left-click reveals cells
- [ ] Right-click flags cells
- [ ] Numbers show adjacent mine count
- [ ] Empty cells auto-reveal neighbors (flood fill)
- [ ] Clicking mine ends game (shows all mines)
- [ ] Revealing all safe cells wins game
- [ ] Can reset/new game

---

## 📦 Application 3: Paint

### Component: Paint

**File**: `app/components/Apps/Paint/Paint.tsx`

**What it should do:**
- Basic drawing application
- Tool palette: Pencil, Eraser, Line, Rectangle, Circle, Fill
- Color picker (basic colors)
- Canvas for drawing
- Menu bar (File, Edit, View)

**Visual Layout:**
```
┌─────────────────────────────────┐
│ File  Edit  View  Help          │ ← Menu
├─────┬───────────────────────────┤
│ ✏️  │                           │
│ ⬜  │                           │
│ 🟥  │     Canvas                │
│ 🟦  │     (drawing area)        │ ← Tools + Canvas
│ 🟨  │                           │
│ 🟩  │                           │
└─────┴───────────────────────────┘
```

**Tools to implement:**

1. **Pencil** ✏️
   - Free-hand drawing
   - Tracks mouse movement
   - Draws line from previous point to current

2. **Eraser** ⬜
   - Same as pencil but draws white (or transparent)

3. **Fill** 🪣
   - Flood fill algorithm
   - Fill connected same-color area

4. **Line** ➖
   - Click start point, drag to end point
   - Draws straight line

5. **Rectangle** ▭
   - Click corner, drag to opposite corner
   - Draws rectangle outline (or filled)

6. **Circle** ⭕
   - Click center, drag to set radius
   - Draws circle outline (or filled)

**Canvas Implementation:**

Use HTML `<canvas>` element:

```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);

// Get 2D context
const ctx = canvasRef.current?.getContext('2d');

// Mouse event handlers
const handleMouseDown = (e) => {
  // Start drawing
};

const handleMouseMove = (e) => {
  // Continue drawing
};

const handleMouseUp = (e) => {
  // End drawing
};
```

**Color Picker:**
- Basic colors: Black, White, Red, Blue, Green, Yellow, Gray, etc.
- Grid of color swatches
- Click to select current color

**Think about:**
- Canvas size: 400x300? 600x400?
- How to handle different tools?
- Should drawings save? (localStorage? Download?)
- Undo/Redo functionality?
- Brush size selector?
- Keep it simple or add advanced features?

**Success when:**
- [ ] Canvas renders and accepts drawing
- [ ] Can select tools from palette
- [ ] Pencil draws smooth lines
- [ ] Eraser removes marks
- [ ] Line/Rectangle/Circle tools work
- [ ] Color picker changes brush color
- [ ] Fill tool works (flood fill)
- [ ] Drawing is smooth (no lag)
- [ ] Menu bar styled correctly

---

## 🎨 Design Guidelines

### Notepad:
- Background: White (#FFFFFF)
- Text: Black, monospace (Courier New or Consolas)
- Font size: 12-14px
- Padding: 8-12px
- Menu bar: Gray background, black text
- Scrollbar: System default or custom retro style

### Minesweeper:
- Cells: 20x30px each
- Hidden cell: Gray raised 3D button
- Revealed cell: Gray sunken/flat
- Numbers: Color-coded (1=blue, 2=green, 3=red, etc.)
- Flag: 🚩 emoji or custom icon
- Mine: 💣 emoji or custom icon
- Smiley: 😊 (normal), 😎 (win), 😵 (lose)

### Paint:
- Canvas: White background
- Tool palette: Gray sidebar, 40-50px wide
- Tool buttons: 30x30px with icons
- Color swatches: 20x20px
- Active tool: Highlighted/sunken button
- Menu bar: Standard gray

---

## 🔧 Integration Points

### Opening Apps:

**From FileExplorer:**
```typescript
// When user double-clicks a file
const handleFileOpen = (file: FileSystemItem) => {
  if (file.extension === 'txt') {
    openWindow({
      title: file.name,
      appType: 'notepad',
      position: { x: 100, y: 100 },
      size: { width: 500, height: 400 },
      content: { fileId: file.id, content: file.content }
    });
  }
};
```

**From Desktop Icons:**
```typescript
// Double-click Paint.exe icon
const handleDesktopIconOpen = (icon: DesktopIcon) => {
  if (icon.fileSystemId === 'paint-exe') {
    openWindow({
      title: 'Paint',
      appType: 'paint',
      position: { x: 150, y: 150 },
      size: { width: 600, height: 500 },
    });
  }
};
```

**Rendering in Window:**
```typescript
// In page.tsx or Window component
function renderWindowContent(window: Window) {
  switch (window.appType) {
    case 'notepad':
      return <Notepad content={window.content?.content} />;
    case 'minesweeper':
      return <Minesweeper />;
    case 'paint':
      return <Paint />;
    default:
      return <div>Unknown app</div>;
  }
}
```

---

## 🧪 Testing Your Work

### Notepad Tests:
- [ ] Opens from FileExplorer double-click
- [ ] Displays text content correctly
- [ ] Scrolls for long content
- [ ] Menu bar styled correctly
- [ ] Can open multiple Notepad windows

### Minesweeper Tests:
- [ ] Grid renders correctly
- [ ] Left-click reveals cells
- [ ] Right-click flags cells
- [ ] Numbers accurate (adjacent mine count)
- [ ] Flood fill works on empty cells
- [ ] Game ends when clicking mine
- [ ] Game wins when all safe cells revealed
- [ ] Can start new game

### Paint Tests:
- [ ] Canvas renders
- [ ] Can select tools
- [ ] Pencil draws smooth lines
- [ ] Eraser removes marks
- [ ] Geometric shapes draw correctly
- [ ] Fill tool works
- [ ] Color picker changes color
- [ ] No performance lag while drawing

---

## 📝 Commit Strategy

**Build in order: Notepad → Minesweeper → Paint**

```bash
# After Notepad
git add app/components/Apps/Notepad/
git commit -m "[CODEX] feat(notepad): complete Notepad application

[Detailed report of what you built]

- Codex (Apps Team)"
git push origin feature/phase5-applications

# After Minesweeper
git pull origin feature/phase5-applications
git add app/components/Apps/Minesweeper/
git commit -m "[CODEX] feat(minesweeper): complete Minesweeper game

[Detailed report]

- Codex (Apps Team)"
git push origin feature/phase5-applications

# After Paint
git pull origin feature/phase5-applications
git add app/components/Apps/Paint/
git commit -m "[CODEX] feat(paint): complete Paint application

[Detailed report]

- Codex (Apps Team)"
git push origin feature/phase5-applications
```

**Commit after each app completion, not each file!** (Unless you want more granular commits)

---

## 💡 Design Decisions YOU Make

**I'm not coding these for you. You decide:**

### Notepad:
- Support editing or read-only?
- Line numbers?
- Word wrap toggle?
- Search functionality?

### Minesweeper:
- Grid size and mine count?
- Timer?
- Difficulty levels?
- First-click safety (no mine on first click)?
- Custom flag graphics or emoji?

### Paint:
- Canvas size?
- Brush sizes?
- Undo/Redo?
- Save/Export functionality?
- Advanced tools (spray paint, text)?

**Your call!** Build what makes sense for a portfolio piece.

---

## 🎯 Success Criteria

Phase 5 Apps is **DONE** when:

- [x] Notepad displays text files
- [x] Minesweeper game fully playable
- [x] Paint allows basic drawing
- [x] All apps open in Window components
- [x] Integration with FileExplorer works
- [x] Desktop icons launch apps
- [x] No TypeScript/lint errors
- [x] All apps have Windows 3.1 aesthetic
- [x] Code committed with detailed messages
- [x] Branch pushed

---

## 🚀 When You're Done

**Final mega-commit:**

```bash
git commit -m "[CODEX] feat(apps): complete Phase 5 Applications suite

PHASE 5 APPLICATIONS COMPLETE

Apps Built:
1. Notepad - Text file viewer
2. Minesweeper - Classic game with [features]
3. Paint - Drawing app with [tools]

Integration:
- All apps open via Window component (Phase 2)
- FileExplorer launches Notepad for .txt files
- Desktop icons launch Paint and Minesweeper
- Taskbar shows all open app windows

Technical Highlights:
- [Your technical decisions]
- [Performance optimizations]
- [Creative features you added]

Stats:
- 3 complete applications
- [X] total files
- [Y] lines of code
- 100% Windows 3.1 authentic styling

Ready for Phase 6 (Content & Polish)!

- Codex (Applications Team)"
```

---

## 🎊 Build Amazing Apps!

These apps are what make the portfolio **interactive and memorable!**

**Make them fun!**
- Notepad: Clean and functional
- Minesweeper: Addictive and challenging
- Paint: Creative and smooth

**This is your showcase!** 🎨🎮📝

**Good luck, Codex! Build incredible applications! 🚀**

**- Claude (Your Orchestrator)**
