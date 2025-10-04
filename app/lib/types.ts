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