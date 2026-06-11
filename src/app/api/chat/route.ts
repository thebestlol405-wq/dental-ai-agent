import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getWorkingModel } from '@/lib/gemini';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '@/lib/mail';

const leadsFilePath = path.join(process.cwd(), 'src/data/leads.json');
const chatHistoryPath = path.join(process.cwd(), 'src/data/chat_history.json');

export async function GET() {
  try {
    const history = JSON.parse(fs.readFileSync(chatHistoryPath, 'utf8'));
    return NextResponse.json(history);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key not found' }, { status: 500 });
    }

    const leads = JSON.parse(fs.readFileSync(leadsFilePath, 'utf8'));
    const leadsContext = leads.map((l: { name: string; company: string; email: string }) => `${l.name} (${l.company}) - ${l.email}`).join('\n');

    const model = await getWorkingModel(apiKey, {
      systemInstruction: `You are a personal outreach assistant for Real Estate.
Current Leads in Database:
${leadsContext}

RULES:
1. Be concise, professional, and human-like.
2. You can help draft emails or actually SEND them if the user asks.
3. To send an email, your response MUST contain a JSON block like this:
   {"action": "send_email", "to": "email@example.com", "subject": "Subject Line", "body": "Email body content"}
4. If you are just chatting or drafting, do NOT include the JSON block.
5. Remember user preferences and past interactions.`
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const aiReply = result.response.text();

    if (!aiReply) {
      return NextResponse.json({ message: "Assistant is thinking. Please try again." });
    }

    // Check for email action
    let finalReply = aiReply;
    try {
      const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const actionData = JSON.parse(jsonMatch[0]);
        if (actionData.action === 'send_email') {
          await sendEmail({
            to: actionData.to,
            subject: actionData.subject,
            text: actionData.body
          });
          finalReply = aiReply.replace(jsonMatch[0], "\n\n✅ **Email sent successfully!**");
        }
      }
    } catch (e) {
      console.error('Action processing error:', e);
    }

    // Save history
    const history = [...messages, { role: 'assistant', content: finalReply }];
    fs.writeFileSync(chatHistoryPath, JSON.stringify(history, null, 2));

    return NextResponse.json({ message: finalReply });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      error: error.message || 'Internal Server Error',
      details: error.stack
    }, { status: 500 });
  }
}
