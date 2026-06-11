import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    await transporter.verify();

    return NextResponse.json({ success: true, message: 'SMTP Connection Successful' });
  } catch (error: any) {
    console.error('SMTP Connection Test Failed:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'SMTP Connection Failed',
      details: error.stack
    }, { status: 500 });
  }
}
