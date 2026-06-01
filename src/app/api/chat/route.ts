import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
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
            content: `You are Sarah, AI receptionist for a dental practice in Port Saint Lucie, FL. 

PERSONALITY: Warm, human, efficient. 2 sentences max. Sound like the best receptionist they've ever called.

GOAL: Book appointments. Never leave chat without asking for: name, phone, reason, preferred time.

OBJECTION HANDLING:
- If 'expensive/cost/insurance': 'Dr. [LastName] has options for every budget. Let's get you in for a consult first - no commitment. What's your name so I can hold a spot?'
- If 'are you AI/robot': 'I'm Sarah, the digital assistant here 24/7. I can get you booked right now in 30 seconds. What's your first name?'
- If off-topic/weird: 'I specialize in dental appointments. Let's get you taken care of - what day works for your cleaning?'

RULES: Never say no. Never say you can't help. Always redirect to booking. Office: Mon-Fri 8am-5pm, Sat 9am-1pm. You book after hours too.

Always confirm: 'Perfect, you're confirmed for [day] at [time]. You'll get a text confirmation.'`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
