'use client';

import { useCallback, useMemo, useState } from 'react';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS, Z_INDEX } from '@/app/lib/constants';
import type { Window as WindowType } from '@/app/lib/types';
import TaskbarButton from './TaskbarButton';
import Clock from './Clock';
import { StartMenu } from '@/app/components/StartMenu';

function getActiveWindowId(windows: WindowType[]): string | null {
  const visibleWindows = windows.filter((windowItem) => !windowItem.isMinimized);
  if (visibleWindows.length === 0) {
    return null;
  }

  const topWindow = visibleWindows.reduce(
    (currentTop, candidate) => (candidate.zIndex > currentTop.zIndex ? candidate : currentTop),
    visibleWindows[0],
  );

  return topWindow.id;
}

interface TaskbarProps {
  onLaunchApp: (appType: string, content?: any) => void;
  onRestart: () => void;
  onShutDown: () => void;
  onShowSettings: () => void;
  onShowFind: () => void;
  onShowHelp: () => void;
}

export default function Taskbar({
  onLaunchApp,
  onRestart,
  onShutDown,
  onShowSettings,
  onShowFind,
  onShowHelp,
}: TaskbarProps) {
  const { windows, focusWindow, minimizeWindow } = useWindowContext();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const activeWindowId = useMemo(() => getActiveWindowId(windows), [windows]);

  const handleButtonClick = useCallback(
    (windowItem: WindowType) => {
      if (windowItem.isMinimized) {
        focusWindow(windowItem.id);
        return;
      }

      if (activeWindowId === windowItem.id) {
        minimizeWindow(windowItem.id);
        return;
      }

      focusWindow(windowItem.id);
    },
    [activeWindowId, focusWindow, minimizeWindow],
  );

  const handleStartButtonClick = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const handleStartMenuClose = () => {
    setIsStartMenuOpen(false);
  };

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
        borderTop: '2px solid ' + COLORS.BORDER_SHADOW,
        borderLeft: '2px solid ' + COLORS.BORDER_HIGHLIGHT,
        borderRight: '2px solid ' + COLORS.BORDER_DARK,
        borderBottom: '2px solid ' + COLORS.BORDER_DARK,
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
          borderTop: isStartMenuOpen ? `2px solid ${COLORS.BORDER_SHADOW}` : `2px solid ${COLORS.BORDER_LIGHT}`,
          borderLeft: isStartMenuOpen ? `2px solid ${COLORS.BORDER_SHADOW}` : `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
          borderBottom: isStartMenuOpen ? `2px solid ${COLORS.BORDER_LIGHT}` : `2px solid ${COLORS.BORDER_SHADOW}`,
          borderRight: isStartMenuOpen ? `2px solid ${COLORS.BORDER_LIGHT}` : `2px solid ${COLORS.BORDER_DARK}`,
          cursor: 'pointer',
        }}
        title="Start"
        onClick={handleStartButtonClick}
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
        {windows.map((windowItem) => (
          <TaskbarButton
            key={windowItem.id}
            window={windowItem}
            isActive={activeWindowId === windowItem.id}
            onClick={() => handleButtonClick(windowItem)}
          />
        ))}
      </div>

      <Clock />

      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={handleStartMenuClose}
        onLaunchApp={onLaunchApp}
        onRestart={onRestart}
        onShutDown={onShutDown}
        onShowSettings={onShowSettings}
        onShowFind={onShowFind}
        onShowHelp={onShowHelp}
      />
    </div>
  );
}
