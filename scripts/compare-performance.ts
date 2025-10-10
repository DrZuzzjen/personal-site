import { performance } from 'node:perf_hooks';

type Role = 'user' | 'assistant' | 'system';

interface ChatMessage {
  role: Role;
  content: string;
}

interface Scenario {
  name: string;
  description?: string;
  messages: ChatMessage[][];
}

interface EndpointResult {
  latency: number;
  status: number;
  ok: boolean;
  data: unknown;
  error?: string;
}

const BASE_URL = process.env.PERF_BASE_URL ?? 'http://localhost:3001';

const testScenarios: Scenario[] = [
  {
    name: 'Full sales workflow (5 turns)',
    description: 'Simulates progressive collection of all sales fields across multiple turns.',
    messages: [
      [{ role: 'user', content: 'I want to build a website for my new brand.' }],
      [
        { role: 'user', content: 'I want to build a website for my new brand.' },
        { role: 'assistant', content: 'Absolutely! What is your name?' },
        { role: 'user', content: 'My name is John Doe.' },
      ],
      [
        { role: 'user', content: 'I want to build a website for my new brand.' },
        { role: 'assistant', content: 'Absolutely! What is your name?' },
        { role: 'user', content: 'My name is John Doe.' },
        { role: 'assistant', content: 'Great John! What is the best email to reach you?' },
        { role: 'user', content: 'You can reach me at john@example.com.' },
      ],
      [
        { role: 'user', content: 'I want to build a website for my new brand.' },
        { role: 'assistant', content: 'Absolutely! What is your name?' },
        { role: 'user', content: 'My name is John Doe.' },
        { role: 'assistant', content: 'Great John! What is the best email to reach you?' },
        { role: 'user', content: 'You can reach me at john@example.com.' },
        { role: 'assistant', content: 'Thanks! What type of project are you interested in?' },
        { role: 'user', content: 'I am looking for an e-commerce website.' },
      ],
      [
        { role: 'user', content: 'I want to build a website for my new brand.' },
        { role: 'assistant', content: 'Absolutely! What is your name?' },
        { role: 'user', content: 'My name is John Doe.' },
        { role: 'assistant', content: 'Great John! What is the best email to reach you?' },
        { role: 'user', content: 'You can reach me at john@example.com.' },
        { role: 'assistant', content: 'Thanks! What type of project are you interested in?' },
        { role: 'user', content: 'I am looking for an e-commerce website.' },
        { role: 'assistant', content: 'Perfect. What budget and timeline are you thinking about?' },
        { role: 'user', content: 'Budget is around $8k and timeline roughly 2 months.' },
      ],
    ],
  },
  {
    name: 'Quick inquiry (all info at once)',
    description: 'User provides every field in a single turn.',
    messages: [
      [
        {
          role: 'user',
          content:
            'Hi, I am Jane Smith (jane@example.com). I need an AI powered e-commerce site, budget 10k, timeline 2 months.',
        },
      ],
    ],
  },
  {
    name: 'Invalid email handling',
    description: 'Checks how the flows react to invalid contact information.',
    messages: [
      [
        {
          role: 'user',
          content:
            'Hello this is Alex. Email alex-at-example. I need a portfolio site, budget 3k, timeline 6 weeks.',
        },
      ],
    ],
  },
];

async function testEndpoint(
  endpoint: string,
  messages: ChatMessage[],
): Promise<EndpointResult> {
  const start = performance.now();

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    const latency = performance.now() - start;
    let data: unknown;

    try {
      data = await response.json();
    } catch (parseError) {
      data = { error: 'Failed to parse JSON response' };
    }

    return {
      latency,
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      latency: performance.now() - start,
      status: 0,
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function formatMs(value: number): string {
  return `${Math.round(value)}ms`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

async function runComparison() {
  console.log('Performance Comparison: /api/chat (old) vs /api/chat-v2 (agent)\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  for (const scenario of testScenarios) {
    console.log(`Scenario: ${scenario.name}`);
    if (scenario.description) {
      console.log(`    ${scenario.description}`);
    }

    const oldResults: EndpointResult[] = [];
    for (const messages of scenario.messages) {
      const result = await testEndpoint('/api/chat', messages);
      oldResults.push(result);
      if (!result.ok) {
        console.warn(`    Warning: old API status ${result.status}: ${JSON.stringify(result.data)}`);
      }
    }

    const newResults: EndpointResult[] = [];
    for (const messages of scenario.messages) {
      const result = await testEndpoint('/api/chat-v2', messages);
      newResults.push(result);
      if (!result.ok) {
        console.warn(`    Warning: new API status ${result.status}: ${JSON.stringify(result.data)}`);
      }
    }

    const oldAvg =
      oldResults.reduce((sum, r) => sum + r.latency, 0) /
      (oldResults.length || 1);
    const newAvg =
      newResults.reduce((sum, r) => sum + r.latency, 0) /
      (newResults.length || 1);
    const improvement =
      oldAvg === 0 ? 0 : ((oldAvg - newAvg) / oldAvg) * 100;

    console.log(`    Old API average: ${formatMs(oldAvg)}`);
    console.log(`    New API average: ${formatMs(newAvg)}`);
    console.log(
      `    Improvement: ${formatPercent(improvement)} ${improvement > 0 ? '(faster)' : '(slower)'}\n`,
    );
  }

  console.log('Comparison complete. Tip: run multiple times and average results for stability.\n');
}

runComparison().catch((error) => {
  console.error('Performance comparison failed:', error);
  process.exitCode = 1;
});
