import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const leadsFilePath = path.join(process.cwd(), 'src/data/leads.json');

export async function GET() {
  try {
    const fileContents = fs.readFileSync(leadsFilePath, 'utf8');
    const leads = JSON.parse(fileContents);
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error reading leads:', error);
    return NextResponse.json({ error: 'Failed to read leads' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newLead = await req.json();
    const fileContents = fs.readFileSync(leadsFilePath, 'utf8');
    const leads = JSON.parse(fileContents);

    const leadWithId = {
      ...newLead,
      id: Date.now().toString(),
      status: 'new'
    };

    leads.push(leadWithId);
    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2));

    return NextResponse.json(leadWithId);
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const fileContents = fs.readFileSync(leadsFilePath, 'utf8');
    const leads = JSON.parse(fileContents);

    const leadIndex = leads.findIndex((l: { id: string }) => l.id === id);
    if (leadIndex === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    leads[leadIndex].status = status;
    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2));

    return NextResponse.json(leads[leadIndex]);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const fileContents = fs.readFileSync(leadsFilePath, 'utf8');
    let leads = JSON.parse(fileContents);

    const initialLength = leads.length;
    leads = leads.filter((l: { id: string }) => l.id !== id);

    if (leads.length === initialLength) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2));

    return NextResponse.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
