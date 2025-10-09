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
        const emailSent = steps.some((step: any) =>
          step.toolCalls?.some(
            (call: any) =>
              call.toolName === 'validateAndSendEmail' &&
              call.result?.sent === true,
          ),
        );

        return emailSent || steps.length >= 10;
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

    const conversationHistory = JSON.stringify(messages);
    const lastMessage = messages[messages.length - 1];

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
    return PROMPTS.SALES_AGENT(fieldStatus);
  }
}

export function createSalesAgent(config: SalesAgentConfig): SalesAgent {
  return new SalesAgent(config);
}
