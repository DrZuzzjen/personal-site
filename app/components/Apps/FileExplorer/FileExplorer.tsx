'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS } from '@/app/lib/constants';
import type { FileSystemItem } from '@/app/lib/types';

function getParentPath(path: string | null): string | null {
  if (!path) {
    return null;
  }

  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) {
    return null;
  }

  segments.pop();
  return '/' + segments.join('/');
}

function sortItems(items: FileSystemItem[]) {
  return [...items].sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'folder' ? -1 : 1;
  });
}

function buildIconLabel(item: FileSystemItem) {
  if (item.type === 'folder') {
    return 'DIR';
  }

  if (item.extension) {
    return item.extension.toUpperCase().slice(0, 3);
  }

  return 'FILE';
}

export default function FileExplorer() {
  const { rootItems, getItemByPath } = useFileSystemContext();
  const { openWindow } = useWindowContext();

  const [currentPath, setCurrentPath] = useState<string | null>('/My Computer');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(null);
  }, [currentPath]);

  const currentFolder = useMemo(() => {
    if (!currentPath) {
      return null;
    }
    return getItemByPath(currentPath);
  }, [currentPath, getItemByPath]);

  const itemsInView = useMemo(() => {
    if (currentFolder && currentFolder.children) {
      return sortItems(currentFolder.children);
    }

    if (!currentPath) {
      return sortItems(rootItems);
    }

    return [] as FileSystemItem[];
  }, [currentFolder, currentPath, rootItems]);

  const parentPath = useMemo(() => getParentPath(currentPath), [currentPath]);

  const handleOpenFile = (item: FileSystemItem) => {
    if (item.type !== 'file') {
      return;
    }

    openWindow({
      title: `${item.name} - Notepad`,
      appType: 'notepad',
      position: { x: 180, y: 140 },
      size: { width: 460, height: 320 },
      icon: 'NP',
      content: item.content ?? '',
    });
  };

  const handleNavigate = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      setCurrentPath(item.path);
      return;
    }

    handleOpenFile(item);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: COLORS.WIN_GRAY,
        color: COLORS.TEXT_BLACK,
        fontFamily: 'var(--font-sans)',
        borderTop: '2px solid ' + COLORS.BORDER_LIGHT,
        borderLeft: '2px solid ' + COLORS.BORDER_HIGHLIGHT,
        borderBottom: '2px solid ' + COLORS.BORDER_SHADOW,
        borderRight: '2px solid ' + COLORS.BORDER_DARK,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 16,
          padding: '6px 8px',
          borderBottom: '1px solid ' + COLORS.BORDER_SHADOW,
          fontSize: 12,
        }}
      >
        <strong>File</strong>
        <strong>Edit</strong>
        <strong>View</strong>
        <strong>Help</strong>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 8px',
          borderBottom: '1px solid ' + COLORS.BORDER_SHADOW,
          fontSize: 12,
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (!currentPath) {
              return;
            }
            setCurrentPath(parentPath);
          }}
          disabled={!currentPath}
          style={{
            minWidth: 32,
            height: 24,
            borderTop: '2px solid ' + COLORS.BORDER_LIGHT,
            borderLeft: '2px solid ' + COLORS.BORDER_HIGHLIGHT,
            borderBottom: '2px solid ' + COLORS.BORDER_SHADOW,
            borderRight: '2px solid ' + COLORS.BORDER_DARK,
            backgroundColor: COLORS.WIN_GRAY,
            color: COLORS.TEXT_BLACK,
            cursor: currentPath ? 'pointer' : 'default',
          }}
          aria-label="Go up one level"
        >
          Up
        </button>
        <span>Path:</span>
        <input
          value={currentPath ?? 'Root'}
          readOnly
          style={{
            flex: 1,
            height: 22,
            padding: '0 6px',
            border: '1px solid ' + COLORS.BORDER_SHADOW,
            backgroundColor: COLORS.WIN_WHITE,
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '4px 8px',
          backgroundColor: COLORS.WIN_WHITE,
        }}
      >
        {itemsInView.length === 0 ? (
          <div style={{ fontSize: 12 }}>This folder is empty.</div>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {itemsInView.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <li
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  onDoubleClick={() => handleNavigate(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 6px',
                    border: isSelected
                      ? '1px dotted ' + COLORS.WIN_BLUE_LIGHT
                      : '1px solid transparent',
                    backgroundColor: isSelected ? '#dbe8ff' : 'transparent',
                    cursor: 'default',
                    userSelect: 'none',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      border: '1px solid ' + COLORS.BORDER_SHADOW,
                      backgroundColor: COLORS.WIN_GRAY,
                      fontWeight: 700,
                      fontSize: 10,
                    }}
                    aria-hidden
                  >
                    {buildIconLabel(item)}
                  </span>
                  <span>{item.name}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
