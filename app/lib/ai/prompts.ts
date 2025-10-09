import { readFileSync } from 'fs';
import { join } from 'path';

const PROMPTS_DIR = join(process.cwd(), 'app/lib/ai/prompts');

/**
 * Load prompt from text file
 */
function loadPrompt(filename: string): string {
  try {
    const filePath = join(PROMPTS_DIR, filename);
    return readFileSync(filePath, 'utf-8').trim();
  } catch (error) {
    console.error(`Failed to load prompt: ${filename}`, error);
    throw new Error(`Failed to load prompt: ${filename}`);
  }
}

/**
 * Load prompt with variable substitution
 */
function loadPromptWithVars(filename: string, variables: Record<string, string>): string {
  let prompt = loadPrompt(filename);

  // Replace variables in {variable_name} format
  Object.entries(variables).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });

  return prompt;
}

// Export all prompts
export const PROMPTS = {
  // Router prompt
  ROUTER: () => loadPrompt('router.txt'),

  // Casual chat prompt
  CASUAL_CHAT: () => loadPrompt('casual-chat.txt'),

  // Sales prompt with dynamic variables
  SALES: (variables: {
    name_status: string;
    email_status: string;
    project_type_status: string;
    budget_status: string;
    timeline_status: string;
    user_message: string;
    conversation_context: string;
  }) => loadPromptWithVars('sales.txt', variables),

  // Field extraction prompt
  FIELD_EXTRACTOR: (conversationHistory: string) =>
    loadPromptWithVars('extractor.txt', { conversation_history: conversationHistory }),

  // Field validation prompt
  FIELD_VALIDATOR: (fieldsData: string) =>
    loadPromptWithVars('validator.txt', { fields_data: fieldsData }),
} as const;

export default PROMPTS;