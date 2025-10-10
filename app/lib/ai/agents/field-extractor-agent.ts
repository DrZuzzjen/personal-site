import { Experimental_Agent as Agent, stepCountIs } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';
import type { Message, SalesFields, ExtractionResult } from './types';

/**
 * Field Extractor Agent
 *
 * Analyzes conversation history and extracts customer information:
 * - name
 * - email
 * - projectType
 * - budget
 * - timeline
 *
 * Returns structured JSON with extracted fields.
 */

export class FieldExtractorAgent {
  private agent: any; // Using any for now to avoid type issues

  constructor() {
    this.agent = new Agent({
      model: groq(process.env.GROQ_EXTRACTOR_MODEL || 'llama-3.1-8b-instant'),

      system: `You are a data extraction specialist. Analyze conversation history and extract customer information.

EXTRACT THESE FIELDS:
1. name: Customer's full name (look for "I'm X", "My name is X", "Call me X")
2. email: Customer's email address (format: xxx@xxx.xxx)
3. projectType: What they want to build (website, app, AI system, etc.)
4. budget: Their budget range (5k-10k, 10000-20000, etc.)
5. timeline: When they need it (1 month, 2-3 months, Q2 2025, etc.)

RULES:
- Only extract information explicitly mentioned
- If a field is not mentioned, return null
- Be precise - don't infer information
- Preserve exact wording for projectType, budget, timeline
- For name: extract full name if both first+last mentioned

OUTPUT FORMAT: JSON object with these keys:
{
  "name": "John Doe" or null,
  "email": "john@example.com" or null,
  "projectType": "E-commerce website" or null,
  "budget": "5000-10000" or null,
  "timeline": "2 months" or null
}

NEVER include explanations, only JSON.`,

      temperature: 0.3, // Low temperature for accuracy
      stopWhen: stepCountIs(1) // Single extraction, no tools
    });
  }

  /**
   * Extract fields from conversation history
   */
  async extract(conversationHistory: Message[]): Promise<ExtractionResult> {
    const relevantHistory = this.buildRelevantHistory(conversationHistory);
    console.log('[FieldExtractor] History lengths:', {
      original: conversationHistory.length,
      relevant: relevantHistory.length,
    });
    const lastUserMessage = this.getLastUserMessage(conversationHistory);

    const conversationText = relevantHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Format conversation for the agent
    const prompt = `Conversation history:\n\n${conversationText}\n\nExtract customer fields:`;

    try {
      const result = await this.agent.generate({ prompt });

      // Parse JSON response
      let jsonText = result.text.trim();

      // Handle markdown wrapping (```json ... ```)
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      // Remove any extra text before/after JSON
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const fields: SalesFields = JSON.parse(jsonText);

      // Calculate confidence based on number of fields found
      const fieldsFound = Object.values(fields).filter(v => v !== null).length;
      const confidence = (fieldsFound / 5) * 100;

      const extractionResult: ExtractionResult = {
        fields,
        confidence,
        extractedFrom: relevantHistory.length
      };

      return extractionResult;

    } catch (error) {
      console.error('[FieldExtractorAgent] Extraction failed:', error);

      // Return empty fields on error
      return {
        fields: {
          name: null,
          email: null,
          projectType: null,
          budget: null,
          timeline: null
        },
        confidence: 0,
        extractedFrom: relevantHistory.length
      };
    }
  }

  private buildRelevantHistory(history: Message[]): Message[] {
    const nonSystem = history.filter(msg => msg.role !== 'system');
    return nonSystem.length <= 12 ? nonSystem : nonSystem.slice(-12);
  }

  private getLastUserMessage(history: Message[]): string | null {
    for (let i = history.length - 1; i >= 0; i -= 1) {
      if (history[i].role === 'user') {
        return history[i].content;
      }
    }
    return null;
  }

  /**
   * Format fields for display (for debugging)
   */
  formatFields(fields: SalesFields): string {
    return Object.entries(fields)
      .map(([key, value]) => `${key}: ${value || '❌ NOT COLLECTED'}`)
      .join('\n');
  }
}

// Export singleton instance
export const fieldExtractorAgent = new FieldExtractorAgent();
