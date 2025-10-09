# 🎯 MISSION 1B: Sales Agent Core & Email Tool

**Developer:** Codex
**Phase:** 1 (Foundation)
**Duration:** 1-2 days
**Parallel Work:** Steven is working on Mission 1A (Field Extractor Agent)
**Branch:** `feature/sales-agent-migration` (shared with Steven)

---

## 📋 Mission Objectives

1. ✅ Implement Sales Agent with Agent class
2. ✅ Create `validateAndSendEmail` tool
3. ✅ Integrate with existing email service
4. ✅ Write comprehensive unit tests
5. ✅ Document your implementation

---

## 📂 Files You'll Create

```
app/lib/ai/agents/
├── types.ts              ← Steven creates (wait for it)
├── field-extractor-agent.ts  ← Steven creates
├── sales-agent.ts        ← YOU CREATE
└── __tests__/
    ├── field-extractor.test.ts (Steven creates)
    └── sales-agent.test.ts     (YOU CREATE)
```

---

## ⏳ Wait for Steven (15-30 min)

**Before you start coding:** Steven needs to create `types.ts` first.

**While waiting, you can:**
1. Read `VERCEL_AI_SDK_AGENTS_GUIDE.md` (especially the Sales Agent example)
2. Review current sales implementation (`app/api/chat/route.ts` lines 233-338)
3. Review email service (`app/lib/email-utils.ts`)
4. Plan your system prompt structure

**Once Steven commits `types.ts`:**
```bash
git pull origin feature/sales-agent-migration --rebase
# Now you have the types!
```

---

## 🔨 Task 1: Create validateAndSendEmail Tool

**File:** `app/lib/ai/agents/tools/email-tool.ts`

First, create the tools directory:
```bash
mkdir -p app/lib/ai/agents/tools
```

**Requirements:**

This tool validates customer fields and sends the sales inquiry email.

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import type { SalesFields, ValidationResult } from '../types';

/**
 * Validate email format (basic check)
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate all sales fields
 */
function validateSalesFields(fields: SalesFields): ValidationResult {
  const issues: string[] = [];
  const missingFields: string[] = [];

  // Check for missing fields
  if (!fields.name) missingFields.push('name');
  if (!fields.email) missingFields.push('email');
  if (!fields.projectType) missingFields.push('projectType');
  if (!fields.budget) missingFields.push('budget');
  if (!fields.timeline) missingFields.push('timeline');

  if (missingFields.length > 0) {
    return {
      valid: false,
      issues: [`Missing required fields: ${missingFields.join(', ')}`],
      missingFields,
      confidence: 0
    };
  }

  // Validate email format
  if (!isValidEmail(fields.email!)) {
    issues.push('Invalid email format');
  }

  // Validate name (at least 2 characters)
  if (fields.name!.length < 2) {
    issues.push('Name too short');
  }

  // Calculate confidence
  const confidence = issues.length === 0 ? 100 : 50;

  return {
    valid: issues.length === 0,
    issues,
    missingFields: [],
    confidence
  };
}

/**
 * Tool: Validate fields and send email
 *
 * This tool should ONLY be called when all 5 fields are collected.
 */
