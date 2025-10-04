import type { FileSystemContext, WindowManagerContext } from '@/app/lib/types';

export type TerminalLineType = 'input' | 'output' | 'error' | 'system' | 'success' | 'warning';

export interface TerminalLine {
  id: string;
  text: string;
  type: TerminalLineType;
  timestamp: number;
}

export interface TerminalProps {
  isMobile?: boolean;
  className?: string;
}

export interface TerminalHistoryState {
  entries: string[];
  pointer: number; // -1 when entering new command
}

export interface ParsedCommand {
  input: string;
  tokens: string[];
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
  isEmpty: boolean;
}

export type TerminalEffect = 'hack' | 'matrix' | 'bsod' | 'boot' | null;

export interface TerminalLineInput {
  text: string;
  type?: TerminalLineType;
}

export interface CommandResult {
  lines?: TerminalLineInput[];
  error?: string;
  clear?: boolean;
  effect?: TerminalEffect;
}

export interface TerminalRuntime {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  isMobile: boolean;
  print: (line: TerminalLineInput) => void;
  printLines: (lines: TerminalLineInput[]) => void;
  clear: () => void;
  setEffect: (effect: TerminalEffect | null) => void;
  history: string[];
  clearHistory: () => void;
}

export interface CommandContext {
  parsed: ParsedCommand;
  runtime: TerminalRuntime;
  fileSystem: FileSystemContext;
  windows: WindowManagerContext | null;
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  category: 'navigation' | 'filesystem' | 'system' | 'fun' | 'hidden' | string;
  hidden?: boolean;
  execute: (context: CommandContext) => Promise<CommandResult | void> | CommandResult | void;
}