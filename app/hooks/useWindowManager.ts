'use client';
import { useState, useCallback } from 'react';
import type { Window, WindowPosition, WindowSize } from '../lib/types';
import { Z_INDEX } from '../lib/constants';

export function useWindowManager() {
  const [windows, setWindows] = useState<Window[]>([]);
  const [nextZIndex, setNextZIndex] = useState<number>(Z_INDEX.WINDOW_BASE);

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
    setNextZIndex((prev: number) => prev + 1);

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
    setNextZIndex((prev: number) => prev + 1);
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
  const updateWindowContent = useCallback((id: string, content: unknown) => {
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