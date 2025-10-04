# Mission: Context Menu Fix + File Dragging 🖱️📁

**Agent**: Steve
**Branch**: `develop`
**Folder Boundary**: `app/components/Desktop/` ONLY

---

## 🎯 Objective

Fix desktop context menu "New" submenu and implement drag files from FileExplorer to Desktop.

---

## 📋 Part 1: Context Menu "New" Submenu

### Current Bug
- Right-click Desktop → "New" option exists
- Submenu should appear but doesn't show
- Folder/File creation functions exist in FileSystemContext
- Just need to wire up the UI

### Requirements
When user right-clicks Desktop and hovers "New":
- **Submenu appears** with options:
  - 📁 Folder
  - 📄 Text Document
  - 🖼️ Image (optional, for future)

### Submenu Behavior
- Appears to the RIGHT of "New" menu item
- Slight delay on hover (150ms feels authentic)
- Clicking option creates file/folder on desktop
- Auto-name: "New Folder", "New Text Document.txt", "New Image.png"
- Use existing `createFolder()` and `createFile()` from FileSystemContext

### Visual Style
Match existing context menu:
```tsx
<div className="absolute left-full top-0 ml-1 ...">
  <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
    {/* Menu items */}
  </div>
</div>
```

---

## 📋 Part 2: Drag Files to Desktop

### Feature Description
Drag .txt files (or any file) from FileExplorer window → Drop on Desktop → Creates desktop icon

### Requirements

#### FileExplorer Side (Source)
- Make file list items **draggable**
- On drag start: Set `dataTransfer` with file data
  ```typescript
  e.dataTransfer.setData('application/file', JSON.stringify({
    id: file.id,
    name: file.name,
    type: file.type,
    path: file.path,
  }));
  ```
- Show drag preview (native or custom)

#### Desktop Side (Target)
- Make Desktop **drop zone**
- Handle `onDragOver`: Prevent default, show visual feedback
- Handle `onDrop`:
  1. Get file data from `dataTransfer`
  2. Create desktop icon at drop position
  3. Link icon to file (store file path)
  4. Double-click icon opens file in Notepad

#### Desktop Icon Behavior
- Icon shows file name
- Position where dropped (or auto-grid position)
- Double-click opens associated app:
  - `.txt` → Notepad
  - `.png/jpg` → Paint (future)
  - `.exe` → Run app
- Store desktop icon positions in localStorage

### Technical Notes
```typescript
// FileExplorer item
<div
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('application/file', JSON.stringify(file));
  }}
>
  {file.name}
</div>

// Desktop
<div
  onDragOver={(e) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'copy';
  }}
  onDrop={(e) => {
    e.preventDefault();
    const fileData = JSON.parse(e.dataTransfer.getData('application/file'));
    createDesktopIcon(fileData, { x: e.clientX, y: e.clientY });
  }}
>
  {/* Desktop content */}
</div>
```

---

## 🚫 Constraints

### DO NOT TOUCH:
- ❌ Any files outside `app/components/Desktop/`
- ❌ App components (Paint, Notepad, etc.)
- ❌ Window management logic
- ❌ Boot sequence
- ❌ Start Menu

### DO ONLY:
- ✅ Fix Desktop context menu submenu
- ✅ Add drag handlers to FileExplorer items
- ✅ Add drop handlers to Desktop
- ✅ Create desktop icons on drop
- ✅ Wire up file opening (use existing window manager)

---

## ✅ Acceptance Criteria

### Context Menu
- [ ] Right-click Desktop → "New" → Submenu appears
- [ ] Submenu shows "Folder" and "Text Document"
- [ ] Clicking creates file/folder on desktop
- [ ] New items have default names ("New Folder", "New Text Document.txt")
- [ ] Submenu hover delay feels natural (~150ms)

### File Dragging
- [ ] Can drag file from FileExplorer
- [ ] Desktop accepts drop (shows visual feedback)
- [ ] Desktop icon created at drop position
- [ ] Icon shows correct file name and type
- [ ] Double-click icon opens file in Notepad
- [ ] Desktop icon positions persist (localStorage)
- [ ] Drag preview looks good

### Integration
- [ ] Works with existing file system
- [ ] No conflicts with other desktop interactions
- [ ] Icons can be dragged around desktop after creation
- [ ] Right-click works on dropped file icons

---

## 🚀 Getting Started

1. **Pull latest develop branch**
2. **Study existing code**:
   - `app/components/Desktop/Desktop.tsx` - Context menu logic
   - `app/components/Desktop/FileExplorer.tsx` - File list rendering
   - `app/hooks/useFileSystem.ts` - File operations
3. **Fix context menu first** (easier warm-up)
4. **Then add drag/drop** (more complex)
5. **Test edge cases**: Drop on windows, drag multiple, etc.
6. **Commit with prefix**: `[STEVE] feat(desktop): your message`

---

## 📦 Deliverables

- Context menu submenu working
- File drag from FileExplorer working
- Desktop drop zone working
- Desktop icons for dropped files
- localStorage persistence
- Clean, bug-free implementation

---

**This makes the Windows experience feel SO authentic!** 🚀

Let me know when you start and if you hit any blockers! 💪
