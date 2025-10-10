import { readFileSync } from 'fs';
import { join } from 'path';

const PROMPTS_DIR = join(process.cwd(), 'app/lib/ai/prompts');
const PROMPT_CACHE = new Map<string, string>();

/**
 * Load prompt from text file with module-level caching
 */
function loadPrompt(filename: string): string {
  const cached = PROMPT_CACHE.get(filename);
  if (cached) return cached;

  try {
    const filePath = join(PROMPTS_DIR, filename);
    const content = readFileSync(filePath, 'utf-8').trim();
    PROMPT_CACHE.set(filename, content);
    return content;
  } catch (error) {
    console.error(`Failed to load prompt: ${filename}`, error);
    throw new Error(`Failed to load prompt: ${filename}`);
  }
}

/**
 * Load prompt with variable substitution (safe from ReDoS)
 */
function loadPromptWithVars(filename: string, variables: Record<string, string>): string {
  const prompt = loadPrompt(filename);
  // Replace tokens of the form {key} using a single safe regex
  return prompt.replace(/\{([a-zA-Z0-9_]+)\}/g, (_m, key: string) => {
    if (!(key in variables)) return _m; // leave unknown tokens intact
    // Basic sanitation: strip braces and trim
    return String(variables[key]).replace(/[{}]/g, '').trim();
  });
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

  // Sales agent prompts (universal - responds in customer's language)
  SALES_AGENT: (fieldStatus: string) =>
    loadPromptWithVars('sales-agent-en.txt', { field_status: fieldStatus }),
} as const;

export default PROMPTS;