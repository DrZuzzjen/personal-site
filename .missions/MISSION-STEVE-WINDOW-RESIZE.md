# Mission Brief: Window Resizing

**Agent**: Steve
**Task**: Add window resizing by dragging corners
**Branch**: `feature/window-resizing`
**Status**: 🟢 READY TO START

---

## 🎯 Mission Objective

Make windows resizable by dragging the bottom-right corner - just like real Windows 3.1!

**Current**: Windows are fixed size
**Target**: Drag corner → window resizes → content adapts

---

## 📋 Requirements

### Core Functionality

1. **Resize Handle** - Visual indicator in bottom-right corner
2. **Drag to Resize** - Mouse drag changes window width/height
3. **Minimum Size** - Can't resize smaller than content needs (e.g., 300x200px)
4. **Maximum Size** - Can't resize bigger than viewport
5. **Content Reflow** - Apps inside adjust to new size

---

## 🔨 Implementation Guide

### Step 1: Add Resize Handle to Window

**Location**: `app/components/Window/Window.tsx`

**What to add**:
```tsx
// At bottom-right corner of window
<div
  style={{
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    cursor: 'nwse-resize',
    backgroundColor: COLORS.WIN_GRAY,
    borderTop: `2px solid ${COLORS.BORDER_SHADOW}`,
    borderLeft: `2px solid ${COLORS.BORDER_SHADOW}`,
  }}
  onMouseDown={handleResizeStart}
  onClick={(e) => e.stopPropagation()} // Don't trigger window focus
/>
```

**Visual**: Small triangular grip in bottom-right corner with resize cursor

---

### Step 2: Create useWindowResize Hook

**Location**: `app/hooks/useWindowResize.ts`

**What it does**: Tracks mouse drag and calculates new window size

**Implementation**:
```tsx
import { useState, useCallback, useEffect } from 'react';

export function useWindowResize(
  windowId: string,
  initialWidth: number,
  initialHeight: number,
  minWidth = 300,
  minHeight = 200,
  onResize: (width: number, height: number) => void
) {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: initialWidth, height: initialHeight });
  }, [initialWidth, initialHeight]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      let newWidth = startSize.width + deltaX;
      let newHeight = startSize.height + deltaY;

      // Apply constraints
      newWidth = Math.max(minWidth, Math.min(newWidth, window.innerWidth - 100));
      newHeight = Math.max(minHeight, Math.min(newHeight, window.innerHeight - 100));

      onResize(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startPos, startSize, minWidth, minHeight, onResize]);

  return {
    isResizing,
    handleResizeStart
  };
}
```

---

### Step 3: Update Window Component

**Location**: `app/components/Window/Window.tsx`

**Changes needed**:

1. **Import the hook**:
```tsx
import { useWindowResize } from '@/app/hooks/useWindowResize';
```

2. **Add resize state**:
```tsx
const [dimensions, setDimensions] = useState({
  width: windowData.size.width,
  height: windowData.size.height
});
```

3. **Use the hook**:
```tsx
const { isResizing, handleResizeStart } = useWindowResize(
  windowData.id,
  dimensions.width,
  dimensions.height,
  300, // minWidth
  200, // minHeight
  (width, height) => {
    setDimensions({ width, height });
    // Optionally update WindowContext
    updateWindowSize?.(windowData.id, { width, height });
  }
);
```

4. **Apply dimensions to window**:
```tsx
<div
  style={{
    ...windowStyle,
    width: dimensions.width,
    height: dimensions.height,
  }}
>
  {/* window content */}

  {/* Resize handle at bottom */}
  <div
    onMouseDown={handleResizeStart}
    style={{ /* resize handle styles */ }}
  />
</div>
```

---

### Step 4: Update WindowContext (Optional)

**Location**: `app/hooks/useWindowManager.ts`

**Add resize function**:
```tsx
const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
  setWindows(prev =>
    prev.map(win =>
      win.id === id
        ? { ...win, size }
        : win
    )
  );
}, []);

// Add to context value
return {
  windows,
  openWindow,
  closeWindow,
  // ... other functions
  updateWindowSize, // NEW
};
```

---

### Step 5: Handle Content Reflow

**Different apps need different behavior**:

