# Development Phases - Windows 3.1 Portfolio

**Project Status**: 🟢 In Progress
**Current Phase**: Phase 4 & 5 - Boot Sequence + Applications (Parallel)
**Completed Phases**: Phase 0 ✅ | Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅

---

## Phase 0: Planning & Concept ✅

- [x] Define core concept (full OS simulation)
- [x] Decide on features (Paint, Minesweeper, file system)
- [x] Technical decisions (drag behavior, rendering strategy)
- [x] Design decisions (color palette, boot sequence)
- [x] Update CLAUDE.md with comprehensive specs
- [x] Update README.md with project overview
- [x] Create PHASES.md for task tracking

**Status**: ✅ Complete

---

## Phase 1: Foundation & Architecture ✅

**Goal**: Set up TypeScript types, constants, and project structure

**Branch**: `feature/phase1-foundation`
**Developer**: Steve
**Status**: ✅ COMPLETE - Ready to merge

### Tasks:

- [x] **Create type definitions** (`app/lib/types.ts`)
  - Window type (id, title, position, size, zIndex, isMinimized, etc.)
  - File/Folder types (name, type, content, path, protected)
  - App types (Paint tools, Minesweeper state)
  - Desktop icon types
  - **Delivered**: 116 lines of comprehensive TypeScript interfaces

- [x] **Create constants** (`app/lib/constants.ts`)
  - Default window sizes and positions
  - Color palette (Windows gray, borders, etc.)
  - File system initial structure
  - Boot sequence messages
  - Easter egg messages
  - **Delivered**: 345 lines including initial file system with 5 projects

- [x] **Window Manager Hook** (`app/hooks/useWindowManager.ts`)
  - Open/close/minimize/maximize operations
  - Z-index management (focus handling)
  - Position and size updates
  - **Delivered**: 101 lines of robust state management

- [x] **File System Hook** (`app/hooks/useFileSystem.ts`)
  - File/folder CRUD operations
  - Desktop icon management
  - Protection system for system files
  - **Delivered**: 170 lines with recursive tree operations

- [x] **React Context Providers**
  - `app/lib/WindowContext.tsx` (27 lines)
  - `app/lib/FileSystemContext.tsx` (27 lines)
  - Integrated in `app/layout.tsx`

- [x] **Test Page** (`app/test-foundation/page.tsx`)
  - Validates all hooks and contexts
  - Interactive testing interface
  - **Status**: Working at `/test-foundation`

### Deliverables:
- ✅ 7 files created/modified
- ✅ ~760 lines of code
- ✅ Zero TypeScript errors
- ✅ Build passes successfully
- ✅ 7 clean git commits with proper messages

**Owner**: Steve
**Completed**: October 4, 2025
**Time Taken**: ~2.5 hours (as estimated)

---

## Phase 2: Window System Core ✅

**Goal**: Build the foundation of the window manager

**Branch**: `feature/phase2-window-system`
**Developer**: Codex
**Status**: ✅ COMPLETE - Merged to master

### Tasks:

- [x] **Window Component** (`app/components/Window/Window.tsx`)
  - Title bar with app name and icon
  - Minimize/maximize/close buttons
  - Window border with proper styling
  - Content area (children)
  - Click to bring to front (z-index)
  - **Delivered**: 206 lines - Full integration with Phase 1 hooks

- [x] **Dragging System** (`app/components/Window/useWindowDrag.ts`)
  - Outline dragging (show border only while dragging)
  - Mouse down on title bar to start drag
  - Mouse move to update outline position
  - Mouse up to finalize position
  - Proper event cleanup
  - **Delivered**: 99 lines - Clean hook implementation

- [x] **Window Title Bar** (`app/components/Window/WindowTitleBar.tsx`)
  - Focus-aware coloring (blue/gray)
  - Minimize/maximize/close buttons with proper event handling
  - Accessible (aria-labels)
  - **Delivered**: 149 lines - Pixel-perfect Windows 3.1 styling

- [x] **Demo Page** (`app/page.tsx`)
  - Desktop demo with sample windows
  - Integration showcase
  - **Delivered**: Working demo with multiple windows

### Deliverables:
- ✅ 3 new component files
- ✅ ~454 lines of code
- ✅ Zero TypeScript/lint errors
- ✅ Authentic Windows 3.1 drag behavior
- ✅ Full Phase 1 hook integration

**Owner**: Codex
**Lint Fixes**: Claude
**Completed**: October 4, 2025
**Time Taken**: ~4 hours (as estimated)

---

## Phase 3: Desktop & File System ✅

**Goal**: Create the desktop environment and file system logic

**Branch**: `feature/phase3-desktop`
**Developers**: Steve + Codex (Parallel)
**Status**: ✅ COMPLETE - Merged to master

### Delivered:

- [x] **Desktop** (Steve) - Desktop.tsx, DesktopIcon.tsx, useIconDrag.ts, ContextMenu.tsx
- [x] **Taskbar** (Codex) - Taskbar.tsx, TaskbarButton.tsx, Clock.tsx
- [x] **FileExplorer** (Codex) - 256-line file browser with navigation

**Impact**: 2,536 additions across 17 files

---

## Phase 4: Boot Sequence (IN PROGRESS)

**Goal**: Create immersive boot animation

**Branch**: `feature/phase4-boot-sequence`
**Developer**: Steve
**Status**: 🟡 In Progress

See [MISSION-STEVE-PHASE4.md](MISSION-STEVE-PHASE4.md) for detailed requirements.

