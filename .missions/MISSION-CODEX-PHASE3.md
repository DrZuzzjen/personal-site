# Mission Briefing - Codex (Taskbar & Apps Team)

**Your Role**: Taskbar & File Explorer Developer - Phase 3
**Your Partner**: Steve (working on Desktop simultaneously)
**Branch**: `feature/phase3-desktop`
**Priority**: 🔴 HIGH - Working in PARALLEL with another developer
**Estimated Time**: 3-4 hours autonomous execution

---

## 🤝 Meet Your Team

**You (Codex)**: Taskbar & Apps Developer
- You built Phase 2 Window System (draggable windows, title bars)
- You're familiar with window management and UI components
- You're building: Bottom taskbar + File Explorer window

**Steve**: Desktop Components Developer
- Built Phase 1 Foundation (types, hooks, contexts)
- Working simultaneously with you on the SAME branch
- Building: Desktop background, icons, drag-and-drop

**Claude**: Orchestrator (not coding, just coordinating)
- Reviews your work
- Helps resolve conflicts if needed
- Merges everything at the end

---

## 🚨 CRITICAL: Parallel Development Workflow

### ⚠️ YOU ARE WORKING WITH ANOTHER DEVELOPER AT THE SAME TIME

This is **realistic team development**. You WILL encounter:
- Files that you didn't create appearing suddenly
- Merge conflicts when pulling
- Lint errors from code you didn't write

**THIS IS NORMAL AND EXPECTED!**

---

## 📋 Git Workflow Rules (READ CAREFULLY)

### Rule 1: **Commit FREQUENTLY**
- After creating EACH component file → commit immediately
- Don't wait to finish everything
- Small commits = easier to merge

**Example:**
```bash
# You create Taskbar.tsx
git add app/components/Taskbar/Taskbar.tsx
git commit -m "feat(taskbar): add Taskbar container component"
git push origin feature/phase3-desktop

# Immediately after, create next file
# Then commit again
```

### Rule 2: **Pull BEFORE starting each new file**
```bash
# Before creating TaskbarButton.tsx
git pull origin feature/phase3-desktop

# If conflicts → read them, resolve, continue
# If no conflicts → great! Start coding
```

### Rule 3: **Handle Merge Conflicts Calmly**

**If you see a conflict:**
1. Open the file with conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
2. **If it's in YOUR folder** (`components/Taskbar/` or `components/Apps/`) → Fix it
3. **If it's in Steve's folder** (`components/Desktop/`) → Keep his version, don't touch it
4. **If it's in a shared file** (`page.tsx`) → Keep BOTH changes (merge them together)
5. Commit the resolution and continue

**Example conflict in page.tsx:**
```typescript
<<<<<<< HEAD
// Steve's code
<Desktop icons={desktopIcons} />
=======
// Your code
<Taskbar windows={windows} />
>>>>>>> feature/phase3-desktop
```

**Resolution (keep both):**
```typescript
<Desktop icons={desktopIcons} />
<Taskbar windows={windows} />
```

### Rule 4: **Ignore errors from files you didn't create**

**If lint/TypeScript fails:**
- Check which file has the error
- **YOUR files** (`components/Taskbar/*`, `components/Apps/*`) → Fix it
- **Steve's files** (`components/Desktop/*`) → IGNORE IT (he'll fix it)

---

## 🎯 Your Mission: Taskbar & File Explorer

### What You're Building:

**Goal**: Create the Windows 3.1 taskbar and file browsing experience

**Your Folders**:
- `app/components/Taskbar/`
- `app/components/Apps/FileExplorer/`

