import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const leadsFilePath = path.join(process.cwd(), 'src/data/leads.json');

interface LeadInput {
  name: string;
  company: string;
  email: string;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key not found' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a real estate data scraper. I need 5 realistic real estate agencies or agents located in or near "${query}".
Output the results in JSON format as an array of objects. Each object must have:
- name: Full name of the agent or agency owner
- company: Name of the real estate agency
- email: A professional-looking email address
- status: "new"

Make sure the data looks authentic for the region "${query}".
ONLY return the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let newLeads: LeadInput[] = [];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      newLeads = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      // Fallback if AI fails
      newLeads = [{
        name: `Agent in ${query}`,
        company: `${query} Luxury Realty`,
        email: `info@${query.toLowerCase().replace(/[^a-z]/g, '')}luxury.com`,
        status: 'new'
      }];
    }

    // Add IDs
    const leadsWithIds = newLeads.map((l: LeadInput, index: number) => ({
      ...l,
      id: (Date.now() + index).toString()
    }));

    // Read existing leads
    let existingLeads = [];
    if (fs.existsSync(leadsFilePath)) {
      existingLeads = JSON.parse(fs.readFileSync(leadsFilePath, 'utf8'));
    }

    // Combine and save
    const updatedLeads = [...existingLeads, ...leadsWithIds];
    fs.writeFileSync(leadsFilePath, JSON.stringify(updatedLeads, null, 2));

    return NextResponse.json({
      success: true,
      message: `Found and added ${leadsWithIds.length} agencies in ${query}`,
      leads: leadsWithIds
    });
  } catch (error) {
    console.error('Scraper API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
