import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Message } from '../types';
import { createSalesAgent } from '../sales-agent';
import {
  validateAndSendEmailTool,
  validateSalesFields,
} from '../tools/email-tool';

const emailMock = vi.fn<
  [
    {
      name: string;
      email: string;
      projectType: string;
      budget: string;
      timeline: string;
      projectDescription: string;
      timestamp: string;
      source: string;
    },
  ],
  Promise<{ success: boolean; emailId?: string; error?: string }>
>();

vi.mock('ai', () => {
  const agentState = {
    lastConfig: null as any,
    generateCalls: [] as any[],
    nextResult: undefined as any,
  };

  class MockAgent {
    constructor(config: any) {
      agentState.lastConfig = config;
    }

    async generate(payload: any) {
      agentState.generateCalls.push(payload);

      if (agentState.nextResult) {
        const result = agentState.nextResult;
        agentState.nextResult = undefined;
        return result;
      }

      return {
        text: 'mock-response',
        steps: [],
        usage: {},
      };
    }
  }

  const mockTool = (config: any) => config;

  return {
    Experimental_Agent: MockAgent,
    tool: mockTool,
    __agentState: agentState,
  };
});

vi.mock('@/app/lib/ai/providers/groq', () => {
  const mockGroq = vi.fn(() => ({ id: 'mock-model' }));
  return { groq: mockGroq };
});

vi.mock('@/app/lib/email-utils', () => ({
  sendSalesInquiryEmail: emailMock,
}));

const agentState = (await import('ai')).__agentState as {
  lastConfig: any;
  generateCalls: any[];
  nextResult?: any;
};

beforeEach(() => {
  agentState.lastConfig = null;
  agentState.generateCalls = [];
  agentState.nextResult = undefined;
  emailMock.mockReset();
});

describe('validateSalesFields', () => {
  it('detects missing fields', () => {
    const result = validateSalesFields({
      name: null,
      email: '',
      projectType: 'Website',
      budget: null,
      timeline: null,
    });

    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain('name');
    expect(result.missingFields).toContain('budget');
    expect(result.issues[0]).toContain('Missing required fields');
  });

  it('validates proper data', () => {
    const result = validateSalesFields({
      name: 'John Doe',
      email: 'john@example.com',
      projectType: 'Web app',
      budget: '5000',
      timeline: '2 months',
    });

    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
});

describe('validateAndSendEmailTool', () => {
  it('sends email when fields are valid', async () => {
    emailMock.mockResolvedValueOnce({
      success: true,
      emailId: 'email-123',
    });

    const result = await validateAndSendEmailTool.execute({
      name: 'Alice',
      email: 'alice@example.com',
      projectType: 'AI chatbot',
      budget: '10000',
      timeline: 'Q4',
      conversationHistory: '[]',
    });

    expect(result.sent).toBe(true);
    expect(result.emailId).toBe('email-123');
    expect(result.validation.valid).toBe(true);
    expect(emailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Alice',
        projectDescription: '[]',
        source: 'MSN Messenger Chat',
      }),
    );
  });

  it('returns validation error for invalid email', async () => {
    const result = await validateAndSendEmailTool.execute({
      name: 'Bob',
      email: 'not-an-email',
      projectType: 'Website',
      budget: '2000',
      timeline: 'Soon',
      conversationHistory: '[]',
    });

    expect(result.sent).toBe(false);
    expect(result.error?.toLowerCase()).toContain('email');
    expect(result.validation.valid).toBe(false);
  });

  it('bubbles up email service errors', async () => {
    emailMock.mockResolvedValueOnce({
      success: false,
      error: 'service unavailable',
    });

    const result = await validateAndSendEmailTool.execute({
      name: 'Cara',
      email: 'cara@example.com',
      projectType: 'Website',
      budget: '3000',
      timeline: 'Next month',
      conversationHistory: '{}',
    });

    expect(result.sent).toBe(false);
    expect(result.error).toContain('service unavailable');
  });
});

describe('SalesAgent', () => {
  it('configures system prompt with current field status', () => {
    createSalesAgent({
      currentFields: {
        name: 'John Doe',
        email: null,
        projectType: 'Website',
        budget: null,
        timeline: null,
      },
      language: 'en',
    });

    expect(agentState.lastConfig).toBeTruthy();
    expect(agentState.lastConfig.system).toContain('John Doe');
    expect(agentState.lastConfig.system).toContain('NOT COLLECTED');
    expect(agentState.lastConfig.tools.validateAndSendEmail).toBeDefined();
  });

  it('supports multilingual prompts', () => {
    createSalesAgent({
      currentFields: {
        name: null,
        email: null,
        projectType: null,
        budget: null,
        timeline: null,
      },
      language: 'es',
    });

    expect(agentState.lastConfig.system).toContain('Eres un asistente');
  });

  it('stopWhen returns true when email was sent', () => {
    createSalesAgent({
      currentFields: {
        name: 'Alice',
        email: 'alice@example.com',
        projectType: 'AI chatbot',
        budget: '10000',
        timeline: 'Q4',
      },
    });

    const stopWhen = agentState.lastConfig.stopWhen;

    expect(
      stopWhen({
        steps: [
          {
            toolCalls: [
              {
                toolName: 'validateAndSendEmail',
                result: { sent: true },
              },
            ],
          },
        ],
      }),
    ).toBe(true);

    expect(
      stopWhen({
        steps: Array.from({ length: 10 }, () => ({})),
      }),
    ).toBe(true);

    expect(
      stopWhen({
        steps: [{ type: 'text' }],
      }),
    ).toBe(false);
  });

  it('passes conversation history to the agent', async () => {
    const agent = createSalesAgent({
      currentFields: {
        name: null,
        email: null,
        projectType: null,
        budget: null,
        timeline: null,
      },
    });

    const mockResult = {
      text: 'Thanks for the details!',
      steps: [],
      usage: {},
    };

    agentState.nextResult = mockResult;

    const messages: Message[] = [
      { role: 'user', content: 'Hi there' },
      { role: 'assistant', content: 'Hello! What is your name?' },
      { role: 'user', content: 'Sarah' },
    ];

    const result = await agent.generate(messages);

    expect(result).toEqual(mockResult);
    expect(agentState.generateCalls).toHaveLength(1);
    const forwardedMessages = agentState.generateCalls[0].messages;
    expect(forwardedMessages).toHaveLength(3);
    const lastMessage = forwardedMessages[2];
    expect(lastMessage.content).toContain('[Internal context for tools');
    expect(lastMessage.content).toContain('"content":"Sarah"');
  });
});