**Notepad**:
- Textarea should fill new size
- Already using `flex: 1`, should work automatically

**Paint**:
- Canvas might need fixed size OR scale
- Could redraw canvas at new dimensions
- OR just keep canvas centered/scrollable

**Minesweeper**:
- Game grid is fixed size
- Just center it in larger window
- Don't need to change game

**FileExplorer**:
- File list should expand with window
- Already using flex layout, should adapt

**Test each app** after implementing resize!

---

## 🎨 Visual Design

### Resize Handle Styles

**Option A - Grip Lines** (classic Windows):
```tsx
{/* Three diagonal lines */}
<div style={{
  position: 'absolute',
  bottom: 2,
  right: 2,
  width: 12,
  height: 12,
  background: `
    linear-gradient(135deg, transparent 40%, ${COLORS.BORDER_SHADOW} 40%, ${COLORS.BORDER_SHADOW} 45%, transparent 45%),
    linear-gradient(135deg, transparent 50%, ${COLORS.BORDER_SHADOW} 50%, ${COLORS.BORDER_SHADOW} 55%, transparent 55%),
    linear-gradient(135deg, transparent 60%, ${COLORS.BORDER_SHADOW} 60%, ${COLORS.BORDER_SHADOW} 65%, transparent 65%)
  `,
  cursor: 'nwse-resize'
}} />
```

**Option B - Simple Corner** (minimal):
```tsx
<div style={{
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 16,
  height: 16,
  borderTop: `2px solid ${COLORS.BORDER_SHADOW}`,
  borderLeft: `2px solid ${COLORS.BORDER_SHADOW}`,
  cursor: 'nwse-resize'
}} />
```

**Choose what looks best!**

---

## ✅ Success Criteria

Your task is complete when:

1. ✅ Resize handle appears in bottom-right corner of windows
2. ✅ Dragging handle resizes window
3. ✅ Minimum size enforced (can't resize too small)
4. ✅ Maximum size enforced (can't overflow viewport)
5. ✅ Notepad content reflows properly
6. ✅ Paint canvas handles resize gracefully
7. ✅ FileExplorer list expands with window
8. ✅ Cursor changes to resize cursor on hover
9. ✅ No lint errors
10. ✅ All commits use `[STEVE]` prefix

**Bonus**:
- Resize from other corners/edges (left, top, etc.)
- Show window dimensions while resizing
- Smooth animation during resize
- Remember resized dimensions in localStorage

---

## 🧪 Testing Steps

1. **Basic resize**:
   - Open any window
   - Hover bottom-right corner (cursor should change)
   - Drag corner → window should resize

2. **Minimum size**:
   - Try to resize very small
   - Should stop at minimum (300x200 or whatever you set)

3. **Maximum size**:
   - Try to resize very large
   - Should stop at viewport boundaries

4. **Content adaptation**:
   - Resize Notepad → textarea should grow/shrink
   - Resize FileExplorer → file list should adjust
   - Resize Paint → canvas should stay usable

5. **Multiple windows**:
   - Open 3 windows
   - Resize each one
   - All should work independently

---

## 📝 Commit Format

```
[STEVE] feat(window): add resize hook for drag-to-resize functionality
[STEVE] feat(window): add resize handle to window component
[STEVE] feat(window): integrate resize with WindowContext
[STEVE] fix(apps): ensure apps handle window resize properly
```

---

## 🚀 Getting Started

1. **Pull latest**: Already on `feature/window-resizing`
2. **Create hook**: Start with `useWindowResize.ts`
3. **Add handle**: Update Window component with resize grip
4. **Test basic resize**: Get it working with one window
5. **Handle constraints**: Add min/max size limits
6. **Test all apps**: Make sure content adapts
7. **Polish**: Cursor, styling, smoothness

**Estimated Time**: 2-3 hours

---

## 🎯 Why This Matters

Window resizing makes the OS feel **real**. Users expect it - it's a fundamental Windows interaction.

- Notepad too small? Resize it!
- Need bigger Paint canvas? Resize the window!
- Want to see more files? Expand FileExplorer!

This is the difference between a demo and a **professional simulation**.

**Make it smooth, make it feel right!** 🚀

— Claude (Product Owner)
