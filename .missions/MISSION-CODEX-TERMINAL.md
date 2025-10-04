# Mission: Terminal App - Full MS-DOS Command Prompt 🖥️💚

**Agent**: Codex
**Branch**: `develop`
**Folder Boundary**: `app/components/Apps/Terminal/` ONLY
**Difficulty**: ⭐⭐⭐⭐⭐ HIGH - This is your toughest challenge yet!

---

## 🚨 CRITICAL REQUIREMENTS

### **VERBOSE COMMIT POLICY**
**YOU MUST COMMIT FREQUENTLY!** This is a team project. Every feature, every bug fix, every small milestone MUST be committed so Claude and Steve can track your progress.

**Commit Guidelines**:
- ✅ **Minimum**: Commit after every major feature (command parser, each easter egg, etc.)
- ✅ **Better**: Commit after every 50-100 lines of code
- ✅ **Best**: Commit after every logical unit of work (one command working, UI layout done, etc.)
- ✅ **Always use prefix**: `[CODEX] feat(terminal): your detailed message`

**Examples of good commits**:
```bash
[CODEX] feat(terminal): add basic Terminal component structure
[CODEX] feat(terminal): implement command parser and input handling
[CODEX] feat(terminal): add 'dir' command with file system integration
[CODEX] feat(terminal): add 'hack' easter egg with Matrix animation
[CODEX] feat(terminal): add command history (up/down arrows)
[CODEX] fix(terminal): prevent reverse directory traversal
[CODEX] style(terminal): add CRT scanlines and phosphor glow
```

**After EVERY commit**:
```bash
git add app/components/Apps/Terminal/
git commit -m "[CODEX] your message"
git push  # So everyone sees your progress!
```

---

## 🎯 Objective

Build a **FULLY FUNCTIONAL** MS-DOS style terminal that:
1. Actually executes commands that modify the virtual file system
2. Has a hidden "hack the mainframe" game
3. Works as the default mobile view (instead of desktop)
4. Tons of easter eggs and personality

**This is NOT just a cosmetic terminal** - it must WORK!

---

## 📱 CRITICAL: Mobile-First Requirement

**The Terminal IS the mobile experience!**

On mobile devices (detected by screen width < 768px):
- ❌ **NO desktop icons**
- ❌ **NO window manager**
- ❌ **NO taskbar**
- ✅ **JUST Terminal** - full screen after boot sequence
- ✅ User can access file system via commands
- ✅ User can "run" apps via commands (opens in full screen terminal UI)

**Mobile Flow**:
1. Boot sequence plays
2. Screen fades to black
3. Terminal appears FULL SCREEN
4. Blinking cursor, green text
5. Shows welcome message with `help` command hint

---

## 📋 Core Requirements

### 1. Visual Design - Green Phosphor Terminal

**Colors**:
```typescript
const TERMINAL_COLORS = {
  BACKGROUND: '#000000',        // Pure black
  TEXT: '#00ff00',               // Bright green (Matrix style)
  TEXT_DIM: '#00aa00',          // Dimmer green for prompts
  CURSOR: '#00ff00',             // Blinking green cursor
  ERROR: '#ff0000',              // Red for errors
  SUCCESS: '#00ff00',            // Green for success
  WARNING: '#ffff00',            // Yellow for warnings
};
```

**Style Effects**:
- CRT scanlines overlay (subtle horizontal lines)
- Slight text glow/bloom effect
- Monospace font: `'Courier New', 'Consolas', monospace`
- Blinking cursor (underscore or block)
- Optional: Slight screen curvature (border-radius on container)

**Window Dimensions** (desktop mode):
- Default: 800x600
- Min: 600x400
- Resizable: Yes

---

### 2. Command Parser Architecture