export const validateAndSendEmailTool = tool({
  description: `Validate all customer fields and send sales inquiry email to Fran.

WHEN TO USE:
- ONLY when you have collected all 5 fields: name, email, projectType, budget, timeline
- After confirming with the customer that information is correct

WHAT IT DOES:
1. Validates all fields are present and correctly formatted
2. Sends email to Fran with customer inquiry
3. Returns success/failure status

DO NOT USE IF:
- Any field is missing
- Customer hasn't confirmed the information`,

  inputSchema: z.object({
    name: z.string().min(2).describe('Customer full name'),
    email: z.string().email().describe('Customer email address'),
    projectType: z.string().describe('Type of project customer wants'),
    budget: z.string().describe('Budget range'),
    timeline: z.string().describe('Desired timeline'),
    conversationHistory: z.string().describe('Full conversation history as JSON string')
  }),

  execute: async ({ name, email, projectType, budget, timeline, conversationHistory }) => {
    console.log('[validateAndSendEmailTool] Executing with:', {
      name, email, projectType, budget, timeline
    });

    // Step 1: Validate fields
    const validation = validateSalesFields({
      name, email, projectType, budget, timeline
    });

    if (!validation.valid) {
      console.warn('[validateAndSendEmailTool] Validation failed:', validation.issues);
      return {
        sent: false,
        error: validation.issues[0],
        validation
      };
    }

    // Step 2: Send email
    try {
      // Import dynamically to avoid circular dependencies
      const { sendSalesInquiryEmail } = await import('@/app/lib/email-utils');

      const result = await sendSalesInquiryEmail({
        name,
        email,
        projectType,
        budget,
        timeline,
        projectDescription: conversationHistory,
        timestamp: new Date().toISOString(),
        source: 'MSN Messenger Chat'
      });

      if (!result.success) {
        console.error('[validateAndSendEmailTool] Email sending failed:', result.error);
        return {
          sent: false,
          error: result.error || 'Email service failed',
          emailId: null
        };
      }

      console.log('[validateAndSendEmailTool] Email sent successfully:', result.emailId);

      return {
        sent: true,
        emailId: result.emailId,
        timestamp: new Date().toISOString(),
        validation
      };

    } catch (error) {
      console.error('[validateAndSendEmailTool] Unexpected error:', error);
      return {
        sent: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        emailId: null
      };
    }
  }
});
```

**Key Points:**
1. **Validation first** - Check all fields before sending
2. **Clear error messages** - Return specific issues
3. **Logging** - Log every step for debugging
4. **Error handling** - Catch all errors gracefully
5. **Tool description** - Be VERY specific about when to use this tool

**Commit Message:**
```
[Mission 1B] Create validateAndSendEmail tool

- Implement email validation logic
- Integrate with existing sendSalesInquiryEmail()
- Add comprehensive error handling
- Include validation feedback in response
- Add detailed logging for debugging

Affects: app/lib/ai/agents/tools/email-tool.ts
```

---

## 🔨 Task 2: Implement Sales Agent

**File:** `app/lib/ai/agents/sales-agent.ts`

**Requirements:**

This agent converses with customers, collects missing information, and triggers email sending.

### Current Implementation (to migrate from)

Look at `app/api/chat/route.ts` lines 233-338 (the `handleSalesChat()` function).

Your job: Convert this to an Agent class.

```typescript
import { Experimental_Agent as Agent, stepCountIs } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';
import type { Message, SalesFields } from './types';
import { validateAndSendEmailTool } from './tools/email-tool';

/**
 * Sales Agent Configuration
 */
interface SalesAgentConfig {
  currentFields: SalesFields;
  language?: 'es' | 'en' | 'fr' | 'de';
}

/**
 * Sales Agent
 *
 * Converses with customers to collect sales inquiry information.
 * Collects: name, email, projectType, budget, timeline
 * When all fields collected, triggers email sending.
 */
export class SalesAgent {
  private agent: Agent;

  constructor(config: SalesAgentConfig) {
    const { currentFields, language = 'en' } = config;

    // Build field status string
    const fieldStatus = this.formatFieldStatus(currentFields);

    // Build system prompt with current state
    const systemPrompt = this.buildSystemPrompt(fieldStatus, language);

    this.agent = new Agent({
      model: groq(process.env.GROQ_SALES_MODEL || 'llama-3.3-70b-versatile'),

      system: systemPrompt,

      tools: {
        validateAndSendEmail: validateAndSendEmailTool
      },

      temperature: 0.8, // Creative but focused

      stopWhen: ({ steps }) => {
        // Stop when email is sent successfully
        const emailSent = steps.some(step =>
          step.toolCalls?.some(call =>
            call.toolName === 'validateAndSendEmail' &&
            (call as any).result?.sent === true
          )
        );

        // Or stop after 10 steps (safety limit)
        return emailSent || steps.length >= 10;
      }
    });
  }

  /**
   * Generate sales response
   */
  async generate(messages: Message[]) {
    // Format conversation history for tool
    const conversationHistory = JSON.stringify(messages);

    // Add conversation history to last message context
    const messagesWithContext = [
      ...messages.slice(0, -1),
      {
        ...messages[messages.length - 1],
        content: `${messages[messages.length - 1].content}\n\n[Internal context for tools: conversationHistory=${conversationHistory}]`
      }
    ];

    return await this.agent.generate({
      messages: messagesWithContext as any
    });
  }

