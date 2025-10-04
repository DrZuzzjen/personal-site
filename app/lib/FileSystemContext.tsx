'use client';
import React, { createContext, useContext, type ReactNode } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import type { FileSystemContext as FileSystemContextType } from './types';

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const fileSystem = useFileSystem();

  return (
    <FileSystemContext.Provider value={fileSystem}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystemContext() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystemContext must be used within FileSystemProvider');
  }
  return context;
}

// Re-export for convenience
export { useFileSystem };