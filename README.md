# Windows 3.1 Portfolio/CV 🖥️

A fully functional Windows 3.1 operating system simulation built as a portfolio website. Not just a theme - a complete OS experience with draggable windows, a file system, MS Paint, Minesweeper, and more.

## 🎯 Concept

Instead of a traditional portfolio site, this project simulates a complete Windows 3.1 desktop environment where:
- Your CV lives in `My Computer/About.txt`
- Projects are files in `My Documents/`
- Visitors can play Minesweeper while reading your resume
- A functional MS Paint clone lets users doodle
- Easter eggs and protected system files add personality
- Users can create their own files and folders (persisted to localStorage)

**This is a technical flex** - showcasing complex state management, canvas manipulation, window systems, and retro UI/UX.

## ✨ Features

### Core Desktop Environment
- 🪟 **Full Window Manager** - Drag, minimize, maximize, z-index stacking
- 📁 **File System Simulation** - Hierarchical folders, create/delete/move files
- 🎨 **MS Paint Clone** - Canvas-based drawing with tools
- 💣 **Minesweeper** - Classic game implementation
- 🚀 **Boot Sequence** - Authentic POST screen with funny messages
- 🗑️ **Easter Eggs** - Protected files, fake BSOD, fun error dialogs

### Portfolio Content
- **About.txt** - CV card with links (LinkedIn, X, GitHub)
- **My Documents/** - 5 project descriptions with tech stacks
- **Resume.pdf** - Downloadable from Floppy drive
- All accessed through authentic Windows 3.1 UI

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (for retro Windows 3.1 aesthetic)
- **State**: React Context/Zustand (for window management)
- **Storage**: localStorage (user-created files persist)
- **Deployment**: Vercel

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

**Current Status**: Phase 2 - Window System (In Progress)

- ✅ Phase 0: Planning & Concept
- ✅ Phase 1: Foundation & Architecture (Steve - Completed)
- 🟢 Phase 2: Window System Core (Codex - In Progress)
- ⏳ Phase 3: Desktop & File System
- ⏳ Phase 4: Boot Sequence
- ⏳ Phase 5: Applications (Notepad, Minesweeper, Paint)
- ⏳ Phase 6: Content & Easter Eggs
- ⏳ Phase 7: Polish & Deployment

## 🎨 Design Decisions

- **Drag Behavior**: Outline dragging (authentic to Win3.1, more performant)
- **Color Palette**: 32-bit color depth with classic Windows gray (#C0C0C0)
- **Rendering**: Hybrid HTML/Canvas approach
- **Mobile**: Desktop-only experience (show warning dialog on mobile)

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
