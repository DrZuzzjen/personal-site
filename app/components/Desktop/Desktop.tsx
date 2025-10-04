'use client';

import React from 'react';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';
import { COLORS, Z_INDEX } from '@/app/lib/constants';
import DesktopIcon from './DesktopIcon';

interface DesktopProps {
  className?: string;
}

export default function Desktop({ className }: DesktopProps) {
  const {
    desktopIcons,
    deselectAllIcons
  } = useFileSystemContext();

  const handleDesktopClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only deselect if clicking on the desktop background itself
    if (event.target === event.currentTarget) {
      deselectAllIcons();
    }
  };

  return (
    <div
      className={className}
      onClick={handleDesktopClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: COLORS.DESKTOP_TEAL,
        zIndex: Z_INDEX.DESKTOP,
        overflow: 'hidden',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {desktopIcons.map((icon) => (
        <DesktopIcon
          key={icon.id}
          icon={icon}
        />
      ))}
    </div>
  );
}