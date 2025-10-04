'use client';
import { useState, useCallback } from 'react';
import type { Window, WindowContent, WindowPosition, WindowSize } from '../lib/types';
import { Z_INDEX } from '../lib/constants';

export function useWindowManager() {
  const [windows, setWindows] = useState<Window[]>([]);
  const [nextZIndex, setNextZIndex] = useState<number>(Z_INDEX.WINDOW_BASE);

  // Open a new window
  const openWindow = useCallback(
    (windowData: Omit<Window, 'id' | 'zIndex' | 'isMinimized' | 'isMaximized'>): string => {
      const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newWindow: Window = {
        ...windowData,
        id,
        zIndex: nextZIndex,
        isMinimized: false,
        isMaximized: false,
      };

      setWindows((prev) => [...prev, newWindow]);
      setNextZIndex((prev: number) => prev + 1);

      return id;
    },
    [nextZIndex],
  );

  // Close a window
  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Minimize a window
  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
    );
  }, []);

  // Maximize a window (toggle)
  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)),
    );
  }, []);

  // Focus a window (bring to front and restore if minimized)
  const focusWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        const target = prev.find((w) => w.id === id);
        if (!target) {
          return prev;
        }

        const maxZ = prev.reduce(
          (highest: number, item) => (item.zIndex > highest ? item.zIndex : highest),
          Z_INDEX.WINDOW_BASE,
        );
        const shouldRaise = target.zIndex !== maxZ;

        return prev.map((w) =>
          w.id === id
            ? {
              ...w,
              isMinimized: false,
              zIndex: shouldRaise ? nextZIndex : w.zIndex,
            }
            : w,
        );
      });

      setNextZIndex((prev: number) => prev + 1);
    },
    [nextZIndex],
  );

  // Update window position (called after drag)
  const updateWindowPosition = useCallback((id: string, position: WindowPosition) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position } : w)),
    );
  }, []);

  // Update window size (for resize feature in Phase 7)
  const updateWindowSize = useCallback((id: string, size: WindowSize) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, size } : w)),
    );
  }, []);

  // Update window content (for apps to store state)
  const updateWindowContent = useCallback((id: string, content: WindowContent) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, content } : w)),
    );
  }, []);

  const updateWindowTitle = useCallback((id: string, title: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, title } : w)),
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
    updateWindowTitle,
  };
}
