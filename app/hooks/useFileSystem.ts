'use client';
import { useState, useCallback, useEffect } from 'react';
import type { FileSystemItem, DesktopIcon, FileExtension } from '../lib/types';
import { INITIAL_FILE_SYSTEM, INITIAL_DESKTOP_ICONS, APP_EXECUTABLES, APP_DESKTOP_ICONS, PATH_SHORTCUTS } from '../lib/constants';

export function useFileSystem() {
  // Initialize filesystem with proper structure
  const initializeFileSystem = useCallback(() => {
    const fileSystem = [...INITIAL_FILE_SYSTEM];
    
    // Find the Program Files folder and add APP_EXECUTABLES to it
    const cDrive = fileSystem.find(item => item.id === 'c-drive');
    if (cDrive && cDrive.children) {
      const programFiles = cDrive.children.find(item => item.id === 'program-files');
      if (programFiles && programFiles.children) {
        programFiles.children.push(...APP_EXECUTABLES);
      }
    }
    
    return fileSystem;
  }, []);

  const [rootItems, setRootItems] = useState<FileSystemItem[]>(() => initializeFileSystem());

  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>([]);

  // Initialize desktop icons from localStorage or default
  useEffect(() => {
    const defaultDesktopIcons = [...INITIAL_DESKTOP_ICONS, ...APP_DESKTOP_ICONS];
    const DESKTOP_ICONS_VERSION = '1.1'; // Increment this when desktop icon structure changes

    const ensureDefaultIcons = (icons: DesktopIcon[]): DesktopIcon[] => {
      const existing = new Set(icons.map((icon) => icon.fileSystemId));
      const merged = [...icons];

      for (const defaultIcon of defaultDesktopIcons) {
        if (!existing.has(defaultIcon.fileSystemId)) {
          merged.push(defaultIcon);
        }
      }

      return merged;
    };

    // Check version to force migration when needed
    const savedVersion = localStorage.getItem('desktop-icons-version');
    const needsMigration = savedVersion !== DESKTOP_ICONS_VERSION;

    if (needsMigration) {
      console.log('[FileSystem] Desktop icons version mismatch, resetting to defaults');
      localStorage.setItem('desktop-icons-version', DESKTOP_ICONS_VERSION);
      localStorage.removeItem('desktop-icons'); // Clear old icons
      setDesktopIcons(defaultDesktopIcons);
      return;
    }

    const savedIcons = localStorage.getItem('desktop-icons');
    if (savedIcons) {
      try {
        const parsed = JSON.parse(savedIcons) as DesktopIcon[];
        if (Array.isArray(parsed)) {
          setDesktopIcons(ensureDefaultIcons(parsed));
        } else {
          setDesktopIcons(defaultDesktopIcons);
        }
      } catch (error) {
        console.error('Error loading desktop icons from localStorage:', error);
        setDesktopIcons(defaultDesktopIcons);
      }
    } else {
      setDesktopIcons(defaultDesktopIcons);
    }
  }, []);

  // Save desktop icons to localStorage whenever they change
  useEffect(() => {
    if (desktopIcons.length > 0) {
      localStorage.setItem('desktop-icons', JSON.stringify(desktopIcons));
    }
  }, [desktopIcons]);

  /**
   * Resolves shortcut/symlink paths to actual paths
   * Examples:
   *   '/My Computer/C:' -> '/C:/'
   *   '/My Computer/C:/Windows' -> '/C:/Windows'
   */
  const resolvePath = useCallback((path: string): string => {
    // Direct shortcut match
    if (PATH_SHORTCUTS[path]) {
      return PATH_SHORTCUTS[path];
    }

    // Handle nested paths like '/My Computer/C:/Windows/System32'
    // We need to check if the beginning of the path is a shortcut
    const parts = path.split('/').filter(Boolean);

    if (parts.length >= 2) {
      // Try matching progressively longer prefixes
      // Start with longest possible match (e.g., '/My Computer/C:')
      for (let i = Math.min(parts.length, 3); i >= 2; i--) {
        const prefix = '/' + parts.slice(0, i).join('/');
        if (PATH_SHORTCUTS[prefix]) {
          const resolvedBase = PATH_SHORTCUTS[prefix];
          const remaining = parts.slice(i).join('/');
          return remaining ? `${resolvedBase}${remaining}` : resolvedBase;
        }
      }
    }

    return path;
  }, []);

  // Helper: Find item by path (recursive) - automatically resolves shortcuts
  const getItemByPath = useCallback((path: string): FileSystemItem | null => {
    const resolvedPath = resolvePath(path);

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
    return findInTree(rootItems, resolvedPath);
  }, [rootItems, resolvePath]);

  // Create a file
  const createFile = useCallback((parentPath: string, name: string, content: string = '') => {
    const parent = getItemByPath(parentPath);
    if (!parent || parent.type !== 'folder') {
      return null;
    }

    const newFile: FileSystemItem = {
      id: `file-${Date.now()}`,
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

  // Create a desktop icon for an existing file
  const createDesktopIcon = useCallback((fileItem: FileSystemItem, position: { x: number; y: number }) => {
    // Check if an icon for this file already exists
    const existingIcon = desktopIcons.find(icon => icon.fileSystemId === fileItem.id);
    if (existingIcon) {
      console.log('Icon for this file already exists on desktop');
      return existingIcon;
    }

    const newIcon: DesktopIcon = {
      id: `icon-${Date.now()}`,
      fileSystemId: fileItem.id,
      position,
      isSelected: false,
    };

    setDesktopIcons(prev => [...prev, newIcon]);
    return newIcon;
  }, [desktopIcons]);

  // Create an image file with base64 data
  const createImageFile = useCallback((parentPath: string, name: string, imageData: string) => {
    const parent = getItemByPath(parentPath);
    if (!parent || parent.type !== 'folder') {
      return null;
    }

    const newFile: FileSystemItem = {
      id: `img-${Date.now()}`,
      name,
      type: 'file',
      extension: 'png',
      path: `${parentPath}/${name}`,
      imageData,
      isProtected: false,
      isSystem: false,
      icon: '🖼️',
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

    // If saving to Desktop, also create a desktop icon
    if (parentPath === '/C:/Users/Guest/Desktop') {
      // Find next available position
      const existingPositions = desktopIcons.map(icon => `${icon.position.x},${icon.position.y}`);
      let positionY = 0;
      const positionX = 1; // Second column for user files

      while (existingPositions.includes(`${positionX},${positionY}`)) {
        positionY++;
      }

      const newIcon: DesktopIcon = {
        id: `desktop-icon-${newFile.id}`,
        fileSystemId: newFile.id,
        position: { x: positionX, y: positionY },
        isSelected: false,
      };

      setDesktopIcons(prev => [...prev, newIcon]);
    }

    return newFile;
  }, [getItemByPath, desktopIcons]);

  return {
    rootItems,
    desktopIcons,
    createFile,
    createFolder,
    createImageFile,
    updateFileContent,
    deleteItem,
    moveItem,
    getItemByPath,
    resolvePath,
    updateIconPosition,
    selectIcon,
    deselectAllIcons,
    createDesktopIcon,
  };
}
