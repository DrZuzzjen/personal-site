# Bugs & Enhancements Tracker

## 🐛 Known Bugs

### 1. No Notepad Icon on Desktop
**Issue**: Paint.exe and Minesweeper.exe have desktop icons, but Notepad.exe doesn't
**Impact**: Users can't launch Notepad directly from desktop (must use File Explorer or Start Menu)
**Fix**: Add Notepad.exe icon to desktop initial items in constants.ts

---

## 🚀 Enhancements Needed

### 1. Window Resizing
**Feature**: Users should be able to resize windows by dragging corners/edges
**Current**: Windows are fixed size
**Requirements**:
- Drag from bottom-right corner to resize
- Maintain minimum size (e.g., 200x150px)
- Maximum size should be constrained to viewport
- Window content should adjust/reflow to new size
- Icons inside windows (if any) should rearrange

**Technical Notes**:
- Add resize handle component
- Track mouse drag on resize handle
- Update window size in WindowContext
- May need different behavior per app (Paint canvas, FileExplorer grid, etc.)

**Priority**: Medium (nice-to-have polish)

---

### 2. Drag Files from FileExplorer to Desktop
**Feature**: Drag .txt files from My Documents to Desktop (like real Windows)
**Current**: Files only exist in FileExplorer, can't drag to desktop
**Requirements**:
- Drag file item from FileExplorer window
- Drop on Desktop creates desktop icon for that file
- Double-click desktop icon opens file in Notepad
- Should work with any file type

**Technical Notes**:
- FileExplorer items need drag handlers
- Desktop needs drop zone
- Create desktop icon on drop
- Link icon to file path in FileSystemContext

**Priority**: High (feels very authentic Windows)

---

### 3. Start Menu Enhancements
**Feature Ideas**:
- Run... dialog (just for fun)
- Recent documents list
- Keyboard navigation (arrow keys)
- Submenu hover delay (feels more authentic)

**Priority**: Low (Start Menu already functional)

---

### 4. Mobile Support
**Feature**: Graceful degradation or warning for mobile users
**Current**: Probably broken on mobile/touch devices
**Options**:
- Show warning dialog: "This experience requires desktop browser"
- Simplified mobile view (just show CV content)
- Touch-friendly adaptations (bigger tap targets, no drag)

**Priority**: Medium (depends on target audience)

---

### 5. App Enhancements

#### Paint Improvements
- Shape tools (rectangle, circle, line)
- Fill bucket tool
- Undo/Redo
- Clear canvas button
- Load image from file

#### Minesweeper
- Difficulty levels (Beginner, Intermediate, Expert)
- Timer
- Flag counter
- High scores (localStorage)

#### Notepad
- Find/Replace functionality
- Print preview (just for show)
- Font size options

**Priority**: Low (apps already functional)

---

## 📋 Future Ideas

### Camera App
**Description**: Access user's webcam/mic and show in retro CRT-style frame
**Tech**: `navigator.mediaDevices.getUserMedia()`
**UI**: Old webcam aesthetic with scan lines
**Priority**: Bonus/v2

### Video Playlist (Retro TV)
**Description**: YouTube playlist embedded in old TV frame
**UI**: Wooden TV borders, antenna, dials
**Features**: Channel switching between videos
**Priority**: Bonus/v2

### Sound System
**Feature**: Windows error beep, startup sound
**Tech**: Web Audio API or embedded audio files
**Priority**: Low (polish)

---

## 🔧 Technical Debt

### Code Quality
- [ ] Add PropTypes or better TypeScript validation
- [ ] Extract common button styles to shared components
- [ ] Centralize z-index values (currently scattered)
- [ ] Add error boundaries for app components

### Performance
- [ ] Lazy load app components (don't render until window opens)
- [ ] Optimize canvas re-renders in Paint
- [ ] Debounce drag operations if laggy
- [ ] Virtual scrolling for large file lists

### Testing
- [ ] Unit tests for hooks (useWindowManager, useFileSystem)
- [ ] Integration tests for file operations
- [ ] E2E tests for critical flows (boot → open app → save file)

**Priority**: Post-launch

---

## ✅ Completed Enhancements

- ✅ Boot sequence with skip functionality
- ✅ Easter eggs (BSOD, error dialogs)
- ✅ Start Menu with Restart/Shut Down
- ✅ Context menu on desktop
- ✅ Protected file system
- ✅ Taskbar with live window buttons
- ✅ Full window management (drag, minimize, maximize, focus)

---

*Last Updated: Phase 7 - Start Menu & Polish*
