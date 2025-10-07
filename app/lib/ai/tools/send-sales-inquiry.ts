interface SalesInquiryParams {
  name: string;
  email: string;
  linkedin?: string;
  preferredTime: string;
  projectType: string;
  projectDescription: string;
  features: string;
  techRequirements?: string;
  timeline: string;
  budget: string;
  qualificationNotes: string;
}

export async function sendSalesInquiry(params: SalesInquiryParams): Promise<string> {
  try {
    // For server-side internal API calls, we can import and call the function directly
    // This avoids the need for HTTP calls and URL construction
    const { resend } = await import('@/app/lib/resend');
    
    const BOOKING_EMAIL = process.env.BOOKING_EMAIL_TO || 'fallback@example.com';
    
    const { data, error } = await resend.emails.send({
      from: 'MSN Messenger Sales <onboarding@resend.dev>',
      to: BOOKING_EMAIL,
      replyTo: params.email,
      subject: `🚀 New Sales Inquiry from ${params.name}`,
      html: `
        <h2>New sales inquiry via MSN Messenger!</h2>

        <h3>👤 CONTACT INFO:</h3>
        <p><strong>Name:</strong> ${params.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${params.email}">${params.email}</a></p>
        ${params.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${params.linkedin}">${params.linkedin}</a></p>` : ''}
        <p><strong>Preferred Meeting:</strong> ${params.preferredTime}</p>

        <hr>

        <h3>💼 PROJECT DETAILS:</h3>
        <p><strong>Type:</strong> ${params.projectType}</p>
        <p><strong>Description:</strong> ${params.projectDescription}</p>
        <p><strong>Key Features:</strong> ${params.features}</p>
        ${params.techRequirements ? `<p><strong>Tech Requirements:</strong> ${params.techRequirements}</p>` : ''}

        <hr>

        <h3>📊 QUALIFICATION:</h3>
        <p><strong>Timeline:</strong> ${params.timeline}</p>
        <p><strong>Budget:</strong> ${params.budget}</p>

        <hr>

        <h3>🎯 AI AGENT ASSESSMENT:</h3>
        <p>${params.qualificationNotes}</p>

        <hr>
        <p><em>Reply directly to this email to reach ${params.name}</em></p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send email');
    }

    return `Perfect! I've sent your details to Jean Francois. You'll hear back soon via email! 🎉`;

  } catch (error) {
    console.error('Tool error:', error);
    throw new Error('Oops, something went wrong. Can you try again or email directly at hello@fran-ai.dev?');
  }
}