import { createGroq } from '@ai-sdk/groq';

if (!process.env.GROQ_API_KEY) {
  console.error('Missing required environment variable: GROQ_API_KEY');
  throw new Error('Configuration error: Missing required API credentials');
}

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});