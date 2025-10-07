import { Agent } from '@openai/agents';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load prompt from file
const promptPath = join(process.cwd(), 'app/lib/ai/prompts/router.txt');
const routerPrompt = readFileSync(promptPath, 'utf-8');

export const routerAgent = new Agent({
  name: 'Router',
  instructions: routerPrompt,
  // Remove model specification to use default OpenAI model
});