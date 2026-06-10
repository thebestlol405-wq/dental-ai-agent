import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { leadId, name, company, email } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key not found' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a business development representative for an automation agency.
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

    const result = await model.generateContent(prompt);
    const emailContent = result.response.text();

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
