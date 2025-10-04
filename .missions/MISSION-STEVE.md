# Mission Briefing - Steve (Foundation Team)

**Your Role**: Foundation Engineer - Phase 1
**Branch**: `feature/phase1-foundation`
**Priority**: 🔴 CRITICAL - Codex is waiting on your work
**Estimated Time**: 2-3 hours autonomous execution

---

## Mission Overview

You're building the **architectural foundation** for a Windows 3.1 OS simulation portfolio site. Your job is to create the TypeScript types, constants, hooks, and context providers that ALL other phases depend on.

**Think of yourself as building the API contracts.** Codex (Phase 2) and future developers will consume what you create.

---

## What You're Building

### Foundation Layer:
1. **Type Definitions** (`app/lib/types.ts`) - TypeScript interfaces for everything
2. **Constants** (`app/lib/constants.ts`) - Colors, sizes, initial data
3. **Window Manager** (`app/hooks/useWindowManager.ts`) - Window state & operations
4. **File System** (`app/hooks/useFileSystem.ts`) - File CRUD operations
5. **Contexts** (`app/lib/WindowContext.tsx`, `app/lib/FileSystemContext.tsx`) - React state providers

---

## File 1: Type Definitions (`app/lib/types.ts`)

**Purpose**: Single source of truth for all TypeScript types

```typescript
// ============================================
// WINDOW SYSTEM TYPES
// ============================================

export type AppType = 'notepad' | 'paint' | 'minesweeper' | 'mycomputer' | 'explorer';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface Window {
  id: string;
  title: string;
  appType: AppType;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  icon?: string;
  content?: any; // App-specific content (file data, paint canvas state, etc.)
}

// ============================================
// FILE SYSTEM TYPES
// ============================================

export type FileType = 'file' | 'folder';
export type FileExtension = 'txt' | 'exe' | 'pdf' | 'folder' | null;

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  extension: FileExtension | null;
  path: string; // e.g., "/Desktop/My Documents/Project1.txt"
  content?: string; // For text files
  children?: FileSystemItem[]; // For folders
  isProtected: boolean; // Cannot be deleted/moved
  isSystem: boolean; // System files (My Computer, Recycle Bin)
  icon?: string; // Icon name or path
  createdAt: number; // Timestamp
  modifiedAt: number; // Timestamp
}

export interface DesktopIcon {
  id: string;
  fileSystemId: string; // Reference to FileSystemItem
  position: { x: number; y: number }; // Desktop grid position
  isSelected: boolean;
}

// ============================================
// APP-SPECIFIC TYPES
// ============================================

// Paint App
export type PaintTool = 'pencil' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'select';

export interface PaintState {
  currentTool: PaintTool;
  currentColor: string;
  brushSize: number;
  canvasData?: ImageData;
}

// Minesweeper
export type CellState = 'hidden' | 'revealed' | 'flagged';

export interface MinesweeperCell {
  isMine: boolean;
  adjacentMines: number;
  state: CellState;
}

export interface MinesweeperState {
  grid: MinesweeperCell[][];
  gameStatus: 'playing' | 'won' | 'lost';
  mineCount: number;
  flagCount: number;
}

// ============================================
// CONTEXT/HOOK RETURN TYPES
// ============================================

export interface WindowManagerContext {
  windows: Window[];
  openWindow: (window: Omit<Window, 'id' | 'zIndex' | 'isMinimized' | 'isMaximized'>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize) => void;
  updateWindowContent: (id: string, content: any) => void;
}

export interface FileSystemContext {
  rootItems: FileSystemItem[];
  desktopIcons: DesktopIcon[];
  createFile: (parentPath: string, name: string, content?: string) => void;
  createFolder: (parentPath: string, name: string) => void;
  deleteItem: (path: string) => boolean; // Returns false if protected
  moveItem: (fromPath: string, toPath: string) => boolean;
  getItemByPath: (path: string) => FileSystemItem | null;
  updateIconPosition: (iconId: string, position: { x: number; y: number }) => void;
  selectIcon: (iconId: string) => void;
  deselectAllIcons: () => void;
}
```

---

