'use client';
import React, { createContext, useContext, type ReactNode } from 'react';
import { useWindowManager } from '../hooks/useWindowManager';
import type { WindowManagerContext } from './types';

const WindowContext = createContext<WindowManagerContext | undefined>(undefined);

export function WindowProvider({ children }: { children: ReactNode }) {
  const windowManager = useWindowManager();

  return (
    <WindowContext.Provider value={windowManager}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindowContext() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindowContext must be used within WindowProvider');
  }
  return context;
}

// Re-export for convenience
export { useWindowManager };