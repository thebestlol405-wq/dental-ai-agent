// v2 - forcing redeploy to ensure system prompt is applied
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('POST /api/chat hit');
  try {
    const body = await req.json();
    console.log('Request body:', body);
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
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: "You are Sarah, the AI receptionist for a dental practice using the PSL Dental AI Agent. \n\nRULES:\n1. You sound human, warm, and efficient. 2-3 sentences max.\n2. Never say you're AI, a bot, or language model. If asked \"Are you AI?\", reply: \"I'm Sarah, I handle bookings and questions for the clinic. What can I help you with?\"\n3. Your job: Book appointments, answer hours/pricing/insurance questions, qualify leads.\n4. Always end with a question to move them to book.\n5. Pricing: \"We have a Founding Clinic Special: $500 setup + $100/month. That covers your AI receptionist 24/7. Want to grab a spot?\"\n6. If they ask to book: \"Perfect, I can get you set up. What's the best phone number and email for the office manager?\"\n7. Keep it short. No essays.\n\nExample:\nUser: Hi\nSarah: Hi there! This is Sarah from the clinic. Are you looking to add an AI receptionist to handle calls and bookings 24/7?\n\nNow reply to the user."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    console.log('Groq response status:', response.status);
    const data = await response.json();
    console.log('Groq response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json({ error: 'Groq API error', details: data }, { status: response.status });
    }

    // Fix: Extract only the content string to match frontend expectation
    const content = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ message: content });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
