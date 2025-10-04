import type { CommandContext, Command } from '../types';

const FORTUNE_QUOTES = [
  '"There are only two hard things in Computer Science: cache invalidation and naming things." - Phil Karlton',
  '"Talk is cheap. Show me the code." - Linus Torvalds',
  '"The best error message is the one that never shows up." - Thomas Fuchs',
  '"Premature optimization is the root of all evil." - Donald Knuth',
  '"Simplicity is the soul of efficiency." - Austin Freeman',
];

const COW_TEMPLATE = [
  ' ____________',
  '< {message} >',
  ' ------------',
  '        \\   ^__^',
  '         \\  (oo)\\_______',
  '            (__)\\       )\\/\\',
  '                ||----w |',
  '                ||     ||',
];

interface HackSessionState {
  active: boolean;
  previousPath: string;
}

const HACK_FILES: Record<string, string[]> = {
  'secret_project.txt': [
    'Project: Quantum Portfolio',
    'Status : In active development',
    'Notes  : Uses AI agents to build retro-operating systems in the browser.',
  ],
  'resume_deluxe.pdf': [
    '[Accessing resume... launching download modal in real build]',
    'Mock download started. (Imagine a PDF flying toward you!)',
  ],
  'easter_egg.exe': [
    'Achievement unlocked: MAINFRAME MASTER',
    'You found the secret executable!',
  ],
  'the_matrix.dat': [
    '01001101 01101111 01110010 01110000 01101000 01101001 01110101 01110011',
    'Follow the white rabbit.',
  ],
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHackSession(context: CommandContext): HackSessionState | null {
  return (context.runtime.session.hack as HackSessionState | undefined) ?? null;
}

async function runHackIntro(context: CommandContext) {
  const messages = [
    '[INITIALIZING CYBERDECK v2.3...]',
    '[SCANNING FOR VULNERABILITIES...]',
    '   ========¦¦¦¦¦¦¦¦ 40%',
    '[FOUND: OPEN PORT 8080]',
    '[EXPLOITING BUFFER OVERFLOW...]',
    '   ================¦¦¦¦ 80%',
    '[BYPASSING FIREWALL...]',
    '   ====================¦¦ 95%',
    '[INJECTING PAYLOAD...]',
    '   ====================== 100%',
    '[SUCCESS! ROOT ACCESS GRANTED]',
  ];

  for (const line of messages) {
    context.runtime.print({ text: line, type: 'system' });
    await delay(400);
  }

  context.runtime.printLines([
    { text: 'You are now in: mainframe.portfolio.sys', type: 'success' },
    { text: 'Available files:', type: 'system' },
    { text: '  - secret_project.txt' },
    { text: '  - resume_deluxe.pdf' },
    { text: '  - easter_egg.exe' },
    { text: '  - the_matrix.dat' },
    { text: "Type 'hack cat <file>' to view files.", type: 'system' },
    { text: "Type 'hack run easter_egg.exe' for something fun.", type: 'system' },
    { text: "Type 'hack exit' to leave the mainframe.", type: 'system' },
  ]);
}

async function handleHackCommand(context: CommandContext): Promise<void | { error: string }> {
  const { parsed, runtime } = context;
  const hackSession = getHackSession(context);

  if (parsed.args.length === 0) {
    if (hackSession?.active) {
      runtime.print({ text: 'Already jacked into the mainframe!', type: 'warning' });
      return;
    }

    await runHackIntro(context);
    runtime.setMode('hack');
    runtime.setSessionValue('hack', {
      active: true,
      previousPath: runtime.currentPath,
    } satisfies HackSessionState);
    runtime.setCurrentPath('mainframe://root');
    return;
  }

  const subCommand = parsed.args[0].toLowerCase();

  if (subCommand === 'exit') {
    if (!hackSession?.active) {
      return { error: 'hack: not inside mainframe' };
    }
    runtime.print({ text: 'Disengaging from mainframe...', type: 'system' });
    await delay(300);
    runtime.clearSessionKey('hack');
    runtime.setMode('normal');
    runtime.setCurrentPath(hackSession.previousPath || '/Desktop');
    runtime.print({ text: 'Back in the safe zone.', type: 'success' });
    return;
  }

  if (!hackSession?.active) {
    return { error: 'hack: establish connection first by typing `hack`' };
  }

  if (subCommand === 'cat') {
    const target = parsed.args[1]?.toLowerCase();
    if (!target) {
      return { error: 'hack cat: missing file name' };
    }

    const content = HACK_FILES[target];
    if (!content) {
      return { error: `hack cat: file not found: ${target}` };
    }

    runtime.printLines(content.map((line) => ({ text: line }))); 
    return;
  }

  if (subCommand === 'run') {
    const target = parsed.args[1]?.toLowerCase();
    if (target === 'easter_egg.exe') {
      runtime.printLines([
        { text: 'Executing easter_egg.exe...', type: 'system' },
        { text: '¦¦¦ YOU ARE THE CHOSEN ONE ¦¦¦', type: 'success' },
        { text: 'Achievement unlocked: MAINFRAME MASTER', type: 'system' },
      ]);
      return;
    }

    return { error: `hack run: executable not found: ${target ?? '?'} ` };
  }

  return { error: `hack: unknown subcommand '${subCommand}'` };
}

function handleMatrix(context: CommandContext) {
  context.runtime.print({ text: 'Booting Matrix rain...', type: 'system' });
  context.runtime.setEffect('matrix');
  setTimeout(() => {
    context.runtime.setEffect(null);
    context.runtime.print({ text: 'Matrix sequence complete.', type: 'system' });
  }, 10_000);
}

function handleCowsay(message: string) {
  const text = message.length ? message : 'Moo!';
  const bubbleWidth = text.length + 2;
  const borderTop = ' ' + '_'.repeat(bubbleWidth);
  const borderBottom = ' ' + '-'.repeat(bubbleWidth);
  const messageLine = <  >;
  return [borderTop, messageLine, borderBottom, ...COW_ART];
}

function handleFortune(): string {
  const index = Math.floor(Math.random() * FORTUNE_QUOTES.length);
  return FORTUNE_QUOTES[index];
}

function handleSudo(context: CommandContext): { lines?: string[]; error?: string } {
  const { parsed, runtime } = context;
  if (parsed.args.length === 0) {
    return { error: 'sudo: command required' };
  }

  const commandLine = parsed.args.join(' ').toLowerCase();

  if (commandLine === 'rm -rf /') {
    return {
      lines: [
        '*** WARNING ***',
        'Permission denied: Are you trying to delete the universe?',
        'Nice try, hackerman. ??',
      ],
    };
  }

  if (commandLine === 'make me a sandwich') {
    const attempts = (runtime.session.sandwichAttempts as number | undefined) ?? 0;
    if (attempts === 0) {
      runtime.setSessionValue('sandwichAttempts', 1);
      return {
        lines: ['What? Make it yourself.'],
      };
    }

    runtime.clearSessionKey('sandwichAttempts');
    return {
      lines: [
        '[sudo] password for user: ********',
        'Access granted. Here is your sandwich: ??',
      ],
    };
  }

  return {
    lines: [`sudo: ${commandLine}: command not allowed`],
  };
}

export function createEasterEggCommands(): Command[] {
  const hack: Command = {
    name: 'hack',
    description: 'Enter the hack-the-mainframe simulator',
    usage: 'hack | hack <subcommand>',
    category: 'hidden',
    execute: (context) => handleHackCommand(context),
  };

  const matrix: Command = {
    name: 'matrix',
    description: 'Trigger Matrix-style rain animation',
    usage: 'matrix',
    category: 'hidden',
    execute: (context) => {
      handleMatrix(context);
    },
  };

  const cowsay: Command = {
    name: 'cowsay',
    description: 'Make a friendly ASCII cow speak',
    usage: 'cowsay <message>',
    category: 'fun',
    execute: ({ parsed }) => {
      const message = parsed.args.join(' ');
      const cowLines = handleCowsay(message);
      return {
        lines: cowLines.map((text) => ({ text })),
      };
    },
  };

  const fortune: Command = {
    name: 'fortune',
    description: 'Display a random programming fortune',
    usage: 'fortune',
    category: 'fun',
    execute: () => ({
      lines: [{ text: handleFortune() }],
    }),
  };

  const sudo: Command = {
    name: 'sudo',
    description: 'Pretend to elevate privileges',
    usage: 'sudo <command>',
    category: 'fun',
    hidden: true,
    execute: (context) => {
      const result = handleSudo(context);
      if (result.error) {
        return { error: result.error };
      }
      return {
        lines: (result.lines ?? []).map((text) => ({ text, type: 'system' })),
      };
    },
  };

  const konami: Command = {
    name: 'konami',
    description: 'Unlock a classic achievement',
    usage: 'konami',
    category: 'fun',
    hidden: true,
    execute: ({ runtime }) => ({
      lines: [
        { text: '? ? ? ? ? ? ? ? B A', type: 'system' },
        { text: 'ACHIEVEMENT UNLOCKED: Old School Gamer', type: 'success' },
      ],
    }),
  };

  const rickroll: Command = {
    name: 'rickroll',
    description: 'Never gonna give you up',
    usage: 'rickroll',
    category: 'fun',
    hidden: true,
    execute: () => ({
      lines: [
        { text: 'Never gonna give you up, never gonna let you down...' },
        { text: '?? Consider yourself rickrolled inside a DOS shell.' },
      ],
    }),
  };

  return [hack, matrix, cowsay, fortune, sudo, konami, rickroll];
}