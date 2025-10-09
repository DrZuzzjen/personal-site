# AI Agents Documentation

## Field Extractor Agent

### Purpose
Extracts customer information from conversation history for sales workflows.

### Usage

```typescript
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
```

### Return Value

```typescript
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
```

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

---

## Sales Agent

Conversational agent that collects customer details and sends the final sales inquiry email once all required information is gathered.

### Purpose
- Guide prospective customers through a structured intake conversation.
- Gather the five required sales fields: `name`, `email`, `projectType`, `budget`, `timeline`.
- Confirm information accuracy before triggering the email workflow.

### Usage

```typescript
import { createSalesAgent } from './sales-agent';
import type { Message, SalesFields } from './types';

const currentFields: SalesFields = {
  name: 'John Doe',
  email: 'john@example.com',
  projectType: null,
  budget: null,
  timeline: null,
};

const agent = createSalesAgent({
  currentFields,
  language: 'en',
});

const messages: Message[] = [
  { role: 'user', content: 'Hi, I want to build an AI chatbot.' },
];

const result = await agent.generate(messages);

console.log(result.text); // Agent reply
console.log(result.steps); // Execution trace (tool calls, intermediate steps)
```

### Configuration

```typescript
interface SalesAgentConfig {
  currentFields: SalesFields;     // Current state of collected fields
  language?: 'es' | 'en' | 'fr' | 'de'; // System prompt language (default: en)
}
```

### Tools

#### validateAndSendEmail
- **Purpose:** Validate collected fields and send the sales inquiry email.
- **When Called:** Automatically when the agent determines all 5 fields are present.
- **Parameters:** `name`, `email`, `projectType`, `budget`, `timeline`, `conversationHistory`.
- **Returns:** `{ sent: boolean, error?: string, emailId?: string, validation?: ValidationResult }`.

### Error Handling

- Validation failures return `{ sent: false, error, validation }`; the agent explains the issue and re-collects the field.
- Email service failures return `{ sent: false, error }`; the agent notifies the customer and retries later.
- Missing fields prevent the tool from being called; the agent keeps collecting details.

### Performance

- **Model:** `llama-3.3-70b-versatile` (configurable via `GROQ_SALES_MODEL`).
- **Temperature:** `0.8` for friendly but focused replies.
- **Maximum Steps:** Stops once the email is sent or after 10 steps (safety cap).
- **Typical Latency:** 800–1200 ms per turn.
- **Token Usage:** Roughly 400–800 tokens per turn.
