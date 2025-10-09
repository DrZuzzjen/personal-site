import { Experimental_Agent as Agent, tool } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';
import { PROMPTS } from '@/app/lib/ai/prompts';
import type { Message } from './types';
import { z } from 'zod';

export interface Action {
  type: 'openApp' | 'closeApp' | 'restart';
  appName?: string;
}

/**
 * Casual chat agent that handles desktop interactions and friendly conversation.
 * Matches SalesAgent architecture pattern for consistency.
 */
export class CasualAgent {
  private readonly agent: Agent<any, any, any>;

  constructor() {
    const systemPrompt = PROMPTS.CASUAL_CHAT();

    this.agent = new Agent({
      model: groq(process.env.GROQ_CASUAL_MODEL || 'llama-3.3-70b-versatile'),
      system: systemPrompt,
      temperature: 0.8,
      tools: {
        openApp: tool({
          description: 'Opens an application window on the Windows desktop. Use this when user asks to open, launch, or start an app. Available apps: paint, minesweeper, snake, notepad, camera, tv, browser (internet explorer), chatbot (MSN Messenger), portfolio, terminal, mycomputer, explorer.',
          inputSchema: z.object({
            appName: z.enum(['paint', 'minesweeper', 'snake', 'notepad', 'camera', 'tv', 'browser', 'chatbot', 'portfolio', 'terminal', 'mycomputer', 'explorer'])
              .describe('The name of the application to open')
          }),
          execute: async ({ appName }) => {
            // ✅ FIXED: Remove hardcoded Spanish responses!
            // Let the AI generate appropriate response in user's language
            return { appName, success: true };
          }
        }),
        closeApp: tool({
          description: 'Closes an open application window. Use this when user asks to close, quit, or exit an app.',
          inputSchema: z.object({
            appName: z.enum(['paint', 'minesweeper', 'snake', 'notepad', 'camera', 'tv', 'browser', 'chatbot', 'portfolio', 'terminal', 'mycomputer', 'explorer'])
              .describe('The name of the application to close')
          }),
          execute: async ({ appName }) => {
            // ✅ FIXED: Remove hardcoded Spanish responses!
            return { appName, success: true };
          }
        }),
        restart: tool({
          description: 'Closes all open windows and restarts the desktop. Use this when user asks to restart, reboot, or close everything.',
          inputSchema: z.object({}),
          execute: async () => {
            // ✅ FIXED: Remove hardcoded Spanish responses!
            return { success: true };
          }
        })
      },
      stopWhen: ({ steps }) => {
        // Stop after first tool call OR after 2 conversational turns
        const hasToolCall = steps.some(s => s.toolCalls && s.toolCalls.length > 0);

        if (hasToolCall) {
          console.log('[CasualAgent] Tool executed, stopping');
          return true;
        }

        // For pure conversation, stop after 2 steps
        if (steps.length >= 2) {
          console.log('[CasualAgent] Conversation complete, stopping');
          return true;
        }

        return false;
      }
    });
  }

  async generate(messages: Message[]): Promise<{ message: string; actions: Action[] }> {
    try {
      // Trim history like SalesAgent (Priority 2: Add History Trimming)
      const trimmedHistory = messages
        .filter(message => message.role !== 'system')
        .map(message => ({
          role: message.role,
          content: message.content.length > 500
            ? message.content.slice(-500)  // Trim long messages
            : message.content,
        }))
        .slice(-12); // Only last 12 messages

      const result = await this.agent.generate({ messages: trimmedHistory });

      // Priority 4: Add Error Handling in Action Extraction
      const actions = this.extractActionsFromSteps(result.steps);

      // Priority 5: Improve Message Extraction
      const message = this.extractMessage(result);

      return { message, actions };
    } catch (error) {
      console.error('[CasualAgent] Generation error:', error);
      return {
        message: "hey! :) what's up?",
        actions: []
      };
    }
  }

  /**
   * Priority 4: Add Error Handling in Action Extraction
   */
  private extractActionsFromSteps(steps: any[]): Action[] {
    const actions: Action[] = [];

    try {
      if (!steps || !Array.isArray(steps)) {
        console.warn('[CasualAgent] No steps to extract actions from');
        return actions;
      }

      for (const step of steps) {
        if (!step.toolCalls || !Array.isArray(step.toolCalls)) {
          continue;
        }

        for (const toolCall of step.toolCalls) {
          try {
            if (toolCall.toolName === 'openApp') {
              const input = toolCall.input as { appName?: string };
              if (input?.appName && typeof input.appName === 'string') {
                actions.push({
                  type: 'openApp',
                  appName: input.appName
                });
              }
            } else if (toolCall.toolName === 'closeApp') {
              const input = toolCall.input as { appName?: string };
              if (input?.appName && typeof input.appName === 'string') {
                actions.push({
                  type: 'closeApp',
                  appName: input.appName
                });
              }
            } else if (toolCall.toolName === 'restart') {
              actions.push({ type: 'restart' });
            }
          } catch (error) {
            console.error('[CasualAgent] Failed to extract action from tool call:', toolCall, error);
          }
        }
      }
    } catch (error) {
      console.error('[CasualAgent] Failed to extract actions from steps:', error);
    }

    return actions;
  }

  /**
   * Priority 5: Improve Message Extraction
   */
  private extractMessage(result: any): string {
    // Extract the LAST conversational message from steps
    let message = "Hey! :) How's it going?";

    if (result.text && result.text.trim().length > 0) {
      message = result.text.trim();
    } else if (result.steps && result.steps.length > 0) {
      // Find last step with text content
      for (let i = result.steps.length - 1; i >= 0; i--) {
        const step = result.steps[i];
        if (step.text && step.text.trim().length > 0) {
          message = step.text.trim();
          break;
        }
      }
    }

    return message;
  }
}

/**
 * Factory function to create a new CasualAgent instance per request
 */
export function createCasualAgent(): CasualAgent {
  return new CasualAgent();
}