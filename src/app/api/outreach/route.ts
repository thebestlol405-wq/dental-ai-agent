import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { leadId, name, company, email } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API Key not found' }, { status: 500 });
    }

    const systemPrompt = `You are a business development representative for an automation agency.
We build AI solutions for real estate agencies to help them handle leads and client questions 24/7.

Write a short, professional, and highly personalized outreach email to a real estate professional.
Goal: Offer a 10-minute demo of how our AI can help their agency never miss a lead again.

Rules:
1. Short and punchy (under 100 words).
2. Human-like tone, not corporate.
3. Subject line should be catchy but professional.
4. Mention that we are looking for a "Founding Agency" to receive a special rate ($500 setup + $100/mo).

Lead Info:
Name: ${name}
Company: ${company}
Email: ${email}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the email.' }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const emailContent = data.choices?.[0]?.message?.content;

    if (!emailContent) {
      return NextResponse.json({ error: 'Failed to generate email content' }, { status: 500 });
    }

    console.log('--- MOCK EMAIL SEND ---');
    console.log(`To: ${email}`);
    console.log(`Lead ID: ${leadId}`);
    console.log('Content:', emailContent);
    console.log('-----------------------');

    return NextResponse.json({
      success: true,
      message: 'Email generated and queued for sending (MOCK)',
      content: emailContent
    });
  } catch (error) {
    console.error('Outreach API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