```typescript
interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  execute: (args: string[], terminal: TerminalInstance) => CommandResult;
  hidden?: boolean; // For easter eggs
}

interface CommandResult {
  output: string[];  // Lines to print
  error?: string;    // Error message if any
  clearScreen?: boolean;
  specialEffect?: 'hack' | 'matrix' | 'bsod';
}

interface TerminalState {
  currentPath: string;        // e.g., "/Desktop"
  commandHistory: string[];   // For up/down arrows
  historyIndex: number;
  output: TerminalLine[];     // All terminal output
}

interface TerminalLine {
  type: 'prompt' | 'output' | 'error' | 'success';
  content: string;
}
```

**Command Parser Logic**:
```typescript
function parseCommand(input: string): { cmd: string; args: string[]; flags: Record<string, boolean> } {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

  // Separate flags from args
  const args: string[] = [];
  const flags: Record<string, boolean> = {};

  parts.slice(1).forEach(part => {
    if (part.startsWith('-')) {
      flags[part.slice(1)] = true;
    } else {
      args.push(part);
    }
  });

  return { cmd, args, flags };
}
```

---

### 3. File System Integration

**CRITICAL**: Commands must interact with the REAL virtual file system from `useFileSystemContext`!

**Required Commands**:

#### Navigation
- **`cd [path]`** - Change directory
  - `cd ..` - go up
  - `cd /Desktop` - absolute path
  - `cd My\ Documents` or `cd "My Documents"` - spaces
  - Updates `currentPath`

- **`pwd`** - Print working directory
  - Shows current path

#### Listing
- **`dir`** or **`ls`** - List files/folders in current directory
  - Shows name, type, size
  - Folders in different color
  - Format:
    ```
    Desktop
    --------
    [DIR]  My Computer
    [DIR]  Recycle Bin
    [EXE]  Paint.exe
    [EXE]  Snake.exe
    [EXE]  Camera.exe
    [EXE]  TV.exe
    [TXT]  test.txt
    ```

- **`tree`** - Show directory tree (ASCII art)
  ```
  Desktop
  ├── My Computer
  │   ├── About.txt
  │   ├── My Documents
  │   │   ├── Project_1.txt
  │   │   └── Project_2.txt
  │   └── A:\
  │       └── Resume.pdf
  └── Recycle Bin
  ```

#### File Operations
- **`type [file]`** or **`cat [file]`** - Display file contents
  - For .txt files, show content
  - For .exe files, show "Cannot display executable file"

- **`mkdir [name]`** - Create folder in current directory
  - Calls `createFolder()` from useFileSystemContext
  - **Creates desktop icon if in /Desktop!**

- **`touch [name]`** or **`echo [text] > [file]`** - Create file
  - Calls `createFile()` from useFileSystemContext
  - **Creates desktop icon if in /Desktop!**

- **`rm [name]`** or **`del [name]`** - Delete file/folder
  - Shows protection errors for protected files
  - Confirms deletion for non-protected

- **`mv [old] [new]`** or **`ren [old] [new]`** - Rename
  - Updates file system

#### System Commands
- **`ver`** - Show version
  ```
  Windows 3.1 Portfolio Edition
  Version 3.11.2025
  Copyright (C) 2025 [Your Name]
  ```

- **`whoami`** - Show user info (funny)
  ```
  You are: An awesome human exploring a Windows 3.1 portfolio
  Current status: Probably impressed 😎
  Skills detected: Expert terminal user
  ```

- **`date`** - Show current date
- **`time`** - Show current time

- **`cls`** or **`clear`** - Clear screen

- **`help`** - List all commands (except hidden ones)
  ```
  Available Commands:
  -------------------
  Navigation:
    cd [path]       Change directory
    pwd             Print working directory
    dir, ls         List files
    tree            Show directory tree

  File Operations:
    type, cat       Display file contents
    mkdir           Create folder
    touch           Create file
    rm, del         Delete file
    mv, ren         Rename file

  System:
    cls, clear      Clear screen
    help            Show this help
    exit            Close terminal

  Try typing 'help secrets' for... something special 😏
  ```

---

### 4. Easter Eggs & Hidden Commands

#### **PRIMARY GAME: `hack`** 🎯