## File 2: Constants (`app/lib/constants.ts`)

**Purpose**: All magic numbers, colors, and initial data

```typescript
import type { FileSystemItem, DesktopIcon } from './types';

// ============================================
// VISUAL CONSTANTS
// ============================================

export const COLORS = {
  // Windows 3.1 System Colors
  WIN_GRAY: '#C0C0C0',
  WIN_BLUE: '#000080',
  WIN_BLUE_LIGHT: '#0000FF',
  WIN_WHITE: '#FFFFFF',
  WIN_BLACK: '#000000',

  // Border Colors (3D effect)
  BORDER_LIGHT: '#FFFFFF',
  BORDER_HIGHLIGHT: '#DFDFDF',
  BORDER_SHADOW: '#808080',
  BORDER_DARK: '#000000',

  // Desktop
  DESKTOP_TEAL: '#008080',

  // Text
  TEXT_WHITE: '#FFFFFF',
  TEXT_BLACK: '#000000',
} as const;

export const WINDOW_DEFAULTS = {
  TITLE_BAR_HEIGHT: 24,
  MIN_WIDTH: 200,
  MIN_HEIGHT: 150,
  DEFAULT_WIDTH: 400,
  DEFAULT_HEIGHT: 300,
  BORDER_WIDTH: 2,
} as const;

export const DESKTOP_GRID = {
  ICON_WIDTH: 80,
  ICON_HEIGHT: 80,
  ICON_SPACING: 10,
} as const;

export const Z_INDEX = {
  DESKTOP: 0,
  WINDOW_BASE: 100,
  DRAG_OUTLINE: 9999,
  TASKBAR: 10000,
  MODAL: 10001,
} as const;

// ============================================
// BOOT SEQUENCE MESSAGES
// ============================================

export const BOOT_MESSAGES = [
  'Phoenix BIOS v3.1.0',
  'Copyright (C) 1985-1992 Phoenix Technologies Ltd.',
  '',
  'Detecting hardware...',
  '  CPU: Intel 80486DX @ 33MHz',
  '  RAM: 4096 KB OK',
  '  Detecting creativity... FOUND',
  '  Loading personality drivers... OK',
  '  Initializing humor.dll... SUCCESS',
  '  Calibrating mouse... DOUBLE-CLICK DETECTED',
  '  Mounting resume.pdf... READY',
  '',
  'Press any key to continue...',
] as const;

export const LOADING_MESSAGES = [
  'Loading Windows 3.1...',
  'Initializing workspace...',
  'Preparing desktop environment...',
  'Almost there...',
] as const;

// ============================================
// INITIAL FILE SYSTEM
// ============================================

export const INITIAL_FILE_SYSTEM: FileSystemItem[] = [
  {
    id: 'my-computer',
    name: 'My Computer',
    type: 'folder',
    extension: 'folder',
    path: '/My Computer',
    isProtected: true,
    isSystem: true,
    icon: 'computer',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    children: [
      {
        id: 'about-txt',
        name: 'About.txt',
        type: 'file',
        extension: 'txt',
        path: '/My Computer/About.txt',
        content: `[Your Name]
Software Developer | Full-Stack Engineer

LinkedIn: [your-linkedin-url]
GitHub: [your-github-url]
X/Twitter: [your-x-url]

---

Welcome to my Windows 3.1 portfolio! This entire site is a functional OS simulation built with Next.js, TypeScript, and Tailwind CSS.

