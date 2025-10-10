export interface TelemetryEvent {
  timestamp: string;
  endpoint: '/api/chat' | '/api/chat-v2';
  intent: 'sales' | 'casual';
  latencyMs: number;
  tokensUsed?: number;
  agentSteps?: number;
  emailSent: boolean;
  error?: string;
}

export interface TelemetryStats {
  totalCalls: number;
  avgLatency: number;
  emailSuccessRate: number;
  errorRate: number;
}

class Telemetry {
  private events: TelemetryEvent[] = [];

  log(event: TelemetryEvent) {
    this.events.push(event);
    // Log structured telemetry for quick visibility during local development.
    console.log('[Telemetry]', JSON.stringify(event));

    // Optional: Send to analytics service
    // await fetch('https://analytics.example.com', { method: 'POST', body: JSON.stringify(event) });
  }

  getStats(): TelemetryStats {
    const totalCalls = this.events.length;
    if (totalCalls === 0) {
      return {
        totalCalls: 0,
        avgLatency: 0,
        emailSuccessRate: 0,
        errorRate: 0,
      };
    }

    const totalLatency = this.events.reduce(
      (sum, event) => sum + event.latencyMs,
      0,
    );

    const salesEvents = this.events.filter((event) => event.intent === 'sales');
    const successfulSalesEmails = salesEvents.filter(
      (event) => event.emailSent,
    );
    const errorEvents = this.events.filter((event) => Boolean(event.error));

    return {
      totalCalls,
      avgLatency: totalLatency / totalCalls,
      emailSuccessRate:
        salesEvents.length === 0
          ? 0
          : successfulSalesEmails.length / salesEvents.length,
      errorRate: errorEvents.length / totalCalls,
    };
  }

  clear() {
    this.events = [];
  }

  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }
}

export const telemetry = new Telemetry();

