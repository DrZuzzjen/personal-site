# Mission Brief: Notepad CRUD Editor

**Agent**: Steve
**Task**: Transform Notepad into Full Text Editor with Save/Create
**Branch**: `feature/phase4-boot-sequence` (same branch)
**Status**: 🟢 READY TO START

---

## 🎯 What You're Building

Right now Notepad just **displays** text files - you can't edit or save them. Your job is to make it a **real text editor** where users can:

1. **Edit** existing .txt files
2. **Save** changes back to the file system
3. **Create** new blank files
4. **Save As** to make copies with different names

Think: Make Notepad actually useful, not just a viewer.

---

## 📋 The Tasks

### Task 1: Make Text Editable

**Current State**: Notepad has `readOnly={true}` hardcoded - can't type

**What To Do**:
1. Add state to track the text being edited:
   ```tsx
   const [editedText, setEditedText] = useState(body);
   ```

2. Make textarea editable:
   ```tsx
   <textarea
     value={editedText}
     onChange={(e) => setEditedText(e.target.value)}
     readOnly={false}  // Make it editable!
   />
   ```

3. Track if user made changes (for showing "Save" button):
   ```tsx
   const hasChanges = editedText !== body;
   ```

**Test**: Open a .txt file, you should be able to type and edit it

---

### Task 2: Add Save Button

**Where**: Add "Save" button to the status bar (next to "Word Wrap" button)

**What It Does**:
- Only enabled when user has made changes
- Saves edited text back to file system
- Shows as disabled (grayed out) when no changes

**Code**:
```tsx
import { useFileSystemContext } from '@/app/lib/FileSystemContext';

const { updateItem } = useFileSystemContext();

const handleSave = () => {
  if (!filePath) {
    // No file path = new file, need "Save As"
    alert('Please use Save As for new files');
    return;
  }

  // Update the file in file system
  const success = updateItem(filePath, { content: editedText });

  if (success) {
    // Saved! Could show a message or just update UI
    console.log('File saved!');
  } else {
    alert('Failed to save file');
  }
};

// In your status bar:
<button
  type="button"
  onClick={handleSave}
  disabled={!hasChanges}
  style={{
    ...statusButtonStyle,
    opacity: hasChanges ? 1 : 0.5,
    cursor: hasChanges ? 'pointer' : 'not-allowed'
  }}
>
  Save
</button>
```

**Test**: Edit a file, click Save, reopen the file - should show your changes

---

### Task 3: New File Button

**Where**: Add "New" button in status bar or make File menu actually work

**What It Does**:
- Creates blank notepad window
- User can type new content
- Use "Save As" to save it with a filename

**Simple Approach** - Add button:
```tsx
const { openWindow } = useWindowContext();

const handleNew = () => {
  // Open new notepad window with blank content
  openWindow({
    title: 'Untitled - Notepad',
    appType: 'notepad',
    content: {
      fileName: null,
      filePath: null,
      body: '',
      readOnly: false
    }
  });
};

<button type="button" onClick={handleNew}>New</button>
```

**Better Approach** - Make File menu work:
- Click "File" → shows dropdown
- "New" option → calls handleNew()
- "Save" option → calls handleSave()
- "Save As" option → calls handleSaveAs()

**Test**: Click New, type some text, should have blank notepad to work with

---

### Task 4: Save As (Save New Files)

**What It Does**:
- Prompts user for filename
- Creates new .txt file in /My Documents
- Saves current content to that file

**Simple Implementation** (browser prompt):
```tsx
const { createItem } = useFileSystemContext();

const handleSaveAs = () => {
  const filename = prompt('Save as:', 'Untitled.txt');
  if (!filename) return; // User cancelled

  // Make sure it ends with .txt
  const finalName = filename.endsWith('.txt') ? filename : filename + '.txt';

  // Create file in My Documents
  const newPath = `/My Documents/${finalName}`;
  const success = createItem(newPath, 'file', editedText);

  if (success) {
    alert('File saved as ' + finalName);
    // Could close this window and open the new file
  } else {
    alert('Failed to create file - maybe it already exists?');
  }
};

<button type="button" onClick={handleSaveAs}>Save As</button>
```

**Test**: Create new notepad, type "Hello World", Save As → "test.txt", check File Explorer - should see test.txt

---

### Task 5: Unsaved Changes Warning

**The Problem**: User edits file, closes window, loses changes

**The Solution**: Show warning before closing

**How**:
1. Show asterisk (*) in window title when file has unsaved changes
2. Before closing, ask "Save changes?"

**Window Title Update**:
```tsx
// In Notepad component, pass isDirty state up to parent
// Or modify window title directly:
const displayTitle = hasChanges ? `${displayName}*` : displayName;
```

