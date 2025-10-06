/**
 * Portfolio Data - Jean Francois Projects & Achievements
 */

export type PortfolioItemType = 'project' | 'achievement' | 'video' | 'talk';
export type MediaType = 'image' | 'gif' | 'video' | 'youtube';

export interface PortfolioItem {
  id: string;
  type: PortfolioItemType;
  icon: string; // Emoji
  title: string;
  tagline: string;
  description: string;
  media: {
    type: MediaType;
    thumbnail: string;
    source?: string; // Video URL or YouTube embed ID
    duration?: string; // For videos: "2:34"
  };
  tech?: string[]; // Tech stack for projects
  impact?: string; // For achievements: "20M+ in savings"
  links?: {
    github?: string;
    demo?: string;
    npm?: string;
    docs?: string;
    video?: string;
    certificate?: string;
  };
  year: number;
}

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'attenborough-ai',
    type: 'video',
    icon: '🎥',
    title: 'David Attenborough AI',
    tagline: 'AI narrates my coding in Attenborough\'s voice',
    description: 'Real-time AI video description using GPT-4 Vision and ElevenLabs voice cloning. The AI watches me code and provides nature documentary-style commentary in David Attenborough\'s iconic voice.',
    media: {
      type: 'youtube',
      thumbnail: '/portfolio/attenborough-thumb.jpg',
      source: 'dQw4w9WgXcQ', // Replace with actual YouTube ID
      duration: '2:34'
    },
    tech: ['Python', 'GPT-4 Vision', 'ElevenLabs', 'OpenCV'],
    links: {
      video: 'https://youtube.com/watch?v=...' // Replace with actual link
    },
    year: 2024
  },
  {
    id: 'patent-2025',
    type: 'achievement',
    icon: '📜',
    title: 'Invention Patent (2025)',
    tagline: 'AI-powered innovation at BASF',
    description: 'Received invention patent for AI automation system that generated 20M+ in savings. The system uses advanced RAG and multi-agent orchestration to automate complex workflows.',
    media: {
      type: 'image',
      thumbnail: '/portfolio/patent-certificate.jpg'
    },
    impact: '20M+ EUR in savings',
    links: {
      certificate: '/portfolio/patent.pdf'
    },
    year: 2025
  },
  {
    id: 'hackathon-daimler',
    type: 'achievement',
    icon: '🏆',
    title: 'Daimler Hackathon - 1st Place',
    tagline: 'AI-powered customer/supplier chat interface',
    description: 'Won first prize for developing an AI-powered chat interface for customer and supplier communications. The solution was implemented across Europe and Asia divisions.',
    media: {
      type: 'image',
      thumbnail: '/portfolio/daimler-hackathon.jpg'
    },
    impact: 'Deployed across Europe & Asia',
    tech: ['Python', 'NLP', 'Machine Learning'],
    year: 2019
  },
  {
    id: 'kluster-mcp',
    type: 'project',
    icon: '💻',
    title: 'Kluster MCP Server',
    tagline: 'AI code review for Claude Desktop & Cursor',
    description: 'MCP (Model Context Protocol) server that provides AI-powered code review, security scanning, and compliance checks directly in Claude Desktop and Cursor IDE. Integrates with Langchain, Dify, and n8n.',
    media: {
      type: 'gif',
      thumbnail: '/portfolio/kluster-demo.gif'
    },
    tech: ['TypeScript', 'Node.js', 'MCP Protocol', 'AI'],
    links: {
      github: 'https://github.com/klusterai/kluster-mcp',
      npm: 'https://www.npmjs.com/package/@klusterai/kluster-verify-code-mcp',
      docs: 'https://docs.kluster.ai'
    },
    year: 2025
  },
  {
    id: 'windows31-portfolio',
    type: 'project',
    icon: '🖥️',
    title: 'Windows 3.1 Portfolio (This Site!)',
    tagline: 'Full OS simulation as portfolio website',
    description: 'A fully functional Windows 3.1 operating system simulation serving as a portfolio. Features working apps (Paint, Minesweeper, Camera, TV), file system, boot sequence, and easter eggs. Built as a technical flex showcasing advanced frontend engineering.',
    media: {
      type: 'gif',
      thumbnail: '/portfolio/windows31-demo.gif'
    },
    tech: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'HTML5 Canvas', 'Groq AI'],
    links: {
      github: 'https://github.com/DrZuzzjen/personal-site',
      demo: 'https://web-indol-three-98.vercel.app'
    },
    year: 2025
  },
  {
    id: 'ai-hackathon-organizer',
    type: 'talk',
    icon: '🎤',
    title: 'AI Automation Hackathon Organizer',
    tagline: 'Multi-country hackathon across 3 countries',
    description: 'Organized and led AI Automation Hackathon with participants from 3 countries at BASF. Identified high-potential use cases and provided resources for developers to explore Gen AI potential.',
    media: {
      type: 'image',
      thumbnail: '/portfolio/hackathon-organizer.jpg'
    },
    impact: 'Participants from Germany, Spain, and Belgium',
    year: 2024
  },
  {
    id: 'rag-implementation',
    type: 'project',
    icon: '🤖',
    title: 'Advanced RAG System',
    tagline: 'Production-grade retrieval augmented generation',
    description: 'Built enterprise-grade RAG (Retrieval Augmented Generation) system with advanced chunking strategies, semantic search, and multi-modal support. Used for internal knowledge base at BASF.',
    media: {
      type: 'image',
      thumbnail: '/portfolio/rag-system.jpg'
    },
    tech: ['Python', 'Langchain', 'LlamaIndex', 'ChromaDB', 'OpenAI'],
    impact: 'Deployed to 500+ internal users',
    year: 2024
  },
  {
    id: 'workshop-gen-ai',
    type: 'talk',
    icon: '👨‍🏫',
    title: 'Gen AI Workshops & Training',
    tagline: 'Teaching AI to developers worldwide',
    description: 'Delivered comprehensive workshops on Gen AI, prompt engineering, RAG, and agentic systems. Topics include advanced prompting techniques, building AI agents, and best practices for production AI systems.',
    media: {
      type: 'image',
      thumbnail: '/portfolio/workshop.jpg'
    },
    impact: '200+ developers trained',
    tech: ['Langchain', 'Autogen', 'Crew AI', 'LlamaIndex'],
    year: 2024
  }
];

// Helper to get item by ID
export function getPortfolioItem(id: string): PortfolioItem | undefined {
  return PORTFOLIO_ITEMS.find(item => item.id === id);
}

// Filter by type
export function getPortfolioItemsByType(type: PortfolioItemType): PortfolioItem[] {
  return PORTFOLIO_ITEMS.filter(item => item.type === type);
}

// Get total count
export const PORTFOLIO_COUNT = PORTFOLIO_ITEMS.length;
