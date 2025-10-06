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
      label: normalized, // Show the full path instead of just the folder name
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

function findDesktopPosition(fileSystem: FileSystemContext) {
  const preferredColumn = 1;
  const usedRows = fileSystem.desktopIcons
    .filter((icon) => icon.position.x === preferredColumn)
    .map((icon) => icon.position.y);

  let row = 0;
  while (usedRows.includes(row)) {
    row += 1;
  }

  return { x: preferredColumn, y: row };
}

function ensureDesktopIcon(fileSystem: FileSystemContext, item: FileSystemItem | null) {
  if (!item) {
    return;
  }

  if (!item.path.startsWith('/C:/Users/Guest/Desktop')) {
    return;
  }

  const hasIcon = fileSystem.desktopIcons.some((icon) => icon.fileSystemId === item.id);
  if (hasIcon) {
    return;
  }

  const position = findDesktopPosition(fileSystem);
  fileSystem.createDesktopIcon(item, position);
}

function buildTreeLines(item: FileSystemItem, prefix: string, isLast: boolean, lines: string[]) {
  const connector = isLast ? '`-- ' : '|-- ';
  lines.push(`${prefix}${connector}${item.name}`);

  if (item.type === 'folder' && item.children?.length) {
    const nextPrefix = `${prefix}${isLast ? '    ' : '|   '}`;
    const sortedChildren = [...item.children].sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'folder' ? -1 : 1;
    });

    sortedChildren.forEach((child, index) => {
      const childIsLast = index === sortedChildren.length - 1;
      buildTreeLines(child, nextPrefix, childIsLast, lines);
    });
  }
}

