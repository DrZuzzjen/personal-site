'use client';

import { useEffect, useState } from 'react';
import { COLORS } from '@/app/lib/constants';

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Clock() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000 * 30);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minWidth: 72,
        padding: '4px 8px',
        fontSize: 12,
        textAlign: 'center',
        backgroundColor: COLORS.WIN_GRAY,
        color: COLORS.TEXT_BLACK,
        borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
        borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
        borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
        borderRight: `2px solid ${COLORS.BORDER_DARK}`,
        fontFamily: 'var(--font-mono)',
      }}
      aria-label="Current time"
    >
      {time}
    </div>
  );
}
