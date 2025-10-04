'use client';

import { useEffect, useMemo, useRef } from 'react';
import Window from '@/app/components/Window/Window';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS } from '@/app/lib/constants';
import type { Window as WindowType } from '@/app/lib/types';

function renderWindowContent(windowData: WindowType) {
  if (windowData.appType === 'notepad') {
    const text =
      typeof windowData.content === 'string'
        ? windowData.content
        : windowData.content?.body ??
          'Welcome to the Windows 3.1 portfolio prototype. This window is powered by the Phase 2 window manager.';

    return (
      <pre
        style={{
          backgroundColor: COLORS.WIN_WHITE,
          border: `1px solid ${COLORS.BORDER_SHADOW}`,
          color: COLORS.TEXT_BLACK,
          padding: 8,
          margin: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {text}
      </pre>
    );
  }

  if (windowData.appType === 'explorer') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          color: COLORS.TEXT_BLACK,
        }}
      >
        <strong>Program Manager</strong>
        <p style={{ margin: 0 }}>
          This is a placeholder for the future Program Manager experience. Phase 3 will wire up
          real app launchers and the taskbar.
        </p>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>Draggable outline windows</li>
          <li>Z-index focus management</li>
          <li>Minimize, maximize, and close buttons</li>
        </ul>
      </div>
    );
  }

  return (
    <div style={{ color: COLORS.TEXT_BLACK }}>
      {windowData.title} app content coming soon.
    </div>
  );
}

export default function Desktop() {
  const { windows, openWindow } = useWindowContext();
  const bootRef = useRef(false);

  useEffect(() => {
    if (bootRef.current) {
      return;
    }

    if (windows.length > 0) {
      bootRef.current = true;
      return;
    }

    bootRef.current = true;

    openWindow({
      title: 'Welcome.txt - Notepad',
      appType: 'notepad',
      position: { x: 120, y: 100 },
      size: { width: 420, height: 280 },
      icon: 'NP',
      content:
        'Hello! This draggable window is rendered through the new Phase 2 window system. Try dragging it around.',
    });

    openWindow({
      title: 'Program Manager',
      appType: 'explorer',
      position: { x: 360, y: 180 },
      size: { width: 420, height: 320 },
      icon: 'PM',
      content: null,
    });
  }, [openWindow, windows.length]);

  const desktopStyle = useMemo(
    () => ({
      position: 'relative' as const,
      backgroundColor: COLORS.DESKTOP_TEAL,
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      padding: 24,
      boxSizing: 'border-box' as const,
      color: COLORS.TEXT_WHITE,
      fontFamily: 'var(--font-sans)',
    }),
    [],
  );

  const wallpaperOverlayStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      inset: 0,
      backgroundImage:
        'linear-gradient(135deg, rgba(0, 0, 0, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
      pointerEvents: 'none' as const,
    }),
    [],
  );

  return (
    <main style={desktopStyle}>
      <div style={wallpaperOverlayStyle} aria-hidden />

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          color: COLORS.TEXT_WHITE,
          textShadow: '1px 1px 0 rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700 }}>Windows 3.1 Portfolio</div>
        <div style={{ fontSize: 13 }}>Phase 2 Window Manager Demo</div>
      </div>

      {windows.map((windowData) => (
        <Window
          key={windowData.id}
          id={windowData.id}
          title={windowData.title}
          icon={windowData.icon}
        >
          {renderWindowContent(windowData)}
        </Window>
      ))}

      {windows.length === 0 ? (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            color: COLORS.TEXT_WHITE,
          }}
        >
          No windows open. Use the window manager to launch an app.
        </div>
      ) : null}
    </main>
  );
}