function createRenameCommand(): Command {
  return {
    name: 'mv',
    aliases: ['ren'],
    description: 'Rename or move a file/folder',
    usage: 'mv <source> <destination>',
    category: 'filesystem',
    execute: ({ parsed, runtime, fileSystem }) => {
      if (parsed.args.length !== 2) {
        return { error: 'mv: requires a source and destination path' };
      }

      const [sourceArg, destArg] = parsed.args;
      const sourcePath = resolvePath(runtime.currentPath, sourceArg);
      const destinationPath = resolvePath(runtime.currentPath, destArg);

      if (sourcePath === destinationPath) {
        return {
          lines: [{ text: 'mv: source and destination are identical', type: 'warning' }],
        };
      }

      const sourceItem = fileSystem.getItemByPath(sourcePath);
      if (!sourceItem) {
        return { error: `mv: cannot stat '${sourceArg}': No such file or directory` };
      }

      const destinationItem = fileSystem.getItemByPath(destinationPath);
      if (destinationItem?.type === 'folder') {
        return { error: 'mv: moving into directories is not supported yet' };
      }

      const destSegments = getPathSegments(destinationPath);
      if (destSegments.length === 0) {
        return { error: 'mv: invalid destination path' };
      }

      const destName = destSegments[destSegments.length - 1];
      const destParentSegments = destSegments.slice(0, -1);
      const destParentPath = destParentSegments.length ? `/${destParentSegments.join('/')}` : '/';

      const sourceParentSegments = getPathSegments(sourceItem.path).slice(0, -1);
      const sourceParentPath = sourceParentSegments.length ? `/${sourceParentSegments.join('/')}` : '/';

      if (destParentPath === '/' || sourceParentPath === '/') {
        return { error: 'mv: root-level operations are not supported' };
      }

      if (fileSystem.getItemByPath(destinationPath)) {
        return { error: `mv: cannot overwrite existing '${destArg}'` };
      }

      const parentFolder = fileSystem.getItemByPath(destParentPath);
      if (!parentFolder || parentFolder.type !== 'folder') {
        return { error: `mv: destination path not found: ${destParentPath}` };
      }

      if (sourceItem.isProtected) {
        return { error: `mv: cannot move '${sourceItem.name}': Access denied (protected)` };
      }

      if (sourceItem.type === 'folder') {
        return { error: 'mv: folder rename not implemented yet' };
      }

      const newFile = fileSystem.createFile(destParentPath, destName, sourceItem.content ?? '');
      if (!newFile) {
        return { error: 'mv: failed to create destination file' };
      }

      const deletionSuccess = fileSystem.deleteItem(sourceItem.path);
      if (!deletionSuccess) {
        return { error: `mv: failed to remove original '${sourceItem.name}'` };
      }

      ensureDesktopIcon(fileSystem, newFile);

      return {
        lines: [{ text: `Renamed ${sourceItem.name} -> ${destName}` }],
      };
    },
  };
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

  const tree: Command = {
    name: 'tree',
    description: 'Display folders in a tree structure',
    usage: 'tree [path]',
    category: 'filesystem',
    execute: ({ parsed, runtime, fileSystem }) => {
      const targetArg = parsed.args[0];
      const absolutePath = targetArg
        ? resolvePath(runtime.currentPath, targetArg)
        : runtime.currentPath;

      const listing = getDirectoryListing(fileSystem, absolutePath);
      if (!listing) {
        return { error: `tree: '${targetArg ?? absolutePath}' not found` };
      }

      if (listing.targetFile) {
        return { lines: [{ text: listing.targetFile.name }] };
      }

      const lines: string[] = [listing.label];
      const sortedEntries = [...listing.entries].sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'folder' ? -1 : 1;
      });

      sortedEntries.forEach((entry, index) => {
        const isLast = index === sortedEntries.length - 1;
        buildTreeLines(entry, '', isLast, lines);
      });

      return {
        lines: lines.map((text) => ({ text })),
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
      const created = fileSystem.getItemByPath(absolutePath);
      ensureDesktopIcon(fileSystem, created);

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

      ensureDesktopIcon(fileSystem, created);

      return {
        lines: [{ text: `Created file ${fileName}` }],
      };
    },
  };

  const echo: Command = {
    name: 'echo',
    description: 'Echo text, optionally writing to a file',
    usage: 'echo <text> [> file]',
    category: 'filesystem',
    execute: ({ parsed, runtime, fileSystem }) => {
      if (parsed.args.length === 0) {
        return { lines: [{ text: '' }] };
      }

      const redirectIndex = parsed.args.findIndex((arg) => arg === '>' || arg === '>>');

      if (redirectIndex === -1) {
        return {
          lines: [{ text: parsed.args.join(' ') }],
        };
      }

      const operator = parsed.args[redirectIndex];
      const message = parsed.args.slice(0, redirectIndex).join(' ');
      const target = parsed.args[redirectIndex + 1];

      if (!target) {
        return { error: 'echo: missing file target after redirection operator' };
      }

      const absolutePath = resolvePath(runtime.currentPath, target);
      const segments = getPathSegments(absolutePath);
      if (segments.length === 0) {
        return { error: 'echo: invalid target file' };
      }

      const fileName = segments[segments.length - 1];
      const parentSegments = segments.slice(0, -1);
      const parentPath = parentSegments.length ? `/${parentSegments.join('/')}` : '/';

      if (parentPath === '/') {
        return { error: 'echo: cannot write to root directory' };
      }

      const parent = fileSystem.getItemByPath(parentPath);
      if (!parent || parent.type !== 'folder') {
        return { error: `echo: parent path not found: ${parentPath}` };
      }

      const existingFile = fileSystem.getItemByPath(absolutePath);
      const isAppend = operator === '>>';

      if (existingFile && existingFile.type !== 'file') {
        return { error: `echo: ${fileName} is not a file` };
      }

      const newContent = isAppend
        ? `${existingFile?.content ?? ''}${existingFile?.content ? '\n' : ''}${message}`
        : message;

      if (existingFile) {
        const success = fileSystem.updateFileContent(existingFile.path, newContent);
        if (!success) {
          return { error: `echo: failed to write to ${fileName}` };
        }
        return {
          lines: [{ text: `${isAppend ? 'Appended to' : 'Overwrote'} ${fileName}` }],
        };
      }

      const created = fileSystem.createFile(parentPath, fileName, newContent);
      if (!created) {
        return { error: `echo: failed to create ${fileName}` };
      }

      ensureDesktopIcon(fileSystem, created);

      return {
        lines: [{ text: `Created ${fileName}` }],
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

  return [ls, tree, mkdir, touch, echo, remove, cat, createRenameCommand()];
}