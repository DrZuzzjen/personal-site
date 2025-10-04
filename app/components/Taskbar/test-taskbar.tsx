'use client';

import { useEffect, useMemo } from 'react';
import Taskbar from './Taskbar';
import Window from '@/app/components/Window/Window';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS } from '@/app/lib/constants';

export default function TaskbarTestPage() {
  const { windows, openWindow } = useWindowContext();

  useEffect(() => {
    if (windows.length > 0) {
      return;
    }

    openWindow({
      title: 'Notepad - Sample',
      appType: 'notepad',
      position: { x: 120, y: 120 },
      size: { width: 420, height: 280 },
      icon: 'NP',
      content: 'This is a sample Notepad window for the Taskbar demo.',
    });

    openWindow({
      title: 'My Documents',
      appType: 'explorer',
      position: { x: 320, y: 180 },
      size: { width: 420, height: 320 },
      icon: 'FD',
      content: null,
    });
  }, [openWindow, windows.length]);

  const surfaceStyle = useMemo(
    () => ({
      minHeight: '100vh',
      backgroundColor: COLORS.DESKTOP_TEAL,
      padding: 16,
      position: 'relative' as const,
      boxSizing: 'border-box' as const,
      color: COLORS.TEXT_WHITE,
    }),
    [],
  );

  return (
    <div style={surfaceStyle}>
      {windows.map((windowItem) => (
        <Window key={windowItem.id} id={windowItem.id} title={windowItem.title} icon={windowItem.icon}>
          {typeof windowItem.content === 'string' ? windowItem.content : null}
        </Window>
      ))}

      <Taskbar />
    </div>
  );
}