Check out My Documents for project details, or play some Minesweeper while you're here!`,
        isProtected: true,
        isSystem: false,
        icon: 'notepad',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: 'my-documents',
        name: 'My Documents',
        type: 'folder',
        extension: 'folder',
        path: '/My Computer/My Documents',
        isProtected: true,
        isSystem: false,
        icon: 'folder',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        children: [
          {
            id: 'project-1',
            name: 'Project_1.txt',
            type: 'file',
            extension: 'txt',
            path: '/My Computer/My Documents/Project_1.txt',
            content: `Project Name: [Your Project]
Tech Stack: Next.js, TypeScript, Tailwind
GitHub: [repo-url]

Description:
[Your project description here]

Key Features:
- Feature 1
- Feature 2
- Feature 3`,
            isProtected: false,
            isSystem: false,
            icon: 'notepad',
            createdAt: Date.now(),
            modifiedAt: Date.now(),
          },
          {
            id: 'project-2',
            name: 'Project_2.txt',
            type: 'file',
            extension: 'txt',
            path: '/My Computer/My Documents/Project_2.txt',
            content: 'Project 2 details... (to be filled in Phase 6)',
            isProtected: false,
            isSystem: false,
            icon: 'notepad',
            createdAt: Date.now(),
            modifiedAt: Date.now(),
          },
          {
            id: 'project-3',
            name: 'Project_3.txt',
            type: 'file',
            extension: 'txt',
            path: '/My Computer/My Documents/Project_3.txt',
            content: 'Project 3 details... (to be filled in Phase 6)',
            isProtected: false,
            isSystem: false,
            icon: 'notepad',
            createdAt: Date.now(),
            modifiedAt: Date.now(),
          },
          {
            id: 'project-4',
            name: 'Project_4.txt',
            type: 'file',
            extension: 'txt',
            path: '/My Computer/My Documents/Project_4.txt',
            content: 'Project 4 details... (to be filled in Phase 6)',
            isProtected: false,
            isSystem: false,
            icon: 'notepad',
            createdAt: Date.now(),
            modifiedAt: Date.now(),
          },
          {
            id: 'project-5',
            name: 'Project_5.txt',
            type: 'file',
            extension: 'txt',
            path: '/My Computer/My Documents/Project_5.txt',
            content: 'Project 5 details... (to be filled in Phase 6)',
            isProtected: false,
            isSystem: false,
            icon: 'notepad',
            createdAt: Date.now(),
            modifiedAt: Date.now(),
          },
        ],
      },
      {
        id: 'floppy-drive',
        name: 'A:\\',
        type: 'folder',
        extension: 'folder',
        path: '/My Computer/A:',
        isProtected: true,
        isSystem: true,
        icon: 'floppy',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        children: [
          {
            id: 'resume-pdf',
            name: 'Resume.pdf',
            type: 'file',
            extension: 'pdf',
            path: '/My Computer/A:/Resume.pdf',
            content: '[PDF download link - to be added in Phase 6]',
            isProtected: true,
            isSystem: false,
            icon: 'pdf',
            createdAt: Date.now(),
            modifiedAt: Date.now(),
          },
        ],
      },
    ],
  },
  {
    id: 'recycle-bin',
    name: 'Recycle Bin',
    type: 'folder',
    extension: 'folder',
    path: '/Recycle Bin',
    isProtected: true,
    isSystem: true,
    icon: 'recycle-bin',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    children: [],
  },
];

// ============================================
// INITIAL DESKTOP ICONS
// ============================================

