import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
  const info = await transporter.sendMail({
    from: `"DoubleAgent" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, '<br>'),
  });

  return info;
}