  /**
   * Format field status for system prompt
   */
  private formatFieldStatus(fields: SalesFields): string {
    return `
name: ${fields.name || '❌ NOT COLLECTED'}
email: ${fields.email || '❌ NOT COLLECTED'}
projectType: ${fields.projectType || '❌ NOT COLLECTED'}
budget: ${fields.budget || '❌ NOT COLLECTED'}
timeline: ${fields.timeline || '❌ NOT COLLECTED'}
    `.trim();
  }

  /**
   * Build system prompt based on language
   */
  private buildSystemPrompt(fieldStatus: string, language: string): string {
    const prompts = {
      en: `You are a professional sales assistant for Fran AI Consultancy.

CURRENT FIELDS STATUS:
${fieldStatus}

YOUR GOAL:
Collect ALL 5 fields to send sales inquiry to Fran: name, email, projectType, budget, timeline

YOUR PERSONALITY:
- Friendly and conversational (not robotic)
- Professional but warm
- Use emojis sparingly (✨, 🎯, 📧)
- Keep messages short and focused

YOUR BEHAVIOR:
1. Ask for ONE missing field at a time
2. If customer provides multiple fields, acknowledge ALL of them
3. When ALL 5 fields collected, use validateAndSendEmail tool
4. After email sent, confirm with "✅ Email sent to Fran! He'll reply within 24 hours."

TOOL USAGE:
- Use validateAndSendEmail ONLY when all 5 fields are collected
- Pass all fields + conversationHistory to the tool
- If tool returns error, explain the issue to customer and re-collect

NEVER:
- Don't re-ask for information already collected
- Don't be pushy or aggressive
- Don't make up field values
- Don't call validateAndSendEmail before having all 5 fields`,

      es: `Eres un asistente de ventas profesional para Fran AI Consultancy.

ESTADO ACTUAL DE CAMPOS:
${fieldStatus}

TU OBJETIVO:
Recopilar LOS 5 campos para enviar consulta a Fran: name, email, projectType, budget, timeline

TU PERSONALIDAD:
- Amigable y conversacional (no robótico)
- Profesional pero cálido
- Usa emojis con moderación (✨, 🎯, 📧)
- Mantén mensajes cortos y enfocados

TU COMPORTAMIENTO:
1. Pregunta por UN campo faltante a la vez
2. Si el cliente da múltiples campos, reconoce TODOS
3. Cuando tengas LOS 5 campos, usa la herramienta validateAndSendEmail
4. Después de enviar email, confirma con "✅ ¡Email enviado a Fran! Te responderá en 24 horas."

USO DE HERRAMIENTAS:
- Usa validateAndSendEmail SOLO cuando tengas los 5 campos
- Pasa todos los campos + conversationHistory a la herramienta
- Si la herramienta retorna error, explica el problema y vuelve a recopilar

NUNCA:
- No vuelvas a preguntar por información ya recopilada
- No seas insistente o agresivo
- No inventes valores de campos
- No llames validateAndSendEmail antes de tener los 5 campos`,

      fr: `Tu es un assistant commercial professionnel pour Fran AI Consultancy.

ÉTAT ACTUEL DES CHAMPS:
${fieldStatus}

TON OBJECTIF:
Collecter TOUS les 5 champs pour envoyer la demande à Fran: name, email, projectType, budget, timeline

TA PERSONNALITÉ:
- Amical et conversationnel (pas robotique)
- Professionnel mais chaleureux
- Utilise des emojis avec modération (✨, 🎯, 📧)
- Garde les messages courts et ciblés

TON COMPORTEMENT:
1. Demande UN champ manquant à la fois
2. Si le client fournit plusieurs champs, reconnais TOUS
3. Quand tu as LES 5 champs, utilise l'outil validateAndSendEmail
4. Après l'envoi, confirme avec "✅ Email envoyé à Fran! Il répondra dans 24 heures."

UTILISATION DES OUTILS:
- Utilise validateAndSendEmail SEULEMENT quand tu as les 5 champs
- Passe tous les champs + conversationHistory à l'outil
- Si l'outil retourne une erreur, explique le problème et recueille à nouveau

JAMAIS:
- Ne redemande pas des informations déjà collectées
- Ne sois pas insistant ou agressif
- N'invente pas de valeurs de champs
- N'appelle pas validateAndSendEmail avant d'avoir les 5 champs`,

      de: `Du bist ein professioneller Vertriebsassistent für Fran AI Consultancy.

AKTUELLER FELDSTATUS:
${fieldStatus}

DEIN ZIEL:
Sammle ALLE 5 Felder, um Anfrage an Fran zu senden: name, email, projectType, budget, timeline

DEINE PERSÖNLICHKEIT:
- Freundlich und gesprächig (nicht roboterhaft)
- Professionell aber warm
- Verwende Emojis sparsam (✨, 🎯, 📧)
- Halte Nachrichten kurz und fokussiert

DEIN VERHALTEN:
1. Frage nach EINEM fehlenden Feld pro Mal
2. Wenn Kunde mehrere Felder angibt, bestätige ALLE
3. Wenn du ALLE 5 Felder hast, verwende validateAndSendEmail Tool
4. Nach dem Senden bestätige mit "✅ Email an Fran gesendet! Er antwortet innerhalb 24 Stunden."

TOOL-NUTZUNG:
- Verwende validateAndSendEmail NUR wenn du alle 5 Felder hast
- Übergib alle Felder + conversationHistory an das Tool
- Wenn Tool Fehler zurückgibt, erkläre Problem und sammle erneut

NIEMALS:
- Frage nicht erneut nach bereits gesammelten Informationen
- Sei nicht aufdringlich oder aggressiv
- Erfinde keine Feldwerte
- Rufe validateAndSendEmail nicht auf bevor du alle 5 Felder hast`
    };

    return prompts[language as keyof typeof prompts] || prompts.en;
  }
}