export const INITIAL_DESKTOP_ICONS: DesktopIcon[] = [
  {
    id: 'desktop-icon-my-computer',
    fileSystemId: 'my-computer',
    position: { x: 0, y: 0 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-recycle-bin',
    fileSystemId: 'recycle-bin',
    position: { x: 0, y: 1 },
    isSelected: false,
  },
];

// ============================================
// APP EXECUTABLES (Desktop Icons)
// ============================================

export const APP_EXECUTABLES: FileSystemItem[] = [
  {
    id: 'paint-exe',
    name: 'Paint.exe',
    type: 'file',
    extension: 'exe',
    path: '/Desktop/Paint.exe',
    isProtected: true,
    isSystem: true,
    icon: 'paint',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'minesweeper-exe',
    name: 'Minesweeper.exe',
    type: 'file',
    extension: 'exe',
    path: '/Desktop/Minesweeper.exe',
    isProtected: true,
    isSystem: true,
    icon: 'minesweeper',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
];

// Desktop icons for executables
export const APP_DESKTOP_ICONS: DesktopIcon[] = [
  {
    id: 'desktop-icon-paint',
    fileSystemId: 'paint-exe',
    position: { x: 0, y: 2 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-minesweeper',
    fileSystemId: 'minesweeper-exe',
    position: { x: 0, y: 3 },
    isSelected: false,
  },
];

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  DELETE_PROTECTED: 'Cannot delete this item. It is a protected system file or folder.',
  DELETE_MY_DOCUMENTS: 'Error: Cannot delete critical system folder. Nice try! 😏',
  DELETE_ABOUT: 'Critical system file! Deleting this would cause a catastrophic failure...',
  ACCESS_DENIED: 'Access Denied',
  INVALID_PATH: 'The system cannot find the path specified.',
} as const;

// ============================================
// EASTER EGG MESSAGES
// ============================================

export const EASTER_EGGS = {
  BSOD_TITLE: 'Windows',
  BSOD_MESSAGE: `A fatal exception 0E has occurred at 0028:C001E36 in VXD VMM(01) + 00010E36. The current application will be terminated.

  * Press any key to terminate the current application.
  * Press CTRL+ALT+DEL again to restart your computer. You will lose any unsaved information in all applications.

Just kidding! This is a portfolio site. Everything's fine. 😄

Press any key to continue...`,
} as const;
```

---

## File 3: Window Manager Hook (`app/hooks/useWindowManager.ts`)

**Purpose**: Manages all open windows (create, close, focus, move, etc.)

```typescript
'use client';
import { useState, useCallback } from 'react';
import type { Window, WindowPosition, WindowSize } from '@/lib/types';
import { Z_INDEX } from '@/lib/constants';

export function useWindowManager() {
  const [windows, setWindows] = useState<Window[]>([]);
  const [nextZIndex, setNextZIndex] = useState(Z_INDEX.WINDOW_BASE);

  // Open a new window
  const openWindow = useCallback((
    windowData: Omit<Window, 'id' | 'zIndex' | 'isMinimized' | 'isMaximized'>
  ): string => {
    const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newWindow: Window = {
      ...windowData,
      id,
      zIndex: nextZIndex,
      isMinimized: false,
      isMaximized: false,
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);

    return id;
  }, [nextZIndex]);

  // Close a window
  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  // Minimize a window
  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  }, []);

  // Maximize a window (toggle)
  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  }, []);

  // Focus a window (bring to front)
  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      const window = prev.find(w => w.id === id);
      if (!window) return prev;

      // If already at top, no change
      const maxZ = Math.max(...prev.map(w => w.zIndex));
      if (window.zIndex === maxZ) return prev;

      // Bring to front
      return prev.map(w =>
        w.id === id ? { ...w, zIndex: nextZIndex } : w
      );
    });
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  // Update window position (called after drag)
  const updateWindowPosition = useCallback((id: string, position: WindowPosition) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, position } : w))
    );
  }, []);

  // Update window size (for resize feature in Phase 7)
  const updateWindowSize = useCallback((id: string, size: WindowSize) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, size } : w))
    );
  }, []);

  // Update window content (for apps to store state)
  const updateWindowContent = useCallback((id: string, content: any) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, content } : w))
    );
  }, []);

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    updateWindowContent,
  };
}
```

---

## File 4: File System Hook (`app/hooks/useFileSystem.ts`)

**Purpose**: Manages file system state and operations

```typescript
'use client';
import { useState, useCallback } from 'react';
import type { FileSystemItem, DesktopIcon } from '@/lib/types';
import { INITIAL_FILE_SYSTEM, INITIAL_DESKTOP_ICONS, APP_EXECUTABLES, APP_DESKTOP_ICONS } from '@/lib/constants';

