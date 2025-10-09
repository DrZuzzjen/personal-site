import { Experimental_Agent as Agent } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';
import { PROMPTS } from '@/app/lib/ai/prompts';
import type { Message, SalesFields } from './types';
import { validateAndSendEmailTool } from './tools/email-tool';

export interface SalesAgentConfig {
  currentFields: SalesFields;
}

/**
 * Conversational sales agent that gathers customer details and sends them via email.
 */
export class SalesAgent {
  private readonly agent: Agent<any, any, any>;

  constructor(config: SalesAgentConfig) {
    const { currentFields } = config;

    const fieldStatus = this.formatFieldStatus(currentFields);
    const systemPrompt = this.buildSystemPrompt(fieldStatus);

    this.agent = new Agent<any, any, any>({
      model: groq(process.env.GROQ_SALES_MODEL || 'llama-3.3-70b-versatile'),
      system: systemPrompt,
      temperature: 0.8,
      tools: {
        validateAndSendEmail: validateAndSendEmailTool,
      },
      stopWhen: ({ steps }) => {
        // Stop immediately if ANY step has a successful email send
        const emailSent = steps.some((step: any) =>
          step.toolCalls?.some(
            (call: any) =>
              call.toolName === 'validateAndSendEmail' &&
              call.result?.sent === true,
          ),
        );

        // If email sent, stop regardless of step count
        if (emailSent) {
          console.log('[SalesAgent] Email sent successfully, stopping agent');
          return true;
        }

        // Otherwise, limit to 10 steps for safety
        if (steps.length >= 10) {
          console.log('[SalesAgent] Max steps reached without email send');
          return true;
        }

        return false;
      },
    });
  }

  /**
   * Generate the next agent response.
   */
  async generate(messages: Message[]) {
    if (messages.length === 0) {
      return this.agent.generate({ messages: [] as any });
    }

    const lastMessage = messages[messages.length - 1];
    const toolHistory = messages
      .filter(message => message.role !== 'system')
      .map(message => ({
        role: message.role,
        content: message.content.length > 500
          ? message.content.slice(-500)
          : message.content,
      }))
      .slice(-12);

    const conversationHistory = JSON.stringify(toolHistory);
    console.log('[SalesAgent] Prepared tool history', {
      totalMessages: messages.length,
      usedMessages: toolHistory.length,
      historyBytes: conversationHistory.length,
    });

    const messagesWithContext: Message[] = [
      ...messages.slice(0, -1),
      {
        ...lastMessage,
        content: `${lastMessage.content}\n\n[Internal context for tools: conversationHistory=${conversationHistory}]`,
      },
    ];

    return this.agent.generate({
      messages: messagesWithContext as any,
    });
  }

  private formatFieldStatus(fields: SalesFields): string {
    return [
      `name: ${fields.name || 'NOT COLLECTED'}`,
      `email: ${fields.email || 'NOT COLLECTED'}`,
      `projectType: ${fields.projectType || 'NOT COLLECTED'}`,
      `budget: ${fields.budget || 'NOT COLLECTED'}`,
      `timeline: ${fields.timeline || 'NOT COLLECTED'}`,
    ].join('\n');
  }

  private buildSystemPrompt(fieldStatus: string): string {
    const basePrompt = PROMPTS.SALES_AGENT(fieldStatus);

    // Add explicit safety instructions at the end
    const safetyNote = `

CRITICAL SAFETY CHECK - READ CAREFULLY:
Before calling validateAndSendEmail, verify:
1. name is NOT null and NOT "unknown" → ask "What's your name?" if missing
2. email is NOT null and NOT "unknown" → ask "What's your email?" if missing
3. projectType is NOT null and NOT "unknown" → already extracted from conversation

If ANY of the above is null/"unknown", DO NOT call the tool. Ask for the missing field instead.
`;

    return basePrompt + safetyNote;
  }
}

export function createSalesAgent(config: SalesAgentConfig): SalesAgent {
  return new SalesAgent(config);
}
