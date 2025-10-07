import { Agent } from '@openai/agents';
import { readFileSync } from 'fs';
import { join } from 'path';

const promptPath = join(process.cwd(), 'app/lib/ai/prompts/sales.txt');
const salesPrompt = readFileSync(promptPath, 'utf-8');

export const salesAgent = new Agent({
  name: 'Sales',
  instructions: salesPrompt,
});