'use client';

import { useCallback, useMemo } from 'react';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS, Z_INDEX } from '@/app/lib/constants';
import type { Window as WindowType } from '@/app/lib/types';
import TaskbarButton from './TaskbarButton';
import Clock from './Clock';

function getActiveWindowId(windows: WindowType[]): string | null {
  const visibleWindows = windows.filter(windowItem => !windowItem.isMinimized);
  if (visibleWindows.length === 0) {
    return null;
  }

  const topWindow = visibleWindows.reduce((currentTop, candidate) =>
    candidate.zIndex > currentTop.zIndex ? candidate : currentTop,
  visibleWindows[0]);

  return topWindow.id;
}

export default function Taskbar() {
  const { windows, focusWindow, minimizeWindow } = useWindowContext();

  const activeWindowId = useMemo(() => getActiveWindowId(windows), [windows]);

  const sortedWindows = useMemo(
    () => [...windows].sort((a, b) => a.zIndex - b.zIndex),
    [windows],
  );

  const handleButtonClick = useCallback((windowItem: WindowType) => {
    if (windowItem.isMinimized) {
      focusWindow(windowItem.id);
      return;
    }

    if (activeWindowId === windowItem.id) {
      minimizeWindow(windowItem.id);
      return;
    }

    focusWindow(windowItem.id);
  }, [activeWindowId, focusWindow, minimizeWindow]);

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 8px',
        backgroundColor: COLORS.WIN_GRAY,
        borderTop: 2px solid ,
        borderLeft: 2px solid ,
        borderRight: 2px solid ,
        borderBottom: 2px solid ,
        zIndex: Z_INDEX.TASKBAR,
        boxSizing: 'border-box',
      }}
    >
      <button
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 60,
          height: 26,
          fontSize: 13,
          fontWeight: 700,
          color: COLORS.TEXT_BLACK,
          backgroundColor: COLORS.WIN_GRAY,
          borderTop: 2px solid ,
          borderLeft: 2px solid ,
          borderBottom: 2px solid ,
          borderRight: 2px solid ,
          cursor: 'pointer',
        }}
        title="Start"
      >
        Start
      </button>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          padding: '0 4px',
        }}
      >
        {sortedWindows.map(windowItem => (
          <TaskbarButton
            key={windowItem.id}
            window={windowItem}
            isActive={activeWindowId === windowItem.id}
            onClick={() => handleButtonClick(windowItem)}
          />
        ))}
      </div>

      <Clock />
    </div>
  );
}
