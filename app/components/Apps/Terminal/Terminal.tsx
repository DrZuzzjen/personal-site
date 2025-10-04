"use client";

import { useCallback, useEffect, useMemo, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { useTerminalState } from './hooks/useTerminalState';
import type { TerminalProps, TerminalLineType } from './types';

const TERMINAL_COLORS = {
  BACKGROUND: '#000000',
  TEXT: '#00ff00',
  TEXT_DIM: '#009900',
  CURSOR: '#00ff00',
  ERROR: '#ff5555',
  WARNING: '#ffff66',
} as const;

const lineTypeToColor: Record<TerminalLineType, string> = {
  input: TERMINAL_COLORS.TEXT,
  output: TERMINAL_COLORS.TEXT,
  success: TERMINAL_COLORS.TEXT,
  system: TERMINAL_COLORS.TEXT_DIM,
  warning: TERMINAL_COLORS.WARNING,
  error: TERMINAL_COLORS.ERROR,
};

export default function Terminal({ isMobile = false, className }: TerminalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const {
    lines,
    appendLine,
    currentInput,
    setCurrentInput,
    currentPath,
    addToHistory,
    recallHistory,
  } = useTerminalState({ initialPath: '/Desktop' });

  useEffect(() => {
    appendLine({ text: 'Initializing MS-DOS compatible shell...', type: 'system' });
    appendLine({ text: 'Type "help" to list available commands.', type: 'system' });
  }, [appendLine]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [lines]);

  const containerStyles: CSSProperties = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: TERMINAL_COLORS.BACKGROUND,
    color: TERMINAL_COLORS.TEXT,
    fontFamily: "'Courier New', 'Consolas', monospace",
    fontSize: isMobile ? '16px' : '14px',
    lineHeight: 1.5,
    padding: isMobile ? '18px' : '16px',
    borderRadius: isMobile ? 0 : '8px',
    boxShadow: isMobile ? 'none' : '0 0 30px rgba(0, 255, 0, 0.2)',
    overflow: 'hidden',
  }), [isMobile]);

  const promptPrefix = useMemo(() => `${currentPath}>`, [currentPath]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = currentInput.trim();

    appendLine({ text: `${promptPrefix} ${currentInput}`, type: 'input' });
    addToHistory(currentInput);
    setCurrentInput('');

    if (!trimmed) {
      return;
    }

    appendLine({
      text: 'Command processor not hooked up yet. Stay tuned...',
      type: 'system',
    });
  }, [addToHistory, appendLine, currentInput, promptPrefix, setCurrentInput]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const recalled = recallHistory('previous');
      setCurrentInput(recalled);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const recalled = recallHistory('next');
      setCurrentInput(recalled);
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }
  }, [handleSubmit, recallHistory, setCurrentInput]);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  return (
    <div
      className={className}
      style={containerStyles}
      onClick={focusInput}
      role="application"
      aria-label="MS-DOS style terminal"
    >
      <div
        ref={viewportRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '8px',
          paddingRight: '12px',
        }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            style={{
              color: lineTypeToColor[line.type],
              whiteSpace: 'pre-wrap',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: TERMINAL_COLORS.TEXT_DIM }}>{promptPrefix}</span>
        <input
          ref={inputRef}
          value={currentInput}
          onChange={(event) => setCurrentInput(event.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: TERMINAL_COLORS.TEXT,
            fontFamily: "'Courier New', 'Consolas', monospace",
            fontSize: isMobile ? '16px' : '14px',
            caretColor: TERMINAL_COLORS.CURSOR,
          }}
          aria-label="Terminal command input"
        />
      </div>
    </div>
  );
}