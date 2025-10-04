# Mission Briefing - Codex (Window System Team)

**Your Role**: Window System Developer - Phase 2
**Target Branch**: `feature/phase2-window-system`
**Status**: Ready to execute after Phase 1 merge
**Estimated Time**: 4-6 hours of autonomous work

---

## 🚨 CRITICAL: DO THIS FIRST - GIT SETUP

**BEFORE YOU WRITE ANY CODE, RUN THESE COMMANDS:**

```bash
# 1. Make sure you're starting from main
git checkout main
git pull origin main

# 2. Verify Phase 1 files exist (if any fail, STOP and wait)
ls app/lib/types.ts
ls app/lib/constants.ts
ls app/hooks/useWindowManager.ts

# 3. Create YOUR branch (NOT Steve's branch!)
git checkout -b feature/phase2-window-system

# 4. Verify you're on the right branch
git branch
# Should show: * feature/phase2-window-system
```

**If you see `* feature/phase1-foundation`** → YOU'RE ON THE WRONG BRANCH! Go back to step 3.

**Only start coding once you see `* feature/phase2-window-system`**

---

## Context: What This Project Is

You're building a **fully functional Windows 3.1 OS simulation** as a portfolio website. This isn't a themed site - it's a complete desktop environment with draggable windows, file system, MS Paint, Minesweeper, and easter eggs.

**Your specific mission**: Build the core Window System - the draggable, minimizable, stackable windows that make this whole thing work.

---

## Prerequisites

### Required: Phase 1 Must Be Merged First

Before you start, verify these files exist on `main`:

```
✅ app/lib/types.ts (Window, App, FileSystem types)
✅ app/lib/constants.ts (colors, sizes, initial data)
✅ app/lib/WindowContext.tsx (React Context for window state)
✅ app/hooks/useWindowManager.ts (window CRUD operations)
✅ app/hooks/useFileSystem.ts (file operations)
```

**If these don't exist**: STOP. Phase 1 isn't merged yet. Wait for it.

---

## Your Mission: Phase 2 - Window System

Build the complete window component system with authentic Windows 3.1 drag behavior.

### What You're Building:

1. **Window Component** - The main draggable window
2. **Window Title Bar** - With minimize/maximize/close buttons
3. **Drag System** - Outline dragging (authentic Win3.1 behavior)
4. **Window Styles** - Pixel-perfect retro aesthetic

---

## Technical Specifications

### 1. Window Component (`app/components/Window/Window.tsx`)

**Purpose**: Main container for all app windows (Paint, Minesweeper, Notepad, etc.)

**Props Interface**:
```typescript
interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon?: string; // Icon name/path for title bar
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onClose?: () => void;
  isResizable?: boolean; // Phase 7 feature, default false for now
}
```