**DO NOT TOUCH**:
- `app/components/Desktop/` (Steve's territory)

**CAN EDIT** (carefully):
- `app/page.tsx` (to test your components - expect conflicts here!)

---

## 📦 Component Requirements

### Component 1: Taskbar Container

**File**: `app/components/Taskbar/Taskbar.tsx`

**What it should do:**
- Render fixed bar at bottom of screen (like Windows 3.1 taskbar)
- Show "Start" button on left (or Windows logo)
- Show buttons for all open windows in the middle
- Show clock on the right
- Always stay on top of other elements (high z-index)

**Visual requirements:**
- Height: ~30-40px
- Background: Light gray (#C0C0C0)
- 3D raised border effect (like window borders)
- Fixed position at bottom of viewport
- Spans full width

**Key features:**
- Display all open windows from window manager
- Each window gets a TaskbarButton
- Highlight active/focused window button
- Click button to restore/focus window
- Show clock component on right

**Think about:**
- How to get list of open windows from window manager?
- How to handle many open windows (overflow)?
- How to show which window is currently focused?
- Should minimized windows look different on taskbar?

---

### Component 2: Taskbar Button

**File**: `app/components/Taskbar/TaskbarButton.tsx`

**What it should do:**
- Represent one open window on the taskbar
- Show window title (truncated if too long)
- Show window icon (if available)
- Visual state: pressed/unpressed based on focus
- Click to restore/focus the window

**Visual requirements:**
- Width: ~150px (or flexible)
- Height: Matches taskbar height minus padding
- 3D button effect (raised when unpressed, sunken when pressed/focused)
- Text: Window title, truncated with ellipsis
- Icon: Small 16x16 icon on left

**Interactions:**
- Click → restore window if minimized, focus if not
- Active window → button looks "pressed"
- Inactive windows → button looks "raised"

**Think about:**
- How to detect which window is focused?
- How to call window manager functions on click?
- What if window title is very long?
- Should right-click show menu (Close, Minimize, etc.)?

---

### Component 3: Taskbar Clock

**File**: `app/components/Taskbar/Clock.tsx`

**What it should do:**
- Display current time (HH:MM AM/PM format)
- Update every minute (or every second for accuracy)
- Small, fits in taskbar right corner

**Visual requirements:**
- Font: Small, monospace or system font
- Color: Black text on gray background
- Padding: Small padding around text
- Width: ~60-80px fixed

**Think about:**
- How to update time automatically?
- Use `setInterval`? `requestAnimationFrame`?
- Should it show date on hover/click?
- Keep it simple - just time for now!

---

### Component 4: File Explorer

**File**: `app/components/Apps/FileExplorer/FileExplorer.tsx`

**What it should do:**
- Browse file system (folders and files)
- Display current folder contents
- Navigate into folders (double-click)
- Go back to parent folder (up button)
- Open files (double-click opens in Notepad window)

**Visual layout:**
```
┌─────────────────────────────────────┐
│ File  Edit  View  Help              │ ← Menu bar
├─────────────────────────────────────┤
│ [↑] [Path: C:\My Documents]         │ ← Navigation bar
├─────────────────────────────────────┤
│ 📁 Folder 1                         │
│ 📁 Folder 2                         │ ← File list
│ 📄 Document.txt                     │
│ 📄 README.txt                       │
└─────────────────────────────────────┘
```

**Key features:**
- Show folders and files from file system context
- Display folder icon (📁) and file icon (📄)
- Double-click folder → navigate into it
- Double-click file → open in new window (Notepad)
- Up arrow button → go to parent folder
- Show current path

**Think about:**
- How to track current folder path?
- How to get folder contents from file system context?
- How to render different icons for folders vs files?
- How to handle opening files (create Notepad window)?
- Should it show file details (size, date)?

---

## 🎨 Design Guidelines

### Windows 3.1 Aesthetic:

**Taskbar:**
```
┌────────────────────────────────────────────────────────┐
│ [▣] Start  [📝 Notepad]  [📁 My Documents]      🕐 12:45│
└────────────────────────────────────────────────────────┘
```

**Taskbar Button States:**
```
Raised (inactive):        Sunken (active):
┌─────────┐              ┌─────────┐
│▓Notepad▓│              │░Notepad░│
└─────────┘              └─────────┘
```

**File Explorer:**
- List view (simple, like Windows 3.1 File Manager)
- Folder icon: Simple folder symbol
- File icon: Document/text file symbol
- Double-click to open
- Single-click to select (optional)

**Colors** (from constants):
- Taskbar gray: `COLORS.WIN_GRAY` (#C0C0C0)
- Border highlights: Use same 3D effect as windows
- Button pressed: Inverted border shadows
- Text: Black on gray

---

## 🔧 Integration Points

### Use Existing Hooks:

**Window Manager Context:**
```typescript
import { useWindowContext } from '@/app/lib/WindowContext';

const {
  windows,              // Array of all open windows
  openWindow,           // Open a new window (e.g., Notepad for file)
  focusWindow,          // Bring window to front
  minimizeWindow        // Minimize window (optional)
} = useWindowContext();
```

**File System Context:**
```typescript
import { useFileSystemContext } from '@/app/lib/FileSystemContext';

const {
  rootItems,            // File system tree
  getItemByPath,        // Get folder/file by path
  // Functions to navigate file system
} = useFileSystemContext();
```

**Constants:**
```typescript
import { COLORS, Z_INDEX } from '@/app/lib/constants';
```

**Types:**
```typescript
import type { Window, FileSystemItem } from '@/app/lib/types';
```

---

## 🧪 Testing Your Work

### Create a Test Page:

**File**: `app/components/Taskbar/test-taskbar.tsx`

```typescript
// Simple page to test your Taskbar components in isolation
// Open some sample windows
// Render Taskbar at bottom
// Don't worry about Desktop or other components yet
```

**Test checklist:**
- [ ] Taskbar renders at bottom, full width
- [ ] Taskbar shows buttons for open windows
- [ ] Active window button looks "pressed"
- [ ] Clicking button focuses/restores window
- [ ] Clock shows current time and updates
- [ ] File Explorer can navigate folders
- [ ] Double-clicking file opens Notepad window

---

## 📝 Commit Strategy

**Commit after EACH file:**

```bash
# After Taskbar.tsx
git add app/components/Taskbar/Taskbar.tsx
git commit -m "feat(taskbar): add Taskbar container component"
git push origin feature/phase3-desktop

# After TaskbarButton.tsx
git pull origin feature/phase3-desktop  # Pull Steve's changes first!
git add app/components/Taskbar/TaskbarButton.tsx
git commit -m "feat(taskbar): add TaskbarButton with focus states"
git push origin feature/phase3-desktop

# After Clock.tsx
git pull origin feature/phase3-desktop
git add app/components/Taskbar/Clock.tsx
git commit -m "feat(taskbar): add Clock component with live updates"
git push origin feature/phase3-desktop

# After FileExplorer.tsx
git pull origin feature/phase3-desktop
git add app/components/Apps/FileExplorer/FileExplorer.tsx
git commit -m "feat(apps): add FileExplorer with folder navigation"
git push origin feature/phase3-desktop

# After integration in page.tsx
git pull origin feature/phase3-desktop
git add app/components/Taskbar/ app/page.tsx
git commit -m "feat(taskbar): integrate Taskbar in main page"
git push origin feature/phase3-desktop
```

**PULL BEFORE EVERY COMMIT!** Steve is pushing too!

---

## ⚠️ Common Issues & Solutions

### Issue 1: Steve pushed while you were coding

**Symptoms:** `git push` fails with "updates were rejected"

**Solution:**
```bash
git pull origin feature/phase3-desktop
# Resolve any conflicts
git push origin feature/phase3-desktop
```

---

### Issue 2: Merge conflict in page.tsx

**Symptoms:** Both you and Steve edited the same lines

**Solution:**
- Open `app/page.tsx`
- Find conflict markers
- **Keep BOTH your Taskbar AND Steve's Desktop**
- Delete conflict markers
- Commit

---

### Issue 3: TypeScript errors from Desktop components

**Symptoms:** `npm run lint` shows errors in `components/Desktop/`

**Solution:**
- **Ignore them!** That's Steve's code
- Only fix errors in `components/Taskbar/` and `components/Apps/`
- Your code should be error-free

---

### Issue 4: Not sure what to do about conflicts

**Solution:**
- Add a comment in code: `// TODO: @claude - merge conflict here, need help`
- Commit anyway
- Claude will help sort it out

---

## 🎯 Success Criteria

Your Phase 3 Taskbar work is **DONE** when:

- [x] Taskbar renders at bottom with proper styling
- [x] TaskbarButtons display for all open windows
- [x] Clicking button restores/focuses the window
- [x] Active window button shows "pressed" state
- [x] Clock displays current time and updates
- [x] FileExplorer can browse folders and files
- [x] Double-clicking file opens in window
- [x] All files committed with good messages
- [x] No TypeScript errors in YOUR code (`components/Taskbar/*`, `components/Apps/*`)
- [x] Conflicts with Steve resolved (or noted for Claude)

---

## 🤔 Design Decisions YOU Make

**I'm not giving you code solutions. You decide:**

1. **Taskbar Button Width**:
   - Fixed width or flexible based on number of windows?
   - Truncate long titles or wrap?
   - Show icon or just text?

2. **Clock Update Frequency**:
   - Every second or every minute?
   - Show seconds or just HH:MM?
   - 12-hour or 24-hour format?

3. **File Explorer Navigation**:
   - Show breadcrumb path or dropdown?
   - Up button or back/forward buttons?
   - List view or icon view?

4. **File Opening**:
   - Always open in new window or reuse existing?
   - What if file is already open?
   - Handle different file types (txt, pdf, exe)?

5. **Window Restoration**:
   - When clicking taskbar button, also bring to front?
   - Toggle minimize/restore on repeated clicks?
   - Flash window if already focused?

**Your call on all of these!** I trust your judgment.

---

## 💡 Tips for Success

1. **Start simple**: Get basic Taskbar rendering first, then add features
2. **Commit early, commit often**: After each file or major change
3. **Pull frequently**: Every 30 minutes, pull to get Steve's work
4. **Test in isolation**: Use your test page, don't rely on full integration yet
5. **Reuse Window component**: FileExplorer opens in your Phase 2 Window!
6. **Don't overthink**: Get it working, then make it pretty

---

## 📞 Communication

**If you encounter problems:**

Add comments in your code:
```typescript
// QUESTION @claude: Should clock update every second or every minute?
// TODO @claude: Merge conflict in page.tsx line 45
// NOTE @claude: Skipping file details for now, just showing names
```

Claude will review and respond during code review.

---

## 🚀 When You're Done

1. **Final commit**: Make sure all your work is committed
2. **Final push**: `git push origin feature/phase3-desktop`
3. **Update PHASES.md**: Mark your tasks as complete (optional)
4. **Report status**: Leave a summary comment in your last commit message

**Example final commit:**
```bash
git commit -m "feat(taskbar): complete Taskbar and FileExplorer suite

- Taskbar container with window buttons and clock
- TaskbarButton with focus states
- Clock with live time updates
- FileExplorer with folder navigation
- Integration in page.tsx
- All components tested in isolation

Ready for review and integration with Desktop (Steve's work)"
```

---

## 🎊 Final Notes

**You're building the window management UI!** The taskbar is how users interact with multiple windows. The File Explorer is how they browse their files. Make it intuitive and authentic to Windows 3.1!

**Work fast but carefully.** Steve is counting on clean code from you, and you're counting on clean code from Steve.

**Welcome to parallel development!** It's messy, it's exciting, it's real. Let's ship this! 🚢

---

**Good luck, Codex! Build an amazing taskbar! 📊**

**- Claude (Your Orchestrator)**
