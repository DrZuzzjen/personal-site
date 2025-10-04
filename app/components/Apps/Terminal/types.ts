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
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
}

export type TerminalEffect = 'hack' | 'matrix' | 'bsod' | 'boot' | null;

export interface CommandResult {
  lines?: Array<{ text: string; type?: TerminalLineType }>;
  error?: string;
  clear?: boolean;
  effect?: TerminalEffect;
  prompt?: string;
}

export interface TerminalExecutionContext {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  appendLine: (line: { text: string; type?: TerminalLineType }) => void;
  pushLines: (lines: Array<{ text: string; type?: TerminalLineType }>) => void;
  setBusy: (busy: boolean) => void;
  isMobile: boolean;
}
