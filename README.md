This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use DoubleAgent

DoubleAgent is now a specialized tool for Real Estate outreach.

### 1. Scraper
- Navigate to the **Scraper** tab.
- Enter a city or region (e.g., "Miami, FL" or "Toronto, ON").
- Click **Scrape** to find real estate agencies and add them to your leads.

### 2. Assistant
- Navigate to the **Assistant** tab.
- Ask the AI to help you write an email, follow up, or refine your pitch.
- Example: "Write a short follow-up email for an agency that hasn't replied to my first demo offer."

### 3. Leads & Outreach
- Navigate to the **Leads** tab to see your collected agencies.
- Click the **Send** icon next to a lead to generate and "send" (mocked) a personalized outreach email.
- Preview the generated content in the right-hand panel.

## Environment Variables

Make sure you have a `.env.local` file with your Google Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

### Persistence Note
Currently, this project stores leads in a local file (`src/data/leads.json`). This is designed for local development. For production deployment (e.g., Vercel), you should replace the file-based logic in the API routes with a database like Supabase, MongoDB, or PostgreSQL.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
