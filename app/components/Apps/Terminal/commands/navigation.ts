import type { Command } from '../types';
import { normalizePath, resolvePath } from '../utils/path';

export function createNavigationCommands(): Command[] {
  const cd: Command = {
    name: 'cd',
    aliases: ['chdir'],
    description: 'Change the current directory',
    usage: 'cd [path]',
    category: 'navigation',
    execute: ({ parsed, runtime, fileSystem }) => {
      if (parsed.args.length === 0) {
        return {
          lines: [{ text: runtime.currentPath }],
        };
      }

      if (parsed.args.length > 1) {
        return {
          error: 'cd: too many arguments',
        };
      }

      const target = parsed.args[0];
      const nextPath = resolvePath(runtime.currentPath, target);

      if (nextPath === '/') {
        runtime.setCurrentPath('/');
        return {
          lines: [{ text: 'Changed directory to root (/)' }],
        };
      }

      const destination = fileSystem.getItemByPath(nextPath);
      if (!destination) {
        return {
          error: `The system cannot find the path specified: ${target}`,
        };
      }

      if (destination.type !== 'folder') {
        return {
          error: `${destination.name} is not a directory`,
        };
      }

      const normalizedPath = normalizePath(destination.path);
      runtime.setCurrentPath(normalizedPath);
      return {
        lines: [{ text: `Changed directory to ${normalizedPath}` }],
      };
    },
  };

  const pwd: Command = {
    name: 'pwd',
    description: 'Print the current working directory',
    usage: 'pwd',
    category: 'navigation',
    execute: ({ runtime }) => ({
      lines: [{ text: runtime.currentPath }],
    }),
  };

  return [cd, pwd];
}