**Key Features**:
- Absolutely positioned (`absolute` positioning)
- Z-index management (click to bring to front)
- Classic Windows gray background (#C0C0C0)
- 2px raised border (top/left light, bottom/right dark)
- Title bar at top, content area below
- Integrates with `useWindowManager` hook for state

**Behavior**:
- **Click anywhere on window** → brings to front (increases z-index)
- **Click title bar** → starts drag mode
- **Click close button** → calls onClose, removes from window manager
- **Click minimize** → hides window, shows in taskbar (Phase 3 feature)
- **Click maximize** → toggles fullscreen (nice-to-have)

**Visual Requirements**:
```
┌─────────────────────────────┐
│ [Icon] Title          [_][□][X] │ ← Title Bar (dark blue #000080)
├─────────────────────────────┤
│                             │
│   Content Area              │ ← Gray (#C0C0C0)
│   (children rendered here)  │
│                             │
└─────────────────────────────┘
```

**Border Style** (CSS-in-JS or Tailwind):
- Top border: 2px solid #FFFFFF (white, highlight)
- Left border: 2px solid #DFDFDF (light gray)
- Bottom border: 2px solid #808080 (dark gray, shadow)
- Right border: 2px solid #000000 (black, deep shadow)

**Integration with Context**:
```typescript
const { focusWindow, updateWindowPosition, closeWindow } = useWindowManager();

// On mount: register window
// On click: focusWindow(id)
// On drag end: updateWindowPosition(id, { x, y })
// On close: closeWindow(id)
```

---

### 2. Window Title Bar (`app/components/Window/WindowTitleBar.tsx`)

**Purpose**: Title bar with app icon, title text, and control buttons

**Props Interface**:
```typescript
interface TitleBarProps {
  title: string;
  icon?: string;
  isFocused: boolean; // Active window has brighter blue
  onMouseDown: (e: React.MouseEvent) => void; // Start drag
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose: () => void;
}
```

**Visual Spec**:
- Height: 24px (authentic Win3.1 size)
- Background:
  - Focused: `#000080` (dark blue)
  - Unfocused: `#808080` (gray)
- Text: White, bold, 11px system font
- Icon: 16x16px on left (8px padding)
- Buttons: 16x16px each, right-aligned

**Control Buttons** (right to left):
1. **Close [X]** - Red on hover, always shows
2. **Maximize [□]** - Gray, optional (disabled for now)
3. **Minimize [_]** - Gray, optional (Phase 3)

**Button Style**:
```
Normal:     Hover:      Pressed:
┌─────┐    ┌─────┐    ┌─────┐
│  X  │    │  X  │    │  X  │
└─────┘    └─────┘    └─────┘
(raised)   (glow)     (sunken)
```

**Cursor**:
- Over title bar: `cursor: default` (Windows 3.1 doesn't show move cursor)
- Over buttons: `cursor: pointer`

---

### 3. Drag System (`app/components/Window/useDrag.ts`)

**CRITICAL**: This is **outline dragging** (authentic Win3.1), NOT full window dragging.

**How It Works**:
1. User clicks title bar → show dotted outline at window position
2. User drags → outline moves, actual window stays in place
3. User releases → window snaps to outline position

**Custom Hook Interface**:
```typescript
interface UseDragReturn {
  isDragging: boolean;
  outlinePosition: { x: number; y: number } | null;
  handleMouseDown: (e: React.MouseEvent) => void;
}

function useDrag(
  windowId: string,
  initialPosition: { x: number; y: number }
): UseDragReturn
```

**Implementation Logic**:

```typescript
// Pseudo-code for clarity
const useDrag = (windowId, initialPosition) => {
  const [isDragging, setIsDragging] = useState(false);
  const [outlinePos, setOutlinePos] = useState(null);
  const startPos = useRef({ x: 0, y: 0 });
  const { updateWindowPosition } = useWindowManager();

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent text selection
    e.preventDefault();

    // Record start position
    startPos.current = { x: e.clientX, y: e.clientY };

    // Show outline at current window position
    setOutlinePos(initialPosition);
    setIsDragging(true);

    // Attach global listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    // Calculate delta
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    // Update outline position
    setOutlinePos({
      x: initialPosition.x + deltaX,
      y: initialPosition.y + deltaY
    });
  };

  const handleMouseUp = () => {
    if (outlinePos) {
      // Snap window to outline position
      updateWindowPosition(windowId, outlinePos);
    }

    // Clean up
    setIsDragging(false);
    setOutlinePos(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return { isDragging, outlinePosition: outlinePos, handleMouseDown };
};
```

**Outline Rendering**:
```typescript
// In Window.tsx
const { isDragging, outlinePosition, handleMouseDown } = useDrag(id, position);

// Render outline (separate div)
{isDragging && outlinePosition && (
  <div
    style={{
      position: 'fixed',
      left: outlinePosition.x,
      top: outlinePosition.y,
      width: size.width,
      height: size.height,
      border: '2px dotted black',
      pointerEvents: 'none',
      zIndex: 9999,
    }}
  />
)}
```

**Edge Cases**:
- Prevent dragging off-screen (clamp to viewport bounds)
- Handle rapid mouse movements (don't lose tracking)
- Clean up listeners on unmount

---

### 4. Window Styles

**Tailwind Classes** (or create `Window.module.css` if preferred):

```typescript
// Title Bar (focused)
className="bg-[#000080] text-white font-bold text-[11px] h-6 flex items-center px-2 select-none"

// Title Bar (unfocused)
className="bg-gray-500 text-white font-bold text-[11px] h-6 flex items-center px-2 select-none"

// Window Border (use box-shadow for multi-tone border)
style={{
  boxShadow: `
    inset 2px 2px 0 #FFFFFF,
    inset -2px -2px 0 #000000,
    inset 3px 3px 0 #DFDFDF,
    inset -3px -3px 0 #808080
  `
}}

// Content Area
className="bg-[#C0C0C0] overflow-auto"

// Close Button (raised effect)
className="w-4 h-4 bg-[#C0C0C0] border border-gray-400 flex items-center justify-center text-black font-bold text-xs hover:bg-red-500 hover:text-white active:border-inset"
```

**Fonts**:
- Use system font stack: `font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;`
- Or use web font that looks similar (consider `@font-face` for "Perfect DOS VGA 437")

---

## Files You Should Create

```
app/
└── components/
    └── Window/
        ├── Window.tsx          (Main component, ~150 lines)
        ├── WindowTitleBar.tsx  (Title bar subcomponent, ~80 lines)
        ├── useDrag.ts          (Drag hook, ~100 lines)
        └── index.ts            (Barrel export)
```

**Optional**:
- `WindowButton.tsx` (reusable button component for min/max/close)
- `Window.module.css` (if not using Tailwind classes)

---

## Integration Points

### Using Window Manager Hook

```typescript
// In Window.tsx
import { useWindowManager } from '@/hooks/useWindowManager';

const Window: React.FC<WindowProps> = ({ id, title, children, ... }) => {
  const { windows, focusWindow, closeWindow, updateWindowPosition } = useWindowManager();

  const currentWindow = windows.find(w => w.id === id);
  const isFocused = currentWindow?.zIndex === Math.max(...windows.map(w => w.zIndex));

  const handleClick = () => focusWindow(id);
  const handleClose = () => closeWindow(id);

  // ... rest of component
};
```

### Types from Phase 1

```typescript
// You'll import these from lib/types.ts
import type { Window as WindowType, WindowPosition, WindowSize } from '@/lib/types';
```

**Expected Type Definitions** (from Phase 1):
```typescript
interface WindowType {
  id: string;
  title: string;
  appType: 'notepad' | 'paint' | 'minesweeper' | 'mycomputer';
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  icon?: string;
}
```

---

## Testing Your Work

### Manual Testing Checklist

Create a test page (`app/test-window/page.tsx`) with:

```typescript
'use client';
import { WindowProvider } from '@/lib/WindowContext';
import Window from '@/components/Window';
import { useWindowManager } from '@/hooks/useWindowManager';

function TestPage() {
  const { openWindow, windows } = useWindowManager();

  return (
    <div className="h-screen bg-teal-600 relative">
      <button
        onClick={() => openWindow({
          id: 'test-1',
          title: 'Test Window 1',
          appType: 'notepad',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 }
        })}
      >
        Open Window 1
      </button>

      <button
        onClick={() => openWindow({
          id: 'test-2',
          title: 'Test Window 2',
          appType: 'notepad',
          position: { x: 200, y: 150 },
          size: { width: 400, height: 300 }
        })}
      >
        Open Window 2
      </button>

      {windows.map(win => (
        <Window key={win.id} {...win}>
          <div className="p-4">
            <p>Test content for {win.title}</p>
          </div>
        </Window>
      ))}
    </div>
  );
}

export default function Test() {
  return (
    <WindowProvider>
      <TestPage />
    </WindowProvider>
  );
}
```

**Test Cases**:
1. ✅ Open multiple windows
2. ✅ Click window → brings to front (z-index increases)
3. ✅ Drag title bar → outline appears and follows mouse
4. ✅ Release mouse → window snaps to outline position
5. ✅ Drag near edge → clamps to viewport (doesn't go off-screen)
6. ✅ Click close button → window disappears
7. ✅ Focused window has blue title bar
8. ✅ Unfocused windows have gray title bar
9. ✅ Title bar shows correct title and icon
10. ✅ Borders look 3D (raised effect)

---

## Code Quality Requirements

### TypeScript
- ✅ All props typed with interfaces
- ✅ No `any` types (use `unknown` if needed)
- ✅ Event handlers properly typed
- ✅ Refs typed correctly

### React Best Practices
- ✅ Use functional components + hooks
- ✅ Memoize expensive calculations (`useMemo`)
- ✅ Clean up event listeners in `useEffect`
- ✅ Proper dependency arrays

### Performance
- ✅ Don't re-render all windows on every drag move
- ✅ Use CSS transforms for outline if possible
- ✅ Debounce/throttle if needed (probably not for outline drag)

### Accessibility (Nice-to-have)
- ✅ Title bar is keyboard accessible (Tab to buttons)
- ✅ Close button has aria-label="Close window"
- ✅ Window has role="dialog" or role="region"

---

## Styling Reference

### Windows 3.1 Color Palette

```css
/* From lib/constants.ts - you'll have these */
--win-gray: #C0C0C0;
--win-blue: #000080;
--win-title-text: #FFFFFF;
--win-border-light: #FFFFFF;
--win-border-highlight: #DFDFDF;
--win-border-shadow: #808080;
--win-border-dark: #000000;
--win-button-face: #C0C0C0;
```

### Border Recipe (3D Raised Effect)

**Outer Border** (window edge):
```css
border-top: 2px solid #FFFFFF;
border-left: 2px solid #DFDFDF;
border-bottom: 2px solid #000000;
border-right: 2px solid #808080;
```

**Or use box-shadow** (cleaner):
```css
box-shadow:
  inset 2px 2px 0 #FFFFFF,
  inset -2px -2px 0 #000000;
```

**Button (unpressed)**:
```css
border-top: 1px solid #FFFFFF;
border-left: 1px solid #DFDFDF;
border-bottom: 1px solid #000000;
border-right: 1px solid #808080;
```

**Button (pressed)**:
```css
border-top: 1px solid #000000;
border-left: 1px solid #808080;
border-bottom: 1px solid #FFFFFF;
border-right: 1px solid #DFDFDF;
```

---

## Git Workflow

### Before You Start

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Verify Phase 1 files exist
ls app/lib/types.ts
ls app/lib/constants.ts
ls app/lib/WindowContext.tsx
ls app/hooks/useWindowManager.ts

# If they don't exist, STOP and wait for Phase 1 merge
```

### Create Your Branch

```bash
git checkout -b feature/phase2-window-system
```

### Commit Strategy

Make **small, focused commits** as you go:

```bash
# After creating useDrag hook
git add app/components/Window/useDrag.ts
git commit -m "feat(window): add outline drag hook with viewport clamping"

# After WindowTitleBar component
git add app/components/Window/WindowTitleBar.tsx
git commit -m "feat(window): add title bar component with control buttons"

# After main Window component
git add app/components/Window/Window.tsx app/components/Window/index.ts
git commit -m "feat(window): add main Window component with drag integration"

# After test page
git add app/test-window/page.tsx
git commit -m "test: add window system test page"
```

### When Complete

```bash
# Push your branch
git push -u origin feature/phase2-window-system

# Create PR (via GitHub UI or CLI)
# Title: "Phase 2: Window System - Draggable Windows with Outline Drag"
# Description:
# - Implements Window, WindowTitleBar, and useDrag hook
# - Authentic Win3.1 outline dragging behavior
# - Full z-index management and focus handling
# - Test page at /test-window
# - Ready for Phase 3 (Desktop) integration
```

---

## Common Pitfalls & Solutions

### ❌ Problem: Windows flicker during drag
**Solution**: Use `pointer-events: none` on outline, keep window stationary

### ❌ Problem: Click on window content starts drag
**Solution**: Only attach `onMouseDown` to title bar, not whole window

### ❌ Problem: Event listeners not cleaned up
**Solution**:
```typescript
useEffect(() => {
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, []);
```

### ❌ Problem: Z-index race condition (multiple windows same z-index)
**Solution**: Use `Date.now()` or increment counter in window manager

### ❌ Problem: Dragging breaks if mouse moves too fast
**Solution**: Attach listeners to `document`, not window element

### ❌ Problem: Outline positioning is offset
**Solution**: Account for title bar height in calculations

---

## When You're Stuck

### Debug Checklist

1. **Check Phase 1 files exist** - make sure `useWindowManager` hook is available
2. **Console.log drag events** - verify mouse positions
3. **Inspect z-index values** - use React DevTools
4. **Check CSS specificity** - Tailwind might be overridden
5. **Verify event listeners attached** - check in browser DevTools

### Reference Materials

- **Windows 3.1 Screenshots**: Google "windows 3.1 desktop" for visual reference
- **CSS Borders**: Use browser inspector to debug 3D effect
- **React Drag**: Check if `react-draggable` library could simplify (optional, prefer custom)

---

## Success Criteria

Your Phase 2 is **DONE** when:

- [x] Window component renders with proper 3D borders
- [x] Title bar shows blue when focused, gray when unfocused
- [x] Clicking window brings it to front (z-index management works)
- [x] Dragging title bar shows dotted outline
- [x] Releasing mouse snaps window to outline position
- [x] Close button removes window from screen
- [x] Multiple windows can overlap and be independently managed
- [x] Test page demonstrates all features working
- [x] No TypeScript errors
- [x] No console warnings
- [x] Code is committed and pushed to `feature/phase2-window-system`

---

## After Merge: What Happens Next

Once your PR is merged, **Phase 3** will use your Window component to build:
- Desktop with icons (using your Window for "My Computer")
- Taskbar (showing minimized windows)
- File explorer (using your Window for folder views)

Your Window component is the **foundation** for everything. Make it solid! 🪟

---

## Questions During Development?

**Add comments in your code:**
```typescript
// TODO: @reviewer - Not sure if this z-index logic is optimal
// QUESTION: Should minimize hide window or just move to taskbar?
// NOTE: Using fixed positioning instead of absolute due to [reason]
```

**Or create a `NOTES.md` in your branch:**
```markdown
## Development Notes

### Decisions Made:
- Used box-shadow instead of individual borders (cleaner CSS)
- Outline drag uses fixed positioning for better performance

### Questions for Review:
- Should maximize button be functional now or in Phase 7?
- Is 24px title bar height accurate to Win3.1?

### Known Issues:
- Dragging very fast can sometimes lose mouse tracking (rare)
```

---

## Final Checklist Before PR

- [ ] All TypeScript types imported from `@/lib/types`
- [ ] All constants imported from `@/lib/constants`
- [ ] `useWindowManager` hook integrated correctly
- [ ] No hardcoded colors (use constants or Tailwind classes)
- [ ] Test page works and demonstrates all features
- [ ] Git commits are clean and descriptive
- [ ] No commented-out code or console.logs
- [ ] README.md updated with new component docs (optional)
- [ ] PHASES.md updated with checkmarks for Phase 2 tasks

---

## Code Example: Complete Window Component Skeleton

```typescript
'use client';
import React from 'react';
import { useWindowManager } from '@/hooks/useWindowManager';
import WindowTitleBar from './WindowTitleBar';
import useDrag from './useDrag';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon?: string;
  onClose?: () => void;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  icon,
  onClose
}) => {
  const { windows, focusWindow, closeWindow, updateWindowPosition } = useWindowManager();

  const currentWindow = windows.find(w => w.id === id);
  if (!currentWindow) return null;

  const { position, size, zIndex, isMinimized } = currentWindow;
  const isFocused = zIndex === Math.max(...windows.map(w => w.zIndex));

  const { isDragging, outlinePosition, handleMouseDown } = useDrag(
    id,
    position,
    (newPos) => updateWindowPosition(id, newPos)
  );

  const handleCloseClick = () => {
    closeWindow(id);
    onClose?.();
  };

  if (isMinimized) return null; // Phase 3: show in taskbar instead

  return (
    <>
      {/* Main Window */}
      <div
        className="absolute bg-[#C0C0C0]"
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          zIndex,
          boxShadow: `
            inset 2px 2px 0 #FFFFFF,
            inset -2px -2px 0 #000000
          `,
        }}
        onClick={() => focusWindow(id)}
      >
        <WindowTitleBar
          title={title}
          icon={icon}
          isFocused={isFocused}
          onMouseDown={handleMouseDown}
          onClose={handleCloseClick}
        />

        <div className="p-2 overflow-auto" style={{ height: 'calc(100% - 24px)' }}>
          {children}
        </div>
      </div>

      {/* Drag Outline */}
      {isDragging && outlinePosition && (
        <div
          className="fixed border-2 border-dashed border-black pointer-events-none"
          style={{
            left: outlinePosition.x,
            top: outlinePosition.y,
            width: size.width,
            height: size.height,
            zIndex: 9999,
          }}
        />
      )}
    </>
  );
};

export default Window;
```

---

**You got this! Build amazing windows! 🚀**

**- Claude Instance A (Foundation Team)**
