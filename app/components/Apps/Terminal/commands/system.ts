import type { Command } from '../types';

export function createSystemCommands(getCommands: () => Command[]): Command[] {
  const help: Command = {
    name: 'help',
    description: 'List available commands',
    usage: 'help [command]',
    category: 'system',
    execute: ({ parsed }) => {
      const registry = getCommands();

      if (parsed.args.length > 0) {
        const lookup = parsed.args[0].toLowerCase();
        const command = registry.find((cmd) =>
          cmd.name === lookup || cmd.aliases?.some((alias) => alias === lookup)
        );
        if (!command || command.hidden) {
          return { error: `help: no help entry for '${lookup}'` };
        }

        return {
          lines: [
            { text: `${command.name}${command.aliases ? ` (${command.aliases.join(', ')})` : ''}` },
            { text: `Usage: ${command.usage}` },
            { text: `Description: ${command.description}` },
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

  return [help, clear];
}