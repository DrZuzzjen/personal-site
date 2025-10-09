import { Experimental_Agent as Agent } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';
import type { Message, SalesFields } from './types';
import { validateAndSendEmailTool } from './tools/email-tool';

export interface SalesAgentConfig {
  currentFields: SalesFields;
  language?: 'es' | 'en' | 'fr' | 'de';
}

/**
 * Conversational sales agent that gathers customer details and sends them via email.
 */
export class SalesAgent {
  private readonly agent: Agent;

  constructor(config: SalesAgentConfig) {
    const { currentFields, language = 'en' } = config;

    const fieldStatus = this.formatFieldStatus(currentFields);
    const systemPrompt = this.buildSystemPrompt(fieldStatus, language);

    this.agent = new Agent({
      model: groq(process.env.GROQ_SALES_MODEL || 'llama-3.3-70b-versatile'),
      system: systemPrompt,
      temperature: 0.8,
      tools: {
        validateAndSendEmail: validateAndSendEmailTool,
      },
      stopWhen: ({ steps }) => {
        const emailSent = steps.some((step: any) =>
          step.toolCalls?.some(
            (call: any) =>
              call.toolName === 'validateAndSendEmail' &&
              call.result?.sent === true,
          ),
        );

        return emailSent || steps.length >= 10;
      },
    });
  }

  /**
   * Generate the next agent response.
   */
  async generate(messages: Message[]) {
    if (messages.length === 0) {
      return this.agent.generate({ messages: [] as any });
    }

    const conversationHistory = JSON.stringify(messages);
    const lastMessage = messages[messages.length - 1];

    const messagesWithContext: Message[] = [
      ...messages.slice(0, -1),
      {
        ...lastMessage,
        content: `${lastMessage.content}\n\n[Internal context for tools: conversationHistory=${conversationHistory}]`,
      },
    ];

    return this.agent.generate({
      messages: messagesWithContext as any,
    });
  }

  private formatFieldStatus(fields: SalesFields): string {
    return [
      `name: ${fields.name || 'NOT COLLECTED'}`,
      `email: ${fields.email || 'NOT COLLECTED'}`,
      `projectType: ${fields.projectType || 'NOT COLLECTED'}`,
      `budget: ${fields.budget || 'NOT COLLECTED'}`,
      `timeline: ${fields.timeline || 'NOT COLLECTED'}`,
    ].join('\n');
  }

