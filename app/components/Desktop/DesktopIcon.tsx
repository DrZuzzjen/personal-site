'use client';

import React, { useState, useRef } from 'react';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS, DESKTOP_GRID } from '@/app/lib/constants';
import { useIconDrag } from './useIconDrag';
import type { DesktopIcon as DesktopIconType, FileSystemItem } from '@/app/lib/types';

interface DesktopIconProps {
  icon: DesktopIconType;
}

export default function DesktopIcon({ icon }: DesktopIconProps) {
  const [lastClickTime, setLastClickTime] = useState(0);
  const iconRef = useRef<HTMLDivElement>(null);
  
  const {
    selectIcon,
    getItemByPath,
    updateIconPosition
  } = useFileSystemContext();
  
  const { openWindow } = useWindowContext();
  
  // Get the file system item data for this icon
  const fileSystemItem: FileSystemItem | null = getItemByPath(`/Desktop/${icon.fileSystemId}`);
  
  // Use the drag hook for icon repositioning
  const { isDragging, handleMouseDown } = useIconDrag({
    iconId: icon.id,
    currentPosition: icon.position,
    onPositionChange: updateIconPosition,
  });

  if (!fileSystemItem) {
    // If we can't find the file system item, don't render the icon
    return null;
  }

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent desktop deselection
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    
    if (timeSinceLastClick < 500) {
      // Double-click detected - open the item
      handleDoubleClick();
    } else {
      // Single-click - select the icon
      selectIcon(icon.id);
    }
    
    setLastClickTime(now);
  };

  const handleDoubleClick = () => {
    // Open a window for this item
    if (fileSystemItem.type === 'folder') {
      openWindow({
        title: fileSystemItem.name,
        appType: 'explorer',
        position: { x: 100, y: 100 },
        size: { width: 400, height: 300 },
        content: { folderPath: fileSystemItem.path },
      });
    } else {
      // For files, open appropriate app based on extension
      const appType = getAppTypeForFile(fileSystemItem);
      openWindow({
        title: fileSystemItem.name,
        appType,
        position: { x: 100, y: 100 },
        size: { width: 400, height: 300 },
        content: { filePath: fileSystemItem.path, fileContent: fileSystemItem.content },
      });
    }
  };

  const getAppTypeForFile = (item: FileSystemItem): 'notepad' | 'paint' | 'explorer' => {
    if (item.extension === 'txt') return 'notepad';
    if (item.isSystem && item.name === 'My Computer') return 'explorer';
    return 'notepad'; // Default
  };

  const getIconDisplay = (item: FileSystemItem): { symbol: string; color: string } => {
    if (item.isSystem) {
      if (item.name === 'My Computer') return { symbol: '💻', color: '#000080' };
      if (item.name === 'Recycle Bin') return { symbol: '🗑️', color: '#808080' };
    }
    
    if (item.type === 'folder') {
      return { symbol: '📁', color: '#FFD700' };
    }
    
    if (item.extension === 'txt') {
      return { symbol: '📄', color: '#FFFFFF' };
    }
    
    return { symbol: '📄', color: '#C0C0C0' };
  };

  const iconDisplay = getIconDisplay(fileSystemItem);
  
  return (
    <div
      ref={iconRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: icon.position.x,
        top: icon.position.y,
        width: DESKTOP_GRID.ICON_WIDTH,
        height: DESKTOP_GRID.ICON_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'pointer',
        userSelect: 'none',
        backgroundColor: icon.isSelected ? 'rgba(0, 120, 215, 0.3)' : 'transparent',
        borderRadius: 4,
        padding: 4,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 32,
          height: 32,
          backgroundColor: iconDisplay.color,
          border: `2px solid ${COLORS.BORDER_SHADOW}`,
          borderTopColor: COLORS.BORDER_LIGHT,
          borderLeftColor: COLORS.BORDER_LIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          marginBottom: 4,
        }}
      >
        {iconDisplay.symbol}
      </div>
      
      {/* Label */}
      <div
        style={{
          color: COLORS.TEXT_WHITE,
          fontSize: '11px',
          textAlign: 'center',
          textShadow: '1px 1px 1px rgba(0, 0, 0, 0.8)',
          lineHeight: '12px',
          wordWrap: 'break-word',
          maxWidth: '70px',
        }}
      >
        {fileSystemItem.name}
      </div>
    </div>
  );
}