This is the MAIN easter egg - a full "hack the mainframe" simulator!

**Trigger**: User types `hack` or `hack mainframe`

**Sequence**:
```
> hack

[INITIALIZING CYBERDECK v2.3...]
[SCANNING FOR VULNERABILITIES...]
   ████████░░░░░░░░░░ 40%
[FOUND: OPEN PORT 8080]
[EXPLOITING BUFFER OVERFLOW...]
   ████████████████░░ 80%
[BYPASSING FIREWALL...]
   ███████████████████ 95%
[INJECTING PAYLOAD...]
   ████████████████████ 100%

[SUCCESS! ROOT ACCESS GRANTED]

You are now in: mainframe.portfolio.sys
Available files:
  - secret_project.txt
  - resume_deluxe.pdf
  - easter_egg.exe
  - the_matrix.dat

Type 'hack exit' to leave mainframe
Type 'hack cat [file]' to view files
```

**Inside Hack Mode**:
- **`hack cat secret_project.txt`** - Shows a hidden project description
- **`hack cat resume_deluxe.pdf`** - Triggers resume download
- **`hack run easter_egg.exe`** - Shows ASCII art or achievement
- **`hack exit`** - Return to normal terminal

**Progressive Difficulty** (optional):
- First hack: Easy, auto-succeeds
- Second hack: Requires "password" (hidden in portfolio)
- Third hack: Mini puzzle or sequence

#### **OTHER EASTER EGGS**:

- **`matrix`** - Matrix digital rain animation (10 seconds)
  - Green characters falling
  - Use setInterval and random chars
  - Clears after animation

- **`sudo rm -rf /`** - Fake scary warning
  ```
  [ERROR] Permission denied: Are you crazy?!
  This would delete EVERYTHING!
  Nice try, hackerman 😏
  ```

- **`sudo make me a sandwich`**
  ```
  What? Make it yourself.
  ```

- **`sudo make me a sandwich`** (if tried twice)
  ```
  [sudo] password for user:
  [Access Denied]
  Okay okay, fine. Here's your sandwich: 🥪
  ```

- **`cowsay [text]`** - ASCII cow saying text
  ```
   _____________
  < Hello World >
   -------------
          \   ^__^
           \  (oo)\_______
              (__)\       )\/\
                  ||----w |
                  ||     ||
  ```

- **`fortune`** - Random programming quotes
  ```
  "There are only two hard things in Computer Science:
   cache invalidation and naming things."
   - Phil Karlton
  ```

- **`help secrets`** - Hints about easter eggs
  ```
  Psst... try these:
  - hack
  - matrix
  - cowsay [message]
  - sudo rm -rf /
  - konami
  ```

- **`konami`** - Konami code achievement
  ```
  ↑ ↑ ↓ ↓ ← → ← → B A
  🏆 ACHIEVEMENT UNLOCKED: Old School Gamer
  ```

- **`credits`** - Scroll credits
  ```
  === WINDOWS 3.1 PORTFOLIO ===

  Built with:
    - Next.js 15
    - TypeScript
    - React
    - Tears of joy

  Special Thanks:
    - You, for exploring!
    - Coffee, for existing
    - Stack Overflow, for... everything

  © 2025 [Your Name]
  ```

---

### 5. Keyboard & Input Handling

**Must Support**:
- ✅ **Enter** - Execute command
- ✅ **Up Arrow** - Previous command in history
- ✅ **Down Arrow** - Next command in history
- ✅ **Tab** - Auto-complete file/folder names (bonus)
- ✅ **Ctrl+C** - Interrupt current command (if running animation)
- ✅ **Ctrl+L** - Clear screen (alternative to `cls`)

**Input Behavior**:
- Cursor blinks at end of current line
- Can type anywhere on current line
- Backspace works
- Cannot edit previous output
- Max input length: 500 chars

**Command History**:
- Store last 50 commands
- Up/Down cycles through
- Persist to localStorage (optional)

---

### 6. Mobile Implementation

**Detection**:
```typescript
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
```

