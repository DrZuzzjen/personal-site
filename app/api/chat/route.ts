import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';
import { PROMPTS } from '@/app/lib/ai/prompts';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SalesFields {
  name: string | null;
  email: string | null;
  projectType: string | null;
  budget: string | null;
  timeline: string | null;
}

// Action types for function calling (client-side execution)
interface Action {
  type: 'openApp' | 'closeApp' | 'restart';
  appName?: string;
}

// Extract fields from conversation history
async function extractFields(conversationHistory: Message[]): Promise<SalesFields> {
  const conversationText = conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n');
  const extractionPrompt = PROMPTS.FIELD_EXTRACTOR(conversationText);

  const response = await generateText({
    model: groq(process.env.GROQ_EXTRACTOR_MODEL || 'llama-3.3-70b-versatile'), // Use configurable model
    prompt: extractionPrompt,
    temperature: 0.3, // Low temp for accuracy
  });

  // Extract JSON from response (handle markdown wrapping)
  let jsonText = response.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }

  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    console.error('Failed to parse extraction response:', parseError, jsonText);
    return {
      name: null,
      email: null,
      projectType: null,
      budget: null,
      timeline: null,
    };
  }
}

interface ValidationResult {
  valid: boolean;
  issues: string[];
  missingFields: string[];
  confidence: number;
}

// Validator agent function
async function validateFields(fields: SalesFields): Promise<ValidationResult> {
  const validatorPrompt = PROMPTS.FIELD_VALIDATOR(JSON.stringify(fields, null, 2));

  const response = await generateText({
    model: groq(process.env.GROQ_VALIDATOR_MODEL || 'llama-3.3-70b-versatile'), // Use configurable model
    prompt: validatorPrompt,
    temperature: 0.2, // Very strict
  });

  let jsonText = response.text.trim();

  // Handle markdown wrapping
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }

  // Remove any extra text before/after JSON
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    console.error('Validator parse error:', parseError, jsonText);
    return {
      valid: false,
      issues: ['Failed to parse validation response'],
      missingFields: Object.keys(fields).filter(k => !fields[k as keyof SalesFields]),
      confidence: 0,
    };
  }
}

// Language detection helper
function detectLanguage(conversationHistory: Message[]): string {
  // Check last 3 user messages for language indicators
  const userMessages = conversationHistory
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content.toLowerCase())
    .join(' ');

  if (/\b(hola|gracias|quiero|buenas|que|como|pero|con)\b/.test(userMessages)) return 'es';
  if (/\b(merci|bonjour|oui|non|je|tu|avec)\b/.test(userMessages)) return 'fr';
  if (/\b(danke|hallo|ja|nein|ich|du|mit)\b/.test(userMessages)) return 'de';

  return 'en';
}

