'use client';
import { useState, useCallback } from 'react';
import type { FileSystemItem, DesktopIcon, FileExtension } from '../lib/types';
import { INITIAL_FILE_SYSTEM, INITIAL_DESKTOP_ICONS, APP_EXECUTABLES, APP_DESKTOP_ICONS } from '../lib/constants';

export function useFileSystem() {
  const [rootItems, setRootItems] = useState<FileSystemItem[]>([
    ...INITIAL_FILE_SYSTEM,
    ...APP_EXECUTABLES,
  ]);

  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>([
    ...INITIAL_DESKTOP_ICONS,
    ...APP_DESKTOP_ICONS,
  ]);

  // Helper: Find item by path (recursive)
  const getItemByPath = useCallback((path: string): FileSystemItem | null => {
    const findInTree = (items: FileSystemItem[], targetPath: string): FileSystemItem | null => {
      for (const item of items) {
        if (item.path === targetPath) return item;
        if (item.children) {
          const found = findInTree(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(rootItems, path);
  }, [rootItems]);

  // Create a file
  const createFile = useCallback((parentPath: string, name: string, content: string = '') => {
    const parent = getItemByPath(parentPath);
    if (!parent || parent.type !== 'folder') {
      return null;
    }

    const newFile: FileSystemItem = {
      id: `file-${Date.now()}` ,
      name,
      type: 'file',
      extension: (name.split('.').pop() as FileExtension) || null,
      path: `${parentPath}/${name}`,
      content,
      isProtected: false,
      isSystem: false,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };

    setRootItems(prev => {
      const addToTree = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
          if (item.path === parentPath) {
            return {
              ...item,
              children: [...(item.children || []), newFile],
            };
          }
          if (item.children) {
            return { ...item, children: addToTree(item.children) };
          }
          return item;
        });
      };
      return addToTree(prev);
    });

    return newFile;
  }, [getItemByPath]);

  const updateFileContent = useCallback((path: string, content: string): boolean => {
    const target = getItemByPath(path);
    if (!target || target.type !== 'file') {
      return false;
    }

    const updatedAt = Date.now();

    setRootItems(prev => {
      const updateTree = (items: FileSystemItem[]): FileSystemItem[] =>
        items.map(item => {
          if (item.path === path && item.type === 'file') {
            return {
              ...item,
              content,
              modifiedAt: updatedAt,
            };
          }
          if (item.children) {
            return { ...item, children: updateTree(item.children) };
          }
          return item;
        });

      return updateTree(prev);
    });

    return true;
  }, [getItemByPath]);

  // Create a folder
  const createFolder = useCallback((parentPath: string, name: string) => {
    const parent = getItemByPath(parentPath);
    if (!parent || parent.type !== 'folder') return;

    const newFolder: FileSystemItem = {
      id: `folder-${Date.now()}`,
      name,
      type: 'folder',
      extension: 'folder',
      path: `${parentPath}/${name}`,
      children: [],
      isProtected: false,
      isSystem: false,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };

    setRootItems(prev => {
      const addToTree = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
          if (item.path === parentPath) {
            return {
              ...item,
              children: [...(item.children || []), newFolder],
            };
          }
          if (item.children) {
            return { ...item, children: addToTree(item.children) };
          }
          return item;
        });
      };
      return addToTree(prev);
    });
  }, [getItemByPath]);

  // Delete an item (returns false if protected)
  const deleteItem = useCallback((path: string): boolean => {
    const item = getItemByPath(path);
    if (!item || item.isProtected) return false;

    setRootItems(prev => {
      const removeFromTree = (items: FileSystemItem[]): FileSystemItem[] => {
        return items
          .filter(item => item.path !== path)
          .map(item => ({
            ...item,
            children: item.children ? removeFromTree(item.children) : undefined,
          }));
      };
      return removeFromTree(prev);
    });

    return true;
  }, [getItemByPath]);

  // Move an item (simple version - Phase 7 feature)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const moveItem = useCallback((_fromPath: string, _toPath: string): boolean => {
    // TODO: Implement in Phase 7 if needed
    console.warn('moveItem not yet implemented');
    return false;
  }, []);

  // Update desktop icon position
  const updateIconPosition = useCallback((iconId: string, position: { x: number; y: number }) => {
    setDesktopIcons(prev =>
      prev.map(icon =>
        icon.id === iconId ? { ...icon, position } : icon
      )
    );
  }, []);

  // Select an icon
  const selectIcon = useCallback((iconId: string) => {
    setDesktopIcons(prev =>
      prev.map(icon =>
        icon.id === iconId ? { ...icon, isSelected: true } : icon
      )
    );
  }, []);

  // Deselect all icons
  const deselectAllIcons = useCallback(() => {
    setDesktopIcons(prev =>
      prev.map(icon => ({ ...icon, isSelected: false }))
    );
  }, []);

  return {
    rootItems,
    desktopIcons,
    createFile,
    createFolder,
    updateFileContent,
    deleteItem,
    moveItem,
    getItemByPath,
    updateIconPosition,
    selectIcon,
    deselectAllIcons,
  };
}