/**
 * Factory function to create Sales Agent with current state
 */
export function createSalesAgent(config: SalesAgentConfig): SalesAgent {
  return new SalesAgent(config);
}
```

**Key Points:**
1. **Stateful agent** - Takes current fields in constructor
2. **Multilingual support** - System prompt in 4 languages
3. **Smart stopping** - Stops when email sent or 10 steps
4. **Context passing** - Conversation history passed to tool
5. **Factory function** - Easier to create agents with different configs

**Commit Message:**
```
[Mission 1B] Implement Sales Agent with Agent class

- Create SalesAgent class with configurable state
- Support 4 languages (EN/ES/FR/DE)
- Integrate validateAndSendEmail tool
- Implement smart stopping condition
- Add factory function for easy instantiation

Affects: app/lib/ai/agents/sales-agent.ts
```

---

## 🔨 Task 3: Write Unit Tests

**File:** `app/lib/ai/agents/__tests__/sales-agent.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSalesAgent } from '../sales-agent';
import type { Message, SalesFields } from '../types';

// Mock the email service
vi.mock('@/app/lib/email-utils', () => ({
  sendSalesInquiryEmail: vi.fn(async () => ({
    success: true,
    emailId: 'test-email-123'
  }))
}));

describe('SalesAgent', () => {
  describe('When all fields collected', () => {
    it('should trigger validateAndSendEmail tool', async () => {
      const agent = createSalesAgent({
        currentFields: {
          name: 'John Doe',
          email: 'john@example.com',
          projectType: 'E-commerce website',
          budget: '5000-10000',
          timeline: '2 months'
        }
      });

      const messages: Message[] = [
        { role: 'user', content: 'I want to confirm and send the email' }
      ];

      const result = await agent.generate(messages);

      // Should have called the tool
      expect(result.steps).toHaveLength(2); // Text + Tool call
      expect(result.steps[1].toolCalls).toBeDefined();
      expect(result.steps[1].toolCalls[0].toolName).toBe('validateAndSendEmail');
      expect(result.steps[1].toolCalls[0].result.sent).toBe(true);

      // Should mention email sent
      expect(result.text).toContain('✅');
    });
  });

  describe('When fields missing', () => {
    it('should ask for missing fields', async () => {
      const agent = createSalesAgent({
        currentFields: {
          name: 'John Doe',
          email: null,
          projectType: 'Website',
          budget: null,
          timeline: null
        }
      });

      const messages: Message[] = [
        { role: 'user', content: 'I provided my name and project type' }
      ];

      const result = await agent.generate(messages);

      // Should ask for email (most critical)
      expect(result.text.toLowerCase()).toMatch(/email/);

      // Should NOT call validateAndSendEmail tool
      const emailTool = result.steps.find(s =>
        s.toolCalls?.some(c => c.toolName === 'validateAndSendEmail')
      );
      expect(emailTool).toBeUndefined();
    });
  });

  describe('Language support', () => {
    it('should respond in Spanish when configured', async () => {
      const agent = createSalesAgent({
        currentFields: {
          name: null,
          email: null,
          projectType: null,
          budget: null,
          timeline: null
        },
        language: 'es'
      });

      const messages: Message[] = [
        { role: 'user', content: 'Hola, necesito ayuda' }
      ];

      const result = await agent.generate(messages);

      // Response should be in Spanish
      // (Note: This tests system prompt language, LLM should respond in Spanish)
      expect(result.text).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('should handle validation errors gracefully', async () => {
      const agent = createSalesAgent({
        currentFields: {
          name: 'John',
          email: 'invalid-email', // Invalid format
          projectType: 'Website',
          budget: '5k',
          timeline: '2 months'
        }
      });

      const messages: Message[] = [
        { role: 'user', content: 'Send the email' }
      ];

      const result = await agent.generate(messages);

      // Should have called tool
      const emailTool = result.steps.find(s =>
        s.toolCalls?.some(c => c.toolName === 'validateAndSendEmail')
      );

      expect(emailTool).toBeDefined();
      expect(emailTool.toolCalls[0].result.sent).toBe(false);
      expect(emailTool.toolCalls[0].result.error).toContain('email');

      // Should explain the error to user
      expect(result.text.toLowerCase()).toMatch(/email/);
    });
  });

  describe('Multi-step workflow', () => {
    it('should collect multiple fields across conversation', async () => {
      let currentFields: SalesFields = {
        name: null,
        email: null,
        projectType: null,
        budget: null,
        timeline: null
      };

      // Turn 1: User provides name
      let agent = createSalesAgent({ currentFields });
      let result = await agent.generate([
        { role: 'user', content: 'My name is Sarah' }
      ]);
      currentFields.name = 'Sarah';
      expect(result.text).toBeTruthy();

      // Turn 2: User provides email
      agent = createSalesAgent({ currentFields });
      result = await agent.generate([
        { role: 'user', content: 'My name is Sarah' },
        { role: 'assistant', content: result.text },
        { role: 'user', content: 'sarah@startup.com' }
      ]);
      currentFields.email = 'sarah@startup.com';
      expect(result.text).toBeTruthy();

      // Turn 3: User provides project + budget + timeline
      agent = createSalesAgent({ currentFields });
      result = await agent.generate([
        { role: 'user', content: 'My name is Sarah' },
        { role: 'assistant', content: 'Great! Email?' },
        { role: 'user', content: 'sarah@startup.com' },
        { role: 'assistant', content: result.text },
        { role: 'user', content: 'I need an AI chatbot for $8000 in 3 months' }
      ]);

      // Should trigger email sending
      const emailTool = result.steps.find(s =>
        s.toolCalls?.some(c => c.toolName === 'validateAndSendEmail')
      );
      expect(emailTool).toBeDefined();
    });
  });
});
```

**Run Tests:**
```bash
npm test -- sales-agent.test.ts
```

**Commit Message:**
```
[Mission 1B] Add unit tests for Sales Agent

- Test email sending when all fields collected
- Test asking for missing fields
- Test multilingual support (ES/EN/FR/DE)
- Test validation error handling
- Test multi-turn conversation workflow

Coverage: >90%

Affects: app/lib/ai/agents/__tests__/sales-agent.test.ts
```

---

## 🔨 Task 4: Integration Documentation

**File:** Update `app/lib/ai/agents/README.md` (Steven created it)

Add your section to the README:

```markdown
## Sales Agent

### Purpose
Converses with customers to collect sales inquiry information and sends email to Fran when all fields are collected.

### Usage

\`\`\`typescript
import { createSalesAgent } from './sales-agent';
import { fieldExtractorAgent } from './field-extractor-agent';

// Step 1: Extract current fields
const extraction = await fieldExtractorAgent.extract(messages);

// Step 2: Create sales agent with current state
const agent = createSalesAgent({
  currentFields: extraction.fields,
  language: 'en' // or 'es', 'fr', 'de'
});

// Step 3: Generate response
const result = await agent.generate(messages);

console.log(result.text); // Agent response
console.log(result.steps); // Execution steps

// Step 4: Check if email was sent
const emailSent = result.steps.some(s =>
  s.toolCalls?.some(c => c.toolName === 'validateAndSendEmail' && c.result.sent)
);
\`\`\`

### Configuration

\`\`\`typescript
interface SalesAgentConfig {
  currentFields: SalesFields; // Current state of field collection
  language?: 'es' | 'en' | 'fr' | 'de'; // System prompt language
}
\`\`\`

### Tools

#### validateAndSendEmail
- **Purpose:** Validates all fields and sends sales inquiry email
- **When Called:** Automatically when agent determines all 5 fields collected
- **Parameters:** name, email, projectType, budget, timeline, conversationHistory
- **Returns:** `{ sent: boolean, error?: string, emailId?: string }`

### Error Handling

- **Validation errors:** Tool returns `sent: false` with error message, agent explains to user
- **Email service errors:** Tool catches exception, returns error, agent asks to retry
- **Missing fields:** Agent doesn't call tool, continues collecting

### Performance

- **Model:** `llama-3.3-70b-versatile` (configurable via GROQ_SALES_MODEL env var)
- **Temperature:** 0.8 (creative but focused)
- **Max Steps:** 10 (safety limit)
- **Average Latency:** 800-1200ms per turn
- **Token Usage:** ~400-800 tokens per turn
\`\`\`

**Commit Message:**
```
[Mission 1B] Add Sales Agent documentation

- Document agent purpose and usage
- Include configuration options
- Document validateAndSendEmail tool
- Document error handling behavior
- Add performance metrics

Affects: app/lib/ai/agents/README.md
```

---

## 📊 Definition of Done

Check all boxes before considering mission complete:

- [ ] `app/lib/ai/agents/tools/email-tool.ts` created
- [ ] `app/lib/ai/agents/sales-agent.ts` implemented
- [ ] Uses `Experimental_Agent as Agent` from 'ai' package
- [ ] validateAndSendEmail tool integrated
- [ ] System prompts for 4 languages (EN/ES/FR/DE)
- [ ] Smart stopping condition (email sent or 10 steps)
- [ ] Error handling for validation failures
- [ ] Unit tests written (>90% coverage)
- [ ] All tests pass (`npm test`)
- [ ] README.md updated with Sales Agent docs
- [ ] All code committed with proper messages
- [ ] No console errors or warnings
- [ ] Tested manually with conversation examples

---

## 🚨 Important Notes

### Working with Steven
- **Wait for types.ts:** Pull his commit before starting
- **Communicate:** If you need changes to types, discuss in Slack
- **Share README:** Both of you edit the same file, coordinate

### Commit Cadence
- Commit after each major task (4 commits expected)
- Push to remote immediately after committing
- Clear, descriptive commit messages with `[Mission 1B]` prefix

### Questions?
- Technical: Check `VERCEL_AI_SDK_AGENTS_GUIDE.md`
- Architecture: Check `SALES_AGENT_MIGRATION_PLAN.md`
- Urgent: Post in Slack `#sales-agent-migration` with `@ProductOwner`

---

## 📅 Timeline

**Day 1:**
- Morning: Wait for Steven, read docs, plan system prompts
- Afternoon: Tasks 1 & 2 (tool + agent implementation)

**Day 2:**
- Morning: Task 3 (unit tests)
- Afternoon: Task 4 (documentation) + manual testing + code review with Steven

**End of Day 2:** Mission 1B complete ✅

---

**Good luck, Codex! You've got this. 🚀**