**In `app/page.tsx`**:
```typescript
// After boot sequence completes
if (isMobile) {
  // DON'T show desktop
  // DON'T render icons
  // SHOW full-screen terminal
  return <Terminal isMobile={true} />;
} else {
  // Normal desktop experience
  return <Desktop />;
}
```

**Mobile Terminal Differences**:
- ✅ Full screen (no window chrome)
- ✅ Larger font size (16px vs 14px)
- ✅ Touch-optimized input
- ✅ Virtual keyboard friendly
- ✅ Shows hint: "Tap here to type"

**Mobile Commands**:
- All commands work same as desktop
- `run paint` - Opens Paint in full-screen mode (render Paint component full screen)
- `run snake` - Opens Snake game full screen
- `run camera` - Opens Camera full screen
- Apps don't open in windows, they replace terminal temporarily
- `exit` from app returns to terminal

---

### 7. Technical Implementation

**File Structure**:
```
app/components/Apps/Terminal/
├── Terminal.tsx              (main component)
├── CommandParser.ts          (command logic)
├── commands/
│   ├── index.ts              (command registry)
│   ├── navigation.ts         (cd, pwd, ls, etc.)
│   ├── fileOps.ts            (mkdir, rm, type, etc.)
│   ├── system.ts             (help, ver, whoami, etc.)
│   └── easterEggs.ts         (hack, matrix, cowsay, etc.)
├── effects/
│   ├── MatrixRain.tsx        (Matrix animation)
│   ├── HackSequence.tsx      (Hack game UI)
│   └── CRTEffect.tsx         (Scanlines, glow)
└── types.ts                  (TypeScript interfaces)
```

**Terminal.tsx Structure**:
```typescript
export default function Terminal({ isMobile = false }: { isMobile?: boolean }) {
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('/Desktop');
  const [isRunningEffect, setIsRunningEffect] = useState(false);

  const { rootItems, createFile, createFolder, deleteItem } = useFileSystemContext();

  const handleCommand = (input: string) => {
    const { cmd, args, flags } = parseCommand(input);
    const command = commandRegistry.find(c =>
      c.name === cmd || c.aliases?.includes(cmd)
    );

    if (!command) {
      addOutput({ type: 'error', content: `Command not found: ${cmd}` });
      return;
    }

    const result = command.execute(args, {
      currentPath,
      setCurrentPath,
      rootItems,
      createFile,
      createFolder,
      deleteItem,
    });

    result.output.forEach(line => addOutput({ type: 'output', content: line }));
    if (result.error) addOutput({ type: 'error', content: result.error });
    if (result.clearScreen) setOutput([]);
    if (result.specialEffect) runEffect(result.specialEffect);
  };

  // ... rest of component
}
```

**Prompt Format**:
```
C:\Desktop> _
```

**Output Rendering**:
- Each line is a separate div
- Scroll to bottom after each command
- Max history: 1000 lines (then trim old)

---

## 🚫 Constraints

### DO NOT TOUCH:
- ❌ Any files outside `app/components/Apps/Terminal/`
- ❌ Boot sequence
- ❌ Desktop components (unless mobile check in page.tsx)
- ❌ Other apps
- ❌ Window manager (except mobile detection)

### DO ONLY:
- ✅ Build Terminal component and all its parts
- ✅ Add mobile check to page.tsx (if statement)
- ✅ Test with file system
- ✅ **COMMIT FREQUENTLY** (after every feature!)

---

## ✅ Acceptance Criteria

### Core Functionality
- [ ] Terminal renders with green phosphor aesthetic
- [ ] Command input with blinking cursor
- [ ] Command parser works for all basic commands
- [ ] File system commands actually modify virtual FS
- [ ] Icons appear on desktop when created via terminal
- [ ] Command history (up/down arrows) works
- [ ] Help command lists all commands
- [ ] Clear screen works

