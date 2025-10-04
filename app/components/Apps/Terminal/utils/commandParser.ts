import type { ParsedCommand } from '../types';

const WHITESPACE_REGEX = /\s+/u;

const isWhitespace = (char: string) => WHITESPACE_REGEX.test(char);

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let escaping = false;

  for (const char of input) {
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }

    if (char === '\\') {
      escaping = true;
      continue;
    }

    if (inQuotes) {
      if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }
      current += char;
      continue;
    }

    if (char === '"' || char === '\'') {
      inQuotes = true;
      quoteChar = char;
      continue;
    }

    if (isWhitespace(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function splitFlags(rawArgs: string[]) {
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (const token of rawArgs) {
    if (token.startsWith('--') && token.length > 2) {
      const [namePart, ...valueParts] = token.slice(2).split('=');
      const name = namePart.trim().toLowerCase();
      if (!name) {
        args.push(token);
        continue;
      }
      const value = valueParts.length > 0 ? valueParts.join('=').trim() : 'true';
      flags[name] = value === 'true' ? true : value;
      continue;
    }

    if (token.startsWith('-') && token.length > 1) {
      const optionSegment = token.slice(1);
      for (const flagChar of optionSegment) {
        const normalized = flagChar.toLowerCase();
        flags[normalized] = true;
      }
      continue;
    }

    args.push(token);
  }

  return { args, flags };
}

export function parseCommand(input: string): ParsedCommand {
  if (!input.trim()) {
    return {
      input,
      tokens: [],
      command: '',
      args: [],
      flags: {},
      isEmpty: true,
    };
  }

  const tokens = tokenize(input.trim());
  const commandToken = tokens[0] ?? '';
  const { args, flags } = splitFlags(tokens.slice(1));

  return {
    input,
    tokens,
    command: commandToken.toLowerCase(),
    args,
    flags,
    isEmpty: !commandToken,
  };
}