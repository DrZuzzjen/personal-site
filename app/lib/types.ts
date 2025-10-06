// ============================================
// WINDOW SYSTEM TYPES
// ============================================

export type AppType = 'notepad' | 'paint' | 'minesweeper' | 'mycomputer' | 'explorer' | 'snake' | 'camera' | 'tv' | 'chatbot' | 'terminal';

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
  content?: WindowContent; // App-specific state (file data, game config, etc.)
}

// ============================================
// FILE SYSTEM TYPES
// ============================================

export type FileType = 'file' | 'folder';
export type FileExtension = 'txt' | 'exe' | 'pdf' | 'png' | 'folder' | null;

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  extension: FileExtension | null;
  path: string; // e.g., "/Desktop/My Documents/Project1.txt"
  content?: string; // For text files
  imageData?: string; // For image files (base64 data URL)
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

// Notepad
export interface NotepadWindowContent {
  filePath?: string | null;
  fileName?: string | null;
  body: string;
  readOnly?: boolean;
}

// Paint App
export type PaintTool = 'pencil' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'select';

export interface PaintState {
  currentTool: PaintTool;
  currentColor: string;
  brushSize: number;
  canvasData?: ImageData;
}

export interface PaintWindowContent {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  brushSize: number;
  palette: string[];
  backgroundImage?: string; // Optional base64 image data to load as background
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

export type MinesweeperDifficulty = 'beginner' | 'intermediate' | 'expert' | 'custom';

export interface MinesweeperWindowContent {
  rows: number;
  cols: number;
  mines: number;
  difficulty: MinesweeperDifficulty;
  firstClickSafe: boolean;
}

// Snake
export interface SnakeWindowContent {
  columns?: number;
  rows?: number;
  initialLength?: number;
  initialSpeedMs?: number;
  speedIncrementMs?: number;
  speedIncreaseEvery?: number;
  minimumSpeedMs?: number;
}

// File Explorer
export interface ExplorerWindowContent {
  folderPath?: string | null;
}

// Camera App
export interface CameraWindowContent {
  isActive?: boolean;
  hasPermission?: boolean;
  error?: string | null;
}

export type WindowContent =
  | NotepadWindowContent
  | PaintWindowContent
  | MinesweeperWindowContent
  | SnakeWindowContent
  | ExplorerWindowContent
  | CameraWindowContent
  | string
  | null
  | undefined;

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
  updateWindowContent: (id: string, content: WindowContent) => void;
  updateWindowTitle: (id: string, title: string) => void;
}

export interface FileSystemContext {
  rootItems: FileSystemItem[];
  desktopIcons: DesktopIcon[];
  createFile: (parentPath: string, name: string, content?: string) => FileSystemItem | null;
  createFolder: (parentPath: string, name: string) => void;
  createImageFile: (parentPath: string, name: string, imageData: string) => FileSystemItem | null;
  deleteItem: (path: string) => boolean; // Returns false if protected
  moveItem: (fromPath: string, toPath: string) => boolean;
  getItemByPath: (path: string) => FileSystemItem | null;
  resolvePath: (path: string) => string; // Resolves shortcuts/symlinks to actual paths
  updateFileContent: (path: string, content: string) => boolean;
  updateIconPosition: (iconId: string, position: { x: number; y: number }) => void;
  selectIcon: (iconId: string) => void;
  deselectAllIcons: () => void;
  createDesktopIcon: (fileItem: FileSystemItem, position: { x: number; y: number }) => DesktopIcon;
}
