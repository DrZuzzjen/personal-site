import type { AppType, FileSystemItem, WindowContent } from '@/app/lib/types';
import type { Command } from '../types';
import { resolvePath } from '../utils/path';

interface LaunchContext {
  fileItem?: FileSystemItem | null;
}

interface LaunchConfig {
  title: string;
  appType: AppType;
  size: { width: number; height: number };
  icon?: string;
  content?: WindowContent;
}

interface LaunchDefinition {
  names: string[];
  description: string;
  build: (context: LaunchContext) => LaunchConfig;
}

const APP_LAUNCHERS: LaunchDefinition[] = [  {
    names: ['paint.exe', 'paint'],
    description: 'MS Paint clone',
    build: () => ({
      title: 'Paint.exe',
      appType: 'paint',
      size: { width: 520, height: 420 },
      icon: 'PT',
      content: {},
    }),
  },
  {
    names: ['minesweeper.exe', 'minesweeper'],
    description: 'Classic Minesweeper',
    build: () => ({
      title: 'Minesweeper.exe',
      appType: 'minesweeper',
      size: { width: 360, height: 320 },
      icon: 'MS',
      content: {
        rows: 9,
        cols: 9,
        mines: 10,
        difficulty: 'beginner',
        firstClickSafe: true,
      },
    }),
  },
  {
    names: ['notepad.exe', 'notepad'],
    description: 'Notepad text editor',
    build: ({ fileItem }) => ({
      title: `${fileItem?.name ?? 'Untitled'} - Notepad`,
      appType: 'notepad',
      size: { width: 480, height: 320 },
      icon: 'NP',
      content: {
        filePath: fileItem?.path ?? null,
        fileName: fileItem?.name ?? 'Untitled.txt',
        body: fileItem?.content ?? '',
        readOnly: fileItem?.isProtected ?? false,
      },
    }),
  },
  {
    names: ['terminal.exe', 'terminal', 'cmd'],
    description: 'MS-DOS terminal',
    build: () => ({
      title: 'Terminal',
      appType: 'terminal',
      size: { width: 800, height: 600 },
      icon: 'CMD',
      content: {},
    }),
  },
  {
    names: ['snake.exe', 'snake'],
    description: 'Snake arcade game',
    build: () => ({
      title: 'Snake.exe',
      appType: 'snake',
      size: { width: 860, height: 600 },
      icon: 'SN',
      content: {},
    }),
  },
  {
    names: ['camera.exe', 'camera'],
    description: 'Retro webcam app',
    build: () => ({
      title: 'Camera',
      appType: 'camera',
      size: { width: 720, height: 580 },
      icon: 'CM',
      content: {
        isActive: false,
        hasPermission: false,
        error: null,
      },
    }),
  },
  {
    names: ['tv.exe', 'tv'],
    description: 'Vintage TV experience',
    build: () => ({
      title: 'TV.exe',
      appType: 'tv',
      size: { width: 880, height: 720 },
      icon: 'TV',
      content: {},
    }),
  },
  {
    names: [
      'internet explorer.exe',
      'internet explorer',
      'iexplore.exe',
      'microsoft explorer',
      'browser.exe',
      'browser',
    ],
    description: 'Microsoft Explorer web browser',
    build: () => ({
      title: 'Microsoft Explorer',
      appType: 'browser',
      size: { width: 960, height: 720 },
      icon: 'IE',
      content: {
        initialUrl: 'https://www.bing.com/',
      },
    }),
  },
  {
    names: ['msn messenger.exe', 'messenger.exe', 'chatbot.exe', 'messenger'],
    description: 'MSN Messenger chat bot',
    build: () => ({
      title: 'MSN Messenger - Jean Francois',
      appType: 'chatbot',
      size: { width: 500, height: 640 },
      icon: 'IM',
      content: {},
    }),
  },
  {
    names: ['portfolio.exe', 'portfolio'],
    description: 'Portfolio Media Center',
    build: () => ({
      title: 'Portfolio Media Center',
      appType: 'portfolio',
      size: { width: 900, height: 700 },
      icon: 'PF',
      content: {},
    }),
  },
  {
    names: ['program manager.exe', 'explorer.exe', 'explorer'],
    description: 'Program Manager / File Explorer',
    build: ({ fileItem }) => ({
      title: `${fileItem?.name ?? 'Program Manager'}`,
      appType: 'explorer',
      size: { width: 520, height: 360 },
      icon: 'PM',
      content: { folderPath: fileItem?.path ?? null },
    }),
  },];

function getRandomPosition() {
  const baseX = 120;
  const baseY = 120;
  const offsetX = Math.floor(Math.random() * 120);
  const offsetY = Math.floor(Math.random() * 80);
  return { x: baseX + offsetX, y: baseY + offsetY };
}

function findLauncher(name: string) {
  const lower = name.toLowerCase();
  return APP_LAUNCHERS.find((launcher) => launcher.names.includes(lower));
}

function traverseItems(items: FileSystemItem[], predicate: (item: FileSystemItem) => boolean): FileSystemItem | null {
  for (const item of items) {
    if (predicate(item)) {
      return item;
    }

    if (item.children) {
      const match = traverseItems(item.children, predicate);
      if (match) {
        return match;
      }
    }
  }
  return null;
}

export function createAppCommands(): Command[] {
  const run: Command = {
    name: 'run',
    aliases: ['start', 'open'],
    description: 'Launch an application or executable',
    usage: 'run <app|path> [--list]',
    category: 'system',
    execute: ({ parsed, runtime, fileSystem, windows }) => {
      if (parsed.flags.list || parsed.flags.l) {
        return {
          lines: [
            { text: 'Available programs:', type: 'system' },
            ...APP_LAUNCHERS.map((launcher) => ({
              text: ` - ${launcher.names[0]} (${launcher.description})`,
            })),
          ],
        };
      }

      const rawTarget = parsed.args.join(' ').trim();
      if (!rawTarget) {
        return { error: 'run: missing application or path' };
      }

      if (!windows) {
        return { error: 'run: window system not available in current mode' };
      }

      const resolvedPath = resolvePath(runtime.currentPath, rawTarget);
      const normalizedName = rawTarget.toLowerCase();
      const exeName = normalizedName.endsWith('.exe') ? normalizedName : `${normalizedName}.exe`;

      let fileItem: FileSystemItem | null = fileSystem.getItemByPath(resolvedPath);
      if (!fileItem) {
        fileItem = traverseItems(fileSystem.rootItems, (item) => item.name.toLowerCase() === exeName);
      }

      const launcher = findLauncher(fileItem?.name ?? exeName);
      if (!launcher) {
        return { error: `run: unknown application '${rawTarget}'` };
      }

      const launchConfig = launcher.build({ fileItem });

      windows.openWindow({
        title: launchConfig.title,
        appType: launchConfig.appType,
        position: getRandomPosition(),
        size: launchConfig.size,
        icon: launchConfig.icon,
        content: launchConfig.content,
      });

      return {
        lines: [{ text: `Launching ${launchConfig.title}...`, type: 'system' }],
      };
    },
  };

  return [run];
}
