# Windows 3.1 Portfolio/CV 🖥️

A fully functional Windows 3.1 operating system simulation built as a portfolio website. Not just a theme - a complete OS experience with draggable windows, a file system, MS Paint, Minesweeper, and more.

**🚀 Live Demo**: [https://web-b3nosxc4i-drzuzzjens-projects.vercel.app](https://web-b3nosxc4i-drzuzzjens-projects.vercel.app)

## 🎯 Concept

Instead of a traditional portfolio site, this project simulates a complete Windows 3.1 desktop environment where:
- Your CV lives in `My Computer/About.txt`
- Projects are files in `My Documents/`
- Visitors can play Minesweeper while reading your resume
- A functional MS Paint clone lets users doodle
- Easter eggs and protected system files add personality
- Users can create their own files and folders (persisted to localStorage)

**This is a technical flex** - showcasing advanced frontend engineering: multi-window state orchestration, HTML5 Canvas painting, real-time game logic, drag-and-drop systems, and pixel-perfect retro UI/UX.

## ✨ Features

### Core Desktop Environment
- 🪟 **Full Window Manager** - Drag, minimize, maximize, resize, z-index stacking
- 📁 **File System Simulation** - Hierarchical folders, create/delete/save files
- 🎨 **MS Paint Clone** - Professional canvas drawing with zoom, colors, brush sizes
- 💣 **Minesweeper** - Classic game implementation
- 📝 **Notepad** - Full CRUD text editor with save/load functionality
- 📹 **Camera App** - Webcam with screenshot capture (saves to desktop!)
- 📺 **TV App** - Retro YouTube player in wooden TV frame
- 🚀 **Boot Sequence** - Authentic POST screen with skip functionality
- 🗑️ **Easter Eggs** - Protected files, fake BSOD, fun error dialogs
- ⚙️ **Start Menu** - Programs, Documents, Settings, Restart, Shut Down

### Portfolio Content
- **About.txt** - CV card with links (LinkedIn, X, GitHub)
- **My Documents/** - 5 project descriptions with tech stacks
- **Resume.pdf** - Downloadable from Floppy drive
- All accessed through authentic Windows 3.1 UI

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS-in-JS (for authentic Windows 3.1 aesthetic)
- **State Management**: React Context (WindowContext, FileSystemContext)
- **Persistence**: localStorage (user-created files, preferences)
- **Deployment**: Vercel

## 💪 Technical Achievements

### Window System Engineering
- **Custom window manager** with z-index orchestration (focus management across 10+ windows)
- **Outline dragging** - authentic Win3.1 behavior (drag outline only, not full window)
- **State persistence** - minimize/maximize/restore with proper position memory
- **Event propagation** - complex mouse/keyboard event handling across nested components

### Canvas & Game Development
- **MS Paint clone** - Real-time HTML5 Canvas drawing with multiple brush sizes, colors, and tools
- **Minesweeper** - Complete game logic: mine placement, flood-fill reveal algorithm, win/loss detection
- **Paint tools**: Brush, Eraser, customizable sizes (2px-16px), color palette, PNG export

### File System Simulation
- **Hierarchical structure** - Nested folders with path resolution
- **CRUD operations** - Create, read, update, delete files and folders
- **Protection system** - System files trigger easter eggs (ErrorDialog, fake BSOD)
- **Context menu integration** - Right-click interactions with protected actions

### Boot Sequence & Animation
- **Multi-stage boot** - POST screen → Memory check → Loading screen → Desktop fade-in
- **Typewriter effects** - Line-by-line text animation with timing control
- **Skip functionality** - "Press any key" with global keyboard listener
- **localStorage flag** - Skip boot for returning visitors (UX optimization)

### UI/UX Polish
- **Pixel-perfect borders** - 3D raised/sunken effects using 4-side border technique
- **Taskbar integration** - Live window buttons, working clock (updates every 30s)
- **Modal systems** - ErrorDialog and BSOD overlays with proper z-index layering
- **Accessibility** - Keyboard navigation, ARIA labels, semantic HTML

### State Architecture
- **Multi-context design** - Separate concerns (windows, file system, dialogs)
- **Custom hooks** - `useWindowManager`, `useFileSystem`, `useWindowDrag`, `useIconDrag`
- **Grid snapping** - Desktop icon positioning with pixel-to-grid conversion
- **Type safety** - Comprehensive TypeScript interfaces for all entities

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and watch the boot sequence!

## 📋 Development Phases

See [PHASES.md](./PHASES.md) for detailed development roadmap.

**Current Status**: 🚀 DEPLOYED TO PRODUCTION!

- ✅ Phase 0: Planning & Concept
- ✅ Phase 1: Foundation & Architecture (Steve)
- ✅ Phase 2: Window System Core (Codex)
- ✅ Phase 3: Desktop & File System (Steve + Codex parallel)
- ✅ Phase 4: Boot Sequence (Steve)
- ✅ Phase 5: Applications - Notepad, Minesweeper, Paint (Codex)
- ✅ Phase 6: Easter Eggs & Dialogs (Steve)
- ✅ Phase 7: Start Menu & System Controls (Steve)
- ✅ Phase 8: Window Resizing (Steve)
- ✅ Phase 9: Paint UI Redesign (Steve)
- ✅ Phase 10: Camera & TV Apps (Steve)
- ✅ **DEPLOYED**: Vercel Production

## 🎨 Design Decisions

### Authenticity First
- **Outline dragging** - Drag shows window outline only (authentic Win3.1, more performant)
- **3D borders** - Raised/sunken effects using classic 4-side border technique
- **System fonts** - Monospace for boot, sans-serif for UI
- **Color accuracy** - Windows gray (#C0C0C0), classic blue title bars (#000080)

### Performance Optimizations
- **Hybrid rendering** - HTML/React for UI, Canvas for Paint (optimal for each use case)
- **Event delegation** - Efficient mouse tracking during drag operations
- **Selective re-renders** - Context design prevents unnecessary component updates
- **Lazy evaluation** - Apps don't render until window opens

### User Experience
- **Skip boot** - Press any key, or auto-skip for returning visitors
- **localStorage persistence** - User files, settings, boot state saved
- **Desktop-first** - Optimized for desktop browsers (mobile warning planned)
- **Easter eggs** - Protected files trigger humorous error dialogs and fake BSOD

## 📂 Project Structure

```
app/
├── components/
│   ├── Desktop/
│   ├── Window/
│   ├── FileSystem/
│   ├── BootSequence/
│   └── Apps/
│       ├── Paint/
│       ├── Minesweeper/
│       └── Notepad/
├── hooks/
│   ├── useWindowManager
│   └── useFileSystem
└── lib/
    ├── types.ts
    └── constants.ts
```

## 🤝 Contributing

This is a collaborative project between human and AI. See [PHASES.md](./PHASES.md) for task breakdown and who's working on what.

## 📄 License

MIT

---

**Built with Next.js** | Powered by nostalgia and TypeScript
