import { tool } from 'ai';
import { z } from 'zod';
import type { SalesFields, ValidationResult } from '../types';

/**
 * Basic email format validation.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate that all sales fields are present and look reasonable.
 */
function validateSalesFields(fields: SalesFields): ValidationResult {
  const issues: string[] = [];
  const missingFields: string[] = [];

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
      confidence: 0,
    };
  }

  if (!isValidEmail(fields.email!)) {
    issues.push('Invalid email format');
  }

  if (fields.name!.trim().length < 2) {
    issues.push('Name too short');
  }

  const confidence = issues.length === 0 ? 100 : 50;

  return {
    valid: issues.length === 0,
    issues,
    missingFields: [],
    confidence,
  };
}

/**
 * Tool that validates fields and triggers the sales email workflow.
 * This should only run when all fields have been collected.
 */
export const validateAndSendEmailTool = tool({
  description: `Validate all customer fields and send sales inquiry email to Fran.

WHEN TO USE:
- ONLY when you have collected all 5 fields: name, email, projectType, budget, timeline
- After confirming with the customer that information is correct

WHAT IT DOES:
1. Validates all fields are present and correctly formatted
2. Sends email to Fran with the customer inquiry
3. Returns success or failure details

DO NOT USE IF:
- Any field is missing
- Customer has not confirmed the information`,

  inputSchema: z.object({
    name: z.string().min(2).describe('Customer full name'),
    email: z.string().email().describe('Customer email address'),
    projectType: z.string().describe('Type of project the customer wants'),
    budget: z.string().describe('Budget range the customer expects'),
    timeline: z.string().describe('Desired delivery timeline'),
    conversationHistory: z
      .string()
      .describe('Full conversation history as JSON string'),
  }),

  execute: async ({
    name,
    email,
    projectType,
    budget,
    timeline,
    conversationHistory,
  }) => {
    console.log('[validateAndSendEmailTool] Executing with:', {
      name,
      email,
      projectType,
      budget,
      timeline,
    });

    const validation = validateSalesFields({
      name,
      email,
      projectType,
      budget,
      timeline,
    });

    if (!validation.valid) {
      console.warn(
        '[validateAndSendEmailTool] Validation failed:',
        validation.issues,
      );

      return {
        sent: false,
        error: validation.issues[0],
        validation,
      };
    }

    try {
      const { sendSalesInquiryEmail } = await import('@/app/lib/email-utils');

      const result = await sendSalesInquiryEmail({
        name,
        email,
        projectType,
        budget,
        timeline,
        projectDescription: conversationHistory,
        timestamp: new Date().toISOString(),
        source: 'MSN Messenger Chat',
      });

      if (!result.success) {
        console.error(
          '[validateAndSendEmailTool] Email sending failed:',
          result.error,
        );

        return {
          sent: false,
          error: result.error || 'Email service failed',
          emailId: null,
        };
      }

      console.log(
        '[validateAndSendEmailTool] Email sent successfully:',
        result.emailId,
      );

      return {
        sent: true,
        emailId: result.emailId,
        timestamp: new Date().toISOString(),
        validation,
      };
    } catch (error) {
      console.error(
        '[validateAndSendEmailTool] Unexpected error:',
        error,
      );

      return {
        sent: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        emailId: null,
      };
    }
  },
});

export { validateSalesFields };
