import type { WindowContent } from './types';

// Application configuration types
export interface AppConfig {
  title: string;
  defaultSize: { width: number; height: number };
  defaultPosition: { x: number; y: number };
  icon: string;
  defaultContent?: WindowContent | Record<string, unknown>;
  aliases?: string[]; // For terminal/command matching
}

export type AppName = 
  | 'paint'
  | 'minesweeper'
  | 'notepad'
  | 'snake'
  | 'camera'
  | 'tv'
  | 'browser'
  | 'chatbot'
  | 'portfolio'
  | 'terminal'
  | 'explorer'
  | 'mycomputer';

// Centralized application configuration registry
// Uses DesktopIcon.tsx values as canonical reference for dimensions
export const APP_CONFIGS: Record<AppName, AppConfig> = {
  paint: {
    title: 'Paint',
    defaultSize: { width: 800, height: 600 }, // Canonical from DesktopIcon.tsx
    defaultPosition: { x: 340, y: 140 },
    icon: 'PT',
    defaultContent: {
      canvasWidth: 600,
      canvasHeight: 400,
      backgroundColor: '#FFFFFF',
      brushSize: 6,
      palette: [
        '#000000',
        '#FFFFFF',
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#FFFF00',
        '#FF00FF',
        '#00FFFF',
      ],
    },
    aliases: ['paint.exe', 'paint'],
  },
  
  minesweeper: {
    title: 'Minesweeper',
    defaultSize: { width: 360, height: 440 }, // Canonical from DesktopIcon.tsx
    defaultPosition: { x: 360, y: 180 },
    icon: 'MS',
    defaultContent: {
      rows: 9,
      cols: 9,
      mines: 10,
      difficulty: 'beginner',
      firstClickSafe: true,
    },
    aliases: ['minesweeper.exe', 'minesweeper'],
  },

  notepad: {
    title: 'Notepad',
    defaultSize: { width: 520, height: 380 }, // Canonical from DesktopIcon.tsx
    defaultPosition: { x: 320, y: 160 },
    icon: 'NP',
    defaultContent: {
      filePath: null,
      fileName: 'Untitled.txt',
      body: '',
      readOnly: false,
    },
    aliases: ['notepad.exe', 'notepad'],
  },

  snake: {
    title: 'Snake.exe',
    defaultSize: { width: 850, height: 580 }, // Canonical from DesktopIcon.tsx
    defaultPosition: { x: 350, y: 160 },
    icon: 'SN',
    defaultContent: {},
    aliases: ['snake.exe', 'snake'],
  },

  camera: {
    title: 'Camera',
    defaultSize: { width: 720, height: 580 }, // Canonical from DesktopIcon.tsx (matches across all)
    defaultPosition: { x: 330, y: 120 },
    icon: '📹',
    defaultContent: {
      isActive: false,
      hasPermission: false,
      error: null,
    },
    aliases: ['camera.exe', 'camera'],
  },

  tv: {
    title: 'TV',
    defaultSize: { width: 880, height: 720 }, // Canonical from DesktopIcon.tsx
    defaultPosition: { x: 310, y: 100 },
    icon: '📺',
    defaultContent: {},
    aliases: ['tv.exe', 'tv'],
  },

  browser: {
    title: 'Microsoft Explorer',
    defaultSize: { width: 960, height: 720 }, // Canonical from DesktopIcon.tsx
    defaultPosition: { x: 330, y: 130 },
    icon: 'IE',
    defaultContent: {
      initialUrl: undefined,
    },
    aliases: [
      'internet explorer.exe',
      'internet explorer',
      'iexplore.exe',
      'microsoft explorer',
      'browser.exe',
      'browser',
    ],
  },

  chatbot: {
    title: 'MSN Messenger - Jean Francois',
    defaultSize: { width: 480, height: 620 }, // Canonical from DesktopIcon.tsx
    defaultPosition: { x: 300, y: 120 },
    icon: '💬',
    defaultContent: {},
    aliases: ['msn messenger.exe', 'messenger.exe', 'chatbot.exe', 'messenger'],
  },

  portfolio: {
    title: 'Portfolio Media Center - Jean Francois',
    defaultSize: { width: 750, height: 863 }, // Canonical from DesktopIcon.tsx
    defaultPosition: { x: 310, y: 100 },
    icon: '📂',
    defaultContent: {},
    aliases: ['portfolio.exe', 'portfolio'],
  },

  terminal: {
    title: 'Terminal',
    defaultSize: { width: 800, height: 600 }, // Consistent across DesktopIcon.tsx and Terminal
    defaultPosition: { x: 340, y: 140 },
    icon: 'CMD',
    defaultContent: {},
    aliases: ['terminal.exe', 'terminal', 'cmd'],
  },

  explorer: {
    title: 'Program Manager',
    defaultSize: { width: 520, height: 360 }, // From Terminal (only place it appears)
    defaultPosition: { x: 320, y: 160 },
    icon: 'PM',
    defaultContent: { 
      folderPath: null 
    },
    aliases: ['program manager.exe', 'explorer.exe', 'explorer'],
  },

  mycomputer: {
    title: 'My Computer',
    defaultSize: { width: 700, height: 500 }, // From Chatbot (only place it appears)
    defaultPosition: { x: 240, y: 240 },
    icon: 'MC',
    defaultContent: { 
      path: '/My Computer' 
    },
    aliases: ['mycomputer.exe', 'mycomputer', 'my computer'],
  },
};

// Helper function to get app config by name or alias
export function getAppConfigByName(nameOrAlias: string): { name: AppName; config: AppConfig } | null {
  const lower = nameOrAlias.toLowerCase();
  
  // Direct name match first
  for (const [name, config] of Object.entries(APP_CONFIGS) as [AppName, AppConfig][]) {
    if (name === lower) {
      return { name, config };
    }
  }
  
  // Alias match
  for (const [name, config] of Object.entries(APP_CONFIGS) as [AppName, AppConfig][]) {
    if (config.aliases?.includes(lower)) {
      return { name, config };
    }
  }
  
  return null;
}

// Helper function to get all app names for listing
export function getAllAppNames(): string[] {
  const names: string[] = [];
  for (const [name, config] of Object.entries(APP_CONFIGS) as [AppName, AppConfig][]) {
    names.push(name);
    if (config.aliases) {
      names.push(...config.aliases);
    }
  }
  return names.sort();
}