**Close Warning** (optional for now):
```tsx
const handleClose = () => {
  if (hasChanges) {
    const shouldSave = confirm(`Save changes to ${displayName}?`);
    if (shouldSave) {
      handleSave();
    }
  }
  // Close window
};
```

---

### Task 6: Desktop Right-Click "New Text Document"

**Integration**: Desktop context menu should create new .txt files

**What Happens**:
1. Right-click desktop → "New" → "Text Document"
2. Creates blank .txt file on desktop: "New Text Document.txt"
3. Opens it in Notepad automatically

**You might have already done this in Phase 6!** If not:
```tsx
// In Desktop context menu handler:
case 'new-text':
  const newFilePath = '/Desktop/New Text Document.txt';
  createItem(newFilePath, 'file', '');
  // Open in notepad
  openWindow({
    title: 'New Text Document.txt - Notepad',
    appType: 'notepad',
    content: {
      fileName: 'New Text Document.txt',
      filePath: newFilePath,
      body: '',
      readOnly: false
    }
  });
  break;
```

---

## 🎨 UI Changes Summary

### Status Bar - Before:
```
Ln 1, Col 1 | 17 lines | 103 chars | 17 words    [Word Wrap: On] Read-only
```

### Status Bar - After:
```
Ln 1, Col 1 | 17 lines | 103 chars | 17 words    [New] [Save] [Save As] [Word Wrap: On]
```

Or simpler:
```
Ln 1, Col 1 | 17 lines | 103 chars    [Save] [Word Wrap: On] Modified
```

### Window Title:
- Clean file: `"Welcome.txt - Notepad"`
- Edited file: `"Welcome.txt* - Notepad"` (asterisk shows unsaved)

---

## 🔧 Key Concepts

### State Management
```tsx
const [editedText, setEditedText] = useState(body);  // What user is typing
const hasChanges = editedText !== body;              // Did they change it?
```

### FileSystem Functions You Need
```tsx
const { updateItem, createItem } = useFileSystemContext();

// Update existing file:
updateItem('/My Documents/test.txt', { content: 'new text' });

// Create new file:
createItem('/Desktop/newfile.txt', 'file', 'content here');
```

### Window Functions
```tsx
const { openWindow } = useWindowContext();

// Open new notepad:
openWindow({
  title: 'Untitled - Notepad',
  appType: 'notepad',
  content: { fileName: null, filePath: null, body: '', readOnly: false }
});
```

---

## ✅ Success Checklist

Your task is complete when:

1. ✅ Can edit text in existing .txt files
2. ✅ Save button works (updates file in file system)
3. ✅ New button creates blank notepad
4. ✅ Save As creates new files with chosen name
5. ✅ Window title shows * when file has unsaved changes
6. ✅ Right-click desktop → New Text Document works
7. ✅ No lint errors
8. ✅ All commits use `[STEVE]` prefix

**Bonus**:
- Ctrl+S keyboard shortcut for Save
- Ctrl+N for New
- Actual File menu dropdown (not just placeholder)
- Warning dialog before closing unsaved file

---

## 📝 Commit Examples

```
[STEVE] feat(notepad): make textarea editable and add save functionality
[STEVE] feat(notepad): add New and Save As buttons
[STEVE] feat(notepad): show unsaved changes indicator in title
[STEVE] fix(notepad): handle new file creation from desktop
```

---

## 🚀 Testing Steps

1. **Edit existing file**:
   - Open Welcome.txt from File Explorer
   - Edit the text
   - Click Save
   - Close and reopen - should show your edits

2. **Create new file**:
   - Click New button
   - Type "This is a test"
   - Click Save As → "mytest.txt"
   - Open File Explorer → should see mytest.txt

3. **Desktop creation**:
   - Right-click desktop → New Text Document
   - Should create file and open in Notepad
   - Type something and save

4. **Unsaved changes**:
   - Edit a file
   - Window title should show asterisk (*)
   - Save should remove asterisk

---

## 🎯 Why This Matters

Right now Notepad is just a viewer - boring! With your changes:
- Users can **write notes** while browsing the portfolio
- They can **create TODO lists**
- Actually **use** the file system
- Makes the whole experience interactive and memorable

This is the difference between a demo and a **real app**.

---

## 🎊 Quick Start

1. Pull latest: `git pull origin feature/phase4-boot-sequence`
2. Open: `app/components/Apps/Notepad/Notepad.tsx`
3. Start with Task 1 (make editable)
4. Add Save button (Task 2)
5. Add New/Save As (Tasks 3-4)
6. Polish with unsaved warning (Task 5)

**You got this, Steve!** 🚀

— Claude (Product Owner)
