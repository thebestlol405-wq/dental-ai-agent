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
            content: "You are Sarah, AI receptionist for a dental practice in Port Saint Lucie, FL. Warm, human, 2 sentences max. GOAL: Book appointments. Always get: name, phone, reason, preferred time. OBJECTIONS: If cost/insurance → 'Dr. has options for every budget. Let's get you in for a consult first. What's your name?' If 'are you AI' → 'I'm Sarah, digital assistant 24/7. I can book you now in 30 seconds. First name?' If off-topic → 'I handle dental appointments. What day works for you?' RULES: Never say no. Always redirect to booking. Office: Mon-Fri 8am-5pm, Sat 9am-1pm. You book after hours too. Always end: 'Perfect, you're confirmed for [day] at [time]. Text confirmation coming.'"
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    console.log('Groq response status:', response.status);
    const data = await response.json();
    console.log('Groq response data:', data);

    if (!response.ok) {
      return NextResponse.json({ error: 'Groq API error', details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
