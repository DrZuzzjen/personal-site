import { resend } from '@/app/lib/resend';

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

/**
 * Send sales inquiry email via Resend
 * Shared utility function for both API routes and direct calls
 */
export async function sendSalesInquiryEmail(data: SalesInquiryData): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `MSN Messenger Sales <${FROM_EMAIL}>`,
      to: BOOKING_EMAIL,
      replyTo: data.email || undefined,
      subject: `🚀 New Sales Inquiry from ${data.name}`,
      html: `
        <h2>New sales inquiry via MSN Messenger!</h2>

        <h3>👤 CONTACT INFO:</h3>
        <p><strong>Name:</strong> ${data.name || 'Not provided'}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email || 'Not provided'}</a></p>

        <hr>

        <h3>💼 PROJECT DETAILS:</h3>
        <p><strong>Type:</strong> ${data.projectType || 'Not specified'}</p>
        <p><strong>Budget:</strong> ${data.budget || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${data.timeline || 'Not specified'}</p>

        <hr>

        <h3>💬 CONVERSATION HISTORY:</h3>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; white-space: pre-wrap;">${data.projectDescription || 'No conversation history'}</pre>

        <hr>

        <h3>📊 METADATA:</h3>
        <p><strong>Source:</strong> ${data.source || 'MSN Messenger Chat'}</p>
        <p><strong>Timestamp:</strong> ${data.timestamp || new Date().toISOString()}</p>

        <hr>
        <p><em>Reply directly to this email to reach ${data.name}</em></p>
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
