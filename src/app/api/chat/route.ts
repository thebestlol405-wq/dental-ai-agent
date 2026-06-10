import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key not found' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "You are a personal outreach assistant. Your primary goal is to help the user write highly effective, personalized outreach emails to real estate agencies. \n\nRULES:\n1. Be concise, professional, and helpful.\n2. When asked to write an email, focus on value proposition and a clear call to action.\n3. Maintain a human, warm tone. Avoid sounding like a bot or using generic corporate speak.\n4. You can also provide advice on outreach strategy and follow-ups."
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

    return NextResponse.json({ message: aiReply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
