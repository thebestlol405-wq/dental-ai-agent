import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API Key not found' }, { status: 500 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: "You are a personal outreach assistant. Your primary goal is to help the user write highly effective, personalized outreach emails to real estate agencies. \n\nRULES:\n1. Be concise, professional, and helpful.\n2. When asked to write an email, focus on value proposition and a clear call to action.\n3. Maintain a human, warm tone. Avoid sounding like a bot or using generic corporate speak.\n4. You can also provide advice on outreach strategy and follow-ups."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content;

    if (!aiReply) {
      return NextResponse.json({ message: "Assistant is thinking. Please try again." });
    }

    return NextResponse.json({ message: aiReply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
