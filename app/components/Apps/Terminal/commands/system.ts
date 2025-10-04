import type { Command } from '../types';

const WINDOWS_VERSION_LINES = [
  'Windows 3.1 Portfolio Edition',
  'Version 3.11.2025',
  'Copyright (C) 2025 Codex Industries',
];

const WHOAMI_LINES = [
  'You are: An awesome human exploring a Windows 3.1 portfolio',
  'Current status: Probably impressed ?',
  'Skills detected: Expert terminal user',
];

const SECRET_COMMANDS = [
  'hack',
  'matrix',
  'cowsay [message]',
  'fortune',
  'sudo rm -rf /',
  'sudo make me a sandwich',
  'konami',
];

function formatHistoryLine(index: number, value: string) {
  const paddedIndex = String(index + 1).padStart(2, '0');
  return `${paddedIndex}  ${value}`;
}

export function createSystemCommands(getCommands: () => Command[]): Command[] {
  const help: Command = {
    name: 'help',
    description: 'List available commands',
    usage: 'help [command]',
    category: 'system',
    execute: ({ parsed }) => {
      if (parsed.args[0]?.toLowerCase() === 'secrets') {
        return {
          lines: [
            { text: 'Psst... try these:', type: 'system' },
            ...SECRET_COMMANDS.map((secret) => ({ text: ` - ${secret}` })),
          ],
        };
      }

      const registry = getCommands();

      if (parsed.args.length > 0) {
        const lookup = parsed.args[0].toLowerCase();
        const command = registry.find((cmd) =>
          cmd.name === lookup || cmd.aliases?.some((alias) => alias === lookup)
        );
        if (!command || command.hidden) {
          return { error: `help: no help entry for '${lookup}'` };
        }

        const aliasText = command.aliases?.length ? `Aliases: ${command.aliases.join(', ')}` : '';

        return {
          lines: [
            { text: `${command.name.toUpperCase()}` },
            { text: `Usage: ${command.usage}` },
            { text: `Description: ${command.description}` },
            ...(aliasText ? [{ text: aliasText }] : []),
          ],
        };
      }

      const visibleCommands = registry.filter((command) => !command.hidden);
      const grouped = visibleCommands.reduce<Record<string, Command[]>>((acc, command) => {
        const key = command.category ?? 'general';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(command);
        return acc;
      }, {});

      const categoryOrder = Object.keys(grouped).sort();
      const lines = [
        { text: 'Available Commands:' },
        { text: '-------------------' },
      ];

      for (const category of categoryOrder) {
        lines.push({ text: `${category.toUpperCase()}:`, type: 'system' });
        for (const command of grouped[category]) {
          const aliasText = command.aliases && command.aliases.length
            ? ` (aliases: ${command.aliases.join(', ')})`
            : '';
          lines.push({ text: `  ${command.name}${aliasText} - ${command.description}` });
        }
        lines.push({ text: '' });
      }

      lines.push({ text: "Type 'help <command>' for more details.", type: 'system' });
      lines.push({ text: "Type 'help secrets' for hidden goodies.", type: 'system' });

      return { lines };
    },
  };

  const clear: Command = {
    name: 'clear',
    aliases: ['cls'],
    description: 'Clear the terminal screen',
    usage: 'clear',
    category: 'system',
    execute: () => ({ clear: true }),
  };

  const version: Command = {
    name: 'ver',
    description: 'Display system version information',
    usage: 'ver',
    category: 'system',
    execute: () => ({
      lines: WINDOWS_VERSION_LINES.map((line) => ({ text: line })),
    }),
  };

  const whoami: Command = {
    name: 'whoami',
    description: 'Show current user identity',
    usage: 'whoami',
    category: 'system',
    execute: () => ({
      lines: WHOAMI_LINES.map((line) => ({ text: line })),
    }),
  };

  const date: Command = {
    name: 'date',
    description: 'Show the current date',
    usage: 'date',
    category: 'system',
    execute: () => {
      const formatter = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return {
        lines: [{ text: formatter.format(new Date()) }],
      };
    },
  };

  const time: Command = {
    name: 'time',
    description: 'Show the current time',
    usage: 'time',
    category: 'system',
    execute: () => {
      const formatter = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      });
      return {
        lines: [{ text: formatter.format(new Date()) }],
      };
    },
  };

  const history: Command = {
    name: 'history',
    description: 'Show recently executed commands',
    usage: 'history [clear]',
    category: 'system',
    execute: ({ parsed, runtime }) => {
      if (parsed.args[0]?.toLowerCase() === 'clear') {
        runtime.clearHistory();
        return {
          lines: [{ text: 'Command history cleared.', type: 'system' }],
        };
      }

      if (runtime.history.length === 0) {
        return {
          lines: [{ text: 'No commands in history yet.', type: 'system' }],
        };
      }

      return {
        lines: runtime.history.map((entry, index) => ({
          text: formatHistoryLine(index, entry),
        })),
      };
    },
  };

  const exit: Command = {
    name: 'exit',
    description: 'Close the terminal session',
    usage: 'exit',
    category: 'system',
    execute: ({ runtime }) => ({
      lines: runtime.isMobile
        ? [
            { text: 'Cannot close mobile terminal. Try `poweroff` from main menu.', type: 'warning' },
          ]
        : [
            { text: 'Use the window controls or press ALT+F4 to close the Terminal.', type: 'system' },
          ],
    }),
  };

  return [help, clear, version, whoami, date, time, history, exit];
}