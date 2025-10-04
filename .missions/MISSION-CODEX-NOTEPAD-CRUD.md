# Mission Brief: Notepad CRUD Enhancement

**Agent**: Codex
**Task**: Upgrade Notepad from Read-Only to Full CRUD Editor
**Branch**: `feature/phase4-boot-sequence` (same branch)
**Status**: 🟢 READY TO START

---

## 🎯 Mission Objective

Transform the existing Notepad component from a **read-only text viewer** into a **fully functional CRUD text editor** that lets users create, edit, and save .txt files to the file system.

**Current State**: Notepad displays file content but cannot edit or save
**Target State**: Notepad can create new files, edit existing files, and save changes to FileSystemContext

---

## 📋 Requirements

### 1. Editable Mode

**Current Behavior**:
- `readOnly` prop is always `true`
- Textarea is non-editable

**Required Changes**:
- Make textarea editable when `readOnly={false}` or when creating new file
- Allow user to type and modify content
- Track "dirty" state (has unsaved changes)

**Implementation**:
- Add state: `const [editedText, setEditedText] = useState(body)`
- Update textarea: `value={editedText}` and `onChange={(e) => setEditedText(e.target.value)}`
- Track changes: `const isDirty = editedText !== body`

---

### 2. Save Functionality

**File Menu Options** (make functional):
- **Save** (Ctrl+S) - Save changes to existing file
- **Save As...** - Save as new file with different name
- **New** - Create blank new document

**Save Button in UI**:
Add "Save" button to status bar or menu bar that:
- Saves current content to file system
- Updates file via `useFileSystemContext().updateItem()`
- Clears dirty flag
- Shows confirmation (optional toast/message)

**Technical Implementation**:
```tsx
import { useFileSystemContext } from '@/app/lib/FileSystemContext';

const { updateItem, createItem } = useFileSystemContext();

const handleSave = () => {
  if (!filePath) {
    // New file - needs "Save As" dialog
    handleSaveAs();
    return;
  }

  // Update existing file
  const success = updateItem(filePath, { content: editedText });
  if (success) {
    // Clear dirty flag, show success
    // Update window title to remove asterisk
  }
};
```

---

### 3. File Menu Integration

**Make these menu items functional**:

**File Menu**:
- **New** - Close current file, open blank notepad
  - Prompt to save if dirty
  - Open new window with empty content
- **Save** - Save current file
  - If new file (no filePath), show Save As dialog
  - Otherwise, call `updateItem()`
- **Save As...** - Save with new filename
  - Show simple prompt/dialog for filename
  - Call `createItem()` with new name and content
  - Update window title
- **Close** - Close notepad window
  - Prompt to save if dirty

**Edit Menu** (optional):
- Undo/Redo (browser default is fine)
- Cut/Copy/Paste (browser default works)
- Select All (Ctrl+A works by default)

**For now**: Focus on File menu functionality. Edit/Search/Help can stay placeholders.

---

### 4. Save As Dialog

**Simple Implementation** (no fancy modal needed):
Use browser `prompt()` for filename:

```tsx
const handleSaveAs = () => {
  const filename = prompt('Save as:', fileName || 'Untitled.txt');
  if (!filename) return; // User cancelled

  const newPath = `/My Documents/${filename}`;
  const success = createItem(newPath, 'file', editedText);

  if (success) {
    // Update window to show new file
    // Close dirty flag
  }
};
```

**Better Implementation** (if time permits):
- Create simple modal dialog styled like ErrorDialog
- Input field for filename
- OK/Cancel buttons
- Validation (check if file exists)

---

### 5. Unsaved Changes Warning

**Dirty State Indicator**:
- Show asterisk (*) in window title when dirty: `"Welcome.txt*"`
- Update status bar to show "Modified" or "Unsaved changes"

**Prompt Before Close**:
When closing window or opening new file with unsaved changes:
```tsx
const handleClose = () => {
  if (isDirty) {
    const save = confirm('Save changes to ' + displayName + '?');
    if (save) {
      handleSave();
    }
  }
  // Close window via WindowContext
};
```

**Prompt Before New**:
Similar confirmation when clicking File > New

---

### 6. Create New Files from Desktop

**Context Menu Integration** (Desktop right-click):
- Right-click desktop → "New" → "Text Document"
- Creates blank .txt file on desktop
- Opens in Notepad automatically

**Implementation** (already partially done by Steve):
- Desktop context menu should have "New Text Document" option
- Calls `createItem('Desktop/New Text Document.txt', 'file', '')`
- Opens file in Notepad window via `openWindow()`

---

## 🎨 UI Updates Needed

### Status Bar Enhancement

**Current**:
```
Ln 1, Col 1 | 17 lines | 103 chars | 17 words    [Word Wrap: On] Read-only
```

**Enhanced**:
```
Ln 1, Col 1 | 17 lines | 103 chars | 17 words    [Save] [Word Wrap: On] Modified
```

Add "Save" button next to Word Wrap button:
```tsx
<button
  type="button"
  onClick={handleSave}
  disabled={!isDirty}
  style={{
    ...statusButtonStyle,
    opacity: isDirty ? 1 : 0.5,
  }}
>
  Save
</button>
```

### Window Title Update

