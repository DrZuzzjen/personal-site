'use client';

import { useState, useEffect, useCallback } from 'react';
import { DESKTOP_GRID } from '@/app/lib/constants';

interface UseIconDragProps {
  iconId: string;
  currentPosition: { x: number; y: number };
  onPositionChange: (iconId: string, position: { x: number; y: number }) => void;
}

interface UseIconDragReturn {
  isDragging: boolean;
  handleMouseDown: (event: React.MouseEvent) => void;
}

export function useIconDrag({
  iconId,
  currentPosition,
  onPositionChange,
}: UseIconDragProps): UseIconDragReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });

  // Function to snap position to grid
  const snapToGrid = useCallback((x: number, y: number) => {
    const gridX = Math.round(x / DESKTOP_GRID.ICON_WIDTH) * DESKTOP_GRID.ICON_WIDTH;
    const gridY = Math.round(y / DESKTOP_GRID.ICON_HEIGHT) * DESKTOP_GRID.ICON_HEIGHT;
    
    // Keep icons within screen bounds
    const maxX = window.innerWidth - DESKTOP_GRID.ICON_WIDTH;
    const maxY = window.innerHeight - DESKTOP_GRID.ICON_HEIGHT;
    
    return {
      x: Math.max(0, Math.min(gridX, maxX)),
      y: Math.max(0, Math.min(gridY, maxY)),
    };
  }, []);

  // Handle mouse down - start drag
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    // Only start drag on left mouse button
    if (event.button !== 0) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    setInitialPosition(currentPosition);
  }, [currentPosition]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    
    const newX = initialPosition.x + deltaX;
    const newY = initialPosition.y + deltaY;
    
    // Update position in real-time (without snapping for smooth drag)
    onPositionChange(iconId, { x: newX, y: newY });
  }, [isDragging, dragStart, initialPosition, iconId, onPositionChange]);

  // Handle mouse up - end drag and snap to grid
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    
    const newX = initialPosition.x + deltaX;
    const newY = initialPosition.y + deltaY;
    
    // Snap to grid on final position
    const snappedPosition = snapToGrid(newX, newY);
    onPositionChange(iconId, snappedPosition);
    
    setIsDragging(false);
  }, [isDragging, dragStart, initialPosition, iconId, onPositionChange, snapToGrid]);

  // Set up global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Change cursor globally while dragging
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isDragging) {
        document.body.style.cursor = '';
      }
    };
  }, [isDragging]);

  return {
    isDragging,
    handleMouseDown,
  };
}