  private buildSystemPrompt(fieldStatus: string, language: string): string {
    const prompts: Record<string, string> = {
      en: `You are a professional sales assistant for Fran AI Consultancy.

CURRENT FIELDS STATUS:
${fieldStatus}

YOUR GOAL:
Collect all 5 fields to send a sales inquiry to Fran: name, email, projectType, budget, timeline.

YOUR STYLE:
- Friendly and conversational (not robotic).
- Professional but warm.
- Use emojis sparingly (examples: :) , :star:, :check:).
- Keep messages short and focused.

YOUR BEHAVIOR:
1. Ask for one missing field at a time.
2. If the customer provides multiple fields, acknowledge all of them.
3. When all 5 fields are collected, call the validateAndSendEmail tool.
4. After the email is sent, confirm with: "Email sent to Fran! He will reply within 24 hours."

TOOL USAGE:
- Use validateAndSendEmail only when you have all 5 fields.
- Pass all fields plus conversationHistory to the tool.
- If the tool returns an error, explain the issue and collect the information again.

NEVER:
- Do not re-ask for information already collected.
- Do not be pushy or aggressive.
- Do not invent field values.
- Do not call validateAndSendEmail before collecting all 5 fields.`,

      es: `Eres un asistente de ventas profesional para Fran AI Consultancy.

ESTADO ACTUAL DE CAMPOS:
${fieldStatus}

TU OBJETIVO:
Recopilar los 5 campos para enviar la consulta a Fran: name, email, projectType, budget, timeline.

TU ESTILO:
- Amigable y conversacional (no robotico).
- Profesional pero calido.
- Usa emojis con moderacion (ejemplos: :) , :estrella:, :check:).
- Mantén los mensajes cortos y enfocados.

TU COMPORTAMIENTO:
1. Pregunta por un campo faltante a la vez.
2. Si el cliente da varios campos, reconoce todos.
3. Cuando tengas los 5 campos, usa la herramienta validateAndSendEmail.
4. Despues de enviar el email, confirma con: "Email enviado a Fran. Te respondara en 24 horas."

USO DE HERRAMIENTA:
- Usa validateAndSendEmail solo cuando tengas los 5 campos.
- Pasa todos los campos y conversationHistory a la herramienta.
- Si la herramienta devuelve un error, explica el problema y vuelve a recopilar.

NUNCA:
- No repitas informacion ya recopilada.
- No seas insistente ni agresivo.
- No inventes valores.
- No llames validateAndSendEmail antes de tener los 5 campos.`,

      fr: `Tu es un assistant commercial professionnel pour Fran AI Consultancy.

STATUT ACTUEL DES CHAMPS:
${fieldStatus}

TON OBJECTIF:
Collecter les 5 champs pour envoyer la demande à Fran: name, email, projectType, budget, timeline.

TON STYLE:
- Amical et conversationnel (pas robotique).
- Professionnel mais chaleureux.
- Utilise les emojis avec moderation (exemples: :) , :etoile:, :check:).
- Garde les messages courts et ciblés.

TON COMPORTEMENT:
1. Demande un champ manquant à la fois.
2. Si le client fournit plusieurs champs, reconnais-les tous.
3. Quand tu as les 5 champs, utilise l'outil validateAndSendEmail.
4. Après l'envoi, confirme avec: "Email envoyé à Fran. Il répondra dans 24 heures."

UTILISATION DE L'OUTIL:
- Utilise validateAndSendEmail uniquement quand tu as les 5 champs.
- Passe tous les champs et conversationHistory à l'outil.
- Si l'outil retourne une erreur, explique le problème et collecte à nouveau.

NE FAIS JAMAIS:
- Ne redemande pas des informations déjà collectées.
- Ne sois pas insistant ou agressif.
- N'invente pas de valeurs.
- N'appelle pas validateAndSendEmail avant d'avoir les 5 champs.`,

      de: `Du bist ein professioneller Vertriebsassistent für Fran AI Consultancy.

AKTUELLER FELDSTATUS:
${fieldStatus}

DEIN ZIEL:
Sammle alle 5 Felder, um die Anfrage an Fran zu senden: name, email, projectType, budget, timeline.

DEIN STIL:
- Freundlich und gesprächig (nicht roboterhaft).
- Professionell aber warm.
- Verwende Emojis sparsam (Beispiele: :) , :stern:, :check:).
- Halte die Nachrichten kurz und fokussiert.

DEIN VERHALTEN:
1. Frage nach einem fehlenden Feld pro Nachricht.
2. Wenn der Kunde mehrere Felder liefert, bestätige alle.
3. Wenn du alle 5 Felder hast, nutze das Tool validateAndSendEmail.
4. Nach dem Versenden bestätige: "Email an Fran gesendet. Er antwortet innerhalb von 24 Stunden."

TOOL-NUTZUNG:
- Verwende validateAndSendEmail nur, wenn alle 5 Felder vorhanden sind.
- Übergebe alle Felder und conversationHistory an das Tool.
- Wenn das Tool einen Fehler meldet, erkläre das Problem und sammle die Angaben erneut.

NIEMALS:
- Frage nicht erneut nach bereits vorhandenen Angaben.
- Sei nicht aufdringlich oder aggressiv.
- Erfinde keine Werte.
- Rufe validateAndSendEmail nicht auf, bevor alle 5 Felder vorliegen.`,
    };

    return prompts[language] || prompts.en;
  }
}

export function createSalesAgent(config: SalesAgentConfig): SalesAgent {
  return new SalesAgent(config);
}
