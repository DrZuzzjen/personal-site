import { Agent } from '@openai/agents';
import { readFileSync } from 'fs';
import { join } from 'path';

const promptPath = join(process.cwd(), 'app/lib/ai/prompts/casual-chat.txt');
const casualChatPrompt = readFileSync(promptPath, 'utf-8');

export const casualChatAgent = new Agent({
  name: 'CasualChat',
  instructions: casualChatPrompt,
});