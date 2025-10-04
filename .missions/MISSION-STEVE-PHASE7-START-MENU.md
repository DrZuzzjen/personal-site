# Mission Brief: Phase 7 - Start Menu

**Agent**: Steve
**Phase**: 7 (Start Menu & System Controls)
**Branch**: `feature/phase4-boot-sequence` (same branch)
**Status**: 🟢 READY TO START

---

## 🎯 Mission Objective

Build the classic Windows 3.1 Start Menu with **functional system controls** that make the portfolio interactive and fun. The Start Menu is the command center for the entire OS - it should feel authentic and powerful.

**Key Features**:
1. **Start button** in taskbar that opens menu
2. **Programs submenu** - Launch all apps
3. **Documents submenu** - Quick access to files
4. **Find** - Search placeholder dialog
5. **Settings** - Simple background color picker
6. **Restart Windows** - Full system reset + boot sequence
7. **Shut Down** - Actually shuts down the site until refresh

---

## 📋 Requirements

### 1. Start Button (in Taskbar)

**Location**: Already exists in `app/components/Taskbar/Taskbar.tsx`

**Current State**: Button renders but does nothing

**Your Task**:
- Add click handler to toggle Start Menu visibility
- Position Start Menu above the button (anchored to bottom-left)
- Close menu when clicking outside
- Add Windows logo or "Start" text to button
- Button should look "pressed" when menu is open

---

### 2. Start Menu Component

**Location**: `app/components/StartMenu/StartMenu.tsx` (new)

**Visual Design** (classic Win 3.1):
```
┌─────────────────────────┐
│ Programs           ▶    │  ← Hover/click shows submenu
│ Documents          ▶    │  ← Hover/click shows submenu
│ Settings           ▶    │  ← Hover/click shows submenu
│─────────────────────────│
│ 🔍 Find...              │
│ ❓ Help                 │
│─────────────────────────│
│ 🔄 Restart Windows...   │
│ 🔌 Shut Down...         │
└─────────────────────────┘
```

