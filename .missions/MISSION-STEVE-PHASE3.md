# Mission Briefing - Steve (Desktop Components Team)

**Your Role**: Desktop UI Developer - Phase 3
**Your Partner**: Codex (working on Taskbar simultaneously)
**Branch**: `feature/phase3-desktop`
**Priority**: 🔴 HIGH - Working in PARALLEL with another developer
**Estimated Time**: 3-4 hours autonomous execution

---

## 🤝 Meet Your Team

**You (Steve)**: Desktop Components Developer
- You built Phase 1 Foundation (types, hooks, contexts)
- You're familiar with the codebase architecture
- You're building: Desktop background, icons, drag-and-drop

**Codex**: Taskbar & File Explorer Developer
- Built Phase 2 Window System (draggable windows)
- Working simultaneously with you on the SAME branch
- Building: Taskbar at bottom, file explorer window

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
# You create Desktop.tsx
git add app/components/Desktop/Desktop.tsx
git commit -m "feat(desktop): add Desktop container component"
git push origin feature/phase3-desktop

# Immediately after, create next file
# Then commit again
```

### Rule 2: **Pull BEFORE starting each new file**
```bash
# Before creating DesktopIcon.tsx
git pull origin feature/phase3-desktop

# If conflicts → read them, resolve, continue
# If no conflicts → great! Start coding
```

### Rule 3: **Handle Merge Conflicts Calmly**

**If you see a conflict:**
1. Open the file with conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
2. **If it's in YOUR folder** (`components/Desktop/`) → Fix it (keep your version usually)
3. **If it's in Codex's folder** (`components/Taskbar/`) → Keep their version, don't touch it
4. **If it's in a shared file** (`page.tsx`) → Keep BOTH changes (merge them together)
5. Commit the resolution and continue

**Example conflict in page.tsx:**
```typescript
<<<<<<< HEAD
// Your code
<Desktop icons={desktopIcons} />
=======
// Codex's code
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
- **YOUR files** (`components/Desktop/*`) → Fix it
- **Codex's files** (`components/Taskbar/*`) → IGNORE IT (he'll fix it)

---

## 🎯 Your Mission: Desktop Components

### What You're Building:

**Goal**: Create the Windows 3.1 desktop environment with draggable icons

**Your Folder**: `app/components/Desktop/`