// Detect user intent using Vercel AI SDK with conversation context
async function detectIntent(userMessage: string, conversationHistory: Message[] = []): Promise<'sales' | 'casual'> {
  try {
    // Get last 4 messages for context (not too much, not too little)
    const recentHistory = conversationHistory.slice(-4);
    const conversationContext = recentHistory.length > 0
      ? `\n\nRecent conversation context:\n${recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    const { text } = await generateText({
      model: groq(process.env.GROQ_ROUTER_MODEL || 'llama-3.3-70b-versatile'),
      prompt: `${PROMPTS.ROUTER()}${conversationContext}\n\nLatest message: "${userMessage}"`,
      temperature: 0.1,
    });

    const intent = text.toLowerCase().trim();
    return intent === 'sales' ? 'sales' : 'casual';
  } catch (error) {
    console.error('Intent detection error:', error);
    return 'casual'; // Default fallback
  }
}

// Handle casual chat using Vercel AI SDK with function calling tools
async function handleCasualChat(userMessage: string, conversationHistory: Message[]): Promise<{ message: string; actions: Action[] }> {
  try {
    const { text, toolCalls } = await generateText({
      model: groq(process.env.GROQ_CASUAL_MODEL || 'llama-3.3-70b-versatile'),
      messages: [
        { role: 'system', content: PROMPTS.CASUAL_CHAT() },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.8,
      tools: {
        openApp: {
          description: 'Opens an application window on the Windows desktop. Use this when user asks to open, launch, or start an app.',
          inputSchema: z.object({
            appName: z.enum(['paint', 'minesweeper', 'snake', 'notepad', 'camera', 'tv', 'browser', 'mycomputer', 'explorer'])
              .describe('The name of the application to open')
          }),
          execute: async ({ appName }) => ({ appName })
        },
        closeApp: {
          description: 'Closes an open application window. Use this when user asks to close, quit, or exit an app.',
          inputSchema: z.object({
            appName: z.enum(['paint', 'minesweeper', 'snake', 'notepad', 'camera', 'tv', 'browser', 'mycomputer', 'explorer'])
              .describe('The name of the application to close')
          }),
          execute: async ({ appName }) => ({ appName })
        },
        restart: {
          description: 'Closes all open windows and restarts the desktop. Use this when user asks to restart, reboot, or close everything.',
          inputSchema: z.object({}),
          execute: async () => ({ success: true })
        }
      }
    });

    // Convert toolCalls to actions for client-side execution
    const actions: Action[] = toolCalls.map(call => {
      if (call.toolName === 'openApp' || call.toolName === 'closeApp') {
        return {
          type: call.toolName,
          appName: (call as any).input?.appName
        };
      } else if (call.toolName === 'restart') {
        return { type: 'restart' };
      }
      return { type: 'openApp' }; // Fallback (should never happen)
    });

    // When tools are called, generate a clean message without function syntax
    let cleanMessage = text || "hey! :) what's up?";

    // Remove any function call syntax from the message (UX fix)
    cleanMessage = cleanMessage.replace(/<function[^>]*>.*?<\/function>/g, '').trim();

    // If message is now empty and we have actions, generate a friendly confirmation
    if (!cleanMessage && actions.length > 0) {
      const action = actions[0];
      if (action.type === 'openApp') {
        cleanMessage = '¡Listo! 🎨';
      } else if (action.type === 'closeApp') {
        cleanMessage = '✅ Cerrado!';
      } else if (action.type === 'restart') {
        cleanMessage = '🔄 Reiniciando...';
      }
    }

    return {
      message: cleanMessage,
      actions
    };
  } catch (error) {
    console.error('Casual chat error:', error);
    return {
      message: "hey! :) what's up?",
      actions: []
    };
  }
}

// Handle sales chat using Vercel AI SDK with state tracking
async function handleSalesChat(
  userMessage: string,
  conversationHistory: Message[]
): Promise<{ message: string; systemMessage?: string; emailSent: boolean }> {

  // Step 1: Extract current fields from conversation
  const currentFields = await extractFields(conversationHistory);

  // Step 2: Build state-aware prompt
  const salesPrompt = PROMPTS.SALES({
    name_status: currentFields.name || '❌ NOT COLLECTED',
    email_status: currentFields.email || '❌ NOT COLLECTED',
    project_type_status: currentFields.projectType || '❌ NOT COLLECTED',
    budget_status: currentFields.budget || '❌ NOT COLLECTED',
    timeline_status: currentFields.timeline || '❌ NOT COLLECTED',
    user_message: userMessage,
    conversation_context: conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n'),
  });

  // Step 3: Get sales agent response
  const response = await generateText({
    model: groq(process.env.GROQ_SALES_MODEL || 'llama-3.3-70b-versatile'), // Use configurable model
    prompt: salesPrompt,
    temperature: 0.8,
  });

  const agentMessage = response.text.trim();

  // Step 4: After agent responds, re-extract fields
  const updatedHistory: Message[] = [...conversationHistory,
  { role: 'user' as const, content: userMessage },
  { role: 'assistant' as const, content: agentMessage }
  ];
  const updatedFields = await extractFields(updatedHistory);

  // Step 5: Check if all fields are present
  const allFieldsPresent = Object.values(updatedFields).every(field => field !== null);

  if (!allFieldsPresent) {
    // Still collecting data
    return {
      message: agentMessage,
      emailSent: false,
    };
  }

  // Step 6: Validate fields
  const validation = await validateFields(updatedFields);

  if (!validation.valid || validation.confidence < 80) {
    // Has all fields but some are invalid
    const language = detectLanguage(conversationHistory);
    const reAskMessages = {
      es: `Hmm, necesito aclarar: ${validation.issues[0]} ¿Puedes darme esa info?`,
      en: `Hmm, I need to clarify: ${validation.issues[0]} Can you provide that?`,
      fr: `Hmm, j'ai besoin de clarifier: ${validation.issues[0]} Peux-tu me donner ça?`,
      de: `Hmm, ich muss klären: ${validation.issues[0]} Kannst du das angeben?`,
    };

    return {
      message: reAskMessages[language as keyof typeof reAskMessages] || reAskMessages.en,
      emailSent: false,
    };
  }

  // Step 7: All fields valid! Send email
  try {
    await sendSalesInquiry(updatedFields, conversationHistory);

    // Step 8: Return confirmation
    const language = detectLanguage(conversationHistory);
    const confirmations = {
      es: '¡Perfecto! Enviando email a Fran ahora... 📧',
      en: 'Perfect! Sending email to Fran now... 📧',
      fr: 'Parfait! J\'envoie un email à Fran maintenant... 📧',
      de: 'Perfekt! Sende jetzt E-Mail an Fran... 📧',
    };

    const systemMessages = {
      es: '✅ Email enviado exitosamente! Fran te responderá en 24 horas.',
      en: '✅ Email sent successfully! Fran will reply within 24 hours.',
      fr: '✅ Email envoyé avec succès! Fran répondra dans 24 heures.',
      de: '✅ Email erfolgreich gesendet! Fran antwortet innerhalb von 24 Stunden.',
    };

    return {
      message: confirmations[language as keyof typeof confirmations] || confirmations.en,
      systemMessage: systemMessages[language as keyof typeof systemMessages] || systemMessages.en,
      emailSent: true,
    };
  } catch (emailError) {
    // Email failed, but still show success to user and log error
    console.error('Email sending failed:', emailError);

    const language = detectLanguage(conversationHistory);
    const errorMessages = {
      es: '¡Perfecto! He recopilado toda tu información. 📋\nFran te contactará pronto.',
      en: 'Perfect! I\'ve collected all your information. 📋\nFran will contact you soon.',
      fr: 'Parfait! J\'ai collecté toutes tes informations. 📋\nFran te contactera bientôt.',
      de: 'Perfekt! Ich habe alle deine Informationen gesammelt. 📋\nFran wird dich bald kontaktieren.',
    };

    return {
      message: errorMessages[language as keyof typeof errorMessages] || errorMessages.en,
      emailSent: false, // Don't claim email was sent if it failed
    };
  }
}

