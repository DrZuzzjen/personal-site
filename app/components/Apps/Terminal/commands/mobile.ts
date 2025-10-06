import type { Command, TerminalLineInput } from '../types';

export function createMobileCommands(): Command[] {
  return [
    {
      name: 'portfolio',
      description: 'Show main portfolio menu (mobile-friendly)',
      usage: 'portfolio',
      category: 'system',
      aliases: ['menu', 'main'],
      execute: async () => {
        const lines: TerminalLineInput[] = [
          { type: 'output', text: '' },
          { type: 'success', text: '╔═══════════════════════════════════════╗' },
          { type: 'success', text: '║   JEAN FRANCOIS GUTIERREZ            ║' },
          { type: 'success', text: '║   Developer Relations Engineer        ║' },
          { type: 'success', text: '╚═══════════════════════════════════════╝' },
          { type: 'output', text: '' },
          { type: 'output', text: '📱 MOBILE PORTFOLIO MENU' },
          { type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
          { type: 'output', text: '' },
          { type: 'warning', text: '📋 INFORMATION' },
          { type: 'output', text: '  about     - Learn about me' },
          { type: 'output', text: '  resume    - Download my resume' },
          { type: 'output', text: '  contact   - Get in touch' },
          { type: 'output', text: '  links     - Social media & links' },
          { type: 'output', text: '' },
          { type: 'warning', text: '💼 PROJECTS' },
          { type: 'output', text: '  gallery   - View my projects (ASCII)' },
          { type: 'output', text: '  projects  - List all projects' },
          { type: 'output', text: '' },
          { type: 'warning', text: '🤖 INTERACTIVE' },
          { type: 'output', text: '  chat      - Chat with AI assistant' },
          { type: 'output', text: '  matrix    - Matrix rain effect' },
          { type: 'output', text: '  hack      - Hacker typing demo' },
          { type: 'output', text: '' },
          { type: 'warning', text: '🛠️  SYSTEM' },
          { type: 'output', text: '  help      - Show all commands' },
          { type: 'output', text: '  clear     - Clear terminal' },
          { type: 'output', text: '  weather   - Check weather (demo)' },
          { type: 'output', text: '' },
          { type: 'system', text: '💡 TIP: Type any command above to get started!' },
          { type: 'output', text: '' },
        ];

        return { lines };
      },
    },
    {
      name: 'about',
      description: 'Learn about Jean Francois',
      usage: 'about',
      category: 'system',
      execute: async () => {
        const lines: TerminalLineInput[] = [
          { type: 'output', text: '' },
          { type: 'success', text: '👋 ABOUT ME' },
          { type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
          { type: 'output', text: '' },
          { type: 'warning', text: 'Jean Francois Gutierrez' },
          { type: 'output', text: 'Developer Relations Engineer @ Kluster.ai' },
          { type: 'output', text: '' },
          { type: 'output', text: '🎯 Specialized in:' },
          { type: 'output', text: '  • Generative AI & RAG Systems' },
          { type: 'output', text: '  • AI Agents & Automation' },
          { type: 'output', text: '  • Full-stack Development' },
          { type: 'output', text: '  • Developer Advocacy' },
          { type: 'output', text: '' },
          { type: 'output', text: '🏆 Achievements:' },
          { type: 'output', text: '  • $20M+ saved through AI automation' },
          { type: 'output', text: '  • 1 patent in AI/ML' },
          { type: 'output', text: '  • Hackathon organizer & mentor' },
          { type: 'output', text: '' },
          { type: 'output', text: '💻 Tech Stack:' },
          { type: 'output', text: '  • Next.js, React, TypeScript' },
          { type: 'output', text: '  • Python, FastAPI, LangChain' },
          { type: 'output', text: '  • OpenAI, Anthropic, Groq' },
          { type: 'output', text: '' },
          { type: 'system', text: '📧 Want to connect? Type "contact"' },
          { type: 'output', text: '' },
        ];

        return { lines };
      },
    },
    {
      name: 'contact',
      description: 'Get contact information',
      usage: 'contact',
      category: 'system',
      execute: async () => {
        const lines: TerminalLineInput[] = [
          { type: 'output', text: '' },
          { type: 'success', text: '📧 CONTACT INFORMATION' },
          { type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
          { type: 'output', text: '' },
          { type: 'warning', text: '📬 Email' },
          { type: 'output', text: '  jeanfrancois@kluster.ai' },
          { type: 'output', text: '' },
          { type: 'warning', text: '🔗 LinkedIn' },
          { type: 'output', text: '  linkedin.com/in/jfgutierrez' },
          { type: 'output', text: '' },
          { type: 'warning', text: '🐦 Twitter/X' },
          { type: 'output', text: '  @franzuzz' },
          { type: 'output', text: '' },
          { type: 'warning', text: '💻 GitHub' },
          { type: 'output', text: '  github.com/franzuzz' },
          { type: 'output', text: '' },
          { type: 'system', text: '💡 Type "links" to see all social media' },
          { type: 'output', text: '' },
        ];

        return { lines };
      },
    },
    {
      name: 'links',
      description: 'View all social media links',
      usage: 'links',
      category: 'system',
      aliases: ['social'],
      execute: async () => {
        const lines: TerminalLineInput[] = [
          { type: 'output', text: '' },
          { type: 'success', text: '🔗 SOCIAL LINKS' },
          { type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
          { type: 'output', text: '' },
          { type: 'output', text: '🌐 Website:    fran-ai.dev' },
          { type: 'output', text: '💼 LinkedIn:   linkedin.com/in/jfgutierrez' },
          { type: 'output', text: '🐦 Twitter:    @franzuzz' },
          { type: 'output', text: '💻 GitHub:     github.com/franzuzz' },
          { type: 'output', text: '📧 Email:      jeanfrancois@kluster.ai' },
          { type: 'output', text: '' },
          { type: 'system', text: '📱 Tap any link to open in new tab' },
          { type: 'output', text: '' },
        ];

        return { lines };
      },
    },
  ];
}
