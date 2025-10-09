import { describe, it, expect, beforeAll, vi } from 'vitest';
import type { Message } from '../types';

// Mock environment variables
vi.stubEnv('GROQ_API_KEY', 'test-key');

// Mock the groq provider
vi.mock('@/app/lib/ai/providers/groq', () => ({
  groq: vi.fn(() => ({
    model: 'mocked-model',
  })),
}));

// Mock the AI SDK
vi.mock('ai', () => ({
  Experimental_Agent: vi.fn().mockImplementation(() => ({
    generate: vi.fn(),
  })),
  stepCountIs: vi.fn(),
}));

describe('FieldExtractorAgent', () => {
  beforeAll(async () => {
    // Dynamic import after mocks are set up
    const { fieldExtractorAgent } = await import('../field-extractor-agent');
    
    // Mock the agent's generate method
    vi.spyOn(fieldExtractorAgent as any, 'agent', 'get').mockReturnValue({
      generate: vi.fn().mockImplementation(({ prompt }) => {
        // Mock responses based on prompt content
        if (prompt.includes('John Doe') && prompt.includes('e-commerce')) {
          return Promise.resolve({
            text: `{
              "name": "John Doe",
              "email": "john.doe@example.com",
              "projectType": "e-commerce website",
              "budget": "5000-10000 dollars",
              "timeline": "2 months"
            }`
          });
        } else if (prompt.includes('John') && prompt.includes('website')) {
          return Promise.resolve({
            text: `{
              "name": "John",
              "email": null,
              "projectType": "website",
              "budget": null,
              "timeline": null
            }`
          });
        } else if (prompt.includes('Sarah Johnson')) {
          return Promise.resolve({
            text: `{
              "name": "Sarah Johnson",
              "email": "sarah@startup.com",
              "projectType": "AI chatbot",
              "budget": "$8000",
              "timeline": "3 months"
            }`
          });
        } else if (prompt.includes('Carlos García')) {
          return Promise.resolve({
            text: `{
              "name": "Carlos García",
              "email": "carlos.garcia@empresa.es",
              "projectType": "tienda online",
              "budget": null,
              "timeline": null
            }`
          });
        } else if (prompt.includes('Something cool')) {
          return Promise.resolve({
            text: `{
              "name": null,
              "email": null,
              "projectType": null,
              "budget": null,
              "timeline": null
            }`
          });
        } else {
          // Empty conversation
          return Promise.resolve({
            text: `{
              "name": null,
              "email": null,
              "projectType": null,
              "budget": null,
              "timeline": null
            }`
          });
        }
      })
    });
  });

  describe('extract()', () => {
    it('should extract all fields from complete conversation', async () => {
      const { fieldExtractorAgent } = await import('../field-extractor-agent');
      
      const messages: Message[] = [
        { role: 'user', content: 'I want to build an e-commerce website' },
        { role: 'assistant', content: 'Great! What is your name?' },
        { role: 'user', content: 'My name is John Doe' },
        { role: 'assistant', content: 'Nice to meet you John! What is your email?' },
        { role: 'user', content: 'john.doe@example.com' },
        { role: 'assistant', content: 'What is your budget range?' },
        { role: 'user', content: '5000-10000 dollars' },
        { role: 'assistant', content: 'When do you need this completed?' },
        { role: 'user', content: 'In 2 months' }
      ];

      const result = await fieldExtractorAgent.extract(messages);

      expect(result.fields.name).toBe('John Doe');
      expect(result.fields.email).toBe('john.doe@example.com');
      expect(result.fields.projectType).toBe('e-commerce website');
      expect(result.fields.budget).toBe('5000-10000 dollars');
      expect(result.fields.timeline).toBe('2 months');
      expect(result.confidence).toBe(100);
    });

    it('should handle partial information', async () => {
      const { fieldExtractorAgent } = await import('../field-extractor-agent');
      
      const messages: Message[] = [
        { role: 'user', content: 'Hi, I need a website' },
        { role: 'assistant', content: 'What is your name?' },
        { role: 'user', content: 'John' }
      ];

      const result = await fieldExtractorAgent.extract(messages);

      expect(result.fields.name).toBe('John');
      expect(result.fields.email).toBeNull();
      expect(result.fields.projectType).toBe('website');
      expect(result.fields.budget).toBeNull();
      expect(result.fields.timeline).toBeNull();
      expect(result.confidence).toBe(40); // 2/5 fields = 40%
    });

    it('should handle user providing multiple fields at once', async () => {
      const { fieldExtractorAgent } = await import('../field-extractor-agent');
      
      const messages: Message[] = [
        {
          role: 'user',
          content: 'Hi, I\'m Sarah Johnson, email sarah@startup.com. I need an AI chatbot for $8000 in 3 months'
        }
      ];

      const result = await fieldExtractorAgent.extract(messages);

      expect(result.fields.name).toBe('Sarah Johnson');
      expect(result.fields.email).toBe('sarah@startup.com');
      expect(result.fields.projectType).toContain('chatbot');
      expect(result.fields.budget).toBe('$8000');
      expect(result.fields.timeline).toBe('3 months');
      expect(result.confidence).toBe(100);
    });

    it('should handle empty conversation', async () => {
      const { fieldExtractorAgent } = await import('../field-extractor-agent');
      
      const messages: Message[] = [];

      const result = await fieldExtractorAgent.extract(messages);

      expect(result.fields.name).toBeNull();
      expect(result.fields.email).toBeNull();
      expect(result.fields.projectType).toBeNull();
      expect(result.fields.budget).toBeNull();
      expect(result.fields.timeline).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('should handle Spanish conversation', async () => {
      const { fieldExtractorAgent } = await import('../field-extractor-agent');
      
      const messages: Message[] = [
        { role: 'user', content: 'Hola, necesito una tienda online' },
        { role: 'assistant', content: '¡Genial! ¿Cuál es tu nombre?' },
        { role: 'user', content: 'Me llamo Carlos García' },
        { role: 'assistant', content: '¿Y tu email?' },
        { role: 'user', content: 'carlos.garcia@empresa.es' }
      ];

      const result = await fieldExtractorAgent.extract(messages);

      expect(result.fields.name).toBe('Carlos García');
      expect(result.fields.email).toBe('carlos.garcia@empresa.es');
      expect(result.fields.projectType).toContain('tienda');
    });

    it('should not infer information not explicitly stated', async () => {
      const { fieldExtractorAgent } = await import('../field-extractor-agent');
      
      const messages: Message[] = [
        { role: 'user', content: 'I need help' },
        { role: 'assistant', content: 'Sure! What do you need?' },
        { role: 'user', content: 'Something cool' }
      ];

      const result = await fieldExtractorAgent.extract(messages);

      // Should not assume "something cool" is a projectType
      expect(result.fields.projectType).toBeNull();
      expect(result.confidence).toBeLessThan(50);
    });
  });

  describe('formatFields()', () => {
    it('should format fields for display', async () => {
      const { fieldExtractorAgent } = await import('../field-extractor-agent');
      
      const fields = {
        name: 'John Doe',
        email: 'john@example.com',
        projectType: null,
        budget: null,
        timeline: null
      };

      const formatted = fieldExtractorAgent.formatFields(fields);

      expect(formatted).toContain('name: John Doe');
      expect(formatted).toContain('email: john@example.com');
      expect(formatted).toContain('projectType: ❌ NOT COLLECTED');
    });
  });
});