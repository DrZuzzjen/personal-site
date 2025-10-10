/**
 * Type definitions for Vercel AI SDK (Experimental_Agent)
 *
 * These types are inferred from SDK behavior since official types are incomplete.
 * Inspired by app-configs.ts centralized registry pattern.
 *
 * @see app/lib/app-configs.ts - Similar pattern for app configurations
 */

export interface ToolCall {
  toolName: string;
  input: Record<string, unknown>;
  result?: ToolResult;
}

export interface ToolResult {
  sent?: boolean; // For email tool
  success?: boolean; // For general tools
  [key: string]: unknown; // Allow additional properties
}

export interface StepContent {
  type: 'tool-result' | 'text' | 'tool-call';
  toolName?: string;
  output?: ToolResult;
  text?: string;
}

export interface AgentStep {
  text?: string;
  toolCalls?: ToolCall[];
  content?: StepContent[];
}

export interface AgentResult {
  text: string;
  steps?: AgentStep[];
  usage?: {
    totalTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
  };
}