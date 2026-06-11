import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getWorkingModel } from '@/lib/gemini';
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

    const model = await getWorkingModel(apiKey);

    const prompt = `You are an expert sales strategist specialized in real estate technology.
We are offering a cutting-edge AI assistant for real estate agencies that handles 24/7 lead qualification, appointment booking, and property inquiries.

Write a highly personalized, compelling outreach email to:
Name: ${name}
Company: ${company}

Lead Context/Description: ${email}

Campaign Strategy:
- Objective: Secure a brief 10-minute discovery call.
- Unique Value Proposition: Our AI acts as a 24/7 concierge that ensures no lead ever goes unanswered, increasing conversion rates by up to 40%.
- Limited Offer: We are selecting 3 "Founding Partner" agencies in this region to receive a deeply discounted rate ($500 setup + $100/mo) in exchange for a testimonial.

Tone Requirements:
- Professional yet approachable and modern.
- Avoid "salesy" clichés.
- Focus on the *problem* (missed leads, late-night inquiries) and the *solution*.
- The email should feel like it was written by a human who actually looked at their agency.

Output Format:
Return ONLY a JSON object with:
- "subject": An intriguing, low-pressure subject line.
- "body": The full email content.

DO NOT include any other text or markdown markers.`;

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
  } catch (error: any) {
    console.error('Outreach API Error:', error);
    return NextResponse.json({
      error: error.message || 'Internal Server Error',
      details: error.stack
    }, { status: 500 });
  }
}
