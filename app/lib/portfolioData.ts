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
    linkedin?: string;
    huggingface?: string;
  };
  year: number;
}

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'narrator-ai',
    type: 'video',
    icon: '🎥',
    title: 'Real-Time AI Narrator',
    tagline: 'David Attenborough narrates your life in real-time',
    description: '"In the heart of the domestic jungle, we observe the majestic Homo sapiens in its natural habitat." A simple and tremendously fun project that narrates your life in real time as if it were the famous Sir David Attenborough.',
    media: {
      type: 'video',
      thumbnail: '/portoflio/narrator.mp4',
      source: '/portoflio/narrator.mp4'
    },
    tech: ['Python', 'GPT-4 Vision', 'ElevenLabs', 'OpenCV', 'Real-time Processing'],
    links: {
      github: 'https://github.com/cbh123/narrator'
    },
    year: 2024
  },
  {
    id: 'random-predictor',
    type: 'project',
    icon: '🎯',
    title: 'Random Prediction Game',
    tagline: 'Testing human bias toward randomness',
    description: 'An experiment to see how biased humans are toward the meaning of random. Players predict 10 random numbers (1-99) and compete on a leaderboard. Uses Random.org API for true random numbers and Supabase for persistent leaderboard.',
    media: {
      type: 'image',
      thumbnail: '/portoflio/random-prediction.png'
    },
    tech: ['Streamlit', 'Python', 'Supabase', 'Random.org API', 'PostgreSQL'],
    links: {
      github: 'https://github.com/DrZuzzjen/random-prediction',
      demo: 'https://random-prediction.streamlit.app/'
    },
    year: 2024
  },
  {
    id: 'youclip',
    type: 'project',
    icon: '✂️',
    title: 'YouClip',
    tagline: 'YouTube video clipper with AI subtitles',
    description: 'A beautiful Streamlit application that allows users to create custom clips from YouTube videos. Features custom clipping, multiple formats (MP4, WebM, MKV), quality options, and AI-generated subtitles using Whisper running in the browser!',
    media: {
      type: 'image',
      thumbnail: '/portoflio/youclip.png'
    },
    tech: ['Streamlit', 'Python', 'Whisper AI', 'FFmpeg', 'YouTube API'],
    links: {
      github: 'https://github.com/DrZuzzjen/YouCLIP'
    },
    year: 2024
  },
  {
    id: 'llm-arena',
    type: 'project',
    icon: '🚥',
    title: 'LLM Arena',
    tagline: 'Speed benchmark for OpenAI, NVIDIA, and Groq',
    description: 'Where the heavyweights of language models go head-to-head. Compare speed and efficiency across OpenAI, NVIDIA, and Groq providers. Features real-time streaming, metrics & charts, and async backend powered by FastAPI + LangChain.',
    media: {
      type: 'gif',
      thumbnail: '/portoflio/llmarena.gif'
    },
    tech: ['FastAPI', 'Python', 'LangChain', 'Streamlit', 'Docker', 'Async'],
    links: {
      github: 'https://github.com/DrZuzzjen/LLM_Arena'
    },
    year: 2024
  },
  {
    id: 'emonaz',
    type: 'achievement',
    icon: '🏆',
    title: 'BASF Copilot AI Hackathon - 1st Place',
    tagline: 'Real-time emotion detection from facial expressions',
    description: 'AI Copilot Hackathon Winner. Three-model pipeline: (1) Face isolation, (2) Facial anchor point mapping, (3) Emotion translation. All client-side, pure front-end magic running entirely in the browser.',
    media: {
      type: 'image',
      thumbnail: '/portoflio/emonaz.jpeg'
    },
    impact: '1st Place Winner',
    tech: ['TensorFlow.js', 'Computer Vision', 'Client-side ML', 'Face Detection'],
    links: {
      github: 'https://github.com/DrZuzzjen/emosnaz'
    },
    year: 2024
  },
  {
    id: 'flux-finetuning',
    type: 'project',
    icon: '🎨',
    title: 'Fine-tuning Flux.1-dev with LoRA',
    tagline: 'Custom AI image generation with personal features',
    description: 'Fine-tuned Flux.1-dev using LoRA (Low-Rank Adaptation) to generate images with my facial features. Trained on A100 80GB for 75 minutes with less than 20 images. LoRA allows efficient model customization without retraining from scratch.',
    media: {
      type: 'image',
      thumbnail: '/portoflio/finetuning.jpeg'
    },
    tech: ['Flux.1-dev', 'LoRA', 'A100 GPU', 'Diffusion Models', 'HuggingFace'],
    impact: '€5.50 training cost, 2000 steps',
    links: {
      linkedin: 'https://www.linkedin.com/feed/update/urn:li:activity:7231922195994718209/',
      huggingface: 'https://huggingface.co/FranZuzz/franzuzz'
    },
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