export function useFileSystem() {
  const [rootItems, setRootItems] = useState<FileSystemItem[]>([
    ...INITIAL_FILE_SYSTEM,
    ...APP_EXECUTABLES,
  ]);

  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>([
    ...INITIAL_DESKTOP_ICONS,
    ...APP_DESKTOP_ICONS,
  ]);

  // Helper: Find item by path (recursive)
  const getItemByPath = useCallback((path: string): FileSystemItem | null => {
    const findInTree = (items: FileSystemItem[], targetPath: string): FileSystemItem | null => {
      for (const item of items) {
        if (item.path === targetPath) return item;
        if (item.children) {
          const found = findInTree(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(rootItems, path);
  }, [rootItems]);

  // Create a file
  const createFile = useCallback((parentPath: string, name: string, content: string = '') => {
    const parent = getItemByPath(parentPath);
    if (!parent || parent.type !== 'folder') return;

    const newFile: FileSystemItem = {
      id: `file-${Date.now()}`,
      name,
      type: 'file',
      extension: name.split('.').pop() as any || null,
      path: `${parentPath}/${name}`,
      content,
      isProtected: false,
      isSystem: false,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };

    setRootItems(prev => {
      const addToTree = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
          if (item.path === parentPath) {
            return {
              ...item,
              children: [...(item.children || []), newFile],
            };
          }
          if (item.children) {
            return { ...item, children: addToTree(item.children) };
          }
          return item;
        });
      };
      return addToTree(prev);
    });
  }, [getItemByPath]);

  // Create a folder
  const createFolder = useCallback((parentPath: string, name: string) => {
    const parent = getItemByPath(parentPath);
    if (!parent || parent.type !== 'folder') return;

    const newFolder: FileSystemItem = {
      id: `folder-${Date.now()}`,
      name,
      type: 'folder',
      extension: 'folder',
      path: `${parentPath}/${name}`,
      children: [],
      isProtected: false,
      isSystem: false,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };

    setRootItems(prev => {
      const addToTree = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
          if (item.path === parentPath) {
            return {
              ...item,
              children: [...(item.children || []), newFolder],
            };
          }
          if (item.children) {
            return { ...item, children: addToTree(item.children) };
          }
          return item;
        });
      };
      return addToTree(prev);
    });
  }, [getItemByPath]);

  // Delete an item (returns false if protected)
  const deleteItem = useCallback((path: string): boolean => {
    const item = getItemByPath(path);
    if (!item || item.isProtected) return false;

    setRootItems(prev => {
      const removeFromTree = (items: FileSystemItem[]): FileSystemItem[] => {
        return items
          .filter(item => item.path !== path)
          .map(item => ({
            ...item,
            children: item.children ? removeFromTree(item.children) : undefined,
          }));
      };
      return removeFromTree(prev);
    });

    return true;
  }, [getItemByPath]);

  // Move an item (simple version - Phase 7 feature)
  const moveItem = useCallback((fromPath: string, toPath: string): boolean => {
    // TODO: Implement in Phase 7 if needed
    console.warn('moveItem not yet implemented');
    return false;
  }, []);

  // Update desktop icon position
  const updateIconPosition = useCallback((iconId: string, position: { x: number; y: number }) => {
    setDesktopIcons(prev =>
      prev.map(icon =>
        icon.id === iconId ? { ...icon, position } : icon
      )
    );
  }, []);

  // Select an icon
  const selectIcon = useCallback((iconId: string) => {
    setDesktopIcons(prev =>
      prev.map(icon =>
        icon.id === iconId ? { ...icon, isSelected: true } : icon
      )
    );
  }, []);

  // Deselect all icons
  const deselectAllIcons = useCallback(() => {
    setDesktopIcons(prev =>
      prev.map(icon => ({ ...icon, isSelected: false }))
    );
  }, []);

  return {
    rootItems,
    desktopIcons,
    createFile,
    createFolder,
    deleteItem,
    moveItem,
    getItemByPath,
    updateIconPosition,
    selectIcon,
    deselectAllIcons,
  };
}
```

---

## File 5: Window Context (`app/lib/WindowContext.tsx`)

**Purpose**: React Context wrapper for window manager

```typescript
'use client';
import React, { createContext, useContext, type ReactNode } from 'react';
import { useWindowManager } from '@/hooks/useWindowManager';
import type { WindowManagerContext } from './types';

const WindowContext = createContext<WindowManagerContext | undefined>(undefined);

export function WindowProvider({ children }: { children: ReactNode }) {
  const windowManager = useWindowManager();

  return (
    <WindowContext.Provider value={windowManager}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindowContext() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindowContext must be used within WindowProvider');
  }
  return context;
}

