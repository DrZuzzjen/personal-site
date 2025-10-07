import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/app/lib/resend';

const BOOKING_EMAIL = process.env.BOOKING_EMAIL_TO || 'fallback@example.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === 'sales_inquiry') {
      const { data, error } = await resend.emails.send({
        from: `MSN Messenger Sales <${FROM_EMAIL}>`,
        to: BOOKING_EMAIL,
        replyTo: body.email,
        subject: `🚀 New Sales Inquiry from ${body.name}`,
        html: `
          <h2>New sales inquiry via MSN Messenger!</h2>

          <h3>👤 CONTACT INFO:</h3>
          <p><strong>Name:</strong> ${body.name || 'Not provided'}</p>
          <p><strong>Email:</strong> <a href="mailto:${body.email}">${body.email || 'Not provided'}</a></p>

          <hr>

          <h3>💼 PROJECT DETAILS:</h3>
          <p><strong>Type:</strong> ${body.projectType || 'Not specified'}</p>
          <p><strong>Budget:</strong> ${body.budget || 'Not specified'}</p>
          <p><strong>Timeline:</strong> ${body.timeline || 'Not specified'}</p>

          <hr>

          <h3>💬 CONVERSATION HISTORY:</h3>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; white-space: pre-wrap;">${body.projectDescription || 'No conversation history'}</pre>

          <hr>

          <h3>📊 METADATA:</h3>
          <p><strong>Source:</strong> ${body.source || 'MSN Messenger Chat'}</p>
          <p><strong>Timestamp:</strong> ${body.timestamp || new Date().toISOString()}</p>

          <hr>
          <p><em>Reply directly to this email to reach ${body.name}</em></p>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
      }

      return NextResponse.json({ success: true, emailId: data?.id });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}