// Send sales inquiry email with structured data
async function sendSalesInquiry(
  fields: SalesFields,
  conversationHistory: Message[]
): Promise<void> {
  // Import the shared email utility
  const { sendSalesInquiryEmail } = await import('@/app/lib/email-utils');

  try {
    const result = await sendSalesInquiryEmail({
      name: fields.name,
      email: fields.email,
      projectType: fields.projectType,
      budget: fields.budget,
      timeline: fields.timeline,
      projectDescription: conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
      timestamp: new Date().toISOString(),
      source: 'MSN Messenger Chat',
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    console.log('✅ Sales inquiry email sent successfully:', result.emailId);
  } catch (error) {
    console.error('Failed to send sales inquiry email:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get last user message
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content;

    // Build conversation context
    const conversationHistory = messages.slice(0, -1); // All except the last message

    // Detect intent using Vercel AI SDK
    // Detect user intent with conversation context
    const intent = await detectIntent(userMessage, conversationHistory);

    // Route to appropriate handler using Vercel AI SDK
    let result;
    if (intent === 'sales') {
      result = await handleSalesChat(userMessage, conversationHistory);
    } else {
      const casualResponse = await handleCasualChat(userMessage, conversationHistory);
      result = {
        message: casualResponse.message,
        actions: casualResponse.actions,
        emailSent: false
      };
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Chat API error:', error);

    // Handle configuration errors gracefully
    if (error instanceof Error && error.message.includes('Configuration error')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: 'Sorry, something went wrong. Can you repeat that? 🙏',
        emailSent: false
      },
      { status: 500 }
    );
  }
}