// Re-export for convenience
export { useWindowManager };
```

---

## File 6: File System Context (`app/lib/FileSystemContext.tsx`)

**Purpose**: React Context wrapper for file system

```typescript
'use client';
import React, { createContext, useContext, type ReactNode } from 'react';
import { useFileSystem } from '@/hooks/useFileSystem';
import type { FileSystemContext as FileSystemContextType } from './types';

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const fileSystem = useFileSystem();

  return (
    <FileSystemContext.Provider value={fileSystem}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystemContext() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystemContext must be used within FileSystemProvider');
  }
  return context;
}

// Re-export for convenience
export { useFileSystem };
```

---

## File 7: Root Layout Integration (`app/layout.tsx`)

**Purpose**: Wrap entire app with context providers

**IMPORTANT**: Edit the existing `app/layout.tsx` to add providers:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WindowProvider } from "@/lib/WindowContext";
import { FileSystemProvider } from "@/lib/FileSystemContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Windows 3.1 Portfolio",
  description: "A fully functional Windows 3.1 OS simulation portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WindowProvider>
          <FileSystemProvider>
            {children}
          </FileSystemProvider>
        </WindowProvider>
      </body>
    </html>
  );
}
```

---

## Folder Structure You're Creating

```
app/
├── lib/
│   ├── types.ts                    (NEW - ~200 lines)
│   ├── constants.ts                (NEW - ~250 lines)
│   ├── WindowContext.tsx           (NEW - ~30 lines)
│   └── FileSystemContext.tsx       (NEW - ~30 lines)
├── hooks/
│   ├── useWindowManager.ts         (NEW - ~100 lines)
│   └── useFileSystem.ts            (NEW - ~150 lines)
└── layout.tsx                      (EDIT - add providers)
```

**Total**: ~760 lines of TypeScript across 7 files

---

## Git Workflow

### Step 1: Setup
```bash
# Ensure you're on main
git checkout main
git pull origin main

# Create your branch
git checkout -b feature/phase1-foundation
```

### Step 2: Create Files

Create files in this order:
1. `app/lib/types.ts` (no dependencies)
2. `app/lib/constants.ts` (imports types)
3. `app/hooks/useWindowManager.ts` (imports types + constants)
4. `app/hooks/useFileSystem.ts` (imports types + constants)
5. `app/lib/WindowContext.tsx` (imports hook)
6. `app/lib/FileSystemContext.tsx` (imports hook)
7. Edit `app/layout.tsx` (imports contexts)

### Step 3: Commit Strategy

```bash
# After types
git add app/lib/types.ts
git commit -m "feat(foundation): add TypeScript type definitions"

# After constants
git add app/lib/constants.ts
git commit -m "feat(foundation): add constants for colors, sizes, initial data"

# After window manager
git add app/hooks/useWindowManager.ts
git commit -m "feat(foundation): add window manager hook"

# After file system
git add app/hooks/useFileSystem.ts
git commit -m "feat(foundation): add file system hook with CRUD operations"

# After contexts
git add app/lib/WindowContext.tsx app/lib/FileSystemContext.tsx
git commit -m "feat(foundation): add React context providers"

# After layout
git add app/layout.tsx
git commit -m "feat(foundation): integrate providers in root layout"
```

### Step 4: Push and Create PR

```bash
git push -u origin feature/phase1-foundation
```

**PR Title**: "Phase 1: Foundation - Types, Constants, Hooks & Contexts"

**PR Description**:
```markdown
## Phase 1: Foundation Layer

This PR establishes the architectural foundation for the Windows 3.1 portfolio project.

### What's Included:
- ✅ TypeScript type definitions (`types.ts`)
- ✅ Constants for colors, sizes, boot messages, initial file system (`constants.ts`)
- ✅ Window manager hook with CRUD operations (`useWindowManager.ts`)
- ✅ File system hook with file/folder operations (`useFileSystem.ts`)
- ✅ React context providers (`WindowContext.tsx`, `FileSystemContext.tsx`)
- ✅ Root layout integration

### Tested:
- All types compile without errors
- Hooks can be imported and used
- Contexts wrap app correctly

### Next Steps:
- Phase 2 (Codex) will use these types to build Window components
- Phase 3 will use file system hooks for Desktop icons

### Dependencies:
None - this is the foundation!
```

