import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getWorkingModel } from '@/lib/gemini';
import fs from 'fs';
import path from 'path';

const leadsFilePath = path.join(process.cwd(), 'src/data/leads.json');

interface LeadInput {
  name: string;
  company: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key not found' }, { status: 500 });
    }

    const model = await getWorkingModel(apiKey);

    const prompt = `You are a professional real estate lead researcher. I need 8 high-quality, realistic leads for real estate agencies or top-performing agents located in or near "${query}".

Requirements for each lead:
- name: Full name of a principal broker or lead agent.
- company: The specific name of their real estate agency.
- email: A professional business email address (e.g., name@agency.com).
- phone: A local phone number formatted correctly for the region.
- website: A valid-looking URL for their business.
- description: A compelling 1-2 sentence description of their expertise, target market, or notable achievements in "${query}".
- status: Must be exactly "new".

Diversity: Include a mix of luxury specialists, commercial brokers, and residential teams.
Authenticity: Ensure the agency names and specializations reflect the actual market characteristics of "${query}".

Output Format: Return ONLY a valid JSON array of objects. No markdown formatting, no conversational text.`;

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
  } catch (error: any) {
    console.error('Scraper API Error:', error);
    return NextResponse.json({
      error: error.message || 'Internal Server Error',
      details: error.stack
    }, { status: 500 });
  }
}
