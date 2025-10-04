'use client';

import { useState, useCallback, useEffect } from 'react';

export interface UseWindowResizeProps {
  windowId: string;
  initialWidth: number;
  initialHeight: number;
  minWidth?: number;
  minHeight?: number;
  onResize: (width: number, height: number) => void;
}

export function useWindowResize({
  windowId,
  initialWidth,
  initialHeight,
  minWidth = 300,
  minHeight = 200,
  onResize,
}: UseWindowResizeProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: initialWidth, height: initialHeight });

    // Add visual feedback during resize
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
  }, [initialWidth, initialHeight]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      let newWidth = startSize.width + deltaX;
      let newHeight = startSize.height + deltaY;

      // Apply minimum size constraints
      newWidth = Math.max(minWidth, newWidth);
      newHeight = Math.max(minHeight, newHeight);

      // Apply maximum size constraints (leave some margin from viewport edges)
      const maxWidth = window.innerWidth - 100;
      const maxHeight = window.innerHeight - 100;
      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);

      onResize(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      
      // Reset cursor and user selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startPos, startSize, minWidth, minHeight, onResize]);

  return {
    isResizing,
    handleResizeStart,
  };
}