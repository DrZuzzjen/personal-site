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
      model: groq(process.env.GROQ_EXTRACTOR_MODEL || 'llama-3.3-70b-versatile'),

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
    // Format conversation for the agent
    const conversationText = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

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

      return {
        fields,
        confidence,
        extractedFrom: conversationHistory.length
      };

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
        extractedFrom: conversationHistory.length
      };
    }
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