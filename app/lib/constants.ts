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
  ICON_WIDTH: 70,
  ICON_HEIGHT: 70,
  ICON_SPACING: 8,
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
    id: 'c-drive',
    name: 'C:',
    type: 'folder',
    extension: 'folder',
    path: '/C:',
    isProtected: true,
    isSystem: true,
    icon: 'computer',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    children: [
      {
        id: 'windows-folder',
        name: 'Windows',
        type: 'folder',
        extension: 'folder',
        path: '/C:/Windows',
        isProtected: true,
        isSystem: true,
        icon: 'folder',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        children: [
          {
            id: 'system32-folder',
            name: 'System32',
            type: 'folder',
            extension: 'folder',
            path: '/C:/Windows/System32',
            isProtected: true,
            isSystem: true,
            icon: 'folder',
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            children: [],
          },
        ],
      },
      {
        id: 'program-files',
        name: 'Program Files',
        type: 'folder',
        extension: 'folder',
        path: '/C:/Program Files',
        isProtected: true,
        isSystem: true,
        icon: 'folder',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        children: [], // Will be populated with APP_EXECUTABLES
      },
      {
        id: 'users-folder',
        name: 'Users',
        type: 'folder',
        extension: 'folder',
        path: '/C:/Users',
        isProtected: true,
        isSystem: true,
        icon: 'folder',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        children: [
          {
            id: 'guest-user',
            name: 'Guest',
            type: 'folder',
            extension: 'folder',
            path: '/C:/Users/Guest',
            isProtected: true,
            isSystem: false,
            icon: 'folder',
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            children: [
              {
                id: 'desktop-folder',
                name: 'Desktop',
                type: 'folder',
                extension: 'folder',
                path: '/C:/Users/Guest/Desktop',
                isProtected: true,
                isSystem: false,
                icon: 'folder',
                createdAt: Date.now(),
                modifiedAt: Date.now(),
                children: [], // Desktop files will be created here
              },
              {
                id: 'documents-folder',
                name: 'Documents',
                type: 'folder',
                extension: 'folder',
                path: '/C:/Users/Guest/Documents',
                isProtected: true,
                isSystem: false,
                icon: 'folder',
                createdAt: Date.now(),
                modifiedAt: Date.now(),
                children: [
                  {
                    id: 'about-txt',
                    name: 'About.txt',
                    type: 'file',
                    extension: 'txt',
                    path: '/C:/Users/Guest/Documents/About.txt',
                    content: `Jean-François Gutierrez
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
                    id: 'project-1',
                    name: 'Real-Time AI Narrator.txt',
                    type: 'file',
                    extension: 'txt',
                    path: '/C:/Users/Guest/Documents/Real-Time AI Narrator.txt',
                    content: `🎥 Real-Time AI Narrator (2024)

David Attenborough narrates your life in real-time

"In the heart of the domestic jungle, we observe the majestic Homo sapiens in its natural habitat."

A simple and tremendously fun project that narrates your life in real time as if it were the famous Sir David Attenborough.

**Tech Stack:**
- Python
- GPT-4 Vision
- ElevenLabs (voice synthesis)
- OpenCV (real-time video processing)

**GitHub:** https://github.com/cbh123/narrator

Watch the demo video in Portfolio.exe!`,
                    isProtected: false,
                    isSystem: false,
                    icon: 'notepad',
                    createdAt: Date.now(),
                    modifiedAt: Date.now(),
                  },
                  {
                    id: 'project-2',
                    name: 'Random Prediction Game.txt',
                    type: 'file',
                    extension: 'txt',
                    path: '/C:/Users/Guest/Documents/Random Prediction Game.txt',
                    content: `🎯 Random Prediction Game (2024)

Testing human bias toward randomness

An experiment to see how biased humans are toward the meaning of random. Players predict 10 random numbers (1-99) and compete on a leaderboard.

Uses Random.org API for true random numbers and Supabase for persistent leaderboard.

**Tech Stack:**
- Streamlit (Python web framework)
- Supabase (database)
- Random.org API (true randomness)
- PostgreSQL

**Links:**
- GitHub: https://github.com/DrZuzzjen/random-prediction
- Live Demo: https://random-prediction.streamlit.app/

Try your luck and see how well you can predict randomness!`,
                    isProtected: false,
                    isSystem: false,
                    icon: 'notepad',
                    createdAt: Date.now(),
                    modifiedAt: Date.now(),
                  },
                  {
                    id: 'project-3',
                    name: 'YouClip.txt',
                    type: 'file',
                    extension: 'txt',
                    path: '/C:/Users/Guest/Documents/YouClip.txt',
                    content: `✂️ YouClip (2024)

YouTube video clipper with AI subtitles

A beautiful Streamlit application that allows users to create custom clips from YouTube videos.

**Features:**
- Custom clipping with precise start/end times
- Multiple formats: MP4, WebM, MKV
- Quality options (1080p, 720p, 480p, 360p)
- AI-generated subtitles using Whisper running in the browser!

**Tech Stack:**
- Streamlit
- Python
- Whisper AI (subtitle generation)
- FFmpeg (video processing)
- YouTube API

**GitHub:** https://github.com/DrZuzzjen/YouCLIP

Perfect for content creators and video editors!`,
                    isProtected: false,
                    isSystem: false,
                    icon: 'notepad',
                    createdAt: Date.now(),
                    modifiedAt: Date.now(),
                  },
                  {
                    id: 'project-4',
                    name: 'LLM Arena.txt',
                    type: 'file',
                    extension: 'txt',
                    path: '/C:/Users/Guest/Documents/LLM Arena.txt',
                    content: `🚥 LLM Arena (2024)

Speed benchmark for OpenAI, NVIDIA, and Groq

Where the heavyweights of language models go head-to-head. Compare speed and efficiency across multiple LLM providers.

**Features:**
- Real-time streaming responses
- Performance metrics & charts
- Side-by-side comparison
- Async backend powered by FastAPI + LangChain

**Tech Stack:**
- FastAPI (async Python backend)
- LangChain (LLM orchestration)
- Streamlit (frontend)
- Docker (containerization)

**Providers Tested:**
- OpenAI (GPT models)
- NVIDIA NIM
- Groq (ultra-fast inference)

**GitHub:** https://github.com/DrZuzzjen/LLM_Arena

Find the fastest LLM for your use case!`,
                    isProtected: false,
                    isSystem: false,
                    icon: 'notepad',
                    createdAt: Date.now(),
                    modifiedAt: Date.now(),
                  },
                  {
                    id: 'project-5',
                    name: 'BASF Hackathon Winner.txt',
                    type: 'file',
                    extension: 'txt',
                    path: '/C:/Users/Guest/Documents/BASF Hackathon Winner.txt',
                    content: `🏆 BASF Copilot AI Hackathon - 1st Place (2024)

Real-time emotion detection from facial expressions

**Achievement:** 1st Place Winner

**Project: Emosnaz**
Three-model pipeline running entirely in the browser:
1. Face isolation from video stream
2. Facial anchor point mapping (68 landmarks)
3. Emotion translation (7 emotions detected)

All client-side, pure front-end magic. No server needed!

**Tech Stack:**
- TensorFlow.js (browser ML)
- Computer Vision
- Face Detection API
- Client-side ML (runs entirely in browser)

**Emotions Detected:**
Happy, Sad, Angry, Surprised, Fearful, Disgusted, Neutral

**GitHub:** https://github.com/DrZuzzjen/emosnaz

Privacy-first emotion detection!`,
                    isProtected: false,
                    isSystem: false,
                    icon: 'notepad',
                    createdAt: Date.now(),
                    modifiedAt: Date.now(),
                  },
                  {
                    id: 'project-6',
                    name: 'Flux Fine-tuning.txt',
                    type: 'file',
                    extension: 'txt',
                    path: '/C:/Users/Guest/Documents/Flux Fine-tuning.txt',
                    content: `🎨 Fine-tuning Flux.1-dev with LoRA (2024)

Custom AI image generation with personal features

Fine-tuned Flux.1-dev using LoRA (Low-Rank Adaptation) to generate images with my facial features.

**Training Details:**
- Trained on A100 80GB GPU
- Training time: 75 minutes
- Dataset: Less than 20 images
- Training cost: €5.50
- Steps: 2000

**What is LoRA?**
Low-Rank Adaptation allows efficient model customization without retraining from scratch. It's like teaching the model a new "style" while keeping the base knowledge intact.

**Tech Stack:**
- Flux.1-dev (image generation model)
- LoRA (efficient fine-tuning)
- A100 GPU (NVIDIA)
- Diffusion Models
- HuggingFace (model hosting)

**Links:**
- LinkedIn Post: https://www.linkedin.com/feed/update/urn:li:activity:7231922195994718209/
- HuggingFace Model: https://huggingface.co/FranZuzz/franzuzz

Try generating your own personalized images!`,
                    isProtected: false,
                    isSystem: false,
                    icon: 'notepad',
                    createdAt: Date.now(),
                    modifiedAt: Date.now(),
                  },
                ],
              },
              {
                id: 'downloads-folder',
                name: 'Downloads',
                type: 'folder',
                extension: 'folder',
                path: '/C:/Users/Guest/Downloads',
                isProtected: true,
                isSystem: false,
                icon: 'folder',
                createdAt: Date.now(),
                modifiedAt: Date.now(),
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'a-drive',
    name: 'A:',
    type: 'folder',
    extension: 'folder',
    path: '/A:',
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
        path: '/A:/Resume.pdf',
        content: '/jean_francois_cv.pdf', // Link to actual PDF in public folder
        isProtected: true,
        isSystem: false,
        icon: 'pdf',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
    ],
  },
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
        id: 'c-drive-shortcut',
        name: 'C:',
        type: 'folder',
        extension: 'folder',
        path: '/C:',
        isProtected: true,
        isSystem: true,
        icon: 'computer',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        children: [], // References the actual C: drive
      },
      {
        id: 'a-drive-shortcut',
        name: 'A:',
        type: 'folder',
        extension: 'folder',
        path: '/A:',
        isProtected: true,
        isSystem: true,
        icon: 'floppy',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        children: [], // References the actual A: drive
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
    position: { x: 1, y: 0 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-documents',
    fileSystemId: 'documents-folder',
    position: { x: 0, y: 3 },
    isSelected: false,
  },
];

// ============================================
// APP EXECUTABLES (Desktop Icons)
// ============================================

// ============================================
// APP EXECUTABLES (Desktop Icons)
// ============================================

export const APP_EXECUTABLES: FileSystemItem[] = [
  {
    id: 'paint-exe',
    name: 'Paint.exe',
    type: 'file',
    extension: 'exe',
    path: '/C:/Program Files/Paint.exe',
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
    path: '/C:/Program Files/Minesweeper.exe',
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
    path: '/C:/Program Files/Notepad.exe',
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
    path: '/C:/Program Files/Snake.exe',
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
    path: '/C:/Program Files/Camera.exe',
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
    path: '/C:/Program Files/TV.exe',
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
    path: '/C:/Program Files/MSN Messenger.exe',
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
    path: '/C:/Program Files/Terminal.exe',
    isProtected: true,
    isSystem: true,
    icon: 'terminal',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: 'portfolio-exe',
    name: 'Portfolio.exe',
    type: 'file',
    extension: 'exe',
    path: '/C:/Program Files/Portfolio.exe',
    isProtected: true,
    isSystem: true,
    icon: 'portfolio',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
];

// Desktop icons for executables (shortcuts to Program Files)
export const APP_DESKTOP_ICONS: DesktopIcon[] = [
  {
    id: 'desktop-icon-paint',
    fileSystemId: 'paint-exe',
    position: { x: 2, y: 0 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-minesweeper',
    fileSystemId: 'minesweeper-exe',
    position: { x: 3, y: 0 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-notepad',
    fileSystemId: 'notepad-exe',
    position: { x: 0, y: 1 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-snake',
    fileSystemId: 'snake-exe',
    position: { x: 1, y: 1 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-camera',
    fileSystemId: 'camera-exe',
    position: { x: 2, y: 1 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-tv',
    fileSystemId: 'tv-exe',
    position: { x: 3, y: 1 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-chatbot',
    fileSystemId: 'chatbot-exe',
    position: { x: 0, y: 2 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-terminal',
    fileSystemId: 'terminal-exe',
    position: { x: 1, y: 2 },
    isSelected: false,
  },
  {
    id: 'desktop-icon-portfolio',
    fileSystemId: 'portfolio-exe',
    position: { x: 2, y: 2 },
    isSelected: false,
  },
];

// ============================================
// ERROR MESSAGES
// ============================================

// ============================================
// PATH SHORTCUTS & SYMLINKS
// ============================================

/**
 * Maps virtual/shortcut paths to actual file system paths
 * Used to resolve "My Computer" shortcuts to actual drives
 */
export const PATH_SHORTCUTS: Record<string, string> = {
  '/My Computer/C:': '/C:/',
  '/My Computer/A:': '/A:/',
} as const;

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