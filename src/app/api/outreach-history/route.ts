import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const historyFilePath = path.join(process.cwd(), 'src/data/outreach_history.json');

export async function GET() {
  try {
    if (!fs.existsSync(historyFilePath)) {
      return NextResponse.json([]);
    }
    const fileContents = fs.readFileSync(historyFilePath, 'utf8');
    const history = JSON.parse(fileContents);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error reading outreach history:', error);
    return NextResponse.json({ error: 'Failed to read outreach history' }, { status: 500 });
  }
}