**Styling Requirements**:
- Classic gray background (#C0C0C0)
- Raised border effect (light top/left, dark bottom/right)
- Each menu item:
  - Hover effect (blue background, white text)
  - Left-aligned text
  - Arrow (▶) for items with submenus
  - Icon (emoji or simple graphic) for visual interest
- Separator lines between sections (dark/light double line)

**Positioning**:
- Anchored to bottom-left (above Start button)
- Fixed position
- Z-index above taskbar but below dialogs
- Should not go off-screen

**Behavior**:
- Click Start button → Menu opens
- Click menu item → Perform action or open submenu
- Click outside → Menu closes
- ESC key → Menu closes

---

### 3. Programs Submenu

**Appears when**: Hover or click "Programs"

**Contents** (list of launchable apps):
- 🖼️ Paint.exe
- 💣 Minesweeper.exe
- 📝 Notepad.exe
- 🖥️ My Computer (opens File Explorer at root)
- 🗂️ File Explorer (opens at /My Documents)

**Behavior**:
- Clicking an item launches the app via `openWindow()` from WindowContext
- Closes Start Menu after launching
- Each app opens in a new window (use existing window system)

**Technical Implementation**:
- Use `useWindowContext()` hook
- Call `openWindow()` with appropriate `appType` and content
- For File Explorer, pass initial path in content

---

### 4. Documents Submenu

**Appears when**: Hover or click "Documents"

**Contents**:
- 📁 My Documents (opens File Explorer at /My Documents)
- 📄 Project_1.txt
- 📄 Project_2.txt
- 📄 Project_3.txt
- 📄 Project_4.txt
- 📄 Project_5.txt
- ─────────
- 📋 About.txt

**Behavior**:
- Clicking folder → Opens File Explorer at that location
- Clicking .txt file → Opens in Notepad window
- Show first 7-8 items, rest can be accessed via File Explorer

**Optional Enhancement**:
- Show "Recent Documents" if we track recently opened files
- For now, just hard-code the project files

---

### 5. Settings Submenu

**Appears when**: Hover or click "Settings"

**Contents** (keep it simple):
- 🎨 Change Background Color
- 🔊 Sound (placeholder - shows "Not available")
- 🖥️ Display (placeholder - shows "Not available")

**Background Color Feature**:
- Opens simple dialog/modal with color picker
- Or shows list of preset colors (teal, blue, green, purple, pink)
- Changes desktop background color
- Persists to localStorage
- Updates `Desktop.tsx` background style

**Implementation**:
- Can use native `<input type="color">` styled to look retro
- Or build custom color palette selector
- Save to localStorage: `localStorage.setItem('desktopBgColor', color)`
- Desktop component reads on mount: `localStorage.getItem('desktopBgColor') || COLORS.DESKTOP_TEAL`

---

### 6. Find (Search)

**Behavior**: Click "Find..." → Opens placeholder dialog

**Dialog Content**:
```
┌─────────────────────────┐
│ Find: Files or Folders  │
├─────────────────────────┤
│ Search for: [________]  │
│                         │
│ [Search] [Cancel]       │
│                         │
│ Coming soon!            │
└─────────────────────────┘
```

**For Now**: Just a simple modal saying "Search coming soon!" with OK button

**Future Enhancement** (optional):
- Real search through file system
- Filter files by name
- Show results in list

---

### 7. Help

**Behavior**: Click "Help" → Opens placeholder dialog or About window

**Option A** (Simple):
- Shows ErrorDialog-style popup: "Help: Double-click icons to open apps. Right-click for options. Press any key during boot to skip."

**Option B** (Cooler):
- Opens a Notepad window with help text
- Content explains how to use the portfolio

Choose whichever feels right!

---

### 8. Restart Windows ⭐

**Behavior**: Click "Restart Windows..." → Confirmation dialog → Full system reset → Boot sequence

**Flow**:
1. User clicks "Restart Windows..."
2. Show confirmation dialog:
   ```
   Restart Windows?

   This will close all programs and restart
   your computer.

   [OK] [Cancel]
   ```
3. If OK clicked:
   - Close all open windows (`closeAllWindows()` or similar)
   - Clear localStorage 'hasBooted' flag
   - Reset any game states (Minesweeper, Paint)
   - **Clear user-created desktop files** (full reset)
   - Trigger boot sequence by setting `bootComplete = false` in main page
4. Boot sequence plays → Desktop appears fresh

**Technical Implementation**:
- Add `closeAllWindows()` or `resetAll()` to WindowContext
- Clear localStorage:
  ```ts
  localStorage.removeItem('hasBooted');
  localStorage.removeItem('desktopBgColor'); // or keep this
  localStorage.removeItem('userFiles'); // if we persist user files
  ```
- Trigger re-render of page component to show boot sequence
- Can use state or force page reload: `window.location.reload()`

**Design Decision**: Should background color persist or reset? (User preference - probably persist)

---

### 9. Shut Down 🔌

**Behavior**: Click "Shut Down..." → Confirmation → Site actually "shuts down" until refresh

**Flow**:
1. User clicks "Shut Down..."
2. Show confirmation dialog:
   ```
   Shut Down Windows?

   This will close all programs and shut down
   Windows so you can safely turn off power.

   [Yes] [No]
   ```
3. If Yes clicked:
   - Show full-screen "It's now safe to turn off your computer" message
   - Classic orange text on black background
   - OR blue screen with white text
   - Stays on screen until user refreshes browser or closes tab

**Shut Down Screen Design**:
```
Full screen black background

    It's now safe to turn off
        your computer.


   (Refresh page to restart Windows)
```

**Implementation**:
- Create `ShutDownScreen.tsx` component
- Full-screen overlay (z-index: 10000)
- Black background, orange or white text
- No interactivity (user must refresh)
- Render this instead of Desktop when shut down

**Alternative**: Could allow clicking to restart, but more authentic if they have to refresh

---

## 🎨 Design Specifications

### Start Menu Styling

**Colors**:
- Background: `COLORS.WIN_GRAY` (#C0C0C0)
- Border top/left: `COLORS.BORDER_HIGHLIGHT` (white/light)
- Border bottom/right: `COLORS.BORDER_SHADOW` (dark)
- Hover: Blue background (#000080), white text
- Text: Black (#000000)
- Separator: Dark line + light line (3D effect)

**Dimensions**:
- Width: ~200px
- Item height: ~32px
- Padding: 8px
- Font: 14px, sans-serif

**Submenu Positioning**:
- Appears to the right of parent menu
- Aligned with top of hovered item
- Same styling as main menu

---

### Confirmation Dialogs

Reuse **ErrorDialog** component with customization:
- Different title: "Restart Windows" or "Shut Down Windows"
- Two buttons: [OK] [Cancel] or [Yes] [No]
- Icon: ⚠️ or 🔄 or 🔌

---

### Shut Down Screen

```css
{
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backgroundColor: #000000;
  color: #FF8C00; // Orange
  display: flex;
  alignItems: center;
  justifyContent: center;
  fontSize: 24px;
  fontFamily: monospace;
  zIndex: 10000;
}
```

---

## 🔧 Technical Constraints

### File Organization

Create new folder: `app/components/StartMenu/`

**Files**:
- `StartMenu.tsx` - Main menu component
- `StartMenuItem.tsx` - Individual menu item (reusable)
- `Submenu.tsx` - Submenu component (Programs, Documents, Settings)
- `ShutDownScreen.tsx` - Shut down overlay
- `index.ts` - Exports

### State Management

**Taskbar** needs state for:
- `isStartMenuOpen: boolean` - Toggle menu visibility

**StartMenu** needs:
- Which submenu is currently open (Programs, Documents, Settings)
- Close handler from parent
- Position coordinates

**Context Integration**:
- Use `useWindowContext()` for launching apps
- Use `useFileSystemContext()` for accessing document list
- May need to add `closeAllWindows()` to WindowContext

### Z-Index Hierarchy

- Desktop: 0
- Windows: 100-900
- Taskbar: 1000
- **Start Menu: 1500**
- ErrorDialog: 2000
- BSOD: 9999
- **Shut Down Screen: 10000**

---

## 📝 Communication Protocol

### Commit Format

All commits MUST start with `[STEVE]` prefix:

```
[STEVE] feat(start-menu): create Start Menu component
[STEVE] feat(start-menu): add Programs submenu
[STEVE] feat(start-menu): implement Restart Windows functionality
[STEVE] feat(start-menu): add Shut Down screen
[STEVE] feat(settings): add background color picker
```

### Commit Frequency

- Commit after building StartMenu component
- Commit after each submenu (Programs, Documents, Settings)
- Commit after Restart implementation
- Commit after Shut Down implementation
- Commit fixes separately

### Progress Reports

Include notes in commit messages about:
- What works
- What's pending
- Design decisions made
- Any challenges encountered

### Example Commit Message

```
[STEVE] feat(start-menu): implement Restart Windows functionality

Added full system restart capability:
- Confirmation dialog before restart
- Clears all windows and localStorage
- Triggers boot sequence again
- Tested with multiple windows open

NOTE: Background color preference persists after restart
TODO: May want to add animation during restart transition
```

---

## ✅ Success Criteria

Phase complete when:

1. ✅ Start button in taskbar toggles menu
2. ✅ Start Menu renders with all items
3. ✅ Programs submenu launches apps correctly
4. ✅ Documents submenu opens files in Notepad
5. ✅ Settings > Change Background works
6. ✅ Find shows placeholder dialog
7. ✅ Help shows info (dialog or Notepad)
8. ✅ Restart Windows → Confirmation → Reset → Boot sequence
9. ✅ Shut Down → Confirmation → "Safe to turn off" screen
10. ✅ Menu closes when clicking outside
11. ✅ All styling matches Windows 3.1 aesthetic
12. ✅ No lint errors
13. ✅ All commits use `[STEVE]` prefix

**Bonus Points**:
- Keyboard navigation (arrow keys, Enter)
- Smooth submenu transitions
- Windows startup sound (if you can find/make one)
- Easter eggs in Help text

---

## 🚀 Getting Started

1. **Pull latest changes**:
   ```bash
   git pull origin feature/phase4-boot-sequence
   ```

2. **Create StartMenu folder**:
   ```bash
   mkdir app/components/StartMenu
   ```

3. **Build order** (suggested):
   - Start with `StartMenu.tsx` basic structure
   - Add to Taskbar integration (Start button click)
   - Build `Programs` submenu (simplest)
   - Build `Documents` submenu
   - Add `Settings` background color picker
   - Build `Find` and `Help` placeholders
   - Implement `Restart Windows` (fun part!)
   - Implement `Shut Down` (dramatic finale!)

4. **Test thoroughly**:
   - Click every menu item
   - Test Restart with open windows
   - Test Shut Down screen
   - Verify boot sequence triggers correctly

---

## 🎯 Parallel Work Notes

- **Codex is enhancing**: Notepad (CRUD editor) and Paint (better tools)
- **You own**: StartMenu folder + Taskbar modifications
- **Shared files**: May need to add `closeAllWindows()` to WindowContext
- **Conflicts**: Pull before push, commit frequently

---

## 🎊 Final Note

The Start Menu is the **heart of Windows 3.1**. This is where users feel the power of the OS simulation. Make it smooth, make it authentic, and make it fun!

**Restart** lets them replay the boot sequence they loved.
**Shut Down** is a dramatic, immersive way to "end" the experience.

You're building the command center. Make it legendary! 🚀

**Good luck, Steve!**

— Claude (Product Owner)
