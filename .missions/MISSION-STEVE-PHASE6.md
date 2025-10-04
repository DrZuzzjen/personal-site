# Mission Brief: Phase 6 - Easter Eggs & Dialogs

**Agent**: Steve
**Phase**: 6 (Easter Eggs & Error Dialogs)
**Branch**: `feature/phase4-boot-sequence` (same branch, parallel with Codex)
**Status**: 🟢 READY TO START

---

## 🎯 Mission Objective

Build the classic Windows error dialog system and fun easter eggs that make the portfolio memorable. This includes:

1. **ErrorDialog Component** - Classic Windows 3.1 error popup
2. **BSOD Component** - Fake Blue Screen of Death easter egg
3. **Easter Egg Integration** - Wire up protected actions to trigger these dialogs

---

## 📋 Requirements

### 1. ErrorDialog Component

**Location**: `app/components/Dialogs/ErrorDialog.tsx`

**Purpose**: Classic Windows error message box that appears when users try forbidden actions.

**Design Requirements**:
- Modal overlay (dark transparent background)
- Classic Windows error dialog styling:
  - Gray window with title bar "Error"
  - Warning icon (⚠️ or similar) on left side
  - Error message text (center-right)
  - Single "OK" button at bottom
  - Classic Windows button styling (raised border effect)
- Should be dismissible by clicking OK or overlay
- Center on screen, above all windows (high z-index)

**Trigger Examples**:
- Try to delete "My Documents" → "Cannot delete system folder. Nice try! 😏"
- Try to delete "My Computer" → "Error: Access denied. This is a critical system file."
- Try to drag protected desktop icons → "Cannot move system icons."

**Props Interface**:
- `message: string` - The error message to display
- `title?: string` - Dialog title (default: "Error")
- `onClose: () => void` - Callback when dismissed
- `visible: boolean` - Show/hide state

**Technical Notes**:
- Use portal rendering if needed for proper layering
- Z-index should be higher than windows but lower than BSOD
- Use COLORS constants for authentic Windows styling
- Button should have proper hover/pressed states

---

### 2. BSOD Component (Blue Screen of Death)

**Location**: `app/components/Dialogs/BSOD.tsx`

**Purpose**: Fake Windows 3.1 crash screen as an easter egg when user tries to delete critical files.

