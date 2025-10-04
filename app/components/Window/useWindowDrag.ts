'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { WindowPosition } from '@/app/lib/types';

interface UseWindowDragOptions {
  position: WindowPosition;
  onDragEnd: (position: WindowPosition) => void;
  onDragStart?: () => void;
  disabled?: boolean;
}

interface UseWindowDragResult {
  isDragging: boolean;
  outlinePosition: WindowPosition | null;
  handleMouseDown: (event: ReactMouseEvent) => void;
}

export function useWindowDrag({
  position,
  onDragEnd,
  onDragStart,
  disabled = false,
}: UseWindowDragOptions): UseWindowDragResult {
  const [isDragging, setIsDragging] = useState(false);
  const [outlinePosition, setOutlinePosition] = useState<WindowPosition | null>(null);
  const dragOffsetRef = useRef<WindowPosition>({ x: 0, y: 0 });
  const latestPositionRef = useRef<WindowPosition>(position);

  useEffect(() => {
    latestPositionRef.current = position;
    if (!isDragging) {
      setOutlinePosition(null);
    }
  }, [isDragging, position]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const nextPosition: WindowPosition = {
        x: event.clientX - dragOffsetRef.current.x,
        y: event.clientY - dragOffsetRef.current.y,
      };
      latestPositionRef.current = nextPosition;
      setOutlinePosition(nextPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setOutlinePosition(null);
      onDragEnd(latestPositionRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDragEnd]);

  const handleMouseDown = useCallback((event: ReactMouseEvent) => {
    if (disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    dragOffsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    latestPositionRef.current = position;
    setOutlinePosition(position);
    setIsDragging(true);
    onDragStart?.();
  }, [disabled, onDragStart, position]);

  useEffect(() => {
    if (disabled && isDragging) {
      setIsDragging(false);
      setOutlinePosition(null);
    }
  }, [disabled, isDragging]);

  return {
    isDragging,
    outlinePosition,
    handleMouseDown,
  };
}