**Current**: Shows filename in info bar
**Enhanced**: Show dirty state in window title (managed by parent component)

Pass `isDirty` state up to parent, so Window component can show:
- Clean: `"Welcome.txt - Notepad"`
- Dirty: `"Welcome.txt* - Notepad"`

---

## 🔧 Technical Implementation Guide

### State Management

```tsx
// Track edited content separately from original
const [editedText, setEditedText] = useState(body);
const [isDirty, setIsDirty] = useState(false);

// Update dirty flag when content changes
useEffect(() => {
  setIsDirty(editedText !== body);
}, [editedText, body]);

// Reset when new file loaded
useEffect(() => {
  setEditedText(body);
  setIsDirty(false);
}, [filePath]); // Reset on file change
```

### FileSystem Integration

```tsx
import { useFileSystemContext } from '@/app/lib/FileSystemContext';

const Notepad = ({ fileName, filePath, body, readOnly }: NotepadProps) => {
  const { updateItem, createItem } = useFileSystemContext();

  const handleSave = () => {
    if (!filePath) {
      handleSaveAs();
      return;
    }

    const success = updateItem(filePath, { content: editedText });
    if (success) {
      setIsDirty(false);
      // Optionally: show toast notification
    } else {
      alert('Failed to save file');
    }
  };

  const handleSaveAs = () => {
    const filename = prompt('Save as:', fileName || 'Untitled.txt');
    if (!filename) return;

    const newPath = `/My Documents/${filename}`;
    const success = createItem(newPath, 'file', editedText);

    if (success) {
      // Update window props or close/reopen with new file
      setIsDirty(false);
    }
  };
};
```

### Menu Click Handlers

```tsx
const [activeMenu, setActiveMenu] = useState<string | null>(null);

const handleMenuClick = (menu: string) => {
  if (menu === 'File') {
    setActiveMenu(activeMenu === 'File' ? null : 'File');
  }
  // Toggle menu dropdown
};

// In File menu dropdown:
<MenuItem onClick={handleSave}>Save</MenuItem>
<MenuItem onClick={handleSaveAs}>Save As...</MenuItem>
<MenuItem onClick={handleNew}>New</MenuItem>
```

---

## ✅ Success Criteria

Your enhancement is complete when:

1. ✅ Textarea is editable (when readOnly=false)
2. ✅ Can type and modify text content
3. ✅ Save button appears in status bar
4. ✅ Save button updates file in FileSystemContext
5. ✅ Dirty state tracked (asterisk in title or status bar)
6. ✅ Save As prompts for filename and creates new file
7. ✅ Unsaved changes warning before closing
8. ✅ File menu items functional (Save, Save As, New)
9. ✅ No lint errors
10. ✅ Commits use `[CODEX]` prefix

**Bonus Points**:
- Keyboard shortcuts (Ctrl+S for Save, Ctrl+N for New)
- Toast notifications for save success/failure
- Proper Save As dialog (instead of browser prompt)
- Auto-save draft to localStorage

---

## 📝 Communication Protocol

### Commit Format

All commits MUST start with `[CODEX]` prefix:

```
[CODEX] feat(notepad): add editable mode and save functionality
[CODEX] feat(notepad): implement Save As with file creation
[CODEX] feat(notepad): add unsaved changes warning
[CODEX] fix(notepad): handle new file creation properly
```

### Commit Frequency

- Commit after making textarea editable
- Commit after adding Save functionality
- Commit after Save As implementation
- Commit after unsaved changes warning

### Progress Reports

Include brief notes:
```
[CODEX] feat(notepad): add editable mode and save functionality

Made Notepad fully editable:
- Textarea now editable when readOnly=false
- Added editedText state tracking
- Save button in status bar
- Integrated with FileSystemContext.updateItem()

Tested: Can edit Welcome.txt and save changes successfully
TODO: Add Save As dialog for new files
```

---

## 🚀 Getting Started

1. **Pull latest changes**:
   ```bash
   git pull origin feature/phase4-boot-sequence
   ```

2. **Current file**: `app/components/Apps/Notepad/Notepad.tsx`

3. **Test file**: Open a .txt file from File Explorer, verify it's read-only

4. **Start coding**:
   - Add editable state
   - Add Save button
   - Test saving changes
   - Add Save As functionality
   - Test creating new files

5. **Test scenarios**:
   - Open existing file → Edit → Save → Reopen (should show changes)
   - Create new file → Type content → Save As → Check in File Explorer
   - Edit file → Try to close → Should warn about unsaved changes
   - Right-click desktop → New Text Document → Opens in Notepad

---

## 🎯 Integration Notes

**Steve is working on**: Start Menu (separate folder, no conflicts)

**You own**: Notepad.tsx only

**Shared concerns**:
- FileSystemContext (already exists, just use it)
- WindowContext (for closing windows if needed)

No conflicts expected. Commit frequently!

---

## 🎊 Final Note

This upgrade transforms Notepad from a simple viewer into a **real text editor**. Users will be able to create notes, write TODO lists, and actually USE the file system.

This makes the portfolio interactive and memorable - visitors can leave notes, create files, and truly explore the OS.

**Make it work, make it smooth!** 🚀

— Claude (Product Owner)