**Design Requirements**:
- Full-screen blue background (#0000AA or similar dark blue)
- White monospace text
- Classic BSOD layout:
  - Title/header message
  - Error details (can be funny/fake)
  - "Press any key to continue" at bottom
- Should cover EVERYTHING (highest z-index in app)
- Dismissible by any keypress
- Optional: Brief pause before showing "Press any key" text (1 second)

**Trigger Example**:
- Try to delete "About.txt" → Fake BSOD appears

**Sample BSOD Message** (feel free to make it funnier):
```
Windows 3.1 Portfolio Edition

A fatal exception 0xC0FFEE has occurred at 0028:C001CAFE in VXD
RESUME(01) + 00000420. The current application will be terminated.

* Press any key to continue your job search
* Press CTRL+ALT+DEL to hire me immediately

Press any key to continue _
```

**Props Interface**:
- `visible: boolean` - Show/hide state
- `onDismiss: () => void` - Callback when any key pressed
- `message?: string` - Custom BSOD message (optional, use default if not provided)

**Technical Notes**:
- Use `position: fixed` with full viewport coverage
- Z-index: 9999 (highest in app)
- Listen for keyboard events globally when visible
- Use monospace font (Courier New or similar)
- Clean up event listeners on unmount

---

### 3. Easter Egg Integration

**Where to integrate**:
- `app/hooks/useFileSystem.ts` - Add error handling to delete operations
- `app/components/Desktop/Desktop.tsx` or relevant icon drag handlers

**Protected Actions to Implement**:

1. **Delete My Documents**:
   - Check if item being deleted is "My Documents"
   - Show ErrorDialog: "Cannot delete critical system folder. Nice try! 😏"

2. **Delete About.txt**:
   - Check if item is "About.txt"
   - Trigger BSOD easter egg

3. **Delete My Computer**:
   - Check if item is "My Computer"
   - Show ErrorDialog: "Error: Access denied. This is a critical system file."

4. **Drag protected desktop icons** (optional bonus):
   - Prevent dragging system icons (My Computer, Recycle Bin)
   - Show ErrorDialog or just snap back with toast message

**Implementation Approach**:
- Add state to track which dialog is visible
- Modify delete/drag functions to check for protected items
- Return early and show appropriate dialog instead of performing action
- Use constants to define protected item names/IDs

---

## 🎨 Design Specifications

### ErrorDialog Styling

```
┌─────────────────────────────────┐
│ Error                      [×]   │
├─────────────────────────────────┤
│                                 │
│  ⚠️   Cannot delete system      │
│       folder. Nice try! 😏      │
│                                 │
│            ┌────────┐           │
│            │   OK   │           │
│            └────────┘           │
└─────────────────────────────────┘
```

- Window: Classic gray (#C0C0C0)
- Title bar: Blue gradient (#000080)
- Warning icon: Yellow/orange (⚠️)
- Button: Raised border effect (light top/left, dark bottom/right)

### BSOD Styling

```
Full screen blue background

Windows 3.1 Portfolio Edition

A fatal exception 0xC0FFEE has occurred...

* Press any key to continue...

Press any key to continue _
```

- Background: Dark blue (#0000AA)
- Text: White (#FFFFFF)
- Font: Monospace (Courier New, 16px)
- Blinking cursor at end (optional)

---

## 🔧 Technical Constraints

1. **File Organization**:
   - Create new folder: `app/components/Dialogs/`
   - Components: `ErrorDialog.tsx`, `BSOD.tsx`
   - Optional: `index.ts` for clean exports

2. **State Management**:
   - Dialog visibility can be local state in parent components
   - Or create a simple context if you prefer centralized dialog management

3. **Z-Index Hierarchy** (from COLORS or new constant):
   - Desktop: 0
   - Windows: 100-900
   - Taskbar: 1000
   - ErrorDialog overlay: 2000
   - ErrorDialog window: 2001
   - BSOD: 9999

4. **No Code Solutions**:
   - Design decisions are yours to make
   - Feel free to add extra easter eggs if inspired
   - Button styling, exact layout, animation timing - your call

---

## 📝 Communication Protocol

### Commit Format
All commits MUST start with `[STEVE]` prefix:

```
[STEVE] feat(dialogs): create ErrorDialog component
[STEVE] feat(dialogs): add BSOD easter egg component
[STEVE] feat(easter-eggs): integrate protected delete actions
[STEVE] fix(dialogs): adjust ErrorDialog z-index layering
```

### Commit Frequency
- Commit after each major component (ErrorDialog, BSOD)
- Commit after integration work
- Commit any fixes separately

### Progress Reports
Include brief notes in commit messages:
- What you built
- Any design decisions you made
- Testing notes (if applicable)

### Questions/Notes
If you have questions or want to communicate:
- Add `QUESTION:` tag in commit message, OR
- Add `NOTE:` for important decisions, OR
- Add `TODO:` for known remaining work

Example:
```
[STEVE] feat(dialogs): add ErrorDialog component

Created classic Windows error dialog with:
- Modal overlay
- Warning icon
- OK button with hover states
- Portal rendering for proper z-index

NOTE: Used fixed positioning instead of portal for simpler implementation
TODO: May need to adjust overlay opacity for better visibility
```

---

## ✅ Success Criteria

Your phase is complete when:

1. ✅ ErrorDialog component exists and renders correctly
2. ✅ BSOD component exists and covers full screen
3. ✅ Trying to delete "My Documents" shows error dialog
4. ✅ Trying to delete "About.txt" triggers BSOD
5. ✅ BSOD dismisses on any keypress
6. ✅ ErrorDialog dismisses on OK click
7. ✅ All components use authentic Windows 3.1 styling
8. ✅ No lint errors
9. ✅ All commits use `[STEVE]` prefix

**Bonus Points**:
- Add more easter eggs (get creative!)
- Animate BSOD text appearance
- Add sound effects (Windows error beep - optional)
- Blinking cursor on BSOD

---

## 🚀 Getting Started

1. **Pull latest changes** (Codex might have committed):
   ```bash
   git pull origin feature/phase4-boot-sequence
   ```

2. **Create the Dialogs folder**:
   ```bash
   mkdir app/components/Dialogs
   ```

3. **Start with ErrorDialog** (easier, builds confidence)

4. **Then build BSOD** (more fun!)

5. **Wire up easter eggs** (integration)

6. **Test everything**:
   - Try deleting protected items
   - Verify dialogs appear correctly
   - Check keyboard dismissal works
   - Ensure z-index layering is correct

7. **Commit with detailed messages**

---

## 🎯 Parallel Work Notes

- **Codex is working on**: Notepad, Minesweeper, Paint in `app/components/Apps/`
- **You own**: `app/components/Dialogs/` + easter egg integration
- **Shared files**: If you need to modify `useFileSystem.ts`, commit frequently
- **Conflicts**: Pull before push, resolve conflicts if needed

---

## 🎊 Final Note

This is the FUN phase! Easter eggs make the portfolio memorable. The user already LOVED your boot sequence - now blow their mind with a fake BSOD 😄

Be creative, have fun, and make it authentic Windows 3.1 chaos!

**Good luck, Steve!** 🚀

— Claude (Product Owner)
