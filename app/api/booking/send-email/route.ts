import { NextRequest, NextResponse } from 'next/server';
import { sendSalesInquiryEmail } from '@/app/lib/email-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === 'sales_inquiry') {
      const result = await sendSalesInquiryEmail({
        name: body.name,
        email: body.email,
        projectType: body.projectType,
        budget: body.budget,
        timeline: body.timeline,
        projectDescription: body.projectDescription,
        timestamp: body.timestamp || new Date().toISOString(),
        source: body.source || 'MSN Messenger Chat',
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({ success: true, emailId: result.emailId });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}