---

## Phase 5: Applications (IN PROGRESS)

**Goal**: Build Notepad, Minesweeper, and Paint apps

**Branch**: `feature/phase4-boot-sequence` (same as Phase 4 - parallel work)
**Developer**: Codex
**Status**: 🟡 In Progress

See [MISSION-CODEX-PHASE5.md](MISSION-CODEX-PHASE5.md) for detailed requirements.

---

### Apps to Build:

- [ ] **Minesweeper Component** (`components/Apps/Minesweeper/Minesweeper.tsx`)
  - Grid of cells (8x8 or 10x10, easy mode)
  - Click to reveal cell
  - Right-click to flag
  - Mine generation logic
  - Win/lose detection
  - Reset button

- [ ] **Game Logic** (`components/Apps/Minesweeper/gameLogic.ts`)
  - Generate mine positions
  - Calculate adjacent mine counts
  - Flood fill for empty cells
  - Game state management

**Owner**: Claude (logic-heavy)
**Estimated Time**: 3-4 hours

---

### 5C: MS Paint (Most Complex)

- [ ] **Paint Component** (`components/Apps/Paint/Paint.tsx`)
  - Canvas element
  - Tool palette (Pencil, Eraser, Fill, Line, Rectangle, Circle)
  - Color picker (basic colors)
  - Menu bar (File, Edit, View - minimal functionality)

- [ ] **Canvas Drawing Logic** (`components/Apps/Paint/useCanvas.ts`)
  - Mouse events on canvas
  - Drawing operations
  - Tool state management
  - Undo/redo (if time permits)

**Owner**: Claude (canvas complexity)
**Estimated Time**: 4-6 hours

---

## Phase 6: Content & Easter Eggs

**Goal**: Add actual portfolio content and fun interactions

### Tasks:

- [ ] **Portfolio Content**
  - About.txt content (name, title, bio, links)
  - 5 project descriptions (Project_1.txt - Project_5.txt)
  - Format as readable text files
  - Include GitHub links

- [ ] **My Computer Window** (`components/Apps/MyComputer/MyComputer.tsx`)
  - File explorer view
  - Show folders: My Documents, A:\ Floppy
  - Double-click to open folders/files
  - Icons for different file types

- [ ] **Easter Eggs & Protected Actions**
  - Try to delete My Documents → Funny error dialog
  - Try to delete About.txt → Fake BSOD screen
  - Protected icon dragging → Snap back animation
  - Hidden files (secret messages?)

- [ ] **Error Dialog Component** (`components/Window/ErrorDialog.tsx`)
  - Classic Windows error box
  - OK button
  - Warning icon
  - Custom messages

- [ ] **BSOD Component** (easter egg)
  - Blue screen with white text
  - Funny error message
  - "Press any key to continue"

**Owner**: Human (content) + Claude (easter eggs)
**Estimated Time**: 3-4 hours

---

## Phase 7: Polish & Deployment

**Goal**: Final touches, testing, and deploy to Vercel

### Tasks:

- [ ] **Visual Polish**
  - Fine-tune colors and shadows
  - Add retro fonts (MS Sans Serif style)
  - Pixel-perfect icon alignment
  - Window animations (smooth transitions)

- [ ] **Mobile Warning**
  - Detect mobile devices
  - Show dialog: "This experience requires Windows 3.1 or higher. Please visit on desktop."
  - Option to proceed anyway (degraded experience)

- [ ] **Performance Optimization**
  - Minimize re-renders
  - Optimize drag performance
  - Lazy load apps (don't render until window opens)

- [ ] **Testing**
  - Test all window operations
  - Test file system CRUD
  - Test Paint tools
  - Test Minesweeper logic
  - Cross-browser testing (Chrome, Firefox, Safari)

- [ ] **Deployment to Vercel**
  - Connect GitHub repo
  - Deploy main branch
  - Set up custom domain (if available)
  - Test production build

**Owner**: Both (collaborative final push)
**Estimated Time**: 4-5 hours

---

## Summary Timeline

| Phase | Tasks | Est. Time | Owner |
|-------|-------|-----------|-------|
| 0 - Planning | ✅ | ✅ | Both |
| 1 - Foundation | 4 tasks | 2-3h | Claude |
| 2 - Window System | 4 tasks | 4-6h | Claude |
| 3 - Desktop & FS | 4 tasks | 4-5h | Both |
| 4 - Boot Sequence | 3 tasks | 2-3h | Human |
| 5A - Notepad | 1 task | 1-2h | Human |
| 5B - Minesweeper | 2 tasks | 3-4h | Claude |
| 5C - Paint | 2 tasks | 4-6h | Claude |
| 6 - Content | 5 tasks | 3-4h | Both |
| 7 - Polish | 5 tasks | 4-5h | Both |

**Total Estimated Time**: 28-38 hours
**Suggested Pace**: 2-3 phases per week (complete in 3-4 weeks)

---

## How to Use This Document

1. **Check off tasks** as you complete them (edit this file)
2. **Add notes** below tasks if needed (blockers, decisions, etc.)
3. **Update "Current Phase"** at the top when moving to next phase
4. **Communicate**: If you start a task, mark it with `[WIP]` so we don't duplicate work

Example:
```markdown
- [WIP] Window Component (Claude working on this)
- [x] Window Manager Hook (Completed - ready for review)
- [ ] Desktop Component (Blocked: waiting for Window System)
```

---

**Let's build something awesome! 🚀**