---

## Testing Your Work

### Create Test Page (`app/test-foundation/page.tsx`)

```typescript
'use client';
import { useWindowContext } from '@/lib/WindowContext';
import { useFileSystemContext } from '@/lib/FileSystemContext';

export default function TestFoundation() {
  const { windows, openWindow, closeWindow } = useWindowContext();
  const { rootItems, desktopIcons, createFile } = useFileSystemContext();

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Foundation Test Page</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Window Manager Test</h2>
        <button
          className="bg-blue-500 px-4 py-2 rounded mr-2"
          onClick={() =>
            openWindow({
              title: 'Test Window',
              appType: 'notepad',
              position: { x: 100, y: 100 },
              size: { width: 400, height: 300 },
            })
          }
        >
          Open Test Window
        </button>
        <p className="mt-2">Open Windows: {windows.length}</p>
        <pre className="bg-gray-800 p-2 mt-2 text-xs overflow-auto">
          {JSON.stringify(windows, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">File System Test</h2>
        <button
          className="bg-green-500 px-4 py-2 rounded mr-2"
          onClick={() => createFile('/My Computer', 'test.txt', 'Hello World')}
        >
          Create Test File
        </button>
        <p className="mt-2">Desktop Icons: {desktopIcons.length}</p>
        <p>Root Items: {rootItems.length}</p>
        <pre className="bg-gray-800 p-2 mt-2 text-xs overflow-auto">
          {JSON.stringify(rootItems[0], null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

### Run Test

```bash
npm run dev
# Visit http://localhost:3000/test-foundation
```

**Verify**:
- ✅ Page loads without errors
- ✅ Clicking "Open Test Window" increases count
- ✅ Clicking "Create Test File" adds file to My Computer
- ✅ JSON output shows correct structure
- ✅ No TypeScript errors in VSCode

---

## Success Criteria

Your Phase 1 is **DONE** when:

- [x] All 6 new files created (types, constants, 2 hooks, 2 contexts)
- [x] `app/layout.tsx` edited with providers
- [x] Test page at `/test-foundation` works
- [x] No TypeScript errors in entire project
- [x] `npm run build` succeeds
- [x] All files use proper imports (`@/lib/...`, `@/hooks/...`)
- [x] Code is committed with descriptive messages
- [x] Branch pushed to `origin/feature/phase1-foundation`
- [x] PR created with detailed description

---

## Common Pitfalls

### ❌ Problem: TypeScript errors in hooks
**Solution**: Make sure types are imported correctly: `import type { ... } from '@/lib/types'`

### ❌ Problem: "use client" directive missing
**Solution**: All hooks and context files MUST start with `'use client';`

### ❌ Problem: Context not found error
**Solution**: Verify `layout.tsx` has both providers wrapping `{children}`

### ❌ Problem: Constants not autocompleting
**Solution**: Export as `const` object with `as const` assertion

### ❌ Problem: Build fails
**Solution**: Run `npm run build` locally before pushing. Fix any errors.

---

## After You're Done

**DO NOT START PHASE 2!** Your job is foundation only.

Once your PR is merged:
1. Claude (orchestrator) will review
2. Codex will pull latest `main` (with your code)
3. Codex will start Phase 2 using your types and hooks

**You've built the API contract that everyone will use. Make it solid!** 💪

---

## Questions During Development?

Add comments in your code:
```typescript
// NOTE @claude: Using Date.now() for IDs - is this sufficient or should we use UUID?
// QUESTION: Should file system support nested folders beyond 2 levels?
// TODO: Add validation for duplicate file names in same folder?
```

Or create `NOTES-STEVE.md` in your branch:
```markdown
## Development Notes

### Decisions:
- Used Date.now() for unique IDs (fast, no dependencies)
- File paths use forward slashes (cross-platform)

### Questions:
- Should we add file size limits?
- localStorage strategy for user files?
```

---

**Good luck, Steve! Build a solid foundation! 🏗️**

**- Claude (Orchestrator)**
