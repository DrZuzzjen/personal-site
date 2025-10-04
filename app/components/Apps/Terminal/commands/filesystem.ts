import type { FileSystemContext, FileSystemItem } from '@/app/lib/types';
import type { Command } from '../types';
import { getPathSegments, normalizePath, resolvePath } from '../utils/path';

interface DirectoryListing {
  path: string;
  label: string;
  entries: FileSystemItem[];
  targetFile?: FileSystemItem;
}

function getDirectoryListing(fileSystem: FileSystemContext, path: string): DirectoryListing | null {
  const normalized = normalizePath(path);

  if (normalized === '/') {
    return {
      path: '/',
      label: '/',
      entries: fileSystem.rootItems,
    };
  }

  const target = fileSystem.getItemByPath(normalized);
  if (!target) {
    return null;
  }

  if (target.type === 'folder') {
    return {
      path: normalized,
      label: target.name,
      entries: target.children ?? [],
    };
  }

  return {
    path: normalized,
    label: target.name,
    entries: [],
    targetFile: target,
  };
}

function formatItemLine(item: FileSystemItem): string {
  const typeLabel = item.type === 'folder'
    ? '[DIR]'
    : `[${(item.extension ?? 'FILE').toUpperCase()}]`;

  return `${typeLabel}  ${item.name}`;
}

export function createFilesystemCommands(): Command[] {
  const ls: Command = {
    name: 'ls',
    aliases: ['dir'],
    description: 'List files and folders',
    usage: 'ls [path]',
    category: 'filesystem',
    execute: ({ parsed, runtime, fileSystem }) => {
      const targetArg = parsed.args[0];
      const absolutePath = targetArg
        ? resolvePath(runtime.currentPath, targetArg)
        : runtime.currentPath;

      const listing = getDirectoryListing(fileSystem, absolutePath);
      if (!listing) {
        return {
          error: `ls: cannot access '${targetArg ?? absolutePath}': No such file or directory`,
        };
      }

      if (listing.targetFile) {
        const file = listing.targetFile;
        return {
          lines: [
            { text: `${file.name} (${file.extension?.toUpperCase() ?? 'FILE'})` },
          ],
        };
      }

      const header = listing.label === '/' ? '/' : listing.label;
      const divider = '-'.repeat(Math.max(header.length, 8));
      const sortedEntries = [...listing.entries].sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'folder' ? -1 : 1;
      });

      const lines = sortedEntries.length
        ? sortedEntries.map((item) => ({ text: formatItemLine(item) }))
        : [{ text: '[empty]', type: 'system' }];

      return {
        lines: [
          { text: header },
          { text: divider },
          ...lines,
        ],
      };
    },
  };

  const mkdir: Command = {
    name: 'mkdir',
    aliases: ['md'],
    description: 'Create a new folder',
    usage: 'mkdir <folder-name>',
    category: 'filesystem',
    execute: ({ parsed, runtime, fileSystem }) => {
      if (parsed.args.length === 0) {
        return { error: 'mkdir: missing folder name' };
      }

      const folderArg = parsed.args[0];
      const absolutePath = resolvePath(runtime.currentPath, folderArg);
      const segments = getPathSegments(absolutePath);

      if (segments.length === 0) {
        return { error: 'mkdir: cannot create folder at root level' };
      }

      const folderName = segments[segments.length - 1];
      const parentSegments = segments.slice(0, -1);
      const parentPath = parentSegments.length ? `/${parentSegments.join('/')}` : '/';

      if (parentPath === '/') {
        return { error: 'mkdir: cannot create folder at root level' };
      }

      const parent = fileSystem.getItemByPath(parentPath);
      if (!parent || parent.type !== 'folder') {
        return { error: `mkdir: parent path not found: ${parentPath}` };
      }

      const existing = fileSystem.getItemByPath(absolutePath);
      if (existing) {
        return { error: `mkdir: ${folderName} already exists` };
      }

      fileSystem.createFolder(parentPath, folderName);

      return {
        lines: [{ text: `Created folder ${folderName} in ${parentPath}` }],
      };
    },
  };

  const touch: Command = {
    name: 'touch',
    description: 'Create an empty file',
    usage: 'touch <file-name>',
    category: 'filesystem',
    execute: ({ parsed, runtime, fileSystem }) => {
      if (parsed.args.length === 0) {
        return { error: 'touch: missing file name' };
      }

      const fileArg = parsed.args[0];
      const absolutePath = resolvePath(runtime.currentPath, fileArg);
      const segments = getPathSegments(absolutePath);

      if (segments.length === 0) {
        return { error: 'touch: invalid file name' };
      }

      const fileName = segments[segments.length - 1];
      const parentSegments = segments.slice(0, -1);
      const parentPath = parentSegments.length ? `/${parentSegments.join('/')}` : '/';

      if (parentPath === '/') {
        return { error: 'touch: cannot create files at root level' };
      }

      const parent = fileSystem.getItemByPath(parentPath);
      if (!parent || parent.type !== 'folder') {
        return { error: `touch: parent path not found: ${parentPath}` };
      }

      const existing = fileSystem.getItemByPath(absolutePath);
      if (existing) {
        return { error: `touch: ${fileName} already exists` };
      }

      const created = fileSystem.createFile(parentPath, fileName, '');
      if (!created) {
        return { error: 'touch: failed to create file' };
      }

      return {
        lines: [{ text: `Created file ${fileName}` }],
      };
    },
  };

  const remove: Command = {
    name: 'rm',
    aliases: ['del'],
    description: 'Delete a file or folder',
    usage: 'rm <path>',
    category: 'filesystem',
    execute: ({ parsed, runtime, fileSystem }) => {
      if (parsed.args.length === 0) {
        return { error: 'rm: missing target path' };
      }

      const targetArg = parsed.args[0];
      const absolutePath = resolvePath(runtime.currentPath, targetArg);
      const item = fileSystem.getItemByPath(absolutePath);

      if (!item) {
        return { error: `rm: cannot remove '${targetArg}': No such file or directory` };
      }

      if (item.isProtected) {
        return { error: `rm: cannot remove '${item.name}': Access denied (protected item)` };
      }

      const success = fileSystem.deleteItem(absolutePath);
      if (!success) {
        return { error: `rm: failed to delete '${item.name}'` };
      }

      return {
        lines: [{ text: `Deleted ${item.name}` }],
      };
    },
  };

  const cat: Command = {
    name: 'cat',
    aliases: ['type'],
    description: 'Display the contents of a text file',
    usage: 'cat <file>',
    category: 'filesystem',
    execute: ({ parsed, runtime, fileSystem }) => {
      if (parsed.args.length === 0) {
        return { error: 'cat: missing file path' };
      }

      const fileArg = parsed.args[0];
      const absolutePath = resolvePath(runtime.currentPath, fileArg);
      const item = fileSystem.getItemByPath(absolutePath);

      if (!item) {
        return { error: `cat: ${fileArg}: No such file` };
      }

      if (item.type !== 'file') {
        return { error: `cat: ${item.name} is a directory` };
      }

      if (item.extension && item.extension !== 'txt') {
        return {
          error: `cat: cannot display '${item.name}' (unsupported format)`,
        };
      }

      const content = item.content ?? '';
      if (!content.trim()) {
        return {
          lines: [{ text: `[${item.name}] is empty`, type: 'system' }],
        };
      }

      return {
        lines: content.split(/\r?\n/).map((line) => ({ text: line })),
      };
    },
  };

  return [ls, mkdir, touch, remove, cat];
}