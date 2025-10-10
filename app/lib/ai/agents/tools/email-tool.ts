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

  // Only require name, email, projectType - budget/timeline are optional
  if (!fields.name) missingFields.push('name');
  if (!fields.email) missingFields.push('email');
  if (!fields.projectType) missingFields.push('projectType');

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
  description: `⚠️⚠️⚠️ STOP! READ BEFORE CALLING ⚠️⚠️⚠️

ONLY call this if ALL 3 conditions are TRUE:
1. ✅ name = actual name (NOT null, NOT "unknown", NOT "NOT COLLECTED")
2. ✅ email = actual email with @ (NOT null, NOT "unknown")
3. ✅ projectType = actual project (NOT null, NOT "unknown")

IF ANY FIELD IS MISSING:
→ DO NOT CALL THIS TOOL
→ ASK CUSTOMER FOR THE FIELD
→ WAIT FOR RESPONSE

WRONG (DO NOT DO):
❌ validateAndSendEmail("unknown", "unknown", "sitio web")
❌ validateAndSendEmail(null, "user@email.com", "app")

CORRECT:
✅ validateAndSendEmail("Juan García", "juan@gmail.com", "sitio web")

Validate customer fields and send sales inquiry email to Fran.

WHEN TO USE:
✅ You have actual name (not null, not "unknown")
✅ You have valid email with @ symbol (not null, not "unknown")
✅ You have projectType (not null, not "unknown")
✅ Budget/timeline are optional - can be "I don't know" or any answer

WHEN NOT TO USE:
❌ ANY required field is null
❌ ANY required field is "unknown" or placeholder value
❌ Email doesn't have @ symbol
❌ Name is too short (< 2 chars)

IF FIELDS ARE MISSING:
→ Ask the customer for the missing information
→ Do NOT call this tool with placeholder values

WHAT IT DOES:
1. Validates required fields are present and correctly formatted
2. Sends email to Fran with the customer inquiry
3. Returns success or failure details`,

  inputSchema: z.object({
    name: z.string().min(2).describe('Customer full name'),
    email: z.string().email().describe('Customer email address'),
    projectType: z.string().describe('Type of project the customer wants'),
    budget: z.string().optional().describe('Budget range (optional - can be "I don\'t know")'),
    timeline: z.string().optional().describe('Timeline (optional - can be "flexible")'),
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
      budget: budget || null,
      timeline: timeline || null,
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
        budget: budget || null,
        timeline: timeline || null,
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
