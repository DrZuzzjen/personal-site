import type { AppType, FileSystemItem, WindowContent } from '@/app/lib/types';
import { APP_CONFIGS, getAppConfigByName } from '@/app/lib/app-configs';
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

// Helper function to create launch config using centralized app configs
function createLaunchConfig(appName: string, context: LaunchContext): LaunchConfig | null {
	const configResult = getAppConfigByName(appName);
	if (!configResult) return null;
	
	const { config } = configResult;
	
	// Handle special cases for file-based apps
	if (appName === 'notepad' || appName.includes('notepad')) {
		const content = {
			filePath: context.fileItem?.path ?? null,
			fileName: context.fileItem?.name ?? 'Untitled.txt',
			body: context.fileItem?.content ?? '',
			readOnly: context.fileItem?.isProtected ?? false,
		};
		return {
			title: `${context.fileItem?.name ?? 'Untitled'} - Notepad`,
			appType: 'notepad' as AppType,
			size: config.defaultSize,
			icon: config.icon,
			content,
		};
	}
	
	if (appName === 'explorer' || appName.includes('explorer')) {
		const content = { folderPath: context.fileItem?.path ?? null };
		return {
			title: context.fileItem?.name ?? 'Program Manager',
			appType: 'explorer' as AppType,
			size: config.defaultSize,
			icon: config.icon,
			content,
		};
	}
	
	// Default case - use centralized config directly
	return {
		title: config.title,
		appType: appName as AppType,
		size: config.defaultSize,
		icon: config.icon,
		content: config.defaultContent,
	};
}

function getRandomPosition() {
  const baseX = 120;
  const baseY = 120;
  const offsetX = Math.floor(Math.random() * 120);
  const offsetY = Math.floor(Math.random() * 80);
  return { x: baseX + offsetX, y: baseY + offsetY };
}

function findLauncher(name: string) {
  const lower = name.toLowerCase();
  // Check if any app config has this name or alias
  const configResult = getAppConfigByName(lower);
  return configResult ? { names: configResult.config.aliases || [configResult.name], appName: configResult.name } : null;
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
            ...Object.entries(APP_CONFIGS).map(([name, config]) => ({
              text: ` - ${config.aliases?.[0] || name} (${config.title})`,
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

      const launchConfig = createLaunchConfig(launcher.appName, { fileItem });
      if (!launchConfig) {
        return { error: `run: failed to create launch config for '${rawTarget}'` };
      }

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
