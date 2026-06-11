import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendEmail } from '@/lib/mail';
import fs from 'fs';
import path from 'path';

const historyFilePath = path.join(process.cwd(), 'src/data/outreach_history.json');

export async function POST(req: NextRequest) {
  try {
    const { name, company, email } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key not found' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `You are a business development representative for an automation agency.
We build AI solutions for real estate agencies to help them handle leads and client questions 24/7.

Write a short, professional, and highly personalized outreach email to a real estate professional.
Goal: Offer a 10-minute demo of how our AI can help their agency never miss a lead again.

Rules:
1. Short and punchy (under 100 words).
2. Human-like tone, not corporate.
3. Subject line should be catchy but professional.
4. Mention that we are looking for a "Founding Agency" to receive a special rate ($500 setup + $100/mo).
5. Output the result in JSON format with two fields: "subject" and "body".

Lead Info:
Name: ${name}
Company: ${company}
Email: ${email}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Attempt to parse JSON from the response (sometimes AI wraps it in markdown)
    let emailData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      emailData = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      console.error('Failed to parse AI response as JSON:', text);
      emailData = {
        subject: "Quick question about your agency",
        body: text
      };
    }

    if (!emailData.body) {
      return NextResponse.json({ error: 'Failed to generate email content' }, { status: 500 });
    }

    // REAL EMAIL SEND
    let status = 'sent';
    let error = null;
    try {
      await sendEmail({
        to: email,
        subject: emailData.subject,
        text: emailData.body
      });
      console.log(`Email successfully sent to ${email}`);
    } catch (mailError: any) {
      console.error('Nodemailer Error:', mailError);
      status = 'failed';
      error = mailError.message || 'SMTP_FAILURE';
    }

    // Log to history
    try {
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        to: email,
        name,
        company,
        subject: emailData.subject,
        body: emailData.body,
        status,
        error
      };

      let history = [];
      if (fs.existsSync(historyFilePath)) {
        history = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));
      }
      history.push(historyEntry);
      fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
    } catch (logError) {
      console.error('Failed to log outreach history:', logError);
    }

    if (status === 'failed') {
      return NextResponse.json({
        success: true,
        message: 'Email generated but failed to send via SMTP. Please check your credentials.',
        subject: emailData.subject,
        content: emailData.body,
        error: 'SMTP_FAILURE'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email generated and sent!',
      subject: emailData.subject,
      content: emailData.body
    });
  } catch (error) {
    console.error('Outreach API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
