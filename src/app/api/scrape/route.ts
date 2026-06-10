import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const leadsFilePath = path.join(process.cwd(), 'src/data/leads.json');

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    console.log('Scraping query:', query);

    // Simulation of scraping
    await new Promise(resolve => setTimeout(resolve, 2000));

    const fileContents = fs.readFileSync(leadsFilePath, 'utf8');
    const leads = JSON.parse(fileContents);

    // Create a new mock lead based on the query to show it's "working"
    const newLead = {
      id: Date.now().toString(),
      name: `New Agent in ${query}`,
      company: `${query} Realty Group`,
      email: `contact@${query.toLowerCase().replace(/[^a-z]/g, '')}realty.com`,
      status: 'new'
    };

    leads.push(newLead);
    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2));

    return NextResponse.json({
      success: true,
      message: `Found and added new agency in ${query}`,
      leads: [newLead]
    });
  } catch (error) {
    console.error('Scraper API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
