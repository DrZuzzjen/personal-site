# 🚀 Mission Dispatch - Snake Game + Desktop Features

**Branch**: `develop`
**Status**: Ready for parallel work

---

## 📨 Message for CODEX

Hey Codex! Got an exciting new game for you to build:

### 🐍 Snake Game App

**Your Mission**: `.missions/MISSION-CODEX-SNAKE-GAME.md`

**Quick Brief**:
- Classic Snake game with retro Nokia/MS-DOS aesthetic
- Arrow key controls, food spawning, collision detection
- High scores saved to localStorage (top 5)
- Start/Game Over/Pause screens
- Speed increases as you score

**Folder Boundary**: `app/components/Apps/Snake/` ONLY
- Don't touch anything outside this folder
- I'll wire up the desktop icon and Start Menu

**Visual Style**: Choose one:
- **Nokia Green**: Monochrome #9cb23d on dark background (recommended!)
- **MS-DOS**: Classic green/yellow/cyan on black

**Key Features**:
- Smooth gameplay with game loop
- SPACE to start/pause/restart
- Score and high score display
- "Game Over!" screen with restart option

**Commit Format**: `[CODEX] feat(snake): your message`

Check the mission file for full details, code patterns, and acceptance criteria. This is gonna be fun! 🎮

---

## 📨 Message for STEVE

Hey Steve! Two important features to make the Windows experience more authentic:

### 🖱️ Context Menu Fix + File Dragging

**Your Mission**: `.missions/MISSION-STEVE-CONTEXT-MENU-DRAG.md`

**Quick Brief**:

#### Part 1: Fix Context Menu "New" Submenu
- Right-click Desktop → "New" → Submenu should appear
- Show options: Folder, Text Document, Image (optional)
- Wire up to existing `createFolder()` and `createFile()` functions
- 150ms hover delay for authentic feel

#### Part 2: Drag Files from FileExplorer to Desktop
- Make FileExplorer items draggable
- Desktop accepts drops
- Creates desktop icon at drop position
- Double-click icon opens file in Notepad
- Persist icon positions to localStorage

**Folder Boundary**: `app/components/Desktop/` ONLY
- Don't touch apps, window manager, boot sequence
- Focus on Desktop and FileExplorer components

**This is HIGH value** - makes the Windows feel super authentic!

**Commit Format**: `[STEVE] feat(desktop): your message`

Full technical specs, code patterns, and acceptance criteria in the mission file.

---

## 🎯 Success Criteria

**Both agents**:
- ✅ Work only in assigned folders
- ✅ Commit with agent prefix ([CODEX] or [STEVE])
- ✅ Test thoroughly before marking complete
- ✅ No conflicts with existing features

**When done**:
- Push to `develop` branch
- Let me know you're ready for review
- I'll test, merge, and prep the next mission (real portfolio content!)

---

## 📋 What's Next (After You Both Finish)

Claude will add **real portfolio content**:
- Actual CV info in About.txt
- Real project descriptions (5 projects)
- SEO metadata and Open Graph tags
- Real resume PDF
- Screenshot for social sharing

This will transform the site from demo to legit portfolio! 🎯

---

**Questions?** Check your mission files for full details. Let's build something awesome! 💪

Branch: `develop`
Ready? Go! 🚀
