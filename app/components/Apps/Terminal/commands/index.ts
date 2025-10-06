import type { Command } from '../types';
import { createFilesystemCommands } from './filesystem';
import { createNavigationCommands } from './navigation';
import { createSystemCommands } from './system';
import { createAppCommands } from './apps';
import { createEasterEggCommands } from './easterEggs';
import { createMobileCommands } from './mobile';

const registry: Command[] = [];

function register(commands: Command[]) {
  registry.push(...commands);
}

register(createNavigationCommands());
register(createFilesystemCommands());
register(createAppCommands());
register(createEasterEggCommands());
register(createMobileCommands());
register(createSystemCommands(() => registry));

export function getCommands(): Command[] {
  return registry;
}

export function findCommand(name: string): Command | undefined {
  const normalized = name.toLowerCase();
  return registry.find((command) =>
    command.name === normalized || command.aliases?.some((alias) => alias === normalized)
  );
}

export default registry;