### File System Integration
- [ ] `cd` navigates directories correctly
- [ ] `ls`/`dir` shows files from current directory
- [ ] `mkdir` creates folders (with desktop icons if in /Desktop)
- [ ] `touch`/`echo >` creates files (with desktop icons)
- [ ] `rm` deletes with protection checks
- [ ] `type`/`cat` displays file contents
- [ ] `tree` shows ASCII directory tree

### Easter Eggs
- [ ] `hack` game works with full sequence
- [ ] `matrix` animation plays
- [ ] `sudo rm -rf /` shows funny error
- [ ] `cowsay` generates ASCII cow
- [ ] `fortune` shows random quotes
- [ ] `help secrets` reveals easter eggs
- [ ] At least 3 more funny commands

### Mobile Support
- [ ] Detects mobile devices (<768px)
- [ ] Terminal shows full-screen on mobile (no desktop)
- [ ] Larger touch-friendly UI on mobile
- [ ] Virtual keyboard works smoothly
- [ ] Shows welcome message with help hint

### Code Quality
- [ ] **Frequent commits** (every feature!)
- [ ] Clean TypeScript types
- [ ] Separated concerns (parser, commands, UI)
- [ ] No console errors
- [ ] Performance: smooth typing, no lag

---

## 🚀 Getting Started

1. **Pull latest develop branch**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create Terminal folder**
   ```bash
   mkdir -p app/components/Apps/Terminal
   ```

3. **Start with basic structure** (COMMIT!)
   ```bash
   # Create Terminal.tsx with basic UI
   git add .
   git commit -m "[CODEX] feat(terminal): add basic Terminal component structure"
   git push
   ```

4. **Add command parser** (COMMIT!)
   ```bash
   # Build CommandParser.ts
   git add .
   git commit -m "[CODEX] feat(terminal): implement command parser and input handling"
   git push
   ```

5. **Add commands one by one** (COMMIT EACH!)
   ```bash
   # Implement 'ls' command
   git commit -m "[CODEX] feat(terminal): add 'ls' command with file system integration"

   # Implement 'cd' command
   git commit -m "[CODEX] feat(terminal): add 'cd' navigation command"

   # etc...
   ```

6. **Add easter eggs** (COMMIT EACH!)
   ```bash
   # Add 'hack' game
   git commit -m "[CODEX] feat(terminal): add 'hack' mainframe easter egg"

   # Add 'matrix' effect
   git commit -m "[CODEX] feat(terminal): add Matrix rain animation"
   ```

7. **Add mobile support** (COMMIT!)
   ```bash
   git commit -m "[CODEX] feat(terminal): add mobile-first full-screen mode"
   ```

8. **Polish & test** (COMMIT!)
   ```bash
   git commit -m "[CODEX] style(terminal): add CRT effects and polish"
   ```

---

## 📦 Deliverables

- Fully functional Terminal app in `app/components/Apps/Terminal/`
- All commands working and integrated with file system
- Hack game and at least 5 easter eggs
- Mobile-first implementation (Terminal = mobile default view)
- **LOTS of commits** showing your progress
- Clean, well-structured code
- No bugs, smooth performance

---

## 💡 Tips

- Start simple: Get basic terminal rendering and input working first
- Test each command as you build it
- Use existing apps (Snake, Paint) as reference for structure
- **COMMIT OFTEN!** Don't wait until it's perfect
- Have fun with easter eggs - make them memorable!
- The hack game should be impressive but doesn't need to be complex
- Mobile detection can be simple: check window width in useEffect

---

## ❓ Questions?

Check these for reference:
- Snake game: `app/components/Apps/Snake/` (for component structure)
- File system: `app/hooks/useFileSystem.ts` (for FS operations)
- Paint app: `app/components/Apps/Paint/` (for canvas/effects)

**This is your BIGGEST challenge yet, Codex!**

You're building:
1. A real working terminal
2. A game (hack simulator)
3. The entire mobile experience
4. Command parser with 15+ commands
5. Multiple easter eggs

**Take it step by step. COMMIT FREQUENTLY. You've got this!** 💪🖥️💚
