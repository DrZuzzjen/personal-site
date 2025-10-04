'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { COLORS, WINDOW_DEFAULTS, Z_INDEX } from '@/app/lib/constants';
import type { WindowPosition, WindowSize } from '@/app/lib/types';
import { useWindowContext } from '@/app/lib/WindowContext';
import WindowTitleBar from './WindowTitleBar';
import { useWindowDrag } from './useWindowDrag';

interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  icon?: string;
  initialPosition?: WindowPosition;
  initialSize?: WindowSize;
  onClose?: () => void;
  isResizable?: boolean; // Reserved for future phases
}

const windowBorderStyle: CSSProperties = {
  borderTop: `${WINDOW_DEFAULTS.BORDER_WIDTH}px solid ${COLORS.BORDER_LIGHT}`,
  borderLeft: `${WINDOW_DEFAULTS.BORDER_WIDTH}px solid ${COLORS.BORDER_HIGHLIGHT}`,
  borderBottom: `${WINDOW_DEFAULTS.BORDER_WIDTH}px solid ${COLORS.BORDER_SHADOW}`,
  borderRight: `${WINDOW_DEFAULTS.BORDER_WIDTH}px solid ${COLORS.BORDER_DARK}`,
};

const DEFAULT_POSITION: WindowPosition = { x: 80, y: 80 };
const DEFAULT_SIZE: WindowSize = {
  width: WINDOW_DEFAULTS.DEFAULT_WIDTH,
  height: WINDOW_DEFAULTS.DEFAULT_HEIGHT,
};

export default function Window({
  id,
  title,
  children,
  icon,
  initialPosition,
  initialSize,
  onClose,
}: WindowProps) {
  const {
    windows,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowContext();

  const currentWindow = useMemo(
    () => windows.find((item) => item.id === id),
    [windows, id],
  );

  const previousStateRef = useRef<{
    position: WindowPosition;
    size: WindowSize;
  } | null>(null);

  const position = currentWindow?.position ?? initialPosition ?? DEFAULT_POSITION;
  const size = currentWindow?.size ?? initialSize ?? DEFAULT_SIZE;
  const zIndex = currentWindow?.zIndex ?? Z_INDEX.WINDOW_BASE;
  const isMinimized = currentWindow?.isMinimized ?? false;
  const isMaximized = currentWindow?.isMaximized ?? false;

  const highestZIndex = useMemo(
    () => windows.reduce((max, item) => (item.zIndex > max ? item.zIndex : max), Z_INDEX.WINDOW_BASE),
    [windows],
  );

  const isFocused = currentWindow ? currentWindow.zIndex === highestZIndex : false;

  const { isDragging, outlinePosition, handleMouseDown } = useWindowDrag({
    position,
    onDragEnd: (newPosition) => {
      if (!currentWindow) {
        return;
      }
      updateWindowPosition(id, newPosition);
    },
    onDragStart: () => focusWindow(id),
    disabled: isMaximized,
  });

  const handleContainerMouseDown = useCallback(() => {
    focusWindow(id);
  }, [focusWindow, id]);

  const handleClose = useCallback(() => {
    closeWindow(id);
    onClose?.();
  }, [closeWindow, id, onClose]);

  const handleMinimize = useCallback(() => {
    minimizeWindow(id);
  }, [minimizeWindow, id]);

  const handleMaximize = useCallback(() => {
    focusWindow(id);

    if (typeof window === 'undefined' || !currentWindow) {
      return;
    }

    if (!currentWindow.isMaximized) {
      previousStateRef.current = {
        position: currentWindow.position,
        size: currentWindow.size,
      };
      maximizeWindow(id);
      updateWindowPosition(id, { x: 0, y: 0 });

      const viewportWidth = Math.max(
        WINDOW_DEFAULTS.MIN_WIDTH,
        window.innerWidth - WINDOW_DEFAULTS.BORDER_WIDTH * 2,
      );
      const viewportHeight = Math.max(
        WINDOW_DEFAULTS.MIN_HEIGHT,
        window.innerHeight - WINDOW_DEFAULTS.BORDER_WIDTH * 2,
      );

      updateWindowSize(id, {
        width: viewportWidth,
        height: viewportHeight,
      });
      return;
    }

    maximizeWindow(id);

    if (previousStateRef.current) {
      updateWindowPosition(id, previousStateRef.current.position);
      updateWindowSize(id, previousStateRef.current.size);
      previousStateRef.current = null;
    }
  }, [currentWindow, focusWindow, id, maximizeWindow, updateWindowPosition, updateWindowSize]);

  if (!currentWindow || isMinimized) {
    return null;
  }

  const windowStyle: CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
    backgroundColor: COLORS.WIN_GRAY,
    zIndex,
    overflow: 'hidden',
    ...windowBorderStyle,
    boxShadow: isFocused
      ? '2px 2px 0 rgba(0, 0, 0, 0.4)'
      : '1px 1px 0 rgba(0, 0, 0, 0.2)',
  };

  const contentStyle: CSSProperties = {
    backgroundColor: COLORS.WIN_GRAY,
    padding: 12,
    height: `calc(100% - ${WINDOW_DEFAULTS.TITLE_BAR_HEIGHT}px)`,
    overflow: 'auto',
    boxSizing: 'border-box',
  };

  let renderedChildren: ReactNode | null = children ?? null;

  if (!renderedChildren && typeof currentWindow?.content === 'string') {
    renderedChildren = currentWindow.content;
  }

  return (
    <>
      <div
        style={windowStyle}
        onMouseDown={handleContainerMouseDown}
        role="presentation"
      >
        <WindowTitleBar
          title={title}
          icon={icon}
          isFocused={isFocused}
          onMouseDown={handleMouseDown}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />
        <div style={contentStyle}>{renderedChildren}</div>
      </div>

      {isDragging && outlinePosition ? (
        <div
          style={{
            position: 'fixed',
            left: outlinePosition.x,
            top: outlinePosition.y,
            width: size.width,
            height: size.height,
            border: `2px dashed ${COLORS.WIN_BLACK}`,
            zIndex: Z_INDEX.DRAG_OUTLINE,
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </>
  );
}

