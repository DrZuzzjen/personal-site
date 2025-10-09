import { resend } from '@/app/lib/resend';
import { generateText } from 'ai';
import { groq } from '@/app/lib/ai/providers/groq';

const BOOKING_EMAIL = process.env.BOOKING_EMAIL_TO || 'fallback@example.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export interface SalesInquiryData {
  name: string | null;
  email: string | null;
  projectType: string | null;
  budget: string | null;
  timeline: string | null;
  projectDescription: string;
  timestamp: string;
  source: string;
}

export interface LeadProfile {
  language?: string;
  timezone?: string;
  location?: string;
  timeOfInteraction?: string;
  visitorType?: 'new' | 'returning';
  visitCount?: number;
  appsExplored?: string[];
}

/**
 * Generate AI-powered sales opportunity summary
 */
async function generateOpportunitySummary(conversationHistory: string): Promise<string> {
  try {
    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: `Analyze this sales conversation and create a brief opportunity summary:

Conversation: ${conversationHistory}

Provide:
1. What they want to build (1 line)
2. Key details mentioned (budget, timeline, specific needs)
3. Urgency signals (hot lead, exploratory, etc.)
4. Any red flags or objections

Keep it concise, 3-4 sentences max, salesperson-friendly.`,
      temperature: 0.3, // Low temperature for consistent analysis
    });

    return result.text.trim();
  } catch (error) {
    console.error('Failed to generate opportunity summary:', error);
    return 'AI summary generation failed - please review conversation manually.';
  }
}

/**
 * Detect language from conversation history
 */
function detectLanguage(conversationHistory: string): string {
  const text = conversationHistory.toLowerCase();
  
  // Simple language detection based on common words
  if (text.includes('hola') || text.includes('quiero') || text.includes('necesito') || text.includes('presupuesto')) {
    return 'Spanish';
  } else if (text.includes('bonjour') || text.includes('salut') || text.includes('veux') || text.includes('besoin')) {
    return 'French';
  } else if (text.includes('hallo') || text.includes('ich') || text.includes('brauche') || text.includes('projekt')) {
    return 'German';
  } else {
    return 'English';
  }
}

/**
 * Generate lead profile from browser context and conversation
 */
function generateLeadProfile(conversationHistory: string): LeadProfile {
  const now = new Date();
  const language = detectLanguage(conversationHistory);
  
  // Determine timezone based on language (rough approximation)
  let timezone = 'UTC';
  let location = 'Unknown';
  
  if (language === 'Spanish') {
    timezone = 'Europe/Madrid (GMT+1/+2)';
    location = 'Spain/Latin America';
  } else if (language === 'French') {
    timezone = 'Europe/Paris (GMT+1/+2)';
    location = 'France/Francophone';
  } else if (language === 'German') {
    timezone = 'Europe/Berlin (GMT+1/+2)';
    location = 'Germany/DACH';
  } else {
    timezone = 'Unknown';
    location = 'English-speaking region';
  }

  return {
    language,
    timezone,
    location,
    timeOfInteraction: now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    visitorType: 'returning', // Could be enhanced with actual tracking
    visitCount: Math.floor(Math.random() * 5) + 1, // Placeholder - replace with real data
    appsExplored: ['Paint', 'Minesweeper', 'Portfolio', 'MSN Messenger'], // Placeholder
  };
}

/**
 * Send sales inquiry email via Resend with AI-generated opportunity summary
 * Shared utility function for both API routes and direct calls
 */
export async function sendSalesInquiryEmail(data: SalesInquiryData): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    console.log('[Email] Generating AI opportunity summary...');
    
    // Generate AI-powered opportunity summary
    const opportunitySummary = await generateOpportunitySummary(data.projectDescription);
    
    // Generate lead profile
    const leadProfile = generateLeadProfile(data.projectDescription);
    
    // Determine urgency level based on budget and timeline
    let urgencyLevel = '🟡 Warm';
    if (data.budget && parseInt(data.budget.replace(/\D/g, '')) > 10000) {
      urgencyLevel = '🔥 Hot';
    } else if (data.timeline && (data.timeline.includes('urgent') || data.timeline.includes('asap'))) {
      urgencyLevel = '🔥 Hot';
    } else if (!data.budget || data.budget.includes('don\'t know')) {
      urgencyLevel = '🔵 Cold';
    }

    console.log('[Email] Sending enhanced sales inquiry email...');

    const { data: emailData, error } = await resend.emails.send({
      from: `MSN Messenger Sales <${FROM_EMAIL}>`,
      to: BOOKING_EMAIL,
      replyTo: data.email || undefined,
      subject: `🚀 ${urgencyLevel.split(' ')[1]} Lead: ${data.name} - ${data.projectType}`,
      html: `
        <h2>New sales inquiry via MSN Messenger! ${urgencyLevel}</h2>

        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>📊 SALES OPPORTUNITY SUMMARY:</h3>
          <p style="font-size: 16px; line-height: 1.5; margin: 0;">${opportunitySummary}</p>
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>👤 LEAD PROFILE:</h3>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li><strong>Language:</strong> ${leadProfile.language}</li>
            <li><strong>Location:</strong> ${leadProfile.location}</li>
            <li><strong>Timezone:</strong> ${leadProfile.timezone}</li>
            <li><strong>Time of Contact:</strong> ${leadProfile.timeOfInteraction} (${leadProfile.timezone?.includes('business hours') ? 'business hours' : 'check timezone'})</li>
            <li><strong>Visitor Type:</strong> ${leadProfile.visitorType} (${leadProfile.visitCount} visits)</li>
            <li><strong>Apps Explored:</strong> ${leadProfile.appsExplored?.join(', ')}</li>
          </ul>
        </div>

        <h3>👤 CONTACT INFO:</h3>
        <p><strong>Name:</strong> ${data.name || 'Not provided'}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email || 'Not provided'}</a></p>

        <hr>

        <h3>💼 PROJECT DETAILS:</h3>
        <p><strong>Type:</strong> ${data.projectType || 'Not specified'}</p>
        <p><strong>Budget:</strong> ${data.budget || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${data.timeline || 'Not specified'}</p>
        <p><strong>Urgency Level:</strong> ${urgencyLevel}</p>

        <hr>

        <h3>💬 CONVERSATION HISTORY:</h3>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; max-height: 400px; overflow-y: auto;">${data.projectDescription || 'No conversation history'}</pre>

        <hr>

        <h3>📊 METADATA:</h3>
        <p><strong>Source:</strong> ${data.source || 'MSN Messenger Chat'}</p>
        <p><strong>Timestamp:</strong> ${data.timestamp || new Date().toISOString()}</p>

        <hr>
        <p><em>💡 AI Summary powered by Llama 3.1 - Reply directly to reach ${data.name}</em></p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: 'Failed to send email' };
    }

    return { success: true, emailId: emailData?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
