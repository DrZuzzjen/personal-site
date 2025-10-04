"use client";

import { useCallback, useMemo, useState } from 'react';
import type { TerminalEffect, TerminalLine, TerminalLineType, TerminalMode, TerminalSessionStore } from '../types';

type HistoryDirection = 'previous' | 'next';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const createLine = (text: string, type: TerminalLineType = 'output'): TerminalLine => ({
  id: generateId(),
  text,
  type,
  timestamp: Date.now(),
});

export interface UseTerminalStateOptions {
  initialPath?: string;
}

export function useTerminalState(options: UseTerminalStateOptions = {}) {
  const { initialPath = '/Desktop' } = options;
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [isBusy, setIsBusy] = useState(false);
  const [activeEffect, setActiveEffect] = useState<TerminalEffect>(null);
  const [mode, setMode] = useState<TerminalMode>('normal');
  const [session, setSession] = useState<TerminalSessionStore>({});

  const appendLine = useCallback((line: { text: string; type?: TerminalLineType }) => {
    setLines((prev) => [...prev, createLine(line.text, line.type ?? 'output')]);
  }, []);

  const pushLines = useCallback((newLines: Array<{ text: string; type?: TerminalLineType }>) => {
    if (!newLines.length) return;
    setLines((prev) => [
      ...prev,
      ...newLines.map((line) => createLine(line.text, line.type ?? 'output')),
    ]);
  }, []);

  const clearLines = useCallback(() => {
    setLines([]);
  }, []);

  const addToHistory = useCallback((entry: string) => {
    const trimmed = entry.trim();
    if (!trimmed) {
      setHistoryPointer(-1);
      return;
    }
    setHistory((prev) => [...prev.slice(-49), trimmed]);
    setHistoryPointer(-1);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryPointer(-1);
  }, []);

  const recallHistory = useCallback((direction: HistoryDirection): string => {
    if (history.length === 0) {
      return '';
    }

    if (direction === 'previous') {
      const newPointer = historyPointer <= 0 ? history.length - 1 : historyPointer - 1;
      setHistoryPointer(newPointer);
      return history[newPointer];
    }

    if (historyPointer === -1) {
      return '';
    }

    const newPointer = historyPointer >= history.length - 1 ? -1 : historyPointer + 1;
    setHistoryPointer(newPointer);
    return newPointer === -1 ? '' : history[newPointer];
  }, [history, historyPointer]);

  const setSessionValue = useCallback((key: string, value: unknown) => {
    setSession((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearSessionKey = useCallback((key: string) => {
    setSession((prev) => {
      if (!(key in prev)) {
        return prev;
      }
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const stateSummary = useMemo(() => ({
    lineCount: lines.length,
    lastLine: lines.length ? lines[lines.length - 1] : null,
    historyCount: history.length,
    mode,
  }), [history.length, lines, mode]);

  return {
    lines,
    appendLine,
    pushLines,
    clearLines,
    currentInput,
    setCurrentInput,
    currentPath,
    setCurrentPath,
    isBusy,
    setIsBusy,
    addToHistory,
    clearHistory,
    recallHistory,
    history,
    historyPointer,
    activeEffect,
    setActiveEffect,
    mode,
    setMode,
    session,
    setSessionValue,
    clearSessionKey,
    stateSummary,
  };
}