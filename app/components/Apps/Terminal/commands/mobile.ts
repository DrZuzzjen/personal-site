import type { Command, TerminalLineInput } from '../types';

async function sendChatMessage(message: string): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      throw new Error('Chat API failed');
    }

    const data = await response.json();
    return data.message || 'No response from AI';
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Failed to connect to chat'}`;
  }
}

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
    {
      name: 'chat',
      description: 'Chat with AI assistant',
      usage: 'chat <message>',
      category: 'fun',
      aliases: ['ai', 'ask'],
      execute: async ({ parsed }) => {
        const message = parsed.args.join(' ');

        if (!message) {
          const lines: TerminalLineInput[] = [
            { type: 'output', text: '' },
            { type: 'warning', text: '💬 TERMINAL CHAT' },
            { type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
            { type: 'output', text: '' },
            { type: 'output', text: 'Usage: chat <your message>' },
            { type: 'output', text: '' },
            { type: 'output', text: 'Examples:' },
            { type: 'output', text: '  chat hello' },
            { type: 'output', text: '  chat what projects do you have?' },
            { type: 'output', text: '  chat tell me about yourself' },
            { type: 'output', text: '' },
            { type: 'system', text: '💡 TIP: For full chat experience, open the Chatbot app on desktop!' },
            { type: 'output', text: '' },
          ];
          return { lines };
        }

        // Show "thinking..." message
        const thinkingLines: TerminalLineInput[] = [
          { type: 'output', text: '' },
          { type: 'system', text: '💭 Thinking...' },
        ];

        // Get AI response
        const reply = await sendChatMessage(message);

        // Format AI response with proper line breaks
        const replyLines = reply.split('\n').map((line) => ({
          type: 'output' as const,
          text: line,
        }));

        const lines: TerminalLineInput[] = [
          { type: 'output', text: '' },
          { type: 'success', text: '🤖 Jean Francois:' },
          ...replyLines,
          { type: 'output', text: '' },
        ];

        return { lines };
      },
    },
    {
      name: 'gallery',
      description: 'View project gallery (ASCII art)',
      usage: 'gallery',
      category: 'fun',
      aliases: ['projects'],
      execute: async () => {
        const lines: TerminalLineInput[] = [
          { type: 'output', text: '' },
          { type: 'success', text: '🎨 PROJECT GALLERY' },
          { type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
          { type: 'output', text: '' },

          // Project 1: Real-Time AI Narrator
          { type: 'warning', text: '┌─────────────────────────────────────┐' },
          { type: 'warning', text: '│  🎥 Real-Time AI Narrator (2024)   │' },
          { type: 'warning', text: '└─────────────────────────────────────┘' },
          { type: 'output', text: 'David Attenborough narrates your life' },
          { type: 'output', text: 'in real-time using AI' },
          { type: 'output', text: '' },
          { type: 'system', text: '🔗 github.com/cbh123/narrator' },
          { type: 'output', text: '' },

          // Project 2: Random Prediction Game
          { type: 'warning', text: '┌─────────────────────────────────────┐' },
          { type: 'warning', text: '│  🎲 Random Prediction Game (2024)  │' },
          { type: 'warning', text: '└─────────────────────────────────────┘' },
          { type: 'output', text: 'Challenge AI to predict your random' },
          { type: 'output', text: 'choices. Can you outsmart the model?' },
          { type: 'output', text: '' },
          { type: 'system', text: '🔗 github.com/DrZuzzjen/random-prediction' },
          { type: 'output', text: '' },

          // Project 3: YouClip
          { type: 'warning', text: '┌─────────────────────────────────────┐' },
          { type: 'warning', text: '│  📹 YouClip (2024)                  │' },
          { type: 'warning', text: '└─────────────────────────────────────┘' },
          { type: 'output', text: 'Semantic search for YouTube videos' },
          { type: 'output', text: 'using CLIP embeddings' },
          { type: 'output', text: '' },
          { type: 'system', text: '🔗 github.com/DrZuzzjen/YouCLIP' },
          { type: 'output', text: '' },

          // Project 4: LLM Arena
          { type: 'warning', text: '┌─────────────────────────────────────┐' },
          { type: 'warning', text: '│  ⚔️  LLM Arena (2024)               │' },
          { type: 'warning', text: '└─────────────────────────────────────┘' },
          { type: 'output', text: 'Compare different LLM models' },
          { type: 'output', text: 'side-by-side in real-time' },
          { type: 'output', text: '' },
          { type: 'system', text: '🔗 github.com/DrZuzzjen/LLM_Arena' },
          { type: 'output', text: '' },

          // Project 5: BASF Hackathon Winner
          { type: 'warning', text: '┌─────────────────────────────────────┐' },
          { type: 'warning', text: '│  🏆 BASF Hackathon Winner (2024)   │' },
          { type: 'warning', text: '└─────────────────────────────────────┘' },
          { type: 'output', text: 'AI-powered emotional analysis tool' },
          { type: 'output', text: '1st place winner!' },
          { type: 'output', text: '' },
          { type: 'system', text: '🔗 github.com/DrZuzzjen/emosnaz' },
          { type: 'output', text: '' },

          // Project 6: Flux Fine-tuning
          { type: 'warning', text: '┌─────────────────────────────────────┐' },
          { type: 'warning', text: '│  🎨 Flux Fine-tuning (2024)         │' },
          { type: 'warning', text: '└─────────────────────────────────────┘' },
          { type: 'output', text: 'Custom image generation model' },
          { type: 'output', text: 'fine-tuned for specific styles' },
          { type: 'output', text: '' },

          { type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
          { type: 'system', text: '💡 TIP: Type "portfolio" for more options' },
          { type: 'output', text: '' },
        ];

        return { lines };
      },
    },
  ];
}
