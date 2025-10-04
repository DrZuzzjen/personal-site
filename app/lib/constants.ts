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
  START_MENU: 1500,
  MODAL: 10001,
  SHUTDOWN_SCREEN: 10000,
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

export const BOOT_SEQUENCE = {
  TIMINGS: {
    POST_SCREEN: 3000,      // 3 seconds
    MEMORY_CHECK: 3000,     // 3 seconds  
    LOADING_SCREEN: 2000,   // 2 seconds
  },
} as const;

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
  {
    id: 'desktop',
    name: 'Desktop',
    type: 'folder',
    extension: 'folder',
    path: '/Desktop',
    isProtected: true,
    isSystem: true,
    icon: 'folder',
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
  {
    id: 'notepad-exe',
    name: 'Notepad.exe',
    type: 'file',
    extension: 'exe',
    path: '/Desktop/Notepad.exe',
    isProtected: true,
    isSystem: true,
    icon: 'notepad',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'snake-exe',
    name: 'Snake.exe',
    type: 'file',
    extension: 'exe',
    path: '/Desktop/Snake.exe',
    isProtected: true,
    isSystem: true,
    icon: 'snake',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'camera-exe',
    name: 'Camera.exe',
    type: 'file',
    extension: 'exe',
    path: '/Desktop/Camera.exe',
    isProtected: true,
    isSystem: true,
    icon: 'camera',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'tv-exe',
    name: 'TV.exe',
    type: 'file',
    extension: 'exe',
    path: '/Desktop/TV.exe',
    isProtected: true,
    isSystem: true,
    icon: 'tv',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'chatbot-exe',
    name: 'MSN Messenger.exe',
    type: 'file',
    extension: 'exe',
    path: '/Desktop/MSN Messenger.exe',
    isProtected: true,
    isSystem: true,
    icon: 'chatbot',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'terminal-exe',
    name: 'Terminal.exe',
    type: 'file',
    extension: 'exe',
    path: '/Desktop/Terminal.exe',
    isProtected: true,
    isSystem: true,
    icon: 'terminal',
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
  {
    id: 'desktop-icon-notepad',
    fileSystemId: 'notepad-exe',
    position: { x: 0, y: 4 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-snake',
    fileSystemId: 'snake-exe',
    position: { x: 0, y: 5 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-camera',
    fileSystemId: 'camera-exe',
    position: { x: 0, y: 6 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-tv',
    fileSystemId: 'tv-exe',
    position: { x: 0, y: 7 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-chatbot',
    fileSystemId: 'chatbot-exe',
    position: { x: 0, y: 8 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-terminal',
    fileSystemId: 'terminal-exe',
    position: { x: 0, y: 9 },
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