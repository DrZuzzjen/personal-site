import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/app/lib/resend';

const BOOKING_EMAIL = process.env.BOOKING_EMAIL_TO || 'fallback@example.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === 'sales_inquiry') {
      const { data, error } = await resend.emails.send({
        from: 'MSN Messenger Sales <onboarding@resend.dev>',
        to: BOOKING_EMAIL,
        replyTo: body.email,
        subject: `🚀 New Sales Inquiry from ${body.name}`,
        html: `
          <h2>New sales inquiry via MSN Messenger!</h2>

          <h3>👤 CONTACT INFO:</h3>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${body.email}">${body.email}</a></p>
          ${body.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${body.linkedin}">${body.linkedin}</a></p>` : ''}
          <p><strong>Preferred Meeting:</strong> ${body.preferredTime}</p>

          <hr>

          <h3>💼 PROJECT DETAILS:</h3>
          <p><strong>Type:</strong> ${body.projectType}</p>
          <p><strong>Description:</strong> ${body.projectDescription}</p>
          <p><strong>Key Features:</strong> ${body.features}</p>
          ${body.techRequirements ? `<p><strong>Tech Requirements:</strong> ${body.techRequirements}</p>` : ''}

          <hr>

          <h3>📊 QUALIFICATION:</h3>
          <p><strong>Timeline:</strong> ${body.timeline}</p>
          <p><strong>Budget:</strong> ${body.budget}</p>

          <hr>

          <h3>🎯 AI AGENT ASSESSMENT:</h3>
          <p>${body.qualificationNotes}</p>

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