**DO NOT TOUCH**:
- `app/components/Taskbar/` (Codex's territory)
- `app/components/Apps/FileExplorer/` (Codex's territory)

**CAN EDIT** (carefully):
- `app/page.tsx` (to test your components - expect conflicts here!)

---

## 📦 Component Requirements

### Component 1: Desktop Container

**File**: `app/components/Desktop/Desktop.tsx`

**What it should do:**
- Render the full-screen desktop background (teal color #008080)
- Position desktop icons on the screen
- Handle desktop-level events (right-click for context menu in future phases)
- Render all desktop icons passed as props

**Key features:**
- Full viewport height/width
- Absolute positioning for icons
- Handle click events on empty space (deselect all icons)
- Integrate with file system context to get icon data

**Think about:**
- How to position icons on a grid?
- How to handle icon selection state?
- How to pass icon data to DesktopIcon components?
- Should icons auto-arrange or user-controlled positions?

---

### Component 2: Desktop Icon

**File**: `app/components/Desktop/DesktopIcon.tsx`

**What it should do:**
- Display an icon with label below it (Windows 3.1 style)
- Support single-click (select) and double-click (open)
- Show selection highlight when selected
- Be draggable (user can reposition icons)

**Visual requirements:**
- Icon: 32x32px placeholder (can be colored square with text for now)
- Label: Below icon, white text with black outline/shadow for readability
- Selection: Light blue highlight background when selected
- Spacing: Icons should snap to grid when dragged

**Interactions:**
- Single click → select icon (blue highlight)
- Double click → trigger onOpen callback (opens app/folder)
- Drag → move icon, update position in state
- Click elsewhere → deselect

**Think about:**
- How to detect double-click vs single-click?
- How to implement drag with snap-to-grid?
- How to show different icons for folders vs apps vs files?

---

### Component 3: Icon Drag Hook

**File**: `app/components/Desktop/useIconDrag.ts`

**What it should do:**
- Handle icon dragging with grid snapping
- Track drag start position
- Update icon position while dragging
- Snap to grid on drag end
- Prevent dragging protected system icons

**Key features:**
- Grid-based positioning (e.g., 80x80px grid cells)
- Smooth drag preview
- Snap to nearest grid cell on drop
- Respect desktop boundaries (don't drag off-screen)

**Think about:**
- What's the grid size? (Hint: look at DESKTOP_GRID in constants)
- How to calculate grid cell from mouse position?
- Should there be visual feedback while dragging?
- How to handle overlapping icons?

---

### Component 4: Context Menu (Optional - if time permits)

**File**: `app/components/Desktop/ContextMenu.tsx`

**What it should do:**
- Show menu on right-click
- Options: "New Folder", "New Text File", "Refresh", "Properties"
- Position near mouse cursor
- Close when clicking elsewhere

**Only implement if you have extra time after core components!**

---

## 🎨 Design Guidelines

### Windows 3.1 Aesthetic:

**Desktop Icons:**
```
┌────────┐
│  ██    │  ← Icon (32x32px colored square/symbol)
│  ██    │
└────────┘
 My Comp   ← Label (white text, centered)
```

**Selected Icon:**
```
┌────────┐
│░░████░░│  ← Blue highlight background
│░░████░░│
└────────┘
 My Comp
```

**Grid Layout:**
- Icons arranged in columns from top-left
- Default spacing: 80x80px grid
- User can drag icons to any grid position

**Colors** (from constants):
- Desktop background: `COLORS.DESKTOP_TEAL` (#008080)
- Icon label: White text
- Selection highlight: Light blue/cyan
- System icons: Use different colors/symbols per type

---

## 🔧 Integration Points

### Use Existing Hooks:

**File System Context:**
```typescript
import { useFileSystemContext } from '@/app/lib/FileSystemContext';

const {
  desktopIcons,           // Array of icon data
  updateIconPosition,     // Update icon position after drag
  selectIcon,             // Mark icon as selected
  deselectAllIcons        // Clear all selections
} = useFileSystemContext();
```

**Window Manager Context:**
```typescript
import { useWindowContext } from '@/app/lib/WindowContext';

const {
  openWindow  // Call this when user double-clicks icon
} = useWindowContext();
```

**Constants:**
```typescript
import { DESKTOP_GRID, COLORS } from '@/app/lib/constants';
```

**Types:**
```typescript
import type { DesktopIcon, FileSystemItem } from '@/app/lib/types';
```

---

## 🧪 Testing Your Work

### Create a Test Page:

**File**: `app/components/Desktop/test-desktop.tsx`

```typescript
// Simple page to test your Desktop components in isolation
// Render Desktop with sample icons
// Don't worry about Taskbar or other components yet
```

**Test checklist:**
- [ ] Desktop renders full-screen with teal background
- [ ] Icons appear on desktop
- [ ] Can select icon (shows highlight)
- [ ] Can double-click icon (logs to console or opens window)
- [ ] Can drag icon to new position
- [ ] Icons snap to grid after drag
- [ ] Can deselect by clicking empty space

---

## 📝 Commit Strategy

**Commit after EACH file:**

```bash
# After Desktop.tsx
git add app/components/Desktop/Desktop.tsx
git commit -m "feat(desktop): add Desktop container component"
git push origin feature/phase3-desktop

# After DesktopIcon.tsx
git pull origin feature/phase3-desktop  # Pull Codex's changes first!
git add app/components/Desktop/DesktopIcon.tsx
git commit -m "feat(desktop): add DesktopIcon component with selection"
git push origin feature/phase3-desktop

# After useIconDrag.ts
git pull origin feature/phase3-desktop
git add app/components/Desktop/useIconDrag.ts
git commit -m "feat(desktop): add icon drag hook with grid snapping"
git push origin feature/phase3-desktop

# After test page or updates to page.tsx
git pull origin feature/phase3-desktop
git add app/components/Desktop/ app/page.tsx
git commit -m "feat(desktop): integrate Desktop in main page"
git push origin feature/phase3-desktop
```

**PULL BEFORE EVERY COMMIT!** Codex is pushing too!

---

## ⚠️ Common Issues & Solutions

### Issue 1: Codex pushed while you were coding

**Symptoms:** `git push` fails with "updates were rejected"

**Solution:**
```bash
git pull origin feature/phase3-desktop
# Resolve any conflicts
git push origin feature/phase3-desktop
```

---

### Issue 2: Merge conflict in page.tsx

**Symptoms:** Both you and Codex edited the same lines

**Solution:**
- Open `app/page.tsx`
- Find conflict markers
- **Keep BOTH your Desktop AND Codex's Taskbar**
- Delete conflict markers
- Commit

---

### Issue 3: TypeScript errors from Taskbar components

**Symptoms:** `npm run lint` shows errors in `components/Taskbar/`

**Solution:**
- **Ignore them!** That's Codex's code
- Only fix errors in `components/Desktop/`
- Your code should be error-free

---

### Issue 4: Not sure what to do about conflicts

**Solution:**
- Add a comment in code: `// TODO: @claude - merge conflict here, need help`
- Commit anyway
- Claude will help sort it out

---

## 🎯 Success Criteria

Your Phase 3 Desktop work is **DONE** when:

- [x] Desktop component renders full-screen teal background
- [x] Desktop icons appear and can be positioned
- [x] Icons show selection state (single-click)
- [x] Icons can be double-clicked to open (calls openWindow)
- [x] Icons can be dragged and repositioned
- [x] Icon positions snap to grid
- [x] All files committed with good messages
- [x] No TypeScript errors in YOUR code (`components/Desktop/*`)
- [x] Conflicts with Codex resolved (or noted for Claude)

---

## 🤔 Design Decisions YOU Make

**I'm not giving you code solutions. You decide:**

1. **Icon Grid Logic**:
   - How do you calculate grid positions?
   - What happens if two icons overlap?
   - Should icons auto-arrange or stay where user puts them?

2. **Drag Implementation**:
   - Real-time drag or outline drag (like Window)?
   - Show ghost/preview while dragging?
   - Animate snap to grid?

3. **Selection Model**:
   - Single or multi-select?
   - Shift-click to select multiple?
   - Ctrl-click to toggle?

4. **Icon Rendering**:
   - Use actual icon images or colored squares with text?
   - How to differentiate folders vs apps vs files visually?

5. **State Management**:
   - Store icon positions in localStorage?
   - Or just in React state (lost on refresh)?

**Your call on all of these!** I trust your judgment.

---

## 💡 Tips for Success

1. **Start simple**: Get a basic Desktop rendering first, then add features
2. **Commit early, commit often**: After each file or major change
3. **Pull frequently**: Every 30 minutes, pull to get Codex's work
4. **Test in isolation**: Use your test page, don't rely on full integration yet
5. **Don't overthink**: Get it working, then make it pretty
6. **Ask for help** (via comments): If stuck, note it and move on

---

## 📞 Communication

**If you encounter problems:**

Add comments in your code:
```typescript
// QUESTION @claude: Should icons persist positions to localStorage?
// TODO @claude: Merge conflict in page.tsx line 45
// NOTE @claude: Skipping multi-select for now, single-select only
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
git commit -m "feat(desktop): complete Desktop component suite

- Desktop container with full-screen background
- DesktopIcon with selection and double-click
- useIconDrag with grid snapping
- Basic integration in page.tsx
- All components tested in isolation

Ready for review and integration with Taskbar (Codex's work)"
```

---

## 🎊 Final Notes

**You're building the core desktop experience!** This is what users see first when the app loads. Make it smooth, make it authentic to Windows 3.1, and have fun with it!

**Work fast but carefully.** Codex is counting on clean code from you, and you're counting on clean code from Codex.

**Welcome to parallel development!** It's messy, it's exciting, it's real. Let's ship this! 🚢

---

**Good luck, Steve! Build an amazing desktop! 🖥️**

**- Claude (Your Orchestrator)**
