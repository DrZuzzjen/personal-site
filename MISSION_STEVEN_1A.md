# 🎯 MISSION 1A: Agent Infrastructure & Field Extractor

**Developer:** Steven
**Phase:** 1 (Foundation)
**Duration:** 1-2 days
**Parallel Work:** Codex is working on Mission 1B (Sales Agent Core)
**Branch:** `feature/sales-agent-migration` (shared with Codex)

---

## 📋 Mission Objectives

1. ✅ Create agent infrastructure folder structure
2. ✅ Define shared TypeScript interfaces
3. ✅ Implement Field Extractor Agent
4. ✅ Write comprehensive unit tests
5. ✅ Document your implementation

---

## 📂 File Structure to Create

```
app/lib/ai/agents/
├── types.ts              ← Shared interfaces (YOU CREATE)
├── field-extractor-agent.ts  ← Field extraction (YOU CREATE)
├── sales-agent.ts        ← Sales conversation (CODEX CREATES)
└── __tests__/
    ├── field-extractor.test.ts (YOU CREATE)
    └── sales-agent.test.ts     (CODEX CREATES)
```

---

## 🔨 Task 1: Create Shared Types

**File:** `app/lib/ai/agents/types.ts`

**Requirements:**

```typescript
// Create these interfaces that both agents will use

export interface SalesFields {
  name: string | null;
  email: string | null;
  projectType: string | null;
  budget: string | null;
  timeline: string | null;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ExtractionResult {
  fields: SalesFields;
  confidence: number; // 0-100
  extractedFrom: number; // Number of messages analyzed
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  missingFields: string[];
  confidence: number; // 0-100
}

export interface EmailPayload {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  timeline: string;
  conversationHistory: Message[];
  timestamp: string;
  source: 'MSN Messenger Chat' | 'Website Form';
}
```

**Commit Message:**
```
[Mission 1A] Create shared types for agents

- Define SalesFields interface
- Define Message interface
- Define ExtractionResult and ValidationResult
- Define EmailPayload interface

Affects: app/lib/ai/agents/types.ts
```

---

## 🔨 Task 2: Implement Field Extractor Agent

**File:** `app/lib/ai/agents/field-extractor-agent.ts`

**Requirements:**

This agent extracts customer information from conversation history.

### Current Implementation (to migrate from)

Look at `app/api/chat/route.ts` lines 27-55 (the `extractFields()` function).

Your job: Convert this to an Agent class.

### Implementation Guide

```typescript
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
  private agent: Agent;

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
```

**Key Points:**

1. **Use Agent class** with `stopWhen: stepCountIs(1)` (no tools needed)
2. **System prompt** should be very specific about extraction rules
3. **Error handling** must return valid SalesFields (all null) on failure
4. **JSON parsing** must handle markdown wrapping
5. **Confidence score** based on fields found

**Commit Message:**
```
[Mission 1A] Implement Field Extractor Agent

- Create FieldExtractorAgent class with Agent SDK
- Extract 5 customer fields from conversation
- Handle JSON parsing with markdown wrapping
- Calculate confidence score
- Add error handling with fallback

Affects: app/lib/ai/agents/field-extractor-agent.ts
```

---

## 🔨 Task 3: Write Unit Tests

**File:** `app/lib/ai/agents/__tests__/field-extractor.test.ts`

**Requirements:**

Test all scenarios for the Field Extractor Agent.

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { fieldExtractorAgent } from '../field-extractor-agent';
import type { Message } from '../types';

describe('FieldExtractorAgent', () => {
  describe('extract()', () => {
    it('should extract all fields from complete conversation', async () => {
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
    it('should format fields for display', () => {
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
```

**Run Tests:**
```bash
npm test -- field-extractor.test.ts
```

**Commit Message:**
```
[Mission 1A] Add unit tests for Field Extractor Agent

- Test complete conversation extraction
- Test partial information handling
- Test multiple fields in single message
- Test edge cases (empty, non-English)
- Test formatFields utility

Coverage: 100%

Affects: app/lib/ai/agents/__tests__/field-extractor.test.ts
```

---

## 🔨 Task 4: Integration Documentation

**File:** `app/lib/ai/agents/README.md`

Create documentation explaining how to use your agent.

```markdown
# AI Agents Documentation

## Field Extractor Agent

### Purpose
Extracts customer information from conversation history for sales workflows.

### Usage

\`\`\`typescript
import { fieldExtractorAgent } from './field-extractor-agent';

const messages = [
  { role: 'user', content: 'I want a website' },
  { role: 'assistant', content: 'What is your name?' },
  { role: 'user', content: 'John Doe' }
];

const result = await fieldExtractorAgent.extract(messages);

console.log(result.fields);
// { name: 'John Doe', email: null, ... }

console.log(result.confidence);
// 20 (only 1/5 fields found)
\`\`\`

### Return Value

\`\`\`typescript
{
  fields: {
    name: string | null,
    email: string | null,
    projectType: string | null,
    budget: string | null,
    timeline: string | null
  },
  confidence: number, // 0-100
  extractedFrom: number // Number of messages analyzed
}
\`\`\`

### Error Handling

If extraction fails (invalid LLM response, parsing error, etc.), returns:
- All fields as `null`
- Confidence as `0`
- Logs error to console

### Performance

- **Model:** `llama-3.3-70b-versatile`
- **Temperature:** 0.3 (low for accuracy)
- **Average Latency:** 300-500ms
- **Token Usage:** ~200-400 tokens per extraction
\`\`\`

**Commit Message:**
```
[Mission 1A] Add Field Extractor Agent documentation

- Document agent purpose and usage
- Include code examples
- Document return value structure
- Document error handling behavior
- Add performance metrics

Affects: app/lib/ai/agents/README.md
```

---

## 📊 Definition of Done

Check all boxes before considering mission complete:

- [ ] `app/lib/ai/agents/types.ts` created with all interfaces
- [ ] `app/lib/ai/agents/field-extractor-agent.ts` implemented
- [ ] Uses `Experimental_Agent as Agent` from 'ai' package
- [ ] System prompt is clear and specific
- [ ] JSON parsing handles markdown wrapping
- [ ] Error handling returns valid empty SalesFields
- [ ] Unit tests written (>90% coverage)
- [ ] All tests pass (`npm test`)
- [ ] README.md documentation created
- [ ] All code committed with proper messages
- [ ] No console errors or warnings
- [ ] Tested manually with conversation examples

---

## 🚨 Important Notes

### Working with Codex
- **Pull often:** `git pull origin feature/sales-agent-migration --rebase` every 2 hours
- **Communicate:** If you modify shared files, post in Slack
- **Don't block:** If Codex needs types.ts, commit it ASAP

### Commit Cadence
- Commit after each major task (4 commits expected)
- Push to remote immediately after committing
- Clear, descriptive commit messages with `[Mission 1A]` prefix

### Questions?
- Technical: Check `VERCEL_AI_SDK_AGENTS_GUIDE.md`
- Architecture: Check `SALES_AGENT_MIGRATION_PLAN.md`
- Urgent: Post in Slack `#sales-agent-migration` with `@ProductOwner`

---

## 📅 Timeline

**Day 1:**
- Morning: Tasks 1 & 2 (types + agent implementation)
- Afternoon: Task 3 (unit tests)

**Day 2:**
- Morning: Task 4 (documentation) + manual testing
- Afternoon: Code review with Codex + fixes

**End of Day 2:** Mission 1A complete ✅

---

**Good luck, Steven! You've got this. 🚀**
